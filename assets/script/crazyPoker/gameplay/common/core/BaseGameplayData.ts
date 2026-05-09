import { GameState } from "../constant/TexasGameStatus";
import { MyWheelInfo } from "../../../../protobuf/holdem/define_pb";

/**
 * 核心玩法：数据基类
 */
export default class BaseGameplayData {
    /**
     * 房间唯一ID
     */
    public _roomUniqueId: string = "";

    /**
     * 俱乐部Id
     */
    public _clubId: number = 0;

    /**
     * 联盟id
     */
    public _tribeId: number = 0;

    /**
     * 当前手数
     */
    public _handNo: number = 0;

    /**
     * 当前游戏状态
     */
    public _gameStatus: GameState = GameState.NOT_START;

    /**
     * 玩法是否已开始（结算之前）
     */
    public get _isGameStart(): boolean {
        return this._gameStatus >= GameState.HAND_STARTED && this._gameStatus < GameState.HAND_END;
    }

    /**
     * 是否开启IP限制
     */
    public _isLimitIP: boolean = false;

    /**
     * 是否开启GPS限制
     */
    public _isLimitGPS: boolean = false;

    /**
     * 房间的总时长（分钟）
     */
    public _roomTime: number = 0;

    /**
     * 是否能收到玩法消息：true 观众 false 玩家或管理员
     */
    public _isMsgMuted: boolean = false;

    /**
     * 当前房间是否是安全房
     */
    public _isSafeRoom: boolean = false;

    /**
     * 是否是安全屋模式（安全屋不再静音，可以收到玩家消息，只是收不到手牌和公牌数据）
     */
    public get _isInSafeMode(): boolean {
        return this._isSafeRoom;
    }

    /**
     * 是否为私人房
     */
    public _isPersonalRoom: boolean = false;

    /**
     * 庄家所在位置
     */
    public _bankerLocalSeatId: number = 0;

    /**
     * 上一局庄家
     */
    public _lastBankerLocalSeatId: number = 0;

    /**
     * 最小保留记分牌倍数
     */
    public _limitRetainMinRate: number = 0;

    /**
     * 房间默认操作时间
     */
    public _opDuration: number = 0;

    /**
     * 是否永远发二套牌
     */
    public _isAlwaysSecondPcs: boolean = false;

    /**
     * 是否忽略pre flop轮
     */
    public _isIgnorePreFlop: boolean = false;

    /**
     * 操作延时次数
     */
    public _delayTimes: number = 0;

    /**
     * 看牌阶梯收费次数
     */
    public _lookCardsPlayTimes: number = 0;

    /**
     * 转盘数据
     */
    public _myWheelInfo: MyWheelInfo.AsObject | null = null;

    /**
     * 大盲
     */
    public _bigBlind: number = 0;

    /**
     * 小盲
     */
    public _smallBlind: number = 0;

    /**
     * 最小带入记分牌，如200
     */
    public _minBringIn: number = 0;

    /**
     * 当前最小带入倍数
     */
    public _curMinRate: number = 0;

    /**
     * 当前最大带入倍数
     */
    public _curMaxRate: number = 0;
    
    // 押金
    public _deposit: number = 0;
}
