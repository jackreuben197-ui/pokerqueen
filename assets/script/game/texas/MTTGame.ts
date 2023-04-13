import PublicHelper from "../../helper/PublicHelper";
import TimeHelper from "../../helper/TimeHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import ProtocolAgency from "../../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../../net/websocket/ProtocolCode";
import { Def, MTTInfo, Player } from "../../protobuf/holdem/define_pb";
import { ClientMessageAddOn } from "../../protobuf/holdem/req_add_on_pb";
import { ServerMessageEnterRoom } from "../../protobuf/holdem/req_enter_room_pb";
import { GameCache } from "../GameCache";
import Seat from "../seat/Seat";
import { SeatEmpty, SeatIdle } from "../SeatStateHandler";
import { MTT_GameType } from "../util/MTTGameUtil";
import TexasGame from "./TexasGame";
import { CPlayer } from "../CPlayer";
import { TexasGameState } from "../TexasGameState";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { ClientMessageAddTime } from "../../protobuf/holdem/req_add_time_pb";
import { UIDefine } from "../../define/UIDefine";
import Main from "../../Main";
import { UIMineModel } from "../../lobby/UIMineModel";
import { StringHelper } from "../../helper/StringHelper";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { ClientMessageAutoOpActive } from "../../protobuf/holdem/req_auto_op_active_pb";
import MTTGameProtocol from "../protocol/MTTGameProtocol";
import MTTGameMessageHandler from "../messageHandler/MTTGameMessageHandler";
import UIMTTTimeComponent from "../ui/UIMTTTimeComponent";
import MTTGameUtils from "../util/MTTGameUtils";
import { GM } from "../../gm/GMAPI";
import { APIOrgClubUserInfo, Web_Room_Center_Mtt_User_Wallet, Web_User_Room, WWW } from "../../net/https/WebRequest";
import UITexasMenu from "../ui/UITexasMenu";

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
    constructor(obj: MTTInfo.AsObject) {
        this.AddOnPlusMode1 = obj.addOnPlusMode1;
        this.AddOnPlusMode1MaxTimes = obj.addOnPlusMode1MaxTimes;
        this.AddOnPlusMode1Limit = obj.addOnPlusMode1Limit;
        this.AddOnPlusMode2 = obj.addOnPlusMode2;
        this.AddOnPlusMode2MaxTimes = obj.addOnPlusMode2MaxTimes;
        this.AddOnPlusMode2EndBl = obj.addOnPlusMode2EndBl;
        this.BuyRatio = obj.buyRatio;
    }
}
export default class MTTGame extends TexasGame {
    static MTTMatchStatus = MTTMatchStatus;
    static MTTPlayerStatus = MTTPlayerStatus;
    static AddOnModeDate = AddOnModeDate;
    ///////////////////////////////////////////
    public isMTT: boolean = true;
    //////////////////////////////////////////
    public isSyncHand: boolean = false;
    //protected UnityArmatureComponent armatureRewardCircleZH;
    //protected UnityArmatureComponent armatureRewardCircleEN;

    public gameStarted: boolean = false; // 比赛是否已经开始
    private hadRequestEnterRoom: boolean = false; //是否已请求进入房间接口
    public huntMode: boolean = false; //是否猎人模式

    public NotLookPlayer: boolean = false;//当前玩家是否是旁观//MTT使用

    //盲注数据
    private blindType: MTT_GameType = null; // 盲注表0为A表(普通)，1为B表(快速) 2为C表(普通25) 3为D表(快速25)
    public get BlindType(): MTT_GameType {
        return this.blindType;
    }

