import TexasConfig from "../../config/TexasConfig";
import { Param } from "../../define/Types";
import { UIDefine } from "../../define/UIDefine";
import CPMessageDispatherComponent from "../../event/CPMessageDispatherComponent";
import UpdateComponent from "../../funcomponent/UpdateComponent";
import { StringHelper } from "../../helper/StringHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { Web_User_Room } from "../../net/https/WebRequest";
import ProtocolAgency from "../../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../../net/websocket/ProtocolCode";
import { Protocol_Holdem_Action, Protocol_Holdem_BringIn, Protocol_Holdem_Seated, Protocol_Holdem_StandupActive } from "../../net/websocket/ProtocolHoldemMessages";
import { Def, RoomInfo, Operator, Player } from "../../protobuf/holdem/define_pb";
import { ServerMessagePublicCards } from "../../protobuf/holdem/recv_public_cards_pb";
import { ServerMessageStartInfo } from "../../protobuf/holdem/recv_start_info_pb";
import { ServerMessageEnterRoom } from "../../protobuf/holdem/req_enter_room_pb";
import StorageKey from "../../session/StorageKey";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { CardType, CardTypeUtil } from "./../CardTypeUtil";
import { CPlayer } from "./../CPlayer";
import FSMLogicComponent from "./../FSMLogicComponent";
import { GameCache } from "./../GameCache";

