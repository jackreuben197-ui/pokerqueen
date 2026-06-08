/**
 * 牌桌内玩家公共信息 / 战绩 IndexedDB 缓存
 * 对齐 Unity:
 *   - _gameplayPlayerInfoPart (USER_PUBLIC_INFO)
 *   - _gameplayUserStatsPart  (OTHER_USER_STATS, TTL 30min)
 * 战绩需按 game_type / poker_type / gold_type / origin_type 区分；
 * 公共信息只按 user_random_id 区分。
 */
const DB_NAME = 'poker_player_info_cache';
const STORE_INFO = 'public_info';
const STORE_STATS = 'stats';
const DB_VERSION = 1;
let _db: IDBDatabase | null = null;

/** 战绩有效期：30 分钟（对齐 Unity USER_STATS_AVAILABLE_INTERVAL） */
export const STATS_TTL_MS = 30 * 60 * 1000;
/** 公共信息有效期：24 小时 */
export const INFO_TTL_MS = 24 * 60 * 60 * 1000;

export interface CacheRecord<T> {
    data: T;
    updatedAt: number;
}

function openDB(): Promise<IDBDatabase> {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = e => {
            const db = (e.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_INFO)) db.createObjectStore(STORE_INFO);
            if (!db.objectStoreNames.contains(STORE_STATS)) db.createObjectStore(STORE_STATS);
        };
        req.onsuccess = e => {
            _db = (e.target as IDBOpenDBRequest).result;
            resolve(_db);
        };
        req.onerror = () => reject(req.error);
    });
}

function get<T>(store: string, key: string): Promise<CacheRecord<T> | null> {
    return openDB()
        .then(
            (db): Promise<CacheRecord<T> | null> =>
                new Promise<CacheRecord<T> | null>(resolve => {
                    const req = db.transaction(store, 'readonly').objectStore(store).get(key);
                    req.onsuccess = () => resolve((req.result as CacheRecord<T>) ?? null);
                    req.onerror = () => resolve(null);
                })
        )
        .catch((): CacheRecord<T> | null => null);
}

function set<T>(store: string, key: string, data: T): Promise<void> {
    return openDB()
        .then(
            (db): Promise<void> =>
                new Promise<void>(resolve => {
                    const record: CacheRecord<T> = { data, updatedAt: Date.now() };
                    const req = db.transaction(store, 'readwrite').objectStore(store).put(record, key);
                    req.onsuccess = () => resolve();
                    req.onerror = () => resolve();
                })
        )
        .catch((): void => undefined);
}

export function statsKey(userRandomId: number, gameType: number, pokerType: number, originType: number, goldType: number): string {
    return `${userRandomId}_${gameType}_${pokerType}_${originType}_${goldType}`;
}

export function infoKey(userRandomId: number): string {
    return `${userRandomId}`;
}

export function playerInfoGet<T = any>(userRandomId: number): Promise<CacheRecord<T> | null> {
    return get<T>(STORE_INFO, infoKey(userRandomId));
}

export function playerInfoSet<T = any>(userRandomId: number, data: T): Promise<void> {
    return set<T>(STORE_INFO, infoKey(userRandomId), data);
}

export function playerStatsGet<T = any>(
    userRandomId: number,
    gameType: number,
    pokerType: number,
    originType: number,
    goldType: number
): Promise<CacheRecord<T> | null> {
    return get<T>(STORE_STATS, statsKey(userRandomId, gameType, pokerType, originType, goldType));
}

export function playerStatsSet<T = any>(
    userRandomId: number,
    gameType: number,
    pokerType: number,
    originType: number,
    goldType: number,
    data: T
): Promise<void> {
    return set<T>(STORE_STATS, statsKey(userRandomId, gameType, pokerType, originType, goldType), data);
}

export function isFresh(record: CacheRecord<any> | null, ttlMs: number): boolean {
    if (!record) return false;
    return Date.now() - record.updatedAt <= ttlMs;
}
