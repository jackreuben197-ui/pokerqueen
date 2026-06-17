/**
 * 牌桌内玩家公共信息 / 战绩 IndexedDB 缓存
 * 对齐 Unity:
 *   - _gameplayPlayerInfoPart (USER_PUBLIC_INFO)
 *   - _gameplayUserStatsPart  (OTHER_USER_STATS, TTL 30min)
 * 战绩需按 game_type / poker_type / gold_type / origin_type 区分；
 * 公共信息只按 user_random_id 区分。
 *
 * 缓存载体 = cocosCache()（CocosIndexedDB.ts），本模块只负责键、TTL 封装。
 */
import {
    COCOS_STORE_PUBLIC_INFO,
    COCOS_STORE_STATS,
    cocosCache,
} from './CocosIndexedDB';

/** 战绩有效期：30 分钟（对齐 Unity USER_STATS_AVAILABLE_INTERVAL） */
export const STATS_TTL_MS = 30 * 60 * 1000;
/** 公共信息有效期：24 小时 */
export const INFO_TTL_MS = 24 * 60 * 60 * 1000;

export interface CacheRecord<T> {
    data: T;
    updatedAt: number;
}

export function statsKey(
    userRandomId: number,
    gameType: number,
    pokerType: number,
    originType: number,
    goldType: number
): string {
    return `${userRandomId}_${gameType}_${pokerType}_${originType}_${goldType}`;
}

export function infoKey(userRandomId: number): string {
    return `${userRandomId}`;
}

export function playerInfoGet<T = any>(userRandomId: number): Promise<CacheRecord<T> | null> {
    return cocosCache().get<CacheRecord<T>>(COCOS_STORE_PUBLIC_INFO, infoKey(userRandomId));
}

export function playerInfoSet<T = any>(userRandomId: number, data: T): Promise<void> {
    return cocosCache().put<CacheRecord<T>>(
        COCOS_STORE_PUBLIC_INFO,
        infoKey(userRandomId),
        { data, updatedAt: Date.now() },
    );
}

export function playerStatsGet<T = any>(
    userRandomId: number,
    gameType: number,
    pokerType: number,
    originType: number,
    goldType: number
): Promise<CacheRecord<T> | null> {
    return cocosCache().get<CacheRecord<T>>(
        COCOS_STORE_STATS,
        statsKey(userRandomId, gameType, pokerType, originType, goldType),
    );
}

export function playerStatsSet<T = any>(
    userRandomId: number,
    gameType: number,
    pokerType: number,
    originType: number,
    goldType: number,
    data: T
): Promise<void> {
    return cocosCache().put<CacheRecord<T>>(
        COCOS_STORE_STATS,
        statsKey(userRandomId, gameType, pokerType, originType, goldType),
        { data, updatedAt: Date.now() },
    );
}

export function isFresh(record: CacheRecord<any> | null, ttlMs: number): boolean {
    if (!record) return false;
    return Date.now() - record.updatedAt <= ttlMs;
}
