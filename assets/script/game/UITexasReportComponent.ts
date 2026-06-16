import SliderPlus from '../common/SliderPlus';
import { UIDefine } from '../define/UIDefine';
import { TextColor } from '../config/GameConfig';
import { StringHelper } from '../helper/StringHelper';
import TimeHelper from '../helper/TimeHelper';
import WebImageHelper from '../helper/WebImageHelper';
import { i18nLabel } from '../i18n/i18nLabel';
import { i18nMgr } from '../i18n/i18nMgr';
import { UIClubModel } from '../uimodel/UIClubModel';
import { WebOrgFriendRoomList, APITexasSituationMushRound, APITexasSituationSquidRound, WWW, WebStatsRoomInsuranceData } from '../net/https/WebRequest';
import ProtocolAgency from '../net/websocket/ProtocolAgency';
import { ProtocolCode } from '../net/websocket/ProtocolCode';
import { ClubCache } from '../frame/data/club/ClubCache';
import { Def } from '../protobuf/holdem/define_pb';
import { ServerMessageLeave } from '../protobuf/holdem/req_th_leave_pb';
import { ClientMessageObservers } from '../protobuf/holdem/req_th_observers_pb';
import { ClientMessagePlayerJackpotSummary, ServerMessagePlayerJackpotSummary } from '../protobuf/holdem/req_th_player_jackpot_summary_pb';
import { ClientMessageRoomers, ServerMessageRoomers } from '../protobuf/holdem/req_th_roomers_pb';
import { ServerMessageWinner } from '../protobuf/holdem/recv_th_winner_pb';
import GGEvent from '../event/GGEvent';
import { CardType } from './CardTypeUtil';
import UIBase from '../ui/UIBase';
import UIComponent from '../ui/UIComponent';
import Main from '../Main';
import { GameCache } from './GameCache';
/*
 * @Author: xfj
 * @Date: 2022-09-01 11:38:48
 * @description:
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-01 13:56:09
 * @FilePath: /pokerqueen/assets/script/game/UITexasReportComponent.ts
 */
const { ccclass, property } = cc._decorator;

export class ReportPlayer {
    public userId: number;
    public nickName: string;
    public hand: number;
    public bringIn: number; // 总带入
    public score: number; // 实时盈亏 = win + storeChips
    public storeChips: number; // 藏钱（显示在带入旁括号内）
    public poolRate: number; // 入池率 * 1000（与 Unity 保持一致，显示时除以 10）
    public isOnline: boolean; // 是否在线
    public deposit: number; // 押金
    public mushroomCount: number; // 蘑菇数
    public mushroomAmount: number; // 蘑菇额
    public squidInTotal: number; // 鱿鱼入
    public squidOutTotal: number; // 鱿鱼出
    public squidPunishTotal: number; // 鱿鱼惩罚
}

interface SquidOrMushRecord {
    name: string;
    in_num: number;
    in_amount: number;
    out_num: number;
    out_amount: number;
    user_random_id: number;
}

interface JackpotRecord {
    userRid: number;
    name: string;
    avatar: string;
    sex: number;
    contributeTotal: number;
    awardTotal: number;
    royalFlushCount: number;
    straightFlushCount: number;
    fourOfaKindCount: number;
}

interface InsuranceRecord {
    userRid: number;
    name: string;
    handNum: number;
    insurBet: number;
    insurWin: number;
    createTime: number;
}
type ReportBottomTab = 'battle' | 'insurance' | 'jackpot' | 'mode';

@ccclass
export default class UITexasReportComponent extends UIBase {
    btnShowProblem: cc.Node = null;
    imageMaskClose: cc.Node = null;
    content: cc.Node = null;
    mRoomLeaveTime: any = null;
    IntervalId: number = null;
    isLoad = true;
    tInfo_0: any[] = [];
    tInfo_1: any[] = [];
    @property(cc.Prefab)
    peopleItem: cc.Prefab = null;
    @property(cc.Prefab)
    dataItem: cc.Prefab = null;
    text_Time: cc.Label = null;
    room_id: cc.Label = null;
    battle_data_content: cc.Node = null;
    squid_data_content: cc.Node = null;
    mush_data_content: cc.Node = null;
    jackpot_data_content: cc.Node = null;
    reportScrow: cc.Node = null;
    squidListView: cc.Node = null;
    mushRoomListView: cc.Node = null;
    jackpotListView: cc.Node = null;
    peopleNode: cc.Node = null;
    peopleScrow: cc.Node = null;
    people_content: cc.Node = null;
    peopelNum: cc.Label = null;
    listBar1: cc.Node = null;
    listBar3: cc.Node = null;
    listBarSquid: cc.Node = null;
    listBarMushRoom: cc.Node = null;
    listBarJackpot: cc.Node = null;
    listBar4: cc.Node = null;
    /** 代码生成的“Insurance”药丸标题（保险页专用，Figma 58:109729） */
    private insurancePillNode: cc.Node = null;
    jackpotBarNode: cc.Node = null;
    jackpotTotalLabel: cc.Label | cc.RichText = null;
    listBar3ModeLabel: cc.Label = null;
    squidRoundText: cc.Label = null;
    pageText: cc.Label = null;
    leftBtn: cc.Node = null;
    rightBtn: cc.Node = null;
    pageInfoNode: cc.Node = null;
    squidRoundNode: cc.Node = null;
    sliderPlus: SliderPlus = null;
    progressBlue: cc.Node = null;
    bgClickNode: cc.Node = null;
    noDataNode: cc.Node = null;
    mushDirNode: cc.Node = null;
    mushDirText: cc.Label = null;
    reportSubType: 'none' | 'mush' | 'squid' = 'none';
    curBottomTab: ReportBottomTab = 'battle';
    bottomToggleRoot: cc.Node = null;
    battleToggleBtn: cc.Node = null;
    baoxianToggleBtn: cc.Node = null;
    jackpotToggleBtn: cc.Node = null;
    squidToggleBtn: cc.Node = null;
    battleCheckmark: cc.Node = null;
    baoxianCheckmark: cc.Node = null;
    jackpotCheckmark: cc.Node = null;
    squidCheckmark: cc.Node = null;
    battleTextNode: cc.Node = null;
    baoxianTextNode: cc.Node = null;
    jackpotTextNode: cc.Node = null;
    squidTextNode: cc.Node = null;
    // Unity: _situation._roomersMap — 按房间 ID 缓存最新 roomers 数据，Socket 推送时更新，打开面板时优先读取缓存
    private static _roomersCache: Map<number, any> = new Map();

    /** 写入缓存（UITexas 常驻监听 和 面板内监听 共用同一写入入口） */
    public static updateRoomersCache(roomId: number, data: any): void {
        UITexasReportComponent._roomersCache.set(roomId, data);
    }

    /** 离开房间时调用，清除指定房间缓存 */
    public static clearRoomersCache(roomId: number): void {
        UITexasReportComponent._roomersCache.delete(roomId);
    }

    /**
     * 每手结束收到 Protocol_Holdem_Winner 时，直接在缓存上增量更新战绩。
     * 对应 Unity TexasSituationController.HandResult + CalculateWinner。
     * 不发网络请求，由 UITexas 在全局 Winner 消息回调中调用。
     */
    /**
     * 对应 Unity TexasSituationController.HandResult + CalculateWinner。
     * 收到 Protocol_Holdem_Winner 后由 UITexas 调用，直接在缓存上增量更新，不发网络请求。
     */
    public static applyWinnerResult(response: ServerMessageWinner.AsObject): void {
        if (!response) return;
        const roomId = GameCache.Instance.room_id;
        const cached = UITexasReportComponent._roomersCache.get(roomId);
        if (!cached) {
            console.log('[UITexasReport] applyWinnerResult: 房间未缓存，无法结算');
            return;
        }
        const playersList: any[] = cached.playersList || [];
        // Unity: roomers.TotalHand = result.HandNum
        cached.totalHand = response.handNum;
        const mushroomBase = Number(GameCache.Instance.CurGame?.mushroomBase || GameCache.Instance.room_mushroom_base || 0);
        for (const winner of response.resultsList || []) {
            let player = playersList.find(p => Number(p.seatId || 0) === Number(winner.seatId || 0));
            if (!player) {
                const seat = GameCache.Instance.CurGame?.GetSeatByServerSeatID(winner.seatId);
                const userId = seat?.Player?.userID;
                if (userId != null) {
                    player = playersList.find(p => Number(p.userRid) === Number(userId));
                    if (player && !player.seatId) {
                        player.seatId = winner.seatId;
                    }
                }
            }
            if (!player) continue;
            // Unity: player.PoolCount / HandNum / IsOnline
            player.poolCount = (player.poolCount || 0) + (winner.inPool ? 1 : 0);
            player.handNum = (player.handNum || 0) + 1;
            player.isOnline = true;
            // Unity CalculateWinner: 赢了扣手续费和奖池费，输了只算输额，再叠加保险
            let win: number;
            if (winner.win > winner.handBet) {
                win = winner.win - winner.handBet - (winner.fee || 0) - (winner.jackpotFee || 0);
            } else {
                win = winner.win - winner.handBet;
            }
            win += (winner.insuranceWin || 0) - (winner.insurance || 0);
            player.win = (player.win || 0) + win;
            // Unity: roomers.TotalPot += winner.Win（原始 win，非扣费后）
            cached.totalPot = (cached.totalPot || 0) + (winner.win || 0);
            // Unity: 蘑菇 MushroomCount += ehc.In / mushroomBase, MushroomAmount += ehc.In
            for (const ehc of winner.ehcsList || []) {
                if (ehc.ehcType !== Def.EHCType.EHC_MUSHROOM) continue;
                const amount = ehc.pb_in || 0;
                player.mushroomAmount = (player.mushroomAmount || 0) + amount;
                player.mushroomCount = (player.mushroomCount || 0) + (mushroomBase > 0 ? Math.floor(amount / mushroomBase) : 0);
            }
            // Unity: Jackpot 贡献 contributeTotal += jackpotFee
            if ((winner.jackpotFee || 0) > 0) {
                UITexasReportComponent._applyJackpotContribute(player.userRid, player.name, winner.jackpotFee);
            }
            // Unity: Jackpot 奖励 awardTotal += jawd，按 handValueType 记牌型次数
            if ((winner.jawd || 0) > 0) {
                UITexasReportComponent._applyJackpotAward(player.userRid, player.name, winner.jawd, winner.handValueType);
            }
        }
    }

    /** Jackpot 静态缓存（对应 Unity _situation._jackpot）*/
    private static _jackpotCache: Map<number, JackpotRecord> = new Map();

    public static clearJackpotCache(): void {
        UITexasReportComponent._jackpotCache.clear();
    }

    private static _applyJackpotContribute(userRid: number, name: string, fee: number): void {
        let rec = UITexasReportComponent._jackpotCache.get(userRid);
        if (!rec) {
            rec = { userRid, name, avatar: '', sex: 0, contributeTotal: 0, awardTotal: 0, royalFlushCount: 0, straightFlushCount: 0, fourOfaKindCount: 0 };
            UITexasReportComponent._jackpotCache.set(userRid, rec);
        }
        rec.contributeTotal += fee;
    }

