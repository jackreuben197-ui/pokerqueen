
import GC from "../frame/GameControl";
import { ServerMessageEnterRoom } from "../protobuf/holdem/req_th_enter_room_pb";
import { RoomRecord } from "../protobuf/holdem/define_pb";
import TexasGame from "./texas/TexasGame";
import GameUtil, { GameEnterType } from "./util/GameUtil";
import TexasGameplayData from "../crazyPoker/gameplay/texas/data/TexasGameplayData";
import { AntiCheatType } from "../crazyPoker/gameplay/common/constant/AntiCheatType";
import { VideoModel } from "../crazyPoker/gameplay/common/constant/VideoModel";

export class GameCache {

    public CurrentRoomID: number = 0;


    /// <summary>
    /// 用户登录手机
    /// </summary>
    public strPhone: string = null;

    /// <summary>
    /// 用户登录手机前缀(例"86")
    /// </summary>
    public strPhoneFirst: string = null;

    /// <summary>
    /// 用户登录密码
    /// </summary>
    public strPwd: string = null;
    /// <summary>
    /// 用户user id
    /// </summary>
    public nUserId: number = 0;

    /// 短用户id
    public userId: number = 0;
    /// <summary>
    /// 是否首次登录0、1
    /// </summary>
    public isfirstLogin: number = 0;
    /// <summary>
    /// 登录res服务器的IP或域名
    /// </summary>
    public resIP: string = "";
    /// <summary>
    /// 登录res服务器的端口
    /// </summary>
    public resport: number = 0;
    /// <summary>
    /// 登录game服务器的IP或域名
    /// </summary>
    public roomIP: string = "";
    /// <summary>
    /// 登录game服务器的端口
    /// </summary>
    public roomPort: number = 0;
    /// <summary>
    /// 0男,1女
    /// </summary>
    public sex: number = 0;
    /// <summary>
    /// 消息个数
    /// </summary>
    public msg_count: number = 0;
    /// <summary>
    /// 头像
    /// </summary>
    public headPic: string = "";
    /// <summary>
    /// 昵称
    /// </summary>
    public nick: string = "";
    /// <summary>
    /// 修改昵称次数
    /// </summary>
    public modifyNickNum: number = 0;
    /// <summary>
    /// 金豆余额
    /// </summary>
    public gold: number = 0;
    /// <summary>
    /// 玩家类型 1 普通用户; 2 支桌号; 3 牌局机器人; 4 牛仔机器人
    /// </summary>
    public userType: number = 0;
    /// <summary>
    /// 钻石余额
    /// </summary>
    public idou: number = 0;
    /// <summary>
    /// 会员等级,0普通玩家 1伯爵 2侯爵 3王公
    /// </summary>
    public vipLevel: number = 0;
    /// <summary>
    /// 会员到期日
    /// </summary>
    public vipEndDate: string = "";
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
    public client_ip: string = "";