    public upBlindTime: number = 0; // 当前升盲时间
    public upBlindLeftTime: number = 0; //升盲剩余时间，秒
    private upBlindLeftTimeDeltaTime: number = 0;
    public BlindLevel: number = 0; // 盲注级别
    public curBld: number = 0;//当前盲注
    public curAnte: number = 0;//当前前注
    public nextBld: number = 0;//下一个盲注
    public nextAnte: number = 0;//下一个前注
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
    public startAddOnLevel: number;//addon 开始级别
    public cachePartialBringInReturnBlindLevel: number;//自动合并筹码等级
    public endAddOnLevel: number;//addon 结束级别
    private addOnScore: number;//addon 分数
    private addOnModeDate: AddOnModeDate;
    public addOnMode: Def.AddOnModeMap[keyof Def.AddOnModeMap];
    public CurrentOpAddOnMode: Def.AddOnModeMap[keyof Def.AddOnModeMap];;
    private SyncHandTime: number = 0;
    private BathTipsTimes: number = 1;
    public isStartShowPullDown: boolean;//是否开始展示拆桌提示
    private showPullDownTime: number = 0;//拆桌提示计时
    private pullDownTipRandomNum: number = -1;//随机到的数
    private readonly minPullDownTipNum: number = 1;//最小的随机数
    private readonly maxPullDownTipsNum: number = 7;//最大的随机数
    private readonly intervelTime: number = 4;//随机间隔时间

    protected override RCInit() {
        this.TexasGameProtocol = new MTTGameProtocol(this);
        this.TexasGameMessageHandler = new MTTGameMessageHandler(this);
        this.TexasGameUtils = new MTTGameUtils(this);
    }

    public Update(dt: number) {
        if (this.upBldCounting) {
            let nowTime = new Date().getTime() / 1000;
            if (nowTime - this.upBlindLeftTimeDeltaTime > 1) {
                this.upBlindLeftTimeDeltaTime = nowTime;
                this.upBlindLeftTime -= 1;
                if (this.upBlindLeftTime <= 0) {
                    this.upBldCounting = false;
                }
                this.UpdateRoomDes();
            }
        }
        if (this.isSyncHand && this.uirc.Image_WaitForStartBathTips.activeInHierarchy) {
            let nowTime = new Date().getTime() / 1000;
            if (nowTime - this.SyncHandTime > 2) {
                this.SyncHandTime = nowTime;
                this.showImage_WaitForStartBathTips(this.BathTipsTimes);
                this.BathTipsTimes++;
                if (this.BathTipsTimes == 4) {
                    this.BathTipsTimes = 1;
                }
            }
        }
        if (this.isStartShowPullDown) {
            //展示拆桌提示
            if (this.uirc.Image_RedistributionTips.activeInHierarchy) {
                let nowTime = new Date().getTime() / 1000;
                if (nowTime - this.showPullDownTime > this.intervelTime) {
                    this.showPullDownTime = nowTime;
                    this.uirc.pullDownText.string = this.GetPullDownTips();
                }
            }
        }
    }

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


    public override UpdateRoom(rec: ServerMessageEnterRoom.AsObject) {

        //调试判断
        if (GM.GetDebugSwitch(3)) {
            GameCache.Instance.seat_count = GM.Moni_MTT_ServerMessageEnterRoom.seat_count;
            rec = GM.Moni_MTT_ServerMessageEnterRoom.rec;
        }

        if (null == rec)
            return;
        //倒计时
        if (rec.mttProgress.startCountDown <= 0) {
            // 游戏已开始
            this.gameStarted = true;
            // 隐藏倒计时界面
            UIComponent.Instance.HideUI(PrefabUI.UIMTTTimeComponent);
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
        //增购plus
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
            this.uirc.Button_CancelTrust.active = this.mainPlayer.IsAutoOp;//托管标志
        }
        //还原牌桌上所有玩家托管状态
        let seat: Seat = null;

        for (let i = 0, n = rec.playersList.length; i < n; i++) {

            let player: Player.AsObject = rec.playersList[i];

            let seat: Seat = this.listSeat[this.GetLocalSeatID(player.seatId)];

            if (seat != null) {
                seat.UpdateTrust();
            }
            seat.Player.HunterKillAwardOther = player.hunterKillAwardOther;
            seat.Player.HunterHeadValue = player.hunterHeadValue;
            seat.UpdateHunterAward();
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
            this.ClearRoundDate(0);
        }
        if (rec.mttProgress.startCountDown > 0) {
            this.hadRequestEnterRoom = false;
            UIComponent.Instance.ShowUI(
                PrefabUI.UIMTTTimeComponent,
                new UIMTTTimeComponent.MTTTimeData(GameCache.Instance.roomName, rec.mttProgress.startCountDown)
            );
            GameCache.Instance.IsMTTbefor = 1;
        }
        else {
            this.hadRequestEnterRoom = true;
            GameCache.Instance.IsMTTbefor = 0;
        }
        this.UpdateRoomDes();
        //#region addon 按钮显示
        this.uirc.Button_AddOn.active = (this.addOnMode != Def.AddOnMode.ADDON_NONE && this.gameStarted);
        this.ShowAddOnBtn();
        //#endregion
    }
    protected ClearAllData() {
        this.NotLookPlayer = false;
        this.isSyncHand = false;
        super.ClearAllData();
    }