    private static _applyJackpotAward(userRid: number, name: string, jawd: number, handValueType: number): void {
        let rec = UITexasReportComponent._jackpotCache.get(userRid);
        if (!rec) {
            rec = { userRid, name, avatar: '', sex: 0, contributeTotal: 0, awardTotal: 0, royalFlushCount: 0, straightFlushCount: 0, fourOfaKindCount: 0 };
            UITexasReportComponent._jackpotCache.set(userRid, rec);
        }
        rec.awardTotal += jawd;
        if (handValueType === CardType.RoyalFlush) rec.royalFlushCount += 1;
        else if (handValueType === CardType.StraightFlush) rec.straightFlushCount += 1;
        else if (handValueType === CardType.FourOfAKind) rec.fourOfaKindCount += 1;
    }

    // ─────────────────────────────────────────────
    // 静态缓存增量更新方法（对应 Unity TexasSituationController）
    // 返回 true 表示是新玩家（需要调用方 dispatch SituationRefresh）
    // ─────────────────────────────────────────────
    /**
     * 对应 Unity TexasSituationController.SitDown。
     * 已存在的玩家：覆盖 bringIn/deposit/isOnline，重算 totalBringin，不发刷新事件。
     * 新玩家：追加到列表，累加 totalBringin，返回 true（调用方发刷新事件）。
     */
    public static applySitDown(userRid: number, totalBringIn: number, deposit: number, name: string = '', avatar: string = ''): boolean {
        const roomId = GameCache.Instance.room_id;
        let cached = UITexasReportComponent._roomersCache.get(roomId);
        if (!cached) {
            cached = { playersList: [], totalBringin: 0 };
            UITexasReportComponent._roomersCache.set(roomId, cached);
        }
        const playersList: any[] = cached.playersList || (cached.playersList = []);
        const mushroomBase = Number(GameCache.Instance.CurGame?.mushroomBase || GameCache.Instance.room_mushroom_base || 0);
        const existing = playersList.find(p => Number(p.userRid) === Number(userRid));
        if (existing) {
            // Unity: 覆盖 bringInTotal，重算 totalBringin，不发事件
            existing.isOnline = true;
            existing.bringInTotal = totalBringIn;
            existing.deposit = mushroomBase > 0 ? mushroomBase : deposit;
            cached.totalBringin = playersList.reduce((s, p) => s + (p.bringInTotal || 0), 0);
            return false;
        }
        // 新玩家
        const player: any = {
            userRid,
            bringInTotal: totalBringIn,
            deposit: mushroomBase > 0 ? mushroomBase : deposit,
            isOnline: true,
            name: name || '',
            avatar: avatar || '',
            win: 0,
            handNum: 0,
            poolCount: 0,
            storeChips: 0,
            mushroomAmount: 0,
            mushroomCount: 0
        };
        playersList.push(player);
        cached.totalBringin = (cached.totalBringin || 0) + totalBringIn;
        return true;
    }

    /**
     * 对应 Unity TexasSituationController.StandUp。
     * 已存在：累加 bringOutTotal，isOnline=false，不发事件。
     * 新玩家（兜底）：追加，返回 true。
     */
    public static applyStandUp(userRid: number, bringOut: number, name: string = '', avatar: string = ''): boolean {
        const roomId = GameCache.Instance.room_id;
        const cached = UITexasReportComponent._roomersCache.get(roomId);
        if (!cached) return false;
        const playersList: any[] = cached.playersList || [];
        const mushroomBase = Number(GameCache.Instance.CurGame?.mushroomBase || GameCache.Instance.room_mushroom_base || 0);
        const existing = playersList.find(p => Number(p.userRid) === Number(userRid));
        if (existing) {
            existing.bringOutTotal = (existing.bringOutTotal || 0) + bringOut;
            existing.isOnline = false;
            if (mushroomBase > 0) existing.deposit = 0;
            return false;
        }
        // 兜底：新玩家（通常不会走到这里）
        const player: any = {
            userRid,
            bringOutTotal: bringOut,
            isOnline: false,
            name: name || '',
            avatar: avatar || '',
            bringInTotal: 0,
            win: 0,
            handNum: 0,
            poolCount: 0
        };
        if (mushroomBase > 0) player.deposit = 0;
        playersList.push(player);
        return true;
    }

    /**
     * 对应 Unity TexasSituationController.ChipChange。
     * 只在 ChipChangeReason == CcNone 时调用（由 UITexas 负责过滤）。
     * 已存在：bringInTotal += newBringIn，totalBringin += newBringIn，不发事件。
     * 新玩家（兜底）：追加，返回 true。
     */
    public static applyChipChange(userRid: number, newBringIn: number, name: string = '', avatar: string = ''): boolean {
        const roomId = GameCache.Instance.room_id;
        let cached = UITexasReportComponent._roomersCache.get(roomId);
        if (!cached) {
            cached = { playersList: [], totalBringin: 0 };
            UITexasReportComponent._roomersCache.set(roomId, cached);
        }
        const playersList: any[] = cached.playersList || (cached.playersList = []);
        const mushroomBase = Number(GameCache.Instance.CurGame?.mushroomBase || GameCache.Instance.room_mushroom_base || 0);
        const existing = playersList.find(p => Number(p.userRid) === Number(userRid));
        if (existing) {
            existing.isOnline = true;
            existing.bringInTotal = (existing.bringInTotal || 0) + newBringIn;
            if (mushroomBase > 0) existing.deposit = mushroomBase;
            cached.totalBringin = (cached.totalBringin || 0) + newBringIn;
            return false;
        }
        // 兜底：新玩家
        const player: any = {
            userRid,
            bringInTotal: newBringIn,
            isOnline: true,
            name: name || '',
            avatar: avatar || '',
            deposit: mushroomBase > 0 ? mushroomBase : 0,
            win: 0,
            handNum: 0,
            poolCount: 0
        };
        playersList.push(player);
        cached.totalBringin = (cached.totalBringin || 0) + newBringIn;
        return true;
    }

    /**
     * 对应 Unity TexasSituationController.OnStartInfo。
     * 仅当缓存里 startTime <= 0 时补写一次当前时间（单位：秒）。
     * Unity 不发 SituationRefresh，Cocos 同样不发。
     */
    public static applyStartInfo(): void {
        const roomId = GameCache.Instance.room_id;
        const cached = UITexasReportComponent._roomersCache.get(roomId);
        if (!cached) return;
        if ((cached.startTime || 0) <= 0) {
            cached.startTime = Math.floor(Date.now() / 1000);
        }
    }

    private squidRoundDic: Map<number, SquidOrMushRecord[]> = new Map();
    private jackpotRecords: JackpotRecord[] = [];
    private insuranceRecords: InsuranceRecord[] = [];
    private isInsuranceListInit: boolean = false;
    private squidTotalRound: number = 0;
    private squidCurRound: number = 0;
    private squidStartHand: number = 0;
    private squidEndHand: number = 0;
    private isSquidListInit: boolean = false;
    private isJackpotListInit: boolean = false;
    private manualClose: boolean = false;
    showPlayerInTableNode: cc.Node = null;
    checkboxOnNode: cc.Node = null;
    checkboxOffNode: cc.Node = null;
    private _isShowOnlyTablePlayers: boolean = false;
    private _lastRoomersData: any = null;
    publicAreaNode: cc.Node = null;
    totalMoneyLabel: cc.Label = null;
    totalBringLabel: cc.Label = null;
    curHandLabel: cc.Label = null;
    verBottomLabel: cc.Label = null;
    curTimeLabel: cc.Label = null;
    insurancePoolLabel: cc.Label = null;
    remainTimeLabel: cc.Label = null;
    private normalReportY: number = 0;
    private jackpotReportY: number = 0;
    private normalPeopleNodeY: number = 0;
    private normalPeopleScrowY: number = 0;
    private normalNoDataY: number = 0;

