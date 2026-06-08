import { GameCache } from '../game/GameCache';

const DB_PREFIX = 'cc_cache_user_';
const DB_VERSION = 1;
const LEGACY_DB_NAMES = ['poker_player_info_cache', 'poker_replay_cache'];

export const COCOS_STORE_PUBLIC_INFO = 'public_info';
export const COCOS_STORE_STATS = 'stats';
export const COCOS_STORE_REPLAYS = 'replays';

export type CocosStoreName =
    | typeof COCOS_STORE_PUBLIC_INFO
    | typeof COCOS_STORE_STATS
    | typeof COCOS_STORE_REPLAYS;

const STORE_NAMES: CocosStoreName[] = [
    COCOS_STORE_PUBLIC_INFO,
    COCOS_STORE_STATS,
    COCOS_STORE_REPLAYS,
];

let _db: IDBDatabase | null = null;
let _dbName = '';
let _legacyCleanupStarted = false;

export function getCocosIndexedDBName(): string | null {
    const userId = getCurrentUserId();
    return userId ? `${DB_PREFIX}${userId}` : null;
}

export function openCocosIndexedDB(): Promise<IDBDatabase | null> {
    const dbName = getCocosIndexedDBName();
    if (!dbName || typeof indexedDB === 'undefined') {
        return Promise.resolve(null);
    }

    cleanupLegacyDBs();

    if (_db && _dbName === dbName) {
        return Promise.resolve(_db);
    }

    if (_db) {
        _db.close();
        _db = null;
        _dbName = '';
    }

    return new Promise((resolve) => {
        const req = indexedDB.open(dbName, DB_VERSION);
        req.onupgradeneeded = e => {
            const db = (e.target as IDBOpenDBRequest).result;
            STORE_NAMES.forEach(storeName => {
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName);
                }
            });
        };
        req.onsuccess = e => {
            _db = (e.target as IDBOpenDBRequest).result;
            _dbName = dbName;
            resolve(_db);
        };
        req.onerror = () => resolve(null);
    });
}

function getCurrentUserId(): string {
    const userId = Number(GameCache.Instance?.nUserId || GameCache.Instance?.userId || 0);
    return Number.isFinite(userId) && userId > 0 ? String(Math.floor(userId)) : '';
}

function cleanupLegacyDBs(): void {
    if (_legacyCleanupStarted || typeof indexedDB === 'undefined') {
        return;
    }
    _legacyCleanupStarted = true;
    LEGACY_DB_NAMES.forEach(dbName => {
        try {
            indexedDB.deleteDatabase(dbName);
        } catch {
            // 清理旧缓存失败不影响当前用户库读写。
        }
    });
}

// ============================================================================
// 通用缓存 helper：把 openCocosIndexedDB + tx 模板封一层，业务 wrapper 只关心
// store/key/value。所有 op 失败都吞掉（读返回 null/[]，写静默），缓存层异常
// 不应阻塞主流程。和 h5 端 userCache(uid) 同构（h5 多了 uid 维度，因为 h5
// 用 Map 缓存多个用户的 db；cocos 同时只服务一个用户，由 openCocosIndexedDB
// 自带的 user-switch close-reopen 处理）。
// ============================================================================

export interface CocosCache {
    get<T>(store: CocosStoreName, key: string): Promise<T | null>;
    getAll<T>(store: CocosStoreName, range?: IDBKeyRange): Promise<T[]>;
    put<T>(store: CocosStoreName, key: string, value: T): Promise<void>;
    delete(store: CocosStoreName, keyOrRange: string | IDBKeyRange): Promise<void>;
    clear(store: CocosStoreName): Promise<void>;
}

function readOp<T>(handler: (db: IDBDatabase) => Promise<T>, fallback: T): Promise<T> {
    return openCocosIndexedDB()
        .then((db): Promise<T> => (db ? handler(db) : Promise.resolve(fallback)))
        .catch((): T => fallback);
}

function writeOp(handler: (db: IDBDatabase) => Promise<void>): Promise<void> {
    return openCocosIndexedDB()
        .then((db): Promise<void> => (db ? handler(db) : Promise.resolve()))
        .catch((): void => undefined);
}

export function cocosCache(): CocosCache {
    const api: CocosCache = {
        get<T>(store: CocosStoreName, key: string): Promise<T | null> {
            return readOp<T | null>(
                (db) =>
                    new Promise<T | null>((resolve) => {
                        const req = db.transaction(store, 'readonly').objectStore(store).get(key);
                        req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
                        req.onerror = () => resolve(null);
                    }),
                null,
            );
        },

        getAll<T>(store: CocosStoreName, range?: IDBKeyRange): Promise<T[]> {
            return readOp<T[]>(
                (db) =>
                    new Promise<T[]>((resolve) => {
                        const req = db.transaction(store, 'readonly').objectStore(store).getAll(range);
                        req.onsuccess = () => resolve(Array.isArray(req.result) ? (req.result as T[]) : []);
                        req.onerror = () => resolve([]);
                    }),
                [],
            );
        },

        put<T>(store: CocosStoreName, key: string, value: T): Promise<void> {
            return writeOp(
                (db) =>
                    new Promise<void>((resolve) => {
                        const req = db.transaction(store, 'readwrite').objectStore(store).put(value, key);
                        req.onsuccess = () => resolve();
                        req.onerror = () => resolve();
                    }),
            );
        },

        delete(store: CocosStoreName, keyOrRange: string | IDBKeyRange): Promise<void> {
            return writeOp(
                (db) =>
                    new Promise<void>((resolve) => {
                        const req = db.transaction(store, 'readwrite').objectStore(store).delete(keyOrRange);
                        req.onsuccess = () => resolve();
                        req.onerror = () => resolve();
                    }),
            );
        },

        clear(store: CocosStoreName): Promise<void> {
            return writeOp(
                (db) =>
                    new Promise<void>((resolve) => {
                        const req = db.transaction(store, 'readwrite').objectStore(store).clear();
                        req.onsuccess = () => resolve();
                        req.onerror = () => resolve();
                    }),
            );
        },
    };
    return api;
}
