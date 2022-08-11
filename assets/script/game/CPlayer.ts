import { Def } from "../protobuf/holdem/define_pb";

export class CPlayer {

    public seatID: number; // 座位号
    public sex: number; // 性别 0男，1女
    public headPic: string; // 头像id
    public nick: string; // 昵称
    public userID: number;
    public chips: number; // 该玩家牌桌上的筹码
    public longitude: string; // 定位lon
    public latitude: string; // 定位lat
    public clientIP: string; // 客户端IP，进房API有返回
    public leavelChips: number;// 玩家的金豆余额
    public ante: number; // 当前这一局各玩家下的赌注
    public anteNumber: number;// 当前操作下注筹码数
    public cards: number[];
    public extraBlind: number;// 各玩家是否补盲 0 1
    public initialBets: number;// 开始的时候玩家下注的筹码(SNG时会返回)
    public muckStatus: number;// 盖牌的状态 0未盖牌 1为盖牌
    public cardType: number;// 赢牌类型 1皇家同花 2同花顺 3四条 4葫芦 5同花 6顺子 7三条 8两对 9一对 10高牌
    public IsAutoOp: boolean;// 托管标志
    public isOffLine: number;//离线，0否，1是
    public playerStatus_insurance: boolean;// 保险人状态（true 正在保险操作）
    public timeLeft_insurance: number;// 保险人剩余时间(单位：秒，对应所有可购买的人，状态不是正在购买的，值为0)
    public totalInsuredAmount: number; // 保险人投保额
    public autoInsuredAmount: number; // 保险人背保额
    public claimInsuredAmount: number; // 保险赔付额
    public delayTimes: number;//已加时次数
    public recyclingChip: number;// 收筹码数量
    public isWin: boolean; // 收筹码玩家是否是赢家 0是 1否
    public winChips: number; // 赢家赢的筹码数
    public isMaxcard: number; // 是否是最大手牌 0是 1不是 未使用
    public huterKill: number;//人头
    public huterAward: number;//奖励
    public huterKillPlus: number;//人头增量
    public MttHunterKillAwardOtherPlus: number;//奖励增量
    public HunterKillAwardOther: number//用户滚雪球猎人,给下家的奖励(MTT)
    public HunterHeadValue: number;//人头价值
    public isFold: boolean; // 是否已弃牌
    public waitNextGame: number; //等带下一手 0 不显示 1 显示
    public actionStatus: number;//动作
    public canPlayStatus: number;//是否可以打牌状态。Normal AgreePost 可以打牌，其余不能
    public RoundActioned: boolean;//还原场景，是否在本轮操作过
    public AddOn: boolean;//用户是否已经Addon
    public AddonPlusMode1Times: number;// 用户已增购次数(MTT) 截止买入/重购前(客户端断线后更新)
    public AddonPlusMode2Times: number;// 用户已增购次数(MTT) 截止买入/重购后(客户端断线后更新)
    public cacheChips: number;//缓存每把开始筹码量，MTT addon plus 模式1 使用 
    public usedAddon: boolean;//本手是否使用过Add on
    public VoiceprintId: number;//声纹ID
    public Sponsor_name: string;//发起声纹验证的人的名字												
    public Sponsor_rid: string;//发起声纹验证人的id
    public UpdateStateTime: number;//声纹改变状态的时间



    /// <summary>
    /// 当前玩家藏钱缓存
    /// </summary>
    public cacheStoreChips:number;


    constructor(public id: number) {

    }


    public SetCards(list: number[]): void {
        if (null == this.cards) this.cards = [];
        if (this.cards.length > 0) this.cards.length = 0;
        //cards.AddRange(list);
        this.cards = this.cards.concat(list);
    }

    public Dispose(): void {
        this.ClearData();
    }
    /// <summary>
    /// 清空数据
    /// </summary>
    protected ClearData(): void {
        this.ClearGameData();
        this.sex = 0;
        this.headPic = "";
        this.nick = "";
        this.userID = 0;
        this.chips = 0;
    }

    /// <summary>
    /// 清空游戏数据
    /// </summary>
    protected ClearGameData(): void {
        this.seatID = -1;
        this.longitude = "";
        this.latitude = "";
        this.clientIP = "";
        this.leavelChips = 0;
        //this.canPlayStatus = CanPlayStatus.Disable;
        //this.actionStatus = Action.None;
        this.ante = 0;
        this.anteNumber = 0;
        //this.cards && this.cards.Clear();
        this.extraBlind = 0;
        this.initialBets = 0;
        this.muckStatus = 0;
        this.cardType = 0;
        this.IsAutoOp = false;
        this.playerStatus_insurance = false;
        this.timeLeft_insurance = 0;
        this.totalInsuredAmount = 0;
        this.autoInsuredAmount = 0;
        this.claimInsuredAmount = 0;
        this.recyclingChip = 0;
        this.isWin = false;
        this.winChips = 0;
        this.isMaxcard = 0;
        this.isFold = false;
        this.AddonPlusMode1Times = 0;
        this.AddonPlusMode2Times = 0;
        this.MttHunterKillAwardOtherPlus = 0;
        this.HunterKillAwardOther = 0;
        this.HunterHeadValue = 0;
        this.VoiceprintId = 0;
        this.Sponsor_name = null;
        this.Sponsor_rid = null;
        this.UpdateStateTime = 0;
    }

}