    private showImage_WaitForStartBathTips(index: number) {
        this.uirc.BathText.string = i18nMgr.Get("UIBathTip00" + index);
    }

    public async ClearRoundDate(time: number) {
        await TimeHelper.Sleep(time);
        this.TexasGameProtocol.HandleRoundFinish(null);
        this.isSyncHand = true;
        this.uirc.Image_WaitForStartBathTips.active = true;
    }
    // public ObtainMTTCountDown(isTimeOut: boolean = false) {

    // }


    public countDownTo30Second() {
        if (!this.hadRequestEnterRoom) {
            this.hadRequestEnterRoom = true;
        }
    }

    protected ShowArmatureRewardCircle() {
        // 		UnityArmatureComponent armatureRewardCircle;
        // if (LanguageManager.mInstance.mCurLanguage == 0 || LanguageManager.mInstance.mCurLanguage == 2) {
        //     armatureRewardCircle = this.armatureRewardCircleZH;
        // }
        // else {
        //     armatureRewardCircle = this.armatureRewardCircleEN;
        // }
        // if (null != armatureRewardCircle.dragonAnimation) {
        //     armatureRewardCircle.dragonAnimation.Reset();
        //     armatureRewardCircle.dragonAnimation.Play("newAnimation", 1);
        //     armatureRewardCircle.AddEventListener(DragonBones.EventObject.COMPLETE, (key, go) => {
        //         armatureRewardCircle.gameObject.SetActive(false);
        //     });
        // }
    }