    /// 用户限制类型 0，1,不限制，2 除巴西 外其他国家注册账号，
    /// </summary>
    public UserlimitType: number = 2;
    /// <summary>
    /// VIP 0 否 ，1 是 
    /// </summary>
    public Vip: number = 0;
    /// <summary>
    /// VIP到期时间
    /// </summary>
    public vip_endtime: string = null;
    /// <summary>
    /// 是否有公会
    /// </summary>
    public isHadClub: boolean = false;
    /// <summary>
    /// 是否已经有过人脸验证
    /// </summary>
    public isSaveFace: boolean = false;
    /// <summary>
    /// 房间名称
    /// </summary>
    public roomName: string = "";
    /** 大厅入口缓存：是否鱿鱼桌（来自列表/分享房间信息） */
    public room_squid_on: number = 0;
    /** 大厅入口缓存：鱿鱼价值（优先 room.squid_base） */
    public room_squid_base: number = 0;
    /** 大厅入口缓存：子配置鱿鱼价值（兜底 sub_configs[0].squid_base） */
    public room_squid_sub_base: number = 0;
    /** 大厅入口缓存：鱿鱼模式（0普通，1血战） */
    public room_squid_mode: number = 0;
    /** 大厅入口缓存：头鱿鱼开关 */
    public room_squid_head: number = 0;
    /** 大厅入口缓存：尾鱿鱼开关 */
    public room_squid_tail: number = 0;
    /** 大厅入口缓存：鱿鱼上限配置 */
    public room_squid_max: number = 0;
    /** 大厅入口缓存：鱿鱼开启人数配置 */
    public room_squid_open_number: number = 0;
    /** 大厅入口缓存：血战鱿鱼额外数量 */
    public room_squid_extra_count: number = 0;
    /** 大厅入口缓存：鱿鱼翻倍配置 */
    public room_squid_count_rate: { count: number, rate: number }[] = [];
    /** 大厅入口缓存：蘑菇开关 */
    public room_mushroom_mode: number = 0;
    /** 大厅入口缓存：蘑菇基础值 */
    public room_mushroom_base: number = 0;
    /** 大厅入口缓存：暴击开关 */
    public room_critical_hit: number = 0;
    /** 大厅入口缓存：暴击轮次 */
    public room_critical_hit_round: number = 0;
    /** 大厅入口缓存：暴击子玩法 ante */
    public room_critical_hit_ante: number = 0;
    /** 大厅入口缓存：CallTime 开关（1 开，2 关） */
    public room_call_time: number = 0;
    /** 大厅入口缓存：CallTime 盈利阈值（BB） */
    public room_call_time_winline: number = 0;
    /** 大厅入口缓存：CallTime 连续手数限制 */
    public room_call_time_count: number = 0;
    /** 大厅入口缓存：付费看手牌模式（0关 1看全部 2看单家） */
    public room_view_player_cards: number = 0;
    /** 大厅入口缓存：Jackpot 配置 */
    public room_jackpot_config: any = null;
    /** 大厅入口缓存：随机入座开关 */
    public room_random_seat: number = 0;
    /** 大厅入口缓存：安全牌桌开关（seated_messaging） */
    public room_seated_messaging: number = 0;
    /** 大厅入口缓存：最小开局人数 */
    public room_min_players: number = 0;
    /** 大厅入口缓存：自动开局最小人数（0 表示手动开始） */
    public room_autostart_min_players: number = 0;

    /** 
     * 进入房间方式
     */
    public _enterRoomType: number = 0;

    /** 大厅入口缓存：是否房管/房主 */
    public room_is_manager: boolean = false;
    /// <summary>
    /// 房间类型 RoomType枚举
    /// </summary>
    public room_type: number = 0;
    /// <summary>
    /// 游戏类型
    /// </summary>
    public game_type: number = 0;
    /// <summary>
    /// 牌类型
    /// </summary>
    public poker_type: number = 0;
    /// <summary>
    /// 下注类型
    /// </summary>
    public bet_type: number = 0;
    /// <summary>
    /// MTT比赛id
    /// </summary>
    public match_id: number = 0;
    /// <summary>
    /// 房间号
    /// </summary>
    public room_id: number = 999;

