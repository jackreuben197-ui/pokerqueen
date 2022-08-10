import TexasConfig from "../config/TexasConfig";
import { UIDefine } from "../define/UIDefine";
import Dispatcher from "../event/Dispatcher";
import UpdateComponent from "../funcomponent/UpdateComponent";
import { StringHelper } from "../helper/StringHelper";
import { i18nMgr } from "../i18n/i18nMgr";
import { LanguageCode } from "../i18n/LanguageCode";
import GameCache from "../manager/GameCache";
import SceneManager from "../manager/SceneManager";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { RoomInfo } from "../protobuf/holdem/define_pb";
import { ServerMessageEnterRoom } from "../protobuf/holdem/req_enter_room_pb";
import StorageKey from "../session/StorageKey";
import GameUtil from "../tools/GameUtil";
import AssetContext from "../ui/component/AssetContext";
import FSMLogicComponent from "./FSMLogicComponent";
import GameSession from "./GameSession";
import Seat, { SeatUIInfo } from "./Seat";
import TexasGameMessageHandler from "./TexasGameMessageHandler";
import TexasGameProtocol from "./TexasGameProtocol";
import TexasScene from "./TexasScene";
import TexasSMAgency from "./TexasSMAgency";



export default class TexasGame {
    //座位UI节点缓存池
    private seatUI_pool: cc.Node[] = [];
    ///////////////////////////////
    private setting = {
        deskType: null,
    };
    //桌布资源索引[desk,table]
    deskTypeIndexs = [
        [0],
        [1],
        [2],
        [3],
        [4],
        [5],
        [6],
        [7],
        [8, 1],
        [9, 2],
        [10, 3],
        [11, 5],
    ];

    public IsLookOn: boolean = false;

    public gameUI: TexasScene = null;

    public messageHandler: TexasGameMessageHandler = null;

    public texasGameProtocol: TexasGameProtocol = null;

    public FsmLogicComponent: FSMLogicComponent = null;

    public SMAgency: TexasSMAgency = null;

    public listSeat: Seat[];
    /// <summary>
    /// key:客户端seatId
    /// </summary>
    protected dicSeatOnlyClient: Map<number, Seat> = null;

    /// <summary>
    /// 当前游戏状态，0:倒计时中 1:游戏中 -2:等待开局 -1:其他状态
    /// </summary>
    public gamestatus: number;


