/**
 * Http请求接口
 */


/// <summary>
/// 登陆
/// </summary>
export class Web_Login {
    //接口地址
    public static API: string = "/api/user/login";
    //字段声明
    public static RequestParams: {
        phone?: string,        // 手机号
        password?: string,        // 密码MD5
        area?: string,        // 区号ProtocolCode
        device_id?: string,        // 设备唯一id
        mac_addr?: string,        // mac地址
        is_simulator?: boolean,        // 是否是模拟器
        simulator_name?: string,        // 模拟器名称
        system_version?: string,        // 系统版本号
        user_device_no?: string,        // 设备机型
    } = null;

    public static ResponseData: {
        token?: string,        // 手机号
        expire_at?: number,        // 密码MD5
    } = null;


    public static Request(param: typeof Web_Login.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Login.ResponseData };
}

/// <summary>
/// 刷新token
/// </summary>
export class Web_Refresh_Token {
    //接口地址
    public static API: string = "/api/user/refresh";
    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {
        token?: string,        // 手机号
        expire_at?: number,        // 密码MD5
    } = null;

    public static Request(param: typeof Web_Refresh_Token.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Refresh_Token.ResponseData };
}

/// <summary>
/// 验证手机号
/// </summary>
export class Web_User_Check_Phone {
    //接口地址
    public static API: string = "/api/user/check_phone";
    //字段声明
    public static RequestParams: {
        phone?: string,// 手机号码
        area?: string, // 国家代号

    } = null;

    public static ResponseData: {

    } = null;

    public static Request(param: typeof Web_User_Check_Phone.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_User_Check_Phone.ResponseData };
}
/// <summary>
/// 获取验证码
/// </summary>
export class Web_User_Send_Code {
    //接口地址
    public static API: string = "/api/user/sendcode";
    //字段声明
    public static RequestParams: {
        phone?: string,// 手机号码
        area?: string, // 国家代号
    } = null;

    public static ResponseData: {

    } = null;

    public static Request(param: typeof Web_User_Send_Code.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_User_Send_Code.ResponseData };
}

/// <summary>
/// 修改密码
/// </summary>
export class Web_User_Modify_Password {
    //接口地址
    public static API: string = "/api/user/modify/password";
    //字段声明
    public static RequestParams: {
        phone?: string,  // 手机号码
        password?: string, // 密码
        area?: string,  // 国家代号
        code?: string  // 验证码
    } = null;

    public static ResponseData: {
        user_id?: number, s
    } = null;

    public static Request(param: typeof Web_User_Modify_Password.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_User_Modify_Password.ResponseData };
}

/// <summary>
/// 修改个人信息
/// </summary>
export class Web_User_Modify_User_Info {
    //接口地址
    public static API: string = "/api/user/modify/user_info";
    //字段声明
    public static RequestParams: {
        sex?: number,  // 性别
        nick_name?: string, // 名字
        avatar?: string,  // 头像
    } = null;

    public static ResponseData: {
        data?: typeof Web_User_Modify_User_Info.Data,
    } = null;
    public static Data: {
    } = null;

    public static Request(param: typeof Web_User_Modify_User_Info.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_User_Modify_User_Info.ResponseData };
}

/// <summary>
/// 验证用户昵称
/// </summary>
export class Web_User_Check_Nickname {
    //接口地址
    public static API: string = "/api/user/check_nickname";
    //字段声明
    public static RequestParams: {
        nickname?: string, // 名字
    } = null;

    public static ResponseData: {
        data?: typeof Web_User_Modify_User_Info.Data,
    } = null;
    public static Data: {
    } = null;

    public static Request(param: typeof Web_User_Check_Nickname.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_User_Check_Nickname.ResponseData };
}

/// <summary>
/// 手机号注册
/// </summary>
export class Web_User_Register {
    //接口地址
    public static API: string = "/api/user/register";
    //字段声明
    public static RequestParams: {
        phone?: string,// 手机号码
        password?: string,  // 密码
        area?: string, // 国家代号
        code?: string,  // 验证码
        platform?: number,//平台(platform):1-IOS 2-Android 3-Windows 4-OSX 5-Web 6-MiniWeb 7-Linux
    } = null;

    public static ResponseData: {
        userId: number,// 用户id
    } = null;