    /// <summary>
    /// 房间座位
    /// </summary>
    public seat_count: number = 0;
    /// <summary>
    /// MTT类型 6:6人桌，9：9人桌
    /// </summary>
    public mtt_type: number = 0;
    /// <summary>
    /// 是否是猎人赛
    /// </summary>
    public mtt_Hunter_game: boolean = false;
    /// <summary>
    /// 重购的级别, 0为关
    /// </summary>
    public mtt_rebuyLevel: number = 0;
    /// <summary>
    /// 重构再次买入级别（增购开启等级）
    /// </summary>
    public mtt_addoprebuyLevel: number = 0;
    /// <summary>
    /// 当前盲注级别
    /// </summary>
    public currLeve: number = 0;
    /// <summary>
    /// 重构关闭等级（增购关闭等级）
    /// </summary>
    public mtt_addclrebuyLevel: number = 0;
    /// <summary>
    /// 最小带入记分牌，如200
    /// </summary>
    public carry_small: number = 0;
    /// <summary>
    /// 是否开启Straddle 0 1
    /// </summary>
    public straddle: number = 0;
    /// <summary>
    /// 是否开启保险，0 1
    /// </summary>
    public insurance: boolean = false;
    /// <summary>
    /// 0 关闭 1 开启
    /// </summary>
    public muck_switch: number = 0;
    /// <summary>
    /// 最短上桌时间（分钟）
    /// </summary>
    public shortest_time: number = 0;
    /// <summary>
    /// 牌局类型,不需此条件，传值：-1 61 = 德州 91 = 奥马哈 51 = 大菠萝 41 = 必下场 31 = AOF 81 = SNG 71 = MTT
    /// </summary>
    public rtype: number = 0;
    /// <summary>
    /// jackPot基金，如60824
    /// </summary>
    public jackPot_fund: number = 0;
    /**
     * 当前 Jackpot 金额
     */
    public jackPot_gold: number = 0;
    /**
     * 当前展示 Jackpot 金额
     */
    public jackPot_parent_gold: number = 0;
    /// <summary>
    /// 是否开启JackPot，0 1
    /// </summary>
    public jackPot_on: number = 0;
    /// <summary>
    /// JackPotID
    /// </summary>
    public jackPot_id: number = 0;
    /// <summary>
    /// 当前游戏对象
    /// </summary>
    public CurGame: TexasGame = null;
    // 牛仔游戏数据缓存
    //public NiuZaiGameData niuZaiGameData;
    /// <summary>
    /// 组局界面的缓存信息
    /// </summary>
    //public RcConfig[] reconfigs;
    /// <summary>
    /// 牌局内 个人信息 默认页  德州=1,奥马哈=2
    /// </summary>
    public CurInfoRoomPath: number = 0;
    /// <summary>
    /// 0 = 无资格 1 = 调用首次登陆API 2 = 已有首充资格 3 = 待领取
    /// </summary>
    public isActivity: number = 0;
    /// <summary>
    /// 只显示一次活动
    /// </summary>
    public isFirstShowActivity: boolean = true;

    public kDouNum: number = 0;

    public ClubID: number = 0;

    public TribeId: number = 0;

    /// 指定初始桌布
    /// </summary>
    public TableClothTag: string = "";

    public ClubRandomID: number = 0;

    public ClubGold: number = 0;
    /// <summary>
    /// // 延迟看牌0否 1开启
    /// </summary>
    public CurlimitDelaySeeCard: boolean = false;
    /// <summary>
    /// //房间状态
    /// </summary>
    public GameStatus: number = 0;

    //public List<Web_User_Gs.TcpServiceInfo> tcpServiceInfo;

    public serviceId: string = null;

    public ClubUserType: number = 0; //1管理员；2贵宾；3玩家

    public IsMTTbefor: number = 0;//MTT比赛开始前

    public IsAllowOpenDanmu: boolean = true;

    public IsAllowOpenMatchApply: boolean = false;//报名申请开关

    public IsAllowOpenShieldWord: boolean = false;//屏蔽字开关

    public SimulatorName: string = null;  //模拟器名称

    public isMute: boolean = false;//是否禁言

    public cacheMaxBet: number = 0; //最大加注

    public cacheLeftRebuyTimes: number = 0;//剩余重构次数，请求enter  api 更新

    /// <summary>
    /// 绑定银行卡所留的姓名
    /// </summary>
    public bank_UserName: string = null;

    /// <summary>
    /// 银行账号
    /// </summary>
    public bank_account: string = null;

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
    //public isTestflight = null;//苹果testflight（暂时） "IsAppStore"
    //#endregion
    public FCMToken: string = null;

    public origin_type: number = 0;   // 1 平台，2 联盟，3 公会 4 朋友桌
    public share_table: number = 0; //是否共享牌桌及共享牌桌类型  1 不共享 2 USDT桌 3 联盟币桌
    public gold_type: number = 0;//房间币种类型，1 联盟币， 2 usdt, 3 记分牌


    //public limit_bring_in: number = null  //是否开启带入  0/1
    //public invitation_code: any = null  //邀请码  
    public friendBringInStatus: number = 0; // 朋友桌带入申请的状态

    public FriendsTableCode: string = null;//朋友桌邀请码
    public FriendsTableLimitBringIn: boolean = false;//朋友桌公会桌是否控制带入

    public BringCheckRoomIdMap:Record<number,boolean> = {};


    public anti_cheat_type: number = 0;//防作弊类型 0 未知 1 无 2 实时语音 3 实时视频 4 人脸验证 
    /** 新标签可展示最大次数（全局配置） */
    public newLabelsMaxNumber: number = 0;

    private securitySettingRoomsPrivate: number[] = null;

    //密码存储
    privateRoomPdDic: Map<number, string> = new Map();

