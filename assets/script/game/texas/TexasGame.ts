import { GameConfig } from "../../config/GameConfig";
import TexasConfig from "../../config/TexasConfig";
import { UIDefine } from "../../define/UIDefine";
import DiamondModel from "../../diamond/DiamondModel";
import { DOTween, Sequence } from "../../dotween/DOTween";
import { ClubCache } from "../../frame/data/club/ClubCache";
import GC from "../../frame/GameControl";
import PublicHelper from "../../helper/PublicHelper";
import { StringHelper } from "../../helper/StringHelper";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { i18nMgr } from "../../i18n/i18nMgr";
import { WalletType } from "../../lobby/new_club/wallet/UIWallet";
import Main from "../../Main";
import { APIOrgClubUserInfo, API_CLUB_APPLY_LIST, Web_Org_Club_Search_By_Id, Web_RoomSitApplyRecords, Web_User_Room, Web_User_Room_Bringin, WWW, Web_GetDiamondConfig } from "../../net/https/WebRequest";
import ProtocolAgency from "../../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../../net/websocket/ProtocolCode";
import { Def, RoomInfo } from "../../protobuf/holdem/define_pb";
import { ServerMessageWinner } from "../../protobuf/holdem/recv_th_winner_pb";
import { ClientMessageAction } from "../../protobuf/holdem/req_th_action_pb";
import { ClientMessageAddTime } from "../../protobuf/holdem/req_th_add_time_pb";
import { ClientMessageAgreePost } from "../../protobuf/holdem/req_th_agree_post_pb";
import { ClientMessageBringIn } from "../../protobuf/holdem/req_th_bring_in_pb";
import { ServerMessageEnterRoom } from "../../protobuf/holdem/req_th_enter_room_pb";
import { ClientMessageKeepSeatActive } from "../../protobuf/holdem/req_th_keep_seat_active_pb";
import { ClientMessageSeated } from "../../protobuf/holdem/req_th_seated_pb";
import { ClientMessageSetAutoOnTable } from "../../protobuf/holdem/req_th_set_auto_on_table_pb";
import { ClientMessageShowPublicCards } from "../../protobuf/holdem/req_th_show_public_cards_pb";
import { ClientMessageSquidInActive } from "../../protobuf/holdem/req_th_squid_in_active_pb";
import { ClientMessageStandupActive } from "../../protobuf/holdem/req_th_stand_up_active_pb";
import { ClientMessageStoreChips } from "../../protobuf/holdem/req_th_store_chips_pb";
import GlobalSession from "../../session/GlobalSession";
import LobbySession from "../../session/LobbySession";
import StorageKey from "../../session/StorageKey";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import { UISuperDialogType } from "../../ui/dialog/UISuperDialog";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import TexasGameMessageHandler from "../messageHandler/TexasGameMessageHandler";
import { AddClipsData } from "../new_ui/UIBringIn";
import { HistoryInfoData } from "../new_ui/UITexasHistory";
import TexasGameProtocol from "../protocol/TexasGameProtocol";
import Seat, { SeatUIInfo } from "../seat/Seat";
import UIAutoOperationComponent from "../ui/UIAutoOperationComponent";
import UITexasMenu from "../ui/UITexasMenu";
import GameUtil, { RoomType, some_pos } from "../util/GameUtil";
import TexasGameUtils from "../util/TexasGameUtils";
import TexasGameMushroom from "./TexasGameMushroom";
import TexasGameSquid from "./TexasGameSquid";
import { CardType, CardTypeUtil } from "./../CardTypeUtil";
import { CPlayer } from "./../CPlayer";
import FSMLogicComponent from "./../FSMLogicComponent";
import { GameCache } from "./../GameCache";
import { SeatEmpty, SeatIdle, SeatOperation } from "./../SeatStateHandler";

import { TexasGameState } from "./../TexasGameState";

import TexasSMAgency from "./../TexasSMAgency";
import UIOperationComponent, { OperationData } from "./../ui/UIOperationComponent";
import UITexas, { PotInfo, PublicCardInfo } from "./../UITexas";
import { UITexasModel } from "./../UITexasModel";
//const PBTypes = Def.Types;

class SeatMoveStruct {

    //SeatMove?, PlayDealFunc?, ShowCardsSeat?, StartInfo, Count 

    //移动中
    public moving: boolean;
    //移动完成个数
    public move_cp_count: number;

    //this func param id标记 id flag
    public cacheFuncs: { a?, b?, c?, d?}[] = null;

    constructor() {
        this.reset();
    }
    reset() {
        this.moving = false;
        this.move_cp_count = 0;
        this.cacheFuncs = [];
    }
}

export default class TexasGame {
    protected Seat_Cls = Seat;
    //座位UI节点缓存池
    private seatUI_pool: cc.Node[] = [];
    private mushroomFeature: TexasGameMushroom = null;
    private squidFeature: TexasGameSquid = null;
    ///////////////////////////////
    private setting = {
        deskType: null,
        pokerType: null,
    };
    //判断是否比赛
    public isMTT: boolean = false;

    public IsLookOn: boolean = false;

    //ui界面类的引用
    public uirc: UITexas = null;

    public TexasGameMessageHandler: TexasGameMessageHandler = null;

    public TexasGameProtocol: TexasGameProtocol = null;

    public GameLogicSMComponent: FSMLogicComponent = null;

    public SMAgency: TexasSMAgency = null;

    public TexasGameUtils: TexasGameUtils = null;

    public listSeat: Seat[] = null;

    public GameState: TexasGameState = null;

    //PlayDeal_TweenSequence: TweenSequence = new TweenSequence;

    /// <summary>
    /// 可以通过方位id获取seat
    /// </summary>
    protected dicSeatOnlyClient: Map<number, Seat> = null;

    /// <summary>
    /// 当前游戏状态，0:倒计时中 1:游戏中 -2:等待开局 -1:其他状态
    /// </summary>
    public gamestatus: number = 0;
    /// <summary>
    /// 大盲所在位置
    /// </summary>
    public bigIndex: number = 0;
    /// <summary>
    /// 小盲所在位置
    /// </summary>
    public smallIndex: number = 0;
    /// <summary>
    /// 发牌起始位置（优先使用服务端 dealOrder[0]）
    /// </summary>
    public dealStartIndex: number = -1;
    /// <summary>
    /// 庄家所在位置
    /// </summary>
    public bankerIndex: number = 0;
    /// <summary>
    /// 当前操作玩家所在位置
    /// </summary>
    public operationID: number = -1;
    /// <summary>
    /// 已发出公共牌
    /// </summary>
    //public cards_1: number[] = null;
    /// <summary>
    /// 已发出第二套公共牌
    /// </summary>
    //public cards_2: number[] = null;

    /// <summary>
    /// 大盲
    /// </summary>
    public bigBlind: number = 0;
    /// <summary>
    /// 小盲
    /// </summary>
    public smallBlind: number = 0;
    /// <summary>
    /// 底池数目
    /// </summary>
    public alreadAnte: number = 0;
    /// <summary>
    /// 房间的时间总长度（分钟）
    /// </summary>
    public maxPlayTime: number = 0;
    /** 蘑菇玩法是否开启 */
    public mushroomEnabled: boolean = false;
    /** 一颗蘑菇等于多少筹码 */
    public mushroomBase: number = 0;
    /** 蘑菇模式（押金倍率/参与方式） */
    public mushroomMode: number = 0;
    /** 当前蘑菇池金额 */
    public mushroomPool: number = 0;
    /** 鱿鱼玩法是否开启 */
    public squidEnabled: boolean = false;
    /** 单个鱿鱼价值 */
    public squidBase: number = 0;
    /** 鱿鱼模式（0普通，1血战） */
    public squidMode: number = 0;
    /** 头鱿鱼翻倍开关 */
    public squidHead: number = 0;
    /** 尾鱿鱼翻倍开关 */
    public squidTail: number = 0;
    /** 鱿鱼配置上限（房间配置） */
    public squidMaxCount: number = 0;
    /** 鱿鱼总数上限（血战模式） */
    public squidTotalLimit: number = 0;
    /** 鱿鱼惩罚池 */
    public squidPool: number = 0;
    /** 鱿鱼总轮次配置 */
    public squidRound: number = 0;
    /** 当前鱿鱼轮次（从0开始） */
    public squidCurrentRound: number = 0;
    /** 鱿鱼开启人数配置 */
    public squidOpenNumber: number = 0;
    /** 鱿鱼押金 */
    public squidDeposit: number = 0;
    /** 鱿鱼倍率配置（按鱿鱼数取倍率） */
    public squidCountRates: { count: number, rate: number }[] = [];
    /** 当前是否在鱿鱼轮 */
    public isGameInSquidRound: boolean = false;
    /// <summary>
    /// 当前最小带入倍数
    /// </summary>
    public currentMinRate: number = 0;
    /// <summary>
    /// 当前最大带入倍数
    /// </summary>
    public currentMaxRate: number = 0;
    /// <summary>
    /// 当前操作玩家剩余时间（s）
    /// </summary>
    public leftOperateTime: number = 0;
    /// <summary>
    /// 玩家操作默认时间
    /// </summary>
    public opTime: number = 0;
    /// <summary>
    /// 前注
    /// </summary>
    public groupBet: number = 0;
    /// <summary>
    /// 各分池的筹码数
    /// </summary>
    public pots: number[] = null;
    /// <summary>
    /// 当前最小可加注额，操作按钮上的加注额要用到
    /// </summary>
    public minAnteNum: number = 0;
    /// <summary>
    /// 是否可加注，与minAnteNum及剩余筹码联合判断是否显示加注按钮
    /// </summary>
    public canRaise: number = 0;
    /// <summary>
    /// 是否开启保险
    /// </summary>
    public insurance: boolean = false;
    /// <summary>
    /// 1需要弹出选择补盲，0不需要弹出
    /// </summary>
    public waitBlind: number = 0;
    /// <summary>
    /// 是否在其他房间被托管
    /// </summary>
    public isTrusted: number = 0;
    /// <summary>
    /// 是否开启IP限制，1 开启 0关闭
    /// </summary>
    public isIpRestrictions: boolean = false;
    /// <summary>
    /// 是否开启GPS限制，1 开启 0关闭
    /// </summary>
    public isGPSRestrictions: boolean = false;
    /// <summary>
    /// 同步到同盟的id 未同步时为0
    /// </summary>
    public tribeId: number = 0;
    /// APP的最新版本，如果当前app版本较小，则在牌桌中间显示升级提示
    /// </summary>
    public ServerVersion: string = null;
    /// <summary>
    /// 自动弃牌
    /// </summary>
    public autoFold: boolean = false;
    /// <summary>
    /// 自动跟注
    /// </summary>
    public autoCall: boolean = false;
    /// <summary>
    /// 自动ALLIN
    /// </summary>
    public autoAllin: boolean = false;
    /// <summary>
    /// 自动看牌
    /// </summary>
    public autoCheck: boolean = false;
    /// <summary>
    /// 当前手数
    /// </summary>
    public mHandNum: number = 0;
    /// <summary>
    /// 当前玩家
    /// </summary>
    public mainPlayer: CPlayer = null;
    /// <summary>
    /// 本地座位号就是对应座位的下标
    /// </summary>
    //public List<Seat> listSeat;
    /// <summary>
    /// key:客户端seatId
    /// </summary>
    //protected Dictionary<int, Seat> dicSeatOnlyClient;
    /// <summary>
    /// 没有剩余操作时间
    /// </summary>
    protected noLeftOperateTime: boolean = false;
    /// <summary>
    /// 缓存玩家show牌
    /// </summary>
    public cacheClinetShowDownCardId: number = 0;
    /// <summary>
    /// 操作延时次数
    /// </summary>
    public delayCount: number = 0;
    /// <summary>
    /// 公共牌位置
    /// </summary>
    public listDefaultPublicCardsLPos: cc.Vec3[] = null;
    /// <summary>
    /// 第二套公共牌位置
    /// </summary>
    public listDefaultSecondPublicCardsLPos: cc.Vec3[] = null;
    /// <summary>
    /// 上一局庄家
    /// </summary>
    public lastBankerIndex: number = 0;
    /// <summary>
    /// 缓存坐下SeatId
    /// </summary>
    protected cacheSitdownSeatId: number = 0;
    /// <summary>
    /// 等待GPS
    /// </summary>
    public waittingGPSCallback: boolean = false;
    /// <summary>
    /// 已经Allin下发玩家手牌
    /// </summary>
    public isAllinGetPlayerCards: boolean = false;
    /// <summary>
    /// 保险模式，三张公共牌后，没有保险可买，马上来了第四张公共牌 0默认 1首次收筹码并位移
    /// </summary>
    public fuck4thPCardByInsuranceState: number = 0;
    /// <summary>
    /// 最低入池率 0不限制
    /// </summary>
    private CurminPoolRate: number = 0;
    /// <summary>
    /// // 最小保留记分牌倍数
    /// </summary>
    private CurrentMinRate: number = 0;
    /// <summary>
    /// // 允许带出记分牌0否 1 自动  2手动
    /// </summary>
    public CurlimitOutChip: number = 0;
    /// <summary>
    /// 强制盲注
    /// </summary>
    private CurStraddle: boolean = false;
    /// <summary>
    /// 结束轮
    /// </summary>
    public cacheRound: 0 | 1 | 2 | 3 | 4 = 0;
    /// <summary>
    /// 本手缓存
    /// </summary>
    public cacheOutChips: number = 0;
    /// <summary>
    /// 缓存本手trun手牌
    /// </summary>
    public cacheTrunOutsCards: Map<number/*座位号*/, number[]/*保险outs*/> = null;

    /// <summary>
    /// 缓存购买量
    /// </summary>
    public cacheBuyActiveAmount: number = 0;
    /// <summary>
    /// 查看公共牌花费
    /// </summary>
    public checkPublicCardsCost: number = 50;
    /// <summary>
    /// 是否是取消留座离桌（用来判断是否显示提示）
    /// </summary>
    public cacheCancelKeepSeat: boolean = false;
    /// <summary>
    /// 缓存房间唯一标识
    /// </summary>
    public cacheUniqueId: string = null;
    /// <summary>
    /// 缓存广播信息
    /// </summary>
    //public BroadcastMsgData broadcastMsgData;
    /// <summary>
    /// 缓存赢牌信息
    /// </summary>
    public MessageWinnerData: ServerMessageWinner.AsObject = null;
    /// <summary>
    /// 缓存是否是第二套牌
    /// </summary>
    public IsSecondPsc: boolean = false;

    public cacheBuyInsurancePotUserCount: number = 0;
    /// <summary>
    /// 缓存自己被验证信息
    /// </summary>
    public cacheVoiceprintMsgId: number = 0;

    public VoiceprintCountdown: number = 0;


    /// <summary>
    /// 点击加时，用于判断是否关闭操作面板
    /// </summary>
    public ClickAddTime: boolean = false;
    /// <summary>
    /// 记录接收公共牌上次时间戳
    /// </summary>
    public ResponsePubCardLastTime: number = 0;
    /// <summary>
    /// 记录接收公共牌 差值 转秒
    /// </summary>
    public PubCardDiffTime: boolean = false;


    //////////////TexasGameUI的内容先放到这里
    /// <summary>
    /// 马上完成公共牌动画
    /// </summary>
    public stopUpdatePublicCardsAnimation: boolean = false;

    /// <summary>
    /// 是否正在播放大牌动画
    /// </summary>
    public isPlayingBigWinAnimation: boolean = false;
    //////////////////////////////////////
    lastClickTime: number = 0;
    private lastAgreePostReqTime: number = 0;

    //分池节点对象池
    //TransPot_Pool: SimpleNodePool = null;

