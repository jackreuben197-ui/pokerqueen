/**
 * 局内牌谱 IndexedDB 缓存
 * key = `${userId}_${roomId}_${handNum}` (roomId 优先) 或 `${userId}_m${matchId}_${handNum}` (matchId 回退)
 * 含 userId 是因为服务端响应的 d 字段携带请求方私人底牌，跨账号缓存会导致隐私泄露
 *
 * 缓存载体 = cocosCache()（CocosIndexedDB.ts），本模块只负责键生成。
 */
import { COCOS_STORE_REPLAYS, cocosCache } from './CocosIndexedDB';

export function roomKey(userId: number, roomId: number, handNum: number): string {
    return `${userId}_${roomId}_${handNum}`;
}

export function matchKey(userId: number, matchId: number, handNum: number): string {
    return `${userId}_m${matchId}_${handNum}`;
}

export function replayGet(key: string): Promise<any | null> {
    return cocosCache().get<any>(COCOS_STORE_REPLAYS, key);
}

export function replaySet(key: string, data: any): Promise<void> {
    return cocosCache().put<any>(COCOS_STORE_REPLAYS, key, data);
}
