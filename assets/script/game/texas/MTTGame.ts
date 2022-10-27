import { Def } from "../../protobuf/holdem/define_pb";
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
}
export default class MTTGame extends TexasGame {
    static MTTMatchStatus = MTTMatchStatus;
    static MTTPlayerStatus = MTTPlayerStatus;
    static AddOnModeDate = AddOnModeDate;
    ///////////////////////////////////////////
    protected buttonRebuy: cc.Node = null;
    protected buttonAddOn: cc.Node = null;
    protected transCountDownView: cc.Node = null;
    public imageRedistributionTips: cc.Sprite = null;
    private pullDownText: cc.Label = null;
    public Image_WaitForStartBathTips: cc.Node = null;
    public BathText: cc.Label = null;
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
    private addOnMode: Def.AddOnModeMap;
    private CurrentOpAddOnMode: Def.AddOnModeMap;
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
}
