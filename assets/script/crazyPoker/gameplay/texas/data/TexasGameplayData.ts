import { RoomJackpotConfig, SquidCountRateConfig } from "../../../../protobuf/holdem/define_pb";

/**
 * 德州：核心玩法数据
 */
export default class TexasGameplayData {
    /**
     * 是否开启保险
     */
    public _isOpenInsurance: boolean = false;

    /**
     * 保险类型
     */
    public _insuranceMode: number = 0;

    /**
     * 购买ev保险值
     */
    public _buyEVInsurance: number = 0;

    /**
     * 延迟看牌
     */
    public _isOpenDelaySeeCard: boolean = false;

    /**
     * 当前轮
     */
    public _round: number = 0;

    /**
     * 操作截止的时间戳
     */
    public _opDeadline: number = 0;

    /**
     * 当前操作玩家所在位置
     * 默认为-1
     */
    public _operatorSeatId: number = -1;

    /**
     * 是否为Bombpot牌桌玩法
     */
    public _isBombPot: boolean = false;

    /**
     * 大盲所在位置
     */
    public _bigBlindLocalSeadId: number = 0;

    /**
     * 小盲所在位置
     */
    public _smallBlindLocalSeatId: number = 0;

    /**
     * 总底池
     */
    public _allBet: number = 0;

    /**
     * 允许带出记分牌 0否 1 自动  2手动
     */
    public _retainType: number = 0;

    /**
     * 保持下限
     */
    public _retainMinRate: number = 0;

    /**
     * 保持上限
     */
    public _retainMaxRate: number = 0;

    /**
     * 前注
     */
    public _ante: number = 0;

    /**
     * 强制盲注
     */
    public _isStraddle: boolean = false;

    /**
     * Mtt锦标赛数据
     */
    public _mtt: any = null;

    /**
     * Jackpot开关，1-开  2-关
     */
    public _jackpot: number = 2;

    /**
     * Jackpot奖池金额
     */
    public _jackpotGold: number = 0;

    /**
     * Jackpot主模版奖池金额
     */
    public _jackpotParentGold: number = 0;

    /**
     * 手数
     */
    public _callTimeCount: number = 0;

    /**
     * 是否满足callTime条件
     */
    public _callTimeStay: boolean = false;

    /**
     * 总盈利
     */
    public _winTotal: number = 0;

    /**
     * Jackpot奖池配置
     */
    public _jackpotConfig: RoomJackpotConfig.AsObject | null = null;

    /**
     * 单个鱿鱼的金额，大于0表示有鱿鱼玩法
     */
    public _squidBase: number = 0;

    /**
     * 是否是鱿鱼玩法
     */
    public get _isSquidEnable(): boolean {
        return this._squidBase > 0;
    }

    /**
     * 独揽鱿鱼 1 开 0 关
     */
    public _squidMostGet: number = 0;

    /**
     * 无动作获胜无鱿鱼 1 开 0 关
     */
    public _squidBetGet: number = 0;

    /**
     * 是不是头鱿鱼双倍 1开 0关
     */
    public _squidHead: number = 0;

    /**
     * 是不是尾鱿鱼双倍 1开 0关
     */
    public _squidTail: number = 0;

    /**
     * 鱿鱼模式 0经典  1血战
     */
    public _squidMode: number = 0;

    /**
     * 额外的鱿鱼个数（血战）
     */
    public _squidExtraCount: number = 0;

    /**
     * 当前是不是在鱿鱼轮
     * 接受到鱿鱼轮结束的消息不代表不在鱿鱼轮
     * 得看_isGameInSquidRoundReal
     */
    public _isGameInSquidRound: boolean = false;

    /**
     * 当前是不是在鱿鱼轮
     * 一直是正确的
     */
    public _isGameInSquidRoundReal: boolean = false;

    /**
     * 惩罚池数量
     */
    public _squidPunishPoolNum: number = 0;

    /**
     * 获得的最大的鱿鱼数
     */
    public _squidMaxCount: number = 0;

    /**
     * 当前持续第几个回合,一般为手数,鱿鱼为次数
     */
    public _squidCurrentRound: number = 0;