    //存放 enterroom 消息返回结果
    //public enter_room_res: ServerMessageEnterRoom.AsObject = null;


    //存儲進入房間的參數
    enter_param: { game_enter_type: GameEnterType, isLookOn: boolean } = null;

    /** 
     * 房间记录信息
     */
    public _roomRecord: RoomRecord.AsObject = null;

    /**
     * 德州玩法数据
     */
    public _texasData: TexasGameplayData = new TexasGameplayData();

    /**
     * 房间持续时间（秒）
     */
    public _roomDurationTime: number = 0;

    /**
     * 房间开始时间（Unix时间戳）
     */
    public _roomStartTime: number = 0;

    /**
     * 房间结束时间（Unix时间戳）
     */
    public _roomEndTime: number = 0;

    /**
     * 服务ID
     */
    public _serviceId: string = "";

    /**
     * Straddle最大值
     */
    public _straddleMax: number = 0;

    /**
     * 二副牌开关
     */
    public _secondPcsOn: boolean = false;

    /**
     * 已选择的outs
     */
    public _selectedOuts: number = 0;

    /**
     * 带入限制类型
     */
    public _bringInLimitType: number = 0;

    /**
     * 弃牌开关
     */
    public _muck: number = 0;

    /**
     * 是否显示剩余时间
     */
    public _isShowLeftTime: boolean = false;

    /**
     * 桌布标签
     */
    public _tableSkin: string = "";

    /**
     * 是否共享牌桌及共享牌桌类型
     * 1 不共享 2 USDT桌 3 联盟币桌
     */
    public _shareTableType: number = 0;

    /**
     * 来源类型
     */
    public _originType: number = 0;

    /**
     * 朋友桌邀请码
     */
    public _friendsTableCode: string = "";

    /**
     * 朋友桌带入限制
     */
    public _friendsTableLimitBringIn: boolean = false;

    /**
     * 聊天类型
     */
    public _chatType: number = 0;

    /**
     * 自动充值
     */
    public _autoRecharge: number = 0;

    /**
     * 当前房间ID
     */
    public _currentRoomID: number = 0;

    /**
     * 是否是房管
     */
    public _isRoomManager: boolean = false;

    /**
     * 是否有解散房间权限
     */
    public _isHasDisbandRoomPrivileges: boolean = false;

    /**
     * 是否有离开权限
     */
    public _isHasUseLeavePrivileges: boolean = false;

    /**
     * 是否有站起权限
     */
    public _isHasUserStandUpPrivileges: boolean = false;

    /**
     * 是否有查看视频权限
     */
    public _isHasViewVideoPrivileges: boolean = false;

    /**
     * 创建者ID
     */
    public _creatorId: number = 0;

    /**
     * 结算类型
     */
    public _settlementType: number = 0;

    /**
     * 抽水比例开关
     */
    public _poolRateSwitch: number = 0;

    /**
     * 抽水比例
     */
    public _poolRate: number = 0;

    /**
     * 总手数开关
     */
    public _totalHandSwitch: number = 0;

    /**
     * 总手数
     */
    public _totalHand: number = 0;

    /**
     * 随机座位
     */
    public _randomSeat: number = 0;

    /**
     * 强制亮牌
     */
    public _forceShowCard: number = 0;

    /**
     * 鱿鱼强制亮牌
     */
    public _squidForceShowCard: number = 0;

    /**
     * 仅iOS
     */
    public _onlyIOS: number = 0;

    /**
     * 游戏手数限制
     */
    public _playHandsLimit: number = 0;

    /**
     * 余额不足关闭时长
     */
    public _notEnoughCloseDuration: number = 0;

    /**
     * 游戏时长类型
     */
    public _playDurationType: number = 0;

    /**
     * 延迟限制次数
     */
    public _limitDelayTimes: number = 0;

    /**
     * 查看手牌
     */
    public _lookHandCard: number = 0;

    /**
     * 区块链类型
     */
    public _blockchainType: number = 0;

    /**
     * 带入等于庄家
     */
    public _bringinEqualLeader: number = 0;

    /**
     * 最小玩家筹码比例
     */
    public _minPlayerChipRate: number = 0;

    /**
     * 最大带入总比例
     */
    public _maxBringinTotalRate: number = 0;

