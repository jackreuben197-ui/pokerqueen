/**
 * BridgeStorage —— Cocos 端持久化的唯一出口。
 *
 * 历史上 Cocos 既写 cc_cache_user_${userId} 这个独立 IndexedDB，又写 cc.sys.localStorage；
 * 现在统一改成：所有持久化操作经 H5MsgMgr 发到 H5 进程，由 H5 落到 user_cache_${userId}
 * （IndexedDB）和 dzpk_cc_* 命名空间下的 localStorage。两端共用同一份存储。
 *
 * IndexedDB：
 *   - get/getAll/put/delete/clear 均是 request/reply：发送 ccStorageOp 携带 requestId，
 *     等 H5 回 ccStorageResult 后 resolve。
 *   - 表名 H5 端做白名单：只接受 TABLE_PUBLIC_INFO / TABLE_STATS / GAME_REPLAYS。
 *
 * localStorage：
 *   - Cocos 维护一份内存镜像 _localMirror，保证 getItem 仍是同步 API（大量旧调用依赖）。
 *   - 握手完成后 H5 通过 ccStorageSnapshot 把 dzpk_cc_* 命名空间下的全部键值回灌过来。
 *   - 写操作 fire-and-forget：先更新内存，再发 ccStorageOp（set/remove/clear），
 *     失败时容忍数据丢失（cocos 已经不再有本地落盘，无可降级路径）。
 */
import H5MsgMgr, {
    CcIndexedDBOpPayload,
    CcLocalStorageOpPayload,
    CcStorageResultPayload,
    CcStorageSnapshotPayload,
} from '../H5MsgMgr';

/** 与 h5 的 CC_STORE_* 严格对齐，store 名称由 h5 白名单校验。*/
export const STORE_TABLE_USER_BASE_INFO = 'table_user_base_info';
export const STORE_TABLE_USER_DATA_INFO = 'table_user_data_info';
export const STORE_GAME_REPLAYS = 'game_replays';

export type BridgeIndexedDBStore =
    | typeof STORE_TABLE_USER_BASE_INFO
    | typeof STORE_TABLE_USER_DATA_INFO
    | typeof STORE_GAME_REPLAYS;

type PendingResolver = (result: CcStorageResultPayload) => void;

class BridgeStorageImpl {
    private _installed = false;
    private _pending = new Map<string, PendingResolver>();
    private _localMirror = new Map<string, string>();
    private _snapshotLoaded = false;
    private _reqSeq = 0;

    /** Main.ts 在 H5MsgMgr.init() 之后调用一次，注册 ccStorageResult / ccStorageSnapshot 监听。*/
    install(): void {
        if (this._installed) return;
        this._installed = true;

        H5MsgMgr.Instance.on('ccStorageResult', (payload) => {
            const resp = payload as CcStorageResultPayload;
            if (!resp || !resp.requestId) return;
            const resolver = this._pending.get(resp.requestId);
            if (!resolver) return;
            this._pending.delete(resp.requestId);
            resolver(resp);
        });

        H5MsgMgr.Instance.on('ccStorageSnapshot', (payload) => {
            const snap = payload as CcStorageSnapshotPayload;
            this._localMirror.clear();
            const entries = (snap && snap.entries) || {};
            Object.keys(entries).forEach((k) => {
                this._localMirror.set(k, entries[k]);
            });
            this._snapshotLoaded = true;
        });
    }

    /** 是否已经收到过 localStorage 快照；尚未收到时 getItem 只能返回 null。*/
    get snapshotLoaded(): boolean {
        return this._snapshotLoaded;
    }

    // ─── IndexedDB ──────────────────────────────────────

    indexedDBGet<T>(store: BridgeIndexedDBStore, key: IDBValidKey): Promise<T | null> {
        return this._sendIndexedDB({ store, op: 'get', key }).then((resp) => {
            if (!resp.ok) return null;
            return (resp.value as T | undefined) ?? null;
        });
    }

    indexedDBGetAll<T>(store: BridgeIndexedDBStore): Promise<T[]> {
        return this._sendIndexedDB({ store, op: 'getAll' }).then((resp) => {
            if (!resp.ok) return [];
            return Array.isArray(resp.value) ? (resp.value as T[]) : [];
        });
    }

    indexedDBPut<T>(store: BridgeIndexedDBStore, key: IDBValidKey, value: T): Promise<void> {
        return this._sendIndexedDB({ store, op: 'put', key, value }).then((): void => undefined);
    }

    indexedDBDelete(store: BridgeIndexedDBStore, key: IDBValidKey): Promise<void> {
        return this._sendIndexedDB({ store, op: 'delete', key }).then((): void => undefined);
    }

    indexedDBClear(store: BridgeIndexedDBStore): Promise<void> {
        return this._sendIndexedDB({ store, op: 'clear' }).then((): void => undefined);
    }

    // ─── localStorage ───────────────────────────────────

    /** 同步读：来自内存镜像；握手前/未推 snapshot 时返回 null。*/
    localStorageGet(key: string): string | null {
        if (!key) return null;
        const v = this._localMirror.get(key);
        return v === undefined ? null : v;
    }

    /** 写：先改内存镜像，再发 fire-and-forget 请求到 H5；无需等回包。*/
    localStorageSet(key: string, value: string): void {
        if (!key) return;
        const v = value == null ? '' : String(value);
        this._localMirror.set(key, v);
        const payload: CcLocalStorageOpPayload = {
            storage: 'localstorage',
            op: 'set',
            key,
            value: v,
        };
        H5MsgMgr.sendToH5('ccStorageOp', 1, payload);
    }

    localStorageRemove(key: string): void {
        if (!key) return;
        this._localMirror.delete(key);
        const payload: CcLocalStorageOpPayload = {
            storage: 'localstorage',
            op: 'remove',
            key,
        };
        H5MsgMgr.sendToH5('ccStorageOp', 1, payload);
    }

    localStorageClear(): void {
        this._localMirror.clear();
        const payload: CcLocalStorageOpPayload = {
            storage: 'localstorage',
            op: 'clear',
        };
        H5MsgMgr.sendToH5('ccStorageOp', 1, payload);
    }

    // ─── 内部 ───────────────────────────────────────────

    private _nextRequestId(): string {
        this._reqSeq = (this._reqSeq + 1) | 0;
        return `cc_storage_${Date.now()}_${this._reqSeq}_${Math.random().toString(36).slice(2, 8)}`;
    }

    private _sendIndexedDB(args: {
        store: BridgeIndexedDBStore;
        op: CcIndexedDBOpPayload['op'];
        key?: IDBValidKey;
        value?: unknown;
    }): Promise<CcStorageResultPayload> {
        const requestId = this._nextRequestId();
        const payload: CcIndexedDBOpPayload = {
            requestId,
            storage: 'indexeddb',
            store: args.store,
            op: args.op,
        };
        if (args.key !== undefined) payload.key = args.key;
        if (args.value !== undefined) payload.value = args.value;

        return new Promise<CcStorageResultPayload>((resolve) => {
            this._pending.set(requestId, resolve);
            H5MsgMgr.sendToH5('ccStorageOp', 1, payload);
        });
    }
}

export const BridgeStorage = new BridgeStorageImpl();