    /**
     * 玩几手进入鱿鱼轮
     */
    public _squidRound: number = 0;

    /**
     * 鱿鱼至少几个开启
     */
    public _squidOpenNumber: number = 0;

    /**
     * 血战模式。 最大鱿鱼数
     */
    public _squidMaxNum: number = 0;

    /**
     * 鱿鱼数量配置列表
     */
    public _squidCountRates: SquidCountRateConfig.AsObject[] = [];

    /**
     * 鱿鱼存款百分比
     */
    public _squidDepositPercent: number = 0;

    /**
     * 蘑菇模式 0 不是蘑菇玩法 1 正常模式 2 前注模式
     */
    public _mushroomMode: number = 0;

    /**
     * 蘑菇玩法 一蘑菇等于多少筹码
     */
    public _mushroomBase: number = 0;

    /**
     * 蘑菇玩法是否开启
     */
    public get _isMushroomEnable(): boolean {
        return this._mushroomMode > 0;
    }

    /**
     * 子玩法的ante
     */
    public _subGamePlayAnte: number = 0;

    /**
     * 子玩法的ante BB
     */
    public get _subGamePlayAnteBB(): number {
        return this._subGamePlayAnte / this._bigBlind;
    }

    /**
     * 暴击玩法是否开启
     */
    public _isCriticalHitEnable: boolean = false;

    /**
     * 暴击玩法轮次
     */
    public _criticalHitRound: number = 0;

    /**
     * 当前暴击轮次
     */
    public _curCriticalHitRound: number = 0;

    /**
     * 本轮是否是暴击开启
     */
    public _isCriticalHitOpen: boolean = false;

    /**
     * ante随机跳配置
     */
    public _anteRandomJumpConfig: string = "";

    /**
     * ante随机跳是否开启
     */
    public get _isAnteRandomJumpEnable(): boolean {
        return this._anteRandomJumpConfig != null && this._anteRandomJumpConfig.length > 0;
    }

    /**
     * 购买保险池的人数
     */
    public _buyInsurancePotUserCount: Map<number, number> = new Map();

    /**
     * 保险赔付
     */
    public _buyInsurancePay: number = 0;

    /**
     * 是否开启calltime 1.开 2.关
     */
    public _callTime: number = 0;

    /**
     * calltime盈利线
     */
    public _callTimeWinline: number = 0;

    /**
     * calltime限制手数
     */
    public _callTimeLimitCount: number = 0;

    /**
     * 俱乐部垫付押金
     */
    public _depositAdvance: number = 0;

    /**
     * 保险赢牌列表
     */
    public _playerOutsCards: Map<number, number[]> = new Map();

    /**
     * 买保险的座位
     */
    public _playerOutsCardsInsrueSeatIds: number[] = [];

    /**
     * 最后带出的手数（用于每手只能带出一次）
     */
    public _lastBringOutHandNum: number = 0;

    /**
     * 反作弊自动更换房间手数限制
     */
    public _autoChangeTable: number = 0;

    /**
     * 是不是开启了自动换桌
     */
    public get _isAutoChangeTable(): boolean {
        return this._autoChangeTable > 0;
    }

    /**
     * 当前的手数
     */
    public _currentAutoChangeTable: number = 0;

    /**
     * allIn禁言
     */
    public _allinBanChatType: number = 0;

    /**
     * 是否开启了allin禁言
     */
    public get _isAllinBanChat(): boolean {
        return this._allinBanChatType == 1;
    }

    /**
     * 是否自动弹出带入弹窗
     */
    public _isAutoPopupBringIn: boolean = true;

    /**
     * 保险强制购买比例(0-1000)，0表示不强制购买(千分位)
     */
    public _insuranceForceBuyRatio: number = 0;

    /**
     * 德州即时战况
     */
    public _situation: any = null;

    /**
     * 大盲注
     */
    private _bigBlind: number = 0;

    public set bigBlind(value: number) {
        this._bigBlind = value;
    }

    public get bigBlind(): number {
        return this._bigBlind;
    }
}