    public static Request(param: typeof Web_User_Register.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_User_Register.ResponseData };
}

/// <summary>
/// 请求用户数据
/// </summary>
export class Web_User_Info {
    //接口地址
    public static API: string = "/api/user/info";
    public static RequestParams: {
    } = null;
    public static ResponseData: {
        user?: typeof Web_User_Info.UserInfo,        // 用户信息
    } = null;
    public static UserInfo: {
        area?: string,        //手机号地区 例子：+86
        phone?: string,        //手机号
        forbid?: number,        //0禁止登陆; 1正常登录
        gold?: number,        //金豆
        gold_lock?: number,        //被锁金豆
        wallet_status?: number,        //钱包状态
        un_id?: number,        //玩家随机id
        nickname?: string,        //名字
        avatar?: string,        //头像
        sex?: number,        //性别
        birthday?: string,        //生日
        country?: string,        //国家
        city?: string,        //城市
        province?: string,        //省会
        mnt?: number,        //修改用户[名称]次数
        mat?: number,        //修改用户[头像]次数
        ut?: number,        //1 普通用户; 2 支桌号; 3 牌局机器人; 4 牛仔机器人
        forbid_withdraw_gold?: number,        //提现冻结，1 开启，2 关闭
        forbid_bring_in?: number,        //带入冻结，1 开启，2 关闭
    } = null;
    public static Request(param: typeof Web_Login.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_User_Info.ResponseData };
}

/// <summary>
/// 牌局内玩家战绩数据
/// </summary>
export class Web_Stats_Other_User_Stats {
    //接口地址
    public static API: string = "/api/stats/other_user_stats/{id}";
    public static RequestParams: {
    } = null;
    public static ResponseData: {
        data?: typeof Web_Stats_Other_User_Stats.Data,        // 用户信息
    } = null;
    public static MTTRoomData: {
        user_id?: number,
        play_times?: number,        //参赛次数
        win_times?: number,         //获奖次数
        frist_times?: number,       //第一名次数
        second_times?: number,      //第二名次数
        third_times?: number,       //第三名次数
    } = null;
    public static RoomData: {
        id?: number,
        user_id?: number,
        game_type?: number,             //游戏类型： 0-常规桌，1-OMAHA4，2-OMAHA5，3-OMAHA6          
        data_type?: number,             //数据类型 1--今日；2--7天；3--30天；4--生涯
        total_game_cnt?: number,        //总局数
        total_hand?: number,            //总手数
        total_earn?: number,            //总盈亏
        aveage_earn?: number,           //场均战绩
        aveage_earn_hundred?: number,   //战绩/百手
        vpip?: number,                  //入池率
        wins?: number,                  //入池胜率
        prf?: number,                   //翻牌前加注率
        bet3?: number,                  //翻牌前再加注率
        af?: number,                    //激进程度
        cbet?: number,                  //4Flop持续下注率
        wtsd?: number,                  //摊牌胜率
        allinWins?: number,             //全下胜率
    } = null;
    public static Data: {
        mtt_room_data?: typeof Web_Stats_Other_User_Stats.MTTRoomData[],        //mtt数据
        room_data?: typeof Web_Stats_Other_User_Stats.RoomData[],        //普通牌局数据
    } = null;
    public static Request(param: typeof Web_Stats_Other_User_Stats.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Stats_Other_User_Stats.ResponseData };
}

/// <summary>
/// socket channel info
/// </summary>
export class Web_Channel {
    //接口地址
    public static API: string = "/api/user/channel";
    //字段声明
    public static RequestParams: {
    } = null;

    public static ResponseData: {
        port?: number,        // socket port
    } = null;


    public static Request(param: typeof Web_Login.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Channel.ResponseData };
}

/// <summary>
/// 请求频道信息 websocket的port
/// </summary>
export class Web_WS {
    //接口地址
    public static API: string = "/api/user/ws";
    //字段声明
    public static RequestParams: {
    } = null;

    public static ResponseData: {
        port?: number,        // websocket port
    } = null;


    public static Request(param: typeof Web_WS.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_WS.ResponseData };
}

/// <summary>
/// 获取全局配置
/// </summary>
export class Web_Config_Global_Config {

    //接口地址
    public static API: string = "/api/config/global/config";

    //字段声明
    public static RequestParams: {
    } = null;