    /**
     * Jackpot ID
     */
    public _jackpotId: number = 0;

    /**
     * 自动开始最小玩家数
     */
    public _autoStartMinPlayer: number = 0;

    /**
     * 最小玩家数
     */
    public _minPlayer: number = 0;

    /**
     * 操作持续时间
     */
    public _opDuration: number = 0;

    /**
     * 轮盘模板ID
     */
    public _wheelTemplateId: number = 0;

    /**
     * 反作弊类型
     */
    public _antiCheatType: AntiCheatType = AntiCheatType.UNKNOWN;

    /**
     * 视频模式
     */
    public _videoModel: VideoModel = VideoModel.NONE;

    /**
     * 普通反作弊顺序类型
     */
    public _normalAntiCheatOrderType: number = 0;

    /**
     * 普通反作弊麦克风类型
     */
    public _normalAntiCheatOrderMicType: number = 0;

    /**
     * 反作弊时间限制
     */
    public _antiCheatTimeLimit: number = 0;

    /**
     * 视频效果类型
     */
    public _videoEffectType: number = 0;

    /**
     * 视频省电模式
     */
    public _videoPowerSaving: number = 0;

    /**
     * 视频验证类型
     */
    public _videoVerifyType: number = 0;

    /**
     * 随机验证：是否正在强制验证中
     */
    public _randomVideoActive: boolean = false;

    /**
     * 随机验证：倒计时结束时间戳（毫秒）
     */
    public _randomVideoEndTime: number = 0;

    /**
     * 麦序模式：当前是否正在自己的操作轮次中（视频不可关闭）
     */
    public _sequenceVideoActive: boolean = false;

    /**
     * 白名单
     */
    public _isWhiteList: boolean = false;

    /**
     * 多语言
     */
    public _multiLanguage: any = null;

    //存储bb开关的状态 room_id || match_id
    private bb_status_map:Record<number, boolean> = {};

    public curSelectWalletType: number;//当前选择钱包类别，1 基金，2 玩家钱包
    /** 
     * 来自哪个俱乐部Id
     */
    public _fromClubId: number = 0;


    //  isActiveLeaving 
    public isActiveLeaving: boolean = false;


    public static get Instance(): GameCache {
        return (this as any).instance ??= new GameCache;
    }

    private get securitySettingRooms(): number[] {
        if (this.securitySettingRoomsPrivate == null) {
            const value = cc.sys.localStorage.getItem("SecuritySettingRooms") || "";
            this.securitySettingRoomsPrivate = value
                .split(",")
                .map((v:string) => Number(v))
                .filter((v:number) => Number.isFinite(v) && v > 0);
        }
        return this.securitySettingRoomsPrivate;
    }

    public HasSecuritySettingRoom(roomId: number): boolean {
        if (roomId <= 0) return false;
        return this.securitySettingRooms.indexOf(roomId) >= 0;
    }

    public SetSecuritySettingRoom(roomId: number): void {
        if (roomId <= 0) return;

        const list = this.securitySettingRooms;
        const idx = list.indexOf(roomId);
        if (idx >= 0) {
            list.splice(idx, 1);
        }
        list.push(roomId);
        if (list.length > 10) {
            list.splice(0, list.length - 10);
        }
        cc.sys.localStorage.setItem("SecuritySettingRooms", list.join(","));
    }

    InitTexasGame() {
        this.CurGame = GameUtil.InstantiateTexasGame(this.room_type);
    }

    // InitEnterRoomInfo(room_info: EnterRoomInfo) {


    //     console.log('GameCache -> InitEnterRoomInfo)');

    //     const subConfigs = room_info.sub_configs || [];
    //     const sub0 = (subConfigs && subConfigs.length > 0) ? subConfigs[0] : null;
    //     const roomAdminAny = (room_info as any).room_admin ?? (room_info as any).roomAdmin ?? null;
    //     const roomAdminFlag = roomAdminAny?.is_admin ?? roomAdminAny?.isAdmin;
    //     const creatorRandomId = Number((room_info as any).creator_random_id ?? (room_info as any).creatorRandomId ?? 0);
    //     const creatorId = Number((room_info as any).creator_id ?? (room_info as any).creatorId ?? 0);

