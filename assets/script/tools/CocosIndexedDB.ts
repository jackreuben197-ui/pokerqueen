/**
 * Cocos 端的 IndexedDB 入口已经收编到 bridge：所有读写都由 H5MsgMgr 转发到 H5，
 * 落到统一的 user_cache_${userId} 这个 IndexedDB（两端共用同一份 db）。
 *
 * 本文件保留原有的 cocosCache() API 和 store 常量，业务层（ReplayCacheDB /
 * PlayerInfoCacheDB / GameplayPlayerInfoCache）无需修改；store 名称按 H5 白名单
 * 命名为 table_user_base_info / table_user_data_info / game_replays，避免和
 * H5 自己的 club_list 重名。
 */
import {
    BridgeStorage,
    BridgeIndexedDBStore,
    STORE_GAME_REPLAYS,
    STORE_TABLE_USER_BASE_INFO,
    STORE_TABLE_USER_DATA_INFO,
} from '../frame/BridgeStorage';

export const COCOS_STORE_PUBLIC_INFO = STORE_TABLE_USER_BASE_INFO;
export const COCOS_STORE_STATS = STORE_TABLE_USER_DATA_INFO;
export const COCOS_STORE_REPLAYS = STORE_GAME_REPLAYS;

export type CocosStoreName = BridgeIndexedDBStore;

export interface CocosCache {
    get<T>(store: CocosStoreName, key: string): Promise<T | null>;
    getAll<T>(store: CocosStoreName): Promise<T[]>;
    put<T>(store: CocosStoreName, key: string, value: T): Promise<void>;
    delete(store: CocosStoreName, key: string): Promise<void>;
    clear(store: CocosStoreName): Promise<void>;
}

export function cocosCache(): CocosCache {
    return {
        get<T>(store: CocosStoreName, key: string): Promise<T | null> {
            return BridgeStorage.indexedDBGet<T>(store, key).catch((): T | null => null);
        },
        getAll<T>(store: CocosStoreName): Promise<T[]> {
            return BridgeStorage.indexedDBGetAll<T>(store).catch((): T[] => []);
        },
        put<T>(store: CocosStoreName, key: string, value: T): Promise<void> {
            return BridgeStorage.indexedDBPut<T>(store, key, value).catch((): void => undefined);
        },
        delete(store: CocosStoreName, key: string): Promise<void> {
            return BridgeStorage.indexedDBDelete(store, key).catch((): void => undefined);
        },
        clear(store: CocosStoreName): Promise<void> {
            return BridgeStorage.indexedDBClear(store).catch((): void => undefined);
        },
    };
}