    public static ResponseData: {
        operating_model?: number,//运营模式 1 直营模式 2 工会联盟模式
        recharge_gold?: number,//直营模式下，充豆功能开关 1 开 2 关
        user_special_recharge?: number,//直营模式下 operating_model=1  支桌号功能开关 1 自动充值（平台充值） 2 手动充值（公会充值） ，3 全选
        user_ordinary_recharge?: number,//直营模式下 operating_model=1  普通用户功能开关 1 自动充值（平台充值） 2 手动充值（公会充值） ，3 全选
        normal_room_model?: number,//模式开关
        apple_pay_switch?: number,//苹果支付服务功能开关 1 开 2 关
        user_modify_name_cost?: number,//修改名字花费
        mtt_switch?: number,//MTT功能开关 1 开 2 关
        normal_return_profit_switch?: number,//返水开关屏蔽 1开，2关
        android_mtt_switch?: number,//androidMTT功能开关 1 开 2 关
        android_pay_switch?: number,//android支付功能开关 1 开 2 关
        apple_mtt_switch?: number,//iosMTT功能开关 1 开 2 关
    } = null;
    public static Request(param: typeof Web_Login.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Config_Global_Config.ResponseData };
}


/// <summary>
/// 获取多语言配置
/// </summary>
export class Web_Config_Multi_Language_Template {

    //接口地址
    public static API: string = "/api/config/multi_language/template";

    //字段声明
    public static RequestParams: {
    } = null;

    public static ResponseData: {
        template_id: string,//对应房间key
        cn_name: string,//中
        us_name: string,//英
        br_name: string,//葡语      
    } = null;
    public static Request(param: typeof Web_Config_Multi_Language_Template.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: (typeof Web_Config_Multi_Language_Template.ResponseData)[] };
}


/// <summary>
/// Banner
/// </summary>
export class Web_Misc_Banner_List {

    //接口地址
    public static API: string = "/api/misc/banner/list";

    //字段声明
    public static RequestParams: {
        lang?: string,        //语言(zh_CN:简体中文,zh_HK:繁体中文,en_US:英文
        type?: number,        //1-大厅Banner,2-发现页(工会)Banner
        limit?: number,        //条目
        offset?: number,        //开始下标。例子（offset=0，limit=10，0-9。）
    } = null;

    public static ResponseData: {
        limit: number,//条目
        offset: number,//开始下标。例子（offset=0，limit=10，0-9。）
        total: number,//总条数
        list: typeof Web_Misc_Banner_List.BannerInfo[]// Banner列表
    } = null;
    public static BannerInfo: {
        id: number,//banner id
        lang: string,//语言
        banner_type: number,//1-大厅Banner,2-发现页(工会)Banner
        image_url: string,//Banner图片连接
        redirect_url: string,//跳转连接
        description: string,//描述
    } = null;

    public static Request(param: typeof Web_Misc_Banner_List.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Misc_Banner_List.ResponseData };
}


/// <summary>
/// 大厅房间列表
/// </summary>
export class Web_Room_Center_Groups {
    //接口地址
    public static API: string = "/api/roomcenter/groups";

    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {
        game_type: number,//游戏类型，0 德州，1奥马哈四张，2 奥马哈五张，3 奥马哈六张
        count: number,//房间数量
        player_count: number,//人数
        sub_group: typeof Web_Room_Center_Groups.DataGroupOne[],
    } = null;
    public static DataGroupOne: {
        game_type: number,//游戏类型，0 德州，1奥马哈四张，2 奥马哈五张，3 奥马哈六张
        count: number,//房间数量
        poker_type: number,//牌类型 0 长牌，1 短牌
        player_count: number,//人数
        sub_group: typeof Web_Room_Center_Groups.DataGroupTwo[],
    } = null;

    public static DataGroupTwo: {
        game_type: number,//游戏类型，0 德州，1奥马哈四张，2 奥马哈五张，3 奥马哈六张
        poker_type: number,//牌类型 0 长牌，1 短牌
        limit_bet_type: number,//下注限制 0 不限制，1 底池限注，2 AOF
        count: number,//房间数量
        player_count: number, //人数
    } = null;

    public static Request(param: typeof Web_Room_Center_Groups.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: (typeof Web_Room_Center_Groups.ResponseData)[] };
}