    //     GameCache.Instance.serviceId = room_info.service_id;
    //     GameCache.Instance.roomName = GC.data.languageTemp.temp.getName(room_info.name);
    //     GameCache.Instance.room_squid_sub_base = sub0?.sqb || 0;
    //     GameCache.Instance.room_squid_base =
    //         (room_info.squid_base || 0) > 0 ? room_info.squid_base : GameCache.Instance.room_squid_sub_base;
    //     GameCache.Instance.room_squid_mode = room_info.squid_mode || 0;
    //     GameCache.Instance.room_squid_head = room_info.squid_head || 0;
    //     GameCache.Instance.room_squid_tail = room_info.squid_tail || 0;
    //     GameCache.Instance.room_squid_max = room_info.squid_max || 0;
    //     GameCache.Instance.room_squid_on =
    //         room_info.squid_on ?? ((GameCache.Instance.room_squid_base > 0 || GameCache.Instance.room_squid_sub_base > 0) ? 1 : 0);
    //     GameCache.Instance.room_squid_open_number = sub0?.ppcl || room_info.squid_player_count || 2;
    //     GameCache.Instance.room_squid_extra_count = Number(room_info.squid_extra_count || 0);
    //     GameCache.Instance.room_squid_count_rate = (room_info.squid_count_rate || [])
    //         .map((cfg: any) => ({ count: Number(cfg?.count || 0), rate: Number(cfg?.rate || 0) }))
    //         .filter(cfg => cfg.count > 0 && cfg.rate > 0)
    //         .sort((a, b) => a.count - b.count);
    //     GameCache.Instance.room_mushroom_mode = room_info.mushroom_mode || 0;
    //     GameCache.Instance.room_mushroom_base = room_info.mushroom_base || 0;
    //     GameCache.Instance.room_critical_hit =
    //         room_info.critical_hit ?? sub0?.critical_hit ?? sub0?.criticalHit ?? 0;
    //     GameCache.Instance.room_critical_hit_round =
    //         room_info.rounds ?? 0;
    //     GameCache.Instance.room_critical_hit_ante =
    //         sub0?.ante ?? sub0?.an ?? room_info.sub_game_play_ante ?? 0;
    //     GameCache.Instance.room_call_time = Number(room_info.call_time || 0);
    //     GameCache.Instance.room_call_time_winline = Number(room_info.call_time_winline || 0);
    //     GameCache.Instance.room_call_time_count = Number(room_info.call_time_count || 0);
    //     GameCache.Instance.room_view_player_cards = Number(room_info.view_player_cards ?? room_info.viewPlayerCards ?? 0);
    //     const jackpotConfigRaw = room_info.jackpot_config ?? room_info.jackpotConfig ?? null;
    //     if (typeof jackpotConfigRaw === "string") {
    //         try {
    //             GameCache.Instance.room_jackpot_config = JSON.parse(jackpotConfigRaw);
    //         } catch {
    //             GameCache.Instance.room_jackpot_config = null;
    //         }
    //     } else {
    //         GameCache.Instance.room_jackpot_config = jackpotConfigRaw || null;
    //     }
    //     GameCache.Instance.jackPot_on = Number(room_info.jackpot || 0);
    //     GameCache.Instance.jackPot_id = Number(room_info.jackpot_id ?? room_info.jackpotId ?? 0);
    //     GameCache.Instance.jackPot_gold = Number(room_info.jackpot_gold ?? room_info.jackpotGold ?? 0);
    //     GameCache.Instance.jackPot_parent_gold = Number(
    //         room_info.jackpot_parent_gold
    //         ?? room_info.jackpotParentGold
    //         ?? GameCache.Instance.jackPot_gold
    //         ?? 0
    //     );
    //     GameCache.Instance.jackPot_fund = GameCache.Instance.jackPot_parent_gold;
    //     GameCache.Instance.room_random_seat = Number(room_info.random_seat || 0);
    //     GameCache.Instance.room_seated_messaging = Number(room_info.seated_messaging || 0);
    //     GameCache.Instance.room_min_players = Number((room_info as any).min_players ?? (room_info as any).minPlayers ?? 0);
    //     GameCache.Instance.room_autostart_min_players = Number((room_info as any).autostart_min_players ?? (room_info as any).autostartMinPlayers ?? 0);
    //     if (roomAdminFlag !== undefined && roomAdminFlag !== null) {
    //         GameCache.Instance.room_is_manager = roomAdminFlag === true || Number(roomAdminFlag) === 1;
    //     } else {
    //         GameCache.Instance.room_is_manager =
    //             (creatorRandomId > 0 && creatorRandomId === Number(GameCache.Instance.nUserId || 0)) ||
    //             (creatorId > 0 && creatorId === Number(GameCache.Instance.userId || 0));
    //     }
    //     GameCache.Instance._enterRoomType = room_info.room_type;
    //     GameCache.Instance.room_type = room_info.room_type;
    //     GameCache.Instance.game_type = room_info.game_type;
    //     GameCache.Instance.poker_type = room_info.poker_type;
    //     GameCache.Instance.bet_type = room_info.limit_bet_type;
    //     GameCache.Instance.room_id = room_info.rid;
    //     GameCache.Instance.seat_count = room_info.seat_count;
    //     GameCache.Instance.straddle = room_info.straddle_on;
    //     GameCache.Instance.insurance = room_info.insurance_on > 0;
    //     GameCache.Instance.muck_switch = room_info.muck_on;
    //     GameCache.Instance.voiceprint_verify_on = room_info.voiceprint_verify_on;
    //     GameCache.Instance.voiceprint_verify_duration = room_info.voiceprint_verify_duration;
    //     GameCache.Instance.origin_type = room_info.origin_type || 0;
    //     GameCache.Instance.share_table = room_info.share_table || 0;
    //     //GameCache.Instance.limit_bring_in = room_info.limit_bring_in || 0
    //     //GameCache.Instance.invitation_code = room_info.invitation_code;
    //     GameCache.Instance.gold_type = room_info.gold_type || 0;
    //     GameCache.Instance.anti_cheat_type = room_info.anti_cheat_type || 0;

