import TexasConfig from '../../config/TexasConfig';
import { UIDefine } from '../../define/UIDefine';
import DiamondModel from '../../diamond/DiamondModel';
import SoundComponent from '../../sound/SoundComponent';
import { DOTween, Sequence } from '../../dotween/DOTween';
import { ClubCache } from '../../frame/data/club/ClubCache';
import GC from '../../frame/GameControl';
import PublicHelper from '../../helper/PublicHelper';
import { StringHelper } from '../../helper/StringHelper';
import { CPErrorCode } from '../../i18n/CPErrorCode';
import { i18nMgr } from '../../i18n/i18nMgr';
import Main from '../../Main';
import {
    WebOrgClubUserInfo,
    WebClubApplyList,
    WebOrgClubSearchById,
    WebRoomSitApplyRecords,
    WebUserRoom,
    WebUserRoomBringin,
    WebRoomCenterIsRoomAdmin,
    WebRoomCenterRoomStart,
    WebRoomCenterHistoryViewPublicCardsFreeCount,
    WebUserDiamondsWallet,
    WWW,
    WebGetDiamondConfig,
    WebUserInfo
} from '../../net/https/WebRequest';
import ProtocolAgency from '../../net/websocket/ProtocolAgency';
import { ProtocolCode } from '../../net/websocket/ProtocolCode';
import { Def, RoomInfo } from '../../protobuf/holdem/define_pb';
import { GameplayPlayerInfoCache } from '../GameplayPlayerInfoCache';
import { ServerMessageWinner } from '../../protobuf/holdem/recv_th_winner_pb';
import { ClientMessageAction } from '../../protobuf/holdem/req_th_action_pb';
import { ClientMessageAddTime } from '../../protobuf/holdem/req_th_add_time_pb';
import { ClientMessageAgreePost } from '../../protobuf/holdem/req_th_agree_post_pb';
import { ClientMessageBringIn } from '../../protobuf/holdem/req_th_bring_in_pb';
import { ClientMessageEnterRoom, ServerMessageEnterRoom } from '../../protobuf/holdem/req_th_enter_room_pb';
import { ClientMessageKeepSeatActive } from '../../protobuf/holdem/req_th_keep_seat_active_pb';
import { ClientMessageSeated } from '../../protobuf/holdem/req_th_seated_pb';
import { ClientMessageSetAutoOnTable } from '../../protobuf/holdem/req_th_set_auto_on_table_pb';
import { ClientMessageShowPublicCards } from '../../protobuf/holdem/req_th_show_public_cards_pb';
import { ClientMessageViewPlayerCards } from '../../protobuf/holdem/req_th_view_player_cards_pb';
import { ClientMessageViewPlayerCardsNum } from '../../protobuf/holdem/req_th_view_player_cards_num_pb';
import { ClientMessageSquidInActive } from '../../protobuf/holdem/req_th_squid_in_active_pb';
import { ClientMessageStandupActive } from '../../protobuf/holdem/req_th_stand_up_active_pb';
import { ClientMessageStoreChips } from '../../protobuf/holdem/req_th_store_chips_pb';
import * as protobuf_holdem_define_pb from '../../protobuf/holdem/define_pb';
import GlobalSession from '../../session/GlobalSession';
import StorageKey from '../../session/StorageKey';
import AssetContext, { AssetFold } from '../../ui/component/AssetContext';
import UIDialogContentSizeLimit from '../../ui/dialog/UIDialogContentSizeLimit';
import { UIConfirmDialogParam } from '../../crazyPoker/gameplay/common/view/common/UIConfirmDialog';
import UIComponent, { PrefabUI } from '../../ui/UIComponent';
import TexasGameMessageHandler from '../messageHandler/TexasGameMessageHandler';
import { HistoryInfoData } from '../new_ui/UITexasHistory';
import TexasGameProtocol from '../protocol/TexasGameProtocol';
import Seat, { SeatUIInfo } from '../seat/Seat';
import UIAutoOperationComponent from '../ui/UIAutoOperationComponent';
import UITexasMenu from '../ui/UITexasMenu';
import GameUtil, { GameType, RoomType, some_pos } from '../util/GameUtil';
import TexasGameUtils from '../util/TexasGameUtils';
import TexasGameMushroom from './TexasGameMushroom';
import TexasGameSquid from './TexasGameSquid';
import TexasGameBombPot from './TexasGameBombPot';
import TexasGameJackpot from './TexasGameJackpot';
import ThrowPropManager from '../../crazyPoker/gameplay/common/util/ThrowPropManager';
import { CardType, CardTypeUtil } from './../CardTypeUtil';
import { CPlayer } from './../CPlayer';
import FSMLogicComponent from './../FSMLogicComponent';
import { GameCache } from './../GameCache';
import { SeatEmpty, SeatIdle, SeatOperation } from './../SeatStateHandler';
import { TexasGameState } from './../TexasGameState';
import { GameState } from '../../crazyPoker/gameplay/common/constant/TexasGameStatus';
import TexasBusiness from './business/TexasBusiness';
import TexasSMAgency from './../TexasSMAgency';
import { OperationData } from './../ui/UIOperationComponent';
import UITexas, { PotInfo, PublicCardInfo } from './../UITexas';
import { UITexasModel } from './../UITexasModel';
import { AddChipsData, RetainInfo } from '../../crazyPoker/gameplay/common/view/chips/UIGameplayAddChipsAndDiamond';
import { BringInChipsType } from '../../crazyPoker/gameplay/common/constant/BringInChipsType';
import { HttpRoomBringOutProtocol } from '../../crazyPoker/module/message/CPHotfixWebMessage/room/HttpRoomBringOutProtocol';
import { VideoModel } from '../../crazyPoker/gameplay/common/constant/VideoModel';
import AgoraManager from '../../net/agora/AgoraManager';
import ToastManager from '../../manager/ToastManager';
import { HttpRoomBringInByIDProtocol } from '../../crazyPoker/module/message/CPHotfixWebMessage/room/HttpRoomBringInByIDProtocol';
import { HttpUserInfoProtocol } from '../../crazyPoker/module/message/CPHotfixWebMessage/user/HttpUserInfoProtocol';
import GameplayUtil from '../../crazyPoker/gameplay/common/util/GameplayUtil';
import { TableType } from '../../crazyPoker/gameplay/common/constant/TableType';

//const PBTypes = Def.Types;
class SeatMoveStruct {
    //SeatMove?, PlayDealFunc?, ShowCardsSeat?, StartInfo, Count
    //移动中
    public moving: boolean;
    //移动完成个数
    public move_cp_count: number;
    //this func param id标记 id flag
    public cacheFuncs: { a?: any; b?: Function; c?: any; d?: string }[] = null;

    constructor() {
        this.reset();
    }

    reset() {
        this.moving = false;
        this.move_cp_count = 0;
        this.cacheFuncs = [];
    }
}
const LN = '[TexasGame]';

export default class TexasGame {
    //座位UI节点缓存池
    private seatUI_pool: cc.Node[] = [];
    private mushroomFeature: TexasGameMushroom = null;
    private squidFeature: TexasGameSquid = null;
    private bombPotFeature: TexasGameBombPot = null;
    jackpotFeature: TexasGameJackpot = null;
    throwPropMgr: ThrowPropManager = null;
    ///////////////////////////////
    private setting: { deskType: any; pokerType: any } = {
        deskType: null,
        pokerType: null
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
    public get id(): string {
        return `${GameCache.Instance.room_id}-${GameCache.Instance.match_id}-${GameCache.Instance.room_type}`;
    }

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
    /** 鱿鱼额外数量（用于引导页奖励列表） */
    public squidExtraCount: number = 0;
    /** 鱿鱼倍率配置（按鱿鱼数取倍率） */
    public squidCountRates: { count: number; rate: number }[] = [];
    /** 当前是否在鱿鱼轮 */
    public isGameInSquidRound: boolean = false;
    /** 子玩法 ante（暴击玩法） */
    public subGamePlayAnte: number = 0;
    /** 暴击玩法是否开启 */
    public criticalHitEnabled: boolean = false;
    /** 暴击玩法轮次 */
    public criticalHitRound: number = 0;
    /** 当前暴击轮次 */
    public curCriticalHitRound: number = 0;
    /** 本轮是否暴击开启 */
    public isCriticalHitOpen: boolean = false;
    /** CallTime 开关（1 开，2 关） */
    public callTime: number = 0;
    /** CallTime 盈利阈值（BB） */
    public callTimeWinline: number = 0;
    /** CallTime 连续手数限制 */
    public callTimeLimitCount: number = 0;
    /** CallTime 当前连续手数 */
    public callTimeCount: number = 0;
    /** 是否触发 CallTime 限制 */
    public callTimeStay: boolean = false;
    /** 带入追平领先者 (%) */
    public bringinEqualLeader: number = 0;
    /** 带入最小记分牌倍率 */
    public minPlayerChipRate: number = 0;
    /** 带入最大记分牌倍率 */
    public maxBringinTotalRate: number = 0;
    /** 强制亮牌 */
    public forceShowCard: number = 0;
    /** 随机入座 */
    public randomSeat: number = 0;
    /** 仅 iOS */
    public onlyIOS: number = 0;
    /** 入池率限制 */
    public poolRate: number = 0;
    /** 付费看手牌 */
    public lookHandCard: number = 0;
    /** 聊天开关 */
    public chatType: number = 1;
    /** Straddle 上限 */
    public straddleMax: number = 2;
    /** 双牌开关 */
    public secondPcsOn: boolean = false;
    /** 保险模式 */
    public insuranceMode: number = 0;
    /** 区块链加密开关 */
    public blockchainType: number = 0;
    /** 随机前注配置原串 */
    public anteRandomJumpConfig: string = '';
    /** 是否开启随机前注 */
    public isAnteRandomJumpEnable: boolean = false;
    /** 自动换桌触发手数 */
    public autoChangeRoomLimitHand: number = 0;
    /** 是否开启自动换桌 */
    public isAutoChangeTable: boolean = false;
    /** 自动换桌手数 */
    public autoChangeTable: number = 0;
    /** Jackpot 开关 */
    public jackpot: number = 0;
    /** Jackpot 配置 */
    public jackpotConfig: any = null;
    /** BombPot 开关 */
    public isBombPot: boolean = false;
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
    /** 是否安全牌桌（SeatedMessaging） */
    public isSafeRoom: boolean = false;
    /// <summary>
    /// 同步到同盟的id 未同步时为0
    /// </summary>
    public tribeId: number = 0;
    /// <summary>
    /// 同步到俱乐部的id 未同步时为0
    /// </summary>
    public clubId: number = 0;
    /// <summary>
    /// 带入钱包的俱乐部ID
    /// </summary>
    public bringInClubId: number = 0;
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
    /// 本局是否所有玩家都已秀牌（showcards 的 isAll=true），此时不需要显示偷偷看按钮
    /// </summary>
    public allCardsShown: boolean = false;
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
    public cacheTrunOutsCards: Map<number /*座位号*/, number[] /*保险outs*/> = null;
    /// <summary>
    /// 缓存购买量
    /// </summary>
    public cacheBuyActiveAmount: number = 0;
    /// <summary>
    /// 发发看剩余免费次数
    /// </summary>
    public _viewPubFreeCount: number = 0;
    /// <summary>
    /// 发发看模式：1=分步看(翻牌/转牌/河牌)，2=全看(一次性看所有)
    /// </summary>
    public _publicViewType: number = 1;
    /// <summary>
    /// 付费看手牌次数（阶梯收费用）
    /// </summary>
    public lookCardsPayTimes: number = 0;
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
    private reportKeepOpen: boolean = false;
    //分池节点对象池
    //TransPot_Pool: SimpleNodePool = null;
    //发牌动画
    sequencePlayDealAnimation: {
        tween?: cc.Tween;
        complete?: Function;
        IsPlaying?: boolean;
    } = null;
    sequenceUpdatePublicCards_obj = {};
    sequencePlayFirstRecyclingChipSubAnimation: {
        tween?: cc.Tween;
        complete?: Function;
        IsPlaying?: boolean;
    } = null;
    sequencePlayFirstRecyclingChipAnimation: {
        tween?: cc.Tween;
        complete?: Function;
        IsPlaying?: boolean;
    } = null;
    sequencePlayRecyclingChipAnimation: {
        tween?: cc.Tween;
        complete?: Function;
        IsPlaying?: boolean;
    } = null;
    sequenceUpdatePublicCards: Sequence<{}> = null;
    sequenceSecondUpdatePublicCards: {
        tween?: cc.Tween;
        complete?: Function;
        IsPlaying?: boolean;
    } = null;
    sequencePlayEndPublicCardsAnimation: {
        tween?: cc.Tween;
        complete?: Function;
        IsPlaying?: boolean;
    } = null;
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
        this.bombPotFeature = new TexasGameBombPot(this);
        this.jackpotFeature = new TexasGameJackpot(this);
        this.throwPropMgr = new ThrowPropManager(this);
        this.seatMoveStruct = new SeatMoveStruct();
        this.RCInit();
    }

    protected RCInit() {
        this.TexasGameMessageHandler = new TexasGameMessageHandler(this);
        this.TexasGameProtocol = new TexasGameProtocol(this);
    }

    Update(dt: number) {}