/// <summary>
/// 未读消息 （只有五条）
/// </summary>
export class Web_Msg_Message_Unread {
    //接口地址
    public static API: string = "/api/msg/message/unread";

    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {
        msg_main_type: number,//消息类型:1-bag,2-club,3-money,4-system,5-tribe
        num: number,//未读消息数量
        title: string,
        content: string,
        remark: string,
        msg_type: number,//消息类型 MessageSubType
        create_time: string,//创建时间
    } = null;
    public static Request(param: typeof Web_Msg_Message_Unread.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: (typeof Web_Msg_Message_Unread.ResponseData)[] };
}
/// <summary>
/// 小盲列表
/// </summary>
export class Web_Room_Center_Rooms_Blinds {
    //接口地址
    public static API: string = "/api/roomcenter/room_blinds";

    //字段声明
    public static RequestParams: {
        game_type: number,//游戏类型
        poker_type: number//牌类型
    } = null;

    public static ResponseData: {
        records: (typeof Web_Room_Center_Rooms_Blinds.DataElement)[]
    } = null;

    public static DataElement: {
        sb: number,//小盲
        cnt: number,//该条件房间数
    } = null;

    public static Request(param: typeof Web_Room_Center_Rooms_Blinds.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: (typeof Web_Room_Center_Rooms_Blinds.ResponseData) };
}
/// <summary>
/// 房间详细列表
/// </summary>
export class Web_Room_Center_Rooms {
    //接口地址
    public static API: string = "/api/roomcenter/rooms";

    //字段声明
    public static RequestParams: {
        limit?: number,//条目
        offset?: number,//开始下标。例子（offset=0，limit=10，0-9。）
        types?: number[],
        sb_min?: number,//小盲
        sb_max?: number,
        ant_min?: number,//前注
        ant_max?: number,
        room_ids?: number[],//房间id
        game_type?: number[],//游戏类型
        poker_type?: number[],//牌类型
        limit_bet_type?: number[],//下注类型
        order?: string[]//排序//oneof=id_asc id_desc start_asc start_desc enter_asc enter_desc eseat_asc eseat_desc seat_asc seat_desc sb_asc sb_desc"
    } = null;

    public static ResponseData: {
        total: number,
        limit: number,
        offset: number,
        records: (typeof Web_Room_Center_Rooms.DataElement)[]
    } = null;

    public static DataElement: {
        rid: number,//房间id
        name: string,//房间名称
        room_type: number,//room path 房间类型
        game_type: number,//游戏类型
        poker_type: number,//牌类型
        limit_bet_type: number,//底池限注类型
        status: number,//房间状态  0 未真是创建，1  已创建 未开始，2 进行中，3 强制关闭，4 即将关闭，5 房间关闭 。 RoomStatus
        ante: number,//前注
        sb: number,//小盲
        op_duration: number,//操作时间
        no_user_wait_duration: number,//无用户等待时间
        keep_seat_duration: number,//留座离桌时间
        total_bring_in: number,//总带入
        total_bring_out: number,//总带出	
        total_chip: number,//总记分牌
        min_rate: number,//最小带入倍率
        max_rate: number,//最大带入倍率
        min_players: number,//最小人数
        autostart_min_players: number,//最小人数自动开桌
        straddle_on: number,//强制盲注开启。1：开启，0：关闭
        straddle_max: number,//强制盲注最大人数
        insurance_on: number,//保险开启。1：开启，0：关闭
        insurance_op_duration: number,//保险操作时间
        delay_view_card_on: number,//延迟看牌。1：开启，0，关闭	
        post_on: number,//补盲开关，1：开启，0，关闭
        muck_on: number,//是否开启盖牌
        limit_ip_on: number,//IP开启
        limit_gps_on: number,//gps开启
        limit_gps_distance: number,//gps 距离
        limit_delay_times: number,//操作延迟次数
        limit_auto_check_times: number,//自动过牌次数
        limit_auto_fold_times: number,//自动弃牌次数
        seat_count: number,//房间座位数量
        empty_seat: number,//剩余空座位
        roomers: number,//房间内人数
        enter_time: string,//允许进入时间	
        play_duration: number,//游戏时长
        retain_type: number,//藏钱类型
        retain_min_rate: number,//最小倍率	
        schedule_start_time: string,//	
        start_time: string,//开始时间
        end_time: string,//结束时间	
        hand_num: number,//手数
        tribe_id: number,//联盟id	
        end_reason: string,//结束原因	
        hc_total_hand_lv: number,//限制总手数胜率
        hc_total_hand: number,//限制总手数	
        hc_pool_rate_lv: number,//限制入池率	
        hc_pool_rate: number,//限制入池数	
        service_id: string,//用于查询IP列表IP Port
        create_time: string,//创建时间	
        update_time: string,//	
        voiceprint_verify_on: number,//开启声纹验证 0 关闭，1 开启。	
        voiceprint_verify_limit_times: number,//该房间次数限制 
        voiceprint_verify_duration: number,//被验证倒计时	
        voiceprint_verify_interval_duration: number,//被验证间隔时间
        participation_status: number,//参与状态:0 未参与 1: 参与中
    } = null;