    //     GameCache.Instance.FriendsTableCode = room_info.invitation_code;
    //     GameCache.Instance.FriendsTableLimitBringIn = room_info.limit_bring_in > 0;

    //     GameCache.Instance.ClubID = room_info.club_id;
    //     GameCache.Instance.TribeId = room_info.tribe_id;
    // }

    //获取bb开关
    get bb_on() {
        let id = GameCache.Instance.room_id || GameCache.Instance.match_id;
        return this.bb_status_map[id] || false;
    }
    //设置bb开关
    set bb_on(boo: boolean) {
        let id = GameCache.Instance.room_id || GameCache.Instance.match_id;
        this.bb_status_map[id] = boo;
    }


}
// export interface EnterRoomInfo {
//     service_id?;
//     name?;
//     room_type?;
//     game_type?;
//     poker_type?;
//     limit_bet_type?;
//     rid?;
//     seat_count?;
//     straddle_on?;
//     insurance_on?;
//     muck_on?;
//     voiceprint_verify_on?;
//     voiceprint_verify_duration?;
//     origin_type?;
//     limit_bring_in?;
//     invitation_code?;
//     share_table?;
//     gold_type?;
//     anti_cheat_type?;
//     club_id?;
//     tribe_id?;
//     squid_on?;
//     squid_base?;
//     squid_mode?;
//     squid_head?;
//     squid_tail?;
//     squid_max?;
//     squid_extra_count?;
//     squid_count_rate?: { count?: number, rate?: number }[];
//     mushroom_mode?;
//     mushroom_base?;
//     critical_hit?;
//     call_time?;
//     call_time_winline?;
//     call_time_count?;
//     view_player_cards?;
//     viewPlayerCards?;
//     jackpot_config?;
//     jackpotConfig?;
//     random_seat?;
//     seated_messaging?;
//     min_players?;
//     minPlayers?;
//     autostart_min_players?;
//     autostartMinPlayers?;
//     room_admin?: { is_admin?: number | boolean };
//     roomAdmin?: { isAdmin?: number | boolean };
//     creator_random_id?;
//     creatorRandomId?;
//     creator_id?;
//     creatorId?;
//     sub_game_play_ante?;
//     rounds?;
//     sub_configs?;
//     squid_player_count?;
//     jackpot?;
//     jackpot_id?;
//     jackpotId?;
//     jackpot_gold?;
//     jackpotGold?;
//     jackpot_parent_gold?;
//     jackpotParentGold?;

// }
(window as any).GameCache = GameCache;