    /// <summary>
    /// 大盲
    /// </summary>
    public bigBlind: number;
    /// <summary>
    /// 小盲
    /// </summary>
    public smallBlind: number;
    /// <summary>
    /// 底池数目
    /// </summary>
    public alreadAnte: number;
    /// <summary>
    /// 房间的时间总长度（分钟）
    /// </summary>
    public maxPlayTime: number;
    /// <summary>
    /// 当前最小带入倍数
    /// </summary>
    public currentMinRate: number;
    /// <summary>
    /// 当前最大带入倍数
    /// </summary>
    public currentMaxRate: number;
    /// <summary>
    /// 当前操作玩家剩余时间（s）
    /// </summary>
    public leftOperateTime: number;
    /// <summary>
    /// 玩家操作默认时间
    /// </summary>
    public opTime: number;
    /// <summary>
    /// 前注
    /// </summary>
    public groupBet: number;
    /// <summary>
    /// 各分池的筹码数
    /// </summary>
    public pots: number[];
    /// <summary>
    /// 当前最小可加注额，操作按钮上的加注额要用到
    /// </summary>
    public minAnteNum: number;
    /// <summary>
    /// 是否可加注，与minAnteNum及剩余筹码联合判断是否显示加注按钮
    /// </summary>
    public canRaise: number;
    /// <summary>
    /// 是否开启保险
    /// </summary>
    public insurance: boolean;
    /// <summary>
    /// 1需要弹出选择补盲，0不需要弹出
    /// </summary>
    public waitBlind: number;
    /// <summary>
    /// 是否在其他房间被托管
    /// </summary>
    public isTrusted: number;
    /// <summary>
    /// 是否开启IP限制，1 开启 0关闭
    /// </summary>
    public isIpRestrictions: boolean;
    /// <summary>
    /// 是否开启GPS限制，1 开启 0关闭
    /// </summary>
    public isGPSRestrictions: boolean;
    /// <summary>
    /// 同步到同盟的id 未同步时为0
    /// </summary>
    public tribeId: number;
    /// APP的最新版本，如果当前app版本较小，则在牌桌中间显示升级提示
    /// </summary>
    public ServerVersion: string;
    /// <summary>
    /// 自动弃牌
    /// </summary>
    public autoFold: boolean;
    /// <summary>
    /// 自动跟注
    /// </summary>
    public autoCall: boolean;
    /// <summary>
    /// 自动ALLIN
    /// </summary>
    public autoAllin: boolean;
    /// <summary>
    /// 自动看牌
    /// </summary>
    public autoCheck: boolean;
    /// <summary>
    /// 当前手数
    /// </summary>
    public mHandNum: number;
    /// <summary>
    /// 当前玩家
    /// </summary>
    //protected Player mainPlayer;
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
    protected noLeftOperateTime: boolean;
    /// <summary>
    /// 缓存玩家show牌
    /// </summary>
    public cacheClinetShowDownCardId: number;
    /// <summary>
    /// 操作延时次数
    /// </summary>
    protected delayCount: number;
    /// <summary>
    /// 公共牌位置
    /// </summary>
    public listDefaultPublicCardsLPos: cc.Vec3[];
    /// <summary>
    /// 第二套公共牌位置
    /// </summary>
    public listDefaultSecondPublicCardsLPos: cc.Vec3[];
    /// <summary>
    /// 上一局庄家
    /// </summary>
    //public sbyte lastBankerIndex;
    /// <summary>
    /// 缓存坐下SeatId
    /// </summary>
    //protected sbyte cacheSitdownSeatId;
    /// <summary>
    /// 等待GPS
    /// </summary>
    public waittingGPSCallback: boolean;
    /// <summary>
    /// 已经Allin下发玩家手牌
    /// </summary>
    protected isAllinGetPlayerCards: boolean;
    /// <summary>
    /// 保险模式，三张公共牌后，没有保险可买，马上来了第四张公共牌 0默认 1首次收筹码并位移
    /// </summary>
    protected fuck4thPCardByInsuranceState: number = 0;
    /// <summary>
    /// 最低入池率 0不限制
    /// </summary>
    private CurminPoolRate: number;
    /// <summary>
    /// // 最小保留记分牌倍数
    /// </summary>
    private CurrentMinRate: number;
    /// <summary>
    /// // 允许带出记分牌0否 1 自动  2手动
    /// </summary>
    private CurlimitOutChip: number;
    /// <summary>
    /// 强制盲注
    /// </summary>
    private CurStraddle: boolean;
    /// <summary>
    /// 结束轮
    /// </summary>
    // public Def.Types.Round cacheRound;
    /// <summary>
    /// 本手缓存
    /// </summary>
    public cacheOutChips: number;
    /// <summary>
    /// 缓存本手trun手牌
    /// </summary>
    public cacheTrunOutsCards: Map<number/*座位号*/, number[]/*保险outs*/>;

    /// <summary>
    /// 缓存购买量
    /// </summary>
    public cacheBuyActiveAmount: number;
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
    public cacheUniqueId: string;
    /// <summary>
    /// 缓存广播信息
    /// </summary>
    //public BroadcastMsgData broadcastMsgData;
    /// <summary>
    /// 缓存赢牌信息
    /// </summary>
    //public ServerMessageWinner MessageWinnerData;
    /// <summary>
    /// 缓存是否是第二套牌
    /// </summary>
    public IsSecondPsc: boolean;

    public cacheBuyInsurancePotUserCount: number;
    /// <summary>
    /// 缓存自己被验证信息
    /// </summary>
    public cacheVoiceprintMsgId: number;

    public VoiceprintCountdown: number;

    constructor() {
        this.messageHandler = new TexasGameMessageHandler(this);
        this.texasGameProtocol = new TexasGameProtocol(this);
        this.FsmLogicComponent = new FSMLogicComponent();
        this.SMAgency = new TexasSMAgency(this);
        this.listSeat = [];
        this.dicSeatOnlyClient = new Map<number, Seat>();
    }

    Start() {
        UpdateComponent.Add(this.FsmLogicComponent, this);
        this.FsmLogicComponent.start();
        this.SMAgency.LoadGameStateConf();
        //SceneManager.ins.switchScene(UIDefine.TexasScene);
    }

    RegisterMsgHandler() {
        this.messageHandler.RegisterMessageHandler();
        this.texasGameProtocol.RegisterMsgHandler();
    }
    UnRegisterMsgHandler() {
        this.messageHandler.RemoveMessageHandler();
        this.texasGameProtocol.RemoveMsgHandler();
    }


