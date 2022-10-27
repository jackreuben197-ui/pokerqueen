import PublicHelper from "../../helper/PublicHelper";
import i18nComponent from "../../i18n/i18nComponent";
import { i18nMgr } from "../../i18n/i18nMgr";
import ProtocolAgency from "../../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../../net/websocket/ProtocolCode";
import { Def, MTTInfo, Player } from "../../protobuf/holdem/define_pb";
import { ClientMessageAddOn } from "../../protobuf/holdem/req_add_on_pb";
import { ServerMessageEnterRoom } from "../../protobuf/holdem/req_enter_room_pb";
import { GameCache } from "../GameCache";
import Seat from "../seat/Seat";
import { MTT_GameType } from "../util/MTTGameUtil";
import TexasGame from "./TexasGame";

enum MTTMatchStatus // mtt比赛状态
{
    /// <summary>
    /// 未开赛
    /// </summary>
    Created,
    /// <summary>
    /// 比赛中
    /// </summary>
    Running,
    /// <summary>
    /// 已关闭
    /// </summary>
    Closed,
    /// <summary>
    /// 已取消
    /// </summary>
    Cancel,
}
enum MTTPlayerStatus {
    /// <summary>
    /// 玩家未报名，等待开放报名
    /// </summary>
    WaitingApply,
    /// <summary>
    /// 玩家未报名，当前可以报名（赛前报名阶段)
    /// </summary>
    CanApplyNotStart,
    /// <summary>
    /// 玩家未报名，当前可以报名（延迟报名阶段）
    /// </summary>
    CanApplyDelay,
    /// <summary>
    /// 玩家已报名，还未开赛
    /// </summary>
    AppliedNotStart,
    /// <summary>
    /// 玩家已报名，可以进入比赛 (还有筹码（断线)/还有存储筹码/报名了还没进入/重购了还没进入)
    /// </summary>
    CanJoin,
    /// <summary>
    /// 玩家未报名，已错过报名阶段, 比赛已经开始
    /// </summary>
    CannotApplyStarted,
    /// <summary>
    /// 玩家已经被淘汰，还可以选择重购
    /// </summary>
    LoseCanRebuy,
    /// <summary>
    /// 玩家已经被淘汰，没有机会了
    /// </summary>
    Lose,
    /// <summary>
    /// 报名的比赛已经结束
    /// </summary>
    JoinComplete,
    /// <summary>
    /// 未参与的比赛已经结束
    /// </summary>
    NotJoinComplete,
    /// <summary>
    /// 进入超时
    /// </summary>
    CannotJoinOvertime,
}
class AddOnModeDate {
    public AddOnPlusMode1: boolean; //模式1， 0 关，1开启
    public AddOnPlusMode1MaxTimes: number;//最大次数限制
    public AddOnPlusMode1Limit: number;//增购限制，在桌筹码 < 初始筹码 * addonplus_m1_limit
    public AddOnPlusMode2: boolean;//模式2
    public AddOnPlusMode2MaxTimes: number;//最大次数限制
    public AddOnPlusMode2EndBl: number;//最大盲注等级
    public BuyRatio: number;//买入倍率
    constructor(obj: any) {
        this.AddOnPlusMode1 = obj.AddOnPlusMode1;
        this.AddOnPlusMode1MaxTimes = obj.AddOnPlusMode1MaxTimes;
        this.AddOnPlusMode1Limit = obj.AddOnPlusMode1Limit;
        this.AddOnPlusMode2 = obj.AddOnPlusMode2;
        this.AddOnPlusMode2MaxTimes = obj.AddOnPlusMode2MaxTimes;
        this.AddOnPlusMode2EndBl = obj.AddOnPlusMode2EndBl;
        this.BuyRatio = obj.BuyRatio;
    }
}
export default class MTTGame extends TexasGame {
    static MTTMatchStatus = MTTMatchStatus;
    static MTTPlayerStatus = MTTPlayerStatus;
    static AddOnModeDate = AddOnModeDate;
    ///////////////////////////////////////////

    //////////////////////////////////////////
    private isSyncHand: boolean = false;
    //protected UnityArmatureComponent armatureRewardCircleZH;
    //protected UnityArmatureComponent armatureRewardCircleEN;

    private gameStarted: boolean = false; // 比赛是否已经开始
    private hadRequestEnterRoom: boolean = false; //是否已请求进入房间接口
    public huntMode: boolean = false; //是否猎人模式

    public NotLookPlayer: boolean = false;//当前玩家是否是旁观//MTT使用