    protected lateLoad(): void {
        super.lateLoad();
        const bg = 'layer/bg';
        const top = `${bg}/$Top`;
        this.text_Time = this.getChildNodeOrComponent('time_text', cc.Label);
        this.room_id = this.getChildNodeOrComponent('room_id', cc.Label);
        // $content 下的节点：先找到 $content，再用短路径向下查找
        const contentNode = this.getChildNodeOrComponent('$content') as cc.Node;
        const dataListNode = contentNode ? cc.find('dataList', contentNode) : null;
        const headerNode = dataListNode ? cc.find('header', dataListNode) : null;
        this.reportScrow = dataListNode ? cc.find('reportScrow', dataListNode) : null;
        this.squidListView = dataListNode ? cc.find('squidListView', dataListNode) : null;
        this.mushRoomListView = dataListNode ? cc.find('mushRoomListView', dataListNode) : null;
        this.jackpotListView = dataListNode ? cc.find('jackpotListView', dataListNode) : null;
        this.peopleNode = contentNode ? cc.find('peopleNode', contentNode) : null;
        this.peopleScrow = contentNode ? cc.find('peopleScrow', contentNode) : null;
        this.battle_data_content = this.reportScrow ? cc.find('view/data_content', this.reportScrow) : null;
        this.squid_data_content = this.squidListView ? cc.find('view/data_content', this.squidListView) : null;
        this.mush_data_content = this.mushRoomListView ? cc.find('view/data_content', this.mushRoomListView) : null;
        this.jackpot_data_content = this.jackpotListView ? cc.find('view/data_content', this.jackpotListView) : null;
        this.people_content = this.peopleScrow ? cc.find('view/people_content', this.peopleScrow) : null;
        this.peopelNum = this.peopleNode ? cc.find('peopelNum', this.peopleNode)?.getComponent(cc.Label) || null : null;
        this.listBar1 = headerNode ? cc.find('ListBar1', headerNode) : null;
        this.listBar3 = headerNode ? cc.find('ListBar3', headerNode) : null;
        this.listBarSquid = headerNode ? cc.find('listBarSquid', headerNode) : null;
        this.listBarMushRoom = headerNode ? cc.find('listBarMushRoom', headerNode) : null;
        this.listBarJackpot = headerNode ? cc.find('listBarJackpot', headerNode) : null;
        this.listBar4 = headerNode ? cc.find('ListBar4', headerNode) : null;
        this.jackpotBarNode = dataListNode ? cc.find('JackpotBar', dataListNode) : null;
        const jackpotNumberNode = this.jackpotBarNode ? cc.find('JackpotNumber', this.jackpotBarNode) : null;
        if (jackpotNumberNode) {
            this.jackpotTotalLabel = jackpotNumberNode.getComponent(cc.Label) || jackpotNumberNode.getComponent(cc.RichText) || null;
        }
        this.listBar3ModeLabel = this.listBar3 ? cc.find('Text_Mode', this.listBar3)?.getComponent(cc.Label) || null : null;
        this.showPlayerInTableNode = cc.find(`${top}/show_player_in_table`, this.node);
        this.checkboxOnNode = cc.find(`${top}/show_player_in_table/checkbox_on`, this.node);
        this.checkboxOffNode = cc.find(`${top}/show_player_in_table/checkbox_off`, this.node);
        this.squidRoundText = cc.find(`${top}/squidRound/squid_text`, this.node)?.getComponent(cc.Label) || null;
        this.pageText = cc.find(`${bg}/squidPageInfo/cc_Label$page`, this.node)?.getComponent(cc.Label) || null;
        this.leftBtn = cc.find(`${bg}/squidPageInfo/$left_btn`, this.node);
        this.rightBtn = cc.find(`${bg}/squidPageInfo/$right_btn`, this.node);
        this.sliderPlus = cc.find(`${bg}/squidPageInfo/SliderPlus$slider`, this.node)?.getComponent(SliderPlus) || null;
        this.progressBlue = cc.find(`${bg}/squidPageInfo/SliderPlus$slider/background/$progressBlue`, this.node);
        this.bgClickNode = cc.find('layer/$bg_click', this.node);
        this.pageInfoNode = cc.find(`${bg}/squidPageInfo`, this.node);
        this.squidRoundNode = cc.find(`${top}/squidRound`, this.node);
        this.noDataNode = dataListNode ? cc.find('noData', dataListNode) : null;
        // 按需求移除空状态的大图标（保留“暂无数据”文字）
        const iconNoData = this.noDataNode ? cc.find('icon_no_data', this.noDataNode) : null;
        if (iconNoData) iconNoData.active = false;
        this.publicAreaNode = contentNode ? cc.find('publicArea', contentNode) : null;
        this.totalMoneyLabel = this.publicAreaNode ? cc.find('total_money', this.publicAreaNode)?.getComponent(cc.Label) || null : null;
        this.totalBringLabel = this.publicAreaNode ? cc.find('total_bring', this.publicAreaNode)?.getComponent(cc.Label) || null : null;
        this.curHandLabel = this.publicAreaNode ? cc.find('cur_hand', this.publicAreaNode)?.getComponent(cc.Label) || null : null;
        this.verBottomLabel = this.publicAreaNode ? cc.find('ver_bottom', this.publicAreaNode)?.getComponent(cc.Label) || null : null;
        this.curTimeLabel = this.publicAreaNode ? cc.find('cur_time', this.publicAreaNode)?.getComponent(cc.Label) || null : null;
        this.insurancePoolLabel = this.publicAreaNode ? cc.find('insurance_pool', this.publicAreaNode)?.getComponent(cc.Label) || null : null;
        this.remainTimeLabel = cc.find(`${top}/remain_time`, this.node)?.getComponent(cc.Label) || null;
        this.mushDirNode = cc.find(`${top}/mushDir`, this.node);
        this.mushDirText = cc.find(`${top}/mushDir/mushDirText`, this.node)?.getComponent(cc.Label) || null;
        this.normalReportY = this.reportScrow ? this.reportScrow.y : 0;
        this.jackpotReportY = this.jackpotListView ? this.jackpotListView.y : this.normalReportY;
        this.normalPeopleNodeY = this.peopleNode ? this.peopleNode.y : 0;
        this.normalPeopleScrowY = this.peopleScrow ? this.peopleScrow.y : 0;
        this.normalNoDataY = this.noDataNode ? this.noDataNode.y : 0;
        const bottomRootPath = `${bg}/bottomToggle`;
        this.bottomToggleRoot = cc.find(bottomRootPath, this.node);
        this.battleToggleBtn = cc.find(`${bottomRootPath}/battleToggle`, this.node);
        this.baoxianToggleBtn = cc.find(`${bottomRootPath}/baoxianToggle`, this.node);
        this.jackpotToggleBtn = cc.find(`${bottomRootPath}/JackpotToggle`, this.node);
        this.squidToggleBtn = cc.find(`${bottomRootPath}/squidToggle`, this.node);
        this.battleCheckmark = cc.find(`${bottomRootPath}/battleToggle/text/Checkmark`, this.node);
        this.baoxianCheckmark = cc.find(`${bottomRootPath}/baoxianToggle/text/Checkmark`, this.node);
        this.jackpotCheckmark = cc.find(`${bottomRootPath}/JackpotToggle/text/Checkmark`, this.node);
        this.squidCheckmark = cc.find(`${bottomRootPath}/squidToggle/text/Checkmark`, this.node);
        this.battleTextNode = cc.find(`${bottomRootPath}/battleToggle/text`, this.node);
        this.baoxianTextNode = cc.find(`${bottomRootPath}/baoxianToggle/text`, this.node);
        this.jackpotTextNode = cc.find(`${bottomRootPath}/JackpotToggle/text`, this.node);
        this.squidTextNode = cc.find(`${bottomRootPath}/squidToggle/text`, this.node);
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        if (this.battleToggleBtn) this.bindClick(this.battleToggleBtn, () => this.onClickBottomToggle('battle'));
        if (this.squidToggleBtn) this.bindClick(this.squidToggleBtn, () => this.onClickBottomToggle('mode'));
        if (this.baoxianToggleBtn) this.bindClick(this.baoxianToggleBtn, () => this.onClickBottomToggle('insurance'));
        if (this.jackpotToggleBtn) this.bindClick(this.jackpotToggleBtn, () => this.onClickBottomToggle('jackpot'));
        if (this.leftBtn) this.bindClick(this.leftBtn, () => this.onClickPage(false));
        if (this.rightBtn) this.bindClick(this.rightBtn, () => this.onClickPage(true));
        if (this.bgClickNode) this.bindClick(this.bgClickNode, () => this.imageMaskCloseClick());
        if (this.showPlayerInTableNode) this.bindClick(this.showPlayerInTableNode, () => this.onToggleShowTablePlayers());
        const exitBtn = cc.find('layer/bg/$Top/exit_button', this.node);
        if (exitBtn) this.bindClick(exitBtn, () => this.imageMaskCloseClick());
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(ProtocolCode.Protocol_Holdem_Roomers, this.ProtocolHoldemRoomersHandler);
        this.listen(ProtocolCode.Protocol_Holdem_PlayerJackpotSummary, this.ProtocolHoldemPlayerJackpotSummaryHandler);
        // 对应 Unity EVENT_GAMPLAY_SITUATION_REFRESH → UIGameplaySituationComponent.RefreshSituationData
        this.listen(GGEvent.SituationRefresh, this.onSituationRefresh);
    }

    RequestRoomers() {
        const roomId = GameCache.Instance.room_id;
        const cached = UITexasReportComponent._roomersCache.get(roomId);
        if (cached) {
            // 有缓存直接渲染——缓存由 UITexas 在进入时 + 每局 HandClear 后维护，面板不发任何请求
            this.applyRoomersData(cached);
        }
        // 缓存为空时不发请求：进入牌桌时 UITexas 已发过请求，等响应回来后缓存会被填充
        // 若真的为空（极端情况），显示空列表即可，不阻塞用户
    }

    private applyRoomersData(response: any): void {
        this.buildPlayerLists(response);
        this.refreshCurrentDataList();
        this.showPublicArea(response);
        if (response.observersList) {
            this.UpdateObViewList(response);
        } else {
            this.UpdateObViewList({ observersList: [] });
        }
    }