    //获取桌面样式
    get deskType() {

        (this.setting.deskType == null) && (this.setting.deskType = +localStorage.getItem(StorageKey.SettingDeskType) || TexasConfig.DefaultDeskType);

        return this.setting.deskType;
    }
    //根据样式获取桌布资源
    getDeskSpriteFrames(index: number): cc.SpriteFrame[] {
        let c = this.deskTypeIndexs[index] || this.deskTypeIndexs[0]
        let desk = AssetContext.getAsset("TexasDeskBg" + c[0]) as cc.SpriteFrame;
        let table = AssetContext.getAsset("TexasTableBg" + c[1]) as cc.SpriteFrame;
        return [desk, table];
    }

    public RegiterEnterRoom() {
        Dispatcher.on(ProtocolCode.Protocol_Holdem_EnterRoom, this.messageHandler.Protocol_Holdem_EnterRoom_Handler, this.messageHandler);
    }
    public UnRegiterEnterRoom() {
        Dispatcher.off(ProtocolCode.Protocol_Holdem_EnterRoom, this.messageHandler.Protocol_Holdem_EnterRoom_Handler, this.messageHandler);
    }

    public EnterRoom() {
        GameSession.EnterRoom();
    }
    //更新房间数据
    public UpdateRoom(obj: ServerMessageEnterRoom.AsObject) {

        this.UpdateRoomCommon(obj);

    }
    UpdateRoomCommon(rec: ServerMessageEnterRoom.AsObject) {
        this.ClearAllData();
        this.ClearAllPlayers();  // 清空玩家数据
        if (this.listSeat?.length) {

        } else {
            this.InitSeatByCount(GameCache.ins.seat_count);
        }

        this.gamestatus = rec.gameStatus;


        this.smallBlind = rec.roomInfo.smallBlind;
        GameCache.ins.carry_small = rec.roomInfo.smallBlind * 2;
        this.bigBlind = rec.roomInfo.smallBlind * 2;
        this.alreadAnte = rec.handInfo.allBet;
        this.maxPlayTime = rec.roomInfo.schedulePlayDuration;
        this.currentMinRate = rec.roomInfo.currentMinRate;
        this.currentMaxRate = rec.roomInfo.currentMaxRate;
        this.CurlimitOutChip = rec.roomInfo.retainType;
        this.CurrentMinRate = rec.roomInfo.limitRetainMinRate * rec.roomInfo.currentMinRate;
        this.mHandNum = rec.handInfo.handNum;
        GameCache.ins.CurlimitDelaySeeCard = rec.roomInfo.delaySeeCard;
        this.CurStraddle = rec.roomInfo.straddle;

        this.opTime = rec.roomInfo.opDuration;
        this.groupBet = rec.roomInfo.ante;
        this.insurance = rec.roomInfo.insurance;
        this.isIpRestrictions = rec.roomInfo.limitIp;
        this.isGPSRestrictions = rec.roomInfo.limitGps;


        this.gameUI.ImageWaitForStartTips.active = this.gamestatus == 0;

        this.UpdateRoomDes();




    }

    /**
     * 刷新牌桌房间信息显示
     */
    UpdateRoomDes() {

        let info: string = ``;
        info += `\n${GameCache.ins.roomName}`;
        info += `\n${this.GetRoomTypeDes()}`;
        info += `\n${GameCache.ins.room_id}-${this.mHandNum}`;
        let straddleStr: string = "";
        if (this.groupBet > 0) {
            info += `\n${LanguageCode.LanguageDescription(20006)}${StringHelper.getStringDiv100(this.smallBlind)}/${StringHelper.getStringDiv100(this.bigBlind)}(${StringHelper.getStringDiv100(this.groupBet)}) ${straddleStr = this.CurStraddle ? "straddle" : ""}`;
        }
        else {
            info += `\n${LanguageCode.LanguageDescription(20006)}${StringHelper.getStringDiv100(this.smallBlind)}/${StringHelper.getStringDiv100(this.bigBlind)} ${straddleStr = this.CurStraddle ? "straddle" : ""}`;
        }
        //带出，最小带入倍数
        if (this.CurlimitOutChip == RoomInfo.RetainType.RT_MANUAL) {
            info += `\n${LanguageCode.LanguageDescription(20087)}:${(GameCache.ins.carry_small * this.CurrentMinRate) / 100 ^ 0}`;
        }

        let insuranceStr = "";
        if (this.isGPSRestrictions && this.isIpRestrictions) {
            // "GPS  IP限制";
            info += `\n${insuranceStr = ((GameCache.ins.insurance) ? LanguageCode.LanguageDescription(10021) + " " : "")}GPS  IP${LanguageCode.LanguageDescription(20008)}`;
        }
        else if (this.isGPSRestrictions && !this.isIpRestrictions) {
            //"GPS限制";
            info += `\n${insuranceStr = ((GameCache.ins.insurance) ? LanguageCode.LanguageDescription(10021) + " " : "")}GPS${LanguageCode.LanguageDescription(20008)}`;

        }
        else if (!this.isGPSRestrictions && this.isIpRestrictions) {
            // "IP限制;
            info += `\n${insuranceStr = ((GameCache.ins.insurance) ? LanguageCode.LanguageDescription(10021) + " " : "")}IP${LanguageCode.LanguageDescription(20008)}`;
        }
        else if (GameCache.ins.insurance) {
            info += `\n${LanguageCode.LanguageDescription(10021)}`;
        }
        if (GameCache.ins.CurlimitDelaySeeCard) {
            info += `\n${LanguageCode.LanguageDescription(20088)}`;
        }
        info += "\n\n";
        this.gameUI.roominfo_lab.string = info;
    }