    public static Request(param: typeof Web_Room_Center_Rooms.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: (typeof Web_Room_Center_Rooms.ResponseData) };
}

// xyh start
export class Web_Room_Center_Rooms_Blinds_CLUB {
    //接口地址
    public static API: string = "/api/roomcenter/club/room_blinds";
}

export class Web_Room_Center_Rooms_CLUB {
    //接口地址
    public static API: string = "/api/roomcenter/club/rooms";
}

export class Web_Gold_Change_Log {
    public static User: string = "/api/user/gold_change/log";  //金豆变动记录
    public static Club: string = "/api/org/club/fund/gold_change/log";  //联盟金豆变动记录
}

//汇率相关接口
export class Web_Rate_Api {
    public static GET_RATE_LIST = "/api/cmsext/exchange/list";       //汇率列表
    public static SET_CLUB_RATE = "/api/cmsext/exchange/set";       //设置工会汇率
    public static DELETE_CLUB_RATE = "/api/cmsext/exchange/delete";       //删除工会汇率
}

export class Web_Order_Rcords {
    // 参数：order_type（订单类型(order_type):1-充豆;2-提豆;3-发豆）
    public static CLUB_RECORD = "/api/order/club/grant_log";  //工会冲提记录
    // user_type（0-未知,1-普通用户,2-支桌号,3-牌局机器人,4-牛仔机器人）
    public static USER_RECORD = "/api/order/user/order_records";  //工会冲提记录
}

export class Web_Club_Issue_Gold {
    // 参数：user_id（用户ID），gold_num（金豆数量）
    public static ISSUE = "/api/order/club/grant";
    public static USER_LIST = "";
    public static SEARCH_USER = "";
}

// xyh end

/// <summary>
/// 查询在该房间保险赔率表
/// </summary>
export class Web_User_Room_insur {
    //接口地址
    public static API: string = "/api/roomcenter/room/{id}/insur";

    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {
        pot_user_count: number,//几人池
        detail: typeof Web_User_Room_insur.Outs[],
    } = null;

    public static Outs: {
        outs: number,//outs 张数
        odds: number//对应outs张数赔率
    } = null;

    public static Request(param: typeof Web_User_Room_insur.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: (typeof Web_User_Room_insur.ResponseData)[] };
}


/// <summary>
/// 查询在该房间带出信息
/// </summary>
export class Web_User_Room {
    //接口地址
    public static API: string = "/api/user/room/{id}";


    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {
        last_bring_out: typeof Web_User_Room.BringOut,
        wallet: typeof Web_User_Room.Wallet,
    } = null;

    public static BringOut: {
        to_wallet: number,//带出（减去服务费后的带出金额）
        fee: number//服务费
    } = null;

    public static Wallet: {
        w_u_id: number,//钱包id
        gold: number,//钱包金额
        gold_lock: number,//被锁定金额
        wallet_status: number,//钱包状态
    } = null;

    public static Request(param: typeof Web_User_Room.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_User_Room.ResponseData };

}

/// <summary>
/// </summary>
export class Web_Org_Club_Create {
    //接口地址
    public static API: string = "/api/org/club/create";


    //字段声明
    public static RequestParams: {
        area_id: null,
        club_name: null,
        desc: null,
        logo: null,
    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof Web_Org_Club_Create.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Create.ResponseData };

}

export class Web_Org_Club_Get {
    //接口地址
    public static API: string = "/api/org/club/user_club";


    //字段声明
    public static RequestParams: {
    } = null;