    RequestObservers() {
        ProtocolAgency.Send<ClientMessageObservers.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_Observers,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                // history: GameCache.Instance.origin_type == 4,
                limit: 1000,
                offset: 0
            }
        });
    }

    RequestJackpotSummary() {
        const roomId = Number(GameCache.Instance.room_id || 0);
        if (roomId <= 0) return;
        ProtocolAgency.Send<ClientMessagePlayerJackpotSummary.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_PlayerJackpotSummary,
            RoomID: roomId,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId, matchId: GameCache.Instance.match_id }
            }
        });
    }

    ProtocolHoldemObserverHandler(response: ServerMessageLeave.AsObject) {
        if (response == null) {
            return;
        }
        if (response.status == 0) {
            this.UpdateObViewList(response);
        }
    }

    ProtocolHoldemRoomersHandler(response: ServerMessageRoomers.AsObject) {
        if (response == null) {
            return;
        }
        if (response.status == 0) {
            // Unity: 收到推送后更新缓存（UITexas 的常驻监听也会更新，此处面板开着时同步处理）
            UITexasReportComponent.updateRoomersCache(GameCache.Instance.room_id, response);
            this.UpdateViewList(response);
        }
    }

    ProtocolHoldemPlayerJackpotSummaryHandler(response: ServerMessagePlayerJackpotSummary.AsObject) {
        const resp: any = response as any;
        if (!resp) return;
        if (Number(resp.status || 0) !== 0) {
            this.jackpotRecords = [];
            this.isJackpotListInit = true;
            if (this.curBottomTab === 'jackpot') {
                this.UpdateJackpotViewList();
            }
            return;
        }
        const players: any[] = (resp.playersList || []) as any[];
        const uniq = new Map<number, JackpotRecord>();
        for (let i = 0; i < players.length; i++) {
            const p = players[i] || {};
            const userRid = Number(p.userRid || 0);
            if (userRid > 0 && uniq.has(userRid)) continue;
            const row: JackpotRecord = {
                userRid,
                name: `${p.name || ''}`,
                avatar: `${p.avatar || ''}`,
                sex: Number(p.sex || 0),
                contributeTotal: Number(p.contributeTotal || 0),
                awardTotal: Number(p.awardTotal || 0),
                royalFlushCount: Number(p.royalFlushCount || 0),
                straightFlushCount: Number(p.straightFlushCount || 0),
                fourOfaKindCount: Number(p.fourOfaKindCount || 0)
            };
            if (userRid > 0) uniq.set(userRid, row);
        }
        const merged: JackpotRecord[] = [];
        uniq.forEach(v => merged.push(v));
        this.jackpotRecords = merged;
        this.isJackpotListInit = true;
        if (this.curBottomTab === 'jackpot') {
            this.UpdateJackpotViewList();
        }
    }

    onShow(param?: any): void {
        super.onShow();
        this.regiterDispatchEvent();
        const keepState = !!param?.__keepState;
        this.manualClose = false;
        if (keepState) {
            this.reportSubType = this.resolveReportSubType();
            this.refreshMushDir();
            this.refreshBottomToggleState();
            this.refreshContentVisible();
            this.refreshListBar();
            this.RefreshJackpotTotalLabel();
            if (this.curBottomTab === 'jackpot' && !this.isJackpotListInit) {
                this.RequestJackpotSummary();
            }
            if (this.curBottomTab === 'insurance' && !this.isInsuranceListInit) {
                this.RequestInsuranceData();
            }
            this.updateNoDataState();
            return;
        }
        this.unscheduleAllCallbacks();
        this.clearView();
        // this.btnShowProblem = this.getChildNodeOrComponent('BtnShowProblem');
        // this.btnShowProblem.on('click', this.btnShowProblemClick, this)
        this.room_id.string = GameCache.Instance.room_id + '-' + GameCache.Instance.CurGame.mHandNum;
        if (this.remainTimeLabel) this.remainTimeLabel.string = '--:--:--';
        this.reportSubType = this.resolveReportSubType();
        this.curBottomTab = 'battle';
        this._isShowOnlyTablePlayers = false;
        this._lastRoomersData = null;
        this.refreshTablePlayerToggle();
        this.refreshMushDir();
        this.refreshBottomToggleState();
        this.refreshContentVisible();
        this.refreshListBar();
        this.RefreshJackpotTotalLabel();
        this.SendSquidData(0);
        this.RequestRoomers();
        // 观众数据已内嵌在 Roomers 响应的 observersList 中，Protocol_Holdem_Observers 未在 ProtocolMap 注册，无需单独请求
    }

    async UpdateViewList(RoomersData: any) {
        this._lastRoomersData = RoomersData;
        this.buildPlayerLists(RoomersData);
        this.refreshCurrentDataList();
        this.showPublicArea(RoomersData);
        const anyResp: any = RoomersData as any;
        if (anyResp.observersList) {
            this.UpdateObViewList(anyResp);
        } else {
            this.UpdateObViewList({ observersList: [] });
        }
        if (GameCache.Instance.origin_type == 4) {
            let result: any = await UIClubModel.mInstance.WebOrgFriendRoomList(false).catch(content => {
                console.log(`>> catch error:${WebOrgFriendRoomList.API}`, content);
            });
            if (!result) return;
            let data: any = WebOrgFriendRoomList.Response.data;
            data.records.forEach((item: { rid: number; start_time: string; play_duration: number }) => {
                if (item.rid == GameCache.Instance.room_id) {
                    if (item.start_time == null) {
                        return;
                    }
                    let deadLineTime = TimeHelper.RFC3339TimeConvertToUTCTime(item.start_time);
                    let roomLeftTime = deadLineTime / 1000 + item.play_duration - new Date().getTime() / 1000;
                    if (roomLeftTime > 0) {
                        this.mRoomLeaveTime = roomLeftTime;
                        if (this.remainTimeLabel) this.remainTimeLabel.string = TimeHelper.ShowRemainingSemicolon(this.mRoomLeaveTime);
                        this.ShowLeaveTimer();
                    }
                }
            });
        } else {
            // let parms = {
            //     name: "",
            //     ante_min: 0,
            //     ante_max: 0,
            //     sb_min: 10,
            //     sb_max: 100000,
            //     tribe_id: 0,
            //     start_time_s: 0,
            //     start_time_e: 0,
            //     enter_time_s: 0,
            //     enter_time_e: 0,
            //     game_type: [],
            //     poker_type: [0, 2],
            //     limit_bet_type: [],
            //     order: ["sb_asc"],
            // }
            // UIClubModel.mInstance.WebOrgClubRoom(parms).then((roomsInfoData: any) => {
            //     roomsInfoData.data.records.forEach(item => {
            //         if (item.rid == GameCache.Instance.room_id) {
            //             if (item.start_time == null) {
            //                 return;
            //             }
            //             let deadLineTime = TimeHelper.RFC3339TimeConvertToUTCTime(item.start_time)
            //             let roomLeftTime = deadLineTime / 1000 + item.play_duration - new Date().getTime() / 1000
            //             if (roomLeftTime > 0) {
            //                 this.mRoomLeaveTime = roomLeftTime;
            //                 let textTitle = this.getChildNodeOrComponent('Text_Time').getComponent(cc.Label);
            //                 textTitle.string = TimeHelper.ShowRemainingSemicolon2(this.mRoomLeaveTime);
            //                 this.ShowLeaveTimer();
            //             }
            //         }
            //     })
            // })
        }
    }

    async UpdateObViewList(RoomersData: any) {
        if (!RoomersData || !RoomersData.observersList) {
            if (this.people_content) this.people_content.removeAllChildren();
            if (this.peopelNum) this.peopelNum.string = '0';
            return;
        }
        if (!this.people_content || !this.peopelNum) return;
        this.people_content.removeAllChildren();
        this.peopelNum.string = `${RoomersData.observersList.length}`;
        for (let index = 0; index < RoomersData.observersList.length; index++) {
            let tItem: cc.Node = cc.instantiate(this.peopleItem);
            tItem.parent = this.people_content;
            let nick_name = StringHelper.LengthNick(RoomersData.observersList[index].name);
            const nameNode = tItem.getChildByName('Text_Name');
            if (nameNode) {
                const nameLbl = nameNode.getComponent(cc.Label);
                if (nameLbl) nameLbl.string = nick_name;
            }
            let icon = tItem.getChildByName('icon');
            WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), RoomersData.observersList[index].avatar);
            const uid = RoomersData.observersList[index].userRid;
            if (!RoomersData.observersList[index].isOnline && GameCache.Instance.origin_type == 4) {
                tItem.opacity = 50;
            } else {
                tItem.opacity = 255;
            }
            this.bindClick(tItem, () => {
                UIComponent.open(UIDefine.UITexasReportPlayerInfo, [uid, false, null]);
            });
        }
    }

    private buildPlayerLists(RoomersData: any): void {
        this.tInfo_0 = [];
        this.tInfo_1 = [];
        const playersList = RoomersData?.playersList || [];
        this.clearPlayerListContainers();
        for (let i = 0; i < playersList.length; i++) {
            const p = playersList[i];
            if (this._isShowOnlyTablePlayers && !this.isOnTable(p.userRid)) {
                continue;
            }
            let tSignPlayer = new ReportPlayer();
            tSignPlayer.userId = p.userRid;
            tSignPlayer.nickName = p.name;
            tSignPlayer.hand = p.handNum;
            tSignPlayer.bringIn = p.bringInTotal;
            // Unity: _win = Win + StoreChips（藏钱计入实时盈亏）
            tSignPlayer.score = (p.win || 0) + (p.storeChips || 0);
            tSignPlayer.storeChips = p.storeChips || 0;
            // Unity: _poolRate = PoolCount * 1000 / HandNum
            const handNum = p.handNum || 0;
            tSignPlayer.poolRate = handNum > 0 ? Math.floor(((p.poolCount || 0) * 1000) / handNum) : 0;
            tSignPlayer.isOnline = p.isOnline;
            tSignPlayer.deposit = p.deposit || 0;
            tSignPlayer.mushroomCount = p.mushroomCount || 0;
            tSignPlayer.mushroomAmount = p.mushroomAmount || 0;
            tSignPlayer.squidInTotal = p.squidInTotal || 0;
            tSignPlayer.squidOutTotal = p.squidOutTotal || 0;
            tSignPlayer.squidPunishTotal = p.squidPunishTotal || 0;
            if (p.isOnline !== false) {
                this.tInfo_0.push(tSignPlayer);
            } else {
                this.tInfo_1.push(tSignPlayer);
            }
        }
        this.tInfo_0.sort((x, y) => Number(y.score || 0) - Number(x.score || 0));
        this.tInfo_1.sort((x, y) => Number(y.score || 0) - Number(x.score || 0));
    }

    private isOnTable(userId: number): boolean {
        return GameCache.Instance.CurGame?.GetSeatByUserId(userId) != null;
    }

    private onToggleShowTablePlayers(): void {
        this._isShowOnlyTablePlayers = !this._isShowOnlyTablePlayers;
        this.refreshTablePlayerToggle();
        // Unity: 筛选为客户端行为，直接用缓存数据重新过滤，无需网络请求
        const cached = UITexasReportComponent._roomersCache.get(GameCache.Instance.room_id);
        if (cached) {
            this.buildPlayerLists(cached);
            this.refreshCurrentDataList();
        } else {
            this.RequestRoomers();
        }
    }

    private refreshTablePlayerToggle(): void {
        if (this.checkboxOnNode) this.checkboxOnNode.active = this._isShowOnlyTablePlayers;
        if (this.checkboxOffNode) this.checkboxOffNode.active = !this._isShowOnlyTablePlayers;
    }

    private showPublicArea(data: any): void {
        const totalPot = Number(data.totalPot || 0);
        const totalBringin = Number(data.totalBringin || 0);
        const totalHand = Number(data.totalHand || 0);
        const insurance = Number(data.insurance || 0);
        const startTime = Number(data.startTime || 0);
        if (this.totalMoneyLabel) {
            this.totalMoneyLabel.string = `${i18nMgr.Get('UISituationTotalPot')} ${StringHelper.GetLongString(totalPot)}`;
        }
        if (this.totalBringLabel) {
            this.totalBringLabel.string = `${i18nMgr.Get('UISituationTotalBringIn')} ${StringHelper.GetLongString(totalBringin)}`;
        }
        if (this.curHandLabel) {
            this.curHandLabel.string = `${i18nMgr.Get('UISituationCurHandNum')} ${totalHand}`;
        }
        if (this.verBottomLabel) {
            const avgStr =
                totalHand > 0
                    ? (() => {
                          const avg = totalPot / totalHand / 100;
                          return Number.isInteger(avg) ? `${avg}` : avg.toFixed(2);
                      })()
                    : '0';
            this.verBottomLabel.string = `${i18nMgr.Get('UISituationVerBottom')} ${avgStr}`;
        }
        const playDuration = GameCache.Instance._roomDurationTime;
        if (this.curTimeLabel) {
            this.curTimeLabel.string = `${i18nMgr.Get('UISituationCurTime')} ${this.formatRoomDuration(playDuration)}`;
        }
        if (this.remainTimeLabel) {
            if (playDuration > 0 && startTime > 0) {
                const useTime = Math.floor(Date.now() / 1000) - startTime;
                const remainTime = Math.max(0, playDuration - useTime);
                this.remainTimeLabel.string = TimeHelper.ShowRemainingSemicolon(remainTime);
            } else {
                this.remainTimeLabel.string = '--:--:--';
            }
        }
        if (this.insurancePoolLabel) {
            this.insurancePoolLabel.string = `${i18nMgr.Get('UITexasHistory_insurance')} ${StringHelper.GetLongString(insurance)}`;
        }
    }

    private formatRoomDuration(seconds: number): string {
        if (seconds <= 0) return '--';
        if (seconds < 3600) {
            const minutes = Math.round(seconds / 60);
            const tpl = i18nMgr.Get('UITexasReport_Text_MatchZmsysj');
            return tpl ? tpl.replace('{0}', `${minutes}`) : `${minutes}min`;
        }
        const h = Math.floor(seconds / 3600);
        const m = Math.round((seconds % 3600) / 60);
        return m > 0 ? `${h}h${m}min` : `${h}h`;
    }

    ShowLeaveTimer() {
        this.schedule(() => {
            if (this.mRoomLeaveTime >= 0 && this.node.isValid) {
                this.mRoomLeaveTime--;
                if (this.remainTimeLabel) this.remainTimeLabel.string = TimeHelper.ShowRemainingSemicolon(this.mRoomLeaveTime);
            } else {
                if (this.remainTimeLabel) this.remainTimeLabel.string = '00:00:00';
            }
        }, 1);
    }

    setInfos(objTemp: cc.Node, pDto: ReportPlayer, onLine: boolean) {
        const info1 = objTemp.getChildByName('item_info1');
        const info3 = objTemp.getChildByName('item_info3');
        const subType = this.reportSubType;
        const useInfo3 = subType !== 'none';
        if (info1) info1.active = !useInfo3;
        if (info3) info3.active = useInfo3;
        const ele = useInfo3 ? info3 : info1;
        if (!ele) {
            return;
        }
        // let color = cc.color().fromHEX('#7187FF')
        // let opactiy = 255
        // if (!pDto.isOnline && GameCache.Instance.origin_type == 4) {
        //     color = cc.color().fromHEX('#FFFFFF')
        //     opactiy = 255 * 0.2
        //     objTemp.getChildByName('Text_Count').color = color
        //     objTemp.getChildByName('Text_Count').opactiy = opactiy
        // }
        // else {
        //     if (pDto.userId == GameCache.Instance.nUserId) {
        //         color = cc.color().fromHEX('#7187FF')
        //     } else {
        //         color = cc.color().fromHEX('#EEF5FF')
        //     }
        //     objTemp.getChildByName('Text_Count').color = pDto.score >= 0 ? cc.color().fromHEX('#B0FFAE') : cc.color().fromHEX('#FF7C7C')
        //     objTemp.getChildByName('Text_Count').opactiy = opactiy
        // }
        // objTemp.getChildByName('Text_Name').color = color
        // objTemp.getChildByName('Text_Num').color = color
        // objTemp.getChildByName('Text_All').color = color
        // objTemp.getChildByName('Text_All1').color = color
        // objTemp.getChildByName('Text_Name').opactiy = opactiy
        // objTemp.getChildByName('Text_Num').opactiy = opactiy
        // objTemp.getChildByName('Text_All').opactiy = opactiy
        // objTemp.getChildByName('Text_All1').opactiy = opactiy
        const atTable = this.isOnTable(pDto.userId);
        if (!atTable || (!pDto.isOnline && GameCache.Instance.origin_type == 4)) {
            ele.opacity = 150;
        } else {
            ele.opacity = 255;
        }
        const textAllCol = ele.getChildByName('Text_All_Col');
        ele.getChildByName('Text_Name').getComponent(cc.Label).string = StringHelper.LengthNick(pDto.nickName);
        ele.getChildByName('Text_Num').getComponent(cc.Label).string = pDto.hand + '';
        textAllCol.getChildByName('Text_All').getComponent(cc.Label).string = StringHelper.GetLongString(pDto.bringIn);
        // Unity: bugin/Text_outChip 显示藏钱(storeChips)，非零时才显示
        const storeChipsStr = pDto.storeChips ? StringHelper.GetLongString(pDto.storeChips) : '';
        const textAll1Node = textAllCol.getChildByName('Text_All1');
        const textAll1Label = textAll1Node ? textAll1Node.getComponent(cc.Label) : null;
        if (storeChipsStr) {
            if (textAll1Label) textAll1Label.string = `(${storeChipsStr})`;
            if (textAll1Node) textAll1Node.active = true;
        } else {
            if (textAll1Label) textAll1Label.string = '';
            // 无藏钱时收起第二行：竖直 Layout(RESIZE_CONTAINER) 会把“带入”值居中，与其他列底边对齐
            if (textAll1Node) textAll1Node.active = false;
        }
        const allColLayout = textAllCol.getComponent(cc.Layout);
        if (allColLayout && (allColLayout as any).updateLayout) (allColLayout as any).updateLayout();
        this.setCountText(ele.getChildByName('Text_Count'), pDto.score);
        // Unity: Text_Pool 显示入池率，poolRate/10 = 百分比
        const poolNode = ele.getChildByName('Text_Pool');
        if (poolNode) {
            const poolLabel = poolNode.getComponent(cc.Label);
            if (poolLabel) {
                poolLabel.string = `(${(pDto.poolRate / 10).toFixed(1)}%)`;
            }
        }
        if (useInfo3) {
            const depositLabel = ele.getChildByName('Text_Deposit')?.getComponent(cc.Label);
            if (depositLabel) depositLabel.string = StringHelper.GetLongString(pDto.deposit || 0);
            this.applyMushSquidInfo(ele, subType, pDto);
        }
        ele.getChildByName('own').active = pDto.userId == GameCache.Instance.nUserId;
        this.styleReportRow(ele);
    }

    /** 行内文字加粗、变亮、统一字号（积分列由 setCountText 着色，此处不覆盖颜色） */
    private styleReportRow(ele: cc.Node): void {
        if (!ele) return;
        this._boldBrightLabel(ele.getChildByName('Text_Name'));
        this._boldBrightLabel(ele.getChildByName('Text_Num'));
        this._boldBrightLabel(ele.getChildByName('Text_Pool'));
        this._boldBrightLabel(ele.getChildByName('Text_Deposit'));
        const col = ele.getChildByName('Text_All_Col');
        if (col) {
            this._boldBrightLabel(col.getChildByName('Text_All'));
            this._boldBrightLabel(col.getChildByName('Text_All1'));
        }
    }

    private _boldBrightLabel(node: cc.Node): void {
        if (!node) return;
        const lab = node.getComponent(cc.Label);
        if (!lab) return;
        (lab as any).enableBold = true;     // 加粗（Inter TTF 支持）
        lab.fontSize = 43;                   // 与其他列统一字号，底边对齐
        lab.lineHeight = 43;
        node.color = cc.Color.WHITE;         // 更亮的纯白
    }

    btnShowProblemClick() {
        this.manualClose = true;
        GameCache.Instance.CurGame?.SetReportKeepOpen?.(false);
        UIComponent.close(this.UIDefine);
        UIComponent.open(UIDefine.UITexasRule, null, { parentUI: this.node.parent });
    }

    imageMaskCloseClick() {
        this.unscheduleAllCallbacks();
        this.manualClose = true;
        GameCache.Instance.CurGame?.SetReportKeepOpen?.(false);
        UIComponent.close(this.UIDefine);
    }

    onClose(param?: any): void {
        super.onClose(param);
        const game: any = GameCache.Instance.CurGame;
        const shouldRestore = !this.manualClose && !!game && !game.IsDispose && !!game.IsReportKeepOpen?.();
        this.manualClose = false;
        if (!shouldRestore) return;
        setTimeout(() => {
            if (!cc.isValid(this.node)) return;
            UIComponent.open(UIDefine.UITexasReportComponent, { __keepState: true }, { parentUI: Main.Dialog });
        }, 0);
    }

    private clearView(): void {
        this.tInfo_0 = [];
        this.tInfo_1 = [];
        this.squidRoundDic.clear();
        this.jackpotRecords = [];
        this.insuranceRecords = [];
        this.squidTotalRound = 0;
        this.squidCurRound = 0;
        this.squidStartHand = 0;
        this.squidEndHand = 0;
        this.isSquidListInit = false;
        this.isJackpotListInit = false;
        this.isInsuranceListInit = false;
        this.clearPlayerListContainers();
        if (this.people_content) this.people_content.removeAllChildren();
        if (this.peopelNum) this.peopelNum.string = '0';
        this.updateNoDataState();
        this.UpdatePageTxt();
    }

    /** 列表头样式（更大、加粗、纯白、底边对齐）只需应用一次 */
    private _headerStyled: boolean = false;

    /**
     * 统一美化所有表头列标题：字体更大、加粗、纯白更亮、底边对齐到同一水平线。
     * 资源/预制改动在本项目构建里不一定重新导入，故用代码处理。
     */
    private styleReportHeaders(): void {
        if (this._headerStyled) return;
        const bars = [
            this.listBar1, this.listBar3, this.listBarSquid,
            this.listBarMushRoom, this.listBarJackpot, this.listBar4
        ];
        let any = false;
        bars.forEach(bar => { if (this.styleHeaderBar(bar)) any = true; });
        if (any) this._headerStyled = true;
    }

    private styleHeaderBar(bar: cc.Node): boolean {
        if (!bar) return false;
        const FS = 46;
        let baseY: number = null;
        let styled = false;
        bar.children.forEach(ch => {
            const lab = ch.getComponent(cc.Label);
            if (!lab) return;
            lab.fontSize = FS;
            lab.lineHeight = FS;
            (lab as any).enableBold = true;            // TTF 真加粗
            lab.verticalAlign = cc.Label.VerticalAlign.CENTER;
            ch.color = cc.Color.WHITE;                 // 更亮的纯白
            ch.opacity = 255;
            ch.setAnchorPoint(ch.anchorX, 0.5);
            // 底边对齐：所有列标题统一到同一 y（同字号 + 同 y + 居中 = 底边同线）
            if (baseY === null) baseY = ch.y; else ch.y = baseY;
            // 细描边增强清晰度/厚度
            let ol = ch.getComponent(cc.LabelOutline);
            if (!ol) ol = ch.addComponent(cc.LabelOutline);
            ol.color = cc.color(255, 255, 255, 255);
            ol.width = 1;
            styled = true;
        });
        return styled;
    }

    private refreshListBar(): void {
        this.styleReportHeaders();
        const subType = this.reportSubType;
        if (this.listBar1) this.listBar1.active = false;
        if (this.listBar3) this.listBar3.active = false;
        if (this.listBarSquid) this.listBarSquid.active = false;
        if (this.listBarMushRoom) this.listBarMushRoom.active = false;
        if (this.listBarJackpot) this.listBarJackpot.active = false;
        if (this.listBar4) this.listBar4.active = false;
        if (this.curBottomTab === 'battle') {
            const useBar3 = subType !== 'none';
            if (this.listBar1) this.listBar1.active = !useBar3;
            if (this.listBar3) this.listBar3.active = useBar3;
        } else if (this.curBottomTab === 'insurance') {
            if (this.listBar4) this.listBar4.active = true;
        } else if (this.curBottomTab === 'mode') {
            if (subType === 'squid' && this.listBarSquid) this.listBarSquid.active = true;
            if (subType === 'mush' && this.listBarMushRoom) this.listBarMushRoom.active = true;
        } else if (this.curBottomTab === 'jackpot') {
            if (this.listBarJackpot) {
                this.listBarJackpot.active = true;
            } else if (this.listBar1) {
                this.listBar1.active = true;
            }
        }
        if (this.listBar3ModeLabel) {
            this.listBar3ModeLabel.string = subType === 'squid' ? i18nMgr.Get('UISquid') : i18nMgr.Get('UIMush');
        }
        this.updateInsurancePill(this.curBottomTab === 'insurance');
    }

    /**
     * 代码生成 Figma(58:109729) 的“Insurance”药丸标题，浮在数据卡片左上角。
     * 资源相关改动在该项目构建里不一定会重新导入，故纯代码绘制（cc.Graphics）。
     */
    private updateInsurancePill(show: boolean): void {
        // 卡片节点：ListBar4 -> header -> dataList
        const card = this.listBar4 && this.listBar4.parent ? this.listBar4.parent.parent : null;
        if (!card) return;
        if (!this.insurancePillNode || !this.insurancePillNode.isValid) {
            const cardW = card.width || 1100;
            const scale = cardW / 328; // Figma 卡片宽 328
            const pillW = Math.round(113 * scale);
            const pillH = Math.round(30 * scale);
            const radius = pillH / 2;

            const pill = new cc.Node('InsurancePill');
            pill.setAnchorPoint(0, 0);
            // 卡片锚点(0.5,1)：左上角 = (-cardW/2, 0)
            pill.setPosition(-cardW / 2 + Math.round(10 * scale), Math.round(4 * scale));
            card.addChild(pill);

            const g = pill.addComponent(cc.Graphics);
            g.roundRect(0, 0, pillW, pillH, radius);
            g.fillColor = cc.color(255, 255, 255, 70); // 白 ~27%
            g.fill();

            // 绿色对勾圆点（独立节点，避免与药丸底色共用同一路径被重新填充）
            const dotR = Math.round(7 * scale);
            const dotCx = radius;
            const dotCy = pillH / 2;
            const dotNode = new cc.Node('dot');
            dotNode.setAnchorPoint(0.5, 0.5);
            dotNode.setPosition(dotCx, dotCy);
            pill.addChild(dotNode);
            const dg = dotNode.addComponent(cc.Graphics);
            dg.circle(0, 0, dotR);
            dg.fillColor = cc.color(120, 228, 144, 255);
            dg.fill();

            const txtNode = new cc.Node('label');
            txtNode.setAnchorPoint(0, 0.5);
            txtNode.setPosition(radius + dotR + Math.round(6 * scale), pillH / 2);
            pill.addChild(txtNode);
            const lab = txtNode.addComponent(cc.Label);
            lab.string = 'Insurance';
            lab.fontSize = Math.round(16 * scale);
            lab.lineHeight = Math.round(16 * scale);
            lab.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            lab.verticalAlign = cc.Label.VerticalAlign.CENTER;
            txtNode.color = cc.Color.BLACK.fromHEX('#F9F9F9');

            this.insurancePillNode = pill;
        }
        if (this.insurancePillNode) this.insurancePillNode.active = show;
    }

    private onClickBottomToggle(tab: ReportBottomTab): void {
        this.reportSubType = this.resolveReportSubType();
        if (tab === 'insurance' && !this.isInsuranceEnabled()) {
            return;
        }
        if (tab === 'mode' && this.reportSubType === 'none') {
            return;
        }
        if (tab === 'jackpot' && !this.isJackpotEnabled()) {
            return;
        }
        if (this.curBottomTab === tab) {
            return;
        }
        this.curBottomTab = tab;
        this.refreshBottomToggleState();
        this.refreshContentVisible();
        this.refreshListBar();
        this.refreshCurrentDataList();
        if (this.curBottomTab === 'mode' && this.getCurrentSquidRecords().length <= 0) {
            this.SendSquidData(this.squidCurRound || 0);
            return;
        }
        if (this.curBottomTab === 'jackpot') {
            this.RequestJackpotSummary();
        }
        if (this.curBottomTab === 'insurance' && !this.isInsuranceListInit) {
            this.RequestInsuranceData();
        }
    }

    private refreshBottomToggleState(): void {
        this.reportSubType = this.resolveReportSubType();
        this.refreshMushDir();
        const showModeToggle = this.reportSubType !== 'none';
        const showJackpotToggle = this.isJackpotEnabled();
        const showInsuranceToggle = this.isInsuranceEnabled();
        const showBottomToggle = showModeToggle || showJackpotToggle || showInsuranceToggle;
        this.refreshModeToggleTitle();
        if (this.bottomToggleRoot) this.bottomToggleRoot.active = showBottomToggle;
        if (this.battleToggleBtn) this.battleToggleBtn.active = showBottomToggle;
        if (this.squidToggleBtn) this.squidToggleBtn.active = showModeToggle;
        if (this.baoxianToggleBtn) this.baoxianToggleBtn.active = showInsuranceToggle;
        if (this.jackpotToggleBtn) this.jackpotToggleBtn.active = showJackpotToggle;
        if (!showBottomToggle) {
            this.curBottomTab = 'battle';
        } else if (this.curBottomTab === 'mode' && !showModeToggle) {
            this.curBottomTab = 'battle';
        } else if (this.curBottomTab === 'jackpot' && !showJackpotToggle) {
            this.curBottomTab = showModeToggle ? 'mode' : 'battle';
        } else if (this.curBottomTab === 'insurance' && !showInsuranceToggle) {
            this.curBottomTab = 'battle';
        }
        if (this.battleCheckmark) this.battleCheckmark.active = showBottomToggle && this.curBottomTab === 'battle';
        if (this.baoxianCheckmark) this.baoxianCheckmark.active = showInsuranceToggle && this.curBottomTab === 'insurance';
        if (this.jackpotCheckmark) this.jackpotCheckmark.active = showJackpotToggle && this.curBottomTab === 'jackpot';
        if (this.squidCheckmark) this.squidCheckmark.active = showModeToggle && this.curBottomTab === 'mode';
        // 激活态下划线改为红色（原素材为绿色，染色无法得到纯红，故代码绘制红条）
        this.tintCheckmarkRed(this.battleCheckmark);
        this.tintCheckmarkRed(this.baoxianCheckmark);
        this.tintCheckmarkRed(this.jackpotCheckmark);
        this.tintCheckmarkRed(this.squidCheckmark);
        this.setToggleTextColor(this.battleTextNode, showBottomToggle && this.curBottomTab === 'battle');
        this.setToggleTextColor(this.baoxianTextNode, showInsuranceToggle && this.curBottomTab === 'insurance');
        this.setToggleTextColor(this.jackpotTextNode, showJackpotToggle && this.curBottomTab === 'jackpot');
        this.setToggleTextColor(this.squidTextNode, showModeToggle && this.curBottomTab === 'mode');
    }

    /** 把切换标签的下划线指示器绘制成红色（隐藏原绿色素材，用 Graphics 画红条） */
    private tintCheckmarkRed(node: cc.Node): void {
        if (!node) return;
        const sp = node.getComponent(cc.Sprite);
        if (sp) sp.enabled = false;
        if (node.getChildByName('__redline')) return;
        const line = new cc.Node('__redline');
        line.setAnchorPoint(0.5, 0.5);
        line.setPosition(0, 0);
        node.addChild(line);
        const g = line.addComponent(cc.Graphics);
        const w = node.width || 160;
        const h = node.height || 10;
        g.roundRect(-w / 2, -h / 2, w, h, h / 2);
        g.fillColor = cc.color(250, 43, 75, 255); // #FA2B4B
        g.fill();
    }

    private refreshModeToggleTitle(): void {
        if (!this.squidTextNode) return;
        const key = this.reportSubType === 'mush' ? 'UITexasReport_MushRoomRecord' : 'UITexasReport_SquidRecord';
        const i18nComp = this.squidTextNode.getComponent(i18nLabel);
        if (i18nComp) {
            i18nComp.i18NString = key;
            return;
        }
        const label = this.squidTextNode.getComponent(cc.Label);
        if (label) {
            label.string = i18nMgr.Get(key);
        }
    }

    private refreshContentVisible(): void {
        const isBattle = this.curBottomTab === 'battle';
        const isInsurance = this.curBottomTab === 'insurance';
        const isJackpot = this.curBottomTab === 'jackpot';
        const isMode = this.curBottomTab === 'mode';
        if (this.reportScrow) this.reportScrow.active = isBattle || isInsurance;
        if (this.jackpotListView) this.jackpotListView.active = isJackpot;
        if (this.jackpotBarNode) this.jackpotBarNode.active = isJackpot;
        if (this.squidListView) this.squidListView.active = isMode && this.reportSubType === 'squid';
        if (this.mushRoomListView) this.mushRoomListView.active = isMode && this.reportSubType === 'mush';
        const showPage = isMode && this.squidTotalRound > 0;
        if (this.pageInfoNode) this.pageInfoNode.active = showPage;
        if (this.squidRoundNode) this.squidRoundNode.active = showPage;
        this.refreshBottomAreaOffset();
        if (isJackpot) this.RefreshJackpotTotalLabel();
        this.updateNoDataState();
    }

    private refreshBottomAreaOffset(): void {
        const isJackpot = this.curBottomTab === 'jackpot';
        const deltaY = isJackpot ? this.jackpotReportY - this.normalReportY : 0;
        if (this.peopleNode) this.peopleNode.y = this.normalPeopleNodeY + deltaY;
        if (this.peopleScrow) this.peopleScrow.y = this.normalPeopleScrowY + deltaY;
        if (this.noDataNode) this.noDataNode.y = this.normalNoDataY + deltaY;
    }

    /**
     * 对应 Unity UIGameplaySituationComponent.RefreshSituationData。
     * Winner 结算后由 GGEvent.SituationRefresh 事件触发，面板开着时刷新各列表。
     */
    private onSituationRefresh(_response: any): void {
        this.refreshSituationData();
    }

    private refreshSituationData(): void {
        const roomId = GameCache.Instance.room_id;
        const cached = UITexasReportComponent._roomersCache.get(roomId);
        if (!cached) return;
        // Unity: UpdateUpViewList — 刷新主玩家列表（reportScrow）
        this.buildPlayerLists(cached);
        this.showPublicArea(cached);
        this.refreshCurrentDataList();
        // Unity: InitJackpotSuperView — 如果 jackpot tab 处于激活状态则刷新
        if (this.curBottomTab === 'jackpot' && this.isJackpotListInit) {
            this.UpdateJackpotViewList();
        }
    }

    private refreshCurrentDataList(): void {
        if (this.curBottomTab === 'mode') {
            this.UpdateSquidViewList();
            return;
        }
        if (this.curBottomTab === 'jackpot') {
            this.UpdateJackpotViewList();
            return;
        }
        if (this.curBottomTab === 'insurance') {
            this.UpdateInsuranceViewList();
            return;
        }
        const content = this.getCurrentDataContent();
        if (!content) {
            return;
        }
        content.removeAllChildren();
        for (let index = 0; index < this.tInfo_0.length; index++) {
            const element: cc.Node = cc.instantiate(this.dataItem);
            element.parent = content;
            this.setInfos(element, this.tInfo_0[index], true);
        }
        for (let index = 0; index < this.tInfo_1.length; index++) {
            const element: cc.Node = cc.instantiate(this.dataItem);
            element.parent = content;
            this.setInfos(element, this.tInfo_1[index], false);
        }
    }

    private getCurrentDataContent(): cc.Node {
        if (this.curBottomTab === 'battle') {
            return this.battle_data_content;
        }
        if (this.curBottomTab === 'insurance') {
            return this.battle_data_content;
        }
        if (this.curBottomTab === 'jackpot') {
            return this.jackpot_data_content;
        }
        if (this.reportSubType === 'squid') {
            return this.squid_data_content;
        }
        if (this.reportSubType === 'mush') {
            return this.mush_data_content;
        }
        return this.battle_data_content;
    }

    private clearPlayerListContainers(): void {
        if (this.battle_data_content) this.battle_data_content.removeAllChildren();
        if (this.squid_data_content) this.squid_data_content.removeAllChildren();
        if (this.mush_data_content) this.mush_data_content.removeAllChildren();
        if (this.jackpot_data_content) this.jackpot_data_content.removeAllChildren();
    }

    private getCurrentSquidRecords(): SquidOrMushRecord[] {
        if (this.squidCurRound > 0 && this.squidRoundDic.has(this.squidCurRound)) {
            return this.squidRoundDic.get(this.squidCurRound) || [];
        }
        return [];
    }

    private onClickPage(next: boolean): void {
        if (this.squidTotalRound <= 0) return;
        let nextRound = this.squidCurRound > 0 ? this.squidCurRound : this.squidTotalRound;
        nextRound = next ? nextRound + 1 : nextRound - 1;
        if (nextRound > this.squidTotalRound) nextRound = 1;
        if (nextRound < 1) nextRound = this.squidTotalRound;
        this.squidCurRound = nextRound;
        if (this.sliderPlus) {
            this.sliderPlus.value = nextRound;
            this.syncProgressBlue();
        }
        if (this.squidRoundDic.has(this.squidCurRound)) {
            this.UpdatePageTxt();
            this.UpdateSquidViewList();
        } else {
            this.SendSquidData(this.squidCurRound);
        }
    }

    private SendSquidData(round: number): void {
        const roomId = Number(GameCache.Instance.room_id || 0);
        if (roomId <= 0) return;
        const subType = this.resolveModeRequestSubType();
        if (!subType) return;
        const web_class = subType === 'mush' ? APITexasSituationMushRound : APITexasSituationSquidRound;
        WWW.Instance.CommonAPI({
            web_class,
            api_id: roomId,
            club_id: ClubCache.club_id,
            body: { round },
            juhua: false
        }).then(
            (response: any) => {
                this.InitSquidViewList(response);
            },
            () => {
                this.updateNoDataState();
            }
        );
    }

    private resolveModeRequestSubType(): 'mush' | 'squid' | null {
        const resolved = this.resolveReportSubType();
        if (resolved === 'mush' || resolved === 'squid') return resolved;
        const curGame: any = GameCache.Instance.CurGame;
        const mushOn =
            Number(curGame?.mushroomPool || 0) > 0 ||
            !!curGame?.mushroomEnabled ||
            Number(GameCache.Instance.room_mushroom_mode || 0) > 0 ||
            Number(GameCache.Instance.room_mushroom_base || 0) > 0;
        if (mushOn) return 'mush';
        const squidOn =
            Number(curGame?.squidPool || 0) > 0 ||
            !!curGame?.isGameInSquidRound ||
            !!curGame?.squidEnabled ||
            Number(GameCache.Instance.room_squid_on || 0) > 0 ||
            Number(GameCache.Instance.room_squid_base || 0) > 0 ||
            Number(GameCache.Instance.room_squid_sub_base || 0) > 0;
        if (squidOn) return 'squid';
        return null;
    }

    private InitSquidViewList(response: any): void {
        const data = response?.data;
        if (!data) {
            this.updateNoDataState();
            return;
        }
        const total = Number(data.total || 0);
        const round = Number(data.round || 0);
        const records: SquidOrMushRecord[] = (data.records || []) as SquidOrMushRecord[];
        this.squidTotalRound = total;
        this.squidStartHand = Number(data.start_hand || 0);
        this.squidEndHand = Number(data.end_hand || 0);
        if (this.squidCurRound === 0) {
            this.squidCurRound = total > 0 ? total : round > 0 ? round : 1;
        } else if (round > 0) {
            this.squidCurRound = round;
        }
        const saveRound = this.squidCurRound > 0 ? this.squidCurRound : 1;
        this.squidRoundDic.set(saveRound, records);
        this.setupSlider();
        this.UpdatePageTxt();
        this.UpdateSquidViewList();
    }

    private UpdateSquidViewList(): void {
        if (this.curBottomTab !== 'mode') return;
        const content = this.getCurrentDataContent();
        if (!content) return;
        const records = this.getCurrentSquidRecords();
        if (records.length <= 0 && this.squidTotalRound <= 0) {
            if (!this.isSquidListInit) {
                this.SendSquidData(0);
            }
            this.isSquidListInit = true;
            this.updateNoDataState();
            content.removeAllChildren();
            return;
        }
        if (records.length <= 0 && this.squidTotalRound > 0) {
            this.SendSquidData(this.squidCurRound || 1);
            this.updateNoDataState();
            content.removeAllChildren();
            return;
        }
        this.isSquidListInit = true;
        content.removeAllChildren();
        for (let index = 0; index < records.length; index++) {
            const item = this.OnGetSquidItemByIndex(index, records);
            if (item) {
                item.parent = content;
            }
        }
        this.updateNoDataState();
    }

    private OnGetSquidItemByIndex(index: number, records: SquidOrMushRecord[]): cc.Node {
        if (index < 0 || index >= records.length) {
            return null;
        }
        const dto = records[index];
        if (!dto) {
            return null;
        }
        const item: cc.Node = cc.instantiate(this.dataItem);
        const itemInfo1 = item.getChildByName('item_info1');
        const itemInfo3 = item.getChildByName('item_info3');
        const squidNode = item.getChildByName('room_scrollview_sqiud');
        const mushNode = item.getChildByName('room_scrollview_mushRoom');
        if (itemInfo1) itemInfo1.active = false;
        if (itemInfo3) itemInfo3.active = false;
        if (squidNode) squidNode.active = this.reportSubType === 'squid';
        if (mushNode) mushNode.active = this.reportSubType === 'mush';
        if (this.reportSubType === 'squid') {
            this.SetSquidItemInfo(squidNode, dto);
        } else {
            this.SetMushRoomItemInfo(mushNode, dto);
        }
        return item;
    }

    private SetSquidItemInfo(node: cc.Node, dto: SquidOrMushRecord): void {
        if (!node || !dto) return;
        const nameTxt = node.getChildByName('Text_Name')?.getComponent(cc.Label);
        const squidTxtNode = node.getChildByName('Text_Squid');
        const coinTxtNode = node.getChildByName('SelfGo');
        const ownNode = node.getChildByName('own');
        if (nameTxt) nameTxt.string = StringHelper.LengthNick(dto.name || '', 20);
        if (squidTxtNode) {
            const rich = squidTxtNode.getComponent(cc.RichText);
            const label = squidTxtNode.getComponent(cc.Label);
            const text = `${Number(dto.in_num || 0)}`;
            if (rich) rich.string = text;
            if (label) label.string = text;
        }
        const amount = Number(dto.in_amount || 0) !== 0 ? Number(dto.in_amount || 0) : -Math.abs(Number(dto.out_amount || 0));
        this.setSignedText(coinTxtNode, amount);
        if (ownNode) ownNode.active = this.isMySquidRecord(dto);
    }

    private SetMushRoomItemInfo(node: cc.Node, dto: SquidOrMushRecord): void {
        if (!node || !dto) return;
        const nameTxt = node.getChildByName('Text_Name')?.getComponent(cc.Label);
        const inMushTxt = node.getChildByName('in_mush')?.getComponent(cc.Label);
        const inCoinTxtNode = node.getChildByName('in_coin');
        const outMushTxt = node.getChildByName('out_mush')?.getComponent(cc.Label);
        const outCoinTxtNode = node.getChildByName('out_coin');
        const ownNode = node.getChildByName('own');
        if (nameTxt) nameTxt.string = StringHelper.LengthNick(dto.name || '', 20);
        if (outMushTxt) outMushTxt.string = `${Number(dto.out_num || 0)}`;
        if (inMushTxt) inMushTxt.string = Number(dto.in_num || 0) !== 0 ? `${Number(dto.in_num || 0)}` : '-';
        if (Number(dto.in_amount || 0) !== 0) {
            this.setSignedText(inCoinTxtNode, Number(dto.in_amount || 0));
        } else {
            this.setSignedText(inCoinTxtNode, null, '-');
        }
        this.setSignedText(outCoinTxtNode, Number(dto.out_amount || 0));
        if (ownNode) ownNode.active = this.isMySquidRecord(dto);
    }

    private isMySquidRecord(dto: SquidOrMushRecord): boolean {
        const myId = Number(GameCache.Instance.nUserId || 0);
        const myName = `${GameCache.Instance.nick || ''}`;
        const gameAny: any = GameCache.Instance.CurGame;
        const mainName = `${gameAny?.mainPlayer?.nickName || ''}`;
        return (myId > 0 && Number(dto.user_random_id || 0) === myId) || (!!dto.name && (dto.name === myName || dto.name === mainName));
    }

    private UpdatePageTxt(): void {
        const hasData = this.squidTotalRound > 0;
        if (this.pageText) {
            const curRound = this.squidCurRound > 0 ? this.squidCurRound : 0;
            this.pageText.string = `${curRound}/${this.squidTotalRound}`;
        }
        const roundDesc = hasData ? this.formatRoundDesc(this.squidCurRound, this.squidStartHand, this.squidEndHand) : '';
        if (this.squidRoundText) this.squidRoundText.string = roundDesc;
        if (this.pageInfoNode) this.pageInfoNode.active = this.curBottomTab === 'mode' && hasData;
        if (this.squidRoundNode) this.squidRoundNode.active = this.curBottomTab === 'mode' && hasData;
    }

    private formatRoundDesc(round: number, startHand: number, endHand: number): string {
        const template = i18nMgr.Get('UITexasReport_WhichRound');
        return template
            .replace('{0}', `${round || 0}`)
            .replace('{1}', `${startHand || 0}`)
            .replace('{2}', `${endHand || 0}`);
    }

    private updateNoDataState(): void {
        const isMode = this.curBottomTab === 'mode';
        const isJackpot = this.curBottomTab === 'jackpot';
        const isInsurance = this.curBottomTab === 'insurance';
        let noData = false;
        if (isMode) noData = this.getCurrentSquidRecords().length <= 0;
        else if (isJackpot) noData = this.jackpotRecords.length <= 0;
        else if (isInsurance) noData = this.isInsuranceListInit && this.insuranceRecords.length <= 0;
        if (this.noDataNode) this.noDataNode.active = (isMode || isJackpot || isInsurance) && noData;
    }

    private isJackpotEnabled(): boolean {
        const curGame: any = GameCache.Instance.CurGame;
        return Number(curGame?.jackpot || GameCache.Instance.jackPot_on || 0) === 1;
    }

    private isInsuranceEnabled(): boolean {
        return !!GameCache.Instance.insurance;
    }

    private RequestInsuranceData(): void {
        const roomId = Number(GameCache.Instance.room_id || 0);
        if (roomId <= 0) return;
        WWW.Instance.CommonAPI({
            web_class: WebStatsRoomInsuranceData,
            body: { room_id: roomId, limit: 200, offset: 0 },
            club_id: ClubCache.club_id,
            juhua: false
        }).then(
            (response: any) => {
                this.InitInsuranceViewList(response);
            },
            () => {
                this.isInsuranceListInit = true;
                this.updateNoDataState();
            }
        );
    }

    private InitInsuranceViewList(response: any): void {
        this.isInsuranceListInit = true;
        const list: any[] = (response?.data?.list || []) as any[];
        this.insuranceRecords = list.map(item => ({
            userRid: Number(item.user_rid || 0),
            name: `${item.nick_name || ''}`,
            handNum: Number(item.hand_num || 0),
            insurBet: Number(item.insur_bet || 0),
            insurWin: Number(item.insur_win || 0),
            createTime: Number(item.create_time || 0)
        }));
        if (this.curBottomTab === 'insurance') {
            this.UpdateInsuranceViewList();
        }
    }

    private UpdateInsuranceViewList(): void {
        const content = this.battle_data_content;
        if (!content) return;
        content.removeAllChildren();
        if (this.insuranceRecords.length <= 0) {
            this.updateNoDataState();
            return;
        }
        for (let i = 0; i < this.insuranceRecords.length; i++) {
            const item = this.OnGetInsuranceItemByIndex(i);
            if (item) item.parent = content;
        }
        this.updateNoDataState();
    }

    private OnGetInsuranceItemByIndex(index: number): cc.Node {
        if (index < 0 || index >= this.insuranceRecords.length) return null;
        const dto = this.insuranceRecords[index];
        if (!dto) return null;
        const item: cc.Node = cc.instantiate(this.dataItem);
        const itemInfo1 = item.getChildByName('item_info1');
        const itemInfo3 = item.getChildByName('item_info3');
        const squidNode = item.getChildByName('room_scrollview_sqiud');
        const mushNode = item.getChildByName('room_scrollview_mushRoom');
        const jackpotNode = item.getChildByName('room_scrollview_jackpot');
        const insuranceNode = item.getChildByName('room_scrollview_insurance');
        if (itemInfo1) itemInfo1.active = false;
        if (itemInfo3) itemInfo3.active = false;
        if (squidNode) squidNode.active = false;
        if (mushNode) mushNode.active = false;
        if (jackpotNode) jackpotNode.active = false;
        if (insuranceNode) {
            insuranceNode.active = true;
            this.SetInsuranceItemInfo(insuranceNode, dto);
        }
        return item;
    }

    private SetInsuranceItemInfo(node: cc.Node, dto: InsuranceRecord): void {
        if (!node || !dto) return;
        const nameTxt = node.getChildByName('Text_Name')?.getComponent(cc.Label);
        const numTxt = node.getChildByName('Text_Num')?.getComponent(cc.Label);
        const allTxt = node.getChildByName('Text_All')?.getComponent(cc.Label);
        const cardTxtNode = node.getChildByName('Text_Card');
        const ownNode = node.getChildByName('own');
        if (nameTxt) nameTxt.string = StringHelper.LengthNick(dto.name || '', 20);
        // 投保时间：create_time 为秒级时间戳
        if (numTxt) {
            numTxt.string = dto.createTime > 0 ? TimeHelper.TimeToString(dto.createTime * 1000, 'MM/dd HH:mm') : '--';
        }
        // 投保额/Ev
        if (allTxt) allTxt.string = StringHelper.GetLongString(dto.insurBet || 0);
        // 赔付：insur_win * -1 与 Unity 保持一致（服务端以负值表示赔出）
        this.setSignedText(cardTxtNode, -(dto.insurWin || 0));
        if (ownNode) ownNode.active = Number(dto.userRid || 0) === Number(GameCache.Instance.nUserId || 0);
        // Figma(58:109729) 各列之间的竖直分隔线（纯代码绘制）
        this.decorateInsuranceRow(node, [
            node.getChildByName('Text_Name'),
            node.getChildByName('Text_Num'),
            node.getChildByName('Text_All'),
            cardTxtNode
        ]);
    }

    /** 在保险行各相邻列的间隙中点绘制竖直分隔线 */
    private decorateInsuranceRow(node: cc.Node, cols: cc.Node[]): void {
        if (!node) return;
        const valid = (cols || []).filter(c => !!c && c.isValid);
        if (valid.length < 2) return;
        let sep = node.getChildByName('__col_sep');
        let g: cc.Graphics = null;
        if (!sep) {
            sep = new cc.Node('__col_sep');
            sep.setAnchorPoint(0.5, 0.5);
            node.addChild(sep);
            sep.setSiblingIndex(0);
            g = sep.addComponent(cc.Graphics);
        } else {
            g = sep.getComponent(cc.Graphics);
        }
        if (!g) return;
        g.clear();
        g.lineWidth = 2;
        g.strokeColor = cc.color(255, 255, 255, 40);
        const half = 18; // 线高约一行文字
        for (let i = 0; i < valid.length - 1; i++) {
            const a = valid[i];
            const b = valid[i + 1];
            const aRight = a.x + a.width * (1 - a.anchorX);
            const bLeft = b.x - b.width * b.anchorX;
            const x = (aRight + bLeft) / 2;
            g.moveTo(x, half);
            g.lineTo(x, -half);
        }
        g.stroke();
    }

    private RefreshJackpotTotalLabel(): void {
        if (!this.jackpotTotalLabel) return;
        const total = Math.floor(Number(GameCache.Instance.jackPot_parent_gold || 0) / 100);
        this.jackpotTotalLabel.string = `${total}`;
    }

    private UpdateJackpotViewList(): void {
        const content = this.jackpot_data_content;
        if (!content) return;
        content.removeAllChildren();
        if (this.jackpotRecords.length <= 0) {
            this.updateNoDataState();
            return;
        }
        for (let i = 0; i < this.jackpotRecords.length; i++) {
            const item = this.OnGetJackpotItemByIndex(i);
            if (item) item.parent = content;
        }
        this.updateNoDataState();
    }

    private OnGetJackpotItemByIndex(index: number): cc.Node {
        if (index < 0 || index >= this.jackpotRecords.length) return null;
        const dto = this.jackpotRecords[index];
        if (!dto) return null;
        const item: cc.Node = cc.instantiate(this.dataItem);
        const itemInfo1 = item.getChildByName('item_info1');
        const itemInfo3 = item.getChildByName('item_info3');
        const squidNode = item.getChildByName('room_scrollview_sqiud');
        const mushNode = item.getChildByName('room_scrollview_mushRoom');
        const jackpotNode = item.getChildByName('room_scrollview_jackpot');
        if (itemInfo1) itemInfo1.active = !jackpotNode;
        if (itemInfo3) itemInfo3.active = false;
        if (squidNode) squidNode.active = false;
        if (mushNode) mushNode.active = false;
        if (jackpotNode) jackpotNode.active = true;
        if (jackpotNode) {
            this.SetJackpotItemInfo(jackpotNode, dto);
        }
        return item;
    }

    private SetJackpotItemInfo(node: cc.Node, dto: JackpotRecord): void {
        if (!node || !dto) return;
        const nameTxt = node.getChildByName('Text_Name')?.getComponent(cc.Label);
        const numTxt = node.getChildByName('Text_Num')?.getComponent(cc.Label);
        const allTxtNode = node.getChildByName('Text_All');
        const cardTxtNode = node.getChildByName('Text_Card');
        const ownNode = node.getChildByName('own');
        if (nameTxt) nameTxt.string = StringHelper.LengthNick(dto.name || '', 20);
        if (numTxt) numTxt.string = StringHelper.GetLongString(dto.contributeTotal || 0);
        this.setSignedText(allTxtNode, Number(dto.awardTotal || 0));
        this.setCardText(cardTxtNode, this.GetJackpotCardDesc(dto));
        if (ownNode) ownNode.active = Number(dto.userRid || 0) === Number(GameCache.Instance.nUserId || 0);
    }

    private setCardText(node: cc.Node, text: string): void {
        if (!node) return;
        const rich = node.getComponent(cc.RichText);
        if (rich) {
            rich.string = text || '';
            return;
        }
        const label = node.getComponent(cc.Label);
        if (label) {
            label.string = text || '';
        }
    }

    private GetJackpotCardDesc(dto: JackpotRecord): string {
        const list: string[] = [];
        if (Number(dto.royalFlushCount || 0) > 0) {
            list.push(i18nMgr.Get('UIJackPotInfo_huangjia'));
        }
        if (Number(dto.straightFlushCount || 0) > 0) {
            list.push(i18nMgr.Get('UIJackPotInfo_tonghuashun'));
        }
        if (Number(dto.fourOfaKindCount || 0) > 0) {
            list.push(i18nMgr.Get('UIJackPotInfo_shitiao'));
        }
        return list.join('\n');
    }

    private refreshMushDir(): void {
        const isMush = this.reportSubType === 'mush';
        if (this.mushDirNode) this.mushDirNode.active = isMush;
        if (!isMush) return;
        const curGame: any = GameCache.Instance.CurGame;
        const base = Number(curGame?.mushroomBase || GameCache.Instance.room_mushroom_base || 0);
        if (this.mushDirText) {
            const template = i18nMgr.Get('UIMushYaJinDir');
            this.mushDirText.string = StringHelper.Format(template, [StringHelper.GetLongString(base)]);
        }
    }

    private setToggleTextColor(node: cc.Node, selected: boolean): void {
        if (!node) return;
        // 文字统一白色；选中态由红色下划线（Checkmark）区分
        node.color = cc.Color.BLACK.fromHEX('#FFFFFF');
    }

    private setCountText(node: cc.Node, score: number): void {
        if (!node) return;
        const text = StringHelper.GetLongString(score);
        // Figma 配色：正=红 #FA2B4B，负=绿 #78E490
        const color = score > 0 ? '#FA2B4B' : score < 0 ? '#78E490' : '#FFFFFF';
        const rich = node.getComponent(cc.RichText);
        if (rich) {
            rich.string = `<b><color=${color}>${text}</color></b>`;
            return;
        }
        const label = node.getComponent(cc.Label);
        if (label) {
            label.string = text;
            (label as any).enableBold = true;
            label.node.color = cc.Color.BLACK.fromHEX(color);
        }
    }

    private resolveReportSubType(): 'none' | 'mush' | 'squid' {
        const curGame: any = GameCache.Instance.CurGame;
        const mushOn =
            !!curGame?.mushroomEnabled ||
            (curGame?.mushroomBase || 0) > 0 ||
            (GameCache.Instance.room_mushroom_mode || 0) > 0 ||
            (GameCache.Instance.room_mushroom_base || 0) > 0;
        if (mushOn) return 'mush';
        const squidOn =
            !!curGame?.squidEnabled ||
            !!curGame?.isGameInSquidRound ||
            (curGame?.squidBase || 0) > 0 ||
            (GameCache.Instance.room_squid_on || 0) > 0 ||
            (GameCache.Instance.room_squid_base || 0) > 0 ||
            (GameCache.Instance.room_squid_sub_base || 0) > 0;
        if (squidOn) return 'squid';
        return 'none';
    }

    private applyMushSquidInfo(parent: cc.Node, subType: 'none' | 'mush' | 'squid', pDto: ReportPlayer): void {
        const mushNode = parent.getChildByName('mush');
        const squidNode = parent.getChildByName('Text_Squid');
        if (mushNode) mushNode.active = subType === 'mush';
        if (squidNode) squidNode.active = subType === 'squid';
        if (subType === 'mush' && mushNode) {
            const mushNum = mushNode.getChildByName('mushNum')?.getComponent(cc.Label);
            const mushChips = mushNode.getChildByName('mushChips')?.getComponent(cc.Label);
            if (pDto.mushroomAmount > 0) {
                if (mushNum) mushNum.string = '+' + StringHelper.FormatToString('{0:N0}', pDto.mushroomCount || 0);
                if (mushChips) {
                    mushChips.string = `(+${StringHelper.GetLongString(pDto.mushroomAmount || 0)})`;
                    mushChips.node.active = true;
                }
            } else {
                if (mushNum) mushNum.string = '-';
                if (mushChips) mushChips.node.active = false;
            }
        }
        if (subType === 'squid' && squidNode) {
            const net = Number(pDto.squidInTotal || 0) - Number(pDto.squidOutTotal || 0) - Number(pDto.squidPunishTotal || 0);
            this.setSignedText(squidNode, net);
        }
    }

    private setSignedText(node: cc.Node, value: number | null, emptyText: string = null): void {
        if (!node) return;
        if (value == null) {
            const rich = node.getComponent(cc.RichText);
            const label = node.getComponent(cc.Label);
            if (rich) rich.string = emptyText || '';
            if (label) label.string = emptyText || '';
            return;
        }
        const text = StringHelper.GetSignedLongString(value);
        // Figma 配色：正=红 #FA2B4B，负=绿 #78E490
        const color = value > 0 ? '#FA2B4B' : value < 0 ? '#78E490' : '#FFFFFF';
        const rich = node.getComponent(cc.RichText);
        if (rich) {
            rich.string = `<b><color=${color}>${text}</color></b>`;
            return;
        }
        const label = node.getComponent(cc.Label);
        if (label) {
            label.string = text;
            (label as any).enableBold = true;
            label.node.color = cc.Color.BLACK.fromHEX(color);
        }
    }

    private setupSlider(): void {
        if (!this.sliderPlus || this.squidTotalRound <= 0) return;
        this.sliderPlus.show({
            min_value: 1,
            max_value: this.squidTotalRound,
            step: 1,
            change: this.sliderChange,
            touch_end: this.onSliderTouchEnd,
            own: this
        });
        const targetRound = this.squidCurRound > 0 ? this.squidCurRound : this.squidTotalRound;
        this.squidCurRound = targetRound;
        this.sliderPlus.value = targetRound;
        this.syncProgressBlue();
    }

    private sliderChange(value: number): void {
        const round = Math.round(value);
        if (this.squidCurRound === round) return;
        this.squidCurRound = round;
        this.UpdatePageTxt();
        this.syncProgressBlue();
    }

    private onSliderTouchEnd(): void {
        if (this.curBottomTab !== 'mode') return;
        if (this.squidRoundDic.has(this.squidCurRound)) {
            this.UpdateSquidViewList();
        } else {
            this.SendSquidData(this.squidCurRound);
        }
    }

    private syncProgressBlue(): void {
        if (!this.progressBlue || !this.sliderPlus) return;
        const slider = this.sliderPlus;
        const range = slider.data.max_value - slider.data.min_value;
        if (range <= 0) {
            this.progressBlue.width = 0;
            return;
        }
        const k = (slider.value - slider.data.min_value) / range;
        this.progressBlue.width = slider.min + (slider.max - slider.min) * k;
    }
}