    //盲注数据
    private blindType: MTT_GameType = null; // 盲注表0为A表(普通)，1为B表(快速) 2为C表(普通25) 3为D表(快速25)
    public get BlindType(): MTT_GameType {
        return this.blindType;
    }

    public upBlindTime: number; // 当前升盲时间
    public upBlindLeftTime: number; //升盲剩余时间，秒
    private upBlindLeftTimeDeltaTime: number;
    public BlindLevel: number; // 盲注级别
    private curBld: number;//当前盲注
    private curAnte: number;//当前前注
    private nextBld: number;//下一个盲注
    private nextAnte: number;//下一个前注
    // 升盲倒计时
    public upBldCounting: boolean;

    // 重购数据
    public RebuyScore: number;
    public RemainRebuyCount: number;
    public TotalRebuyCount: number;
    public MaxRebuyBlindLevel: number;
    private leftTime: number;
    private rebuyCost: string;
    private inRewardCircle: boolean;//是否已进入奖励圈（+1）
    //addon 数据
    private startAddOnLevel: number;//addon 开始级别
    private cachePartialBringInReturnBlindLevel: number;//自动合并筹码等级
    private endAddOnLevel: number;//addon 结束级别
    private addOnScore: number;//addon 分数
    private addOnModeDate: AddOnModeDate;
    private addOnMode: Def.AddOnModeMap[keyof Def.AddOnModeMap];
    private CurrentOpAddOnMode: Def.AddOnModeMap[keyof Def.AddOnModeMap];;
    private SyncHandTime: number = 0;
    private BathTipsTimes: number = 1;
    private isStartShowPullDown: boolean;//是否开始展示拆桌提示
    private showPullDownTime: number = 0;//拆桌提示计时
    private pullDownTipRandomNum: number = -1;//随机到的数
    private readonly minPullDownTipNum: number = 1;//最小的随机数
    private readonly maxPullDownTipsNum: number = 7;//最大的随机数
    private readonly intervelTime: number = 4;//随机间隔时间

    // public override void Update() {
    //     base.Update();

    //     if (upBldCounting) {
    //         if (Time.time - upBlindLeftTimeDeltaTime > 1f)
    //         {
    //             upBlindLeftTimeDeltaTime = Time.time;
    //             upBlindLeftTime -= 1;
    //             if (upBlindLeftTime <= 0) {
    //                 upBldCounting = false;
    //             }
    //             UpdateRoomDes();
    //         }
    //     }
    //     if (isSyncHand && Image_WaitForStartBathTips.activeInHierarchy) {
    //         if (Time.time - SyncHandTime > 2f)
    //         {
    //             SyncHandTime = Time.time;
    //             showImage_WaitForStartBathTips(BathTipsTimes);
    //             BathTipsTimes++;
    //             if (BathTipsTimes == 4) {
    //                 BathTipsTimes = 1;
    //             }
    //         }
    //     }
    //     if (isStartShowPullDown) {
    //         //展示拆桌提示
    //         if (imageRedistributionTips.gameObject.activeInHierarchy) {
    //             if (Time.time - showPullDownTime > intervelTime) {
    //                 showPullDownTime = Time.time;
    //                 pullDownText.text = GetPullDownTips();
    //             }
    //         }
    //     }
    // }

    /// <summary>
    /// 随机得到拆桌文案
    /// </summary>
    /// <returns></returns>
    private GetPullDownTips(): string {
        let tips: string = null;
        let randomNum: number = this.minPullDownTipNum;
        do {
            randomNum = PublicHelper.RandomIntRange(this.minPullDownTipNum, this.maxPullDownTipsNum);
        } while (randomNum == this.pullDownTipRandomNum);
        this.pullDownTipRandomNum = randomNum;
        tips = i18nMgr.Get("MTTroomNum_00" + randomNum);
        return tips;
    }

    public override Dispose() {
        this.BlindLevel = 0;
        this.upBlindLeftTime = 0;
        this.upBldCounting = false;
        this.huntMode = false;
        this.gameStarted = false;
        this.NotLookPlayer = false;
        this.addOnModeDate = null;
        super.Dispose();
    }