    public static ResponseData: {
        random_id: number,
    } = null;
    public static Request(param: typeof Web_Org_Club_Create.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Get.ResponseData };

}

export class Web_Recharge_Gold {
    //接口地址
    public static API: string = "/api/order/user/recharge";

    //字段声明
    public static RequestParams: {
    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: { amount: number }) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Get.ResponseData };
}
export class Web_Tiqu_Gold {
    //接口地址
    public static API: string = "/api/order/user/withdraw";

    //字段声明
    public static RequestParams: {
    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: { amount: number }) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Get.ResponseData };

}

export class Web_Recharge_Gold_Club {
    //接口地址
    public static API: string = "/api/order/club/recharge";

    //字段声明
    public static RequestParams: {
    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: { amount: number }) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Get.ResponseData };
}
export class Web_Tiqu_Gold_Club {
    //接口地址
    public static API: string = "/api/order/club/withdraw";

    //字段声明
    public static RequestParams: {
    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: { amount: number }) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Get.ResponseData };

}

export class Web_Org_Club_Player_Apply_List {
    //接口地址
    public static API: string = "/api/org/club/user/join/list";


    //字段声明
    public static RequestParams: {
    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof Web_Org_Club_Player_Apply_List.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Player_Apply_List.ResponseData };

}
export class Web_Org_Club_Search_By_Id {
    //接口地址
    public static API: string = "/api/org/club/info";


    //字段声明
    public static RequestParams: {
        club_random_id: null;
    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof Web_Org_Club_Search_By_Id.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Search_By_Id.ResponseData };

}

export class Web_Org_Club_Join {
    //接口地址
    public static API: string = "/api/org/club/user/join/apply";


    //字段声明
    public static RequestParams: {
        club_id: null;
    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof Web_Org_Club_Join.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Join.ResponseData };

}
export class APIOrgClubCancleJoinClub {
    //接口地址
    public static API: string = "/api/org/club/user/join/cancel";


    //字段声明
    public static RequestParams: {
        apply_id: null;
    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubCancleJoinClub.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof APIOrgClubCancleJoinClub.ResponseData };

}
export class APIOrgClubIsManger {
    //接口地址
    public static API: string = "/api/org/club/admin/has";


    //字段声明
    public static RequestParams: {
        club_id: null;
    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubIsManger.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof APIOrgClubIsManger.ResponseData };

}
export class APIOrgClubApprovalJoin {
    //接口地址
    public static API: string = "/api/org/club/user/join/audit";

    //字段声明
    public static RequestParams: {
        "apply_id": ''
        "audit_op": ''
    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubApprovalJoin.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof APIOrgClubApprovalJoin.ResponseData };
}
export class APIOrgClubGetJoinlList {
    //接口地址
    public static API: string = "/api/org/club/join/list";


    //字段声明
    public static RequestParams: {
    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubGetJoinlList.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof APIOrgClubGetJoinlList.ResponseData };
}
/// <summary>
/// 查询结算信息
/// </summary>
export class Web_User_Room_Settle_Detail {
    //接口地址
    public static API: string = "/api/user/room_settle/detail/{id}";

    //字段声明
    public static RequestParams: {
    } = null;

    public static ResponseData: {
        list: typeof Web_User_Room_Settle_Detail.UsersInfo[],
        self_settle: typeof Web_User_Room_Settle_Detail.SelfSettle
    } = null;

    public static SelfSettle:
        {
            user_random_id: number,
            nick_name: string,//昵称
            avatar: string,//头像
            user_hand_num: number,//手数
            bring_in: number,//带入
            bring_out: number//带出
        } = null;
    public static UsersInfo:
        {
            user_random_id: number,//user id
            nick_name: string,//昵称
            avatar: string,//头像
            user_hand_num: number,//手数
            bring_in: number,//带入
            bring_out: number,//带出
        }

    public static Request(param: typeof Web_User_Room_Settle_Detail.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_User_Room_Settle_Detail.ResponseData };

}

export class APIOrgClubQuit {
    //接口地址
    public static API: string = "/api/org/club/user/quit";


    //字段声明
    public static RequestParams: {
        club_id: null;
    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubQuit.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof APIOrgClubQuit.ResponseData };
}