    //发牌动画
    sequencePlayDealAnimation: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean } = null;

    sequenceUpdatePublicCards_obj = {};


    sequencePlayFirstRecyclingChipSubAnimation: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean } = null;
    sequencePlayFirstRecyclingChipAnimation: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean } = null;
    sequencePlayRecyclingChipAnimation: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean } = null;
    sequenceUpdatePublicCards: Sequence<{}> = null;
    sequenceSecondUpdatePublicCards: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean } = null;
    sequencePlayEndPublicCardsAnimation: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean } = null;

    IsDispose: boolean = false;

    //记录座位运动状态,发牌函数和开局消息
    seatMoveStruct: SeatMoveStruct = null;

    last_pots_count: number = 0;

    constructor() {
        this.GameLogicSMComponent = new FSMLogicComponent(this);
        this.SMAgency = new TexasSMAgency(this);
        this.TexasGameUtils = new TexasGameUtils(this);
        this.mushroomFeature = new TexasGameMushroom(this);
        this.squidFeature = new TexasGameSquid(this);
        this.seatMoveStruct = new SeatMoveStruct();
        this.RCInit();
    }
    protected RCInit() {
        this.TexasGameMessageHandler = new TexasGameMessageHandler(this);
        this.TexasGameProtocol = new TexasGameProtocol(this);
    }

    Update(dt: number) {

    }

    Enter() {
        this.listSeat = [];
        this.pots = [];
        this.dicSeatOnlyClient = new Map<number, Seat>();
        this.SMAgency.LoadGameStateConf();
        GC.uc.AddComponent(this.GameLogicSMComponent);
    }

    RegisterMsgHandler() {
        this.TexasGameMessageHandler.RegisterMessageHandler();
        this.TexasGameProtocol.RegisterMsgHandler();
    }
    RemoveMsgHandler() {
        this.TexasGameMessageHandler.RemoveMessageHandler();
        this.TexasGameProtocol.RemoveMsgHandler();
    }

    public GetSequencePlayDealAnimation() {
        return this.sequencePlayDealAnimation;
    }

    public RegiterEnterRoom() {
        GC.notify.register(ProtocolCode.Protocol_Holdem_EnterRoom, this.TexasGameMessageHandler.Protocol_Holdem_EnterRoom_Handler, this.TexasGameMessageHandler);
    }
    public UnRegiterEnterRoom() {
        GC.notify.remove(ProtocolCode.Protocol_Holdem_EnterRoom, this.TexasGameMessageHandler.Protocol_Holdem_EnterRoom_Handler, this.TexasGameMessageHandler);
    }

    /////////////////////////////////桌面样式/////////////////////////////////
    public get deskType() {

        (this.setting.deskType == null) && (this.setting.deskType = +(GC.localStore.getItem(StorageKey.SettingDeskType) ?? TexasConfig.DefaultDeskType));

        return this.setting.deskType;
    }
    SetDeskType(type: number) {
        this.setting.deskType = type;

        let material: cc.Material = this.uirc.sp_table_bg.getMaterials()[0];
        let colors = GameUtil.Table_Colors[type] || GameUtil.Table_Colors[0];
        material.setProperty("color_top", PublicHelper.GetColorArr(colors[0]));
        material.setProperty("color_bottom", PublicHelper.GetColorArr(colors[1]));

        this.uirc.sp_table_face.spriteFrame = AssetContext.getAsset(`top_table_${type}`, AssetFold.texture_table);
    }
    //////////////////////////////////////////////////////////////////////////
    /////////////////////////////////扑克样式/////////////////////////////////
    public get pokerType() {

        (this.setting.pokerType == null) && (this.setting.pokerType = +(GC.localStore.getItem(StorageKey.SettingPokerType) ?? TexasConfig.DefaultDeskType));

        return this.setting.pokerType;
    }

    // 获取大扑克牌SpriteFrame
    public GetBigPokerSP(spriteName: string): cc.SpriteFrame {

        return AssetContext.getAsset(spriteName, this.pokerType == 0 ? AssetFold.texture_BigCard0 : AssetFold.texture_BigCard1);
    }
    // 获取小扑克牌SpriteFrame
    public GetSmallPokerSP(spriteName: string): cc.SpriteFrame {
        return AssetContext.getAsset(spriteName, this.pokerType == 0 ? AssetFold.texture_SmallCard0 : AssetFold.texture_SmallCard1);
    }
    // 设置扑克牌样式 0 - 1
    public SetPokerType(type: number) {
        this.setting.pokerType = type;
        //遍历所有扑克牌刷新
        this.uirc.listCards.forEach(item => {

            item.UpdateSpriteFrame();
        })
        this.uirc.listSecondCards.forEach(item => {

            item.UpdateSpriteFrame();
        })
        this.listSeat.forEach(seat => {
            seat.listCardUIInfos.forEach(item => {
                item.UpdateSpriteFrame();
            })
            seat.listSmallCardUIInfos.forEach(item => {
                item.UpdateSpriteFrame();
            })
        })
    }
    //////////////////////////////////////////////////////////////////////////

    //创建座位UI
    createSeatUI() {
        if (this.seatUI_pool.length) return this.seatUI_pool.pop();
        return cc.instantiate(this.uirc.Seat_Temp);
    }
    //移除座位UI
    removeSeatUI(seatUI: cc.Node) {

        if (seatUI) {
            seatUI.parent = null;
            seatUI.scale = 1;
            seatUI.stopAllActions();
            seatUI.active = false;
            this.seatUI_pool.push(seatUI);
        }
    }

    public EnterRoom() {
        this.TexasGameUtils.EnterRoom();
    }
    //更新房间数据
    public UpdateRoom(obj: ServerMessageEnterRoom.AsObject) {
        this.UpdateRoomCommon(obj);
    }


    protected HideWaitForStartTips() {
        if (this.uirc.Image_WaitForStartTips.activeInHierarchy) {
            this.uirc.Image_WaitForStartTips.active = false;
        }
    }
    // protected HideSelectSeatTips() {
    //     if (this.uirc.Image_SelectSeatTips.activeInHierarchy) {
    //         this.uirc.Image_SelectSeatTips.active = false;
    //     }
    // }

    //清理所有Pots
    public HideAllPots() {
        if (this.uirc.listPotInfo) {
            this.uirc.listPotInfo.forEach(pot => {
                pot.trans.active = false;
            })
        }
    }
    UpdateRoomCommon(rec: ServerMessageEnterRoom.AsObject) {
        cc.log("UpdateRoomCommon");
        this.ClearAllData();
        this.ClearAllPlayers();  // 清空玩家数据
        if (this.listSeat?.length) {

        } else {
            this.ClearTableUI();
            this.HideCancelTrustBtn();
            this.HideWaitBlindBtn();
            this.InitAllEmptySeat();
            this.InitOperationPos();
            this.HideAllPots();
        }

        this.mainPlayer = new CPlayer(GameCache.Instance.nUserId);
        this.mainPlayer.sex = GameCache.Instance.sex;
        this.mainPlayer.headPic = GameCache.Instance.headPic;
        this.mainPlayer.nick = GameCache.Instance.nick;
        this.mainPlayer.userID = GameCache.Instance.nUserId;
        this.mainPlayer.SetCards(this.GetEmptyHandCards());
        if (rec.myInfo != null) {
            this.mainPlayer.seatID = this.GetLocalSeatID(rec.myInfo.seatId);
            this.mainPlayer.chips = rec.myInfo.chip;
            this.mainPlayer.cacheStoreChips = rec.myInfo.storeChips;
            // Unity 对齐：MyInfo 仅使用 squidRoundSeated，玩法状态由 Players/HandInfo 同步
            this.mainPlayer.squidRoundSeated = (rec.myInfo as any).squidRoundSeated || false;
        }

        this.cacheUniqueId = rec.roomInfo.uniqueId;
        this.gamestatus = rec.gameStatus;
        GameCache.Instance.GameStatus = this.gamestatus;

        this.bigIndex = this.GetLocalSeatID(rec.handInfo.bbSeatId);
        this.smallIndex = this.GetLocalSeatID(rec.handInfo.sbSeatId);
        this.bankerIndex = this.GetLocalSeatID(rec.handInfo.buSeatId);
        if (rec.mttProgress == null || !(rec.mttProgress.isBubbleWait && rec.gameStatus == Def.GameStatus.HAND_END)) {
            this.UpgradePublicCards(1, rec.handInfo.publicCardsList);
        }
        this.smallBlind = rec.roomInfo.smallBlind;
        GameCache.Instance.carry_small = rec.roomInfo.smallBlind * 2;
        this.bigBlind = rec.roomInfo.smallBlind * 2;
        this.alreadAnte = rec.handInfo.allBet;
        this.maxPlayTime = rec.roomInfo.schedulePlayDuration;

        this.currentMinRate = rec.roomInfo.currentMinRate;
        this.currentMaxRate = rec.roomInfo.currentMaxRate;

        this.CurlimitOutChip = rec.roomInfo.retainType;
        this.CurrentMinRate = rec.roomInfo.limitRetainMinRate * rec.roomInfo.currentMinRate;
        this.mHandNum = rec.handInfo.handNum;
        GameCache.Instance.CurlimitDelaySeeCard = rec.roomInfo.delaySeeCard;
        this.CurStraddle = rec.roomInfo.straddle;

        this.opTime = rec.roomInfo.opDuration;
        this.groupBet = rec.roomInfo.ante;
        this.mushroomFeature.UpdateRoomConfig(rec);
        this.squidFeature.UpdateRoomConfig(rec);
        this.insurance = rec.roomInfo.insurance;
        this.isIpRestrictions = rec.roomInfo.limitIp;
        this.isGPSRestrictions = rec.roomInfo.limitGps;

        GameCache.Instance.insurance = this.insurance;

        for (let i = 0; i < rec.handInfo.potsList.length; i++) {
            this.pots.push(rec.handInfo.potsList[i].amount);
            cc.log("排池子数据:", this.pots);
        }
        if (this.waitBlind == 1) {
            this.ShowWaitBlindBtn();
        }
        else {
            this.HideWaitBlindBtn();
        }

        // 显示可用位置
        let mPlayerIds: number[] = [];
        for (let i = 0; i < rec.playersList.length; i++) {
            mPlayerIds.push(this.GetLocalSeatID(rec.playersList[i].seatId));
        }

        let mSeat: Seat = null;
        //客户端赋值本地座位号。座位空人也设置
        for (let i = 0, n = GameCache.Instance.seat_count; i < n; i++) {
            mSeat = this.listSeat[i];
            mSeat.seatID = i;

            mSeat.FsmLogicComponent.SM.ChangeState(SeatIdle.Instance);
            if (!mPlayerIds.includes(i)) {
                mSeat.FsmLogicComponent.SM.ChangeState(SeatEmpty.Instance);
            }
        }
        for (let i = 0, n = rec.playersList.length; i < n; i++) {

            let player_local_seadID = this.GetLocalSeatID(rec.playersList[i].seatId);

            mSeat = this.listSeat[player_local_seadID];

            mSeat.seatID = player_local_seadID;

            mSeat.FsmLogicComponent.SM.ChangeState(SeatIdle.Instance);

            let mPlayerId = rec.playersList[i].userRid;
            if (mPlayerId == 0) {
                mSeat.FsmLogicComponent.SM.ChangeState(SeatEmpty.Instance);
                continue;
            }
            //let mAnte = rec.playersList[i].roundActioned ? rec.playersList[i].roundBet : 0;
            let mAnte = rec.playersList[i]?.roundBet || 0;
            //rec.playersList[i].roundActioned ? 0 : rec.playersList[i].roundBet;
            let mNickname = rec.playersList[i].name;
            //let mChips = rec.playersList[i].chip;
            let OffLineState = 0;
            let mHeadPic = rec.playersList[i].avatar;
            mSeat.isBig = this.bigIndex == player_local_seadID;
            mSeat.isSmall = this.smallIndex == player_local_seadID;
            mSeat.isBank = this.bankerIndex == player_local_seadID;
            mSeat.isStraddle = false;
            let mSex = rec.playersList[i].sex;
            mSeat.keepSeatLeftTime = rec.playersList[i].keepSeatLeftTime;
            let mPlayer: CPlayer = new CPlayer(mPlayerId);

            mPlayer.seatID = player_local_seadID;
            mPlayer.sex = mSex;
            mPlayer.headPic = mHeadPic;
            mPlayer.nick = mNickname;
            mPlayer.userID = mPlayerId;
            mPlayer.chips = rec.playersList[i].chip;
            mPlayer.canPlayStatus = rec.playersList[i].status;
            mPlayer.actionStatus = rec.playersList[i].action;
            mPlayer.ante = mAnte;
            mPlayer.anteNumber = mAnte;
            mPlayer.isOffLine = OffLineState;
            mPlayer.IsAutoOp = rec.playersList[i].isAutoop;

            mPlayer.keepSeatReason = rec.playersList[i].keepSeatReason;
            //留座原因是带入申请中
            if (mPlayer.keepSeatReason == Def.KeepSeatReason.KSR_TAKE_SEAT) {
                mPlayer.KeepSeatLeftTime = mSeat.keepSeatLeftTime;
            }
            mPlayer.SetCards(this.GetHandCardsByRecList(rec.playersList[i].cardsList));
            mPlayer.RoundActioned = rec.playersList[i].roundActioned;
            this.mushroomFeature.ApplyPlayerState(mPlayer, rec.playersList[i] as any);
            const isMainSeat = rec.myInfo != null && this.GetLocalSeatID(rec.myInfo.seatId) == player_local_seadID;
            this.squidFeature.ApplyPlayerState(mPlayer, rec.playersList[i] as any, rec.myInfo as any, isMainSeat);
            mSeat.Player = mPlayer;

            if (isMainSeat) {
                if (null != this.mainPlayer) {
                    this.mainPlayer.Dispose();
                    this.mainPlayer = null;
                }
                this.mainPlayer = mSeat.Player;
            }
            //更新玩家离线状态
            mSeat.UpdateOnOrOffLine();
        }
        this.uirc.Image_WaitForStartTips.active = this.gamestatus == 0;
        this.UpdateAlreadAnte();
        this.UpdateRoomDes();
        this.UpdatePublicCardsNoAnim();
        this.uirc.UpdateBarragePanelActive();

        mSeat = this.GetSeatByLocalSeatID(this.mainPlayer.seatID);
        if (null != mSeat) {
            this.ResetSeatUIInfo(mSeat.ClientSeatId);
        }
        for (let i = 0, n = rec.playersList.length; i < n; i++) {
            mSeat = this.listSeat[this.GetLocalSeatID(rec.playersList[i].seatId)];

            mSeat.seatID = this.GetLocalSeatID(rec.playersList[i].seatId);

            mSeat.FsmLogicComponent.SM.ChangeState(SeatIdle.Instance);

            let mPlayerId = rec.playersList[i].userRid;

            if (mPlayerId == 0) continue;

            mSeat.UpdateFSMbyStatus(true);
        }

        // EnterRoom 即刷新蘑菇标识（不等待 StartInfo）
        if (this.mushroomEnabled) {
            this.mushroomFeature.RefreshSeatMarks();
        }
        if (this.squidEnabled) {
            this.squidFeature.RefreshMarks();
        }

        let LeftOpTime = 0;
        //RepeatedField<ActionLimit> actionLimits = null;
        //RepeatedField<ActionShortcutLimit> actionShortcutLimits = null;
        let actionsList = null;
        let shortcutsList = null;
        if (rec.operatorList != null && rec.operatorList.length > 0) {
            for (let i = 0; i < rec.operatorList.length; i++) {
                this.operationID = this.GetLocalSeatID(rec.operatorList[i].seatId);
                LeftOpTime = rec.operatorList[i].leftOpTime;
                if (this.GetLocalSeatID(rec.operatorList[i].seatId) == this.mainPlayer.seatID) {
                    actionsList = rec.operatorList[i].actionsList;
                    shortcutsList = rec.operatorList[i].shortcutsList;
                    this.TexasGameProtocol.HandlerInsueranceData(rec.operatorList);//重进房间保险处理
                }
            }
        }
        if (this.operationID > -1 && this.operationID < 9) {
            this.leftOperateTime = LeftOpTime;
            this.noLeftOperateTime = false;
        }
        else {
            this.noLeftOperateTime = true;
        }
        // 如果有让牌操作的时候点弃牌会出现弹框，先隐藏
        // UI mTmpDialog = UIComponent.Instance.Get(UIType.UIDialog);
        //         if (null != mTmpDialog && mTmpDialog.GameObject.activeInHierarchy) {
        //             UIComponent.Instance.HideUI(UIType.UIDialog);
        //         }
        UIComponent.close(UIDefine.UIDialogComponent);
        //当前操作人
        if (this.operationID != -1) {
            mSeat = this.GetSeatByLocalSeatID(this.operationID);
            if (null != mSeat && null != mSeat.Player) {
                if (mSeat.seatID == this.mainPlayer.seatID && mSeat.Player.userID == this.mainPlayer.userID && this.mainPlayer.isPlaying) {
                    //自己操作中
                    this.HideAutoOperationPanel();   // 隐藏预操作
                    this.ShowOperationPanel({ actionsList: actionsList, shortcutsList: shortcutsList });
                }
                else {
                    // 下一个操作不是自己
                    this.HideOperationPanel();
                    if (this.mainPlayer.isPlaying) {
                        // 自己有参与游戏,但allin弃牌不显示
                        if ((this.mainPlayer.actionStatus != Def.Action.FOLD && this.mainPlayer.actionStatus != Def.Action.ALLIN && this.mainPlayer.actionStatus != Def.Action.NONE) && !this.mainPlayer.IsAutoOp) {

                            UIComponent.Instance.ShowUI(PrefabUI.UIAutoOperationComponent, UIAutoOperationComponent.AutoOperationData(this.TexasGameUtils.getAutoOperationCallAmount(rec.handInfo.roundBet)));

                        }
                        else {
                            this.HideAutoOperationPanel();
                        }
                    }
                    else {
                        // 观众
                        this.HideAutoOperationPanel();
                    }
                }
                mSeat.FsmLogicComponent.SM.ChangeState(SeatOperation.Instance);
            }
        }
        else {
            this.HideOperationPanel();
            this.HideAutoOperationPanel();
        }
        //刷新池子
        this.UpdatePots();
        // 切换游戏状态机
        switch (rec.gameStatus) {
            case Def.GameStatus.NOT_START:
                {
                    this.SMAgency.ChangeGameState(TexasGameState.NotStart, rec);
                }
                break;
            case Def.GameStatus.WAIT_HAND_START:
                {
                    this.SMAgency.ChangeGameState(TexasGameState.WaitHandStart, rec);
                }
                break;
            case Def.GameStatus.HAND_STARTED:
                {
                    this.SMAgency.ChangeGameState(TexasGameState.HandStarted, rec);
                }
                break;
            case Def.GameStatus.HAND_FLOP:
                {
                    this.SMAgency.ChangeGameState(TexasGameState.HandFlop, rec);
                }
                break;
            case Def.GameStatus.HAND_TURN:
                {
                    this.SMAgency.ChangeGameState(TexasGameState.HandTurn, rec);
                }
                break;
            case Def.GameStatus.HAND_RIVER:
                {
                    this.SMAgency.ChangeGameState(TexasGameState.HandRiver, rec);
                }
                break;
            case Def.GameStatus.HAND_END:
                {
                    this.SMAgency.ChangeGameState(TexasGameState.WaitHandStart, rec);
                }
                break;
            case Def.GameStatus.COMPLETE:
                {
                    this.SMAgency.ChangeGameState(TexasGameState.Complete, rec);
                }
                break;
            case Def.GameStatus.CANCEL:
                {
                    this.SMAgency.ChangeGameState(TexasGameState.Cancel, rec);
                }
                break;
        }

        this.roomReqList = [
            { name: "UpdateMsgBtnSprite", func: this.UpdateMsgBtnSprite },
            { name: "ReqDiamondConfig_2", func: this.ReqDiamondConfig_2 },
            { name: "ReqDiamondConfig_8", func: this.ReqDiamondConfig_8 },
        ];
        this.RunRoomReqlist();
    }

    //奔跑请求队列
    RunRoomReqlist() {
        if (this.roomReqList.length) {
            let obj = this.roomReqList.shift();
            console.log("请求---->", obj.name);
            obj.func.call(this, this.RunRoomReqlist);
        } else {
            console.log("房间队列请求完毕---->");
        }
    }
    roomReqList = [];

    // 刷新分池
    public UpdatePots(): void {

        this.HideAllPots();

        for (let i = 0; i < this.pots.length; i++) {

            let pot_info = this.uirc.listPotInfo[i];

            pot_info.trans.active = this.pots[i] > 0;

            pot_info.textPot.string = GameUtil.TransBetValue(this.pots[i]);

            //判断进行位移
            if (i > 0 && i >= this.last_pots_count) {

                pot_info.trans.setPosition(GameUtil.TexasPots[0]);

                cc.tween(pot_info.trans).to(.3, { position: GameUtil.TexasPots[i] }).start();

            } else {
                pot_info.trans.setPosition(GameUtil.TexasPots[i]);
            }

        }
        this.last_pots_count = this.pots.length;
    }

    public ResetPots() {
        this.pots = [];
        this.last_pots_count = 0;
        this.HideAllPots();
    }

    /// <summary>
    /// --刷新分池
    /// </summary>
    // public _UpdatePots(): void {

    //     let mNewStart = 0, mNewEnd = 0;
    //     let mUpdateStart = 0, mUpdateEnd = 0;
    //     let mHideStart = 0, mHideEnd = 0;

    //     if (this.pots.length < this.uirc.listPotInfo.length) {
    //         mUpdateStart = 0;
    //         mUpdateEnd = this.pots.length;
    //         mHideStart = this.pots.length;
    //         mHideEnd = this.uirc.listPotInfo.length;
    //     }
    //     else if (this.pots.length > this.uirc.listPotInfo.length) {
    //         mUpdateStart = 0;
    //         mUpdateEnd = this.uirc.listPotInfo.length;
    //         mNewStart = this.uirc.listPotInfo.length;
    //         mNewEnd = this.pots.length;
    //     }
    //     else {
    //         mUpdateStart = 0;
    //         mUpdateEnd = this.uirc.listPotInfo.length;
    //     }

    //     let mObj: cc.Node = null;
    //     let mPotInfo: PotInfo = null;

    //     // 隐藏放最前面
    //     for (let i = mHideStart; i < mHideEnd; i++) {

    //         mObj = this.uirc.listPotInfo[i].trans;//.gameObject;

    //         mObj.active = false;
    //     }

    //     for (let i = mNewStart; i < mNewEnd; i++) {

    //         if (i == 0) {

    //             mObj = this.uirc.TransAllPot_Pool.GetNode();

    //             mObj.setParent(this.uirc.transPots);
    //             mObj.setPosition(GameUtil.TexasPots[0]);
    //             mObj.name = `Pot${i}`;
    //             mPotInfo = new PotInfo(mObj);
    //             mPotInfo.potType = 2;
    //             this.uirc.listPotInfo.push(mPotInfo);
    //             mPotInfo.textPot.string = GameUtil.TransBetValue(this.pots[i]);
    //             mObj.active = this.pots[i] > 0;
    //         }
    //         else {
    //             mObj = this.uirc.TransPot_Pool.GetNode();

    //             mObj.setParent(this.uirc.transPots);

    //             mObj.name = `Pot${i}`;

    //             mPotInfo = new PotInfo(mObj);
    //             mPotInfo.potType = 1;
    //             this.uirc.listPotInfo.push(mPotInfo);

    //             mPotInfo.textPot.string = GameUtil.TransBetValue(this.pots[i]);

    //             mPotInfo.imagePotText.string = `${i}`;

    //             if (this.pots[i] > 0) {

    //                 mPotInfo.trans.setPosition(GameUtil.TexasPots[0]);

    //                 cc.tween(mPotInfo.trans).to(.3, { position: GameUtil.TexasPots[i] }).start();

    //             }
    //             mObj.active = this.pots[i] > 0;
    //         }

    //     }

    //     for (let i = mUpdateStart; i < mUpdateEnd; i++) {
    //         if (i == 0) {
    //             this.uirc.listPotInfo[0].textPot.string = GameUtil.TransBetValue(this.pots[i]);
    //             continue;
    //         }
    //         mPotInfo = this.uirc.listPotInfo[i];
    //         mObj = this.uirc.listPotInfo[i].trans;

    //         //mPotInfo.imagePot.sprite = rcChipSprite.Get<Sprite>(GameUtil.GetChipSpriteName(pots[i]));


    //         mPotInfo.textPot.string = GameUtil.TransBetValue(this.pots[i]);

    //         mPotInfo.imagePotText.string = `${i}`;


    //         if (this.pots[i] > 0 && !mObj.activeInHierarchy) {

    //             mObj.setPosition(GameUtil.TexasPots[0]);
    //             cc.tween(mObj).to(.3, { position: GameUtil.TexasPots[i] }).start();

    //         }

    //         mObj.active = this.pots[i] > 0;
    //     }
    //     // //比赛隐藏金币显示(暂时)
    //     // if (this.isMTT && this.uirc.listPotInfo?.[0]) {
    //     //     this.uirc.listPotInfo[0].trans.active = false;
    //     // }
    // }




    /**
     * 刷新牌桌房间信息显示
     */
    public UpdateRoomDes() {
        let info: string = ``;
        if (GameUtil.GetFriendsOrClubTable() == 1) {
            info += `${GameCache.Instance.FriendsTableCode}\n`;
        }
        info += `${GameCache.Instance.roomName}`;
        info += `\n${this.GetRoomTypeDes()}`;
        info += `\n${GameCache.Instance.room_id}-${this.mHandNum}`;
        let straddleStr: string = "";
        if (this.groupBet > 0) {
            info += `\n${CPErrorCode.LanguageDescription(20006)}${StringHelper.GetLongString(this.smallBlind)}/${StringHelper.GetLongString(this.bigBlind)}(${StringHelper.GetLongString(this.groupBet)}) ${straddleStr = this.CurStraddle ? "straddle" : ""}`;
        }
        else {
            info += `\n${CPErrorCode.LanguageDescription(20006)}${StringHelper.GetLongString(this.smallBlind)}/${StringHelper.GetLongString(this.bigBlind)} ${straddleStr = this.CurStraddle ? "straddle" : ""}`;
        }
        //带出，最小带入倍数 RT_MANUAL手动的
        if (this.CurlimitOutChip == RoomInfo.RetainType.RT_MANUAL) {
            info += `\n${CPErrorCode.LanguageDescription(20087)}:${(GameCache.Instance.carry_small * this.CurrentMinRate) / 100}`;
        }

        let insuranceStr = "";
        if (this.isGPSRestrictions && this.isIpRestrictions) {
            // "GPS  IP限制";
            info += `\n${insuranceStr = ((GameCache.Instance.insurance) ? CPErrorCode.LanguageDescription(10021) + " " : "")}GPS  IP${CPErrorCode.LanguageDescription(20008)}`;
        }
        else if (this.isGPSRestrictions && !this.isIpRestrictions) {
            //"GPS限制";
            info += `\n${insuranceStr = ((GameCache.Instance.insurance) ? CPErrorCode.LanguageDescription(10021) + " " : "")}GPS${CPErrorCode.LanguageDescription(20008)}`;

        }
        else if (!this.isGPSRestrictions && this.isIpRestrictions) {
            // "IP限制;
            info += `\n${insuranceStr = ((GameCache.Instance.insurance) ? CPErrorCode.LanguageDescription(10021) + " " : "")}IP${CPErrorCode.LanguageDescription(20008)}`;
        }
        else if (GameCache.Instance.insurance) {
            info += `\n${CPErrorCode.LanguageDescription(10021)}`;
        }
        if (GameCache.Instance.CurlimitDelaySeeCard) {
            info += `\n${CPErrorCode.LanguageDescription(20088)}`;
        }
        info += this.mushroomFeature.BuildRoomDesc();
        info += this.squidFeature.BuildRoomDesc();
        info += "\n\n";
        this.uirc.textRoomInfo.string = info;
    }

    /** 刷新座位鱿鱼标记 */
    public RefreshSquidMarks(): void {
        this.squidFeature.RefreshMarks();
    }

    /** 点击加入鱿鱼轮开关 */
    public OnClickSquidJoinSwitch(): void {
        this.squidFeature.OnClickJoinSwitch();
    }

    /** 统计本轮鱿鱼中仍未拿到标记的人数 */
    public CountSquidNoMarkPlayers(): number {
        return this.squidFeature.CountNoMarkPlayers();
    }

    /**
     * 鱿鱼轮开始动画。
     * @param onFinished 动画结束回调
     */
    public PlaySquidRoundStartAnim(): void {
        this.squidFeature.PlayRoundStartAnim();
    }

    /** 鱿鱼轮结束动画/结算弹窗 */
    public PlaySquidRoundEndAnim(rec?: ServerMessageWinner.AsObject): void {
        this.squidFeature.PlayRoundEndAnim(rec);
    }

    /** 本轮鱿鱼结束后重置状态 */
    public ResetSquidRoundState(): void {
        this.squidFeature.ResetRoundState();
    }

    /** 主动加入/退出鱿鱼轮 */
    public SendSquidInActive(enable: boolean): void {
        ProtocolAgency.Send<ClientMessageSquidInActive.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_SquidInActive,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                enable: enable
            }
        });
    }


    protected GetRoomTypeDes(): string {
        let gameTypeStr: string = i18nMgr.Get("GameType_" + GameCache.Instance.game_type);
        let pokerTypeStr: string = i18nMgr.Get("PokerType_" + GameCache.Instance.poker_type);
        let betTypeStr: string = i18nMgr.Get("BetType_" + GameCache.Instance.bet_type);
        return gameTypeStr + "-" + pokerTypeStr + "-" + betTypeStr;
    }

    //初始化操作面板的位置
    InitOperationPos() {
        let Seat0: Seat = this.listSeat[0];
        // let Operation_Pos = this.uirc.UIOperation_Con.convertToNodeSpaceAR(Seat0.ui.convertToWorldSpaceAR(Seat0.uirc.Operation_Pos_Mark.getPosition()));
        // this.uirc.UIOperation_Com.SetUIPos(Operation_Pos);
        // this.uirc.UIAutoOperation_Com.SetUIPos(Operation_Pos);
        let Operation_Pos = Seat0.ui.getPosition();
        this.uirc.UIOperation_Com.SetUIPos(Operation_Pos);
        this.uirc.UIAutoOperation_Com.SetUIPos(Operation_Pos);

        console.log("设置 - InitOperationPos", Operation_Pos.toString());
    }


    // 转换远端座位号到本地座位号 服务器下发位置从  1开始，0为默认值，客户端-1为默认值(所以需要减一下，暂时不大改客户端)
    public GetLocalSeatID(remoteSeatID: number): number {
        let id: number = remoteSeatID - 1;
        if (id < -1) return -1;
        return id;
    }
    // 通过本地座位号获取位置对象
    public GetSeatByLocalSeatID(localSeatID: number): Seat {
        // let mSeat: Seat = null;
        // if (localSeatID >= 0 && localSeatID < this.listSeat.length)
        //     mSeat = this.listSeat[localSeatID];
        // return mSeat;
        return this.listSeat[localSeatID];
    }
    //通过服务器座位id返回seat
    public GetSeatByServerSeatID(serverSeadID: number): Seat {
        return this.GetSeatByLocalSeatID(this.GetLocalSeatID(serverSeadID));
    }


    /// <summary>
    /// 通过UserId获取位置对象
    /// </summary>
    /// <param name="userId"></param>
    /// <returns></returns>
    public GetSeatByUserId(userId: number): Seat {
        if (userId <= 0)
            return null;

        let mSeat: Seat = null;
        for (let i = 0, n = this.listSeat.length; i < n; i++) {
            mSeat = this.listSeat[i];
            if (null != mSeat && null != mSeat.Player && mSeat.Player.userID == userId) {
                return mSeat;
            }
        }
        return null;
    }


    /// <summary>
    /// 显示花费查看公共牌提示
    /// </summary>
    /// <param name="content"></param>
    public ShowSeeMorePublicTips(content: string) {
        this.uirc.textSeeMorePublicTips.string = content;
        this.uirc.Image_SeeMorePublicTips.active = true;
    }

    //clientSeatId方位移动到中下自己位置
    public ResetSeatUIInfo(clientSeatId: number): void {
        //GameUtil.ResetSeatInfo();
        //刷新bank和筹码位置
        GameUtil.RefreshMeBankPos();
        if (clientSeatId == 0) {
            let seat = this.dicSeatOnlyClient.get(0);
            seat.uirc.imageBanker.setPosition(seat.seatUIInfo.bank_pos);
            seat.uirc.transCurRoundHaveBet.setPosition(seat.seatUIInfo.bet_pos);
            return;
        }
        this.dicSeatOnlyClient.clear();
        let seat_count = GameCache.Instance.seat_count;
        let infos = GameUtil.pos_config[seat_count];


        this.seatMoveStruct.move_cp_count = 0;
        this.seatMoveStruct.moving = true;

        for (let i = 0; i < seat_count; i++) {

            let seat: Seat = this.listSeat[i];
            //获取目标新方位
            let target_dir = seat.ClientSeatId - clientSeatId;
            if (target_dir < 0) target_dir += seat_count;
            this.dicSeatOnlyClient.set(target_dir, seat);
            //座位运动到目标位置
            cc.tween(seat.ui).to(0.3, { position: infos[target_dir].seat_pos }, cc.easeQuadraticActionOut()).call(() => {
                //更新方位配置
                seat.UpdateSeatUIInfo(target_dir);

                this.seatMoveStruct.move_cp_count++;

                if (this.seatMoveStruct.move_cp_count >= seat_count) this.AllSeatMoveEnd();

            }).start();
        }

    }

    //座位运动结束的处理
    private AllSeatMoveEnd() {

        cc.log("所有座位运动完毕");

        while (this.seatMoveStruct.cacheFuncs?.length) {

            let f = this.seatMoveStruct.cacheFuncs.shift();

            cc.log(f);

            f.b.call(f.a, f.c);

        }

        this.ResetSeatMoveStruct();

    }

    /// <summary>
    /// 通过客户端位置获取位置对象
    /// </summary>
    /// <param name="clientSeatId"></param>
    /// <returns></returns>
    public GetSeatByClientId(clientSeatId: number): Seat {
        return this.dicSeatOnlyClient.get(clientSeatId);;
    }

    /// <summary>
    /// 坐下 
    /// </summary>
    /// <param name="clientSeatId"></param>
    public Sitdown(clientSeatId: number, isEmptyClick: boolean = false): void {

        //test
        //this.CurlimitOutChip = RoomInfo.RetainType.RT_AUTO;


        let mSeat: Seat = this.GetSeatByClientId(clientSeatId);
        if (null == mSeat) {
            cc.log(`Sitdown 位置不存在 clientSeatId:${clientSeatId}`);
            return;
        }

        if (this.mainPlayer.seatID != -1) {
            cc.log(`Sitdown 你已在其他位置 seatID ${this.mainPlayer.seatID}, clientSeatId ${this.GetSeatByLocalSeatID(this.mainPlayer.seatID).ClientSeatId}`);
            return;
        }

        if (null != mSeat.Player) {

            if (mSeat.Player.userID == this.mainPlayer.userID) {
                cc.log(`Sitdown 你已在该位置 clientSeatId:${clientSeatId}`);
                return;
            }

            cc.log(`Sitdown 该位置有其他玩家 clientSeatId:${clientSeatId}`);
            return;
        }

        this.cacheSitdownSeatId = mSeat.seatID;

        WWW.Instance.CommonAPI({
            web_class: Web_User_Room,
            api_id: GameCache.Instance.room_id,
        }).then(
            (res: typeof Web_User_Room.Response) => {

                if (res.code == 0 && res.data.last_bring_out != null) {
                    let fee = res.data.last_bring_out.fee;
                    let bring_out = res.data.last_bring_out.to_wallet;
                    if (bring_out + fee > 0) {
                        if (res.data.last_bring_out.to_wallet <= UITexasModel.mInstance.GetGoldByClubID(res.data.last_bring_out.club_id)) {
                            ProtocolAgency.Send<ClientMessageSeated.AsObject>({
                                Code: ProtocolCode.Protocol_Holdem_Seated,
                                RoomID: GameCache.Instance.room_id,
                                MatchID: GameCache.Instance.match_id,
                                Body: {
                                    room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                                    seatId: this.GetRemoteSeatID(mSeat.seatID),
                                    bringIn: bring_out + fee,
                                    autoOnTable: 0,
                                    autoUseWallet: false,
                                    returnOrNew: 1,
                                    store: 0,
                                    clubId: res.data.last_bring_out.club_id,
                                    applyBringIn: false
                                },
                            });
                        }
                        else if (GameUtil.GetFriendsOrClubTable() == 1 || GameUtil.GetFriendsOrClubTable() == 2) {

                            ProtocolAgency.Send<ClientMessageSeated.AsObject>({
                                Code: ProtocolCode.Protocol_Holdem_Seated,
                                RoomID: GameCache.Instance.room_id,
                                MatchID: GameCache.Instance.match_id,
                                Body: {
                                    room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                                    seatId: this.GetRemoteSeatID(mSeat.seatID),
                                    bringIn: bring_out + fee,
                                    autoOnTable: 0,
                                    autoUseWallet: false,
                                    returnOrNew: res.data.return_table ? 1 : 0,
                                    store: 0,
                                    clubId: res.data.last_bring_out.club_id,
                                    applyBringIn: false
                                },
                            });
                        }
                        else {

                            return;
                        }

                    }
                    else {
                        if (this.CurlimitOutChip == RoomInfo.RetainType.RT_AUTO) {
                            this.ShowAutoAddChips(res.data.wallet);
                        }
                        else {
                            this.ShowAddChips(res.data.wallet);
                        }
                    }
                }

                else if ((GameUtil.GetFriendsOrClubTable() == 1 || GameUtil.GetFriendsOrClubTable() == 2) && res.code == 0 && res.data.apply_bring_in > 0)//朋友卓带入逻辑
                {

                    ProtocolAgency.Send<ClientMessageSeated.AsObject>({
                        Code: ProtocolCode.Protocol_Holdem_Seated,
                        RoomID: GameCache.Instance.room_id,
                        MatchID: GameCache.Instance.match_id,
                        Body: {
                            room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                            seatId: this.GetRemoteSeatID(mSeat.seatID),
                            bringIn: res.data.apply_bring_in,
                            autoOnTable: 0,
                            autoUseWallet: false,
                            returnOrNew: 0,
                            store: 0,
                            clubId: 0,
                            applyBringIn: true,
                        },
                    });
                }
                else {
                    if (this.CurlimitOutChip == RoomInfo.RetainType.RT_AUTO) {
                        this.ShowAutoAddChips(res.data.wallet);
                    }
                    else {
                        this.ShowAddChips(res.data.wallet);
                    }
                }

            },
            (res) => {

            }
        )

    }

    /// <summary>
    /// 最小可玩的筹码，少于等于此数需要带入才能玩
    /// </summary>
    public GetMinPlayChips(): number {
        return this.bigBlind + this.groupBet;
    }

    /// <summary>
    /// 当前用户是否有坐下
    /// </summary>
    /// <returns></returns>
    public UserSitdown(): boolean {
        if (null != this.mainPlayer) {
            return this.mainPlayer.seatID != -1;
        }
        return false;
    }


    /// <summary>
    /// 转换本地座位号到远端座位号 客户端发位置从  1开始，0为默认值，客户端-1为默认值
    /// </summary>
    /// <param name="localSeatID"></param>
    /// <returns></returns>
    public GetRemoteSeatID(localSeatID: number): number {
        return localSeatID + 1
    }

    /// <summary>
    /// 展示补盲按钮
    /// </summary>
    public ShowWaitBlindBtn(): void {
        // Unity 对齐：出现补盲状态时直接发同意补盲请求，避免长时间等手。
        this.onClickWaitBlind();
        if (this.uirc.buttonWaitBlind) {
            this.uirc.buttonWaitBlind.active = false;
        }
    }
    /// <summary>
    /// 隐藏补盲按钮
    /// </summary>
    public HideWaitBlindBtn(): void {
        if (null == this.uirc.buttonWaitBlind || !this.uirc.buttonWaitBlind.activeInHierarchy)
            return;
        this.uirc.buttonWaitBlind.active = false;
    }

    public onClickWaitBlind(): void {
        const now = GlobalSession.NowTimeMS || 0;
        if (now - this.lastAgreePostReqTime < 200) {
            return;
        }
        this.lastAgreePostReqTime = now;
        console.log("[WaitBlind] send agree post", {
            localSeatID: this.mainPlayer?.seatID,
            serverSeatID: (this.mainPlayer?.seatID ?? -1) + 1,
        });
        ProtocolAgency.Send<ClientMessageAgreePost.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_AgreePost,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
            },
        });
    }
    /** 获取当前最小带入（含蘑菇押金） */
    public GetMinBringInWithMush(): number {
        return this.mushroomFeature.GetMinBringIn();
    }
    /// <summary>
    /// 带入
    /// </summary>
    /// <param name="anteNumber"></param>
    public AddChips(anteNumber: number, autoOnTable: number = 0, autoUseWallet: boolean = false, club_id = 0, club_random_id = 0, fromBring: { wallets: any, selected_wallet: any, own: any } = null) {

        //大厅桌
        if (GameUtil.GetFriendsOrClubTable() == 3) {

            if (anteNumber > UITexasModel.mInstance.GetGoldByClubID(club_id)) {

                //多钱包有其他支付
                if (fromBring?.wallets.length > 1) {

                    UIComponent.open<UISuperDialogType>(UIDefine.UISuperDialog, {

                        content: i18nMgr.Get("ServerErrorCode_20004"),

                        commit: i18nMgr.Get("UIMine_WalletAddchipsListItems"),

                        cancel: i18nMgr.Get("UI_otherPay"),

                        commit_click: () => {

                            WWW.Instance.CommonAPI(
                                {
                                    web_class: Web_Org_Club_Search_By_Id,
                                    body: {
                                        club_random_id: club_random_id
                                    }
                                }
                            ).then(
                                (res: any) => {

                                    UIComponent.open(UIDefine.UIToRecharge,
                                        {
                                            type: 1,
                                            walletType: WalletType.Club,
                                            club_id: res.data.club_id,
                                            club_name: res.data.club_name,
                                            tribe_name: res.data.tribe_name,
                                        });
                                },
                                (res: any) => {

                                }
                            )
                        },

                        cancel_click: () => {
                            UIComponent.open(UIDefine.UIClubWalletList, fromBring);
                        }
                    });

                } else {
                    UIComponent.open<UISuperDialogType>(UIDefine.UISuperDialog, {

                        content: i18nMgr.Get("ServerErrorCode_20004"),

                        ok: i18nMgr.Get("UIMine_WalletAddchipsListItems"),

                        ok_click: () => {

                            WWW.Instance.CommonAPI(
                                {
                                    web_class: Web_Org_Club_Search_By_Id,
                                    body: {
                                        club_random_id: club_random_id
                                    }
                                }
                            ).then(
                                (res: any) => {

                                    UIComponent.open(UIDefine.UIToRecharge,
                                        {
                                            type: 1,
                                            walletType: WalletType.Club,
                                            club_id: res.data.club_id,
                                            club_name: res.data.club_name,
                                            tribe_name: res.data.tribe_name,
                                        });
                                },
                                (res: any) => {

                                }
                            )
                        }

                    });
                }
                return;
            }

        }

        //朋友桌不需要判断金豆
        // if (GameCache.Instance.origin_type != 4 && GC.data.user.info.gold < anteNumber) {
        //     UIComponent.open(UIDefine.UIDialogComponent,
        //         {
        //             type: UIDialogComponent.DialogType.CommitCancel,
        //             // title = $"余额不足",
        //             title: CPErrorCode.LanguageDescription(10025),
        //             // content = $"金豆余额不足，请先充值",
        //             content: CPErrorCode.LanguageDescription(20010),
        //             // contentCommit = "去充豆",
        //             contentCommit: CPErrorCode.LanguageDescription(10026),
        //             // contentCancel = "取消",
        //             contentCancel: CPErrorCode.LanguageDescription(10013),

        //             actionCommit: () => {
        //                 //跳转充豆
        //                 UIComponent.open(UIDefine.MyWalletForm, false);
        //             },
        //             noAnimation: true,
        //         });
        //     return;
        // }
        if (this.mainPlayer == null || this.mainPlayer.seatID == -1) {
            //声纹认证开启判断
            if (GameCache.Instance.voiceprint_verify_on == 1) {
                //             UITexasModel.mInstance.APIUserVoiceprint(0, 0, Act => {
                //                 if (Act.code == 0) {
                //                     if (Act.data == null) {
                //                         if (!MicrophoneHelper.IsMicrophonePermissionAllowed()) {
                //                             return;
                //                         }
                //                         Game.Scene.GetComponent<UIComponent>().PrefabUI(UIType.UITexasHumanYZ, new UITexasHumanYZComponent.VerificationDataInfo()
                //     								{
                //                                 cacheVoiceprint = VoiceprintRoomType.Hall,
                //                                 isHaveVoice = true
                //                             });
                //                     }
                //                     else {
                //                         CPGameSessionComponent.Instance.Send(new Protocol_Holdem_Seated()
                //     								{
                //                                 RoomID = (ulong)GameCache.Instance.room_id,
                //                                 MatchID = (ulong)GameCache.Instance.match_id,
                //                                 request = new ClientMessageSeated()
                //     									{
                //                                 Room = new Room() { RoomId = (uint)GameCache.Instance.room_id, MatchId = (uint)GameCache.Instance.match_id },
                //                             SeatId = GetRemoteSeatID((sbyte)cacheSitdownSeatId),
                //                             BringIn = (ulong)anteNumber,//rec.Chips
                //                             AutoOnTable = autoOnTable,
                //                             //Store= storeChip,
                //                             AutoUseWallet = autoUseWallet
                //     									}
                //                 });
                //         }
                //         return;
                //     }
                // });
                UIComponent.Instance.Toast("声纹认证暂未开启");
            }
            else {
                ProtocolAgency.Send<ClientMessageSeated.AsObject>({
                    Code: ProtocolCode.Protocol_Holdem_Seated,
                    RoomID: GameCache.Instance.room_id,
                    MatchID: GameCache.Instance.match_id,
                    Body: {
                        room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                        seatId: this.GetRemoteSeatID(this.cacheSitdownSeatId),
                        bringIn: anteNumber,//rec.Chips
                        autoOnTable: autoOnTable,
                        autoUseWallet: autoUseWallet,
                        returnOrNew: 0,
                        store: 0,
                        applyBringIn: (GameUtil.GetFriendsOrClubTable() == 1 || GameUtil.GetFriendsOrClubTable() == 2) && GameCache.Instance.FriendsTableLimitBringIn,
                        clubId: club_id,

                    },
                });
            }
            return;
        }
        //已经上桌就发送带入补充
        let IsUseWallet = true;
        if (this.mainPlayer.cacheStoreChips >= anteNumber) {
            IsUseWallet = false;
        }

        let applyBringIn = (GameUtil.GetFriendsOrClubTable() == 1 || GameUtil.GetFriendsOrClubTable() == 2) && GameCache.Instance.FriendsTableLimitBringIn;

        ProtocolAgency.Send<ClientMessageBringIn.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_BringIn,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                bringIn: anteNumber,
                useWallet: IsUseWallet,
                applyBringIn: applyBringIn
            },
        });
        //需要审核的加入提示信息
        // if (applyBringIn) {
        //     UIComponent.Instance.Toast(`${i18nMgr.Get("UITexas_FriendtableapplyBringinTips001")}${150}s`);
        // }
    }

    SetAutoOnTableChips(autoOnTable: number = 0, autoUseWallet: boolean = false) {
        ProtocolAgency.Send<ClientMessageSetAutoOnTable.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_SetAutoOnTable,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                autoOnTable: autoOnTable,//自动带入值
                autoUseWallet: autoUseWallet,//是否账户带入
            },
        });
    }
    /// <summary>
    /// 站起
    /// </summary>
    /// <param name="clientSeatId"></param>
    public Standup(): void {

        if (this.mainPlayer.seatID == -1) {
            return;
        }

        let mSeat: Seat = this.GetSeatByLocalSeatID(this.mainPlayer.seatID);

        if (null == mSeat)
            return;

        ProtocolAgency.Send<ClientMessageStandupActive.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_StandupActive,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
            },
        })
    }
    /// <summary>
    /// 获取筹码Sprite
    /// </summary>
    /// <param name="spriteName"></param>
    /// <returns></returns>
    // public GetChipSpriteBySpriteName(spriteName: string): cc.SpriteFrame {
    //     let sf: cc.SpriteFrame = AssetContext.getAsset(spriteName, AssetFold.texture_TexasUI);
    //     if (!sf) console.log("素材获取失败:", spriteName);
    //     return sf;
    // }

    // //获取气泡相关的spriteframe
    // public GetBubbleSpriteBySpriteName(spriteName: string): cc.SpriteFrame {
    //     let sf: cc.SpriteFrame = AssetContext.getAsset(spriteName, AssetFold.texture_TexasUI);
    //     if (!sf) console.log("素材获取失败:", spriteName);
    //     return sf;
    // }



    /// <summary>
    /// 播放发牌动画
    /// </summary>
    //public PlayDealAnimation(TweenCallback tweenCallback:Function) {
    public PlayDealAnimation(tweenCallback: Function) {


        this.sequencePlayDealAnimation = { tween: cc.tween(this.uirc.node), IsPlaying: true };

        let tween = this.sequencePlayDealAnimation.tween;

        //let sequence = [];

        let mSeat: Seat = null;

        // 庄家标志动画
        mSeat = this.GetSeatByLocalSeatID(this.bankerIndex);

        if (null != mSeat) {
            //let rtween = mSeat.PlayBankerAnimation(tween);
            //rtween?.delay(0.2);
            tween.delay(mSeat.PlayBankerAnimation() + 0.2);
            if (this.mushroomPool > 0) {
                mSeat.PlayMushroomBetAnimation();
            }
        }
        // 前注
        if (this.groupBet > 0) {

            let allGroupBet = 0;
            //let mIsFirstGroupBet = true;
            for (let i = 0, n = this.listSeat.length; i < n; i++) {
                mSeat = this.listSeat[i];
                if (null == mSeat || null == mSeat.Player || !mSeat.Player.isPlaying)
                    continue;
                mSeat.UpdateGroupBet();
                allGroupBet += this.groupBet;
                mSeat.PlayBetAnimation();
            }

            // mIsFirstGroupBet = true;

            for (let i = 0, n = this.listSeat.length; i < n; i++) {
                mSeat = this.listSeat[i];
                if (null == mSeat || null == mSeat.Player || !mSeat.Player.isParticipateInTheGame)
                    continue;
                mSeat.PlayRecyclingChipAnimation();
            }

            let mPotInfo: PotInfo = this.uirc.listPotInfo[0];
            mPotInfo.textPot.string = StringHelper.getStringDiv100(allGroupBet);
            mPotInfo.trans.active = true;
            //this.isMTT ? false : true;
        }
        //从小盲位置开始发牌
        let mStartPos: cc.Vec3 = this.uirc.main.convertToWorldSpaceAR(cc.v3(0, -1000));


        let mTmpIndex = 0;
        let endTime = 0;
        const seatCount = GameCache.Instance.seat_count;
        const rawStartIndex = this.dealStartIndex >= 0 ? this.dealStartIndex : this.smallIndex;
        const startIndex = ((rawStartIndex % seatCount) + seatCount) % seatCount;
        for (let i = startIndex, n = i + seatCount; i < n; i++) {
            let index = i % GameCache.Instance.seat_count;
            let mSeat = this.listSeat[index];
            //mSeat = this.listSeat[index];
            if (null == mSeat || null == mSeat.Player || !mSeat.Player.isParticipateInTheGame) continue;
            //spawn.push(cc.tween().sequence(cc.delayTime(0.2 * mTmpIndex), this.listSeat[index].PlayDealAnimation(mStartPos)));
            //this.listSeat[index].PlayDealAnimation(0.2 * mTmpIndex, mStartPos);
            //间隔时间
            let delayTime: number = .2 * mTmpIndex;
            endTime = delayTime;
            tween.then(cc.callFunc(() => {
                mSeat.PlayDealAnimation(delayTime, mStartPos).start();
            }));
            mTmpIndex++;
        }
        tween.delay(endTime + 0.4);

        if (null != tweenCallback) {
            this.sequencePlayDealAnimation.IsPlaying = false;
            tween.call(tweenCallback);
        }
        tween.start();
    }

    /// <summary>
    /// 操作
    /// </summary>
    /// <param name="action"></param>
    /// <param name="anteNumber"></param>
    public OptAction(action: Def.ActionMap[keyof Def.ActionMap], anteNumber: number): void {

        ProtocolAgency.Send<ClientMessageAction.AsObject>(
            {
                Code: ProtocolCode.Protocol_Holdem_Action,
                RoomID: GameCache.Instance.room_id,
                MatchID: GameCache.Instance.match_id,
                Body: {
                    room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                    action: action,
                    amount: anteNumber
                }
            });
    }

    /// <summary>
    /// 操作时间
    /// </summary>
    /// <returns></returns>
    public GetOpTime(): number {
        if (this.noLeftOperateTime == false && this.leftOperateTime > 0) {
            this.noLeftOperateTime = true;
            return this.leftOperateTime;
        }
        return this.opTime;
    }

    /// <summary>
    /// 隐藏自动操作面板
    /// </summary>
    public HideAutoOperationPanel(): void {
        UIComponent.Instance.HideUI(PrefabUI.UIAutoOperationComponent);
    }
    /// <summary>
    /// 展示操作面板
    /// </summary>
    /// <param name="operationData"></param>
    /// <param name="delay"></param> UIOperationComponent.OperationData
    public ShowOperationPanel(operationData: OperationData, delay: number = 0): void {
        if (operationData?.actionsList == null || operationData?.actionsList.length <= 0) {
            return;
        }
        if (this.mainPlayer != null) {
            let mSeat: Seat = null;
            for (let i = 0; i < this.listSeat.length; i++) {
                mSeat = this.listSeat[i];
                if (this.mainPlayer.seatID == mSeat.seatID) {
                    mSeat.SetOperationHeadActive(false);
                }
            }
        }
        this.uirc.Button_Delay.active = true;
        this.delayCount = delay;
        this.UpdateDelayBtn();
        UIComponent.Instance.ShowUI(PrefabUI.UIOperationComponent, operationData);
    }
    /// <summary>
    /// 隐藏操作面板
    /// </summary>
    public HideOperationPanel(): void {
        if (this.mainPlayer != null) {
            let mSeat: Seat = null;
            for (let i = 0; i < this.listSeat.length; i++) {
                mSeat = this.listSeat[i];
                if (this.mainPlayer.seatID == mSeat.seatID) {
                    mSeat.SetOperationHeadActive(true);
                }
            }
        }
        this.uirc.Button_Delay.active = false;
        UIComponent.Instance.HideUI(PrefabUI.UIOperationComponent);

    }
    /// <summary>
    /// 隐藏返回游戏按钮
    /// </summary>
    public HideCancelTrustBtn(): void {

        console.log("关闭了返回按钮？？？？？？？？？？？？");

        if (this.uirc.Button_CancelTrust.activeInHierarchy) {
            this.uirc.Button_CancelTrust.active = false;
        }
    }
    /// <summary>
    /// 回收筹码位置的世界坐标
    /// </summary>
    /// <returns></returns>
    public GetRecyclingChipPosV3(): cc.Vec3 {
        //return rc.transform.TransformPoint(this.gameUI.textAlreadAnte.transform.localPosition);
        return this.uirc.main.convertToWorldSpaceAR(this.uirc.Text_AlreadAnte.node.position);
    }
    /// <summary>
    /// 当前玩法的手牌数量
    /// </summary>
    public get HandCards(): number {
        return 2;
    }



    /// <summary>
    /// 获取当前已发公共牌数量 第二套
    /// </summary>
    /// <returns></returns>
    // public GetCurSecondPublicCardsCount(): number {
    //     this.cards_2 || this.ResetPublicCardsId_2();

    //     for (let i = 0, n = this.cards_2.length; i < n; i++) {
    //         if (this.cards_2[i] == -1)
    //             return i;
    //     }

    //     // 最多5张
    //     return 5;
    // }







    /// <summary>
    /// 刷新公共牌 第一套
    /// </summary>
    public UpdatePublicCards(startIndex: number, tweenCallback: Function, SecondtweenCallback: Function): void {
        // if (null == this.cards_1)
        //     return;

        let mCacheCount: number = this.GetPublicCardsCount(1);

        if (mCacheCount == 0) {
            this.ClearPublicCardsUI();
            return;
        }

        // 公共牌动画
        this.sequenceUpdatePublicCards = DOTween.Sequence(this.sequenceUpdatePublicCards_obj);
        //{ tween: cc.tween(this.uirc.node), IsPlaying: true };
        //let tween: cc.Tween = this.sequenceUpdatePublicCards.tween;

        this.fuck4thPCardByInsuranceState = 0;

        let PublicCardInfo: PublicCardInfo = null;
        let cardId = null;

        let cards = this.GetPublicCards(1);

        if (startIndex == 0) {
            //第0张牌，设定第1,2张牌位置都在0号位置
            let index = 2;
            PublicCardInfo = this.uirc.listCards[index];
            //PublicCardInfo.cardId = this.cards[index];
            cardId = cards[index];
            PublicHelper.InitSprite(PublicCardInfo.imageCard);//, this.GetBigPokerSP(GameUtil.GetCardNameByNum(-1)));
            PublicHelper.InitNode(PublicCardInfo.trans, this.listDefaultPublicCardsLPos[0]);
            PublicCardInfo.SetSpriteFrame(-1);

            this.sequenceUpdatePublicCards.Append(() => {
                cc.tween(PublicCardInfo.trans).to(.1, { scaleX: 0 }).start();
            }, .1)
            this.sequenceUpdatePublicCards.Append(() => {
                GC.sound.Play("sfx_desk_chat");
                //PublicCardInfo.imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId));
                PublicCardInfo.SetSpriteFrame(cardId);

                cc.tween(PublicCardInfo.trans).to(0.1, { scaleX: 1 }).start();
            }, .1);

            this.sequenceUpdatePublicCards.AppendInterval(0.4);

            //全体归位到0号位置并且显示
            for (let i = 0; i < 3; i++) {
                let PublicCardInfo = this.uirc.listCards[i];
                let trans = PublicCardInfo.trans;
                let imageCard = PublicCardInfo.imageCard;
                let cardId = cards[i];
                let move_pos = this.listDefaultPublicCardsLPos[i];
                //PublicCardInfo.cardId = cardId;
                trans.setPosition(this.listDefaultPublicCardsLPos[0]);
                if (i == 0) {
                    this.sequenceUpdatePublicCards.Append(() => {
                        trans.active = true;
                        trans.setScale(1, 1);
                        PublicHelper.InitSprite(imageCard);//, this.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId)));
                        PublicCardInfo.SetSpriteFrame(cardId);
                        cc.tween(trans).to(.4, { position: move_pos }).start();
                    }, .4);
                } else {
                    this.sequenceUpdatePublicCards.Join(() => {
                        trans.active = true;
                        trans.setScale(1, 1);
                        PublicHelper.InitSprite(imageCard);//, this.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId)));
                        PublicCardInfo.SetSpriteFrame(cardId);
                        cc.tween(trans).to(.4, { position: move_pos }).start();
                    }, .4);
                }
                //添加目标和目标结果
                this.sequenceUpdatePublicCards.AddTarget(trans);
                this.sequenceUpdatePublicCards.AddChildComplete(() => {
                    trans.active = true;
                    trans.setPosition(move_pos);
                    trans.setScale(1, 1);
                    //imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId));
                    PublicCardInfo.SetSpriteFrame(cardId);
                });

            }
            if (mCacheCount == 5) {
                // 一下下发5张
                for (let i = 3; i < mCacheCount; i++) {
                    let PublicCardInfo = this.uirc.listCards[i];
                    let trans = PublicCardInfo.trans;
                    let imageCard = PublicCardInfo.imageCard;
                    let cardId = cards[i];
                    //PublicCardInfo.cardId = cardId;
                    PublicHelper.InitSprite(imageCard);//, this.GetBigPokerSP(GameUtil.GetCardNameByNum(-1)));
                    PublicHelper.InitNode(trans, this.listDefaultPublicCardsLPos[i], false);
                    PublicCardInfo.SetSpriteFrame(-1);
                    this.sequenceUpdatePublicCards.Append(
                        () => {
                            trans.active = true;
                            cc.tween(trans).to(.2, { scaleX: 0 }).then(cc.callFunc(() => {
                                //imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId));
                                PublicCardInfo.SetSpriteFrame(cardId);
                                GC.sound.Play("sfx_desk_chat");
                            })).to(.2, { scaleX: 1 }).start();
                        },
                        .4);

                    //添加目标和目标结果
                    this.sequenceUpdatePublicCards.AddTarget(trans);
                    this.sequenceUpdatePublicCards.AddChildComplete(() => {
                        trans.active = true;
                        trans.setScale(1, 1);
                        //imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId));
                        PublicCardInfo.SetSpriteFrame(cardId);
                    });

                }
            }
        }
        else {
            for (let i = startIndex, n = mCacheCount; i < n; i++) {
                let PublicCardInfo = this.uirc.listCards[i];
                let trans = PublicCardInfo.trans;
                let imageCard = PublicCardInfo.imageCard;
                let cardId = cards[i];
                let move_pos = this.listDefaultPublicCardsLPos[i];
                //PublicCardInfo.cardId = cardId;
                PublicHelper.InitSprite(imageCard);//, this.GetBigPokerSP(GameUtil.GetCardNameByNum(-1)));
                PublicHelper.InitNode(trans, move_pos, false);
                PublicCardInfo.SetSpriteFrame(-1);

                this.sequenceUpdatePublicCards.Append(
                    () => {
                        trans.active = true;
                        cc.tween(trans).to(.2, { scaleX: 0 }).call(() => {
                            //imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId));
                            PublicCardInfo.SetSpriteFrame(cardId);
                        }).to(.2, { scaleX: 1 }).start();
                    },
                    .4);

                //添加目标和目标结果
                this.sequenceUpdatePublicCards.AddTarget(trans);
                this.sequenceUpdatePublicCards.AddChildComplete(() => {
                    trans.active = true;
                    trans.setPosition(move_pos);
                    trans.setScale(1, 1);
                    //imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId));
                    PublicCardInfo.SetSpriteFrame(cardId);
                });

            }
            for (let i = mCacheCount, n = this.uirc.listCards.length; i < n; i++) {
                PublicCardInfo = this.uirc.listCards[i];
                //PublicCardInfo.cardId = -1;
                PublicCardInfo.trans.active = false;
            }
        }

        // 参与了牌局，才能看到牌型提示
        let mClientSeat: Seat = this.GetSeatByClientId(0);

        if (null != mClientSeat.Player && mClientSeat.Player.userID == this.mainPlayer.userID && this.mainPlayer.isParticipateInTheGame) {
            this.sequenceUpdatePublicCards.OnComplete(() => {

                let highlightCards_ref = { highlightCards: null };
                let cardType: CardType = this.GetCardType(highlightCards_ref, cards);
                let highlightCards = highlightCards_ref.highlightCards;
                for (let i = 0, n = this.uirc.listCards.length; i < n; i++) {
                    this.uirc.listCards[i].imageSelect.node.active = false;
                    for (let j = 0, m = highlightCards.length; j < m; j++) {
                        if (this.uirc.listCards[i].cardId == highlightCards[j]) {
                            this.uirc.listCards[i].imageSelect.node.active = true;
                            break;
                        }
                    }
                }

                let mSeat: Seat = this.GetSeatByLocalSeatID(this.mainPlayer.seatID);
                if (null != mSeat) {
                    mSeat.UpdateCardType(cardType, highlightCards);
                }
                tweenCallback?.();


            })
        }
        else {

            this.sequenceUpdatePublicCards.OnComplete(() => {
                tweenCallback?.();
            })
        }

        if (mCacheCount == 5 && SecondtweenCallback != null && this.IsSecondPsc) {

            this.sequenceUpdatePublicCards.AppendInterval(0.5);

            this.sequenceUpdatePublicCards.OnComplete(() => {
                SecondtweenCallback();
            });
        }
        this.sequenceUpdatePublicCards.Play();
    }

    /// <summary>
    /// 刷新公共牌 第二套
    /// </summary>
    public UpdateSecondPublicCards(CardsCount: number, cards_2Count: number, tweenCallback: Function): void {
        // if (null == this.cards_1)
        //     return;

        let CacheCount = this.GetPublicCardsCount(2);

        if (CacheCount == 0) {
            this.ClearSecondPublicCardsUI();
            return;
        }
        // 公共牌动画
        //this.sequenceSecondUpdatePublicCards = DOTween.Sequence();
        this.sequenceSecondUpdatePublicCards = { tween: cc.tween(this.uirc.node), IsPlaying: true };
        let tween: cc.Tween = this.sequenceSecondUpdatePublicCards.tween;
        let cards: number[] = this.GetPublicCards(2);
        //第二套牌为五张牌时
        if (cards_2Count == 5) {
            //#region 第三张牌翻牌动画
            let PublicCardInfo: PublicCardInfo = null;
            PublicCardInfo = this.uirc.listSecondCards[2];//三张一起发，从第三张显示翻牌动画
            PublicCardInfo.imageCard.node.color = cc.Color.WHITE;
            //PublicCardInfo.cardId = this.cards_2[2];
            //PublicCardInfo.imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(-1));
            PublicCardInfo.SetSpriteFrame(-1);
            PublicCardInfo.trans.setPosition(this.listDefaultSecondPublicCardsLPos[0]);
            PublicCardInfo.trans.setScale(cc.Vec3.ONE);
            PublicCardInfo.trans.active = true;
            let CacheCardId = cards[2];
            //PublicCardInfo.cardId;
            //let CacheImage: cc.Sprite = PublicCardInfo.imageCard;
            let CacheTrans = PublicCardInfo.trans;
            tween.then(cc.callFunc(() => {
                cc.tween(CacheTrans).to(.1, { scaleX: 0 }).then(cc.callFunc(() => {
                    //CacheImage.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(CacheCardId));
                    PublicCardInfo.SetSpriteFrame(CacheCardId);

                    GC.sound.Play("sfx_desk_chat");
                })).to(.1, { scaleX: 1 }).call(() => {
                    let mPublicCardInfo0: PublicCardInfo = this.uirc.listSecondCards[0];
                    mPublicCardInfo0.imageCard.node.color = cc.Color.WHITE;
                    //mPublicCardInfo0.cardId = this.cards_2[0];
                    //mPublicCardInfo0.imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(mPublicCardInfo0.cardId));
                    mPublicCardInfo0.SetSpriteFrame(cards[0]);
                    mPublicCardInfo0.trans.setPosition(this.listDefaultSecondPublicCardsLPos[0]);
                    mPublicCardInfo0.trans.setScale(cc.Vec3.ONE);
                    mPublicCardInfo0.trans.active = true;
                }).start();
            }))

            tween.delay(.2);


            tween.delay(.4);

            //#endregion
            //#region 前三张牌移动动画
            let mTmpStartIndex = 1;
            for (let i = mTmpStartIndex; i < 3; i++) {
                let cardTypeIndex = i;
                let PublicCardInfo = this.uirc.listSecondCards[i];
                let PublicCardInfo_card = cards[i];
                PublicCardInfo.imageCard.node.color = cc.Color.WHITE;
                //PublicCardInfo.cardId = this.cards_2[i];
                if (i != 2) {
                    //PublicCardInfo.imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(PublicCardInfo.cardId));
                    PublicCardInfo.SetSpriteFrame(PublicCardInfo_card);
                }
                PublicCardInfo.trans.setPosition(this.listDefaultSecondPublicCardsLPos[0]);
                let mCacheTrans = PublicCardInfo.trans;
                if (i == mTmpStartIndex) {

                    tween.then(cc.callFunc(() => {
                        mCacheTrans.active = true;
                        cc.tween(mCacheTrans).to(.4, { position: this.listDefaultSecondPublicCardsLPos[i] }).start();
                    }))

                }
                else if (i > mTmpStartIndex) {

                    tween.then(cc.callFunc(() => {
                        mCacheTrans.active = true;
                        cc.tween(mCacheTrans).to(.4, { position: this.listDefaultSecondPublicCardsLPos[i] }).call(() => {
                            if (cardTypeIndex == 2) {
                                let sCards: number[] = [];
                                sCards.push(...cards);
                                sCards[cardTypeIndex + 1] = -1;
                                sCards[cardTypeIndex + 2] = -1;
                                this.UpdateSecondPublicCardsCardType(sCards);
                            }
                        }).start();
                    }))
                }
                if (i == 2) tween.delay(.4);
            }
            //#endregion
            //#region 后两张牌翻牌动画
            for (let i = 3; i < cards_2Count; i++) {
                let cardTypeIndex = i;
                let PublicCardInfo = this.uirc.listSecondCards[i];
                PublicCardInfo.imageCard.node.color = cc.Color.WHITE;
                //PublicCardInfo.cardId = this.cards_2[i];
                //PublicCardInfo.imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(-1));
                PublicCardInfo.SetSpriteFrame(-1);
                PublicCardInfo.trans.setPosition(this.listDefaultSecondPublicCardsLPos[i]);
                let mCacheTrans = PublicCardInfo.trans;
                let mCacheCardId1 = cards[i];
                //PublicCardInfo.cardId;
                let mCacheImage1 = PublicCardInfo.imageCard;

                tween.then(cc.callFunc(() => {
                    mCacheTrans.active = true;
                    cc.tween(mCacheTrans).to(.2, { scaleX: 0 }).then(cc.callFunc(() => {
                        //mCacheImage1.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(mCacheCardId1));
                        PublicCardInfo.SetSpriteFrame(mCacheCardId1);
                        GC.sound.Play("sfx_desk_chat");
                    })).to(.2, { scaleX: 1 }).call(() => {
                        if (cardTypeIndex == 3) {
                            let sCards = []
                            sCards.push(...cards);
                            sCards[cardTypeIndex + 1] = -1;

                            this.UpdateSecondPublicCardsCardType(sCards);
                        }
                        else {
                            this.UpdateSecondPublicCardsCardType(cards);
                        }
                    }).start();
                }))
            }
            //#endregion
        }
        else {
            for (let i = 0; i < CacheCount - cards_2Count; i++) {
                let cardTypeIndex = i;
                let PublicCardInfo: PublicCardInfo = this.uirc.listSecondCards[i];
                //PublicCardInfo.cardId = this.cards_2[i];
                PublicCardInfo.trans.setPosition(this.listDefaultPublicCardsLPos[i]);
                PublicCardInfo.trans.setScale(cc.Vec3.ONE);
                PublicCardInfo.imageCard.node.color = cc.Color.WHITE;
                PublicCardInfo.SetSpriteFrame(cards[i]);
                //PublicCardInfo.imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(this.cards_2[i]));
                //let mCacheCardId = PublicCardInfo.cardId;
                //let mCacheImage = PublicCardInfo.imageCard;
                let mCacheTrans = PublicCardInfo.trans;
                let CacheDefaultPublicCardsLPos = cc.v2(this.listDefaultSecondPublicCardsLPos[i].x, this.listDefaultSecondPublicCardsLPos[i].y);
                mCacheTrans.active = true;
                tween.then(cc.callFunc(() => {

                    cc.tween(mCacheTrans).to(.2, { scaleX: 1.2 }).then(cc.callFunc(() => {

                        GC.sound.Play("sfx_desk_chat");

                    })).parallel(cc.scaleTo(.2, 1), cc.moveTo(0.4, CacheDefaultPublicCardsLPos)).then(cc.callFunc(() => {
                        if (cardTypeIndex == 2) {
                            let sCards = [];
                            sCards.push(...cards);
                            sCards[cardTypeIndex + 1] = -1;
                            sCards[cardTypeIndex + 2] = -1;
                            this.UpdateSecondPublicCardsCardType(sCards);
                        }
                    })).start();
                }));
                //以上时间累加 0.2 +0.4
                tween.delay(0.6);
            }
            tween.delay(0.4);
            for (let i = CacheCount - cards_2Count, n = CacheCount; i < n; i++) {
                let cardTypeIndex = i;
                let PublicCardInfo: PublicCardInfo = this.uirc.listSecondCards[i];
                //PublicCardInfo.cardId = this.cards_2[i];
                PublicCardInfo.trans.setPosition(this.listDefaultSecondPublicCardsLPos[i]);
                PublicCardInfo.trans.setScale(cc.Vec3.ONE);
                PublicCardInfo.imageCard.node.color = cc.Color.WHITE;
                //PublicCardInfo.imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(-1));
                PublicCardInfo.SetSpriteFrame(-1);
                let mCacheCardId = cards[i];
                //PublicCardInfo.cardId;
                let mCacheImage = PublicCardInfo.imageCard;
                let mCacheTrans = PublicCardInfo.trans;

                tween.then(cc.callFunc(() => {
                    mCacheTrans.active = true;
                    cc.tween(mCacheTrans).to(.2, { scaleX: 0 }).then(cc.callFunc(() => {
                        PublicCardInfo.SetSpriteFrame(mCacheCardId);
                        //mCacheImage.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(mCacheCardId));
                        GC.sound.Play("sfx_desk_chat");
                    })).to(.2, { scaleX: 1 }).call(() => {
                        if (cardTypeIndex == 3) {
                            let sCards = [];
                            sCards.push(...cards);
                            sCards[cardTypeIndex + 1] = -1;
                            sCards[cardTypeIndex + 2] = -1;
                            this.UpdateSecondPublicCardsCardType(sCards);
                        }
                        else {
                            this.UpdateSecondPublicCardsCardType(cards);
                        }
                    }).start();
                }));
                tween.delay(0.4);
            }
        }
        tween.call(() => {
            this.sequenceSecondUpdatePublicCards.IsPlaying = false;
        });
        tween.start();
    }


    /// <summary>
    /// 刷新第二套当前玩家牌型显示
    /// </summary>
    protected UpdateSecondPublicCardsCardType(secondPublicCards: number[]): void {
        // 参与了牌局，才能看到牌型提示
        if (null != this.mainPlayer && this.mainPlayer.cards.length > 0) {

            let highlightCards_ref = { highlightCards: null };
            let cardType: CardType = this.GetCardType(highlightCards_ref, secondPublicCards);
            let highlightCards = highlightCards_ref.highlightCards;




            for (let i = 0, n = this.uirc.listSecondCards.length; i < n; i++) {
                this.uirc.listSecondCards[i].imageSelect.node.active = false;
                for (let j = 0, m = highlightCards.length; j < m; j++) {
                    if (this.uirc.listSecondCards[i].cardId == highlightCards[j]) {
                        this.uirc.listSecondCards[i].imageSelect.node.active = true;
                        break;
                    }
                }
            }

            let mSeat: Seat = this.GetSeatByLocalSeatID(this.mainPlayer.seatID);
            if (null != mSeat) {
                mSeat.UpdateCardType(cardType, highlightCards);
            }
        }
        else {
            //清空牌型提示
            for (let i = 0, n = this.uirc.listCards.length; i < n; i++) {
                this.uirc.listSecondCards[i].imageSelect.node.active = false;
            }
            if (this.mainPlayer != null) {
                let mSeat: Seat = this.GetSeatByLocalSeatID(this.mainPlayer.seatID);
                if (null != mSeat) {
                    mSeat.HideCardType();
                }
            }

        }
    }


    /// <summary>
    /// 添加公共牌Id
    /// </summary>
    /// <param name="list"></param>
    // public AddSecondPublicCards(list: number[]): void {
    //     // // 判断一下cards的合法性
    //     // if (null == this.cards_2)
    //     //     this.cards_2 = []

    //     // this.cards_2 = [];
    //     for (let i = 0; i < this.uirc.listSecondCards.length; i++) {
    //         this.cards_2.push(-1);
    //     }
    //     if (list.length < this.uirc.listSecondCards.length) {
    //         for (let i = 0, n = this.uirc.listSecondCards.length - list.length; i < n; i++) {
    //             this.cards_2[i] = this.cards_1[i];
    //         }
    //         for (let i = 0; i < list.length; i++) {
    //             this.cards_2[i + this.uirc.listSecondCards.length - list.length] = list[i];
    //         }
    //     }
    //     else {
    //         for (let i = 0, n = list.length; i < n; i++) {
    //             this.cards_2[i] = list[i];
    //         }
    //     }
    // }
    /// <summary>
    /// 播放首次收筹码到底池动画
    /// </summary>Sequence
    public PlayFirstRecyclingChipAnimation(tweenCallback) {
        this.fuck4thPCardByInsuranceState = 1;
        let mSeat: Seat = null;
        this.sequencePlayFirstRecyclingChipAnimation = {};
        for (let i = 0, n = this.listSeat.length; i < n; i++) {
            mSeat = this.listSeat[i];
            if (null == mSeat || null == mSeat.Player || !mSeat.Player.isParticipateInTheGame)
                continue;
            this.sequencePlayFirstRecyclingChipAnimation.tween = mSeat.PlayRecyclingChipAnimation();
        }
        let tween = this.sequencePlayFirstRecyclingChipAnimation.tween;

        if (null != tween) {

            this.sequencePlayFirstRecyclingChipAnimation.complete = () => {
                this.sequencePlayFirstRecyclingChipAnimation.IsPlaying = false;
                tweenCallback?.();
            }
            this.sequencePlayFirstRecyclingChipAnimation.IsPlaying = true;
            tween.call(this.sequencePlayFirstRecyclingChipAnimation.complete);
            tween.start();
        }
        else {
            tweenCallback?.();
        }
        return this.sequencePlayFirstRecyclingChipAnimation;
    }
    /// <summary>
    /// 播放收筹码到底池动画
    /// </summary>
    public PlayRecyclingChipAnimation(tweenCallback: Function): void {
        let mSeat: Seat = null;
        this.sequencePlayRecyclingChipAnimation = {};
        for (let i = 0, n = this.listSeat.length; i < n; i++) {
            mSeat = this.listSeat[i];
            if (null == mSeat || null == mSeat.Player || !mSeat.Player.isParticipateInTheGame)
                continue;
            this.sequencePlayRecyclingChipAnimation.tween = mSeat.PlayRecyclingChipAnimation();
        }
        let tween = this.sequencePlayRecyclingChipAnimation.tween;
        if (null != tween) {
            if (null != tweenCallback) {

                this.sequencePlayRecyclingChipAnimation.complete = () => {
                    this.sequencePlayRecyclingChipAnimation.IsPlaying = false;
                    this.UpdatePots();
                    tweenCallback?.();
                }
            }
            else {
                //sequencePlayRecyclingChipAnimation.OnComplete(UpdatePots);
                this.sequencePlayRecyclingChipAnimation.complete = () => {
                    this.sequencePlayRecyclingChipAnimation.IsPlaying = false;
                    this.UpdatePots();
                }
            }
            this.sequencePlayRecyclingChipAnimation.IsPlaying = true;
            tween.call(this.sequencePlayRecyclingChipAnimation.complete);
            tween.start();
        }
        else {
            this.UpdatePots();
            tweenCallback?.();
        }
    }

    /// <summary>
    /// 播放本轮结束公共牌动画
    /// </summary>
    public PlayEndPublicCardsAnimation(rec: ServerMessageWinner.AsObject): void {
        // Log.Msg(rec);

        let mCacheWinnerSeatIds: number[] = null; // 赢家座位
        let mCacheWinnerCardTypes: number[] = null; // 赢家牌型

        for (let i = 0, n = rec.resultsList.length; i < n; i++) {
            // 找到赢家
            if (rec.resultsList[i].win > 0) {
                if (null == mCacheWinnerSeatIds)
                    mCacheWinnerSeatIds = [];
                mCacheWinnerSeatIds.push(this.GetLocalSeatID(rec.resultsList[i].seatId));
                if (null == mCacheWinnerCardTypes)
                    mCacheWinnerCardTypes = [];
                mCacheWinnerCardTypes.push(rec.resultsList[i].handValueType);
            }
        }

        // rec.cardSort会五个五个一组，对应赢家数量
        let mTmpCardSorts = [];
        //int mGroup = rec.cardSort.Count / 5;
        for (let i = 0, n = rec.resultsList.length; i < n; i++) {
            let mTmpCards = [];
            for (let j = 0, m = rec.resultsList[i].winCardsList.length; j < m; j++) {
                mTmpCards.push(rec.resultsList[i].winCardsList[j].card);
            }
            mTmpCardSorts.push(mTmpCards);
        }

        let mHaveCardSort = true;


        if (null == mCacheWinnerSeatIds || mCacheWinnerSeatIds.length == 0 || !mHaveCardSort) {
            // 没有赢家
            return;
        }


        let mWinnerIndex = 0;
        for (let i = 0, n = mCacheWinnerSeatIds.length; i < n; i++) {
            if (this.mainPlayer.isPlaying && this.mainPlayer.seatID == mCacheWinnerSeatIds[i]) {
                mWinnerIndex = i;
                break;
            }
        }

        let mIsFirst = true;
        let mCacheCardIds = [];
        let cards = this.GetPublicCards(1);
        for (let i = 0, n = this.uirc.listCards.length; i < n; i++) {
            for (let j = 0, m = mTmpCardSorts[mWinnerIndex].length; j < m; j++) {
                if (mCacheCardIds.includes(this.uirc.listCards[i].cardId))
                    continue;
                if (mTmpCardSorts[mWinnerIndex][j] > 4 || mTmpCardSorts[mWinnerIndex][j] < 0)
                    continue;

                if (this.uirc.listCards[i].cardId == cards[mTmpCardSorts[mWinnerIndex][j]]) {
                    mCacheCardIds.push(this.uirc.listCards[i].cardId);
                    if (mIsFirst) {
                        mIsFirst = false;
                        //公共牌向上移
                        //sequencePlayEndPublicCardsAnimation.Append(listCards[i].trans.DOLocalMoveY(40, 0.3f));
                    }
                    else {    //公共牌向上移
                        //sequencePlayEndPublicCardsAnimation.Join(listCards[i].trans.DOLocalMoveY(40, 0.3f));
                    }

                    //sequencePlayEndPublicCardsAnimation.Join(listCards[i].imageCard.DOColor(Color.white, 0.2f));
                    break;
                }
            }
        }
    }


    /// <summary>
    /// 把座位设为能不能接收语音验证状态 true是不能 false能接收
    /// </summary>
    public SetIsEixt(can: boolean): void {
        if (GameCache.Instance.voiceprint_verify_on == 1) {
            //TODO
            let seat: Seat = GameCache.Instance.CurGame.GetSeatByUserId(GameCache.Instance.CurGame.mainPlayer.userID);
            if (seat != null) {
                seat.IsExit = can;
            }
        }
    }




    /// <summary>
    /// 计算牌型
    /// </summary>
    /// <param name="highlightCards"></param>
    /// <returns></returns>
    public GetCardType(highlightCards_ref: { highlightCards: number[] }, publicCards: number[]): CardType {
        let mCards: number[] = [...publicCards, ...this.mainPlayer.cards];
        return CardTypeUtil.GetCardType(mCards, highlightCards_ref, GameUtil.JudgeIsSixPlusRoomPath(GameCache.Instance.room_type));
    }

    public PlayFirstRecyclingChipSubAnimation(tweenCallback?: Function): void {

        this.fuck4thPCardByInsuranceState = 2;

        let mPotInfo: PotInfo = this.uirc.listPotInfo[0];

        mPotInfo.textPot.string = StringHelper.getStringDiv100(this.alreadAnte);
        //判断MTT就不显示(暂时修改)
        mPotInfo.trans.active = true;
        //this.isMTT ? false : true;

        if (null != tweenCallback) {
            this.UpdatePots();
            tweenCallback();
        }
        else {
            this.UpdatePots();
        }
    }


    /// <summary>
    /// 带出
    /// </summary>
    /// <param name="anteNumber"></param>
    public OutChips(anteNumber: number): void {
        if (anteNumber >= this.mainPlayer.chips) {
            return;
        }
        this.cacheOutChips = anteNumber;
        ProtocolAgency.Send<ClientMessageStoreChips.AsObject>(
            {
                Code: ProtocolCode.Protocol_Holdem_StoreChips,
                RoomID: GameCache.Instance.room_id,
                MatchID: GameCache.Instance.match_id,
                Body: {
                    room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                    store: anteNumber
                }
            });
    }


    private SetSeeMorePublicCardPrice() {

        let normal = this.uirc.Button_SeeMorePublic.getChildByName("normal");
        let discount = this.uirc.Button_SeeMorePublic.getChildByName("discount");
        let free = this.uirc.Button_SeeMorePublic.getChildByName("free");

        normal.active = false;
        discount.active = false;
        free.active = false;

        let thousand = 0;

        let public_card_count = this.GetPublicCardsCount(1);

        if (public_card_count == 0) {
            thousand = 1;
        }
        else if (public_card_count == 3) {
            thousand = 2;
        }
        else {
            thousand = 3;
        }


        let diamondConfig = DiamondModel.Instance.GetDiamondConfig(this.GetDiamondTypeText(8, thousand), 8);
        if (diamondConfig == null) {
            console.log("未拿到查看翻牌配置");
            return;
        }
        let DiamondConfigSetting = this.GetSetting(diamondConfig);

        if (diamondConfig == null || DiamondConfigSetting == null) {
            console.log("未拿到查看翻牌配置");
            return;
        }

        console.log("DiamondConfigSetting", DiamondConfigSetting);

        if (DiamondConfigSetting.discount_price == 0) {

            free.active = true;
            this.uirc.setChildLabel(free, "label", `${DiamondConfigSetting.price}`);
        }
        else if (DiamondConfigSetting.discount_price == DiamondConfigSetting.price) {

            normal.active = true;

            this.uirc.setChildLabel(normal, "label", `${DiamondConfigSetting.price}`);
        }
        else if (DiamondConfigSetting.discount_price < DiamondConfigSetting.price) {

            discount.active = true;

            this.uirc.setChildLabel(discount, "old_label", `${DiamondConfigSetting.price}`);
            this.uirc.setChildLabel(discount, "new_label", `${DiamondConfigSetting.discount_price}`);
        }
    }
    private GetSetting(diamondConfig) {
        if (diamondConfig.setting) {
            for (let item of diamondConfig.setting) {
                if (item.sb == this.smallBlind) {
                    return item;
                }
            }
        }
        return null;
    }
    // 显示查看更多公共牌
    public ShowSeeMorePublic(): void {
        if (!this.mainPlayer.isParticipateInTheGame)
            return;

        let public_card_count = this.GetPublicCardsCount(1);

        if (public_card_count == 5) return;

        this.SetSeeMorePublicCardPrice();
        //let mCost = GameUtil.GetSeeMoreCost(this.smallBlind / 100 ^ 0);
        //this.uirc.textSeeMorePublicGold.string = `${StringHelper.GetLongString(mCost)}`;

        switch (public_card_count) {
            case 0:
                // textSeeMorePublic.text = $"查看翻牌";
                this.uirc.textSeeMorePublic.string = CPErrorCode.LanguageDescription(10018);
                break;
            case 3:
                // textSeeMorePublic.text = $"查看转牌";
                this.uirc.textSeeMorePublic.string = CPErrorCode.LanguageDescription(10019);
                break;
            default:
                // textSeeMorePublic.text = $"查看河牌";
                this.uirc.textSeeMorePublic.string = CPErrorCode.LanguageDescription(10020);
                break;
        }

        if (GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit)//MTT没有查看翻牌
        {

            this.uirc.Button_SeeMorePublic.active = true;
            this.InteractableSeeMorePublic(true);
        }

    }

    /// <summary>
    /// 重置公共牌Image
    /// </summary>
    public ResetPublicCardsImage(): void {
        this.__ResetPublicCardsImage(this.uirc.listCards, this.listDefaultPublicCardsLPos);
    }
    /// <summary>
    /// 重置公共牌Image
    /// </summary>
    public ResetSecondPublicCardsImage(): void {
        this.__ResetPublicCardsImage(this.uirc.listSecondCards, this.listDefaultSecondPublicCardsLPos);
    }
    private __ResetPublicCardsImage(listCards: PublicCardInfo[], listDefaultPublicCardsLPos: cc.Vec3[]) {
        let PublicCardInfo: PublicCardInfo = null;
        for (let i = 0, n = listCards.length; i < n; i++) {
            PublicCardInfo = listCards[i];
            PublicCardInfo.imageCard.node.color = cc.Color.WHITE;
            PublicCardInfo.SetSpriteFrame(-1);
            // PublicCardInfo.cardId = -1;
            // PublicCardInfo.imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(PublicCardInfo.cardId));
            PublicCardInfo.imageSelect.node.active = false;
            PublicCardInfo.trans.setPosition(listDefaultPublicCardsLPos[i]);
            PublicCardInfo.trans.setScale(cc.Vec3.ONE);
            PublicCardInfo.trans.active = false;
        }
    }
    /// <summary>
    /// 设置第一套公共牌颜色
    /// </summary>
    public SetPublicCardsImageColor(color): void {
        let PublicCardInfo: PublicCardInfo = null;
        for (let i = 0, n = this.uirc.listCards.length; i < n; i++) {
            PublicCardInfo = this.uirc.listCards[i];
            PublicCardInfo.imageCard.node.color = color;
            PublicCardInfo.imageSelect.node.active = false;
        }
    }
    public SetSecondPublicCardImageColor(color): void {
        let SecondPublicCardInfo: PublicCardInfo = null;
        for (let i = 0, n = this.uirc.listSecondCards.length; i < n; i++) {
            SecondPublicCardInfo = this.uirc.listSecondCards[i];
            SecondPublicCardInfo.imageCard.node.color = color;
            SecondPublicCardInfo.imageSelect.node.active = false;
        }
    }


    //#region 第一套公共牌
    /// <summary>
    /// 刷新公共牌(不带动画）
    /// </summary>
    public UpdatePublicCardsNoAnim(): void {

        if (this.uirc.listCards.length == 0) return;

        console.log("显示公共牌");

        let mPublicCardInfo: PublicCardInfo;

        let cards = this.GetPublicCards(1);

        let public_card_count = this.GetPublicCardsCount(1);

        for (let i = 0, n = public_card_count; i < n; i++) {
            mPublicCardInfo = this.uirc.listCards[i];
            //mPublicCardInfo.cardId = this.cards[i];
            PublicHelper.InitNode(mPublicCardInfo.trans, this.listDefaultPublicCardsLPos[i], true);
            PublicHelper.InitSprite(mPublicCardInfo.imageCard);//, this.GetBigPokerSP(GameUtil.GetCardNameByNum(mPublicCardInfo.cardId)));
            mPublicCardInfo.SetSpriteFrame(cards[i]);
        }

        for (let i = public_card_count, n = this.uirc.listCards.length; i < n; i++) {
            mPublicCardInfo = this.uirc.listCards[i];
            //mPublicCardInfo.cardId = -1;
            PublicHelper.InitNode(mPublicCardInfo.trans, this.listDefaultPublicCardsLPos[i], false);
            PublicHelper.InitSprite(mPublicCardInfo.imageCard);//, this.GetBigPokerSP(GameUtil.GetCardNameByNum(mPublicCardInfo.cardId)));
            mPublicCardInfo.SetSpriteFrame(-1);
        }

        // 参与了牌局，才能看到牌型提示
        if (null != this.mainPlayer && this.mainPlayer.isPlaying) {
            let highlightCards_ref = { highlightCards: null };

            let cardType: CardType = this.GetCardType(highlightCards_ref, cards);

            let highlightCards = highlightCards_ref.highlightCards;

            for (let i = 0, n = this.uirc.listCards.length; i < n; i++) {
                this.uirc.listCards[i].imageSelect.node.active = false;
                for (let j = 0, m = highlightCards.length; j < m; j++) {
                    if (this.uirc.listCards[i].cardId == highlightCards[j]) {
                        this.uirc.listCards[i].imageSelect.node.active = true;
                        break;
                    }
                }
            }

            let mSeat: Seat = this.GetSeatByLocalSeatID(this.mainPlayer.seatID);
            if (null != mSeat) {
                mSeat.UpdateCardType(cardType, highlightCards);
            }
        }
        else {
            //清空牌型提示
            for (let i = 0, n = this.uirc.listCards.length; i < n; i++) {
                this.uirc.listCards[i].imageSelect.node.active = false;
            }
            if (this.mainPlayer != null) {
                let mSeat: Seat = this.GetSeatByLocalSeatID(this.mainPlayer.seatID);
                if (null != mSeat) {
                    mSeat.HideCardType();
                }
            }

        }
    }

    /// <summary>
    /// 留座离桌
    /// </summary>
    public SendReserveSeatAction(option: boolean): void {
        ProtocolAgency.Send<ClientMessageKeepSeatActive.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_KeepSeatActive,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                keep: option,
                duration: 120
            },
        });
    }

    /// <summary>
    /// 清空气泡
    /// </summary>
    public ClearSeatBubble(isRoundFinish: boolean): void {
        let mSeat: Seat = null;
        for (let i = 0, n = this.listSeat.length; i < n; i++) {
            mSeat = this.listSeat[i];
            if (null == mSeat || null == mSeat.Player)
                continue;
            mSeat.HideBubble();
        }
    }
    /// <summary>
    /// 清空公共牌UI
    /// </summary>
    public ClearPublicCardsUI() {
        cc.log("ClearPublicCardsUI");
        let PublicCardInfo: PublicCardInfo = null;
        for (let i = 0, n = this.uirc.listCards.length; i < n; i++) {
            PublicCardInfo = this.uirc.listCards[i];
            PublicCardInfo.trans.setPosition(this.listDefaultPublicCardsLPos[i]);
            PublicCardInfo.cardId = -1;
            PublicCardInfo.imageCard.node.color = cc.Color.WHITE;
            PublicCardInfo.imageSelect.node.active = false;
            PublicCardInfo.trans.active = false;
        }
    }

    /// <summary>
    /// 清空公共牌UI
    /// </summary>
    public ClearSecondPublicCardsUI(): void {
        cc.log("ClearSecondPublicCardsUI");
        let PublicCardInfo: PublicCardInfo = null;
        for (let i = 0, n = this.uirc.listSecondCards.length; i < n; i++) {
            PublicCardInfo = this.uirc.listSecondCards[i];
            PublicCardInfo.trans.setPosition(this.listDefaultSecondPublicCardsLPos[i]);
            PublicCardInfo.cardId = -1;
            PublicCardInfo.imageCard.node.color = cc.Color.WHITE;
            PublicCardInfo.imageSelect.node.active = false;
            PublicCardInfo.trans.active = false;
        }
    }
    /**
     * 显示手动设置面板 
     */
    private ShowAddChips(wallets): void {
        UIComponent.Instance.ShowUI<AddClipsData>(
            PrefabUI.UIBringIn,
            {
                bigBlind: this.bigBlind,
                smallBlind: this.smallBlind,
                currentMinRate: this.currentMinRate,
                currentMaxRate: this.currentMaxRate,
                totalCoin: GC.data.user.info.gold,
                tableChips: this.mainPlayer.chips,
                minBringIn: this.GetMinBringInWithMush(),
                wallets: wallets
            }
        )
    }
    public ShowAutoAddChips(wallets) {
        UIComponent.Instance.ShowUI(

            PrefabUI.UIAutoBringIn,
            {
                bigBlind: this.bigBlind,
                smallBlind: this.smallBlind,
                currentMinRate: this.currentMinRate,
                currentMaxRate: this.currentMaxRate,
                totalCoin: GameCache.Instance.gold,
                tableChips: this.mainPlayer.chips,
                storeChips: this.mainPlayer.cacheStoreChips,
                minBringIn: this.GetMinBringInWithMush(),
                wallets: wallets
            }
        )
    }

    // 牌桌玩家信息
    public CheckPlayerInfo(userId: number, player: CPlayer = null): void {
        // GameCache.Instance.CurGame.texasGameProtocol.HANDLER_REQ_INSURANCE_TRIGGED(null);
        //UIComponent.open(UIDefine.UITexasPlayerInfo, [userId, false, player], { parentUI: Main.Marquee });
        UIComponent.open(UIDefine.UITexasPlayerInfo, player, { parentUI: Main.Marquee });
    }
    //隐藏查看底牌按钮
    public HideSeeMorePublic(): void {
        this.uirc.Button_SeeMorePublic.active = false;
    }
    //激活查看底牌按钮
    public InteractableSeeMorePublic(boo: boolean) {
        this.uirc.setButtonInteractable(this.uirc.Button_SeeMorePublic, boo);
    }

    public HideSeeMorePublicTips(): void {
        this.uirc.Image_SeeMorePublicTips.active = false;
    }

    public InitPublicLocalPos() {
        // 第一套,第二套 公共牌默认位置
        if (this.listDefaultPublicCardsLPos == null) {
            this.listDefaultPublicCardsLPos = [];
            this.listDefaultSecondPublicCardsLPos = [];
            for (let i = 0; i < 5; i++) {
                this.listDefaultPublicCardsLPos.push(this.uirc.listCards[i].trans.position);
                this.listDefaultSecondPublicCardsLPos.push(this.uirc.listSecondCards[i].trans.position);
            }
        }
    }


    /// <summary>
    /// 杀死所有DoTweener动画
    /// </summary>
    /// <param name="complete"></param>
    protected KillAllTweener(complete = false): void {

        console.log("TexasGame KillAllTweener");

        if (null != this.sequenceUpdatePublicCards && this.sequenceUpdatePublicCards.IsPlaying) {

            this.sequenceUpdatePublicCards.Kill();

        }

        //清理公共牌运动
        this.uirc.listCards.forEach(item => {
            item.trans.stopAllActions();
        })
        this.uirc.listSecondCards.forEach(item => {
            item.trans.stopAllActions();
        })

    }
    protected ClearAllData() {
        cc.log("清理所有数据");
        this.gamestatus = -1;
        GameCache.Instance.GameStatus = this.gamestatus;
        this.bigIndex = 0;
        this.smallIndex = 0;
        this.dealStartIndex = -1;
        this.bankerIndex = 0;
        this.operationID = -1;

        //this.cards_1 = null;
        //this.cards_2 = null;
        //this.ResetPublicCardsId_1();
        //this.ResetPublicCardsId_2();
        this.ResetPublicCards();

        this.bigBlind = 0;
        this.smallBlind = 0;
        this.alreadAnte = 0;
        this.maxPlayTime = 0;
        this.currentMinRate = 0;
        this.currentMaxRate = 0;
        this.leftOperateTime = 0;
        this.opTime = 0;
        this.groupBet = 0;
        this.cacheRound = Def.Round.UNDEFINED;
        this.MessageWinnerData = null;
        this.IsSecondPsc = false;
        this.minAnteNum = 0;
        this.canRaise = 0;
        this.insurance = false;
        this.waitBlind = 0;
        this.isIpRestrictions = false;
        this.isGPSRestrictions = false;
        this.mushroomFeature.ResetState();
        this.squidFeature.ResetState();
        // 座位蘑菇标识隐藏
        if (this.listSeat) {
            this.listSeat.forEach(seat => {
                seat?.ClearMushroomTag();
                seat?.ClearSquidTag();
            });
        }
        this.tribeId = 0;
        this.ServerVersion = "";
        this.autoFold = false;
        this.autoCall = false;
        this.autoAllin = false;
        this.autoCheck = false;
        this.cacheOutChips = 0;
        this.CurlimitOutChip = 0;
        this.cacheBuyActiveAmount = 0;
        this.cacheCancelKeepSeat = false;
        if (null != this.cacheTrunOutsCards) {
            this.cacheTrunOutsCards = null;
        }
        if (null != this.mainPlayer) {
            this.mainPlayer.Dispose();
            this.mainPlayer = null;
        }

        if (null != this.listSeat) {
            for (let i = 0, n = this.listSeat.length; i < n; i++) {
                if (null != this.listSeat[i] && null != this.listSeat[i].Player) {
                    this.listSeat[i].Player.Dispose();
                    this.listSeat[i].Player = null;
                }
            }
        }
        this.noLeftOperateTime = false;
        this.delayCount = 0;
        this.lastBankerIndex = 0;
        this.cacheSitdownSeatId = 0;
        this.waittingGPSCallback = false;
        this.stopUpdatePublicCardsAnimation = false;
        this.isAllinGetPlayerCards = false;
        // this.barrageRecordList = []
        // this.barrageCountDown = -1;
        // this.barrageAnimationSequence = DOTween.Sequence();
        // GameCache.Instance.IsAllowOpenDanmu = true;
        this.cacheBuyInsurancePotUserCount = 0;
        // this.VIPTipsStatus = TipsStatus.isStop;
        // this.VipTipslist.Clear();
        this.ResetSeatMoveStruct();

        GameUtil.ResetSeatInfo();

        this.ResetPots();

    }
    ClearAllPlayers() {

        cc.log("清理所有玩家");

        if (null != this.mainPlayer) {
            this.mainPlayer.Dispose();
            this.mainPlayer = null;
        }
        if (this.listSeat) {
            while (this.listSeat.length) {
                let mSeat: Seat = this.listSeat.pop();
                if (mSeat?.Player) {
                    mSeat.Player.Dispose();
                    mSeat.Player = null;
                }
                this.removeSeatUI(mSeat?.ui);
                mSeat?.Dispose();
            }
        }

    }




    //////////////////
    public GetEmptyHandCards(): number[] {
        let cards = [];
        for (let i = 0; i < this.HandCards; i++) {
            cards.push(-1);
        }
        return cards;
    }

    //获取手牌
    public GetHandCardsByRecList(list: number[]) {
        let cards = [];
        for (let i = 0; i < this.HandCards; i++) {
            cards.push(list?.[i] ?? 0);
        }
        return cards;
    }

    //初始化当前房间内座位初始状态
    public InitAllEmptySeat() {
        let count = GameCache.Instance.seat_count;
        for (let i = 0; i < count; i++) {
            let seatUI = this.createSeatUI();
            seatUI.active = true;
            seatUI.parent = this.uirc.seats_content;
            let seat: Seat = new Seat(i, seatUI);
            seat.UpdateSeatUIInfo(i);
            this.listSeat.push(seat);
            this.dicSeatOnlyClient.set(seat.ClientSeatId, seat);
        }
    }
    /////////////////////////////////////////////////

    //点击AddOn按钮响应,子类覆盖
    public onClickAddOn() { }
    //点击退出按钮响应
    public onClickExit() {

        this.uirc.HideMenu(false);

        if (this.mainPlayer?.isPlaying) {

            // UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
            //     {
            //         type: UIDialogComponent.DialogType.CommitCancel,
            //         title: "",
            //         //"退出游戏，在这手牌结束后将自动站起",
            //         content: CPErrorCode.LanguageDescription(20003),
            //         contentCommit: CPErrorCode.LanguageDescription(10012),
            //         contentCancel: CPErrorCode.LanguageDescription(10013),
            //         actionCommit: () => {
            //             this.CallbackExit();
            //         },
            //         noAnimation: true,
            //     });

            UIComponent.open<UISuperDialogType>(UIDefine.UISuperDialog, {
                this: this,
                //title: i18nMgr.Get("WalletServiceCharge_eeydpBno"),
                //"退出游戏，在这手牌结束后将自动站起",
                content: CPErrorCode.LanguageDescription(20003),
                commit: CPErrorCode.LanguageDescription(10012),
                cancel: CPErrorCode.LanguageDescription(10013),
                commit_click: this.CallbackExit,
            });

        } else {
            this.CallbackExit();
        }
    }
    /**
     * 响应退出二次确认
     */
    public CallbackExit() {
        GameCache.Instance.match_id = 0;
        this.TexasGameUtils.LeaveRoom();
    }
    //点击加时
    public onClickDelay() {
        if (this.CanClick() == false) return;
        this.lastClickTime = GlobalSession.NowTimeMS;
        if (this.delayCount >= 2)
            return;

        if (!this.uirc.UIOperation_Com.node.activeInHierarchy) {
            UIComponent.Instance.Toast(i18nMgr.Get("ServerErrorCode_31045"));
            return;
        }
        ProtocolAgency.Send<ClientMessageAddTime.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_AddTime,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                consume: this.TexasGameUtils.GetOpDelayConsumeType(),
            },
        });
    }
    public onClickSeeMorePublic() {
        if (this.CanClick() == false) return;
        this.lastClickTime = GlobalSession.NowTimeMS;

        this.InteractableSeeMorePublic(false);

        ProtocolAgency.Send<ClientMessageShowPublicCards.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_ShowPublicCards,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                round: this.cacheRound,
                consume: Def.ConsumeType.CT_VC_2,
            },
        });
    }
    public onClickReport() {
        UIComponent.open(UIDefine.UITexasReportComponent, null, { parentUI: this.uirc.node });
    }
    public onClickCurSituation() {
        let historyInfoData = new HistoryInfoData()
        historyInfoData.bInsurance = GameCache.Instance.CurGame.insurance;
        historyInfoData.bJackPot = GameCache.Instance.jackPot_on == 1;
        historyInfoData.Blindstr = StringHelper.GetLongString(GameCache.Instance.CurGame.smallBlind) + '/' + StringHelper.GetLongString(GameCache.Instance.CurGame.bigBlind);
        historyInfoData.bgroupBet = GameCache.Instance.CurGame.groupBet;
        historyInfoData.handNum = GameCache.Instance.CurGame.mHandNum;
        historyInfoData.room_id = GameCache.Instance.room_id;
        historyInfoData.match_id = GameCache.Instance.match_id
        historyInfoData.room_unique_id = GameCache.Instance.CurGame.cacheUniqueId

        // let page = GameCache.Instance.CurGame.mHandNum == 0 ? GameCache.Instance.CurGame.mHandNum : GameCache.Instance.CurGame.mHandNum - 1;
        // if (page == 0) {
        //     //第一手没打完不请求
        //     return;
        // }
        // UIComponent.open(UIDefine.UIMine_Poker, { info: historyInfoData, enterType: 1 }, { parentUI: this.uirc.Common_Con })
        UIComponent.open(UIDefine.UITexasHistory, historyInfoData, { parentUI: this.uirc.Common_Con })
    }

    refreshCoinAndChip(menu: UITexasMenu) {

        WWW.Instance.CommonAPI(
            {
                web_class: Web_User_Room_Bringin,
                api_id: GameCache.Instance.room_id,
            }
        ).then(
            (res: any) => {
                if (res.data) {
                    GameCache.Instance.ClubID = res.data.club_id;
                    GameCache.Instance.ClubRandomID = res.data.club_random_id;
                    menu.$node_coin.active = GameCache.Instance.ClubRandomID > 0;

                    if (GameCache.Instance.ClubID > 0) {

                        ////////////////////////////////////////////
                        WWW.Instance.CommonAPI(
                            {
                                web_class: APIOrgClubUserInfo,
                                body: {
                                    club_id: GameCache.Instance.ClubID,
                                    user_id: GameCache.Instance.userId,
                                }
                            }
                        ).then(
                            (res: any) => {

                                if (GameCache.Instance.gold_type == 1) { //1 联盟币， 2 usdt, 3 记分牌

                                    menu.$node_coin.getChildByName("label").getComponent(cc.Label).string = StringHelper.GetLongString(res.data.user_info.gold);

                                }
                                else if (GameCache.Instance.gold_type == 2) {

                                    menu.$node_coin.getChildByName("label").getComponent(cc.Label).string = StringHelper.GetLongString(res.data.user_info.usdt);
                                }
                                else if (GameCache.Instance.gold_type == 3) {

                                    /////////////////////////////////////////////////////
                                    WWW.Instance.CommonAPI(
                                        {
                                            web_class: Web_User_Room,
                                            api_id: GameCache.Instance.room_id,
                                        }
                                    ).then(
                                        (res: any) => {
                                            if (res.data?.last_bring_out != null) {
                                                menu.$node_coin.getChildByName("label").getComponent(cc.Label).string = `${res.data.apply_bring_in}`;
                                            }
                                        },
                                        () => {

                                        }
                                    );

                                    /////////////////////////////////////////////////////
                                }
                            },
                            () => {

                            }
                        );
                        ////////////////////////////////////////////
                    }
                }
            },
            () => {

            }
        );

        menu.$node_coin.getChildByName("uc").active = GameCache.Instance.gold_type == 1;
        menu.$node_coin.getChildByName("gc").active = GameCache.Instance.gold_type == 2;
        menu.$node_coin.getChildByName("add").active = menu.$node_coin.getChildByName("click").active = GameCache.Instance.gold_type == 1 || GameCache.Instance.gold_type == 2;
        let chips = GameCache.Instance.CurGame.mainPlayer?.cacheStoreChips || 0;
        menu.$node_storage.active = chips > 0;
        //GameCache.Instance.FriendsTableLimitBringIn;
        menu.$node_storage.getChildByName("label").getComponent(cc.Label).string = StringHelper.GetLongString(chips);

    }

    public UpdateMenu() {

        let menu = this.uirc.UITexasMenu;

        this.refreshCoinAndChip(menu);

        menu.clearOptions();

        let show = [3, 4, 10];//设置|规则|离开

        if (this.UserSitdown()) //已坐下
        {


            show.push(0, 6, 9);// 站起 | 带入 | 离座留桌

            //menu.MenuButtons_Dic.Button_Standup.node.active = true;
            //menu.MenuButtons_Dic.Button_AddChips.node.active = true;

            if (this.mainPlayer.chips >= GameCache.Instance.carry_small * (this.currentMaxRate + 1)) {
                menu.setOptionInteractable(6, false);
            }
            else {
                menu.setOptionInteractable(6, true);
            }

            if (this.CurlimitOutChip == RoomInfo.RetainType.RT_MANUAL && this.gamestatus >= 1 && this.gamestatus < 7) {
                //menu.MenuButtons_Dic.Button_TakeOut.node.active = true;
                show.push(7);
                //this.__MenuButtonInteractable(menu.MenuButtons_Dic.Button_TakeOut.node, true);
                menu.setOptionInteractable(7, true);
            }
            else if (this.CurlimitOutChip == RoomInfo.RetainType.RT_MANUAL && this.gamestatus != 1 && this.gamestatus < 7) {
                show.push(7);
                menu.setOptionInteractable(7, false);
            }
            else {
                //menu.MenuButtons_Dic.Button_TakeOut.node.active = false;
                //menu.MenuButtons_Dic.Button_TakeOut.node.getComponent(cc.Button).interactable = false;
            }

            //menu.MenuButtons_Dic.Button_LeaveDesk.node.active = true;

            if (this.gamestatus != 1)//游戏没开始的时候，座离桌按钮显示不可点击状态   !HasStarted()
            {
                //this.__MenuButtonInteractable(menu.MenuButtons_Dic.Button_LeaveDesk.node, false);
                menu.setOptionInteractable(9, false);
            }
            else {
                menu.setOptionInteractable(9, true);
                //this.__MenuButtonInteractable(menu.MenuButtons_Dic.Button_LeaveDesk.node, true);
            }

            if (!this.isMTT && this.CurlimitOutChip == RoomInfo.RetainType.RT_AUTO) {
                //this.CurlimitOutChip == RoomInfo.RetainType.RT_AUTO
                show.push(5);
            }

        }
        show.forEach(index => {
            let option = menu.getOption(index);
            option.node.active = true;
        })



    }
    protected __MenuButtonInteractable(node: cc.Node, interactable: boolean) {
        node.getChildByName("Text").color = cc.Color.WHITE;
        node.getChildByName("Text").opacity = interactable ? 178 : 70;
        node.getChildByName("Arrow").active = interactable;
        node.getComponent(cc.Button).interactable = interactable;
    }
    //托管相关
    public SendTrustAction(enable: boolean = false) {

    }

    ///////////////////////////////////////////////////////////////////重构部分
    //多套公共牌
    public public_cards: number[][];

    public ResetPublicCards() {
        this.public_cards = [
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
        ]
    }
    //获取公共牌数量 第n套 1-n
    public GetPublicCardsCount(n: number) {
        let cards = this.public_cards[n - 1];
        let count = cards.indexOf(-1);
        return count == -1 ? GameUtil.PublicCardMaxCount : count;
    }
    //获取第n套公共牌 第n套 1-n
    public GetPublicCards(n: number): number[] {
        return this.public_cards[n - 1];
    }
    public SetPublicCards(n: number, index: number, card: number) {
        this.public_cards[n - 1][index] = card;
    }

    //升级公共牌id 第n套 1-n
    public UpgradePublicCards(n: number, list: number[]): void {

        let had_count: number = this.GetPublicCardsCount(n);

        let add_count = list.length;

        let prev_count = GameUtil.PublicCardMaxCount - add_count;

        if (add_count > GameUtil.PublicCardMaxCount - had_count) {
            cc.warn(`Add PublicCards Error index:{mStartIndex}, list.length:${add_count}`);
            return;
        }
        if (n > 1) {
            let prev_cards = this.GetPublicCards(n - 1);
            had_count = prev_count;
            for (let i = 0; i < prev_count; i++) {
                this.SetPublicCards(n, i, prev_cards[i]);
            }
        }
        for (let i = 0; i < list.length; i++) {
            this.SetPublicCards(n, i + had_count, list[i]);
        }
    }
    //设置公共牌Id
    public SetPublicCardInfosId(): void {
        //let mPublicCardInfo: PublicCardInfo = null;

        let cards = this.GetPublicCards(1);

        for (let i = 0, n = cards.length; i < n; i++) {

            this.uirc.listCards[i].cardId = cards[i];

            // mPublicCardInfo = this.uirc.listCards[i];
            // mPublicCardInfo.cardId = this.cards_1[i];
        }
    }
    /// <summary>
    /// 刷新申请消息红点
    /// </summary>
    public UpdateMsgBtnSprite(next?: Function) {

        if (GameUtil.GetFriendsOrClubTable() == 1 || GameUtil.GetFriendsOrClubTable() == 2) {

            if (GameUtil.GetFriendsOrClubTable() == 1) {//朋友桌

                WWW.Instance.CommonAPI(
                    {
                        web_class: Web_RoomSitApplyRecords,
                        body: {
                            "limit": 1,
                            "offsetd": 0,
                            "status": 1
                        },
                    }
                ).then(
                    (res: any) => {
                        if (res.data?.data) {
                            this.uirc.btn_msg.getChildByName("red_icon").active = res.data.data.length > 0;
                            this.uirc.btn_msg.getChildByName("normal_icon").active = !(res.data.data.length > 0);
                        }
                        next?.call(this);
                    },
                    (res: any) => {
                        next?.call(this);
                    }
                )
            }

            if (GameUtil.GetFriendsOrClubTable() == 2) {//公会内部桌子

                WWW.Instance.CommonAPI(
                    {
                        web_class: API_CLUB_APPLY_LIST,
                        body: {
                            "limit": 1,
                            "offset": 0,
                        },
                        club_id: ClubCache.club_id
                    }
                ).then(
                    (res: any) => {
                        if (res.code == 0 && res.data.data != null) {
                            let isShow = false;
                            res.data.data.forEach(item => {
                                if (item.status == 1) {
                                    isShow = true;
                                }
                            })
                            this.uirc.btn_msg.getChildByName("red_icon").active = isShow;
                            this.uirc.btn_msg.getChildByName("normal_icon").active = !isShow;
                        }
                        next?.call(this);
                    },
                    (res: any) => {
                        next?.call(this);
                    }
                )
            }
        } else {
            next?.call(this);
        }
    }

    //重连清理
    ReEnterClear() {
        this.ClearTableUI();
        this.ClearOther();
        this.Enter();
    }
    //重连进入
    ReEnterRoom() {
        this.EnterRoom();
    }
    //清理牌桌
    ClearTableUI() {

        if (!this.uirc) return;

        this.ResetPublicCards();
        this.ClearPublicCardsUI();
        this.ClearSecondPublicCardsUI();
        this.ResetPublicCardsImage();
        this.ResetSecondPublicCardsImage();

        this.HideSeeMorePublic();

        this.HideSeeMorePublicTips();

        this.HideOperationPanel();
        this.HideAutoOperationPanel();

        this.uirc.CleanUI();

        this.KillAllTweener();

    }

    ClearOther() {

        if (!this.uirc) return;

        this.ClearAllData();

        this.ClearAllPlayers();

        // 清空座位(客户端标记)
        if (null != this.dicSeatOnlyClient) {
            this.dicSeatOnlyClient.clear();
            this.dicSeatOnlyClient = null;
        }
        // 清空分池
        // if (null != this.uirc?.listPotInfo) {
        //     while (this.uirc.listPotInfo.length) {
        //         let potInfo = this.uirc.listPotInfo.shift();
        //         potInfo.trans.active = false;
        //         if (potInfo.potType == 1) {
        //             this.uirc.TransPot_Pool.BackNode(potInfo.trans);
        //         } else {
        //             this.uirc.TransAllPot_Pool.BackNode(potInfo.trans);
        //         }
        //     }
        // }
        // 清空自己
        this.mainPlayer?.Dispose();
        this.mainPlayer = null;
    }
    /**
     * 退出
     */
    Dispose() {

        console.log("TexasGame >>>> Dispose");

        this.ClearTableUI();

        this.ClearOther();

        this.RemoveMsgHandler();
        //停止状态机刷新
        GC.uc.RemoveComponent(this.GameLogicSMComponent);

        //移除资源
        //GC.bundle.get(Bundle_Texas).releaseAll();
        //SceneManager.Instance.removeScene(UIDefine.UITexas);

    }
    //判断是否能够点击
    CanClick(): boolean {
        if (GlobalSession.NowTimeMS - this.lastClickTime > 500) {
            return true;
        }
        UIComponent.Instance.ToastLanguage("clickNum");
        return false;
    }

    ResetSeatMoveStruct() {
        this.seatMoveStruct.reset();
    }

    // 刷新底池
    public UpdateAlreadAnte(): void {
        this.uirc.Text_AlreadAnte.node.active = (this.gamestatus >= 1 && this.gamestatus < 7);
        this.uirc.Text_AlreadAnte.string = `${CPErrorCode.LanguageDescription(20005)} : ${GameUtil.TransBetValue(this.alreadAnte)}`;
    }

    UpdateAllBB() {
        this.listSeat.forEach((seat: Seat) => {
            seat.UpdateCoin();
            seat.UpdateBet();
        });
        this.UpdateAlreadAnte();
        this.UpdatePots();
        this.uirc.UIOperation_Com.UpdateAllValue();
        this.uirc.UIOperation_Com.refreshSliderValueStr();
        this.uirc.UIOperation_Com.refreshSliderMaxLabel();
    }
    ////////////////////////////////////////////////////
    private ReqDiamondConfig_2(next?: Function) {

        DiamondModel.Instance.ReqDiamondConfig(2).then(
            () => {
                next?.call(this);
            },
            () => {
                next?.call(this);
            }
        )
    }
    private ReqDiamondConfig_8(next?: Function) {

        DiamondModel.Instance.ReqDiamondConfig(8).then(
            () => {
                next?.call(this);
            },
            () => {
                next?.call(this);
            }
        )
    }
    private GetDiamondTypeText(config_type = 0, Thousand = 0) {
        let typeText = 0;
        let thousand = 0;// 千位数：config_type =2  为 0第一次加时，1第二次加时。config_type =8 为 1 PREFLOP 2 FLOP 3 TURN 
        let hundred = 0;//百位数 ：1 平台，2 联盟，3 公会 4 个人（朋友桌）
        let ten = 0;//十位数：是否共享牌桌 1 不共享 2 共享 （如果再区分币种，预留 2 USDT桌 3 联盟币）
        let one = 0;//个位数：是否比赛 0 不是， 1 是
        switch (config_type) {
            case 2:
                thousand = Thousand * 1000;
                break;
            case 8:
                thousand = Thousand * 1000;
                break;
            default:
                thousand = 0;
                break;
        }
        //hundred = GameCache.Instance.OriginType * 100;
        //ten = GameCache.Instance.ShareTableType > 1 ? 2 * 10 : 1 * 10;//1 不共享 2 共享 （如果再区分币种，预留 2 USDT桌 3 联盟币）
        //one = 0;//暂不处理比赛
        typeText = thousand + hundred + ten + one;
        return typeText;
    }

    private GetTypeText(times: number)// 百位数：创建来源 1 平台，2 联盟，3 公会 4 个人（朋友桌）// 十位数：是否共享牌桌 1 不共享 2 共享 （如果再区分币种，预留 2 USDT桌 3 联盟币）// 个位数：是否比赛 0 不是， 1 是示例：210 （表示联盟创建的内部牌桌）										  //千位数：0第一次加时，1第二次加时
    {
        let numStr = "";
        numStr += times;
        if (GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit) //string.Format("{0:N1}", str)
        {
            numStr += GameCache.Instance.origin_type;
        }

        else if (GameCache.Instance.room_type >= RoomType.MTTTexasHoldemStandardNoLimit && GameCache.Instance.room_type <= RoomType.MTTOmaha6SixPlusFixedAof) {
            return +(times + "001");
        }

        if (GameCache.Instance.share_table == 1) {
            numStr += GameCache.Instance.share_table;
        }
        else {
            numStr += "2";
        }

        if (GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit) //string.Format("{0:N1}", str)
        {
            numStr += "0";
        }
        else if (GameCache.Instance.room_type >= RoomType.MTTTexasHoldemStandardNoLimit && GameCache.Instance.room_type <= RoomType.MTTOmaha6SixPlusFixedAof) {
            numStr += "1";
        }

        return +numStr || 0;
    }


    //刷新加时按钮样式
    public UpdateDelayBtn(): void {
        this.HideBtnDelay(true);

        let dis_diamond = cc.find("layout/dis_diamond", this.uirc.Button_Delay);
        let nor_diamond = cc.find("layout/nor_diamond", this.uirc.Button_Delay);
        let free_diamond = cc.find("layout/free_diamond", this.uirc.Button_Delay);

        nor_diamond.active = false;
        dis_diamond.active = false;
        free_diamond.active = false;

        //使用次数
        if (this.delayCount >= 2) {
            this.uirc.Button_Delay.getComponent(cc.Button).interactable = false;
            this.uirc.Button_Delay.getChildByName("Text_Time").getComponent(cc.Label).string = "0";
            this.uirc.Button_Delay.opacity = 178;

            this.uirc.setChildLabel(nor_diamond, "label", "0");
            nor_diamond.active = true;

        }
        else {

            let diamondConfig = DiamondModel.Instance.GetDiamondConfig(this.GetTypeText(this.delayCount + 1), 2);

            if (diamondConfig?.config_type == 2) {
                let smallBlind = 0;
                if (GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit) //string.Format("{0:N1}", str)
                {
                    smallBlind = GameCache.Instance.CurGame.smallBlind;
                    for (let i = 0; i < diamondConfig.setting.length; i++) {
                        if (diamondConfig.setting[i].sb * 100 == smallBlind * 100) {
                            if (diamondConfig.setting[i].discount_price == 0) {
                                //DisDiamond.transform.Find("num").GetComponent<Text>().text = diamondConfig.setting[i].price.ToString();

                                this.uirc.setChildLabel(dis_diamond, "label", `${diamondConfig.setting[i].price}`);

                                dis_diamond.active = true;
                                free_diamond.active = true;
                            }
                            else {
                                if (diamondConfig.setting[i].discount_price < diamondConfig.setting[i].price) {

                                    this.uirc.setChildLabel(dis_diamond, "label", `${diamondConfig.setting[i].price}`);
                                    this.uirc.setChildLabel(nor_diamond, "label", `${diamondConfig.setting[i].discount_price}`);
                                    nor_diamond.active = true;
                                    dis_diamond.active = true;

                                }
                                else {
                                    this.uirc.setChildLabel(nor_diamond, "label", `${diamondConfig.setting[i].price}`);
                                    nor_diamond.active = true;

                                }
                            }
                            break;
                        }
                    }
                }
                else if (GameCache.Instance.room_type >= RoomType.MTTTexasHoldemStandardNoLimit && GameCache.Instance.room_type <= RoomType.MTTOmaha6SixPlusFixedAof) {
                    if (diamondConfig.setting[0].discount_price == 0) {

                        this.uirc.setChildLabel(dis_diamond, "label", `${diamondConfig.setting[0].price}`);
                        nor_diamond.active = false;
                        dis_diamond.active = true;
                        free_diamond.active = true;



                    }
                    else {
                        if (diamondConfig.setting[0].discount_price < diamondConfig.setting[0].price) {


                            this.uirc.setChildLabel(dis_diamond, "label", `${diamondConfig.setting[0].price}`);
                            this.uirc.setChildLabel(nor_diamond, "label", `${diamondConfig.setting[0].discount_price}`);
                            nor_diamond.active = true;
                            dis_diamond.active = true;
                            free_diamond.active = false;



                        }
                        else {

                            this.uirc.setChildLabel(nor_diamond, "label", `${diamondConfig.setting[0].price}`);
                            nor_diamond.active = true;
                            dis_diamond.active = false;
                            free_diamond.active = false;
                        }
                    }
                }

            }
            this.uirc.Button_Delay.getComponent(cc.Button).interactable = true;
            this.uirc.Button_Delay.getChildByName("Text_Time").getComponent(cc.Label).string = this.delayCount > 0 ? "20" : "30";
            this.uirc.Button_Delay.opacity = 255;
        }
    }
    public HideBtnDelay(isActive: boolean): void {
        this.uirc.Button_Delay.active = isActive;
    }

}
