/**
 * 牌桌内玩家信息 / 战绩缓存（对齐 Unity 的 _gameplayPlayerInfoPart + _gameplayUserStatsPart）
 *
 * 职责：
 * - 进入牌桌时 prefetch：一次 /api/misc/combine 拿到全桌玩家的 USER_PUBLIC_INFO + OTHER_USER_STATS
 * - 点击头像时同步读取内存缓存供 UIPlayerInfo 立即展示
 * - 异步 IndexedDB 持久化，下次进入同房间或重新打开牌桌时仍可用
 */
import { WWW, WebMiscCombine } from '../net/https/WebRequest';
import { GameCache } from './GameCache';
import {
    INFO_TTL_MS,
    STATS_TTL_MS,
    isFresh,
    playerInfoGet,
    playerInfoSet,
    playerStatsGet,
    playerStatsSet,
    statsKey,
    infoKey,
    CacheRecord
} from '../tools/PlayerInfoCacheDB';

export interface PublicInfoData {
    nick_name?: string;
    avatar?: string;
    sex?: number;
    random_num?: number;
    user_id?: number;
    remark_name?: string;
    remark_desc?: string;
    [k: string]: any;
}

export interface StatsData {
    user_random_id?: number;
    room_data?: any;
    mtt_room_data?: any;
    allin_data?: any;
    [k: string]: any;
}

interface StatsScope {
    gameType: number;
    pokerType: number;
    originType: number;
    goldType: number;
}

export class GameplayPlayerInfoCache {
    private static _instance: GameplayPlayerInfoCache = null;
    public static get Instance(): GameplayPlayerInfoCache {
        if (!this._instance) this._instance = new GameplayPlayerInfoCache();
        return this._instance;
    }

    private _infoMem: Map<number, CacheRecord<PublicInfoData>> = new Map();
    private _statsMem: Map<string, CacheRecord<StatsData>> = new Map();

    /** 当前牌桌的统计 scope，作为 stats 缓存 key 维度 + combine 请求过滤参数 */
    public getCurrentScope(): StatsScope {
        const gc = GameCache.Instance;
        return {
            gameType: gc.game_type || 0,
            pokerType: gc.poker_type || 0,
            originType: gc._originType || 0,
            goldType: gc.gold_type || 0
        };
    }

    /** 同步读取（内存命中），命中过期返回 stale 数据但 isFresh=false 由调用方决定是否使用 */
    getPublicInfoSync(userRandomId: number): PublicInfoData | null {
        const rec = this._infoMem.get(userRandomId);
        return rec ? rec.data : null;
    }

    getStatsSync(userRandomId: number): StatsData | null {
        const scope = this.getCurrentScope();
        const key = statsKey(userRandomId, scope.gameType, scope.pokerType, scope.originType, scope.goldType);
        const rec = this._statsMem.get(key);
        return rec ? rec.data : null;
    }

    isPublicInfoFresh(userRandomId: number): boolean {
        const rec = this._infoMem.get(userRandomId);
        return isFresh(rec, INFO_TTL_MS);
    }

    isStatsFresh(userRandomId: number): boolean {
        const scope = this.getCurrentScope();
        const key = statsKey(userRandomId, scope.gameType, scope.pokerType, scope.originType, scope.goldType);
        const rec = this._statsMem.get(key);
        return isFresh(rec, STATS_TTL_MS);
    }

    /** 异步从 IndexedDB 预热单个用户缓存到内存（UIPlayerInfo 打开时若内存无、可触发） */
    async warmFromDB(userRandomId: number): Promise<void> {
        const scope = this.getCurrentScope();
        const [info, stats] = await Promise.all([
            this._infoMem.has(userRandomId) ? Promise.resolve(null) : playerInfoGet<PublicInfoData>(userRandomId),
            this._statsMem.has(statsKey(userRandomId, scope.gameType, scope.pokerType, scope.originType, scope.goldType))
                ? Promise.resolve(null)
                : playerStatsGet<StatsData>(userRandomId, scope.gameType, scope.pokerType, scope.originType, scope.goldType)
        ]);
        if (info) this._infoMem.set(userRandomId, info);
        if (stats) {
            const key = statsKey(userRandomId, scope.gameType, scope.pokerType, scope.originType, scope.goldType);
            this._statsMem.set(key, stats);
        }
    }

    updatePublicInfo(data: PublicInfoData): void {
        if (!data || !data.random_num) return;
        const uid = data.random_num;
        const record: CacheRecord<PublicInfoData> = { data, updatedAt: Date.now() };
        this._infoMem.set(uid, record);
        playerInfoSet(uid, data);
    }

    updateStats(userRandomId: number, data: StatsData): void {
        if (!userRandomId || !data) return;
        const scope = this.getCurrentScope();
        const key = statsKey(userRandomId, scope.gameType, scope.pokerType, scope.originType, scope.goldType);
        const record: CacheRecord<StatsData> = { data, updatedAt: Date.now() };
        this._statsMem.set(key, record);
        playerStatsSet(userRandomId, scope.gameType, scope.pokerType, scope.originType, scope.goldType, data);
    }

    /**
     * 进入牌桌时批量预取：一次 combine 请求覆盖所有未命中/已过期的玩家
     * 对齐 Unity UIMatchModel.CacheUserDataByGameInner
     */
    async prefetch(userRandomIds: number[]): Promise<void> {
        if (!userRandomIds || userRandomIds.length === 0) return;
        // 先从 IndexedDB 热身（异步并发）
        await Promise.all(userRandomIds.map(uid => this.warmFromDB(uid)));

        const scope = this.getCurrentScope();
        const needInfoIds: number[] = [];
        const needStatsIds: number[] = [];
        for (const uid of userRandomIds) {
            if (!uid) continue;
            if (!this.isPublicInfoFresh(uid)) needInfoIds.push(uid);
            if (!this.isStatsFresh(uid)) needStatsIds.push(uid);
        }
        if (needInfoIds.length === 0 && needStatsIds.length === 0) return;

        const apiList: number[] = [];
        const params: any = {};
        if (needInfoIds.length > 0) {
            apiList.push(WebMiscCombine.ApiType.USER_PUBLIC_INFO);
            params.user_info_by_rid_req = { user_random_id: needInfoIds };
        }
        if (needStatsIds.length > 0) {
            apiList.push(WebMiscCombine.ApiType.OTHER_USER_STATS);
            params.user_stats_by_user_rid_req = {
                game_type: scope.gameType,
                poker_type: scope.pokerType,
                gold_type: scope.goldType,
                origin_type: scope.originType,
                room_id: GameCache.Instance.room_id,
                user_random_id: needStatsIds
            };
        }
        params.api_list = apiList;

        try {
            const res: any = await WWW.Instance.CommonAPI({
                web_class: WebMiscCombine,
                body: params,
                juhua: false
            });
            if (!res || res.code !== 0 || !res.data) return;
            const infoList: PublicInfoData[] = res.data.user_info_by_rid_resp || [];
            for (const info of infoList) {
                if (info && info.random_num) this.updatePublicInfo(info);
            }
            const statsList: StatsData[] = res.data.user_stats_by_user_rid_resp || [];
            for (const stats of statsList) {
                if (stats && stats.user_random_id) this.updateStats(stats.user_random_id, stats);
            }
        } catch (e) {
            console.warn('[GameplayPlayerInfoCache] prefetch failed', e);
        }
    }
}