    // Enter (called by procedureManager.startProcedure(Texas))
    // StateMachine.Start then to launchState(EnterRoom => send enterRoom)
    // enterRoom(Callback: switchScene & to initState)
    Enter() {
        this.IsDispose = false;
        this.listSeat = [];
        this.pots = [];
        this.dicSeatOnlyClient = new Map<number, Seat>();
        // Dispose() 会将 throwPropMgr 置 null，重新进入房间时需要重建
        if (!this.throwPropMgr) {
            this.throwPropMgr = new ThrowPropManager(this);
        }
        this.SMAgency.LoadGameStateConf();
        GC.uc.AddComponent(this.GameLogicSMComponent);
        // 播放游戏背景音乐，音量 30%（对齐 Unity BGM_GAMEPLAY）
        SoundComponent.Instance.playMusicWithVolume('sound/bgm_game', 0.3);
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

    // public RegiterEnterRoom() {
    //     GC.notify.register(
    //         ProtocolCode.Protocol_Holdem_EnterRoom,
    //         this.TexasGameMessageHandler.Protocol_Holdem_EnterRoom_Handler,
    //         this.TexasGameMessageHandler,
    //     );
    // }
    public UnRegiterEnterRoom() {
        GC.notify.remove(ProtocolCode.Protocol_Holdem_EnterRoom, this.TexasGameMessageHandler.Protocol_Holdem_EnterRoom_Handler, this.TexasGameMessageHandler);
    }

    /////////////////////////////////桌面样式/////////////////////////////////
    public get deskType() {
        this.setting.deskType == null && (this.setting.deskType = +(GC.localStore.getItem(StorageKey.SettingDeskType) ?? TexasConfig.DefaultDeskType));
        return this.setting.deskType;
    }

    /** 桌布贴图名称映射：索引对应 deskType，值为 texture_table prefab 中的节点名 */
    private static readonly DESK_TEXTURE_MAP: string[] = [
        'new_ui_top_table_0', // 0 - 默认桌布
        'desk1',              // 1
        'desk2',              // 2
        'desk3',              // 3
        'desk4',              // 4
        'desk5',              // 5
        'desk6',              // 6
        'desk7',              // 7
    ];

    SetDeskType(type: number) {
        this.setting.deskType = type;
        const textureName = TexasGame.DESK_TEXTURE_MAP[type] || TexasGame.DESK_TEXTURE_MAP[0];
        const spriteFrame = AssetContext.getAsset(textureName, AssetFold.texture_table)
            || AssetContext.getAsset(TexasGame.DESK_TEXTURE_MAP[0], AssetFold.texture_table);
        this.uirc.sp_table_bg.spriteFrame = spriteFrame;
        this._fitDeskCover();
        if (this.isBombPot) {
            this.bombPotFeature?.PlayOpenScreen();
        }
    }

    /**
     * 桌布 Cover 适配：保持贴图原始比例铺满 1242×2688，居中裁切多余部分
     *
     * 原理：
     * 1. 关闭 Widget（避免它强制拉伸节点尺寸导致 Sprite 拉伸变形）
     * 2. 将节点尺寸设为贴图原始尺寸（Sprite 按 1:1 渲染，不变形）
     * 3. 计算 cover 缩放 = max(目标宽/贴图宽, 目标高/贴图高)
     * 4. 设置 scale，节点居中（锚点 0.5,0.5），溢出部分被屏幕裁切
     */
    private _fitDeskCover(): void {
        const sprite = this.uirc.sp_table_bg;
        if (!sprite || !sprite.spriteFrame) return;
        const node = sprite.node;
        const sf = sprite.spriteFrame;

        // 贴图原始尺寸
        const texW = sf.getOriginalSize().width;
        const texH = sf.getOriginalSize().height;

        // 目标尺寸（设计分辨率）
        const targetW = 1242;
        const targetH = 2688;

        // 宽高比一致则无需 cover 处理
        if (Math.abs(texW / texH - targetW / targetH) < 0.01) {
            const widget = node.getComponent(cc.Widget);
            if (widget) widget.enabled = true;
            node.setScale(1, 1);
            return;
        }

        // 关闭 Widget，避免它强制设置节点尺寸导致拉伸
        const widget = node.getComponent(cc.Widget);
        if (widget) widget.enabled = false;

        // 节点尺寸设为贴图原始尺寸，Sprite 按 1:1 渲染不变形
        node.setContentSize(texW, texH);

        // Cover 缩放：取较大值，保证宽和高都 >= 目标
        const scale = Math.max(targetW / texW, targetH / texH);
        node.setScale(scale, scale);
    }

    //////////////////////////////////////////////////////////////////////////
    /////////////////////////////////扑克样式/////////////////////////////////
    public get pokerType() {
        this.setting.pokerType == null && (this.setting.pokerType = +(GC.localStore.getItem(StorageKey.SettingPokerType) ?? TexasConfig.DefaultDeskType));
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
        });
        this.uirc.listSecondCards.forEach(item => {
            item.UpdateSpriteFrame();
        });
        this.listSeat.forEach(seat => {
            seat.listCardUIInfos.forEach(item => {
                item.UpdateSpriteFrame();
            });
            seat.listSmallCardUIInfos.forEach(item => {
                item.UpdateSpriteFrame();
            });
        });
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
        // this.TexasGameUtils.EnterRoom();
        // GC.notify.register(
        //     ProtocolCode.Protocol_Holdem_EnterRoom,
        //     this.TexasGameMessageHandler.Protocol_Holdem_EnterRoom_Handler,
        //     this.TexasGameMessageHandler,
        // );
        const roomId = GameCache.Instance.room_id;
        const matchId = GameCache.Instance.match_id;
        const mttPartialBringIn = 0;
        const observer = this.IsLookOn;
        // if (roomType >= RoomType.MTTTexasHoldemStandardNoLimit) {
        //     //MTT
        //     // GameCache.Instance.match_id = UIMTTModel.Instance.MttInfo.mtt.match_id;
        //     // GameCache.Instance.seat_count = UIMTTModel.Instance.MttInfo.mtt.seat_count;
        //     // GameCache.Instance.mtt_Hunter_game = UIMTTModel.Instance.MttInfo.mtt.hunter_on > 0;
        //     // GameCache.Instance.roomName = GC.data.languageTemp.temp.getName(UIMTTModel.Instance.MttInfo.mtt.name);
        //     matchId = GameCache.Instance.match_id;
        //     roomId = GameCache.Instance.room_id;
        //     mttPartialBringIn = 0;
        //     observer = GameCache.Instance.CurGame.IsLookOn;
        // }
        const body: ClientMessageEnterRoom.AsObject = {
            room: { roomId: roomId, matchId: matchId },
            gps: { longitude: GameCache.Instance.longitude, latitude: GameCache.Instance.latitude },
            mttPartialBringIn: mttPartialBringIn,
            observer: observer,
            wantSeat: protobuf_holdem_define_pb.Def.WantSeatType.WST_BOTH
        };
        ProtocolAgency.Send<ClientMessageEnterRoom.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_EnterRoom,
            RoomID: roomId,
            MatchID: matchId,
            Body: body
        });
        console.log(LN, `EnterRoom: room_id=${roomId}, match_id=${matchId}, observer=${observer}`);
    }

    //更新房间数据
    public UpdateRoom(obj: ServerMessageEnterRoom.AsObject) {
        this.UpdateRoomCommon(obj);
    }

    /**
     * 隐藏等待一手开始提示
     */
    protected HideWaitForStartTips() {
        if (this.uirc.Image_WaitForStartTips.activeInHierarchy) {
            this.uirc.Image_WaitForStartTips.active = false;
        }
    }

    /**
     * 显示等待一手开始提示
     */
    protected ShowWaitForStartTips() {
        this.uirc.Image_WaitForStartTips.active = true;
        this.UpdateShareBtnState();
    }

    /**
     * 更新分享按钮状态
     */
    protected UpdateShareBtnState() {
        let shareBtn = this.uirc?._buttonShare;
        if (shareBtn) {
            shareBtn.active = TexasBusiness.Instance.IsOpenRoomShare();
        }
        this.UpdateStartGameState();
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
            });
        }
    }

    UpdateRoomCommon(rec: ServerMessageEnterRoom.AsObject) {
        console.log(LN, 'UpdateRoomCommon');
        this.ClearAllData();
        this.ClearAllPlayers(); // 清空玩家数据
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
        const roomInfoAny = rec.roomInfo;
        const byRule = !!roomInfoAny.ignorePreflop && !!roomInfoAny.isAlwaysSecondPcs;
        this.isBombPot = byRule;
        this.cacheUniqueId = rec.roomInfo.uniqueId;
        this.gamestatus = rec.gameStatus;
        GameCache.Instance.GameStatus = this.gamestatus;
        //暴击数据
        GameCache.Instance._texasData._isCriticalHitOpen = rec.handInfo.criticalHitOpen;
        GameCache.Instance._texasData._curCriticalHitRound = rec.handInfo.conRounds;
        this.bigIndex = this.GetLocalSeatID(rec.handInfo.bbSeatId);
        this.smallIndex = this.GetLocalSeatID(rec.handInfo.sbSeatId);
        this.bankerIndex = this.GetLocalSeatID(rec.handInfo.buSeatId);
        if (rec.mttProgress == null || !(rec.mttProgress.isBubbleWait && rec.gameStatus == Def.GameStatus.HAND_END)) {
            this.UpgradePublicCards(1, rec.handInfo.publicCardsList);
            const handInfoAny = rec.handInfo as any;
            if (this.isBombPot) {
                this.AddSecondPublicCardsBombPot(handInfoAny?.secondPublicCardsList || []);
                this.IsSecondPsc = this.GetPublicCardsCount(2) > 0;
            } else if (handInfoAny?.extPublicCardsList?.length > 0) {
                this.UpgradePublicCards(2, handInfoAny.extPublicCardsList);
                this.IsSecondPsc = true;
            }
        }
        GameCache.Instance._texasData._smallBlind = rec.roomInfo.smallBlind;
        GameCache.Instance._texasData._bigBlind = rec.roomInfo.smallBlind * 2;
        GameCache.Instance._texasData._minBringIn = GameCache.Instance._texasData._bigBlind;
        GameCache.Instance._texasData._deposit = rec.roomInfo.deposit;
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
        this.UpdateCriticalHitConfig(rec);
        this.jackpotFeature.UpdateRoomConfig(rec);
        this.callTime = roomInfoAny.callTimeCount || GameCache.Instance.room_call_time || 0;
        this.callTimeWinline = Number(GameCache.Instance.room_call_time_winline || 0);
        this.callTimeLimitCount = Number(roomInfoAny?.callTimeCount || GameCache.Instance.room_call_time_count || 0);
        this.callTimeCount = Number(roomInfoAny?.callTimeCount || 0);
        this.callTimeStay = !!(rec.myInfo as any)?.callTimeStay;
        if (rec.myInfo != null) {
            this.callTimeCount = Number((rec.myInfo as any).callTimeCount || this.callTimeCount || 0);
        }
        this.tribeId = GameCache.Instance.TribeId;
        this.clubId = GameCache.Instance.ClubID;
        this.ShowSafetyGuardBtn();
        this.bringinEqualLeader = GameCache.Instance._bringinEqualLeader;
        this.minPlayerChipRate = GameCache.Instance._minPlayerChipRate;
        this.maxBringinTotalRate = GameCache.Instance._maxBringinTotalRate;
        this.forceShowCard = GameCache.Instance._forceShowCard;
        this.randomSeat = GameCache.Instance.room_random_seat;
        this.onlyIOS = GameCache.Instance._onlyIOS;
        this.poolRate = roomInfoAny?.limitMinPoolRate;
        this.lookHandCard = GameCache.Instance.room_view_player_cards;
        this.chatType = GameCache.Instance._chatType;
        this.straddleMax = GameCache.Instance._straddleMax;
        this.secondPcsOn = GameCache.Instance._secondPcsOn;
        this.insuranceMode = roomInfoAny.insuranceMode;
        this.blockchainType = GameCache.Instance._blockchainType;
        this.anteRandomJumpConfig = roomInfoAny.randomAnte;
        this.isAnteRandomJumpEnable = this.anteRandomJumpConfig.length > 0;
        this.autoChangeRoomLimitHand = roomInfoAny.autoChangeRoomLimitHand;
        this.isAutoChangeTable = this.autoChangeRoomLimitHand > 0;
        this.autoChangeTable = this.autoChangeRoomLimitHand;
        this.jackpot = Number(roomInfoAny?.jackpot || 0);
        GameCache.Instance.jackPot_on = this.jackpot;
        GameCache.Instance._enterRoomType = 1;
        GameCache.Instance.jackPot_gold = roomInfoAny.jackpotGold;
        GameCache.Instance.jackPot_parent_gold = roomInfoAny.jackpotParentGold;
        GameCache.Instance.jackPot_fund = GameCache.Instance.jackPot_parent_gold;
        this.jackpotConfig = this.ResolveJackpotConfig(GameCache.Instance.room_jackpot_config);
        this.insurance = rec.roomInfo.insurance;
        this.isIpRestrictions = rec.roomInfo.limitIp;
        this.isGPSRestrictions = rec.roomInfo.limitGps;
        this.isSafeRoom = roomInfoAny.seatedMessaging;
        GameCache.Instance.insurance = this.insurance;
        for (let i = 0; i < rec.handInfo.potsList.length; i++) {
            this.pots.push(rec.handInfo.potsList[i].amount);
            console.log(LN, '排池子数据:', this.pots);
        }
        if (this.waitBlind == 1) {
            this.ShowWaitBlindBtn();
        } else {
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
            mPlayer.videoMaskId = rec.playersList[i].videoMaskId || 0;
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
        // 进入牌桌时批量预取所有玩家的公共信息 + 战绩缓存（对齐 Unity CacheUserDataByGameInner）
        const prefetchIds: number[] = [];
        for (let i = 0, n = rec.playersList.length; i < n; i++) {
            const uid = rec.playersList[i].userRid;
            if (uid && prefetchIds.indexOf(uid) === -1) prefetchIds.push(uid);
        }
        if (prefetchIds.length > 0) {
            GameplayPlayerInfoCache.Instance.prefetch(prefetchIds);
        }
        if (this.gamestatus == GameState.NOT_START) {
            this.ShowWaitForStartTips();
        } else {
            this.HideWaitForStartTips();
        }
        this.UpdateAlreadAnte();
        this.UpdateRoomDes();
        this.UpdatePublicCardsNoAnim();
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
                    this.TexasGameProtocol.HandlerInsueranceData(rec.operatorList); //重进房间保险处理
                }
            }
        }
        if (this.operationID > -1 && this.operationID < 9) {
            this.leftOperateTime = LeftOpTime;
            this.noLeftOperateTime = false;
        } else {
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
                    this.HideAutoOperationPanel(); // 隐藏预操作
                    this.ShowOperationPanel({
                        actionsList: actionsList,
                        shortcutsList: shortcutsList
                    });
                } else {
                    // 下一个操作不是自己
                    this.HideOperationPanel();
                    if (this.mainPlayer.isPlaying) {
                        // 自己有参与游戏,但allin弃牌不显示
                        if (
                            this.mainPlayer.actionStatus != Def.Action.FOLD &&
                            this.mainPlayer.actionStatus != Def.Action.ALLIN &&
                            this.mainPlayer.actionStatus != Def.Action.NONE &&
                            !this.mainPlayer.IsAutoOp
                        ) {
                            UIComponent.Instance.ShowUI(
                                PrefabUI.UIAutoOperationComponent,
                                UIAutoOperationComponent.AutoOperationData(this.TexasGameUtils.getAutoOperationCallAmount(rec.handInfo.roundBet))
                            );
                        } else {
                            this.HideAutoOperationPanel();
                        }
                    } else {
                        // 观众
                        this.HideAutoOperationPanel();
                    }
                }
                mSeat.FsmLogicComponent.SM.ChangeState(SeatOperation.Instance);
                // 麦序模式：重进房间时恢复操作者视频状态
                this.TexasGameProtocol.onSequenceOperatorChange(this.operationID);
            }
        } else {
            this.HideOperationPanel();
            this.HideAutoOperationPanel();
            // 麦序模式：无操作者时关闭视频
            this.TexasGameProtocol.onSequenceOperatorChange(-1);
        }
        //刷新池子
        this.UpdatePots();
        // 切换游戏状态机
        this._stateChange(rec.gameStatus, rec);
        this.roomReqList = [
            // { name: "UpdateMsgBtnSprite", func: this.UpdateMsgBtnSprite },
            // { name: "ReqDiamondConfig_2", func: this.ReqDiamondConfig_2 },
            // { name: "ReqDiamondConfig_8", func: this.ReqDiamondConfig_8 },
        ];
        this.RunRoomReqlist();
        this.bombPotFeature?.EnterGame();
        this.jackpotFeature?.EnterGame();
        this.ShowCriticalInfo();
        this.RefreshRoomManagerStateAndStartButton();
        // 视频房间重入：如果自己已坐下，自动开启本地摄像头
        this._restoreVideoOnReenter();
    }

    //奔跑请求队列
    RunRoomReqlist() {
        if (this.roomReqList.length) {
            let obj = this.roomReqList.shift();
            console.log(LN, '请求---->', obj.name);
            obj.func.call(this, this.RunRoomReqlist);
        } else {
            console.log(LN, '房间队列请求完毕---->');
        }
    }
    roomReqList: any = [];

    // _stateChange 根据入房间状态切换状态机
    private _stateChange(status: Def.GameStatusMap[keyof Def.GameStatusMap], rec: ServerMessageEnterRoom.AsObject) {
        switch (status) {
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
    }

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
                cc.tween(pot_info.trans).to(0.3, { position: GameUtil.TexasPots[i] }).start();
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
        if (GameplayUtil.GetTableType() === TableType.FRIEND) {
            if (this.uirc.Text_InvateCode) {
                this.uirc.Text_InvateCode.string = GameCache.Instance._friendsTableCode;
            }
        }
        info += `${GameCache.Instance.roomName}`;
        info += `\n${this.GetRoomTypeDes()}`;
        info += `\n${GameCache.Instance.room_id}-${this.mHandNum}`;
        let straddleStr: string = '';
        if (this.isBombPot) {
            info += `\n${CPErrorCode.LanguageDescription(20006)}${StringHelper.GetLongString(this.smallBlind * 2)} ${(straddleStr = this.CurStraddle ? 'straddle' : '')}`;
        } else if (this.groupBet > 0) {
            info += `\n${CPErrorCode.LanguageDescription(20006)}${StringHelper.GetLongString(this.smallBlind)}/${StringHelper.GetLongString(this.bigBlind)}(${StringHelper.GetLongString(this.groupBet)}) ${(straddleStr = this.CurStraddle ? 'straddle' : '')}`;
        } else {
            info += `\n${CPErrorCode.LanguageDescription(20006)}${StringHelper.GetLongString(this.smallBlind)}/${StringHelper.GetLongString(this.bigBlind)} ${(straddleStr = this.CurStraddle ? 'straddle' : '')}`;
        }
        //带出，最小带入倍数 RT_MANUAL手动的
        if (this.CurlimitOutChip == RoomInfo.RetainType.RT_MANUAL) {
            info += `\n${CPErrorCode.LanguageDescription(20087)}:${(GameCache.Instance.carry_small * this.CurrentMinRate) / 100}`;
        }
        let insuranceStr = '';
        if (this.isGPSRestrictions && this.isIpRestrictions) {
            // "GPS  IP限制";
            info += `\n${(insuranceStr = GameCache.Instance.insurance ? CPErrorCode.LanguageDescription(10021) + ' ' : '')}GPS  IP${CPErrorCode.LanguageDescription(20008)}`;
        } else if (this.isGPSRestrictions && !this.isIpRestrictions) {
            //"GPS限制";
            info += `\n${(insuranceStr = GameCache.Instance.insurance ? CPErrorCode.LanguageDescription(10021) + ' ' : '')}GPS${CPErrorCode.LanguageDescription(20008)}`;
        } else if (!this.isGPSRestrictions && this.isIpRestrictions) {
            // "IP限制;
            info += `\n${(insuranceStr = GameCache.Instance.insurance ? CPErrorCode.LanguageDescription(10021) + ' ' : '')}IP${CPErrorCode.LanguageDescription(20008)}`;
        } else if (GameCache.Instance.insurance) {
            info += `\n${CPErrorCode.LanguageDescription(10021)}`;
        }
        if (GameCache.Instance.CurlimitDelaySeeCard) {
            info += `\n${CPErrorCode.LanguageDescription(20088)}`;
        }
        info += this.mushroomFeature.BuildRoomDesc();
        info += this.squidFeature.BuildRoomDesc();
        info += this.BuildCriticalHitRoomDesc();
        if (this.callTime == 1) {
            info += `\nCallTime:${i18nMgr.Get('UIClub_GainNum')}${this.callTimeWinline}BB ${this.callTimeLimitCount}${i18nMgr.Get('UIMine_RecordDetailForNormal_ss')}`;
        }
        info += '\n\n';
        this.uirc.textRoomInfo.string = info;
        this.ShowCallTime();
    }

    public ShowCallTime(): void {
        if (!this.uirc?.callTimeArea) {
            return;
        }
        if (this.callTime == 1 && this.callTimeStay) {
            this.uirc.callTimeArea.active = true;
            if (this.uirc.callTimeDes) {
                this.uirc.callTimeDes.string = `Profit ${this.callTimeWinline}BB ${this.callTimeCount}/${this.callTimeLimitCount} hands`;
            }
        } else {
            this.uirc.callTimeArea.active = false;
            if (this.uirc.callTimeDes) {
                this.uirc.callTimeDes.string = '';
            }
        }
    }

    protected IsGameNotStart(): boolean {
        return this.gamestatus == Def.GameStatus.NOT_START && this.mHandNum == 0;
    }

    private RefreshRoomManagerStateAndStartButton(): void {
        this.UpdateStartGameState();
        if (GameCache.Instance.match_id != 0) {
            return;
        }
        const roomId = Number(GameCache.Instance.room_id || 0);
        if (roomId <= 0) {
            return;
        }
        WWW.Instance.CommonAPI({
            web_class: WebRoomCenterIsRoomAdmin,
            body: { room_id: roomId },
            juhua: false
        }).then(
            (res: any) => {
                console.log(LN, '[StartGameButton] is_room_admin', roomId, res?.code, res?.data?.is_admin);
                if (res && (res.code === undefined || Number(res.code) === 0)) {
                    const apiIsAdmin = res?.data?.is_admin;
                    if (apiIsAdmin !== undefined && apiIsAdmin !== null) {
                        GameCache.Instance.room_is_manager = !!apiIsAdmin;
                    }
                }
                this.UpdateStartGameState();
            },
            () => {
                this.UpdateStartGameState();
            }
        );
    }

    public UpdateStartGameState(): void {
        const btn = this.uirc?.StartGameButton;
        if (!btn) {
            return;
        }
        let playerCount = 0;
        if (this.listSeat != null) {
            this.listSeat.forEach(seat => {
                if (seat?.Player != null && (seat.Player.KeepSeatLeftTime || 0) <= 0) {
                    playerCount++;
                }
            });
        }
        const minPlayersCfg = Number(GameCache.Instance.room_min_players || 0);
        const minPlayers = minPlayersCfg > 0 ? minPlayersCfg : 2;
        const autoStartMinPlayers = Number(GameCache.Instance.room_autostart_min_players || 0);
        const isRoomManager = !!GameCache.Instance.room_is_manager;
        btn.active = playerCount >= minPlayers && this.IsGameNotStart() && autoStartMinPlayers === 0 && isRoomManager;
    }

    private UpdateCriticalHitConfig(rec: ServerMessageEnterRoom.AsObject): void {
        if (this.squidEnabled) {
            this.subGamePlayAnte = 0;
            this.criticalHitEnabled = false;
            this.criticalHitRound = 0;
            this.curCriticalHitRound = 0;
            this.isCriticalHitOpen = false;
            return;
        }
        const roomInfoAny = rec.roomInfo as any;
        const handInfoAny = rec.handInfo as any;
        const entryAny = GameCache.Instance as any;
        const subConfigs = roomInfoAny?.subConfigsList || roomInfoAny?.sub_configs || roomInfoAny?.subConfigs || [];
        const subCfg = subConfigs && subConfigs.length > 0 ? subConfigs[0] : null;
        const criticalHitFlag = subCfg?.criticalHit ?? subCfg?.critical_hit ?? roomInfoAny?.criticalHit ?? roomInfoAny?.critical_hit;
        const criticalHitValue = Number(criticalHitFlag || 0) > 0 ? Number(criticalHitFlag) : Number(entryAny.room_critical_hit || 0);
        const subAnteValue = Number(subCfg?.ante ?? subCfg?.an ?? 0);
        const roundValue = Number(roomInfoAny?.rounds || roomInfoAny?.criticalHitRound || 0);
        this.subGamePlayAnte = subAnteValue > 0 ? subAnteValue : Number(entryAny.room_critical_hit_ante || roomInfoAny?.ante || 0);
        this.criticalHitEnabled = criticalHitValue === 1;
        this.criticalHitRound = roundValue > 0 ? roundValue : Number(entryAny.room_critical_hit_round || 0);
        this.curCriticalHitRound = Number(handInfoAny?.conRounds || 0);
        this.isCriticalHitOpen = !!handInfoAny?.criticalHitOpen;
    }

    private ResolveJackpotConfig(raw: any): any {
        if (!raw) return null;
        if (typeof raw === 'string') {
            try {
                return JSON.parse(raw);
            } catch {
                return null;
            }
        }
        return raw;
    }

    private BuildCriticalHitRoomDesc(): string {
        if (!this.criticalHitEnabled) return '';
        const criticalHitBB = this.bigBlind > 0 ? Math.floor(this.subGamePlayAnte / this.bigBlind) : 0;
        let info = '';
        info += `\n${i18nMgr.Get('UIHitGamePlayTips4')}:${criticalHitBB}BB`;
        const cur = this.isCriticalHitOpen ? 0 : this.curCriticalHitRound + 1;
        info += `\n${i18nMgr.Get('UIHitGamePlayOpen')}:${cur}/${this.criticalHitRound}`;
        return info;
    }

    public ShowCriticalInfo(): void {
        const criticalHitKey = 'CriticalHit';
        const mushroomKey = 'Mushroom';
        const canShowMushroom = () => this.mushroomEnabled && UIDialogContentSizeLimit.IsOverDayLastUpload(mushroomKey);
        const showSquidIfNeeded = () => this.squidFeature?.TryShowGuideDialog();
        const showMushroomOrSquid = (noPrompt?: boolean) => {
            void noPrompt;
            if (canShowMushroom()) {
                this.ShowMushroomInfo(mushroomKey, showSquidIfNeeded);
                return;
            }
            showSquidIfNeeded();
        };
        if (this.criticalHitEnabled && UIDialogContentSizeLimit.IsOverDayLastUpload(criticalHitKey)) {
            const anteValue = this.subGamePlayAnte / 100;
            const anteBB = this.smallBlind > 0 ? this.subGamePlayAnte / 2 / this.smallBlind : 0;
            const content = `${anteValue}(${anteBB}BB)`;
            const color = '#FFC706';
            const popupContent =
                StringHelper.Format(i18nMgr.Get('UICriticalHit_StartGameTips'), [StringHelper.GetColorText(`${this.criticalHitRound}`, color)]) +
                StringHelper.GetColorText(content, color);
            UIComponent.open(UIDefine.UIDialogContentSizeLimit, {
                type: UIDialogContentSizeLimit.DialogType.Commit,
                title: i18nMgr.Get('UIHitGameTitle'),
                showTitleBg: false,
                contentCommit: i18nMgr.Get('adaptation10012'),
                content: popupContent,
                isCenter: true,
                promptKey: criticalHitKey,
                noAnimation: true,
                actionClose: showMushroomOrSquid,
                actionCancel: showMushroomOrSquid,
                actionCommit: showMushroomOrSquid
            });
            return;
        }
        showMushroomOrSquid();
    }

    private ShowMushroomInfo(promptKey: string, onDone?: () => void): void {
        // 延后一帧打开，避免与当前同类弹窗的关闭操作冲突
        setTimeout(() => {
            const color = '#FFC706';
            const content = StringHelper.Format(i18nMgr.Get('UIMushroom_StartGameTips'), [
                StringHelper.GetColorText(StringHelper.GetLongString(this.mushroomBase), color)
            ]);
            UIComponent.open(UIDefine.UIDialogContentSizeLimit, {
                type: UIDialogContentSizeLimit.DialogType.Commit,
                title: i18nMgr.Get('UIMushroomGameTitle'),
                showTitleBg: false,
                contentCommit: i18nMgr.Get('adaptation10012'),
                content: content,
                isCenter: true,
                promptKey: promptKey,
                noAnimation: true,
                actionClose: onDone,
                actionCancel: onDone,
                actionCommit: () => onDone?.()
            });
        }, 0);
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

    public PlayJackpotStartAnim(): void {
        this.jackpotFeature?.PlayStartAnim();
    }

    public PlayCriticalHitStartAnim(): void {
        const node = this.uirc?.CriticalHitStart;
        const anim = this.uirc?.CriticalHitStartAnim;
        if (!node || !anim) {
            return;
        }
        const clips = anim.getClips?.() || [];
        if (!anim.defaultClip && clips.length > 0) {
            anim.defaultClip = clips[0];
        }
        node.active = true;
        anim.stop();
        anim.off('finished', this.OnCriticalHitStartAnimFinished, this);
        anim.on('finished', this.OnCriticalHitStartAnimFinished, this);
        anim.play(anim.defaultClip?.name || 'critical_hit_start');
    }

    private OnCriticalHitStartAnimFinished(): void {
        const node = this.uirc?.CriticalHitStart;
        if (node && cc.isValid(node)) {
            node.active = false;
        }
    }

    /** 鱿鱼轮结束动画/结算弹窗 */
    public PlaySquidRoundEndAnim(rec?: ServerMessageWinner.AsObject): void {
        this.squidFeature.PlayRoundEndAnim(rec);
    }

    public OnClickJackpot(): void {
        this.jackpotFeature?.OnClickJackpot();
    }

    public OnJackpotGoldChange(rec: any): void {
        this.jackpotFeature?.OnGoldChange(rec);
    }

    public OnJackpotAward(rec: any): void {
        this.jackpotFeature?.OnAward(rec);
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
        let gameTypeStr: string = i18nMgr.Get('GameType_' + GameCache.Instance.game_type);
        let pokerTypeStr: string = i18nMgr.Get('PokerType_' + GameCache.Instance.poker_type);
        let betTypeStr: string = i18nMgr.Get('BetType_' + GameCache.Instance.bet_type);
        return gameTypeStr + '-' + pokerTypeStr + '-' + betTypeStr;
    }

    //初始化操作面板的位置
    InitOperationPos() {
        let Seat0: Seat = this.listSeat[0];
        let Operation_Pos = this.uirc.UIOperation_Con.convertToNodeSpaceAR(
            Seat0.uirc.Operation_Pos_Mark.parent.convertToWorldSpaceAR(Seat0.uirc.Operation_Pos_Mark.position)
        );
        const operationPos2D = cc.v2(Operation_Pos.x, Operation_Pos.y + 200);
        this.uirc.UIOperation_Com.SetUIPos(operationPos2D);
        this.uirc.UIAutoOperation_Com.SetUIPos(operationPos2D);
        console.log(LN, '设置 - InitOperationPos', Operation_Pos.toString());
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
        if (userId <= 0) return null;
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
            seat.RefreshCurRoundHaveBetContentPos(seat.seatUIInfo.bet_pos);
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
            cc.tween(seat.ui)
                .to(0.3, { position: infos[target_dir].seat_pos }, cc.easeQuadraticActionOut())
                .call(() => {
                    //更新方位配置
                    seat.UpdateSeatUIInfo(target_dir);
                    this.seatMoveStruct.move_cp_count++;
                    if (this.seatMoveStruct.move_cp_count >= seat_count) this.AllSeatMoveEnd();
                })
                .start();
        }
    }

    //座位运动结束的处理
    private AllSeatMoveEnd() {
        console.log(LN, '所有座位运动完毕');
        while (this.seatMoveStruct.cacheFuncs?.length) {
            let f = this.seatMoveStruct.cacheFuncs.shift();
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
        return this.dicSeatOnlyClient.get(clientSeatId);
    }

    // AddChips 补充筹码
    public async StartAddChips(): Promise<void> {
        try {
            const [userInfo, response] = await Promise.all([
                WWW.Instance.CommonAPI<HttpUserInfoProtocol.ResponseData>({
                    web_class: WebUserInfo
                }),
                WWW.Instance.CommonAPI<HttpRoomBringInByIDProtocol.ResponseData>({
                    web_class: WebUserRoomBringin,
                    api_id: GameCache.Instance.room_id
                })
            ]);
            // @TODO更新用户信息
            //GC.data.user.info  Update
            //被冻结
            if (userInfo.data.user.forbid == 0) {
                UIComponent.open<UIConfirmDialogParam>(UIDefine.UIConfirmDialog, {
                    title: '',
                    content: i18nMgr.Get('UIForbidBringInTips'),
                    ok: i18nMgr.Get('UIClub_CreateRoom7')
                });
                return;
            }
            // 联盟币
            if (!this.mainPlayer) {
                console.warn(LN, 'BringIn mainPlayer is null, abort');
                return;
            }
            const retainDetail: RetainInfo = {
                RetainType: GameCache.Instance._roomRecord.retainType,
                RetainMinRate: GameCache.Instance._roomRecord.retainMinRate,
                RetainMaxRate: GameCache.Instance._roomRecord.retainMaxRate
            };
            if (GameCache.Instance.gold_type == 1) {
                UIComponent.open<AddChipsData>(UIDefine.UIGameplayAddChipsAndDiamond, {
                    _bigBlind: GameCache.Instance._texasData._bigBlind,
                    _smallBlind: GameCache.Instance._texasData._smallBlind,
                    _currentMinRate: GameCache.Instance._texasData._curMinRate,
                    _currentMaxRate: GameCache.Instance._texasData._curMaxRate,
                    _tableChips: this.mainPlayer.chips,
                    _wallets: [response.data],
                    _source: BringInChipsType.SUPPLEMENT,
                    _creditNum: 0,
                    _commit: this._commitBringInCallback(),
                    _deposit: 0, // 如果在桌上不需要带入押金，这里要判断他的押金是否不足,到时候再补 deposit -user.current.deposit  @TODO
                    _diamonds: userInfo.data.user.diamonds,
                    _isTrader: GameplayUtil.IsTrader(userInfo.data.user),
                    _type: 1,
                    _retainInfo: retainDetail
                });
                return;
            }
            // 记分牌 @TODO
            if (GameCache.Instance.gold_type == 3) {
                const addChipType = GameCache.Instance.origin_type == 3 ? 3 : 2;
                UIComponent.open<AddChipsData>(UIDefine.UIGameplayAddChipsAndDiamond, {
                    _bigBlind: GameCache.Instance._texasData._bigBlind,
                    _smallBlind: GameCache.Instance._texasData._smallBlind,
                    _currentMinRate: GameCache.Instance._texasData._curMinRate,
                    _currentMaxRate: GameCache.Instance._texasData._curMaxRate,
                    _tableChips: this.mainPlayer.chips,
                    _wallets: [],
                    _source: BringInChipsType.SUPPLEMENT,
                    _creditNum: 0,
                    _commit: this._commitBringInCallback(),
                    _deposit: 0, // 如果在桌上不需要带入押金，这里要判断他的押金是否不足,到时候再补 deposit -user.current.deposit  @TODO
                    _diamonds: userInfo.data.user.diamonds,
                    _isTrader: GameplayUtil.IsTrader(userInfo.data.user),
                    _type: addChipType,
                    _retainInfo: retainDetail
                });
            }
        } catch (e) {
            console.error(LN, 'StartAddChips', e);
        }
    }

    /// <summary>
    /// 坐下
    /// </summary>
    /// <param name="clientSeatId"></param>
    public async Sitdown(clientSeatId: number, isEmptyClick: boolean = false): Promise<void> {
        //test
        //this.CurlimitOutChip = RoomInfo.RetainType.RT_AUTO;
        let mSeat: Seat = this.GetSeatByClientId(clientSeatId);
        if (null == mSeat) {
            console.warn(LN, `Sitdown 位置不存在 clientSeatId:${clientSeatId}`);
            return;
        }
        if (this.mainPlayer.seatID != -1) {
            console.warn(
                LN,
                `Sitdown 你已在其他位置 seatID ${this.mainPlayer.seatID}, clientSeatId ${this.GetSeatByLocalSeatID(this.mainPlayer.seatID).ClientSeatId}`
            );
            return;
        }
        if (null != mSeat.Player) {
            if (mSeat.Player.userID == this.mainPlayer.userID) {
                console.warn(LN, `Sitdown 你已在该位置 clientSeatId:${clientSeatId}`);
                return;
            }
            console.warn(LN, `Sitdown 该位置有其他玩家 clientSeatId:${clientSeatId}`);
            return;
        }
        const userInfo = await WWW.Instance.CommonAPI<HttpUserInfoProtocol.ResponseData>({
            web_class: WebUserInfo
        });
        // @TODO更新用户信息
        //GC.data.user.info  Update
        //被冻结
        if (userInfo.data.user.forbid == 0) {
            UIComponent.open<UIConfirmDialogParam>(UIDefine.UIConfirmDialog, {
                title: '',
                content: i18nMgr.Get('UIForbidBringInTips')
                //contentCommit: CPErrorCode.LanguageDescription(10012)
            });
            return;
        }
        // 视频房间：坐下前先请求浏览器摄像头权限（不依赖 Agora 频道状态）
        if (GameCache.Instance._videoModel !== VideoModel.NONE) {
            try {
                console.log('[Sitdown] 请求浏览器摄像头权限...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                // 权限通过，立即释放 stream（Agora 的 enableCamera 会自己创建 track）
                console.log('[Sitdown] 摄像头权限通过，释放 stream');
                stream.getTracks().forEach(t => t.stop());
            } catch (e) {
                // 权限被拒绝
                console.error('[Sitdown] 摄像头权限被拒绝:', e);
                ToastManager.Instance.showToast('必须同意浏览器的视频权限才能成功坐在视频桌');
                setTimeout(() => {
                    this.TexasGameUtils.LeaveRoom();
                }, 3000);
                return;
            }
        }
        this.cacheSitdownSeatId = mSeat.seatID;
        //之前带入信息查询
        try {
            const response = await WWW.Instance.CommonAPI<HttpRoomBringOutProtocol.ResponseData>({
                web_class: WebUserRoom,
                api_id: GameCache.Instance.room_id
            });
            // 请求异常
            if (response.code != 0) {
                console.error(LN, `Sitdown 坐下查询带入失败 ${response.code}`);
                return;
            }
            // 异步请求期间可能已被清理
            if (!this.mainPlayer) {
                console.warn(LN, 'Sitdown mainPlayer is null, abort');
                return;
            }
            let seatedData: ClientMessageSeated.AsObject = {
                room: {
                    roomId: GameCache.Instance.room_id,
                    matchId: GameCache.Instance.match_id
                },
                seatId: this.GetRemoteSeatID(mSeat.seatID),
                bringIn: 0,
                autoOnTable: 0,
                autoUseWallet: false,
                returnOrNew: response.data.return_table ? 1 : 0,
                store: 0,
                clubId: 0,
                applyBringIn: false,
                autoOnTableNoStore: false,
                autoOnTableFix: 0,
                depositAdvance: 0,
                autoOnTableMax: 0
            };
            const retainDetail: RetainInfo = {
                RetainType: GameCache.Instance._roomRecord.retainType,
                RetainMinRate: GameCache.Instance._roomRecord.retainMinRate,
                RetainMaxRate: GameCache.Instance._roomRecord.retainMaxRate
            };
            // 自动藏钱要设置几个参数
            if (retainDetail.RetainType == RoomInfo.RetainType.RT_AUTO) {
                seatedData.autoOnTable = retainDetail.RetainMinRate * GameCache.Instance._roomRecord.sb * 2;
                seatedData.autoOnTableFix = retainDetail.RetainMinRate * GameCache.Instance._roomRecord.sb * 2;
                seatedData.autoOnTableMax = retainDetail.RetainMaxRate * GameCache.Instance._roomRecord.sb * 2;
            }
            let addChipData: AddChipsData = {
                _bigBlind: GameCache.Instance._texasData._bigBlind,
                _smallBlind: GameCache.Instance._texasData._smallBlind,
                _currentMinRate: GameCache.Instance._texasData._curMinRate,
                _currentMaxRate: GameCache.Instance._texasData._curMaxRate,
                _tableChips: this.mainPlayer.chips,
                _wallets: response.data.wallet,
                _source: BringInChipsType.BRING_IN,
                _creditNum: response.data.user_club_gold_credit,
                _deposit: GameCache.Instance._texasData._deposit,
                _commit: this._commitBringInCallback(seatedData),
                _diamonds: userInfo.data.user.diamonds,
                _isTrader: GameplayUtil.IsTrader(userInfo.data.user),
                _type: 0,
                _retainInfo: retainDetail
            };
            // 联盟币
            if (GameCache.Instance.gold_type == 1) {
                addChipData._type = 1;
                // 有带出
                if (response.data.last_bring_out != null) {
                    let returnAmount = response.data.last_bring_out.to_wallet + response.data.last_bring_out.fee;
                    // 要带回桌子上金额
                    let bringToTable = response.data.last_bring_out.to_wallet + response.data.last_bring_out.fee - GameCache.Instance._texasData._deposit;
                    const returnFromWallet = response.data.last_bring_out.to_wallet;
                    const walletAmount = UITexasModel.mInstance.getGoldFromWallets(response.data.last_bring_out.club_id, response.data.wallet);
                    // 要反桌，但是钱包钱不够了
                    if (bringToTable > 0 && returnFromWallet > walletAmount) {
                        console.log(LN, 'return table, not enough from wallet', 'need:', returnFromWallet, 'current:', walletAmount);
                        // 金额不足
                        UIComponent.Instance.Toast(i18nMgr.Get('adaptation20010') + `(${returnFromWallet} > ${walletAmount})`);
                        return;
                    }
                    seatedData.bringIn = returnAmount;
                    seatedData.clubId = response.data.last_bring_out.club_id;
                    // 钱包够,没输光(反桌)
                    if (bringToTable > 0) {
                        // 没有藏钱直接坐下
                        if (retainDetail.RetainType == RoomInfo.RetainType.RT_DISABLE || ( retainDetail.RetainType == RoomInfo.RetainType.RT_AUTO  && bringToTable >= seatedData.autoOnTable)) {
                            ProtocolAgency.Send<ClientMessageSeated.AsObject>({
                                Code: ProtocolCode.Protocol_Holdem_Seated,
                                RoomID: GameCache.Instance.room_id,
                                MatchID: GameCache.Instance.match_id,
                                Body: seatedData
                            });
                        }
                        // 如果有藏钱的逻辑(还要保留最小上桌)
                        if (retainDetail.RetainType ==  RoomInfo.RetainType.RT_MANUAL) {
                            if (bringToTable >= retainDetail.RetainMinRate * GameCache.Instance._roomRecord.sb * 2) {
                                //手动逻辑自己管理Store
                                seatedData.store = bringToTable - retainDetail.RetainMinRate * GameCache.Instance._roomRecord.sb * 2;
                            }
                            ProtocolAgency.Send<ClientMessageSeated.AsObject>({
                                Code: ProtocolCode.Protocol_Holdem_Seated,
                                RoomID: GameCache.Instance.room_id,
                                MatchID: GameCache.Instance.match_id,
                                Body: seatedData
                            });
                        }
                    }
                    // 其他都需要弹窗口输入
                    UIComponent.open<AddChipsData>(UIDefine.UIGameplayAddChipsAndDiamond, addChipData);
                    return;
                }
                //是否需要显示安全提示
                if (!this.shouldShowBringInSecuritySetting()) {
                    // if (this.CurlimitOutChip == RoomInfo.RetainType.RT_AUTO) {
                    //     // this.ShowAutoAddChips(data.wallet);
                    // } else {
                    UIComponent.open<AddChipsData>(UIDefine.UIGameplayAddChipsAndDiamond, addChipData);
                    //}
                    return;
                }
                // 非首次不显示
                UIComponent.open(UIDefine.UIGameplaySecuritySetting, {
                    isFromBringIn: true,
                    bringInAct: () => {
                        // if (this.CurlimitOutChip == RoomInfo.RetainType.RT_AUTO) {
                        //     // this.ShowAutoAddChips(data.wallet);
                        // } else {
                        UIComponent.open<AddChipsData>(UIDefine.UIGameplayAddChipsAndDiamond, addChipData);
                        //}
                    },
                    noAnimation: true
                });
            }
            // 记分牌(朋友卓)
            if (GameCache.Instance.gold_type == 3) {
                //@TODO 朋友卓
                addChipData._type = GameCache.Instance.origin_type == 3 ? 3 : 2;
                // 有带出
                if (response.data.last_bring_out != null) {
                    let returnAmount = response.data.last_bring_out.to_wallet + response.data.last_bring_out.fee;
                    // 要带回桌子上金额
                    const bringToTable = response.data.last_bring_out.to_wallet + response.data.last_bring_out.fee - GameCache.Instance._texasData._deposit;
                    seatedData.bringIn = returnAmount;
                    seatedData.clubId = response.data.last_bring_out.club_id;
                    // 钱包够,没输光(反桌)
                    if (bringToTable > 0) {
                        ProtocolAgency.Send<ClientMessageSeated.AsObject>({
                            Code: ProtocolCode.Protocol_Holdem_Seated,
                            RoomID: GameCache.Instance.room_id,
                            MatchID: GameCache.Instance.match_id,
                            Body: seatedData
                        });
                        return;
                    }
                    // 其他都需要弹窗口输入
                    UIComponent.open<AddChipsData>(UIDefine.UIGameplayAddChipsAndDiamond, addChipData);
                    return;
                }
                // 不提示安全提示直接带入
                UIComponent.open<AddChipsData>(UIDefine.UIGameplayAddChipsAndDiamond, addChipData);
            }
        } catch (e) {
            console.error(LN, 'sit down', e);
        }
    }

    // _commitBringInCallback 带入流程，最后按钮按下去的处理(要么坐下，要么带入)
    private _commitBringInCallback(seatedData?: ClientMessageSeated.AsObject): (amount: number, store: number, autoOnTable: number, clubID: number) => void {
        // 要坐下
        if (seatedData)
            return (amount, store, autoOnTable, clubID) => {
                seatedData.bringIn = amount;
                seatedData.clubId = clubID;
                if (clubID > 0) {
                    this.bringInClubId = clubID;
                }
                // 如果用钱包自动充值
                if (autoOnTable > 0) {
                    seatedData.autoOnTableNoStore = true;
                    seatedData.autoUseWallet = true;
                    seatedData.autoOnTable = autoOnTable;
                } else {
                    // 手动藏钱
                    seatedData.store = store;
                    // 如果是自动藏钱，已经在初始化的时候用房间配置设定
                }
                ProtocolAgency.Send<ClientMessageSeated.AsObject>({
                    Code: ProtocolCode.Protocol_Holdem_Seated,
                    RoomID: GameCache.Instance.room_id,
                    MatchID: GameCache.Instance.match_id,
                    Body: seatedData
                });
            };
        return (amount, store, autoOnTable, clubID) => {
            //普通加筹码
            let applyBringIn = (GameUtil.GetFriendsOrClubTable() == 1 || GameUtil.GetFriendsOrClubTable() == 2) && GameCache.Instance.FriendsTableLimitBringIn;
            ProtocolAgency.Send<ClientMessageBringIn.AsObject>({
                Code: ProtocolCode.Protocol_Holdem_BringIn,
                RoomID: GameCache.Instance.room_id,
                MatchID: GameCache.Instance.match_id,
                Body: {
                    room: {
                        roomId: GameCache.Instance.room_id,
                        matchId: GameCache.Instance.match_id
                    },
                    bringIn: amount,
                    useWallet: true,
                    applyBringIn: applyBringIn,
                    depositAdvance: 0
                }
            });
            // 用户想自动充值了使用协议设置自动化
            if (autoOnTable > 0) {
                ProtocolAgency.Send<ClientMessageSetAutoOnTable.AsObject>({
                    Code: ProtocolCode.Protocol_Holdem_SetAutoOnTable,
                    RoomID: GameCache.Instance.room_id,
                    MatchID: GameCache.Instance.match_id,
                    Body: {
                        room: {
                            roomId: GameCache.Instance.room_id,
                            matchId: GameCache.Instance.match_id
                        },
                        autoOnTable: autoOnTable,
                        autoUseWallet: true,
                        autoOnTableNoStore: true,
                        autoOnTableFix: autoOnTable
                    }
                });
            }
        };
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
        return localSeatID + 1;
    }

    public ShowSafetyGuardBtn(): void {
        this.uirc.btn_safety_guard.active = this.tribeId > 0;
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
        if (null == this.uirc.buttonWaitBlind || !this.uirc.buttonWaitBlind.activeInHierarchy) return;
        this.uirc.buttonWaitBlind.active = false;
    }

    public onClickWaitBlind(): void {
        const now = GlobalSession.NowTimeMS || 0;
        if (now - this.lastAgreePostReqTime < 200) {
            return;
        }
        this.lastAgreePostReqTime = now;
        console.log(LN, '[WaitBlind] send agree post', {
            localSeatID: this.mainPlayer?.seatID,
            serverSeatID: (this.mainPlayer?.seatID ?? -1) + 1
        });
        ProtocolAgency.Send<ClientMessageAgreePost.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_AgreePost,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id }
            }
        });
    }

    /** 获取当前最小带入（含蘑菇押金） */
    public GetMinBringInWithMush(): number {
        return this.mushroomFeature.GetMinBringIn();
    }

    // /// <summary>
    // /// 带入
    // /// </summary>
    // /// <param name="anteNumber"></param>
    // public AddChips(
    //     anteNumber: number,
    //     autoOnTable: number = 0,
    //     autoUseWallet: boolean = false,
    //     club_id = 0,
    //     club_random_id = 0,
    //     fromBring: { wallets: any; selected_wallet: any; own: any } = null,
    //     returnOrNew: boolean = false,
    // ) {
    //     //大厅桌
    //     if (GameUtil.GetFriendsOrClubTable() == 3) {
    //         if (anteNumber > UITexasModel.mInstance.GetGoldByClubID(club_id)) {
    //             //多钱包有其他支付
    //             if (fromBring?.wallets.length > 1) {
    //                 UIComponent.open<UIConfirmDialogParam>(
    //                     UIDefine.UIComfirmDialog,
    //                     {
    //                         content: i18nMgr.Get("ServerErrorCode_20004"),
    //                         commit: i18nMgr.Get(
    //                             "UIMine_WalletAddchipsListItems",
    //                         ),
    //                         cancel: i18nMgr.Get("UI_otherPay"),
    //                         commit_click: () => {
    //                             WWW.Instance.CommonAPI({
    //                                 web_class: WebOrgClubSearchById,
    //                                 body: {
    //                                     club_random_id: club_random_id,
    //                                 },
    //                             }).then(
    //                                 (res: any) => {
    //                                     UIComponent.open(
    //                                         UIDefine.UIToRecharge,
    //                                         {
    //                                             type: 1,
    //                                             walletType: WalletType.Club,
    //                                             club_id: res.data.club_id,
    //                                             club_name: res.data.club_name,
    //                                             tribe_name: res.data.tribe_name,
    //                                         },
    //                                     );
    //                                 },
    //                                 (res: any) => { },
    //                             );
    //                         },
    //                         cancel_click: () => {
    //                             UIComponent.open(
    //                                 UIDefine.UIClubWalletList,
    //                                 fromBring,
    //                             );
    //                         },
    //                     },
    //                 );
    //             } else {
    //                 UIComponent.open<UIConfirmDialogParam>(
    //                     UIDefine.UIComfirmDialog,
    //                     {
    //                         content: i18nMgr.Get("ServerErrorCode_20004"),
    //                         ok: i18nMgr.Get("UIMine_WalletAddchipsListItems"),
    //                         ok_click: () => {
    //                             WWW.Instance.CommonAPI({
    //                                 web_class: WebOrgClubSearchById,
    //                                 body: {
    //                                     club_random_id: club_random_id,
    //                                 },
    //                             }).then(
    //                                 (res: any) => {
    //                                     UIComponent.open(
    //                                         UIDefine.UIToRecharge,
    //                                         {
    //                                             type: 1,
    //                                             walletType: WalletType.Club,
    //                                             club_id: res.data.club_id,
    //                                             club_name: res.data.club_name,
    //                                             tribe_name: res.data.tribe_name,
    //                                         },
    //                                     );
    //                                 },
    //                                 (res: any) => { },
    //                             );
    //                         },
    //                     },
    //                 );
    //             }
    //             return;
    //         }
    //     }
    //     //朋友桌不需要判断金豆
    //     // if (GameCache.Instance.origin_type != 4 && GC.data.user.info.gold < anteNumber) {
    //     //     UIComponent.open(UIDefine.UIDialogComponent,
    //     //         {
    //     //             type: UIDialogComponent.DialogType.CommitCancel,
    //     //             // title = $"余额不足",
    //     //             title: CPErrorCode.LanguageDescription(10025),
    //     //             // content = $"金豆余额不足，请先充值",
    //     //             content: CPErrorCode.LanguageDescription(20010),
    //     //             // contentCommit = "去充豆",
    //     //             contentCommit: CPErrorCode.LanguageDescription(10026),
    //     //             // contentCancel = "取消",
    //     //             contentCancel: CPErrorCode.LanguageDescription(10013),
    //     //             actionCommit: () => {
    //     //                 //跳转充豆
    //     //                 UIComponent.open(UIDefine.MyWalletForm, false);
    //     //             },
    //     //             noAnimation: true,
    //     //         });
    //     //     return;
    //     // }
    //     if (this.mainPlayer == null || this.mainPlayer.seatID == -1) {
    //         //声纹认证开启判断
    //         if (GameCache.Instance.voiceprint_verify_on == 1) {
    //             //             UITexasModel.mInstance.APIUserVoiceprint(0, 0, Act => {
    //             //                 if (Act.code == 0) {
    //             //                     if (Act.data == null) {
    //             //                         if (!MicrophoneHelper.IsMicrophonePermissionAllowed()) {
    //             //                             return;
    //             //                         }
    //             //                         Game.Scene.GetComponent<UIComponent>().PrefabUI(UIType.UITexasHumanYZ, new UITexasHumanYZComponent.VerificationDataInfo()
    //             //     								{
    //             //                                 cacheVoiceprint = VoiceprintRoomType.Hall,
    //             //                                 isHaveVoice = true
    //             //                             });
    //             //                     }
    //             //                     else {
    //             //                         CPGameSessionComponent.Instance.Send(new Protocol_Holdem_Seated()
    //             //     								{
    //             //                                 RoomID = (ulong)GameCache.Instance.room_id,
    //             //                                 MatchID = (ulong)GameCache.Instance.match_id,
    //             //                                 request = new ClientMessageSeated()
    //             //     									{
    //             //                                 Room = new Room() { RoomId = (uint)GameCache.Instance.room_id, MatchId = (uint)GameCache.Instance.match_id },
    //             //                             SeatId = GetRemoteSeatID((sbyte)cacheSitdownSeatId),
    //             //                             BringIn = (ulong)anteNumber,//rec.Chips
    //             //                             AutoOnTable = autoOnTable,
    //             //                             //Store= storeChip,
    //             //                             AutoUseWallet = autoUseWallet
    //             //     									}
    //             //                 });
    //             //         }
    //             //         return;
    //             //     }
    //             // });
    //             UIComponent.Instance.Toast("声纹认证暂未开启");
    //         } else {
    //             console.log(LN, 'seated bringin', anteNumber, "returnOrNew:", returnOrNew);
    //             ProtocolAgency.Send<ClientMessageSeated.AsObject>({
    //                 Code: ProtocolCode.Protocol_Holdem_Seated,
    //                 RoomID: GameCache.Instance.room_id,
    //                 MatchID: GameCache.Instance.match_id,
    //                 Body: {
    //                     room: {
    //                         roomId: GameCache.Instance.room_id,
    //                         matchId: GameCache.Instance.match_id,
    //                     },
    //                     seatId: this.GetRemoteSeatID(this.cacheSitdownSeatId),
    //                     bringIn: anteNumber, //rec.Chips
    //                     autoOnTable: autoOnTable,
    //                     autoUseWallet: autoUseWallet,
    //                     returnOrNew: returnOrNew ? 1 : 0,
    //                     store: 0,
    //                     applyBringIn:
    //                         (GameUtil.GetFriendsOrClubTable() == 1 ||
    //                             GameUtil.GetFriendsOrClubTable() == 2) &&
    //                         GameCache.Instance.FriendsTableLimitBringIn,
    //                     clubId: club_id,
    //                     autoOnTableNoStore: false,
    //                     autoOnTableFix: 0,
    //                     depositAdvance: 0,
    //                     autoOnTableMax: 0,
    //                 },
    //             });
    //         }
    //         return;
    //     }
    //     //已经上桌就发送带入补充
    //     let IsUseWallet = true;
    //     if (this.mainPlayer.cacheStoreChips >= anteNumber) {
    //         IsUseWallet = false;
    //     }
    //     let applyBringIn =
    //         (GameUtil.GetFriendsOrClubTable() == 1 ||
    //             GameUtil.GetFriendsOrClubTable() == 2) &&
    //         GameCache.Instance.FriendsTableLimitBringIn;
    //     console.log(LN, 'only bringin', anteNumber, applyBringIn);
    //     ProtocolAgency.Send<ClientMessageBringIn.AsObject>({
    //         Code: ProtocolCode.Protocol_Holdem_BringIn,
    //         RoomID: GameCache.Instance.room_id,
    //         MatchID: GameCache.Instance.match_id,
    //         Body: {
    //             room: {
    //                 roomId: GameCache.Instance.room_id,
    //                 matchId: GameCache.Instance.match_id,
    //             },
    //             bringIn: anteNumber,
    //             useWallet: IsUseWallet,
    //             applyBringIn: applyBringIn,
    //             depositAdvance: 0,
    //         },
    //     });
    //     //需要审核的加入提示信息
    //     // if (applyBringIn) {
    //     //     UIComponent.Instance.Toast(`${i18nMgr.Get("UITexas_FriendtableapplyBringinTips001")}${150}s`);
    //     // }
    // }

    SetAutoOnTableChips(autoOnTable: number = 0, autoUseWallet: boolean = false) {
        ProtocolAgency.Send<ClientMessageSetAutoOnTable.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_SetAutoOnTable,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: {
                    roomId: GameCache.Instance.room_id,
                    matchId: GameCache.Instance.match_id
                },
                autoOnTable: autoOnTable, //自动带入值
                autoUseWallet: autoUseWallet, //是否账户带入
                autoOnTableNoStore: false,
                autoOnTableFix: 0
            }
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
        if (null == mSeat) return;
        ProtocolAgency.Send<ClientMessageStandupActive.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_StandupActive,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: {
                    roomId: GameCache.Instance.room_id,
                    matchId: GameCache.Instance.match_id
                },
                cancelStandup: false,
                manualChangeRoom: false
            }
        });
    }

    /// <summary>
    /// 获取筹码Sprite
    /// </summary>
    /// <param name="spriteName"></param>
    /// <returns></returns>
    // public GetChipSpriteBySpriteName(spriteName: string): cc.SpriteFrame {
    //     let sf: cc.SpriteFrame = AssetContext.getAsset(spriteName, AssetFold.texture_TexasUI);
    //     if (!sf) console.log(LN,"素材获取失败:", spriteName);
    //     return sf;
    // }
    // //获取气泡相关的spriteframe
    // public GetBubbleSpriteBySpriteName(spriteName: string): cc.SpriteFrame {
    //     let sf: cc.SpriteFrame = AssetContext.getAsset(spriteName, AssetFold.texture_TexasUI);
    //     if (!sf) console.log(LN,"素材获取失败:", spriteName);
    //     return sf;
    // }
    /// <summary>
    /// 播放发牌动画
    /// </summary>
    //public PlayDealAnimation(TweenCallback tweenCallback:Function) {
    public PlayDealAnimation(tweenCallback: Function) {
        this.sequencePlayDealAnimation = {
            tween: cc.tween(this.uirc.node),
            IsPlaying: true
        };
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
                if (null == mSeat || null == mSeat.Player || !mSeat.Player.isPlaying) continue;
                mSeat.UpdateGroupBet();
                allGroupBet += this.groupBet;
                mSeat.PlayBetAnimation();
            }
            // mIsFirstGroupBet = true;
            for (let i = 0, n = this.listSeat.length; i < n; i++) {
                mSeat = this.listSeat[i];
                if (null == mSeat || null == mSeat.Player || !mSeat.Player.isParticipateInTheGame) continue;
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
            let delayTime: number = 0.2 * mTmpIndex;
            endTime = delayTime;
            tween.then(
                cc.callFunc(() => {
                    mSeat.PlayDealAnimation(delayTime, mStartPos).start();
                })
            );
            mTmpIndex++;
        }
        tween.delay(endTime + 0.4);
        if (null != tweenCallback) {
            this.sequencePlayDealAnimation && (this.sequencePlayDealAnimation.IsPlaying = false);
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
        ProtocolAgency.Send<ClientMessageAction.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_Action,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: {
                    roomId: GameCache.Instance.room_id,
                    matchId: GameCache.Instance.match_id
                },
                action: action,
                amount: anteNumber,
                clubId: 0
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
            for (let i = 0; i < this.listSeat.length; i++) {
                const mSeat = this.listSeat[i];
                if (this.mainPlayer.seatID == mSeat.seatID) {
                    mSeat.SetOperationHeadActive(true);
                    break;
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
        if (this.ClickAddTime) return;
        this.uirc.Button_Delay.active = false;
        UIComponent.Instance.HideUI(PrefabUI.UIOperationComponent);
    }

    /// <summary>
    /// 隐藏返回游戏按钮
    /// </summary>
    public HideCancelTrustBtn(): void {
        console.log(LN, '关闭了返回按钮？？？？？？？？？？？？');
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
        if (!this.uirc.Text_AlreadAnte) return cc.Vec3.ZERO;
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
        let cardId: number = null;
        let cards = this.GetPublicCards(1);
        if (startIndex == 0) {
            //第0张牌，设定第1,2张牌位置都在0号位置
            let index = 2;
            PublicCardInfo = this.uirc.listCards[index];
            //PublicCardInfo.cardId = this.cards[index];
            cardId = cards[index];
            PublicHelper.InitSprite(PublicCardInfo.imageCard); //, this.GetBigPokerSP(GameUtil.GetCardNameByNum(-1)));
            PublicHelper.InitNode(PublicCardInfo.trans, this.listDefaultPublicCardsLPos[0]);
            PublicCardInfo.SetSpriteFrame(-1);
            this.sequenceUpdatePublicCards.Append(() => {
                cc.tween(PublicCardInfo.trans).to(0.1, { scaleX: 0 }).start();
            }, 0.1);
            this.sequenceUpdatePublicCards.Append(() => {
                GC.sound.Play('sfx_desk_chat');
                //PublicCardInfo.imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId));
                PublicCardInfo.SetSpriteFrame(cardId);
                cc.tween(PublicCardInfo.trans).to(0.1, { scaleX: 1 }).start();
            }, 0.1);
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
                        PublicHelper.InitSprite(imageCard); //, this.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId)));
                        PublicCardInfo.SetSpriteFrame(cardId);
                        cc.tween(trans).to(0.4, { position: move_pos }).start();
                    }, 0.4);
                } else {
                    this.sequenceUpdatePublicCards.Join(() => {
                        trans.active = true;
                        trans.setScale(1, 1);
                        PublicHelper.InitSprite(imageCard); //, this.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId)));
                        PublicCardInfo.SetSpriteFrame(cardId);
                        cc.tween(trans).to(0.4, { position: move_pos }).start();
                    }, 0.4);
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
                    PublicHelper.InitSprite(imageCard); //, this.GetBigPokerSP(GameUtil.GetCardNameByNum(-1)));
                    PublicHelper.InitNode(trans, this.listDefaultPublicCardsLPos[i], false);
                    PublicCardInfo.SetSpriteFrame(-1);
                    this.sequenceUpdatePublicCards.Append(() => {
                        trans.active = true;
                        cc.tween(trans)
                            .to(0.2, { scaleX: 0 })
                            .then(
                                cc.callFunc(() => {
                                    //imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId));
                                    PublicCardInfo.SetSpriteFrame(cardId);
                                    GC.sound.Play('sfx_desk_chat');
                                })
                            )
                            .to(0.2, { scaleX: 1 })
                            .start();
                    }, 0.4);
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
        } else {
            for (let i = startIndex, n = mCacheCount; i < n; i++) {
                let PublicCardInfo = this.uirc.listCards[i];
                let trans = PublicCardInfo.trans;
                let imageCard = PublicCardInfo.imageCard;
                let cardId = cards[i];
                let move_pos = this.listDefaultPublicCardsLPos[i];
                //PublicCardInfo.cardId = cardId;
                PublicHelper.InitSprite(imageCard); //, this.GetBigPokerSP(GameUtil.GetCardNameByNum(-1)));
                PublicHelper.InitNode(trans, move_pos, false);
                PublicCardInfo.SetSpriteFrame(-1);
                this.sequenceUpdatePublicCards.Append(() => {
                    trans.active = true;
                    cc.tween(trans)
                        .to(0.2, { scaleX: 0 })
                        .call(() => {
                            //imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId));
                            PublicCardInfo.SetSpriteFrame(cardId);
                        })
                        .to(0.2, { scaleX: 1 })
                        .start();
                }, 0.4);
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
        const firstComplete = () => {
            // 参与了牌局，才能看到牌型提示
            let mClientSeat: Seat = this.GetSeatByClientId(0);
            if (null != mClientSeat.Player && mClientSeat.Player.userID == this.mainPlayer.userID && this.mainPlayer.isParticipateInTheGame) {
                let highlightCards_ref = { highlightCards: [] as number[] };
                let cardType: CardType = this.GetCardType(highlightCards_ref, cards);
                let highlightCards = highlightCards_ref.highlightCards;
                for (let i = 0, n = this.uirc.listCards.length; i < n; i++) {
                    this.uirc.listCards[i].imageSelect.node.active = false;
                    if (!this.isBombPot) {
                        for (let j = 0, m = highlightCards.length; j < m; j++) {
                            if (this.uirc.listCards[i].cardId == highlightCards[j]) {
                                this.uirc.listCards[i].imageSelect.node.active = true;
                                break;
                            }
                        }
                    }
                }
                let mSeat: Seat = this.GetSeatByLocalSeatID(this.mainPlayer.seatID);
                if (null != mSeat) {
                    mSeat.UpdateCardType(cardType, highlightCards);
                }
            }
            tweenCallback?.();
        };
        const needSecondTween = !!SecondtweenCallback && this.IsSecondPsc && (this.isBombPot || mCacheCount == 5);
        if (needSecondTween) {
            this.sequenceUpdatePublicCards.AppendInterval(0.5);
            this.sequenceUpdatePublicCards.OnComplete(() => {
                SecondtweenCallback?.();
                if (this.isBombPot) {
                    // BombPot 要先发第二套牌，再恢复第一套牌后续逻辑
                    cc.tween(this.uirc.node)
                        .delay(0.6)
                        .call(() => firstComplete())
                        .start();
                } else {
                    firstComplete();
                }
            });
        } else {
            this.sequenceUpdatePublicCards.OnComplete(() => {
                firstComplete();
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
        this.sequenceSecondUpdatePublicCards = {
            tween: cc.tween(this.uirc.node),
            IsPlaying: true
        };
        let tween: cc.Tween = this.sequenceSecondUpdatePublicCards.tween;
        let cards: number[] = this.GetPublicCards(2);
        //第二套牌为五张牌时
        if (cards_2Count == 5) {
            //#region 第三张牌翻牌动画
            let PublicCardInfo: PublicCardInfo = null;
            PublicCardInfo = this.uirc.listSecondCards[2]; //三张一起发，从第三张显示翻牌动画
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
            tween.then(
                cc.callFunc(() => {
                    cc.tween(CacheTrans)
                        .to(0.1, { scaleX: 0 })
                        .then(
                            cc.callFunc(() => {
                                //CacheImage.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(CacheCardId));
                                PublicCardInfo.SetSpriteFrame(CacheCardId);
                                GC.sound.Play('sfx_desk_chat');
                            })
                        )
                        .to(0.1, { scaleX: 1 })
                        .call(() => {
                            let mPublicCardInfo0: PublicCardInfo = this.uirc.listSecondCards[0];
                            mPublicCardInfo0.imageCard.node.color = cc.Color.WHITE;
                            //mPublicCardInfo0.cardId = this.cards_2[0];
                            //mPublicCardInfo0.imageCard.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(mPublicCardInfo0.cardId));
                            mPublicCardInfo0.SetSpriteFrame(cards[0]);
                            mPublicCardInfo0.trans.setPosition(this.listDefaultSecondPublicCardsLPos[0]);
                            mPublicCardInfo0.trans.setScale(cc.Vec3.ONE);
                            mPublicCardInfo0.trans.active = true;
                        })
                        .start();
                })
            );
            tween.delay(0.2);
            tween.delay(0.4);
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
                    tween.then(
                        cc.callFunc(() => {
                            mCacheTrans.active = true;
                            cc.tween(mCacheTrans)
                                .to(0.4, {
                                    position: this.listDefaultSecondPublicCardsLPos[i]
                                })
                                .start();
                        })
                    );
                } else if (i > mTmpStartIndex) {
                    tween.then(
                        cc.callFunc(() => {
                            mCacheTrans.active = true;
                            cc.tween(mCacheTrans)
                                .to(0.4, {
                                    position: this.listDefaultSecondPublicCardsLPos[i]
                                })
                                .call(() => {
                                    if (cardTypeIndex == 2) {
                                        let sCards: number[] = [];
                                        sCards.push(...cards);
                                        sCards[cardTypeIndex + 1] = -1;
                                        sCards[cardTypeIndex + 2] = -1;
                                        this.UpdateSecondPublicCardsCardType(sCards);
                                    }
                                })
                                .start();
                        })
                    );
                }
                if (i == 2) tween.delay(0.4);
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
                tween.then(
                    cc.callFunc(() => {
                        mCacheTrans.active = true;
                        cc.tween(mCacheTrans)
                            .to(0.2, { scaleX: 0 })
                            .then(
                                cc.callFunc(() => {
                                    //mCacheImage1.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(mCacheCardId1));
                                    PublicCardInfo.SetSpriteFrame(mCacheCardId1);
                                    GC.sound.Play('sfx_desk_chat');
                                })
                            )
                            .to(0.2, { scaleX: 1 })
                            .call(() => {
                                if (cardTypeIndex == 3) {
                                    let sCards = [];
                                    sCards.push(...cards);
                                    sCards[cardTypeIndex + 1] = -1;
                                    this.UpdateSecondPublicCardsCardType(sCards);
                                } else {
                                    this.UpdateSecondPublicCardsCardType(cards);
                                }
                            })
                            .start();
                    })
                );
            }
            //#endregion
        } else {
            if (this.isBombPot) {
                // BombPot：首轮三张，后续每轮一张（3 + 1 + 1）
                const sendCount = cards_2Count;
                if (sendCount === 3) {
                    for (let i = 0; i < sendCount; i++) {
                        this.bombPotFeature?.AppendDealSecondCardTween(tween, i);
                    }
                } else if (sendCount === 1) {
                    this.bombPotFeature?.AppendDealSecondCardTween(tween, CardsCount);
                }
            } else {
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
                    tween.then(
                        cc.callFunc(() => {
                            cc.tween(mCacheTrans)
                                .to(0.2, { scaleX: 1.2 })
                                .then(
                                    cc.callFunc(() => {
                                        GC.sound.Play('sfx_desk_chat');
                                    })
                                )
                                .parallel(cc.scaleTo(0.2, 1), cc.moveTo(0.4, CacheDefaultPublicCardsLPos))
                                .then(
                                    cc.callFunc(() => {
                                        if (cardTypeIndex == 2) {
                                            let sCards = [];
                                            sCards.push(...cards);
                                            sCards[cardTypeIndex + 1] = -1;
                                            sCards[cardTypeIndex + 2] = -1;
                                            this.UpdateSecondPublicCardsCardType(sCards);
                                        }
                                    })
                                )
                                .start();
                        })
                    );
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
                    tween.then(
                        cc.callFunc(() => {
                            mCacheTrans.active = true;
                            cc.tween(mCacheTrans)
                                .to(0.2, { scaleX: 0 })
                                .then(
                                    cc.callFunc(() => {
                                        PublicCardInfo.SetSpriteFrame(mCacheCardId);
                                        //mCacheImage.spriteFrame = this.GetBigPokerSP(GameUtil.GetCardNameByNum(mCacheCardId));
                                        GC.sound.Play('sfx_desk_chat');
                                    })
                                )
                                .to(0.2, { scaleX: 1 })
                                .call(() => {
                                    if (cardTypeIndex == 3) {
                                        let sCards = [];
                                        sCards.push(...cards);
                                        sCards[cardTypeIndex + 1] = -1;
                                        sCards[cardTypeIndex + 2] = -1;
                                        this.UpdateSecondPublicCardsCardType(sCards);
                                    } else {
                                        this.UpdateSecondPublicCardsCardType(cards);
                                    }
                                })
                                .start();
                        })
                    );
                    tween.delay(0.4);
                }
            }
        }
        tween.call(() => {
            this.sequenceSecondUpdatePublicCards && (this.sequenceSecondUpdatePublicCards.IsPlaying = false);
        });
        tween.start();
    }

    /// <summary>
    /// 刷新第二套当前玩家牌型显示
    /// </summary>
    public UpdateSecondPublicCardsCardType(secondPublicCards: number[]): void {
        // 参与了牌局，才能看到牌型提示
        if (null != this.mainPlayer && this.mainPlayer.cards.length > 0) {
            let highlightCards_ref = { highlightCards: [] as number[] };
            let cardType: CardType = this.GetCardType(highlightCards_ref, secondPublicCards);
            let highlightCards = highlightCards_ref.highlightCards;
            for (let i = 0, n = this.uirc.listSecondCards.length; i < n; i++) {
                this.uirc.listSecondCards[i].imageSelect.node.active = false;
                if (!this.isBombPot) {
                    for (let j = 0, m = highlightCards.length; j < m; j++) {
                        if (this.uirc.listSecondCards[i].cardId == highlightCards[j]) {
                            this.uirc.listSecondCards[i].imageSelect.node.active = true;
                            break;
                        }
                    }
                }
            }
            let mSeat: Seat = this.GetSeatByLocalSeatID(this.mainPlayer.seatID);
            if (null != mSeat) {
                mSeat.UpdateCardType(cardType, highlightCards);
            }
        } else {
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
    public AddSecondPublicCardsBombPot(list: number[]): void {
        if (!list || list.length <= 0) return;
        const cards = this.GetPublicCards(2);
        if (!cards || cards.length !== GameUtil.PublicCardMaxCount) {
            this.public_cards[1] = [-1, -1, -1, -1, -1];
        }
        if (list.length === GameUtil.PublicCardMaxCount) {
            for (let i = 0; i < GameUtil.PublicCardMaxCount; i++) {
                this.SetPublicCards(2, i, list[i]);
            }
            return;
        }
        const curCards = this.GetPublicCards(2);
        let startIndex = 0;
        for (let i = 0; i < curCards.length; i++) {
            if (curCards[i] === -1) {
                startIndex = i;
                break;
            }
        }
        if (list.length > curCards.length - startIndex) {
            cc.warn(`[BombPot] AddSecondPublicCardsBombPot overflow start=${startIndex}, add=${list.length}`);
            return;
        }
        for (let i = 0; i < list.length; i++) {
            this.SetPublicCards(2, i + startIndex, list[i]);
        }
    }

    public ShowSecondPublicCardsFast(): void {
        const cards = this.GetPublicCards(2);
        const cardCount = this.GetPublicCardsCount(2);
        for (let i = 0; i < cardCount; i++) {
            const info = this.uirc.listSecondCards[i];
            info.trans.setPosition(this.listDefaultSecondPublicCardsLPos[i]);
            info.trans.setScale(cc.Vec3.ONE);
            info.trans.active = true;
            info.imageCard.node.color = cc.Color.WHITE;
            info.SetSpriteFrame(cards[i]);
            info.imageSelect.node.active = false;
        }
        for (let i = cardCount; i < this.uirc.listSecondCards.length; i++) {
            const info = this.uirc.listSecondCards[i];
            info.trans.setPosition(this.listDefaultSecondPublicCardsLPos[i]);
            info.trans.setScale(cc.Vec3.ONE);
            info.trans.active = false;
            info.imageCard.node.color = cc.Color.WHITE;
            info.SetSpriteFrame(-1);
            info.imageSelect.node.active = false;
        }
        this.UpdateSecondPublicCardsCardType(cards);
    }

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
    public PlayFirstRecyclingChipAnimation(tweenCallback?: Function): any {
        this.fuck4thPCardByInsuranceState = 1;
        let mSeat: Seat = null;
        this.sequencePlayFirstRecyclingChipAnimation = {};
        for (let i = 0, n = this.listSeat.length; i < n; i++) {
            mSeat = this.listSeat[i];
            if (null == mSeat || null == mSeat.Player || !mSeat.Player.isParticipateInTheGame) continue;
            this.sequencePlayFirstRecyclingChipAnimation.tween = mSeat.PlayRecyclingChipAnimation();
        }
        let tween = this.sequencePlayFirstRecyclingChipAnimation.tween;
        if (null != tween) {
            this.sequencePlayFirstRecyclingChipAnimation.complete = () => {
                this.sequencePlayFirstRecyclingChipAnimation && (this.sequencePlayFirstRecyclingChipAnimation.IsPlaying = false);
                tweenCallback?.();
            };
            this.sequencePlayFirstRecyclingChipAnimation.IsPlaying = true;
            tween.call(this.sequencePlayFirstRecyclingChipAnimation.complete);
            tween.start();
        } else {
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
            if (null == mSeat || null == mSeat.Player || !mSeat.Player.isParticipateInTheGame) continue;
            this.sequencePlayRecyclingChipAnimation.tween = mSeat.PlayRecyclingChipAnimation();
        }
        let tween = this.sequencePlayRecyclingChipAnimation.tween;
        if (null != tween) {
            if (null != tweenCallback) {
                this.sequencePlayRecyclingChipAnimation.complete = () => {
                    this.sequencePlayRecyclingChipAnimation && (this.sequencePlayRecyclingChipAnimation.IsPlaying = false);
                    this.UpdatePots();
                    tweenCallback?.();
                };
            } else {
                //sequencePlayRecyclingChipAnimation.OnComplete(UpdatePots);
                this.sequencePlayRecyclingChipAnimation.complete = () => {
                    this.sequencePlayRecyclingChipAnimation && (this.sequencePlayRecyclingChipAnimation.IsPlaying = false);
                    this.UpdatePots();
                };
            }
            this.sequencePlayRecyclingChipAnimation.IsPlaying = true;
            tween.call(this.sequencePlayRecyclingChipAnimation.complete);
            tween.start();
        } else {
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
                if (null == mCacheWinnerSeatIds) mCacheWinnerSeatIds = [];
                mCacheWinnerSeatIds.push(this.GetLocalSeatID(rec.resultsList[i].seatId));
                if (null == mCacheWinnerCardTypes) mCacheWinnerCardTypes = [];
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
        let mCacheCardIds: number[] = [];
        let cards = this.GetPublicCards(1);
        for (let i = 0, n = this.uirc.listCards.length; i < n; i++) {
            for (let j = 0, m = mTmpCardSorts[mWinnerIndex].length; j < m; j++) {
                if (mCacheCardIds.includes(this.uirc.listCards[i].cardId)) continue;
                if (mTmpCardSorts[mWinnerIndex][j] > 4 || mTmpCardSorts[mWinnerIndex][j] < 0) continue;
                if (this.uirc.listCards[i].cardId == cards[mTmpCardSorts[mWinnerIndex][j]]) {
                    mCacheCardIds.push(this.uirc.listCards[i].cardId);
                    if (mIsFirst) {
                        mIsFirst = false;
                        //公共牌向上移
                        //sequencePlayEndPublicCardsAnimation.Append(listCards[i].trans.DOLocalMoveY(40, 0.3f));
                    } else {
                        //公共牌向上移
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
        } else {
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
        ProtocolAgency.Send<ClientMessageStoreChips.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_StoreChips,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: {
                    roomId: GameCache.Instance.room_id,
                    matchId: GameCache.Instance.match_id
                },
                store: anteNumber
            }
        });
    }

    public SetSeeMorePublicCardPrice() {
        let normal = this.uirc.Button_SeeMorePublic.getChildByName('normal');
        let discount = this.uirc.Button_SeeMorePublic.getChildByName('discount');
        let free = this.uirc.Button_SeeMorePublic.getChildByName('free');
        normal.active = false;
        discount.active = false;
        free.active = false;
        // 先查免费次数，有免费次数则显示"VIP免费"
        if (this._viewPubFreeCount > 0) {
            free.active = true;
            this.uirc.setChildLabel(free, 'label', `VIP免费 ${this._viewPubFreeCount}`);
            return;
        }
        // 没有免费次数，走钻石价格逻辑
        let configType = this._publicViewType == 2 ? 31 : 8; // 全看=31, 分步=8
        let thousand = 0;
        if (this._publicViewType != 2) {
            let public_card_count = this.GetPublicCardsCount(1);
            if (public_card_count == 0) {
                thousand = 1;
            } else if (public_card_count == 3) {
                thousand = 2;
            } else {
                thousand = 3;
            }
        }
        let diamondConfig = DiamondModel.Instance.GetDiamondConfig(this.GetDiamondTypeText(configType, thousand), configType);
        if (diamondConfig == null) {
            // 未拿到配置，先请求再刷新
            DiamondModel.Instance.ReqDiamondConfig(configType).then(() => {
                this.SetSeeMorePublicCardPrice();
            });
            return;
        }
        let DiamondConfigSetting = this.GetSetting(diamondConfig);
        if (DiamondConfigSetting == null) {
            console.log(LN, '未拿到查看翻牌配置');
            return;
        }
        if (DiamondConfigSetting.discount_price == 0) {
            free.active = true;
            this.uirc.setChildLabel(free, 'label', `${DiamondConfigSetting.price}`);
        } else if (DiamondConfigSetting.discount_price == DiamondConfigSetting.price) {
            normal.active = true;
            this.uirc.setChildLabel(normal, 'label', `${DiamondConfigSetting.price}`);
        } else if (DiamondConfigSetting.discount_price < DiamondConfigSetting.price) {
            discount.active = true;
            this.uirc.setChildLabel(discount, 'old_label', `${DiamondConfigSetting.price}`);
            this.uirc.setChildLabel(discount, 'new_label', `${DiamondConfigSetting.discount_price}`);
        }
    }

    /** 请求发发看免费次数 */
    private _reqViewPubFreeCount(): Promise<number> {
        return new Promise(resolve => {
            WWW.Instance.CommonAPI({
                web_class: WebRoomCenterHistoryViewPublicCardsFreeCount
            }).then(
                (res: any) => {
                    let freeCount = res?.data?.free_count || 0;
                    resolve(freeCount);
                },
                () => {
                    resolve(0);
                }
            );
        });
    }

    /** 刷新发发看免费次数并更新价格显示 */
    public async RefreshViewPubFreeCount() {
        this._viewPubFreeCount = await this._reqViewPubFreeCount();
        this.SetSeeMorePublicCardPrice();
    }

    /** 刷新钻石余额 */
    private _reqDiamondBalance() {
        WWW.Instance.CommonAPI({
            web_class: WebUserDiamondsWallet
        }).then((res: any) => {
            if (res?.data?.diamonds_wallet) {
                GC.data.user.info.gold = res.data.diamonds_wallet.diamonds || GC.data.user.info.gold;
            }
        });
    }

    private GetSetting(diamondConfig: any) {
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
        if (!this.mainPlayer.isParticipateInTheGame) return;
        let public_card_count = this.GetPublicCardsCount(1);
        if (public_card_count == 5) return;
        // 安全屋检查：安全屋模式下，非房管+非白名单+旁观者不显示
        let isSafeLimit = this.isSafeRoom && !GameCache.Instance._isRoomManager && !GameCache.Instance._isWhiteList && !this.mainPlayer.isParticipateInTheGame;
        if (isSafeLimit) return;
        // 查询免费次数并刷新价格
        this.RefreshViewPubFreeCount();
        // 按钮文本：全看模式 vs 分步模式
        if (this._publicViewType == 2) {
            this.uirc.textSeeMorePublic.string = '全看';
        } else {
            switch (public_card_count) {
                case 0:
                    this.uirc.textSeeMorePublic.string = CPErrorCode.LanguageDescription(10018);
                    break;
                case 3:
                    this.uirc.textSeeMorePublic.string = CPErrorCode.LanguageDescription(10019);
                    break;
                default:
                    this.uirc.textSeeMorePublic.string = CPErrorCode.LanguageDescription(10020);
                    break;
            }
        }
        if (GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit) //MTT没有查看翻牌
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
    public SetPublicCardsImageColor(color: cc.Color): void {
        let PublicCardInfo: PublicCardInfo = null;
        for (let i = 0, n = this.uirc.listCards.length; i < n; i++) {
            PublicCardInfo = this.uirc.listCards[i];
            PublicCardInfo.imageCard.node.color = color;
            PublicCardInfo.imageSelect.node.active = false;
        }
    }

    public SetSecondPublicCardImageColor(color: cc.Color): void {
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
        console.log(LN, '显示公共牌');
        let mPublicCardInfo: PublicCardInfo;
        let cards = this.GetPublicCards(1);
        let public_card_count = this.GetPublicCardsCount(1);
        for (let i = 0, n = public_card_count; i < n; i++) {
            mPublicCardInfo = this.uirc.listCards[i];
            //mPublicCardInfo.cardId = this.cards[i];
            PublicHelper.InitNode(mPublicCardInfo.trans, this.listDefaultPublicCardsLPos[i], true);
            PublicHelper.InitSprite(mPublicCardInfo.imageCard); //, this.GetBigPokerSP(GameUtil.GetCardNameByNum(mPublicCardInfo.cardId)));
            mPublicCardInfo.SetSpriteFrame(cards[i]);
        }
        for (let i = public_card_count, n = this.uirc.listCards.length; i < n; i++) {
            mPublicCardInfo = this.uirc.listCards[i];
            //mPublicCardInfo.cardId = -1;
            PublicHelper.InitNode(mPublicCardInfo.trans, this.listDefaultPublicCardsLPos[i], false);
            PublicHelper.InitSprite(mPublicCardInfo.imageCard); //, this.GetBigPokerSP(GameUtil.GetCardNameByNum(mPublicCardInfo.cardId)));
            mPublicCardInfo.SetSpriteFrame(-1);
        }
        // BombPot / 二套牌重连场景：第一套直接刷新后，同步刷新第二套
        const secondCount = this.GetPublicCardsCount(2);
        if (this.isBombPot) {
            if (secondCount > 0) {
                this.IsSecondPsc = true;
                this.ShowSecondPublicCardsFast();
            } else {
                this.IsSecondPsc = false;
                this.ClearSecondPublicCardsUI();
            }
        } else if (this.IsSecondPsc && secondCount > 0) {
            this.ShowSecondPublicCardsFast();
        } else {
            this.ClearSecondPublicCardsUI();
        }
        // 参与了牌局，才能看到牌型提示
        if (null != this.mainPlayer && this.mainPlayer.isPlaying) {
            let highlightCards_ref = { highlightCards: [] as number[] };
            let cardType: CardType = this.GetCardType(highlightCards_ref, cards);
            let highlightCards = highlightCards_ref.highlightCards;
            for (let i = 0, n = this.uirc.listCards.length; i < n; i++) {
                this.uirc.listCards[i].imageSelect.node.active = false;
                if (!this.isBombPot) {
                    for (let j = 0, m = highlightCards.length; j < m; j++) {
                        if (this.uirc.listCards[i].cardId == highlightCards[j]) {
                            this.uirc.listCards[i].imageSelect.node.active = true;
                            break;
                        }
                    }
                }
            }
            let mSeat: Seat = this.GetSeatByLocalSeatID(this.mainPlayer.seatID);
            if (null != mSeat) {
                mSeat.UpdateCardType(cardType, highlightCards);
            }
        } else {
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
                room: {
                    roomId: GameCache.Instance.room_id,
                    matchId: GameCache.Instance.match_id
                },
                keep: option,
                duration: 120
            }
        });
    }

    /// <summary>
    /// 清空气泡
    /// </summary>
    public ClearSeatBubble(isRoundFinish: boolean): void {
        let mSeat: Seat = null;
        for (let i = 0, n = this.listSeat.length; i < n; i++) {
            mSeat = this.listSeat[i];
            if (null == mSeat || null == mSeat.Player) continue;
            mSeat.HideBubble();
        }
    }

    /// <summary>
    /// 清空公共牌UI
    /// </summary>
    public ClearPublicCardsUI() {
        console.log(LN, 'ClearPublicCardsUI');
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
        console.log(LN, 'ClearSecondPublicCardsUI');
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

    // shouldShowBringInSecuritySetting 判断是否要显示
    private shouldShowBringInSecuritySetting(): boolean {
        if (GameCache.Instance.match_id != 0) return false;
        if (this.mainPlayer?.seatID != -1) return false;
        // if (GameCache.Instance.HasSecuritySettingRoom(GameCache.Instance.room_id)) return false;
        switch (GameCache.Instance.game_type) {
            case GameType.Holdem:
            case GameType.Omaha4:
            case GameType.Omaha5:
            case GameType.Omaha6:
                return true;
            default:
                return false;
        }
    }

    // 牌桌玩家信息
    public CheckPlayerInfo(userId: number, player: CPlayer = null): void {
        UIComponent.open(UIDefine.UIPlayerInfo, player, {
            parentUI: Main.Marquee
        });
    }

    //隐藏查看底牌按钮
    public HideSeeMorePublic(): void {
        this.uirc.Button_SeeMorePublic.active = false;
    }

    //激活查看底牌按钮
    public InteractableSeeMorePublic(boo: boolean) {
        this.uirc.setButtonInteractable(this.uirc.Button_SeeMorePublic, boo);
    }

    /// <summary>
    /// 偷偷看：显示看手牌按钮（结算阶段，玩家未站起时显示，对齐 Unity ShowLookHandCard）
    /// </summary>
    public ShowLookHandCard(): void {
        if (!this.mainPlayer.isParticipateInTheGame) return;
        if (GameCache.Instance.room_type >= RoomType.MTTTexasHoldemStandardNoLimit) return; // MTT不显示
        // 房间未开启偷偷看功能
        if (GameCache.Instance._lookHandCard == 0) return;
        // 鱿鱼罚牌中时不显示（对齐 Unity: squidForceShowCard + squidCount 检查）
        if (GameCache.Instance._squidForceShowCard == 1) {
            let hasSquidPenalty = false;
            for (let i = 0; i < this.listSeat.length; i++) {
                const seat = this.listSeat[i];
                if (seat && seat.Player && !seat.IsMySeat && seat.Player.squidCount > 0) {
                    hasSquidPenalty = true;
                    break;
                }
            }
            if (hasSquidPenalty) return;
        }
        // 主玩家 AllIn 时不显示（对齐 Unity: IsMainPlayerAllIn）
        if (this.mainPlayer.actionStatus == Def.Action.ALLIN) return;
        this.SetLookHandCardPrice();
        this.uirc.Button_LookHandCard.active = true;
        this.InteractableLookHandCard(true);
    }

    /// <summary>
    /// 偷偷看：隐藏看手牌按钮
    /// </summary>
    public HideLookHandCard(): void {
        this.uirc.Button_LookHandCard.active = false;
    }

    /// <summary>
    /// 偷偷看：设置按钮可交互
    /// </summary>
    public InteractableLookHandCard(boo: boolean) {
        this.uirc.setButtonInteractable(this.uirc.Button_LookHandCard, boo);
    }

    /// <summary>
    /// 偷偷看：计算并显示价格（阶梯收费：看全部模式使用 config_type=30，对齐 Unity SetAllShowCardPrice）
    /// </summary>
    public SetLookHandCardPrice(): void {
        const sitDown = this.mainPlayer.isParticipateInTheGame;
        const ext = sitDown ? 12 : 11;
        const times = Math.min(this.lookCardsPayTimes, 4);
        const typeExt = ext + 10 * times;
        // 看全部模式使用 config_type=30
        let diamondConfig = DiamondModel.Instance.GetDiamondConfig(typeExt, 30);
        if (!diamondConfig) {
            // 尚未请求过 config_type=30 的配置，先请求再刷新
            DiamondModel.Instance.ReqDiamondConfig(30).then(() => {
                this.SetLookHandCardPrice();
            });
            return;
        }
        const setting = this.GetSetting(diamondConfig);
        if (!setting) {
            console.log(LN, '未拿到偷偷看配置setting');
            return;
        }
        // 显示价格到按钮子节点 numDiamond
        const numNode = this.uirc.Button_LookHandCard.getChildByName('numDiamond');
        if (numNode) {
            const label = numNode.getComponent(cc.Label);
            if (label) label.string = `${setting.price}`;
        }
    }

    /// <summary>
    /// 偷偷看：点击发送 1026 协议
    /// </summary>
    public onClickLookHandCard(): void {
        if (this.CanClick() == false) return;
        this.lastClickTime = GlobalSession.NowTimeMS;
        this.InteractableLookHandCard(false);
        ProtocolAgency.Send<ClientMessageViewPlayerCards.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_ViewPlayerCards,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: {
                    roomId: GameCache.Instance.room_id,
                    matchId: GameCache.Instance.match_id
                },
                targetSeatId: 0,
                targetUserRid: 0
            }
        });
    }

    /// <summary>
    /// 偷偷看：发送 1029 查询当前看牌次数
    /// </summary>
    public SendViewPlayerCardsNum(): void {
        ProtocolAgency.Send<ClientMessageViewPlayerCardsNum.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_ViewPlayerCardsNum,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: {
                    roomId: GameCache.Instance.room_id,
                    matchId: GameCache.Instance.match_id
                }
            }
        });
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
        console.log(LN, 'TexasGame KillAllTweener');
        if (this.sequencePlayDealAnimation?.tween) {
            this.sequencePlayDealAnimation.IsPlaying = false;
            cc.Tween.stopAllByTarget(this.uirc.node);
            this.sequencePlayDealAnimation = null;
        }
        if (null != this.sequenceUpdatePublicCards && this.sequenceUpdatePublicCards.IsPlaying) {
            this.sequenceUpdatePublicCards.Kill();
        }
        //清理公共牌运动
        this.uirc.listCards.forEach(item => {
            item.trans.stopAllActions();
        });
        this.uirc.listSecondCards.forEach(item => {
            item.trans.stopAllActions();
        });
    }

    protected ClearAllData() {
        console.log(LN, '清理所有数据');
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
        this.isSafeRoom = false;
        this.subGamePlayAnte = 0;
        this.criticalHitEnabled = false;
        this.criticalHitRound = 0;
        this.curCriticalHitRound = 0;
        this.isCriticalHitOpen = false;
        this.callTime = 0;
        this.callTimeWinline = 0;
        this.callTimeLimitCount = 0;
        this.callTimeCount = 0;
        this.callTimeStay = false;
        this.bringinEqualLeader = 0;
        this.minPlayerChipRate = 0;
        this.maxBringinTotalRate = 0;
        this.forceShowCard = 0;
        this.randomSeat = 0;
        this.onlyIOS = 0;
        this.poolRate = 0;
        this.lookHandCard = 0;
        this.chatType = 1;
        this.straddleMax = 2;
        this.secondPcsOn = false;
        this.insuranceMode = 0;
        this.blockchainType = 0;
        this.anteRandomJumpConfig = '';
        this.isAnteRandomJumpEnable = false;
        this.autoChangeRoomLimitHand = 0;
        this.isAutoChangeTable = false;
        this.autoChangeTable = 0;
        this.jackpot = 0;
        this.jackpotConfig = null;
        this.isBombPot = false;
        this.bombPotFeature?.ResetState();
        this.jackpotFeature?.ResetState();
        this.mushroomFeature.ResetState();
        this.squidFeature.ResetState();
        this.ShowCallTime();
        // 座位蘑菇标识隐藏
        if (this.listSeat) {
            this.listSeat.forEach(seat => {
                seat?.ClearMushroomTag();
                seat?.ClearSquidTag();
            });
        }
        this.tribeId = 0;
        this.clubId = 0;
        this.bringInClubId = 0;
        this.ServerVersion = '';
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
        this.cacheBuyInsurancePotUserCount = 0;
        // this.VIPTipsStatus = TipsStatus.isStop;
        // this.VipTipslist.Clear();
        this.ResetSeatMoveStruct();
        GameUtil.ResetSeatInfo();
        this.ResetPots();
    }

    ClearAllPlayers() {
        console.log(LN, '清理所有玩家');
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
    public onClickAddOn() {}

    //点击开始游戏
    public onClickStartGame(): void {
        if (this.CanClick() == false) return;
        this.lastClickTime = GlobalSession.NowTimeMS;
        if (!GameCache.Instance.room_is_manager) {
            return;
        }
        if (this.uirc?.StartGameButton) {
            this.uirc.StartGameButton.active = false;
        }
        WWW.Instance.CommonAPI({
            web_class: WebRoomCenterRoomStart,
            body: {
                room_id: GameCache.Instance.room_id
            }
        }).then(
            (res: any) => {
                if (res?.code && res.code !== 0) {
                    UIComponent.Instance.Toast(res.message || CPErrorCode.ServerErrorDescription(res.code));
                    this.UpdateStartGameState();
                }
            },
            (err: any) => {
                UIComponent.Instance.Toast(err?.message || i18nMgr.Get('adaptation10301'));
                this.UpdateStartGameState();
            }
        );
    }

    //点击退出按钮响应
    public onClickExit() {
        this.uirc.HideMenu(false);
        if (this.mainPlayer?.isPlaying && GameCache.Instance.match_id == 0) {
            let content = CPErrorCode.LanguageDescription(20003);
            let commit = CPErrorCode.LanguageDescription(10012);
            let cancel = CPErrorCode.LanguageDescription(10013);
            if (this.callTime == 1 && this.callTimeStay) {
                content = StringHelper.Format(i18nMgr.Get('UICallTimeQuitRoom'), [this.callTimeWinline, this.callTimeLimitCount, this.callTimeWinline]);
                commit = i18nMgr.Get('UITexas_LeaveTheTable');
            } else if (this.squidEnabled && this.isGameInSquidRound && this.mainPlayer.inSquid) {
                if (this.squidMode == 0) {
                    if (this.mainPlayer.squidCount == 0) {
                        content = i18nMgr.Get('UISquid_Tips4');
                        commit = i18nMgr.Get('UILeave');
                        cancel = i18nMgr.Get('UIPause_sdXLZk7S');
                    } else {
                        content = i18nMgr.Get('UIDelayLeaveTips');
                        commit = i18nMgr.Get('UILeave');
                        cancel = i18nMgr.Get('UIPause_sdXLZk7S');
                    }
                } else if (this.squidMode == 1) {
                    if (this.mainPlayer.squidCount == 0) {
                        content = i18nMgr.Get('UISquid_Tips3');
                        commit = CPErrorCode.LanguageDescription(10012);
                        cancel = CPErrorCode.LanguageDescription(10013);
                    } else {
                        content = i18nMgr.Get('UIDelayLeaveTips');
                        commit = i18nMgr.Get('UILeave');
                        cancel = i18nMgr.Get('UIPause_sdXLZk7S');
                    }
                }
            }
            UIComponent.open<UIConfirmDialogParam>(UIDefine.UIConfirmDialog, {
                this: this,
                //title: i18nMgr.Get("WalletServiceCharge_eeydpBno"),
                //"退出游戏，在这手牌结束后将自动站起",
                content: content,
                commit: commit,
                cancel: cancel,
                commit_click: this.CallbackExit
            });
        } else {
            this.CallbackExit();
        }
    }

    /**
     * 响应退出二次确认
     */
    public CallbackExit() {
        this.TexasGameUtils.LeaveRoom();
    }

    //点击加时
    public onClickDelay() {
        if (this.CanClick() == false) return;
        this.lastClickTime = GlobalSession.NowTimeMS;
        if (this.delayCount >= 2) return;
        if (!this.uirc.UIOperation_Com.node.activeInHierarchy) {
            UIComponent.Instance.Toast(i18nMgr.Get('ServerErrorCode_31045'));
            return;
        }
        this.ClickAddTime = true;
        ProtocolAgency.Send<ClientMessageAddTime.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_AddTime,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: {
                    roomId: GameCache.Instance.room_id,
                    matchId: GameCache.Instance.match_id
                },
                consume: this.TexasGameUtils.GetOpDelayConsumeType(),
                directConsume: false
            }
        });
    }

    public onClickSeeMorePublic() {
        if (this.CanClick() == false) return;
        this.lastClickTime = GlobalSession.NowTimeMS;
        this.InteractableSeeMorePublic(false);
        // 全看模式发送Round.UNDEFINED(0)，分步模式发送当前round
        let round = this._publicViewType == 2 ? Def.Round.UNDEFINED : this.cacheRound;
        ProtocolAgency.Send<ClientMessageShowPublicCards.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_ShowPublicCards,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: {
                    roomId: GameCache.Instance.room_id,
                    matchId: GameCache.Instance.match_id
                },
                round: round,
                consume: Def.ConsumeType.CT_VC_2
            }
        });
    }

    public onClickReport() {
        this.reportKeepOpen = true;
        const reportUI = UIComponent.find(UIDefine.UITexasReportComponent);
        if (reportUI && reportUI.node && reportUI.node.activeInHierarchy) {
            if (reportUI.node.parent !== Main.Dialog) {
                reportUI.node.parent = Main.Dialog;
            }
            reportUI.node.active = true;
            return;
        }
        UIComponent.open(UIDefine.UITexasReportComponent, null, { parentUI: Main.Dialog });
    }

    public SetReportKeepOpen(keep: boolean): void {
        this.reportKeepOpen = keep;
    }

    public IsReportKeepOpen(): boolean {
        return this.reportKeepOpen;
    }

    public onClickCurSituation() {
        let historyInfoData = new HistoryInfoData();
        historyInfoData.bInsurance = GameCache.Instance.CurGame.insurance;
        historyInfoData.bJackPot = GameCache.Instance.jackPot_on == 1;
        historyInfoData.Blindstr =
            StringHelper.GetLongString(GameCache.Instance.CurGame.smallBlind) + '/' + StringHelper.GetLongString(GameCache.Instance.CurGame.bigBlind);
        historyInfoData.bgroupBet = GameCache.Instance.CurGame.groupBet;
        historyInfoData.handNum = GameCache.Instance.CurGame.mHandNum;
        historyInfoData.room_id = GameCache.Instance.room_id;
        historyInfoData.match_id = GameCache.Instance.match_id;
        historyInfoData.room_unique_id = GameCache.Instance.CurGame.cacheUniqueId;
        // let page = GameCache.Instance.CurGame.mHandNum == 0 ? GameCache.Instance.CurGame.mHandNum : GameCache.Instance.CurGame.mHandNum - 1;
        // if (page == 0) {
        //     //第一手没打完不请求
        //     return;
        // }
        // UIComponent.open(UIDefine.UIMine_Poker, { info: historyInfoData, enterType: 1 }, { parentUI: this.uirc.Common_Con })
        UIComponent.open(UIDefine.UITexasHistory, historyInfoData, {
            parentUI: this.uirc.Common_Con
        });
    }

    refreshCoinAndChip(menu: UITexasMenu) {
        WWW.Instance.CommonAPI({
            web_class: WebUserRoomBringin,
            api_id: GameCache.Instance.room_id
        }).then(
            (res: any) => {
                if (res.data) {
                    GameCache.Instance.ClubID = res.data.club_id;
                    GameCache.Instance.ClubRandomID = res.data.club_random_id;
                    menu.$node_coin.active = GameCache.Instance.ClubRandomID > 0;
                    if (GameCache.Instance.ClubID > 0) {
                        ////////////////////////////////////////////
                        WWW.Instance.CommonAPI({
                            web_class: WebOrgClubUserInfo,
                            body: {
                                club_id: GameCache.Instance.ClubID,
                                user_id: GameCache.Instance.userId
                            }
                        }).then(
                            (res: any) => {
                                if (GameCache.Instance.gold_type == 1) {
                                    //1 联盟币， 2 usdt, 3 记分牌
                                    menu.$node_coin.getChildByName('label').getComponent(cc.Label).string = StringHelper.GetLongString(res.data.user_info.gold);
                                } else if (GameCache.Instance.gold_type == 2) {
                                    menu.$node_coin.getChildByName('label').getComponent(cc.Label).string = StringHelper.GetLongString(res.data.user_info.usdt);
                                } else if (GameCache.Instance.gold_type == 3) {
                                    /////////////////////////////////////////////////////
                                    WWW.Instance.CommonAPI({
                                        web_class: WebUserRoom,
                                        api_id: GameCache.Instance.room_id
                                    }).then(
                                        (res: any) => {
                                            if (res.data?.last_bring_out != null) {
                                                menu.$node_coin.getChildByName('label').getComponent(cc.Label).string = `${res.data.apply_bring_in}`;
                                            }
                                        },
                                        () => {}
                                    );
                                    /////////////////////////////////////////////////////
                                }
                            },
                            () => {}
                        );
                        ////////////////////////////////////////////
                    }
                }
            },
            () => {}
        );
        menu.$node_coin.getChildByName('uc').active = GameCache.Instance.gold_type == 1;
        menu.$node_coin.getChildByName('gc').active = GameCache.Instance.gold_type == 2;
        menu.$node_coin.getChildByName('add').active = menu.$node_coin.getChildByName('click').active =
            GameCache.Instance.gold_type == 1 || GameCache.Instance.gold_type == 2;
        let chips = GameCache.Instance.CurGame.mainPlayer?.cacheStoreChips || 0;
        menu.$node_storage.active = chips > 0;
        //GameCache.Instance.FriendsTableLimitBringIn;
        menu.$node_storage.getChildByName('label').getComponent(cc.Label).string = StringHelper.GetLongString(chips);
    }

    // public UpdateMenu() {
    //     let menu = this.uirc.UITexasMenu;
    //     this.refreshCoinAndChip(menu);
    //     menu.clearOptions();
    //     let show = [3, 4, 10]; //设置|规则|离开
    //     if (this.UserSitdown()) //已坐下
    //     {
    //         show.push(0, 6, 9); // 站起 | 带入 | 离座留桌
    //         //menu.MenuButtons_Dic.Button_Standup.node.active = true;
    //         //menu.MenuButtons_Dic.Button_AddChips.node.active = true;
    //         if (
    //             this.mainPlayer.chips >=
    //             GameCache.Instance.carry_small * (this.currentMaxRate + 1)
    //         ) {
    //             menu.setOptionInteractable(6, false);
    //         } else {
    //             menu.setOptionInteractable(6, true);
    //         }
    //         if (
    //             this.CurlimitOutChip == RoomInfo.RetainType.RT_MANUAL &&
    //             this.gamestatus >= 1 &&
    //             this.gamestatus < 7
    //         ) {
    //             //menu.MenuButtons_Dic.Button_TakeOut.node.active = true;
    //             show.push(7);
    //             //this.__MenuButtonInteractable(menu.MenuButtons_Dic.Button_TakeOut.node, true);
    //             menu.setOptionInteractable(7, true);
    //         } else if (
    //             this.CurlimitOutChip == RoomInfo.RetainType.RT_MANUAL &&
    //             this.gamestatus != 1 &&
    //             this.gamestatus < 7
    //         ) {
    //             show.push(7);
    //             menu.setOptionInteractable(7, false);
    //         } else {
    //             //menu.MenuButtons_Dic.Button_TakeOut.node.active = false;
    //             //menu.MenuButtons_Dic.Button_TakeOut.node.getComponent(cc.Button).interactable = false;
    //         }
    //         //menu.MenuButtons_Dic.Button_LeaveDesk.node.active = true;
    //         if (
    //             this.gamestatus != 1
    //         ) //游戏没开始的时候，座离桌按钮显示不可点击状态   !HasStarted()
    //         {
    //             //this.__MenuButtonInteractable(menu.MenuButtons_Dic.Button_LeaveDesk.node, false);
    //             menu.setOptionInteractable(9, false);
    //         } else {
    //             menu.setOptionInteractable(9, true);
    //             //this.__MenuButtonInteractable(menu.MenuButtons_Dic.Button_LeaveDesk.node, true);
    //         }
    //         if (
    //             !this.isMTT &&
    //             this.CurlimitOutChip == RoomInfo.RetainType.RT_AUTO
    //         ) {
    //             //this.CurlimitOutChip == RoomInfo.RetainType.RT_AUTO
    //             show.push(5);
    //         }
    //     }
    //     show.forEach((index) => {
    //         let option = menu.getOption(index);
    //         if (option.node) option.node.active = true;
    //     });
    // }
    protected __MenuButtonInteractable(node: cc.Node, interactable: boolean) {
        node.getChildByName('Text').color = cc.Color.WHITE;
        node.getChildByName('Text').opacity = interactable ? 178 : 70;
        node.getChildByName('Arrow').active = interactable;
        node.getComponent(cc.Button).interactable = interactable;
    }

    //托管相关
    public SendTrustAction(enable: boolean = false) {}
    ///////////////////////////////////////////////////////////////////重构部分
    //多套公共牌
    public public_cards: number[][];

    public ResetPublicCards() {
        this.public_cards = [
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1]
        ];
    }

    //获取公共牌数量 第n套 1-n
    public GetPublicCardsCount(n: number) {
        this._ensurePublicCards();
        let cards = this.public_cards[n - 1];
        let count = cards.indexOf(-1);
        return count == -1 ? GameUtil.PublicCardMaxCount : count;
    }

    //获取第n套公共牌 第n套 1-n
    public GetPublicCards(n: number): number[] {
        this._ensurePublicCards();
        return this.public_cards[n - 1];
    }

    public SetPublicCards(n: number, index: number, card: number) {
        this._ensurePublicCards();
        this.public_cards[n - 1][index] = card;
    }

    /** 确保 public_cards 已初始化 */
    private _ensurePublicCards() {
        if (!this.public_cards) {
            this.ResetPublicCards();
        }
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
            if (GameUtil.GetFriendsOrClubTable() == 1) {
                //朋友桌
                WWW.Instance.CommonAPI({
                    web_class: WebRoomSitApplyRecords,
                    body: {
                        limit: 1,
                        offsetd: 0,
                        status: 1
                    }
                }).then(
                    (res: any) => {
                        if (res.data?.data) {
                            this.uirc.btn_msg.getChildByName('red_icon').active = res.data.data.length > 0;
                            this.uirc.btn_msg.getChildByName('normal_icon').active = !(res.data.data.length > 0);
                        }
                        next?.call(this);
                    },
                    (res: any) => {
                        next?.call(this);
                    }
                );
            }
            if (GameUtil.GetFriendsOrClubTable() == 2) {
                //公会内部桌子
                WWW.Instance.CommonAPI({
                    web_class: WebClubApplyList,
                    body: {
                        limit: 1,
                        offset: 0
                    },
                    club_id: ClubCache.club_id
                }).then(
                    (res: any) => {
                        if (res.code == 0 && res.data.data != null) {
                            let isShow = false;
                            res.data.data.forEach((item: any) => {
                                if (item.status == 1) {
                                    isShow = true;
                                }
                            });
                            this.uirc.btn_msg.getChildByName('red_icon').active = isShow;
                            this.uirc.btn_msg.getChildByName('normal_icon').active = !isShow;
                        }
                        next?.call(this);
                    },
                    (res: any) => {
                        next?.call(this);
                    }
                );
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
        const needKeepReport = this.reportKeepOpen;
        this.ResetPublicCards();
        this.ClearPublicCardsUI();
        this.ClearSecondPublicCardsUI();
        this.ResetPublicCardsImage();
        this.ResetSecondPublicCardsImage();
        this.HideSeeMorePublic();
        this.HideSeeMorePublicTips();
        this.HideLookHandCard();
        this.allCardsShown = false;
        this.HideOperationPanel();
        this.HideAutoOperationPanel();
        this.uirc.CleanUI();
        this.jackpotFeature?.RestoreAfterTableClear();
        if (needKeepReport) {
            const reportUI = UIComponent.find(UIDefine.UITexasReportComponent);
            if (reportUI && reportUI.node) {
                if (reportUI.node.parent !== Main.Dialog) {
                    reportUI.node.parent = Main.Dialog;
                }
                const shouldRestoreShow = !reportUI.node.activeInHierarchy;
                reportUI.node.active = true;
                if (shouldRestoreShow) {
                    reportUI.onShow({ __keepState: true });
                }
            } else {
                UIComponent.open(UIDefine.UITexasReportComponent, { __keepState: true }, { parentUI: Main.Dialog });
            }
        }
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
        console.log(LN, 'TexasGame >>>> Dispose');
        // 停止游戏背景音乐
        SoundComponent.Instance.stopMusic();
        this.IsDispose = true;
        this.reportKeepOpen = false;
        this.ClearTableUI();
        this.ClearOther();
        this.RemoveMsgHandler();
        this.throwPropMgr?.cleanup();
        this.throwPropMgr = null;
        //停止状态机刷新
        GC.uc.RemoveComponent(this.GameLogicSMComponent);
        //移除资源
        //GC.bundle.get(BUNDLE_TEXAS).releaseAll();
        //SceneManager.Instance.removeScene(UIDefine.UITexas);
    }

    //判断是否能够点击
    CanClick(): boolean {
        if (GlobalSession.NowTimeMS - this.lastClickTime > 500) {
            return true;
        }
        UIComponent.Instance.ToastLanguage('clickNum');
        return false;
    }

    ResetSeatMoveStruct() {
        this.seatMoveStruct.reset();
    }

    // 刷新底池
    public UpdateAlreadAnte(): void {
        if (!this.uirc.Text_AlreadAnte) return;
        this.uirc.Text_AlreadAnte.node.active = this.gamestatus >= 1 && this.gamestatus < 7;
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
        );
    }

    private ReqDiamondConfig_8(next?: Function) {
        DiamondModel.Instance.ReqDiamondConfig(8).then(
            () => {
                next?.call(this);
            },
            () => {
                next?.call(this);
            }
        );
    }

    private GetDiamondTypeText(config_type = 0, Thousand = 0) {
        let typeText = 0;
        let thousand = 0; // 千位数：config_type =2  为 0第一次加时，1第二次加时。config_type =8 为 1 PREFLOP 2 FLOP 3 TURN
        let hundred = 0; //百位数 ：1 平台，2 联盟，3 公会 4 个人（朋友桌）
        let ten = 0; //十位数：是否共享牌桌 1 不共享 2 共享 （如果再区分币种，预留 2 USDT桌 3 联盟币）
        let one = 0; //个位数：是否比赛 0 不是， 1 是
        switch (config_type) {
            case 2:
                thousand = Thousand * 1000;
                break;
            case 8:
                thousand = Thousand * 1000;
                break;
            case 31: // ViewAllPublicCards (全看模式)，thousand始终为0
                thousand = 0;
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

    private GetTypeText(times: number) {
        // 百位数：创建来源 1 平台，2 联盟，3 公会 4 个人（朋友桌）// 十位数：是否共享牌桌 1 不共享 2 共享 （如果再区分币种，预留 2 USDT桌 3 联盟币）// 个位数：是否比赛 0 不是， 1 是示例：210 （表示联盟创建的内部牌桌）										  //千位数：0第一次加时，1第二次加时
        let numStr = '';
        numStr += times;
        if (GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit) //string.Format("{0:N1}", str)
        {
            numStr += GameCache.Instance.origin_type;
        } else if (
            GameCache.Instance.room_type >= RoomType.MTTTexasHoldemStandardNoLimit &&
            GameCache.Instance.room_type <= RoomType.MTTOmaha6SixPlusFixedAof
        ) {
            return +(times + '001');
        }
        if (GameCache.Instance.share_table == 1) {
            numStr += GameCache.Instance.share_table;
        } else {
            numStr += '2';
        }
        if (GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit) //string.Format("{0:N1}", str)
        {
            numStr += '0';
        } else if (
            GameCache.Instance.room_type >= RoomType.MTTTexasHoldemStandardNoLimit &&
            GameCache.Instance.room_type <= RoomType.MTTOmaha6SixPlusFixedAof
        ) {
            numStr += '1';
        }
        return +numStr || 0;
    }

    //刷新加时按钮样式
    public UpdateDelayBtn(): void {
        this.HideBtnDelay(true);
        let diamondCost = this.uirc.Button_Delay.getChildByName('diamondCost');
        let textDiamondCost = this.uirc.Button_Delay.getChildByName('Text_diamondCost');
        diamondCost.active = false;
        textDiamondCost.getComponent(cc.Label).string = '';
        //使用次数
        if (this.delayCount >= 2) {
            this.uirc.Button_Delay.getComponent(cc.Button).interactable = false;
            this.uirc.Button_Delay.getChildByName('Text_Time').getComponent(cc.Label).string = '+0s';
            this.uirc.Button_Delay.opacity = 178;
            diamondCost.active = true;
            textDiamondCost.getComponent(cc.Label).string = '0';
        } else {
            let priceText = '';
            let diamondConfig = DiamondModel.Instance.GetDiamondConfig(this.GetTypeText(this.delayCount + 1), 2);
            if (diamondConfig?.config_type == 2) {
                let setting = null;
                if (GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit) {
                    let smallBlind = GameCache.Instance.CurGame.smallBlind;
                    for (let i = 0; i < diamondConfig.setting.length; i++) {
                        if (diamondConfig.setting[i].sb * 100 == smallBlind * 100) {
                            setting = diamondConfig.setting[i];
                            break;
                        }
                    }
                } else if (
                    GameCache.Instance.room_type >= RoomType.MTTTexasHoldemStandardNoLimit &&
                    GameCache.Instance.room_type <= RoomType.MTTOmaha6SixPlusFixedAof
                ) {
                    setting = diamondConfig.setting[0];
                }
                if (setting) {
                    if (diamondConfig.status == 2) {
                        // status=2 关闭收费 → 免费
                        priceText = '免费';
                    } else if (setting.discount_price > 0 && setting.discount_price < setting.price) {
                        // 有折扣 → 显示折扣价
                        priceText = `${setting.discount_price}`;
                    } else {
                        // 无折扣或discount_price=0 → 显示原价
                        priceText = `${setting.price}`;
                    }
                }
            }
            diamondCost.active = true;
            textDiamondCost.getComponent(cc.Label).string = priceText;
            this.uirc.Button_Delay.getComponent(cc.Button).interactable = true;
            this.uirc.Button_Delay.getChildByName('Text_Time').getComponent(cc.Label).string = this.delayCount > 0 ? '+20s' : '+30s';
            this.uirc.Button_Delay.opacity = 255;
        }
    }

    public HideBtnDelay(isActive: boolean): void {
        this.uirc.Button_Delay.active = isActive;
    }

    // ==================== 视频重入恢复 ====================
    /**
     * 重入房间时，如果自己已坐下且是视频房间，自动开启摄像头
     * 解决 F5 刷新后视频丢失的问题
     */
    private _restoreVideoOnReenter(): void {
        if (GameCache.Instance._videoModel === VideoModel.NONE) return;
        // 判断自己是否已坐下
        const mySeat = this.listSeat?.find((s: Seat) => s.IsMySeat);
        if (!mySeat || !mySeat.Player) return;
        console.log('[VideoRoom] 重入房间，已坐下状态，自动开启摄像头');
        // 延迟执行，等待 Agora 频道加入完成
        setTimeout(() => {
            this.TexasGameProtocol?.renderLocalVideoOnMySeat();
        }, 2000);
    }
}
