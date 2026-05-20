/**
 * 局内牌谱 IndexedDB 缓存
 * key = `${userId}_${roomId}_${handNum}` (roomId 优先) 或 `${userId}_m${matchId}_${handNum}` (matchId 回退)
 * 含 userId 是因为服务端响应的 d 字段携带请求方私人底牌，跨账号缓存会导致隐私泄露
 */
const DB_NAME = 'poker_replay_cache';
const STORE_NAME = 'replays';
const DB_VERSION = 1;
let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = e => {
            const db = (e.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        req.onsuccess = e => {
            _db = (e.target as IDBOpenDBRequest).result;
            resolve(_db);
        };
        req.onerror = () => reject(req.error);
    });
}

export function roomKey(userId: number, roomId: number, handNum: number): string {
    return `${userId}_${roomId}_${handNum}`;
}

export function matchKey(userId: number, matchId: number, handNum: number): string {
    return `${userId}_m${matchId}_${handNum}`;
}

export async function replayGet(key: string): Promise<any | null> {
    try {
        const db = await openDB();
        return new Promise(resolve => {
            const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
            req.onsuccess = () => resolve(req.result ?? null);
            req.onerror = () => resolve(null);
        });
    } catch {
        return null;
    }
}

export async function replaySet(key: string, data: any): Promise<void> {
    try {
        const db = await openDB();
        return new Promise(resolve => {
            const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(data, key);
            req.onsuccess = () => resolve();
            req.onerror = () => resolve();
        });
    } catch {
        // 写缓存失败不阻塞主流程
    }
}