    /// <summary>
    /// 坐下 
    /// </summary>
    /// <param name="clientSeatId"></param>
    public override Sitdown(clientSeatId: number, isclick: boolean = false) {
        return;
    }
    public override onClickAddOn() {
        if (!this.uirc.getButtonInteractable(this.uirc.Button_AddOn)) return;
        this.uirc.setButtonInteractable(this.uirc.Button_AddOn, false);
        ProtocolAgency.Send<ClientMessageAddOn.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_AddOn,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body:
            {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },

                useProp: false,
                ratio: 1,
                mode: this.addOnMode,
                usedPropId: 0,
                propType: 0,
                useFree: false,
            },
        });
        this.CurrentOpAddOnMode = this.addOnMode;
    }

    // 退出房间 -MTT直接退出房间断开socket
    public override onClickExit() {
        this.uirc.HideMenu(false);
        this.CallbackExit();
        this.SMAgency.ChangeGameState(TexasGameState.Exit, null);
    }
    public override CallbackExit() {
        this.TexasGameUtils.LeaveRoom();
    }
    /// <summary>
    /// 带入
    /// </summary>
    /// <param name="anteNumber"></param>
    /// <param name="addChip"></param>
    /// <param name="storeChip"></param>
    /// <param name="isAutoAddChips"></param>
    public override AddChips(anteNumber: number, addChip: number = 0, isAutoAddChips: boolean = false, clubid = 0, clubrandomid = 0) {
        ProtocolAgency.Send<ClientMessageAddOn.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_AddOn,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body:
            {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                // mode: this.addOnMode,
                // ratio: 1,
                // useProp: false,
                useProp: false,
                ratio: 1,
                mode: this.addOnMode,
                usedPropId: 0,
                propType: 0,
                useFree: false,
            },
        });
    }
    // public override  GPSCallback_Sitdown() {

    // }


    // 操作加时
    public override onClickDelay() {
        if (this.delayCount >= 2)
            return;
        if (!this.uirc.UIOperation_Com.node.activeInHierarchy) {
            UIComponent.Instance.Toast(i18nMgr.Get("ServerErrorCode_31045"));
            return;
        }
        this.ClickAddTime = true;

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

    // public override CheckPlayerInfo(userId: number, player: CPlayer = null) {
    //     UIComponent.open(UIDefine.UITexasPlayerInfo, [userId, false], { parentUI: Main.Marquee });
    // }

    // 实时战况
    public override onClickReport() {
        if (!this.hadRequestEnterRoom) return;
        UIComponent.open(UIDefine.MttRealTime, null, { parentUI: this.uirc.Common_Con });
        // UIComponent.Instance.ShowNoAnimation(UIType.UITexasReportMTT, new object[1] { true });
    }

    public override onClickCurSituation() {
        if (!this.hadRequestEnterRoom) return;
        super.onClickCurSituation();
    }



    public override refreshCoinAndChip(menu: UITexasMenu) {

        if (GameCache.Instance.match_id > 0) {

            WWW.Instance.CommonAPI(
                {
                    web_class: Web_Room_Center_Mtt_User_Wallet,
                    api_id: GameCache.Instance.match_id
                }
            ).then(
                (res: any) => {
                    if (res.data.wallet != null) {
                        if (res.data.wallet.length == 1) {
                            GameCache.Instance.ClubID = res.data.wallet[0].club_id;
                            GameCache.Instance.gold_type = res.data.wallet[0].gold_type;
                            GameCache.Instance.ClubRandomID = res.data.wallet[0].club_random_id;
                            GameCache.Instance.ClubGold = res.data.wallet[0].gold;
                        }
                        else if (res.data.wallet.length > 1) {
                            for (let i = 0; i < res.data.wallet.length; i++) {
                                let wallet = res.data.wallet[i];
                                if (GameCache.Instance.TribeId == wallet.tribe_id) {
                                    GameCache.Instance.ClubID = wallet.club_id;
                                    GameCache.Instance.gold_type = wallet.gold_type;
                                    GameCache.Instance.ClubRandomID = wallet.club_random_id;
                                    GameCache.Instance.ClubGold = wallet.gold;
                                    break;
                                }
                            }
                        }
                        if (GameCache.Instance.ClubID > 0) {


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
                        }
                        //buttonAddBean.transform.Find("chip_bg").gameObject.SetActive(GameCache.Instance.FriendsTableLimitBringIn);

                        menu.$node_coin.getChildByName("uc").active = GameCache.Instance.gold_type == 1;
                        menu.$node_coin.getChildByName("gc").active = GameCache.Instance.gold_type == 2;
                        menu.$node_coin.getChildByName("add").active = menu.$node_coin.getChildByName("click").active = GameCache.Instance.gold_type == 1 || GameCache.Instance.gold_type == 2;
                        let chips = GameCache.Instance.CurGame.mainPlayer?.cacheStoreChips || 0;
                        menu.$node_storage.active = chips > 0;

                    }

                },
                (res: any) => {

                }
            )
        }

    }



    //刷新边菜单
    public override UpdateMenu() {


        let menu = this.uirc.UITexasMenu;

        this.refreshCoinAndChip(menu);

        //buttonRule.transform.Find("Text").GetComponent<Text>().text = LanguageManager.Get("UITexas_RuleOfTips");

        menu.clearOptions();

        let show = [3, 10];//设置|离开


        if (this.UserSitdown()) //已坐下
        {

            show.push(8);

            menu.setOptionInteractable(8, !this.uirc.Button_CancelTrust.active);

        }

        if (this.gameStarted) {
            menu.setOptionInteractable(8, true);
        }
        else {
            menu.setOptionInteractable(8, false);
        }

        show.forEach(index => {
            let option = menu.getOption(index);
            option.node.active = true;
        })

    }

    //更新addon 按钮状态
    public ShowAddOnBtn() {
        this.uirc.Button_AddOn.active = (this.addOnMode != Def.AddOnMode.ADDON_NONE && this.gameStarted);
        this.uirc.setButtonInteractable(this.uirc.Button_AddOn, this.IsShowAddOnBtn());

    }
    private IsShowAddOnBtn(): boolean {
        if (this.mainPlayer == null || this.addOnModeDate == null) {
            return false;
        }
        switch (this.addOnMode) {
            case Def.AddOnMode.ADDON_NONE:
                return false;
            case Def.AddOnMode.ADDON_NORMAL:
                if (!this.mainPlayer.AddOn && this.startAddOnLevel < this.BlindLevel + 1 && this.endAddOnLevel > this.BlindLevel) {
                    //cc.log("AddonNormal is true:" + startAddOnLevel + " " + BlindLevel + " " + endAddOnLevel);
                    return true;
                }
                else {
                    return false;
                }
            case Def.AddOnMode.PLUS_MODE1:
                if (
                    this.mainPlayer.seatID > -1 &&
                    this.mainPlayer.canPlayStatus == Def.CanPlayStatus.NORMAL &&
                    !this.mainPlayer.usedAddon &&
                    this.mainPlayer.cacheChips < this.addOnModeDate.AddOnPlusMode1Limit &&
                    this.mainPlayer.AddonPlusMode1Times < this.addOnModeDate.AddOnPlusMode1MaxTimes &&
                    this.BlindLevel < this.MaxRebuyBlindLevel
                ) {
                    return true;
                }
                else {
                    return false;
                }
            case Def.AddOnMode.PLUS_MODE2:
                if (
                    this.mainPlayer.seatID > -1 &&
                    !this.mainPlayer.usedAddon &&
                    this.mainPlayer.AddonPlusMode2Times < this.addOnModeDate.AddOnPlusMode2MaxTimes &&
                    this.BlindLevel >= this.MaxRebuyBlindLevel &&
                    this.BlindLevel < this.addOnModeDate.AddOnPlusMode2EndBl
                ) {
                    return true;
                }
                else {
                    return false;
                }

            default:
                return false;

        }
    }

    public override  UpdateRoomDes() {
        //StringBuilder mStringBuilder = new StringBuilder();
        let info: string = "";
        if (GameCache.Instance.match_id > 0) {
            //mStringBuilder.AppendLine($"{LanguageManager.Get("UITexasReport_Text_DeskNumTip")}:{GameCache.Instance.room_id}-{mHandNum}");
            info += `${i18nMgr.Get("UITexasReport_Text_DeskNumTip")}:${GameCache.Instance.room_id}-${this.mHandNum}`;
        }

        info += `\n${GameCache.Instance.roomName}`;
        info += `\n${this.GetRoomTypeDes()}-${GameCache.Instance.match_id}`;
        info += `\n${i18nMgr.Get("UITexasReport_Text_MatchCurrBlindTip")}:${StringHelper.GetLongStringUnit(this.curBld)}/${StringHelper.GetLongStringUnit(this.curBld * 2)}(${StringHelper.GetLongStringUnit(this.curAnte)})`;
        info += `\n${i18nMgr.Get("UITexasReport_Text_MatchNextBlindTip")}:${StringHelper.GetLongStringUnit(this.nextBld)}/${StringHelper.GetLongStringUnit(this.nextBld * 2)}(${StringHelper.GetLongStringUnit(this.nextAnte)})`;

        if (this.upBlindLeftTime < 0) {
            info += `\n${i18nMgr.Get("MTT_RoomInfo_UpBlindTimeLeft")}${TimeHelper.ShowRemainingSemicolonPure(0)}`;
        }
        else {
            info += `\n${i18nMgr.Get("MTT_RoomInfo_UpBlindTimeLeft")}${TimeHelper.ShowRemainingSemicolonPure(this.upBlindLeftTime)}`
        }
        if (this.isGPSRestrictions && this.isIpRestrictions) {
            // --mStringBuilder.AppendLine("GPS  IP限制");
            info += `\nGPS、IP ${CPErrorCode.LanguageDescription(20008)}`;
        }
        else if (this.isGPSRestrictions && !this.isIpRestrictions) {
            // --mStringBuilder.AppendLine("GPS限制");
            info += `\nGPS ${CPErrorCode.LanguageDescription(20008)}`;
        }
        else if (!this.isGPSRestrictions && this.isIpRestrictions) {
            // --mStringBuilder.AppendLine("IP限制");
            info += `\nIP ${CPErrorCode.LanguageDescription(20008)}`;
        }
        this.uirc.textRoomInfo.string = info;
    }
    // 托管相关
    public override SendTrustAction(enable: boolean = false) {
        ProtocolAgency.Send<ClientMessageAutoOpActive.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_AutoOpActive,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                enable: enable,
            },
        });
    }
    // 隐藏拆桌提示
    public HidePollDownTips() {
        this.isStartShowPullDown = false;
        this.uirc.Image_RedistributionTips.active = false;
    }
}
