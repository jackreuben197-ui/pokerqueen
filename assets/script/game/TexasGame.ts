import TexasConfig from "../config/TexasConfig";
import { RoomType } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import Dispatcher from "../event/Dispatcher";
import UpdateComponent from "../funcomponent/UpdateComponent";
import { StringHelper } from "../helper/StringHelper";
import { i18nMgr } from "../i18n/i18nMgr";
import { LanguageCode } from "../i18n/LanguageCode";
import UIManager from "../manager/UIManager";
import { Web_User_Room } from "../net/https/WebRequest";
import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { Protocol_Holdem_BringIn, Protocol_Holdem_Seated, Protocol_Holdem_StandupActive } from "../net/websocket/ProtocolHoldemMessages";
import { Def, RoomInfo } from "../protobuf/holdem/define_pb";
import { ServerMessageStartInfo } from "../protobuf/holdem/recv_start_info_pb";
import { ServerMessageEnterRoom } from "../protobuf/holdem/req_enter_room_pb";
import StorageKey from "../session/StorageKey";
import AssetContext from "../ui/component/AssetContext";
import UIDialogComponent from "../ui/dialog/UIDialogComponent";
import { CPlayer } from "./CPlayer";
import FSMLogicComponent from "./FSMLogicComponent";
import GameCache from "./GameCache";
import GameUtil from "./GameUtil";
import Seat, { SeatUIInfo } from "./Seat";
import { SeatEmpty, SeatIdle } from "./SeatStateHandler";
import TexasGameMessageHandler from "./TexasGameMessageHandler";
import TexasGameProtocol from "./TexasGameProtocol";
import { TexasGameState } from "./TexasGameState";
import TexasGameUtils from "./TexasGameUtils";
import TexasScene, { PotInfo } from "./TexasScene";
import TexasSMAgency from "./TexasSMAgency";
import { UITexasModel } from "./UITexasModel";
//const PBTypes = Def.Types;


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

    //ui界面类的引用
    public uirc: TexasScene = null;

    public messageHandler: TexasGameMessageHandler = null;

    public texasGameProtocol: TexasGameProtocol = null;

    public FsmLogicComponent: FSMLogicComponent = null;

    public SMAgency: TexasSMAgency = null;

    public utils: TexasGameUtils = null;

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
    /// 大盲所在位置
    /// </summary>
    public bigIndex: number;
    /// <summary>
    /// 小盲所在位置
    /// </summary>
    public smallIndex: number;
    /// <summary>
    /// 庄家所在位置
    /// </summary>
    public bankerIndex: number;
    /// <summary>
    /// 当前操作玩家所在位置
    /// </summary>
    public operationID: number = -1;
    /// <summary>
    /// 已发出公共牌
    /// </summary>
    public cards: number[];
    /// <summary>
    /// 已发出第二套公共牌
    /// </summary>
    public secondCards: number[];

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
    public groupBet: number = 0;
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
    public mainPlayer: CPlayer;
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
    public lastBankerIndex: number = 0;
    /// <summary>
    /// 缓存坐下SeatId
    /// </summary>
    protected cacheSitdownSeatId: number;
    /// <summary>
    /// 等待GPS
    /// </summary>
    public waittingGPSCallback: boolean;
    /// <summary>
    /// 已经Allin下发玩家手牌
    /// </summary>
    public isAllinGetPlayerCards: boolean;
    /// <summary>
    /// 保险模式，三张公共牌后，没有保险可买，马上来了第四张公共牌 0默认 1首次收筹码并位移
    /// </summary>
    public fuck4thPCardByInsuranceState: number = 0;
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
    public CurlimitOutChip: number;
    /// <summary>
    /// 强制盲注
    /// </summary>
    private CurStraddle: boolean;
    /// <summary>
    /// 结束轮
    /// </summary>
    public cacheRound: number;
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
        this.utils = new TexasGameUtils(this);
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
        this.utils.EnterRoom();
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
            this.InitSeatByCount(GameCache.Instance.seat_count);
        }

        this.mainPlayer = new CPlayer(GameCache.Instance.nUserId);
        //ComponentFactory.CreateWithId<Player>(GameCache.Instance.nUserId);
        this.mainPlayer.sex = GameCache.Instance.sex;
        this.mainPlayer.headPic = GameCache.Instance.headPic;
        this.mainPlayer.nick = GameCache.Instance.nick;
        this.mainPlayer.userID = GameCache.Instance.nUserId;
        this.mainPlayer.SetCards(this.GetEmptyHandCards());
        if (rec.myInfo != null) {
            this.mainPlayer.seatID = this.GetLocalSeatID(rec.myInfo.seatId);
            this.mainPlayer.chips = rec.myInfo.chip;
            this.mainPlayer.cacheStoreChips = rec.myInfo.storeChips;
        }

        this.cacheUniqueId = rec.roomInfo.uniqueId;
        this.gamestatus = rec.gameStatus;


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
        this.insurance = rec.roomInfo.insurance;
        this.isIpRestrictions = rec.roomInfo.limitIp;
        this.isGPSRestrictions = rec.roomInfo.limitGps;

        GameCache.Instance.insurance = this.insurance;
        let mPots: number[] = [];
        for (let i = 0; i < rec.handInfo.potsList.length; i++) {
            mPots.push(rec.handInfo.potsList[i].amount);
        }
        this.pots = mPots;
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
            mSeat = this.listSeat[this.GetLocalSeatID(rec.playersList[i].seatId)];
            mSeat.seatID = this.GetLocalSeatID(rec.playersList[i].seatId);
            mSeat.FsmLogicComponent.SM.ChangeState(SeatIdle.Instance);

            let mPlayerId = rec.playersList[i].userRid;
            if (mPlayerId == 0) {
                mSeat.FsmLogicComponent.SM.ChangeState(SeatEmpty.Instance);
                continue;
            }
            let mAnte = rec.playersList[i].roundActioned ? rec.playersList[i].roundBet : 0;
            let mNickname = rec.playersList[i].name;
            let mChips = rec.playersList[i].chip;
            let OffLineState = 0;
            let mHeadPic = rec.playersList[i].avatar;
            mSeat.isBig = this.bigIndex == this.GetLocalSeatID(rec.playersList[i].seatId);
            mSeat.isSmall = this.smallIndex == this.GetLocalSeatID(rec.playersList[i].seatId);
            mSeat.isBank = this.bankerIndex == this.GetLocalSeatID(rec.playersList[i].seatId);
            mSeat.isStraddle = false;
            let mSex = rec.playersList[i].sex;
            let mKeptTime = rec.playersList[i].keepSeatLeftTime;
            mSeat.keepSeatLeftTime = mKeptTime;
            let mPlayer: CPlayer = new CPlayer(mPlayerId);
            mPlayer.seatID = this.GetLocalSeatID(rec.playersList[i].seatId);
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
            mPlayer.SetCards(this.GetHandCardsAtEnterRoom(rec, i));
            mPlayer.RoundActioned = rec.playersList[i].roundActioned;
            mSeat.Player = mPlayer;

            if (rec.myInfo != null && this.GetLocalSeatID(rec.myInfo.seatId) == this.GetLocalSeatID(rec.playersList[i].seatId)) {
                if (null != this.mainPlayer) {
                    this.mainPlayer.Dispose();
                    this.mainPlayer = null;
                }
                this.mainPlayer = mSeat.Player;
            }
            //mSeat.UpdateFSMbyStatus(true);
            //更新玩家离线状态
            mSeat.UpdateOnOrOffLine();
        }
        this.uirc.imageWaitForStartTips.active = this.gamestatus == 0;
        this.UpdateRoomDes();

        mSeat = this.GetSeatByLocalSeatID(this.mainPlayer.seatID);
        if (null != mSeat) {
            this.ResetSeatUIInfo(mSeat.ClientSeatId);
        }
        for (let i = 0, n = rec.playersList.length; i < n; i++) {
            mSeat = this.listSeat[this.GetLocalSeatID(rec.playersList[i].seatId)];
            mSeat.seatID = this.GetLocalSeatID(rec.playersList[i].seatId);

            mSeat.FsmLogicComponent.SM.ChangeState(SeatIdle.Instance);

            let mPlayerId = rec.playersList[i].userRid;

            if (mPlayerId == 0) {
                continue;
            }
            mSeat.UpdateFSMbyStatus(true);
        }
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
    }



    /// <summary>
    /// 刷新分池
    /// </summary>
    protected UpdatePots(): void {
        let mNewStart = 0, mNewEnd = 0;
        let mUpdateStart = 0, mUpdateEnd = 0;
        let mHideStart = 0, mHideEnd = 0;

        if (this.pots.length < this.uirc.listPotInfo.length) {
            mUpdateStart = 0;
            mUpdateEnd = this.pots.length;
            mHideStart = this.pots.length;
            mHideEnd = this.uirc.listPotInfo.length;
        }
        else if (this.pots.length > this.uirc.listPotInfo.length) {
            mUpdateStart = 0;
            mUpdateEnd = this.uirc.listPotInfo.length;
            mNewStart = this.uirc.listPotInfo.length;
            mNewEnd = this.pots.length;
        }
        else {
            mUpdateStart = 0;
            mUpdateEnd = this.uirc.listPotInfo.length;
        }

        let mObj: cc.Node = null;
        let mPotInfo: PotInfo = null;

        // 隐藏放最前面
        for (let i = mHideStart; i < mHideEnd; i++) {

            mObj = this.uirc.listPotInfo[i].trans;//.gameObject;
            mObj.active = false;
        }

        for (let i = mNewStart; i < mNewEnd; i++) {

            if (i == 0) {

                mObj = cc.instantiate(this.uirc.transAllPot);
                mObj.setParent(this.uirc.transPots);
                mObj.setPosition(GameUtil.TexasPots[0]);
                //mObj.transform.localRotation = Quaternion.identity;
                mObj.setScale(cc.Vec3.ONE);
                mObj.name = `Pot${i}`;
                mPotInfo = new PotInfo(mObj);
                this.uirc.listPotInfo.push(mPotInfo);
                mPotInfo.textPot.string = StringHelper.getStringDiv100(this.pots[i]);
                mObj.active = this.pots[i] > 0;
            }
            else {
                mObj = cc.instantiate(this.uirc.transPot);
                mObj.setParent(this.uirc.transPots);

                mObj.setScale(cc.Vec3.ONE);
                mObj.name = `Pot${i}`;

                mPotInfo = new PotInfo(mObj);
                this.uirc.listPotInfo.push(mPotInfo);

                //mPotInfo.imagePot.sprite = rcChipSprite.Get<Sprite>(GameUtil.GetChipSpriteName(pots[i]));
                let str = `${this.pots[i] / 100}`;

                //是整数不保留小数，不是整数保留一位小数

                let num: number = +str;

                if (num != (num ^ 0)) {
                    str = num.toFixed(1);
                }
                mPotInfo.textPot.string = str;

                mPotInfo.imagePotText.string = `${i}`;
                //float mFrameWidth = mPotInfo.textPot.preferredWidth + mPotInfo.imagePot.rectTransform.sizeDelta.x + 10f;
                //mPotInfo.imagePotFrame.rectTransform.sizeDelta = new Vector2(mFrameWidth, mPotInfo.imagePotFrame.rectTransform.sizeDelta.y);
                //mPotInfo.imagePotFrame.rectTransform.pivot = new Vector2(0, 0.5f);
                if (i == 0) {
                    mPotInfo.imagePotFrame.node.setPosition(cc.v3(-mPotInfo.imagePotFrame.node.width / 2, mPotInfo.imagePotFrame.node.y));
                    //mPotInfo.imagePot.rectTransform.localPosition = new Vector3(-mPotInfo.imagePotFrame.rectTransform.sizeDelta.x / 2f, 0);
                }
                else {
                    //mPotInfo.imagePotFrame.rectTransform.localPosition = Vector3.zero;
                    //mPotInfo.imagePot.rectTransform.localPosition = Vector3.zero;
                }

                if (this.pots[i] > 0) {
                    if (i == 0) {
                        mPotInfo.trans.setPosition(GameUtil.TexasPots[i]);
                    }
                    else {
                        mPotInfo.trans.setPosition(GameUtil.TexasPots[0]);
                        //mPotInfo.trans.DOLocalMove(GameUtil.TexasPots[i], 0.3f);
                        cc.tween(mPotInfo.trans).to(.3, { position: GameUtil.TexasPots[i] }).start();
                    }
                }
                mObj.active = this.pots[i] > 0;
            }

        }

        for (let i = mUpdateStart; i < mUpdateEnd; i++) {
            if (i == 0) {
                this.uirc.listPotInfo[0].textPot.string = `${this.pots[0] / 100}`;
                continue;
            }
            mPotInfo = this.uirc.listPotInfo[i];
            mObj = this.uirc.listPotInfo[i].trans;

            //mPotInfo.imagePot.sprite = rcChipSprite.Get<Sprite>(GameUtil.GetChipSpriteName(pots[i]));
            let str = `${this.pots[i] / 100}`;

            let num: number = +str;

            if (num != (num ^ 0)) {
                str = num.toFixed(1);
            }
            mPotInfo.textPot.string = str;

            mPotInfo.imagePotText.string = `${i}`;
            //float mFrameWidth = mPotInfo.textPot.preferredWidth + mPotInfo.imagePot.rectTransform.sizeDelta.x + 10f;
            //mPotInfo.imagePotFrame.rectTransform.sizeDelta = new Vector2(mFrameWidth, mPotInfo.imagePotFrame.rectTransform.sizeDelta.y);
            if (i == 0) {
                mPotInfo.imagePotFrame.node.setAnchorPoint(cc.v2(0, 0.5));
                mPotInfo.imagePotFrame.node.setPosition(cc.v3(-mPotInfo.imagePotFrame.node.width / 2, mPotInfo.imagePotFrame.node.y));
                mPotInfo.imagePot.node.setPosition(cc.v3(-mPotInfo.imagePotFrame.node.width / 2, 0));
            }
            else {
                //mPotInfo.imagePotFrame.rectTransform.pivot = new Vector2(0, 0.5f);
                //mPotInfo.imagePotFrame.rectTransform.localPosition = Vector3.zero;
                //mPotInfo.imagePot.rectTransform.localPosition = Vector3.zero;
            }

            if (this.pots[i] > 0 && !mObj.activeInHierarchy) {
                if (i == 0) {
                    mObj.setPosition(GameUtil.TexasPots[i]);
                }
                else {
                    mObj.setPosition(GameUtil.TexasPots[0]);
                    cc.tween(mObj).to(.3, { position: GameUtil.TexasPots[i] }).start();
                }
            }

            mObj.active = this.pots[i] > 0;
        }
    }

    /// <summary>
    /// 刷新底池
    /// </summary>
    protected UpdateAlreadAnte(): void {
        // textAlreadAnte.text = $"底池:{alreadAnte}";
        this.uirc.textAlreadAnte.node.active = (this.gamestatus >= 1 && this.gamestatus < 7);
        this.uirc.textAlreadAnte.string = `${LanguageCode.LanguageDescription(20005)}:${(this.alreadAnte / 100)}`;
    }


    /**
     * 刷新牌桌房间信息显示
     */
    UpdateRoomDes() {

        let info: string = ``;
        info += `\n${GameCache.Instance.roomName}`;
        info += `\n${this.GetRoomTypeDes()}`;
        info += `\n${GameCache.Instance.room_id}-${this.mHandNum}`;
        let straddleStr: string = "";
        if (this.groupBet > 0) {
            info += `\n${LanguageCode.LanguageDescription(20006)}${StringHelper.getStringDiv100(this.smallBlind)}/${StringHelper.getStringDiv100(this.bigBlind)}(${StringHelper.getStringDiv100(this.groupBet)}) ${straddleStr = this.CurStraddle ? "straddle" : ""}`;
        }
        else {
            info += `\n${LanguageCode.LanguageDescription(20006)}${StringHelper.getStringDiv100(this.smallBlind)}/${StringHelper.getStringDiv100(this.bigBlind)} ${straddleStr = this.CurStraddle ? "straddle" : ""}`;
        }
        //带出，最小带入倍数 RT_MANUAL手动的
        if (this.CurlimitOutChip == RoomInfo.RetainType.RT_MANUAL) {
            info += `\n${LanguageCode.LanguageDescription(20087)}:${(GameCache.Instance.carry_small * this.CurrentMinRate) / 100}`;
        }

        let insuranceStr = "";
        if (this.isGPSRestrictions && this.isIpRestrictions) {
            // "GPS  IP限制";
            info += `\n${insuranceStr = ((GameCache.Instance.insurance) ? LanguageCode.LanguageDescription(10021) + " " : "")}GPS  IP${LanguageCode.LanguageDescription(20008)}`;
        }
        else if (this.isGPSRestrictions && !this.isIpRestrictions) {
            //"GPS限制";
            info += `\n${insuranceStr = ((GameCache.Instance.insurance) ? LanguageCode.LanguageDescription(10021) + " " : "")}GPS${LanguageCode.LanguageDescription(20008)}`;

        }
        else if (!this.isGPSRestrictions && this.isIpRestrictions) {
            // "IP限制;
            info += `\n${insuranceStr = ((GameCache.Instance.insurance) ? LanguageCode.LanguageDescription(10021) + " " : "")}IP${LanguageCode.LanguageDescription(20008)}`;
        }
        else if (GameCache.Instance.insurance) {
            info += `\n${LanguageCode.LanguageDescription(10021)}`;
        }
        if (GameCache.Instance.CurlimitDelaySeeCard) {
            info += `\n${LanguageCode.LanguageDescription(20088)}`;
        }
        info += "\n\n";
        this.uirc.textRoomInfo.string = info;
    }


    protected GetRoomTypeDes(): string {
        let gameTypeStr: string = i18nMgr.Get("GameType_" + GameCache.Instance.game_type);
        let pokerTypeStr: string = i18nMgr.Get("PokerType_" + GameCache.Instance.poker_type);
        let betTypeStr: string = i18nMgr.Get("BetType_" + GameCache.Instance.bet_type);
        return gameTypeStr + "-" + pokerTypeStr + "-" + betTypeStr;
    }

    //初始化座位
    public InitSeatByCount(seatCount: number) {
        let mInfos: SeatUIInfo[] = GameUtil.SeatUIInfos[seatCount];
        for (let i = 0; i < seatCount; i++) {
            let seatUI = this.getSeatUI();
            seatUI.getComponent(cc.Widget).enabled = false;
            seatUI.active = true;
            seatUI.parent = this.uirc.Seat.parent;
            seatUI.name = `Seat${i}`;
            if (i == 0 && cc.view.getVisibleSize().height < 2688) {
                mInfos[i].Pos = cc.v3(this.uirc.Seat.x, 454 - cc.view.getVisibleSize().height / 2, 0);
            }
            seatUI.setPosition(mInfos[i].Pos);
            // mGo.transform.localRotation = Quaternion.identity;
            // mGo.transform.localScale = Vector3.one;
            let mSeat: Seat = new Seat(i, seatUI);
            mSeat.InitSeatUIInfo(mInfos[i], seatCount);
            this.listSeat.push(mSeat);
            this.dicSeatOnlyClient.set(mSeat.ClientSeatId, mSeat);
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

    /// <summary>
    /// 获取进入房间手牌
    /// </summary>
    /// <param name="obj"></param>
    /// <param name="index"></param>
    /// <returns></returns>
    protected GetHandCardsAtEnterRoom(rec: ServerMessageEnterRoom.AsObject, index: number): number[] {
        if (rec.playersList[index].cardsList == null || rec.playersList[index].cardsList.length <= 0) {
            return [0, 0];
        }
        let mFirstCard: number = rec.playersList[index].cardsList[0];
        let mSecondCard: number = rec.playersList[index].cardsList[1];
        return [mFirstCard, mSecondCard];
    }

    // 重置位置信息
    public ResetSeatUIInfo(clientSeatId: number): void {
        if (clientSeatId == 0)
            return;

        this.dicSeatOnlyClient.clear();
        let mInfos: SeatUIInfo[] = GameUtil.SeatUIInfos[this.listSeat.length];
        for (let i = 0, n = mInfos.length; i < n; i++) {
            let mSeat: Seat = this.listSeat[i];
            let tmp: number = mSeat.ClientSeatId - clientSeatId;
            if (tmp < 0)
                tmp += mInfos.length;
            mSeat.ClientSeatId = tmp;
            mSeat.ui.name = `Seat${tmp}`;

            this.dicSeatOnlyClient.set(tmp, mSeat);
            // tweenerResetSeatUIInfo = mSeat.Trans.DOLocalMove(mInfos[tmp].Pos, 0.3f).OnComplete(() => {
            //     mSeat.InitSeatUIInfo(mInfos[tmp], listSeat.Count);
            // });
            cc.tween(mSeat.ui).to(0.3, { position: mInfos[tmp].Pos }).call(() => {
                mSeat.InitSeatUIInfo(mInfos[tmp], this.listSeat.length);
            }).start();

        }

        // PlayGameAnimation(GameAnimation.ResetSeatUIInfo);
        // tweenerResetSeatUIInfo.onComplete += () => {
        //     // StopGameAnimation(GameAnimation.ResetSeatUIInfo);
        // };
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

        UITexasModel.mInstance.APIUserRoom().then((tResp: typeof Web_User_Room.Response) => {
            //last_bring_out 有数据
            if (tResp.code == 0 && tResp.data.last_bring_out != null) {
                let fee: number = tResp.data.last_bring_out.fee;
                let bring_out: number = tResp.data.last_bring_out.to_wallet;
                if (bring_out + fee > 0) {
                    if (tResp.data.last_bring_out.to_wallet <= tResp.data.wallet.gold) {
                        ProtocolAgency.Send({
                            protocol: Protocol_Holdem_Seated,
                            RoomID: GameCache.Instance.room_id,
                            MatchID: GameCache.Instance.match_id,
                            body: Protocol_Holdem_Seated.Request(
                                {
                                    room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                                    seatId: this.GetRemoteSeatID(mSeat.seatID),
                                    bringIn: bring_out + fee,
                                    autoOnTable: 0,
                                    autoUseWallet: false,
                                    returnOrNew: 0,
                                    store: 0,
                                }),
                        });
                    }
                } else {

                }
            } else {
                if (this.CurlimitOutChip == RoomInfo.RetainType.RT_AUTO) {
                    //this.ShowSetAutoAddChips();
                }
                else {
                    //弹出设置
                    this.ShowAddChips();
                }
            }
        })
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
        if (null == this.uirc.buttonWaitBlind || this.uirc.buttonWaitBlind.activeInHierarchy)
            return;
        this.uirc.buttonWaitBlind.active = true;
    }
    /// <summary>
    /// 隐藏补盲按钮
    /// </summary>
    public HideWaitBlindBtn(): void {
        if (null == this.uirc.buttonWaitBlind || !this.uirc.buttonWaitBlind.activeInHierarchy)
            return;
        this.uirc.buttonWaitBlind.active = false;
    }
    /// <summary>
    /// 带入
    /// </summary>
    /// <param name="anteNumber"></param>
    public AddChips(anteNumber: number, autoOnTable: number = 0, autoUseWallet: boolean = false) {
        if (GameCache.Instance.gold < anteNumber) {
            UIManager.open(UIDefine.UIDialogComponent,
                {
                    type: UIDialogComponent.DialogType.CommitCancel,
                    // title = $"余额不足",
                    title: LanguageCode.LanguageDescription(10025),
                    // content = $"金豆余额不足，请先充值",
                    content: LanguageCode.LanguageDescription(20010),
                    // contentCommit = "去充豆",
                    contentCommit: LanguageCode.LanguageDescription(10026),
                    // contentCancel = "取消",
                    contentCancel: LanguageCode.LanguageDescription(10013),
                    actionCommit: () => {
                        // UIMineModel.mInstance.APIGetClubId(tDtoHasClub => {
                        //     if (tDtoHasClub) {
                        //         UIComponent.Instance.ShowNoAnimation(UIType.UIMine_WalletAddBeansList, null);
                        //     }
                        //     else {
                        //         UIComponent.Instance.ToastLanguage("WalletMy11");
                        //     }
                        // });
                    },
                    actionCancel: null,
                    noAnimation: true,
                });
            return;
        }
        if (this.mainPlayer == null || this.mainPlayer.seatID == -1) {
            //声纹认证开启判断
            if (GameCache.Instance.voiceprint_verify_on == 1) {
                //             UITexasModel.mInstance.APIUserVoiceprint(0, 0, Act => {
                //                 if (Act.code == 0) {
                //                     if (Act.data == null) {
                //                         if (!MicrophoneHelper.IsMicrophonePermissionAllowed()) {
                //                             return;
                //                         }
                //                         Game.Scene.GetComponent<UIComponent>().ShowNoAnimation(UIType.UITexasHumanYZ, new UITexasHumanYZComponent.VerificationDataInfo()
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
            }
            else {

                ProtocolAgency.Send({
                    protocol: Protocol_Holdem_Seated,
                    RoomID: GameCache.Instance.room_id,
                    MatchID: GameCache.Instance.match_id,
                    body: Protocol_Holdem_Seated.Request(
                        {
                            room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                            seatId: this.GetRemoteSeatID(this.cacheSitdownSeatId),
                            bringIn: anteNumber,//rec.Chips
                            autoOnTable: autoOnTable,
                            autoUseWallet: autoUseWallet,
                            returnOrNew: 0,
                            store: 0,
                        }),
                });

            }

            return;
        }
        let IsUseWallet = true;
        if (this.mainPlayer.cacheStoreChips >= anteNumber) {
            IsUseWallet = false;
        }
        ProtocolAgency.Send({
            protocol: Protocol_Holdem_BringIn,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            body: Protocol_Holdem_BringIn.Request(
                {
                    room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                    bringIn: anteNumber,
                    useWallet: IsUseWallet
                }),
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

        ProtocolAgency.Send({
            protocol: Protocol_Holdem_StandupActive,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            body: Protocol_Holdem_StandupActive.Request(
                {
                    room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                }),
        })
    }
    /// <summary>
    /// 获取游戏开始手牌
    /// </summary>
    /// <param name="rec"></param>
    /// <param name="index"></param>
    /// <returns></returns>
    public GetHandCardsAtRecvStartInfo(rec: ServerMessageStartInfo.AsObject, index: number): number[] {

        if (rec.playersList[index].cardsList == null || rec.playersList[index].cardsList.length <= 0) {
            return [0, 0];
        }
        let mFirstCard: number = rec.playersList[index].cardsList[0];
        let mSecondCard: number = rec.playersList[index].cardsList[1];
        return [mFirstCard, mSecondCard];
    }

    /// <summary>
    /// 获取筹码Sprite
    /// </summary>
    /// <param name="spriteName"></param>
    /// <returns></returns>
    public GetChipSpriteBySpriteName(spriteName: string): cc.SpriteFrame {
        return AssetContext.getAsset(spriteName);
    }

    /// <summary>
    /// 获取扑克牌Sprite
    /// </summary>
    /// <param name="spriteName"></param>
    /// <returns></returns>
    public GetPokerSpriteBySpriteName(spriteName: string): cc.SpriteFrame {
        return AssetContext.getAsset(spriteName);
    }

    /// <summary>
    /// 播放发牌动画
    /// </summary>
    //public PlayDealAnimation(TweenCallback tweenCallback:Function) {
    public PlayDealAnimation(tweenCallback: Function) {
        // sequencePlayDealAnimation = DOTween.Sequence();

        let sequencePlayDealAnimation = [];

        let mSeat: Seat = null;

        // 庄家标志动画
        mSeat = this.GetSeatByLocalSeatID(this.bankerIndex);
        if (null != mSeat) {
            let mTweener: { sequence: (cc.Tween | Function)[], time: number } = mSeat.PlayBankerAnimation();
            if (null != mTweener) {
                sequencePlayDealAnimation.push(mTweener);
                sequencePlayDealAnimation.push(0.2);
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
                mSeat.PlayBetAnimation()?.start();
            }

            // mIsFirstGroupBet = true;

            for (let i = 0, n = this.listSeat.length; i < n; i++) {
                mSeat = this.listSeat[i];
                if (null == mSeat || null == mSeat.Player || !mSeat.Player.isParticipateInTheGame)
                    continue;
                mSeat.PlayRecyclingChipAnimation()?.start();
            }

            let mObj: cc.Node = null;
            let mPotInfo: PotInfo = null;
            if (this.uirc.listPotInfo.length == 0) {

                mObj = cc.instantiate(this.uirc.transAllPot);
                mObj.setParent(this.uirc.transPots);
                mObj.setPosition(GameUtil.TexasPots[0]);
                //mObj.transform.localRotation = Quaternion.identity;
                mObj.setScale(cc.Vec3.ONE);
                mObj.name = `Pot${0}`;
                mPotInfo = new PotInfo(mObj);
                this.uirc.listPotInfo.push(mPotInfo);
            }
            else {

                mPotInfo = this.uirc.listPotInfo[0];
            }

            mPotInfo.textPot.string = StringHelper.getStringDiv100(allGroupBet);
            mPotInfo.trans.active = true;
        }

        //从小盲位置开始发牌
        //Vector3 mStartPos = rc.transform.TransformPoint(Vector3.zero);
        let mStartPos: cc.Vec3 = this.uirc.node.convertToWorldSpaceAR(cc.Vec3.ZERO);


        let mIsFirst = true;
        let mTmpIndex = 0;
        for (let i = this.smallIndex, n = this.listSeat.length; i < n; i++) {
            mSeat = this.listSeat[i];
            if (null == mSeat || null == mSeat.Player || !mSeat.Player.isParticipateInTheGame)
                continue;

            if (mIsFirst) {
                mIsFirst = false;
                // sequencePlayDealAnimation.Append(i == smallIndex ? listSeat[i].PlayDealAnimation(mStartPos)
                //     : listSeat[i].PlayDealAnimation(mStartPos).SetDelay(0.2f * mTmpIndex));

                if (i == this.smallIndex) {

                    sequencePlayDealAnimation.push(this.listSeat[i].PlayDealAnimation(mStartPos));
                } else {
                    sequencePlayDealAnimation.push(0.2 * mTmpIndex, this.listSeat[i].PlayDealAnimation(mStartPos));
                }
            }
            else {
                // sequencePlayDealAnimation.Join(i == smallIndex ? listSeat[i].PlayDealAnimation(mStartPos)
                //     : listSeat[i].PlayDealAnimation(mStartPos).SetDelay(0.2f * mTmpIndex));
                sequencePlayDealAnimation[sequencePlayDealAnimation.length - 1].sequence.push();

            }

            mTmpIndex++;    // 发牌时间间隔
        }

        for (let i = 0, n = this.smallIndex; i < n; i++) {
            mSeat = this.listSeat[i];
            if (null == mSeat || null == mSeat.Player || !mSeat.Player.isParticipateInTheGame)
                continue;

            //sequencePlayDealAnimation.Join(listSeat[i].PlayDealAnimation(mStartPos).SetDelay(0.2f * mTmpIndex));

            mTmpIndex++;    // 发牌时间间隔
        }

        //if (null != tweenCallback)
        // sequencePlayDealAnimation.AppendCallback(tweenCallback);
        //sequencePlayDealAnimation.OnComplete(tweenCallback);

        //sequencePlayDealAnimation.Play();
    }



    /// <summary>
    /// 回收筹码位置的世界坐标
    /// </summary>
    /// <returns></returns>
    public GetRecyclingChipPosV3(): cc.Vec3 {
        //return rc.transform.TransformPoint(this.gameUI.textAlreadAnte.transform.localPosition);
        return this.uirc.node.convertToWorldSpaceAR(this.uirc.textAlreadAnte.node.position);
    }



    /**
     * 显示手动设置面板 
     */
    private ShowAddChips(): void {
        this.uirc.UIAddChips.node.active = true;
        this.uirc.UIAddChips.onShow({
            bigBlind: this.bigBlind,
            smallBlind: this.smallBlind,
            currentMinRate: this.currentMinRate,
            currentMaxRate: this.currentMaxRate,
            totalCoin: GameCache.Instance.gold,
            tableChips: this.mainPlayer.chips
        });
    }
    ClearAllData() {
        cc.log("清理所有数据");
    }
    ClearAllPlayers() {

        cc.log("清理所有玩家");

        if (null != this.mainPlayer) {
            this.mainPlayer.Dispose();
            this.mainPlayer = null;
        }

        while (this.listSeat.length) {
            let mSeat: Seat = this.listSeat.pop();
            if (mSeat?.Player) {
                mSeat.Player.Dispose();
                mSeat.Player = null;
            }
            this.returnSeatUIPool(mSeat?.ui);
            mSeat?.Clear();
        }

    }
    getSeatUI() {
        if (this.seatUI_pool.length) return this.seatUI_pool.pop();
        return cc.instantiate(this.uirc.Seat);
    }
    returnSeatUIPool(seatUI: cc.Node) {
        seatUI && this.seatUI_pool.push(seatUI);
    }

    /**
     * 退出
     */
    Exit() {
        this.UnRegisterMsgHandler()
    }


}