    protected GetRoomTypeDes(): string {
        let gameTypeStr: string = i18nMgr.Get("GameType_" + GameCache.ins.game_type);
        let pokerTypeStr: string = i18nMgr.Get("PokerType_" + GameCache.ins.poker_type);
        let betTypeStr: string = i18nMgr.Get("BetType_" + GameCache.ins.bet_type);
        return gameTypeStr + "-" + pokerTypeStr + "-" + betTypeStr;
    }

    //初始化座位
    public InitSeatByCount(seatCount: number) {
        let mInfos: SeatUIInfo[] = GameUtil.SeatUIInfos[seatCount];
        for (let i = 0; i < seatCount; i++) {
            let seatUI = this.getSeatUI();

            seatUI.getComponent(cc.Widget).enabled = false;
            seatUI.active = true;
            seatUI.parent = this.gameUI.Seat.parent;
            seatUI.name = `Seat${i}}`;
            if (i == 0 && cc.view.getVisibleSize().height < 2688) {
                mInfos[i].Pos = cc.v3(this.gameUI.Seat.x, this.gameUI.Seat.y, 0);
            }
            seatUI.setPosition(mInfos[i].Pos);
            // mGo.transform.localRotation = Quaternion.identity;
            // mGo.transform.localScale = Vector3.one;
            let mSeat: Seat = new Seat(seatUI);
            mSeat.InitSeatUIInfo(mInfos[i], seatCount);
            this.listSeat.push(mSeat);
            this.dicSeatOnlyClient.set(mSeat.ClientSeatId, mSeat);
            // Seat mSeat = ComponentFactory.CreateWithId<Seat, Transform>(i, mGo.transform);
            // mSeat.InitSeatUIInfo(mInfos[i], seatCount);
            // listSeat.Add(mSeat);
            // dicSeatOnlyClient.Add(mSeat.ClientSeatId, mSeat);
        }
    }

    /// <summary>
    /// 转换远端座位号到本地座位号 服务器下发位置从  1开始，0为默认值，客户端-1为默认值(所以需要减一下，暂时不大改客户端)
    /// </summary>
    /// <param name="remoteSeatID"></param>
    /// <returns></returns>
    public GetLocalSeatID(remoteSeatID: number): number {
        let id: number = remoteSeatID - 1;
        if (id < -1) return -1;
        return id;
    }
    /// <summary>
    /// 通过本地座位号获取位置对象
    /// </summary>
    /// <param name="localSeatID"></param>
    /// <returns></returns>
    public GetSeatByLocalSeatID(localSeatID: number): Seat {
        let mSeat: Seat = null;
        if (localSeatID >= 0 && localSeatID < this.listSeat.length)
            mSeat = this.listSeat[localSeatID];
        return mSeat;
    }
    /// <summary>
    /// 获取默认手牌背面
    /// </summary>
    /// <returns></returns>
    public GetEmptyHandCards(): number[] {
        return [0, 0];
    }

    ClearAllData() {
        cc.log("清理所有数据");
    }
    ClearAllPlayers() {

        cc.log("清理所有玩家");

        while (this.listSeat.length) {
            let seat = this.listSeat.pop();
            this.removeSeatUI(seat.ui);
            seat.Clear();
        }
    }
    getSeatUI() {
        if (this.seatUI_pool.length) return this.seatUI_pool.pop();
        return cc.instantiate(this.gameUI.Seat)
    }
    removeSeatUI(seatUI: cc.Node) {
        this.seatUI_pool.push(seatUI);
    }

    /**
     * 退出
     */
    Exit() {
        this.UnRegisterMsgHandler()
    }


}