export class APIOrgClubUploadIcon {
    //接口地址
    public static API: string = "/api/oss/upload/avatar";


    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubUploadIcon.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof APIOrgClubUploadIcon.ResponseData };
}
export class APIOrgMemberList {
    //接口地址
    public static API: string = "/api/org/club/member/list";


    //字段声明
    public static RequestParams: {
        club_id: null;
    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgMemberList.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof APIOrgMemberList.ResponseData };
}
export class APIOrgMangerList {
    //接口地址
    public static API: string = "/api/org/club/admin/list";


    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgMangerList.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof APIOrgMangerList.ResponseData };
}
export class APIOrgClubGold {
    //接口地址
    public static API: string = "/api/org/club/fund/detail";


    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {
        org_id: number, // 公会ID
        gold: number, // 公会金豆数
        gold_lock: number, // 公会被锁定的金豆数
        forbidden: boolean // 是否冻结 true已冻结，false未冻结
    } = null;
    public static Request(param: typeof APIOrgClubGold.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof APIOrgClubGold.ResponseData };
}
export class APIOrgTribeSearchByID {
    //接口地址
    public static API: string = "/api/org/tribe/info";


    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgTribeSearchByID.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof APIOrgTribeSearchByID.ResponseData };
}

export class APIOrgJoinTrip {
    //接口地址
    public static API: string = "/api/org/tribe/club/join/apply";


    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgJoinTrip.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof APIOrgJoinTrip.ResponseData };
}


export class APIOrgChangeClubData {
    //接口地址
    public static API: string = "/api/org/club/modify/club_info";


    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgChangeClubData.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgChangeClubData.ResponseData
    };
}

export class APIOrgCreateTemplate {
    //接口地址
    public static API: string = "/api/cmsext/room/template/create";


    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgCreateTemplate.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgCreateTemplate.ResponseData
    };
}
export class APIOrgGetTemplate {
    //接口地址
    public static API: string = "/api/cmsext/room/template/list";


    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgGetTemplate.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgGetTemplate.ResponseData
    };
}
export class APIOrgTemplateDelete {
    //接口地址
    public static API: string = "/api/cmsext/room/template/delete";


    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgTemplateDelete.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgTemplateDelete.ResponseData
    };
}
export class APIOrgUpdateTemplate {
    //接口地址
    public static API: string = "/api/cmsext/room/template/update";


    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgUpdateTemplate.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgUpdateTemplate.ResponseData
    };
}
export class APIOrgRoomCreate {
    //接口地址
    public static API: string = "/api/cmsext/room/create";


    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgRoomCreate.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgRoomCreate.ResponseData
    };
}
/**
 * 注册全局访问
 */
(window as any).Web_Login = Web_Login;
(window as any).Web_User_Info = Web_User_Info;
(window as any).Web_Channel = Web_Channel;
(window as any).Web_Config_Global_Config = Web_Config_Global_Config;
(window as any).Web_Config_Multi_Language_Template = Web_Config_Multi_Language_Template;
(window as any).Web_Misc_Banner_List = Web_Misc_Banner_List;
(window as any).Web_Room_Center_Groups = Web_Room_Center_Groups;
(window as any).Web_Msg_Message_Unread = Web_Msg_Message_Unread;
(window as any).Web_Room_Center_Rooms_Blinds = Web_Room_Center_Rooms_Blinds;
(window as any).Web_Room_Center_Rooms = Web_Room_Center_Rooms;
(window as any).Web_Org_Club_Create = Web_Org_Club_Create;
(window as any).Web_Org_Club_Get = Web_Org_Club_Get;
(window as any).Web_Org_Club_Player_Apply_List = Web_Org_Club_Player_Apply_List;
(window as any).Web_Org_Club_Search_By_Id = Web_Org_Club_Search_By_Id;
(window as any).Web_Org_Club_Join = Web_Org_Club_Join;
(window as any).APIOrgClubCancleJoinClub = APIOrgClubCancleJoinClub;
(window as any).APIOrgClubApprovalJoin = APIOrgClubApprovalJoin;
(window as any).APIOrgClubGetJoinlList = APIOrgClubGetJoinlList;
(window as any).APIOrgClubQuit = APIOrgClubQuit;

(window as any).APIOrgClubIsManger = APIOrgClubIsManger;
(window as any).Web_User_Room_Settle_Detail = Web_User_Room_Settle_Detail;