import GameUtil, { RoomType } from "./../GameUtil";
import Seat, { SeatUIInfo } from "./../Seat";
import { SeatEmpty, SeatIdle, SeatInsuranc, SeatOperation, SeatWaitOther } from "./../SeatStateHandler";
import TexasGameMessageHandler from "./../TexasGameMessageHandler";
import TexasGameProtocol from "./../TexasGameProtocol";
import { TexasGameState } from "./../TexasGameState";
import TexasGameUtils from "./../TexasGameUtils";
import TexasSMAgency from "./../TexasSMAgency";
import UIAddChipsComponent from "./../ui/UIAddChipsComponent";
import UIOperationComponent, { OperationData } from "./../ui/UIOperationComponent";
import UITexas, { PotInfo, PublicCardInfo } from "./../UITexas";
import { UITexasModel } from "./../UITexasModel";
import { ServerMessageWinner } from "../../protobuf/holdem/recv_winner_pb";
import UIAutoOperationComponent from "../ui/UIAutoOperationComponent";
import Main from "../../Main";
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
    public uirc: UITexas = null;

    public messageHandler: TexasGameMessageHandler = null;

    public texasGameProtocol: TexasGameProtocol = null;

    public GameLogicSMComponent: FSMLogicComponent = null;

    public SMAgency: TexasSMAgency = null;

    public TexasGameUtils: TexasGameUtils = null;

    public listSeat: Seat[] = null;

    public GameState: TexasGameState = null;

    //PlayDeal_TweenSequence: TweenSequence = new TweenSequence;

    /// <summary>
    /// key:客户端seatId
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
    public cards: number[] = null;
    /// <summary>
    /// 已发出第二套公共牌
    /// </summary>
    public secondCards: number[] = null;

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
    public cacheRound: number = 0;
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


    //////////////TexasGameUI的内容先放到这里
    /// <summary>
    /// 马上完成公共牌动画
    /// </summary>
    public stopUpdatePublicCardsAnimation: boolean = false;

    /// <summary>
    /// 等待翻牌结束，播放赢家牌型
    /// </summary>
    public waittingUpdatePublicCardsAnimation: boolean = false;

    /// <summary>
    /// 是否正在播放大牌动画
    /// </summary>
    public isPlayingBigWinAnimation: boolean = false;
    //////////////////////////////////////

    //发牌动画
    sequencePlayDealAnimation: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean } = null;



    sequencePlayFirstRecyclingChipSubAnimation: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean } = null;
    sequencePlayFirstRecyclingChipAnimation: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean } = null;
    sequencePlayRecyclingChipAnimation: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean } = null;
    sequenceUpdatePublicCards: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean } = null;
    sequenceSecondUpdatePublicCards: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean } = null;
    sequencePlayEndPublicCardsAnimation: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean } = null;


    IsDispose: boolean = false;

    constructor() {
        this.messageHandler = new TexasGameMessageHandler(this);
        this.texasGameProtocol = new TexasGameProtocol(this);
        this.GameLogicSMComponent = new FSMLogicComponent();
        this.SMAgency = new TexasSMAgency(this);
        this.TexasGameUtils = new TexasGameUtils(this);
    }

    Enter() {
        UpdateComponent.Add(this.GameLogicSMComponent, this);
        this.listSeat = [];
        this.dicSeatOnlyClient = new Map<number, Seat>();
        this.GameLogicSMComponent.start();
        this.SMAgency.LoadGameStateConf();
    }

    RegisterMsgHandler() {
        this.messageHandler.RegisterMessageHandler();
        this.texasGameProtocol.RegisterMsgHandler();
    }
    RemoveMsgHandler() {
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
        let desk = AssetContext.getAsset("TexasDeskBg" + c[0], AssetFold.texture_TexasUI) as cc.SpriteFrame;
        let table = AssetContext.getAsset("TexasTableBg" + c[1], AssetFold.texture_TexasUI) as cc.SpriteFrame;
        return [desk, table];
    }
    setDeskType(index: number) {
        let sps = this.getDeskSpriteFrames(index);
        this.uirc.desk_bg.spriteFrame = sps[0];
        this.uirc.table_bg.spriteFrame = sps[1];
    }

    public RegiterEnterRoom() {
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_EnterRoom, this.messageHandler.Protocol_Holdem_EnterRoom_Handler, this.messageHandler);
    }
    public UnRegiterEnterRoom() {
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_EnterRoom, this.messageHandler.Protocol_Holdem_EnterRoom_Handler, this.messageHandler);
    }

    public EnterRoom(id) {
        this.TexasGameUtils.EnterRoom(id);
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
            console.log("GameCache.Instance.seat_count", GameCache.Instance.seat_count)
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


        GameCache.Instance.GameStatus = this.gamestatus;

        this.bigIndex = this.GetLocalSeatID(rec.handInfo.bbSeatId);
        this.smallIndex = this.GetLocalSeatID(rec.handInfo.sbSeatId);
        this.bankerIndex = this.GetLocalSeatID(rec.handInfo.buSeatId);
        if (rec.mttProgress == null || !(rec.mttProgress.isBubbleWait && rec.gameStatus == Def.GameStatus.HAND_END)) {
            this.AddPublicCards(rec.handInfo.publicCardsList);
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
            console.log("mSeat >>>> ", this.listSeat);
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

        let LeftOpTime = 0;
        //RepeatedField<ActionLimit> actionLimits = null;
        //RepeatedField<ActionShortcutLimit> actionShortcutLimits = null;
        let actionLimits = null;
        let actionShortcutLimits = null;
        if (rec.operatorList != null && rec.operatorList.length > 0) {
            for (let i = 0; i < rec.operatorList.length; i++) {
                this.operationID = this.GetLocalSeatID(rec.operatorList[i].seatId);
                LeftOpTime = rec.operatorList[i].leftOpTime;
                if (this.GetLocalSeatID(rec.operatorList[i].seatId) == this.mainPlayer.seatID) {
                    actionLimits = rec.operatorList[i].actionsList;
                    actionShortcutLimits = rec.operatorList[i].shortcutsList;
                    this.HandlerInsueranceData(rec.operatorList);//重进房间保险处理
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
        //             UIComponent.Instance.HideNoAnimation(UIType.UIDialog);
        //         }
        //当前操作人
        if (this.operationID != -1) {
            mSeat = this.GetSeatByLocalSeatID(this.operationID);
            if (null != mSeat && null != mSeat.Player) {
                if (mSeat.seatID == this.mainPlayer.seatID && mSeat.Player.userID == this.mainPlayer.userID && this.mainPlayer.isPlaying) {
                    //自己操作中
                    this.HideAutoOperationPanel();   // 隐藏预操作
                    this.ShowOperationPanel(UIOperationComponent.OperationData(actionLimits, actionShortcutLimits));
                }
                else {
                    // 下一个操作不是自己
                    this.HideOperationPanel();
                    if (this.mainPlayer.isPlaying) {
                        // 自己有参与游戏,但allin弃牌不显示
                        if ((this.mainPlayer.actionStatus != Def.Action.FOLD && this.mainPlayer.actionStatus != Def.Action.ALLIN && this.mainPlayer.actionStatus != Def.Action.NONE) && !this.mainPlayer.IsAutoOp) {

                            this.ShowUI(this.uirc.UIAutoOperation, UIAutoOperationComponent, UIAutoOperationComponent.AutoOperationData(this.TexasGameUtils.getAutoOperationCallAmount(rec.handInfo.roundBet)));

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
    /// 保险数据处理
    /// </summary>
    /// <param name="operators"></param> RepeatedField<Operator>
    protected HandlerInsueranceData(operators: Operator.AsObject[]): void {
        //显示玩家买保险动画，及如果有自己，缓存操作数据。
        let CanInsurance: boolean = false;
        let Seat: Seat = null;
        let mOperator: Operator.AsObject = null;


        for (let itemOperator of operators) {
            Seat = this.GetSeatByLocalSeatID(this.GetLocalSeatID(itemOperator.seatId));
            if (null == Seat || null == Seat.Player) {
                continue;
            }
            Seat.Player.playerStatus_insurance = itemOperator.isInsurance;
            Seat.Player.timeLeft_insurance = itemOperator.leftOpTime;
            Seat.Player.delayTimes = itemOperator.delayTimes;
            if (Seat.Player.userID == this.mainPlayer.userID && Seat.Player.playerStatus_insurance) {
                mOperator = itemOperator;
                CanInsurance = true;
            }

            if (Seat.Player.playerStatus_insurance) {
                Seat.FsmLogicComponent.SM.ChangeState(SeatInsuranc.Instance);
            }
        }





        //     TweenCallback mTweenCallback = () => {
        //     if (!CanInsurance || mOperator == null) // 如果可购买保险用户中没有自己，不用往下执行
        //         return;

        //     List < UIInsuranceComponent.WrapTriggedInsuranceData > wrapTriggedInsuranceDatas = new List<UIInsuranceComponent.WrapTriggedInsuranceData>();
        //     UIInsuranceComponent.WrapTriggedInsuranceData mWrapTriggedInsuranceData = null;



        //     foreach(InsurancePotLimit insurancePotLimit in mOperator.InsuranceLimit)
        //     {
        //         mWrapTriggedInsuranceData = new UIInsuranceComponent.WrapTriggedInsuranceData();
        //         mWrapTriggedInsuranceData.outsPerUser = new List<int>();
        //         mWrapTriggedInsuranceData.userNames = new List<string>();
        //         mWrapTriggedInsuranceData.playerCards = new List<List<sbyte>>();
        //         mWrapTriggedInsuranceData.outsCards = new List<RepeatedField<OutsCard>>();
        //         //赋值保险池等数据，
        //         mWrapTriggedInsuranceData.subPot = (sbyte)insurancePotLimit.PotId;
        //         mWrapTriggedInsuranceData.pot = (long)insurancePotLimit.PotAmount;
        //         mWrapTriggedInsuranceData.potTotalCost = (long)insurancePotLimit.Bet;
        //         mWrapTriggedInsuranceData.leastAmount = (long)insurancePotLimit.Min;
        //         mWrapTriggedInsuranceData.mostAmount = (long)insurancePotLimit.Max;
        //         mWrapTriggedInsuranceData.PotUserCount = insurancePotLimit.PotUserCount;
        //         mWrapTriggedInsuranceData.PotLeaderCount = insurancePotLimit.PotLeaderCount;
        //         mWrapTriggedInsuranceData.potAllowOutSelection = insurancePotLimit.Insuranced > 0 ? (sbyte)0 : (sbyte)1;

        //         foreach(UserOuts userOuts in insurancePotLimit.OutsDetail)
        //         {
        //                 Seat ins_Seat = GetSeatByLocalSeatID(GetLocalSeatID(userOuts.SeatId));
        //             if (ins_Seat == null) {
        //                 Log.Error("---------------------Insurance others player is null");
        //                 continue;
        //             }
        //             //有哪些玩家得outs

        //             //需要显示玩家手牌和名字，通过座位号在牌局中缓存座位，获取已下发得手牌和名字。
        //             mWrapTriggedInsuranceData.userNames.Add(ins_Seat.Player.nick);
        //             mWrapTriggedInsuranceData.playerCards.Add(ins_Seat.Player.cards);
        //             //各个玩家
        //             mWrapTriggedInsuranceData.outsPerUser.Add((int)userOuts.OutsCards.length);

        //             //添加所有玩家outs ，在保险界面处理是否平分outs
        //             mWrapTriggedInsuranceData.outsCards.Add(userOuts.OutsCards);
        //         }

        //         wrapTriggedInsuranceDatas.Add(mWrapTriggedInsuranceData);
        //     }
        //     //暂注释，第一次买保险前得动画
        //     //if (Image_InsuranceTips.gameObject.activeInHierarchy)
        //     //{
        //     //    Image_InsuranceTips.gameObject.SetActive(false);
        //     //}
        //     UIComponent.Instance.ShowNoAnimation(UIType.UIInsurance, new UIInsuranceComponent.InsuranceData()
        //         {
        //             publicCards = cards,
        //             triggedDatas = wrapTriggedInsuranceDatas,
        //             timeLeft = (int)mainPlayer.timeLeft_insurance,

        //             delayTimes = mainPlayer.delayTimes
        //         });

        //     //#if (UNITY_EDITOR || UNITY_STANDALONE_WIN) && !ILRuntime
        //     //                // 用于压测，放在UIInsurance启动之后调用
        //     //                RoomHelper.onReqInsuranceTrigged(rec);
        //     //#endif
        // };
        // //暂注释，第一次买保险前得动画
        // //if (rec.length <= 1)
        // //{
        // //    // 当前触发保险次数，如果<=1，则先显示“保险模式”动画，再弹出保险框
        // //    PlayFirstInsurance(mTweenCallback);
        // //    // await WaitGameAnimation(GameAnimation.PlayFirstInsurance);
        // //}
        // //else
        // //{
        // mTweenCallback();
        // //}
    }


    /// <summary>
    /// 刷新分池
    /// </summary>
    public UpdatePots(): void {
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
    public UpdateAlreadAnte(): void {
        //textAlreadAnte.text = $"底池:{alreadAnte}";
        this.uirc.textAlreadAnte.node.active = (this.gamestatus >= 1 && this.gamestatus < 7);
        this.uirc.textAlreadAnte.string = `${CPErrorCode.LanguageDescription(20005)}:${(this.alreadAnte / 100)}`;
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
            info += `\n${CPErrorCode.LanguageDescription(20006)}${StringHelper.getStringDiv100(this.smallBlind)}/${StringHelper.getStringDiv100(this.bigBlind)}(${StringHelper.getStringDiv100(this.groupBet)}) ${straddleStr = this.CurStraddle ? "straddle" : ""}`;
        }
        else {
            info += `\n${CPErrorCode.LanguageDescription(20006)}${StringHelper.getStringDiv100(this.smallBlind)}/${StringHelper.getStringDiv100(this.bigBlind)} ${straddleStr = this.CurStraddle ? "straddle" : ""}`;
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
            let seatUI = this.createSeatUI();
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
            //     mSeat.InitSeatUIInfo(mInfos[tmp], listSeat.length);
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
            UIComponent.open(UIDefine.UIDialogComponent,
                {
                    type: UIDialogComponent.DialogType.CommitCancel,
                    // title = $"余额不足",
                    title: CPErrorCode.LanguageDescription(10025),
                    // content = $"金豆余额不足，请先充值",
                    content: CPErrorCode.LanguageDescription(20010),
                    // contentCommit = "去充豆",
                    contentCommit: CPErrorCode.LanguageDescription(10026),
                    // contentCancel = "取消",
                    contentCancel: CPErrorCode.LanguageDescription(10013),
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
        return AssetContext.getAsset(spriteName, AssetFold.texture_TexasUI);
    }

    //获取气泡相关的spriteframe
    public GetBubbleSpriteBySpriteName(spriteName: string): cc.SpriteFrame {
        return AssetContext.getAsset(spriteName, AssetFold.texture_TexasUI);
    }


    /// <summary>
    /// 获取扑克牌Sprite
    /// </summary>
    /// <param name="spriteName"></param>
    /// <returns></returns>
    public GetPokerSpriteBySpriteName(spriteName: string): cc.SpriteFrame {
        return AssetContext.getAsset(spriteName, AssetFold.texture_Antcard);
    }

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
            let rtween = mSeat.PlayBankerAnimation(tween);
            rtween?.delay(0.2);
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
        let mStartPos: cc.Vec3 = this.uirc.node.convertToWorldSpaceAR(cc.Vec3.ZERO);

        let mIsFirst = true;
        let mTmpIndex = 0;

        let spawn = [];

        for (let i = this.smallIndex, n = i + GameCache.Instance.seat_count; i < n; i++) {
            let index = i % GameCache.Instance.seat_count;
            mSeat = this.listSeat[i];
            if (null == mSeat || null == mSeat.Player || !mSeat.Player.isParticipateInTheGame) continue;
            //spawn.push(cc.tween().sequence(cc.delayTime(0.2 * mTmpIndex), this.listSeat[index].PlayDealAnimation(mStartPos)));
            this.listSeat[index].PlayDealAnimation(0.2 * mTmpIndex, mStartPos);

            tween.then(cc.callFunc(() => {
                let ctween = this.listSeat[index].PlayDealAnimation(0.2 * mTmpIndex, mStartPos);
                ctween.start();
            }));

            if (i == n - 1) {
                tween.delay(0.2 * mTmpIndex + 0.4);
            }
            mTmpIndex++;
        }

        if (null != tweenCallback) {
            cc.log("运动完成");
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

        ProtocolAgency.Send(
            {
                protocol: Protocol_Holdem_Action,
                RoomID: GameCache.Instance.room_id,
                MatchID: GameCache.Instance.match_id,
                body: Protocol_Holdem_Action.Request(
                    {
                        room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                        action: action,
                        amount: anteNumber

                    })
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
        this.HideUI(this.uirc.UIAutoOperation);
    }
    /// <summary>
    /// 展示操作面板
    /// </summary>
    /// <param name="operationData"></param>
    /// <param name="delay"></param> UIOperationComponent.OperationData
    public ShowOperationPanel(operationData: OperationData, delay: number = 0): void {
        if (operationData?.actionLimits == null || operationData?.actionLimits.length <= 0) {
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
        this.uirc.buttonDelay.active = true;
        this.delayCount = delay;
        this.UpdateDelayBtn();
        this.ShowUI(this.uirc.UIOperation, UIOperationComponent, operationData);
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
        this.uirc.buttonDelay.active = false;
        if (this.uirc.UIOperation.activeInHierarchy) {
            this.HideUI(this.uirc.UIOperation);
        }
    }




    /// <summary>
    /// 回收筹码位置的世界坐标
    /// </summary>
    /// <returns></returns>
    public GetRecyclingChipPosV3(): cc.Vec3 {
        //return rc.transform.TransformPoint(this.gameUI.textAlreadAnte.transform.localPosition);
        return this.uirc.node.convertToWorldSpaceAR(this.uirc.textAlreadAnte.node.position);
    }
    /// <summary>
    /// 当前玩法的手牌数量
    /// </summary>
    public get HandCards(): number {
        return 2;
    }

    /// <summary>
    /// 添加公共牌Id
    /// </summary>
    /// <param name="list"></param>
    protected AddPublicCards(list: number[]): void {
        // 判断一下cards的合法性
        if (null == this.cards) this.cards = [];

        cc.log(this.cards.length, this.uirc.listCards.length);

        if (this.cards.length < this.uirc.listCards.length) {
            for (let i = 0, n = this.uirc.listCards.length - this.cards.length; i < n; i++) {
                this.cards.push(-1);
            }
        }
        else if (this.cards.length > this.uirc.listCards.length) {
            cc.warn(`Add PublicCards Error cards.length:${this.cards.length}`);
            return;
        }

        let mStartIndex: number = 0;
        for (let i = 0, n = this.cards.length; i < n; i++) {
            if (this.cards[i] == -1) {
                mStartIndex = i;
                break;
            }
        }

        if (list.length > this.cards.length - mStartIndex) {
            cc.warn(`Add PublicCards Error index:{mStartIndex}, list.length:${list.length}`);
            return;
        }

        for (let i = 0, n = list.length; i < n; i++) {
            this.cards[i + mStartIndex] = list[i];
        }
        cc.log("this.cards : ", this.cards);
    }



    /// <summary>
    /// 获取当前已发公共牌数量 第一套
    /// </summary>
    /// <returns></returns>
    public GetCurPublicCardsCount(): number {
        if (null == this.cards)
            this.ResetPublicCardsId();

        for (let i = 0, n = this.cards.length; i < n; i++) {
            if (this.cards[i] == -1)
                return i;
        }
        // 最多5张
        return 5;
    }
    /// <summary>
    /// 重置公共牌Id
    /// </summary>
    public ResetPublicCardsId(): void {
        if (null == this.cards)
            this.cards = [];
        if (this.cards.length == this.uirc.listCards.length) {
            for (let i = 0, n = this.uirc.listCards.length; i < n; i++) {
                this.cards[i] = -1;
            }
        }
        else {
            this.cards = [];
            for (let i = 0, n = this.uirc.listCards.length; i < n; i++) {
                this.cards.push(-1);
            }
        }
    }

    /// <summary>
    /// 重置公共牌Id
    /// </summary>
    public ResetSecondPublicCardsId(): void {
        if (null == this.secondCards)
            this.secondCards = [];

        if (this.secondCards.length == this.uirc.listSecondCards.length) {
            for (let i = 0, n = this.uirc.listSecondCards.length; i < n; i++) {
                this.secondCards[i] = -1;
            }
        }
        else {
            this.secondCards = [];
            for (let i = 0, n = this.uirc.listSecondCards.length; i < n; i++) {
                {
                    this.secondCards.push(-1);
                }
            }
        }
    }


    /// <summary>
    /// 获取当前已发公共牌数量 第二套
    /// </summary>
    /// <returns></returns>
    public GetCurSecondPublicCardsCount(): number {
        if (null == this.secondCards)
            this.ResetSecondPublicCardsId();

        for (let i = 0, n = this.secondCards.length; i < n; i++) {
            if (this.secondCards[i] == -1)
                return i;
        }

        // 最多5张
        return 5;
    }





    /// <summary>
    /// 公共牌
    /// </summary>
    /// <param name="source"></param>
    public HandleGetPublicCards(source: ServerMessagePublicCards.AsObject): void {
        //UIComponent.Instance.HideNoAnimation(UIType.UIInsurance);
        //UIComponent.Instance.Remove(UIType.UIAgreeSecondPcs);
        this.autoCall = false;
        this.autoAllin = false;
        this.autoCheck = false;
        this.autoFold = false;
        let iCount: number = this.GetCurPublicCardsCount();  // 要在更新公共牌前拿数量
        if (this.GameState == TexasGameState.HandFlop && iCount == 0) {
            this.AddPublicCards(source.publicCardsArrayList);
        }
        else if (this.GameState == TexasGameState.HandTurn && iCount == 3) {
            this.AddPublicCards(source.publicCardsArrayList);
        }
        else if (this.GameState == TexasGameState.HandRiver && iCount == 4) {
            this.AddPublicCards(source.publicCardsArrayList);
        }
        else {
            cc.warn("public card error：" + this.GameState + " Cur Public Cards Count :" + iCount);
        }

        let lastPubicCard: number = source.publicCardsArrayList[source.publicCardsArrayList.length - 1];
        this.IsSecondPsc = source.extPublicCardsArrayList != null && source.extPublicCardsArrayList.length > 0;
        let bust: boolean = false;
        let mRoomType: RoomType = GameCache.Instance.room_type;
        if (this.cacheTrunOutsCards != null) {

            this.cacheTrunOutsCards.forEach((value, key) => {
                if (value.includes(lastPubicCard)) {
                    bust = true;
                }
                if (this.GetLocalSeatID(key) == this.mainPlayer.seatID && value.includes(lastPubicCard) && this.cacheBuyActiveAmount > 0) {
                    //this.ShowInsuranceTipJieSuan(GameUtil.GetOddsByPlayerNum(cacheBuyInsurancePotUserCount, item.Value.length) * cacheBuyActiveAmount);
                }
            })
        }
        if (bust) {
            //爆牌动画
            //this.ShowBustCardAnimation();
        }
        //this.ClearSeatBubble(false);
        let mCacheSeat: Seat = null;
        for (let i = 0, n = this.listSeat.length; i < n; i++) {
            mCacheSeat = this.listSeat[i];
            if (null == mCacheSeat || null == mCacheSeat.Player || !mCacheSeat.Player.isPlaying)
                continue;

            mCacheSeat.Player.anteNumber = 0;
            mCacheSeat.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
        }
        let opSeatID: number = -1;
        if (source.nextOperator != null) {
            opSeatID = this.GetLocalSeatID(source.nextOperator.seatId);
        }

        //TweenCallback mTweenCallback = () => {
        let mTweenCallback = () => {

            let mSeat: Seat = this.GetSeatByLocalSeatID(opSeatID);
            if (null == mSeat)
                return;

            if (mSeat.seatID == this.mainPlayer.seatID && mSeat.Player.userID == this.mainPlayer.userID && mSeat.Player.isPlaying) {
                // 到自己操作
                this.HideAutoOperationPanel();

                // 非托管
                if (!this.mainPlayer.IsAutoOp) {
                    this.ShowOperationPanel(UIOperationComponent.OperationData(source.nextOperator.actionsList, source.nextOperator.shortcutsList));
                }
            }
            else {
                // 下一个操作不是自己
                this.HideOperationPanel();
                // 非弃牌、非ALL IN、非空闲等待下一局、非托管
                if (this.mainPlayer.isPlaying && !this.mainPlayer.IsAutoOp) {
                    // 预操作UI
                    this.ShowUI(this.uirc.UIAutoOperation, UIAutoOperationComponent, UIAutoOperationComponent.AutoOperationData(this.TexasGameUtils.getAutoOperationCallAmount(0)));
                }
                else {
                    // 无预操作UI
                    this.HideAutoOperationPanel();
                }

            }
            mSeat.FsmLogicComponent.SM.ChangeState(SeatOperation.Instance);
        };

        //TweenCallback SecondTweenCallback = () => {
        let SecondTweenCallback = () => {
            if (source.extPublicCardsArrayList != null && source.extPublicCardsArrayList.length > 0) {

                this.AddSecondPublicCards(source.extPublicCardsArrayList);
                //执行第二套牌动画
                this.UpdateSecondPublicCards(iCount, source.extPublicCardsArrayList.length, null);

            }
            else {
                this.IsSecondPsc = false;
            }
        };
        this.stopUpdatePublicCardsAnimation = false;

        console.log("当前开始翻牌:", iCount);

        if (iCount == 0) {

            this.PlayFirstRecyclingChipAnimation(() => {

                this.PlayFirstRecyclingChipSubAnimation(() => {
                    this.UpdatePublicCards(iCount, mTweenCallback, SecondTweenCallback);
                    if (this.stopUpdatePublicCardsAnimation && null != this.sequenceUpdatePublicCards) {
                        this.sequenceUpdatePublicCards.complete(true);
                    }

                    this.stopUpdatePublicCardsAnimation = false;
                });
                if (this.stopUpdatePublicCardsAnimation && null != this.sequencePlayFirstRecyclingChipSubAnimation &&
                    this.sequencePlayFirstRecyclingChipSubAnimation.IsPlaying) {
                    this.sequencePlayFirstRecyclingChipSubAnimation.complete(true);
                }
            });
        }
        else {
            if (this.isAllinGetPlayerCards && this.insurance) {
                // 保险就是多事，特殊处理一下。来了三张公共牌，动画播放中，没有保险可买，马上又来了一张公共牌。
                this.UpdatePublicCards(iCount, mTweenCallback, SecondTweenCallback);
                if (this.stopUpdatePublicCardsAnimation && null != this.sequenceUpdatePublicCards && this.sequenceUpdatePublicCards.IsPlaying) {
                    this.sequenceUpdatePublicCards.complete(true);
                }

                this.stopUpdatePublicCardsAnimation = false;
            }
            else {
                this.PlayRecyclingChipAnimation(() => {
                    this.UpdatePublicCards(iCount, mTweenCallback, SecondTweenCallback);
                    if (this.stopUpdatePublicCardsAnimation && null != this.sequenceUpdatePublicCards && this.sequenceUpdatePublicCards.IsPlaying) {
                        this.sequenceUpdatePublicCards.complete();
                    }
                    this.stopUpdatePublicCardsAnimation = false;
                });
            }
        }
    }

    /// <summary>
    /// 刷新公共牌 第一套
    /// </summary>
    protected UpdatePublicCards(startIndex: number, tweenCallback: Function, SecondtweenCallback: Function): void {
        if (null == this.cards)
            return;

        let mCacheCount: number = this.GetCurPublicCardsCount();

        if (mCacheCount == 0) {
            this.ClearPublicCardsUI();
            return;
        }

        // 公共牌动画
        this.waittingUpdatePublicCardsAnimation = true;
        this.sequenceUpdatePublicCards = { tween: cc.tween(this.uirc.node), IsPlaying: true };
        let tween: cc.Tween = this.sequenceUpdatePublicCards.tween;

        this.fuck4thPCardByInsuranceState = 0;

        if (startIndex == 0) {
            //第0张牌，设定第1,2张牌位置都在0号位置
            let index = 2;
            let PublicCardInfo: PublicCardInfo = this.uirc.listCards[index];
            PublicCardInfo.cardId = this.cards[index];
            PublicCardInfo.imageCard.node.color = cc.Color.WHITE;
            PublicCardInfo.imageCard.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(-1));
            PublicCardInfo.trans.setPosition(this.listDefaultPublicCardsLPos[0]);
            PublicCardInfo.trans.setScale(cc.Vec3.ONE);
            PublicCardInfo.trans.active = true;
            tween.then(
                cc.callFunc(() => {
                    cc.tween(PublicCardInfo.trans).to(.1, { scaleX: 0 }).call(() => {
                        PublicCardInfo.imageCard.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(PublicCardInfo.cardId));
                    }).start();
                })
            );
            tween.delay(0.1);
            tween.then(cc.callFunc(() => {
                //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_CHAT);
            }));
            tween.then(cc.callFunc(() => {
                cc.tween(PublicCardInfo.trans).to(0.1, { scaleX: 1 }).start();
            }));
            tween.delay(0.1);
            tween.delay(0.4);

            for (let i = 0; i < 3; i++) {
                PublicCardInfo = this.uirc.listCards[i];
                let trans = PublicCardInfo.trans;
                let imageCard = PublicCardInfo.imageCard;
                let cardId = this.cards[i];
                imageCard.node.color = cc.Color.WHITE;
                imageCard.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(cardId));
                trans.setPosition(this.listDefaultPublicCardsLPos[0]);
                trans.setScale(cc.Vec3.ONE);
                let move_pos = this.listDefaultPublicCardsLPos[i];
                tween.then(cc.callFunc(() => {
                    trans.active = true;
                    cc.log(`${i}张牌`, cardId, trans, move_pos.toString());
                    cc.tween(trans).to(.4, { position: move_pos }).start();
                }))
                if (i == 2) {
                    tween.delay(0.4);
                }
            }
            if (mCacheCount == 5) {
                // 一下下发5张
                for (let i = 3; i < mCacheCount; i++) {
                    PublicCardInfo = this.uirc.listCards[i];
                    let trans = PublicCardInfo.trans;
                    let imageCard = PublicCardInfo.imageCard;
                    let cardId = this.cards[i];
                    PublicCardInfo.cardId = cardId;
                    imageCard.node.color = cc.Color.WHITE;
                    imageCard.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(-1));
                    trans.setPosition(this.listDefaultPublicCardsLPos[i]);
                    tween.then(cc.callFunc(() => {
                        trans.active = true;
                        cc.tween(trans).to(.2, { scaleX: 0 }).call(() => {
                            imageCard.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(cardId));
                        }).start();
                    }))
                    tween.delay(.2);

                    tween.then(cc.callFunc(() => {
                        //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_CHAT);
                        cc.tween(trans).to(.2, { scaleX: 1 }).start();
                    }));
                    tween.delay(.2);
                }
            }
        }
        else {
            for (let i = startIndex, n = mCacheCount; i < n; i++) {
                let PublicCardInfo: PublicCardInfo = this.uirc.listCards[i];

                let trans = PublicCardInfo.trans;
                let imageCard = PublicCardInfo.imageCard;
                let cardId = this.cards[i];
                PublicCardInfo.cardId = cardId;
                trans.setPosition(this.listDefaultPublicCardsLPos[i]);
                trans.setScale(cc.Vec3.ONE);
                imageCard.node.color = cc.Color.WHITE;
                imageCard.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(-1));
                tween.then(cc.callFunc(() => {
                    trans.active = true;
                    cc.tween(trans).to(.2, { scaleX: 0 }).call(() => {
                        imageCard.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(cardId));
                    }).start();
                }));
                tween.delay(.2);

                tween.then(cc.callFunc(() => {
                    //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_CHAT);
                    cc.tween(trans).to(.2, { scaleX: 1 }).start();
                }));
                tween.delay(.2);
            }
            let mHidePublicCardInfo: PublicCardInfo = null;
            for (let i = mCacheCount, n = this.uirc.listCards.length; i < n; i++) {
                mHidePublicCardInfo = this.uirc.listCards[i];
                mHidePublicCardInfo.cardId = -1;
                mHidePublicCardInfo.trans.active = false;
            }
        }

        // 参与了牌局，才能看到牌型提示
        let mClientSeat: Seat = this.GetSeatByClientId(0);

        if (null != mClientSeat.Player && mClientSeat.Player.userID == this.mainPlayer.userID && this.mainPlayer.isParticipateInTheGame) {
            if (null != tweenCallback) {
                tween.call(() => {

                    let highlightCards_ref = { highlightCards: null };
                    let cardType: CardType = this.GetCardType(highlightCards_ref, this.cards);
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

                    tweenCallback();

                    this.waittingUpdatePublicCardsAnimation = false;


                    this.sequenceUpdatePublicCards.IsPlaying = false;

                });
            }
            else {
                tween.call(() => {

                    let highlightCards_ref = { highlightCards: null };
                    let cardType: CardType = this.GetCardType(highlightCards_ref, this.cards);
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

                    this.waittingUpdatePublicCardsAnimation = false;

                    this.sequenceUpdatePublicCards.IsPlaying = false;
                });
            }
        }
        else {
            if (null != tweenCallback) {
                tween.call(() => {
                    tweenCallback();
                    this.waittingUpdatePublicCardsAnimation = false;
                    this.sequenceUpdatePublicCards.IsPlaying = false;
                });
            }
            else {
                tween.call(() => {
                    this.waittingUpdatePublicCardsAnimation = false;
                    this.sequenceUpdatePublicCards.IsPlaying = false;
                });

            }
        }
        if (mCacheCount == 5 && SecondtweenCallback != null && this.IsSecondPsc) {

            tween.delay(0.5);
            tween.call(() => {
                SecondtweenCallback();
                this.sequenceUpdatePublicCards.IsPlaying = false;
            });
        }
        tween.start();
    }

    /// <summary>
    /// 刷新公共牌 第二套
    /// </summary>
    protected UpdateSecondPublicCards(CardsCount: number, secondCardsCount: number, tweenCallback: Function): void {
        if (null == this.cards)
            return;

        let CacheCount = this.GetCurSecondPublicCardsCount();

        if (CacheCount == 0) {
            this.ClearSecondPublicCardsUI();
            return;
        }
        // 公共牌动画
        //this.sequenceSecondUpdatePublicCards = DOTween.Sequence();
        this.sequenceSecondUpdatePublicCards = { tween: cc.tween(this.uirc.node), IsPlaying: true };
        let tween: cc.Tween = this.sequenceSecondUpdatePublicCards.tween;
        //第二套牌为五张牌时
        if (secondCardsCount == 5) {
            //#region 第三张牌翻牌动画
            let PublicCardInfo: PublicCardInfo = null;
            PublicCardInfo = this.uirc.listSecondCards[2];//三张一起发，从第三张显示翻牌动画
            PublicCardInfo.imageCard.node.color = cc.Color.WHITE;
            PublicCardInfo.cardId = this.secondCards[2];
            PublicCardInfo.imageCard.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(-1));
            PublicCardInfo.trans.setPosition(this.listDefaultSecondPublicCardsLPos[0]);
            PublicCardInfo.trans.setScale(cc.Vec3.ONE);
            PublicCardInfo.trans.active = true;
            let CacheCardId = PublicCardInfo.cardId;
            let CacheImage: cc.Sprite = PublicCardInfo.imageCard;
            let CacheTrans = PublicCardInfo.trans;
            tween.then(cc.callFunc(() => {
                cc.tween(CacheTrans).to(.1, { scaleX: 0 }).then(cc.callFunc(() => {
                    CacheImage.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(CacheCardId));
                    //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_CHAT);
                })).to(.1, { scaleX: 1 }).call(() => {
                    let mPublicCardInfo0: PublicCardInfo = this.uirc.listSecondCards[0];
                    mPublicCardInfo0.imageCard.node.color = cc.Color.WHITE;
                    mPublicCardInfo0.cardId = this.secondCards[0];
                    mPublicCardInfo0.imageCard.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(mPublicCardInfo0.cardId));
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
                PublicCardInfo = this.uirc.listSecondCards[i];
                PublicCardInfo.imageCard.node.color = cc.Color.WHITE;
                PublicCardInfo.cardId = this.secondCards[i];
                if (i != 2) {
                    PublicCardInfo.imageCard.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(PublicCardInfo.cardId));
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
                                sCards.push(...this.secondCards);
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
            for (let i = 3; i < secondCardsCount; i++) {
                let cardTypeIndex = i;
                PublicCardInfo = this.uirc.listSecondCards[i];
                PublicCardInfo.imageCard.node.color = cc.Color.WHITE;
                PublicCardInfo.cardId = this.secondCards[i];
                PublicCardInfo.imageCard.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(-1));
                PublicCardInfo.trans.setPosition(this.listDefaultSecondPublicCardsLPos[i]);
                let mCacheTrans = PublicCardInfo.trans;
                let mCacheCardId1 = PublicCardInfo.cardId;
                let mCacheImage1 = PublicCardInfo.imageCard;

                tween.then(cc.callFunc(() => {
                    mCacheTrans.active = true;
                    cc.tween(mCacheTrans).to(.2, { scaleX: 0 }).then(cc.callFunc(() => {
                        mCacheImage1.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(mCacheCardId1));
                        //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_CHAT);
                    })).to(.2, { scaleX: 1 }).call(() => {
                        if (cardTypeIndex == 3) {
                            let sCards = []
                            sCards.push(...this.secondCards);
                            sCards[cardTypeIndex + 1] = -1;

                            this.UpdateSecondPublicCardsCardType(sCards);
                        }
                        else {
                            this.UpdateSecondPublicCardsCardType(this.secondCards);
                        }
                    }).start();
                }))
            }
            //#endregion
        }
        else {
            for (let i = 0; i < CacheCount - secondCardsCount; i++) {
                let cardTypeIndex = i;
                let PublicCardInfo: PublicCardInfo = this.uirc.listSecondCards[i];
                PublicCardInfo.cardId = this.secondCards[i];
                PublicCardInfo.trans.setPosition(this.listDefaultPublicCardsLPos[i]);
                PublicCardInfo.trans.setScale(cc.Vec3.ONE);
                PublicCardInfo.imageCard.node.color = cc.Color.WHITE;
                PublicCardInfo.imageCard.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(this.secondCards[i]));
                let mCacheCardId = PublicCardInfo.cardId;
                let mCacheImage = PublicCardInfo.imageCard;
                let mCacheTrans = PublicCardInfo.trans;
                let CacheDefaultPublicCardsLPos = cc.v2(this.listDefaultSecondPublicCardsLPos[i].x, this.listDefaultSecondPublicCardsLPos[i].y);
                mCacheTrans.active = true;
                tween.then(cc.callFunc(() => {

                    cc.tween(mCacheTrans).to(.2, { scaleX: 1.2 }).then(cc.callFunc(() => {
                        //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_CHAT);
                    })).parallel(cc.scaleTo(.2, 1), cc.moveTo(0.4, CacheDefaultPublicCardsLPos)).then(cc.callFunc(() => {
                        if (cardTypeIndex == 2) {
                            let sCards = [];
                            sCards.push(...this.secondCards);
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
            for (let i = CacheCount - secondCardsCount, n = CacheCount; i < n; i++) {
                let cardTypeIndex = i;
                let PublicCardInfo: PublicCardInfo = this.uirc.listSecondCards[i];
                PublicCardInfo.cardId = this.secondCards[i];
                PublicCardInfo.trans.setPosition(this.listDefaultSecondPublicCardsLPos[i]);
                PublicCardInfo.trans.setScale(cc.Vec3.ONE);
                PublicCardInfo.imageCard.node.color = cc.Color.WHITE;
                PublicCardInfo.imageCard.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(-1));
                let mCacheCardId = PublicCardInfo.cardId;
                let mCacheImage = PublicCardInfo.imageCard;
                let mCacheTrans = PublicCardInfo.trans;

                tween.then(cc.callFunc(() => {
                    mCacheTrans.active = true;
                    cc.tween(mCacheTrans).to(.2, { scaleX: 0 }).then(cc.callFunc(() => {
                        mCacheImage.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(mCacheCardId));
                        //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_CHAT);
                    })).to(.2, { scaleX: 1 }).call(() => {
                        if (cardTypeIndex == 3) {
                            let sCards = [];
                            sCards.push(...this.secondCards);
                            sCards[cardTypeIndex + 1] = -1;
                            sCards[cardTypeIndex + 2] = -1;
                            this.UpdateSecondPublicCardsCardType(sCards);
                        }
                        else {
                            this.UpdateSecondPublicCardsCardType(this.secondCards);
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
    protected AddSecondPublicCards(list: number[]): void {
        // 判断一下cards的合法性
        if (null == this.secondCards)
            this.secondCards = []

        this.secondCards = [];
        for (let i = 0; i < this.uirc.listSecondCards.length; i++) {
            this.secondCards.push(-1);
        }
        if (list.length < this.uirc.listSecondCards.length) {
            for (let i = 0, n = this.uirc.listSecondCards.length - list.length; i < n; i++) {
                this.secondCards[i] = this.cards[i];
            }
            for (let i = 0; i < list.length; i++) {
                this.secondCards[i + this.uirc.listSecondCards.length - list.length] = list[i];
            }
        }
        else {
            for (let i = 0, n = list.length; i < n; i++) {
                this.secondCards[i] = list[i];
            }
        }
    }
    /// <summary>
    /// 播放首次收筹码到底池动画
    /// </summary>Sequence
    private PlayFirstRecyclingChipAnimation(tweenCallback) {
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
    private PlayRecyclingChipAnimation(tweenCallback: Function): void {
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
        for (let i = 0, n = this.uirc.listCards.length; i < n; i++) {
            for (let j = 0, m = mTmpCardSorts[mWinnerIndex].Count; j < m; j++) {
                if (mCacheCardIds.includes(this.uirc.listCards[i].cardId))
                    continue;
                if (mTmpCardSorts[mWinnerIndex][j] > 4 || mTmpCardSorts[mWinnerIndex][j] < 0)
                    continue;

                if (this.uirc.listCards[i].cardId == GameCache.Instance.CurGame.cards[mTmpCardSorts[mWinnerIndex][j]]) {
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

        if (this.waittingUpdatePublicCardsAnimation) {

            //sequencePlayEndPublicCardsAnimation.SetDelay(0.5f);
        }
        else {

        }
    }
    /// <summary>
    /// 获取本手结算手牌
    /// </summary>
    /// <param name="obj"></param>
    /// <param name="index"></param>
    /// <returns></returns>
    public GetHandCardsAtRecvWinner(rec: ServerMessageWinner.AsObject, index: number): number[] {

        let result = rec.resultsList[index];

        return [result.myCardsList?.[0] || 0, result.myCardsList?.[1] || 0];
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

    private PlayFirstRecyclingChipSubAnimation(tweenCallback?: Function): void {
        this.fuck4thPCardByInsuranceState = 2;

        let mObj: cc.Node = null;
        let mPotInfo: PotInfo = null;

        if (this.uirc.listPotInfo.length == 0) {
            mObj = cc.instantiate(this.uirc.transAllPot);
            mObj.parent = this.uirc.transAllPot.parent;
            mObj.setPosition(GameUtil.TexasPots[0]);
            //mObj.transform.localRotation = Quaternion.identity;
            mObj.setScale(cc.Vec3.ONE);
            mObj.name = `"Pot${0}`;

            mPotInfo = new PotInfo(mObj);
            this.uirc.listPotInfo.push(mPotInfo);
        }
        else {
            mPotInfo = this.uirc.listPotInfo[0];
        }
        mPotInfo.textPot.string = StringHelper.getStringDiv100(this.alreadAnte);

        mPotInfo.trans.active = true;

        if (null != tweenCallback) {
            this.UpdatePots();
            tweenCallback();
        }
        else {
            this.UpdatePots();
        }
    }
    /// <summary>
    /// 刷新加时按钮样式
    /// </summary>
    public UpdateDelayBtn(): void {
        this.HideBtnDelay(true);
        if (this.delayCount >= 2) {
            this.uirc.buttonDelay.getChildByName("BtnArea").getComponent(cc.Button).interactable = false;
            this.uirc.buttonDelay.getChildByName("timetext").getComponent(cc.Label).string = "0";
            this.uirc.buttonDelay.getChildByName("timetext").color = new cc.Color(255, 255, 255, 178.5);
            this.uirc.buttonDelay.getChildByName("Text_DelayTip").color = new cc.Color(255, 255, 255, 178.5);
        }
        else {
            this.uirc.buttonDelay.getChildByName("BtnArea").getComponent(cc.Button).interactable = true;
            //buttonDelay.gameObject.transform.Find("Image_DelayGold").gameObject.SetActive(true);
            this.uirc.buttonDelay.getChildByName("timetext").color = new cc.Color(86, 53, 29, 255);
            this.uirc.buttonDelay.getChildByName("Text_DelayTip").color = new cc.Color(221, 186, 130, 255);
            this.uirc.buttonDelay.getChildByName("Text_DelayTip").getComponent(cc.Label).string = `${StringHelper.getStringDiv100(this.TexasGameUtils.AddTimeCost())}`;
            this.uirc.buttonDelay.getChildByName("timetext").getComponent(cc.Label).string = this.delayCount > 0 ? "20" : "30";
        }
    }
    public HideBtnDelay(isActive: boolean): void {
        this.uirc.buttonDelay.active = isActive;
    }




    /// <summary>
    /// 设置公共牌Id
    /// </summary>
    public SetPublicCardInfosId(): void {
        let mPublicCardInfo: PublicCardInfo = null;
        for (let i = 0, n = this.cards.length; i < n; i++) {
            mPublicCardInfo = this.uirc.listCards[i];
            mPublicCardInfo.cardId = this.cards[i];
        }
    }

    /// <summary>
    /// 显示查看更多公共牌
    /// </summary>
    public ShowSeeMorePublic(): void {
        if (!this.mainPlayer.isParticipateInTheGame)
            return;

        if (this.GetCurPublicCardsCount() == 5)
            return;

        let mCost = GameUtil.GetSeeMoreCost(this.smallBlind / 100 ^ 0);
        this.uirc.textSeeMorePublicGold.string = `${StringHelper.getStringDiv100(mCost)}`;

        if (this.GetCurPublicCardsCount() == 0) {
            // textSeeMorePublic.text = $"查看翻牌";
            this.uirc.textSeeMorePublic.string = CPErrorCode.LanguageDescription(10018);
        }
        else if (this.GetCurPublicCardsCount() == 3) {
            // textSeeMorePublic.text = $"查看转牌";
            this.uirc.textSeeMorePublic.string = CPErrorCode.LanguageDescription(10019);
        }
        else {
            // textSeeMorePublic.text = $"查看河牌";
            this.uirc.textSeeMorePublic.string = CPErrorCode.LanguageDescription(10020);
        }
        if (GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit)//MTT没有查看翻牌
        {
            //this.uirc.buttonSeeMorePublic.getChildByName("BtnArea").getComponent(cc.Button).interactable = true;
            this.uirc.buttonSeeMorePublic.active = true;
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
            PublicCardInfo.cardId = -1;
            PublicCardInfo.imageCard.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(PublicCardInfo.cardId));
            PublicCardInfo.imageSelect.node.active = false;
            PublicCardInfo.trans.setPosition(listDefaultPublicCardsLPos[i]);
            PublicCardInfo.trans.setScale(cc.Vec3.ONE);
            PublicCardInfo.trans.active = false;
        }
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
    protected ClearPublicCardsUI() {
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
    protected ClearSecondPublicCardsUI(): void {
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
    private ShowAddChips(): void {

        this.ShowUI(this.uirc.UIAddChips.node, UIAddChipsComponent,
            {
                bigBlind: this.bigBlind,
                smallBlind: this.smallBlind,
                currentMinRate: this.currentMinRate,
                currentMaxRate: this.currentMaxRate,
                totalCoin: GameCache.Instance.gold,
                tableChips: this.mainPlayer.chips
            });
    }

    /// <summary>
    /// 牌桌玩家信息
    /// </summary>
    /// <param name="userId"></param>
    public CheckPlayerInfo(userId: number, play: CPlayer = null): void {
        UIComponent.open(UIDefine.UITexasPlayerInfoComponent, [userId, false, play], Main.Marquee);
    }

    public HideSeeMorePublic(): void {
        this.uirc.buttonSeeMorePublic.active = false;
    }

    public HideSeeMorePublicTips(): void {
        this.uirc.imageSeeMorePublicTips.active = false;
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
        if (this.listSeat) {
            while (this.listSeat.length) {
                let mSeat: Seat = this.listSeat.pop();
                if (mSeat?.Player) {
                    mSeat.Player.Dispose();
                    mSeat.Player = null;
                }
                this.removeSeatUI(mSeat?.ui);
                mSeat?.Clear();
            }
        }
    }

    /**
     * 展示UI
     * @param node 
     * @param component 
     * @param param 
     */
    ShowUI<T>(node: cc.Node, component: { new(): T }, param?: Param<T, "ParamType">) {
        node.active = true;
        let ui_component: UIBase = node.getComponent(component);
        ui_component?.onShow(param);
    }
    /**
     * 隐藏UI
     * @param node
     */
    HideUI(node: cc.Node) {
        node.active = false;
    }

    //创建座位UI
    createSeatUI() {
        if (this.seatUI_pool.length) return this.seatUI_pool.pop();
        return cc.instantiate(this.uirc.Seat);
    }
    //移除座位UI
    removeSeatUI(seatUI: cc.Node) {
        seatUI && (seatUI.parent = null);
        seatUI && this.seatUI_pool.push(seatUI);
        cc.log("移除 seatUI ", seatUI);
    }


    /**
     * 退出
     */
    Dispose() {

        if (this.IsDispose) {
            return;
        }

        this.RemoveMsgHandler();

        this.ClearAllData();

        this.ClearAllPlayers();

        //this.KillAllTweener();

        // 清空公共牌
        if (null != this.uirc.listCards)
            this.uirc.listCards = [];

        // 清空座位
        if (null != this.listSeat) {
            for (let i = 0; i < this.listSeat.length; i++) {
                this.listSeat[i]?.Dispose();
            }
            this.listSeat = null;
        }

        // 清空座位(客户端标记)
        if (null != this.dicSeatOnlyClient) {
            this.dicSeatOnlyClient.clear();
            this.dicSeatOnlyClient = null;
        }

        // 清空分池
        if (null != this.uirc.listPotInfo) {
            this.uirc.listPotInfo = null;
        }

        // 清空玩家自己
        if (null != this.mainPlayer) {
            this.mainPlayer.Dispose();
            this.mainPlayer = null;
        }

        // 卸载牌局内已加载过的ab
        // if (null != settingAbnames && settingAbnames.Count > 0) {
        //     ResourcesComponent mResourcesComponent = Game.Scene.ModelScene.GetComponent<ResourcesComponent>();
        //     for (int i = 0, n = settingAbnames.Count; i < n; i++)
        //     {
        //         mResourcesComponent.UnloadBundle(settingAbnames[i]);
        //     }
        //     settingAbnames.Clear();
        //     settingAbnames = null;
        // }

        if (this.GameLogicSMComponent != null) {
            this.GameLogicSMComponent.stop();
        }

        //GameStatusRestoreHandler = null;

        //this.IsExit = true;
    }


}
