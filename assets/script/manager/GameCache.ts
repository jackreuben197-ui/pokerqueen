
import TexasGame from "../game/TexasGame";
import GameUtil from "../tools/GameUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCache {

    private static _instance: GameCache;

    CurrentRoomID: number = 0;


    /// <summary>
    /// 用户登录手机
    /// </summary>
    public strPhone: string;

    /// <summary>
    /// 用户登录手机前缀(例"86")
    /// </summary>
    public strPhoneFirst: string;

    /// <summary>
    /// 用户登录密码
    /// </summary>
    public strPwd: string;
    /// <summary>
    /// 用户user id
    /// </summary>
    public nUserId: number;
    /// <summary>
    /// 是否首次登录0、1
    /// </summary>
    public isfirstLogin: number;
    /// <summary>
    /// 登录res服务器的IP或域名
    /// </summary>
    public resIP: string;
    /// <summary>
    /// 登录res服务器的端口
    /// </summary>
    public resport: number;
    /// <summary>
    /// 登录game服务器的IP或域名
    /// </summary>
    public roomIP: string;
    /// <summary>
    /// 登录game服务器的端口
    /// </summary>
    public roomPort: number;
    /// <summary>
    /// 0男,1女
    /// </summary>
    public sex: number;
    /// <summary>
    /// 消息个数
    /// </summary>
    public msg_count: number;
    /// <summary>
    /// 头像
    /// </summary>
    public headPic: string;
    /// <summary>
    /// 昵称
    /// </summary>
    public nick: string;
    /// <summary>
    /// 修改昵称次数
    /// </summary>
    public modifyNickNum: number;
    /// <summary>
    /// 金豆余额
    /// </summary>
    public gold: number;
    /// <summary>
    /// 玩家类型 1 普通用户; 2 支桌号; 3 牌局机器人; 4 牛仔机器人
    /// </summary>
    public userType: number;
    /// <summary>
    /// 钻石余额
    /// </summary>
    public idou: number;
    /// <summary>
    /// 会员等级,0普通玩家 1伯爵 2侯爵 3王公
    /// </summary>
    public vipLevel: number;
    /// <summary>
    /// 会员到期日
    /// </summary>
    public vipEndDate: string;
    /// <summary>
    /// 经度
    /// </summary>
    public longitude: string = "0";
    /// <summary>
    /// 纬度
    /// </summary>
    public latitude: string = "0";
    /// <summary>
    /// 定位到的地址名称
    /// </summary>
    public locationName: string = "";
    /// <summary>
    /// 当前客户端的ip地址，在牌局内坐下带入时要用到
    /// </summary>
    public client_ip: string;
    /// <summary>
    /// 房间名称
    /// </summary>
    public roomName: string;
    /// <summary>
    /// 房间类型 RoomType枚举
    /// </summary>
    public room_type: number;
    /// <summary>
    /// 游戏类型
    /// </summary>
    public game_type: number;
    /// <summary>
    /// 牌类型
    /// </summary>
    public poker_type: number;
    /// <summary>
    /// 下注类型
    /// </summary>
    public bet_type: number;
    /// <summary>
    /// MTT比赛id
    /// </summary>
    public match_id: number = 0;
    /// <summary>
    /// 房间号
    /// </summary>
    public room_id: number = 0;
    /// <summary>
    /// 房间座位
    /// </summary>
    public seat_count: number;
    /// <summary>
    /// MTT类型 6:6人桌，9：9人桌
    /// </summary>
    public mtt_type: number;
    /// <summary>
    /// 是否是猎人赛
    /// </summary>
    public mtt_Hunter_game;
    /// <summary>
    /// 重购的级别, 0为关
    /// </summary>
    public mtt_rebuyLevel: number;
    /// <summary>
    /// 重构再次买入级别（增购开启等级）
    /// </summary>
    public mtt_addoprebuyLevel: number;
    /// <summary>
    /// 当前盲注级别
    /// </summary>
    public currLeve: number;
    /// <summary>
    /// 重构关闭等级（增购关闭等级）
    /// </summary>
    public mtt_addclrebuyLevel: number;
    /// <summary>
    /// 最小带入记分牌，如200
    /// </summary>
    public carry_small: number;
    /// <summary>
    /// 是否开启Straddle 0 1
    /// </summary>
    public straddle: number;
    /// <summary>
    /// 是否开启保险，0 1
    /// </summary>
    public insurance: boolean;
    /// <summary>
    /// 0 关闭 1 开启
    /// </summary>
    public muck_switch: number;
    /// <summary>
    /// 最短上桌时间（分钟）
    /// </summary>
    public shortest_time: number;
    /// <summary>
    /// 牌局类型,不需此条件，传值：-1 61 = 德州 91 = 奥马哈 51 = 大菠萝 41 = 必下场 31 = AOF 81 = SNG 71 = MTT
    /// </summary>
    public rtype: number;
    /// <summary>
    /// jackPot基金，如60824
    /// </summary>
    public jackPot_fund: number;
    /// <summary>
    /// 是否开启JackPot，0 1
    /// </summary>
    public jackPot_on: number;
    /// <summary>
    /// JackPotID
    /// </summary>
    public jackPot_id: number;
    /// <summary>
    /// 当前游戏对象
    /// </summary>
    public CurGame: TexasGame;
    // 牛仔游戏数据缓存
    //public NiuZaiGameData niuZaiGameData;
    /// <summary>
    /// 组局界面的缓存信息
    /// </summary>
    //public RcConfig[] reconfigs;
    /// <summary>
    /// 牌局内 个人信息 默认页  德州=1,奥马哈=2
    /// </summary>
    public CurInfoRoomPath: number;
    /// <summary>
    /// 0 = 无资格 1 = 调用首次登陆API 2 = 已有首充资格 3 = 待领取
    /// </summary>
    public isActivity: number;
    /// <summary>
    /// 只显示一次活动
    /// </summary>
    public isFirstShowActivity: boolean = true;
    public kDouNum: number;

    public ClubID: number;
    /// <summary>
    /// // 延迟看牌0否 1开启
    /// </summary>
    public CurlimitDelaySeeCard: boolean;
    /// <summary>
    /// //房间状态
    /// </summary>
    public GameStatus: number;

    //public List<Web_User_Gs.TcpServiceInfo> tcpServiceInfo;

    public serviceId: string;

    public ClubUserType: number; //1管理员；2贵宾；3玩家

    public IsMTTbefor: number;//MTT比赛开始前

    public IsAllowOpenDanmu: boolean = true;

    public IsAllowOpenMatchApply: boolean = false;//报名申请开关

    public IsAllowOpenShieldWord: boolean = false;//屏蔽字开关

    public SimulatorName: string;  //模拟器名称

    public isMute: boolean;//是否禁言

    public cacheMaxBet: number; //最大加注

    public cacheLeftRebuyTimes: number;//剩余重构次数，请求enter  api 更新

    /// <summary>
    /// 绑定银行卡所留的姓名
    /// </summary>
    public bank_UserName: string;

    /// <summary>
    /// 银行账号
    /// </summary>
    public bank_account: string;

    public voiceprint_verify_on: number = 0;//声纹验证 0 关闭，1 开启。

    public voiceprint_verify_duration: number = 0;//声纹验证 操作人时间
    //#region
    public RoomUIMode: number = 0;//房间列表UI模式开关 1 模式1 ，2 模式2 
    public MTTEntranceMode: number = 2;//MTT开关 1 开 ，2 关
    public ApplePayMode: number = 2;//苹果内购开关 1 开 ，2 关
    public AppleMTTEntranceMode: number = 2;//苹果MTT开关 1 开 ，2 关
    public NormalReturnProfitSwitch: number = 2;//返水
    public AndroidMTTEntranceMode: number = 2;//androidMTT开关 1 开 ，2 关
    public AndroidPayMode: number = 2;//android内购开关 1 开 ，2 关
    public isTestflight;//苹果testflight（暂时） "IsAppStore"
    //#endregion
    public FCMToken: string;


    public static get Instance(): GameCache {
        return this._instance ??= new GameCache();
    }
    constructor() {
        this.nUserId = 0;
    }

    initTexasGame() {
        this.CurGame = GameUtil.InstantiateTexasGame(this.room_type);
    }

}
(window as any).GameCache = GameCache;