    public override onClickAddOn() {
        if (!this.uirc.getButtonInteractable(this.uirc.buttonAddOn)) return;
        this.uirc.setButtonInteractable(this.uirc.buttonAddOn, false);
        ProtocolAgency.Send<ClientMessageAddOn.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_EnterRoom,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body:
            {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                mode: this.addOnMode,
                ratio: 0,
                useProp: false,
            },
        });
        this.CurrentOpAddOnMode = this.addOnMode;
    }
    public override UpdateRoom(rec: ServerMessageEnterRoom.AsObject) {

        if (null == rec)
            return;
        //倒计时
        if (rec.mttProgress.startCountDown <= 0) {
            // 游戏已开始
            this.gameStarted = true;
            // 隐藏倒计时界面
            //UIComponent.Instance.HideNoAnimation(UIType.UIMTTTime);
        }
        //是否猎人赛模式
        this.huntMode = rec.mttInfo.huntMode;
        //盲注级别
        this.blindType = rec.mttInfo.blindType;
        //升盲时间
        this.upBlindTime = rec.mttInfo.upBlindInterval;
        //当前盲注级别
        this.BlindLevel = rec.mttProgress.blindLevel; // MTTGameUtil.LeveForBlind((int)rec.MttProgress.NextSmallBlind, blindType, blindScale);
        //add on 开始级别
        this.startAddOnLevel = rec.mttInfo.startAddOnBlindLevel;
        //add on 结束级别
        this.endAddOnLevel = rec.mttInfo.endAddOnBlindLevel;
        //是否开启ADD ON
        if (rec.mttProgress.blindLevel == 1) {
            if (rec.mttInfo.addOn) {
                this.addOnMode = Def.AddOnMode.ADDON_NORMAL;
            }
            else if (rec.mttInfo.addOnPlusMode1) {

                this.addOnMode = Def.AddOnMode.PLUS_MODE1;
            }
            else {
                this.addOnMode = Def.AddOnMode.ADDON_NONE;
            }
        }
        else {
            this.addOnMode = rec.mttProgress.addonMode;
        }
        this.addOnScore = rec.mttInfo.addOnScore;
        //#region 增购plus
        this.addOnModeDate = new AddOnModeDate(rec.mttInfo);

        this.cachePartialBringInReturnBlindLevel = rec.mttInfo.partialBringInReturnBlindLevel;
        this.upBlindLeftTime = rec.mttProgress.upBlindLeftTime;//升盲倒计时
        this.upBldCounting = this.upBlindLeftTime > 0;//进入房间即可倒计时
        this.nextBld = rec.mttProgress.nextSmallBlind;//下一个盲注
        this.nextAnte = rec.mttProgress.nextAnte;//下一个前注
        this.curAnte = rec.roomInfo.ante;
        this.curBld = rec.roomInfo.smallBlind;
        //重购
        this.TotalRebuyCount = rec.mttInfo.rebuyTimes;
        this.RebuyScore = rec.mttInfo.rebuyScore;
        this.RemainRebuyCount = 0;
        this.MaxRebuyBlindLevel = rec.mttInfo.maxRebuyBlindLevel;

        super.UpdateRoomCommon(rec);

        //还原自己托管按钮
        if (this.mainPlayer != null) {
            this.uirc.buttonCancelTrust.active = this.mainPlayer.IsAutoOp;//托管标志
        }
        //还原牌桌上所有玩家托管状态
        let seat: Seat = null;

        for (let i = 0, n = rec.playersList.length; i < n; i++) {

            let player: Player.AsObject = rec.playersList[i];

            let seat: Seat = this.listSeat[this.GetLocalSeatID(player.seatId)];

            if (seat != null) {
                //seat.UpdateTrust();
            }
            seat.Player.HunterKillAwardOther = player.hunterKillAwardOther;
            seat.Player.HunterHeadValue = player.hunterHeadValue;
            //seat.UpdateHunterAward();
        }
        //更新自己增购次数
        if (rec.myInfo != null && this.mainPlayer.seatID > -1) {
            this.mainPlayer.AddOn = rec.myInfo.addon;
            this.mainPlayer.AddonPlusMode1Times = rec.myInfo.addonPlusMode1Times;
            this.mainPlayer.AddonPlusMode2Times = rec.myInfo.addonPlusMode2Times;
            this.mainPlayer.cacheChips = this.mainPlayer.chips;
        }
        this.HideWaitForStartTips();
        if (rec.mttProgress.isBubbleWait) {
            //this.ClearRoundDate(0);
        }
        if (rec.mttProgress.startCountDown > 0) {
            this.hadRequestEnterRoom = false;
            // UIComponent.Instance.ShowNoAnimation(UIType.UIMTTTime, new UIMTTTimeComponent.MTTTimeData()
            // 	{
            //         nickname = GameCache.Instance.roomName,
            //         second = rec.mttProgress.startCountDown,

            //     });
            GameCache.Instance.IsMTTbefor = 1;
        }
        else {
            this.hadRequestEnterRoom = true;
            GameCache.Instance.IsMTTbefor = 0;
        }
        this.UpdateRoomDes();
        //#region addon 按钮显示
        this.uirc.buttonAddOn.active = (this.addOnMode != Def.AddOnMode.ADDON_NONE && this.gameStarted);
        //this.ShowAddOnBtn();
        //#endregion
    }


    //     protected ClearAllData() {
    //         NotLookPlayer = false;
    //         base.ClearAllData();
    //     }

    //     private showImage_WaitForStartBathTips(int index) {
    //         BathText.text = LanguageManager.Get("UIBathTip00" + index);
    //     }

    //     private async ClearRoundDate(long time) {
    //         await Game.Scene.ModelScene.GetComponent<TimerComponent>().WaitAsync(time);
    //         base.HandleRoundFinish(null);
    //         isSyncHand = true;
    //         Image_WaitForStartBathTips.SetActive(true);
    //     }
    //     public ObtainMTTCountDown(isTimeOut: boolean = false) {

    //     }

    //     private InitMttFakeSeat() {
    //         this.InitSeatByCount(GameCache.Instance.seat_count);
    // 			Seat mSeat = null;
    //         for (int i = 0, n = listSeat.Count; i < n; i++)
    //         {
    //             mSeat = listSeat[i];
    //             mSeat.seatID = (sbyte)i;

    //             mSeat.FsmLogicComponent.SM.ChangeState(SeatIdle<Entity>.Instance);

    //             if (i == 0) {
    // 					Player mPlayer = ComponentFactory.CreateWithId<Player>(GameCache.Instance.nUserId);
    //                 mPlayer.seatID = 0;
    //                 mPlayer.headPic = GameCache.Instance.headPic;
    //                 mPlayer.nick = GameCache.Instance.nick;
    //                 mPlayer.userID = GameCache.Instance.nUserId;
    //                 mPlayer.chips = 0;
    //                 mPlayer.canPlayStatus = Def.Types.CanPlayStatus.Disable;
    //                 mPlayer.actionStatus = Def.Types.Action.None;
    //                 mPlayer.ante = 0;
    //                 mPlayer.anteNumber = 0;
    //                 mPlayer.SetCards(GetEmptyHandCards());
    //                 mSeat.Player = mPlayer;

    //                 if (null != mainPlayer) {
    //                     mainPlayer.Dispose();
    //                     mainPlayer = null;
    //                 }
    //                 mainPlayer = mSeat.Player;

    //                 mSeat.UpdateFSMbyStatus();
    //             }
    //             else {
    //                 mSeat.FsmLogicComponent.SM.ChangeState(SeatEmpty<Entity>.Instance);
    //             }
    //         }
    //     }

    //     public countDownTo30Second() {
    //         if (!hadRequestEnterRoom) {
    //             hadRequestEnterRoom = true;
    //         }
    //     }

    //     protected ShowArmatureRewardCircle() {
    // 			UnityArmatureComponent armatureRewardCircle;
    //         if (LanguageManager.mInstance.mCurLanguage == 0 || LanguageManager.mInstance.mCurLanguage == 2) {
    //             armatureRewardCircle = this.armatureRewardCircleZH;
    //         }
    //         else {
    //             armatureRewardCircle = this.armatureRewardCircleEN;
    //         }
    //         if (null != armatureRewardCircle.dragonAnimation) {
    //             armatureRewardCircle.dragonAnimation.Reset();
    //             armatureRewardCircle.dragonAnimation.Play("newAnimation", 1);
    //             armatureRewardCircle.AddEventListener(DragonBones.EventObject.COMPLETE, (key, go) => {
    //                 armatureRewardCircle.gameObject.SetActive(false);
    //             });
    //         }
    //     }
    //     /// <summary>
    //     /// 
    //     /// </summary>
    //     /// <param name="go"></param>
    //     public OnClickAddOn(GameObject go) {
    //         if (!buttonAddOn.interactable) {
    //             return;
    //         }
    //         buttonAddOn.interactable = false;
    //         CPGameSessionComponent.Instance.Send(new Protocol_Holdem_AddOn()
    // 			{
    //                 RoomID = (ulong)GameCache.Instance.room_id,
    //                 MatchID = (ulong)GameCache.Instance.match_id,
    //                 request = new ClientMessageAddOn()
    // 				{
    //                 Room = new Room() { RoomId = (uint)GameCache.Instance.room_id, MatchId = (uint)GameCache.Instance.match_id },
    //             Mode = addOnMode,
    //             Ratio = 1,
    //             UseProp = false,
    // 				}

    // });
    // CurrentOpAddOnMode = addOnMode;
    // 		}
    // 		// 重购
    // 		private onClickRebuy(GameObject go)
    // {
    //     if (isGPSRestrictions) {
    //         //开启GPS，先获取定位
    //         waittingGPSCallback = true;
    //         NativeManager.PermissionState permissionState = NativeManager.LocalGetLocationPermissionState();
    //         if (permissionState == NativeManager.PermissionState.WaitAsk) {

    //         }
    //         else if (permissionState == NativeManager.PermissionState.Allow) {
    //             NativeManager.GetGPSLocation();
    //             waittingGPSCallback = true;
    //         }
    //         else {
    //             waittingGPSCallback = false;
    //             UIComponent.Instance.ShowNoAnimation(UIType.UIDialog,
    //                 new UIDialogComponent.DialogData()
    // 									   {
    //                     type = UIDialogComponent.DialogData.DialogType.CommitCancel,
    //                     title = "",

    //                     content = LanguageManager.Get("UIAskOpenSetting"),
    //                     // contentCommit = "确定",
    //                     contentCommit = CPErrorCode.LanguageDescription(10012),
    //                     // contentCancel = "取消",
    //                     contentCancel = CPErrorCode.LanguageDescription(10013),
    //                     actionCommit = () => { NativeManager.LocalOpenAppSettings(); },
    //                     actionCancel = null
    //                 });
    //         }
    //         if (Application.platform != RuntimePlatform.WindowsEditor && Application.platform != RuntimePlatform.OSXEditor) {
    //             return;
    //         }
    //     }
    //     waittingGPSCallback = false;

    //     Web_Room_Center_Mtt_Rebuy.RequestData req = new Web_Room_Center_Mtt_Rebuy.RequestData()
    //     {

    //     };

    //     HttpRequestComponent.Instance.Send(
    //         StringHelper.GetWebUrlString(Web_Room_Center_Mtt_Rebuy.API, GameCache.Instance.match_id.ToString()),
    //         Web_Room_Center_Mtt_Rebuy.Request(req),
    //         json => {
    //             var response = Web_Room_Center_Mtt_Rebuy.Response(json);
    //             if (response.code == 0) {
    //                 UIComponent.Instance.Toast(LanguageManager.Get("Repurchase_successful"));

    //             }
    //             else {
    //                 //TODO-多语言
    //                 UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(response.code));
    //             }
    //         },
    //         null,
    //         () => {
    //             UIComponent.Instance.Toast(LanguageManager.Get("request_failed"));
    //         }
    //     );
    // }

    // 		/// <summary>
    // 		/// 坐下 
    // 		/// </summary>
    // 		/// <param name="clientSeatId"></param>
    // 		public override  Sitdown(int clientSeatId, bool isclick = false)
    // {
    //     return;
    // }

    // 		public override  CallbackExit()
    // {
    //     CPGameSessionComponent.Instance.Send(new Protocol_Holdem_Leave()
    // 			{
    //             RoomID = (ulong)GameCache.Instance.room_id,
    //             MatchID = (ulong)GameCache.Instance.match_id,
    //             request = new ClientMessageLeave()
    // 				{
    //             Room = new Room()
    // 					{

    //             RoomId = (uint)GameCache.Instance.room_id,
    //             MatchId = (uint)GameCache.Instance.match_id
    //         }
    // 				}
    // 			});
    // 		}
    // 		/// <summary>
    // 		/// 带入
    // 		/// </summary>
    // 		/// <param name="anteNumber"></param>
    // 		/// <param name="addChip"></param>
    // 		/// <param name="storeChip"></param>
    // 		/// <param name="isAutoAddChips"></param>
    // 		public override  AddChips(int anteNumber, ulong addChip = 0, bool isAutoAddChips = false)
    // {
    //     CPGameSessionComponent.Instance.Send(new Protocol_Holdem_AddOn()
    // 			{
    //             RoomID = (ulong)GameCache.Instance.room_id,
    //             MatchID = (ulong)GameCache.Instance.match_id,
    //             request = new ClientMessageAddOn()
    // 				{
    //             Room = new Room() { RoomId = (uint)GameCache.Instance.room_id, MatchId = (uint)GameCache.Instance.match_id },


    // 				}

    // 			});
    // 		}
    // 		public override  GPSCallback_Sitdown()
    // {

    // }

    // 		// 取消重购
    // 		private onClickRebuyCancel()
    // {
    //     this.ExitRoom();

    // }

    // 		// 退出房间 -MTT直接退出房间断开socket
    // 		protected override  onClickExit(GameObject go)
    // {
    //     hideMenu();
    //     CallbackExit();
    //     ChangeGameState(TexasGameState.Exit, null);
    // }

    // 		public override void ExitRoom()
    // {
    //     base.ExitRoom();


    // }

    // 		// 操作延时
    // 		protected override void onClickDelay(GameObject go)
    // {
    //     if (delayCount >= 2)
    //         return;
    //     if (!UIComponent.Instance.Get(UIType.UIOperation).GameObject.activeInHierarchy) {
    //         UIComponent.Instance.Toast(LanguageManager.Get("ServerErrorCode_31045"));
    //         return;
    //     }
    //     ClickAddTime = true;
    //     CPGameSessionComponent.Instance.Send(new Protocol_Holdem_AddTime()
    // 			{
    //             RoomID = (ulong)GameCache.Instance.room_id,
    //             MatchID = (ulong)GameCache.Instance.match_id,
    //             request = new ClientMessageAddTime()
    // 				{
    //             Room = new Room() { RoomId = (uint)GameCache.Instance.room_id, MatchId = (uint)GameCache.Instance.match_id },
    //         Consume = GetOpDelayConsumeType(),
    // 				}
    // 			});
    // 		}

    // 		public override void CheckPlayerInfo(int userId, Player player = null)
    // {
    //     UIComponent.Instance.ShowNoAnimation(UIType.UITexasPlayerInfo, new object[] { userId, false });
    // }

    // 		// 实时战况
    // 		protected override void onClickReport(GameObject go)
    // {
    //     if (!hadRequestEnterRoom)
    //         return;
    //     UIComponent.Instance.ShowNoAnimation(UIType.UITexasReportMTT, new object[1] { true });
    // }

    // 		protected override void onClickCurSituation(GameObject go)
    // {
    //     if (!hadRequestEnterRoom)
    //         return;
    //     base.onClickCurSituation(go);
    // }


    // 		protected override void UpdateMenu()
    // {
    //     //更新金豆
    //     UIMineModel.mInstance.ObtainUserInfo(pDto => {
    //         textTotalBean.text = StringHelper.GetDoubleString(GameCache.Instance.gold);
    //     });

    //     textStoreBean.transform.parent.gameObject.SetActive(mainPlayer.cacheStoreChips > 0);
    // 			float menuHeight = 1800f;

    //     buttonStandup.gameObject.SetActive(false);
    //     menuHeight -= 185;

    //     buttonAddChips.gameObject.SetActive(false);
    //     menuHeight -= 185;

    //     Button_LeaveDesk.gameObject.SetActive(false);
    //     menuHeight -= 185;

    //     buttonRule.transform.Find("Text").GetComponent<Text>().text = LanguageManager.Get("UITexas_RuleOfTips");

    //     if (UserSitdown()) //已坐下
    //     {
    //         buttonTrust.gameObject.SetActive(true);
    //         buttonTrust.interactable = !buttonCancelTrust.gameObject.activeInHierarchy;

    //     }
    //     else //未坐下
    //     {
    //         buttonTrust.gameObject.SetActive(false);
    //         menuHeight -= 185;
    //     }
    //     if (gameStarted) {

    //         buttonTrust.transform.GetChild(0).GetComponent<Text>().color = new Color(255 / 255f, 255 / 255f, 255 / 255f, 245 / 255f);
    //         buttonTrust.interactable = true;
    //         buttonTrust.transform.GetChild(2).gameObject.SetActive(true);
    //     }
    //     else {
    //         buttonTrust.transform.GetComponentInChildren<Text>().color = new Color(255 / 255f, 255 / 255f, 255 / 255f, 120 / 255f);
    //         buttonTrust.interactable = false;
    //         buttonTrust.transform.GetChild(2).gameObject.SetActive(false);
    //     }

    //     menuHeight -= 185;



    //     buttonRule.gameObject.SetActive(false);
    //     menuHeight -= 185;
    //     //线路
    //     buttonNetline.transform.Find("Text").GetComponent<Text>().text = GlobalData.Instance.NameForServerID(GlobalData.Instance.CurrentUsingServerID());
    //     buttonshare.gameObject.SetActive(false);
    //             RectTransform mRectTransform = transSubMenu as RectTransform;
    //     if (null != mRectTransform)
    //         mRectTransform.sizeDelta = new Vector2(mRectTransform.sizeDelta.x, menuHeight);
    // }

    // 		/// <summary>
    // 		/// 更新addon 按钮状态
    // 		/// </summary>
    // 		private void ShowAddOnBtn()
    // {
    //     buttonAddOn.gameObject.SetActive(addOnMode != Def.Types.AddOnMode.AddonNone && gameStarted);
    //     buttonAddOn.interactable = IsShowAddOnBtn();
    // }
    // 		private bool IsShowAddOnBtn()
    // {
    //     if (MainPlayer == null || addOnModeDate == null) {
    //         return false;
    //     }
    //     switch (addOnMode) {
    //         case Def.Types.AddOnMode.AddonNone:
    //             return false;
    //             break;
    //         case Def.Types.AddOnMode.AddonNormal:
    //             if (!mainPlayer.AddOn && startAddOnLevel < BlindLevel + 1 && endAddOnLevel > BlindLevel) {
    //                 Log.Info("AddonNormal is true:" + startAddOnLevel + " " + BlindLevel + " " + endAddOnLevel);
    //                 return true;
    //             }
    //             else {
    //                 return false;
    //             }
    //             break;
    //         case Def.Types.AddOnMode.PlusMode1:
    //             if (MainPlayer.seatID > -1 && MainPlayer.canPlayStatus == Def.Types.CanPlayStatus.Normal && !MainPlayer.usedAddon && MainPlayer.cacheChips < addOnModeDate.AddOnPlusMode1Limit && (ulong)MainPlayer.AddonPlusMode1Times < addOnModeDate.AddOnPlusMode1MaxTimes && BlindLevel < MaxRebuyBlindLevel)
    //             {
    //                 Log.Info("PlusMode1 is true:" + MainPlayer.cacheChips + " " + addOnModeDate.AddOnPlusMode1Limit + " " + (ulong)MainPlayer.AddonPlusMode1Times + " " + addOnModeDate.AddOnPlusMode1MaxTimes + " " + BlindLevel + " " + MaxRebuyBlindLevel + "  MainPlayer.canPlayStatus :" + MainPlayer.canPlayStatus);
    //                 return true;
    //             }
    //                     else
    //             {
    //                 return false;
    //             }

    //             break;
    //         case Def.Types.AddOnMode.PlusMode2:
    //             if (MainPlayer.seatID > -1 && !MainPlayer.usedAddon && (ulong)MainPlayer.AddonPlusMode2Times < addOnModeDate.AddOnPlusMode2MaxTimes && BlindLevel >= MaxRebuyBlindLevel && BlindLevel < addOnModeDate.AddOnPlusMode2EndBl)
    //             {
    //                 Log.Info("PlusMode2 is true:" + (ulong)MainPlayer.AddonPlusMode2Times + " " + addOnModeDate.AddOnPlusMode2MaxTimes + " " + BlindLevel + " " + MaxRebuyBlindLevel + " " + addOnModeDate.AddOnPlusMode2EndBl);
    //                 return true;
    //             }
    // 					else
    //             {
    //                 return false;
    //             }

    //             break;
    //         default:
    //             return false;
    //             break;
    //     }
    // }

    // 		protected override void UpdateRoomDes()
    // {
    // 			StringBuilder mStringBuilder = new StringBuilder();
    //     if (GameCache.Instance.match_id > 0) {
    //         mStringBuilder.AppendLine($"{LanguageManager.Get("UITexasReport_Text_DeskNumTip")}:{GameCache.Instance.room_id}-{mHandNum}");
    //     }

    //     mStringBuilder.AppendLine(GameCache.Instance.roomName);
    //     mStringBuilder.AppendLine($"{GetRoomTypeDes()}-{GameCache.Instance.match_id}");
    //     mStringBuilder.AppendLine($"{LanguageManager.Get("UITexasReport_Text_MatchCurrBlindTip")}:{StringHelper.GetLongStringUnit(curBld)}/{StringHelper.GetLongStringUnit((long)curBld * 2)}({StringHelper.GetLongStringUnit((long)curAnte)})");
    //     mStringBuilder.AppendLine($"{LanguageManager.Get("UITexasReport_Text_MatchNextBlindTip")}:{StringHelper.GetLongStringUnit((long)nextBld)}/{StringHelper.GetLongStringUnit((long)nextBld * 2)}({StringHelper.GetLongStringUnit((long)nextAnte)})");

    //     if (upBlindLeftTime < 0) {
    //         mStringBuilder.AppendLine(LanguageManager.Get("MTT_RoomInfo_UpBlindTimeLeft") + TimeHelper.ShowRemainingSemicolonPure(0));
    //     }
    //     else {
    //         mStringBuilder.AppendLine(LanguageManager.Get("MTT_RoomInfo_UpBlindTimeLeft") + TimeHelper.ShowRemainingSemicolonPure(upBlindLeftTime));
    //     }
    //     if (isGPSRestrictions && isIpRestrictions) {
    //         // --mStringBuilder.AppendLine("GPS  IP限制");
    //         mStringBuilder.AppendLine($"GPS、IP {CPErrorCode.LanguageDescription(20008)}");
    //     }
    //     else if (isGPSRestrictions && !isIpRestrictions) {
    //         // --mStringBuilder.AppendLine("GPS限制");
    //         mStringBuilder.AppendLine($"GPS {CPErrorCode.LanguageDescription(20008)}");
    //     }
    //     else if (!isGPSRestrictions && isIpRestrictions) {
    //         // --mStringBuilder.AppendLine("IP限制");
    //         mStringBuilder.AppendLine($"IP {CPErrorCode.LanguageDescription(20008)}");
    //     }

    //     textRoomInfo.text = mStringBuilder.ToString();
    // }


    // 		// 托管相关
    // 		protected override void SendTrustAction(bool enable)
    // {
    //     CPGameSessionComponent.Instance.Send(new Protocol_Holdem_AutoOpActive()
    // 			{
    //             RoomID = (ulong)GameCache.Instance.room_id,
    //             MatchID = (ulong)GameCache.Instance.match_id,
    //             request = new ClientMessageAutoOpActive()
    // 				{
    //             Enable = enable,
    //             Room = new Room()
    // 					{

    //             RoomId = (uint)GameCache.Instance.room_id,
    //             MatchId = (uint)GameCache.Instance.match_id
    //         },
    // 				}
    // 			});
    // 		}

    // 		protected override CardType GetCardType(out List < sbyte > highlightCards, List < sbyte > publiccards)
    // {
    //     List < sbyte > mCards = new List<sbyte>();
    //     mCards.AddRange(publiccards);
    //     mCards.AddRange(mainPlayer.cards);
    //     return CardTypeUtil.GetCardType(mCards, out highlightCards, GameUtil.JudgeIsSixPlusRoomPath((RoomType)GameCache.Instance.room_type));
    // }
    // 		protected override List < sbyte > GetHandCardsAtEnterRoom(object obj, int index)
    // {
    // 			ServerMessageEnterRoom rec = obj as ServerMessageEnterRoom;
    //     if (rec.Players[index].Cards == null || rec.Players[index].Cards.count <= 0) {
    //         return new List<sbyte>() { 0, 0 };
    //     }
    // 			sbyte mFirstCard = (sbyte)rec.Players[index].Cards[0];
    // 			sbyte mSecondCard = (sbyte)rec.Players[index].Cards[1];
    //     return new List<sbyte>() { mFirstCard, mSecondCard };
    // }

    // 		protected override List < sbyte > GetHandCardsAtRecvStartInfo(object obj, int index)
    // {
    // 			ServerMessageStartInfo rec = obj as ServerMessageStartInfo;
    //     if (rec.Players[index].Cards == null || rec.Players[index].Cards.count <= 0) {
    //         return new List<sbyte>() { 0, 0 };
    //     }
    // 			sbyte mFirstCard = (sbyte)rec.Players[index].Cards[0];
    // 			sbyte mSecondCard = (sbyte)rec.Players[index].Cards[1];
    //     return new List<sbyte>() { mFirstCard, mSecondCard };
    // }

    // 		public async override void HandleRoundFinish(ServerMessageHandClear source)
    // {
    //     base.HandleRoundFinish(source);
    //     await Game.Scene.ModelScene.GetComponent<TimerComponent>().WaitAsync(4000);
    //     if (IsDisposed) {
    //         return;
    //     }
    //     JudgeHavePlayer();
    // }

    // 		/// <summary>
    // 		/// 判断除了自己此时的房间的人数
    // 		/// </summary>
    // 		public void JudgeHavePlayer()
    // {
    //     var currentPlayers = GetCurrentPlayers();
    //     if (currentPlayers.Count == 0) {
    //         isStartShowPullDown = true;
    //         imageRedistributionTips.gameObject.SetActive(true);
    //     }
    // }

    // 		/// <summary>
    // 		/// 隐藏拆桌提示
    // 		/// </summary>
    // 		public void HidePollDownTips()
    // {
    //     isStartShowPullDown = false;
    //     imageRedistributionTips.gameObject.SetActive(false);
    // }

}
