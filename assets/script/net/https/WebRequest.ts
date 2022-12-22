/**
 * Http请求接口
 */


/// <summary>
/// 登陆
/// </summary>
export class Web_Login {
    //接口地址
    static API: string = "/api/user/login";
    //字段声明
    static RequestParams: {
        code?: string,        // 验证码
        email?: string,        // 邮箱
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

    static ResponseData: {
        token?: string,        // 手机号
        expire_at?: number,        // 密码MD5
    } = null;


    static Request(param: typeof Web_Login.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Login.ResponseData };
}

export class Web_Login_Third_Party {
    static API: string = "/api/user/login_third_party";
    static RequestParams: {
        token: string,
        source: string,
        app_source: number
    } = null;

    static ResponseData: {
        token?: string,        // 手机号
        expire_at?: number,        // 密码MD5
    } = null;


    static Request(param: typeof Web_Login_Third_Party.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Login.ResponseData };
}

/// <summary>
/// 刷新token
/// </summary>
export class Web_Refresh_Token {
    //接口地址
    static API: string = "/api/user/refresh";
    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {
        token?: string,        // 手机号
        expire_at?: number,        // 密码MD5
    } = null;

    static Request(param: typeof Web_Refresh_Token.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Refresh_Token.ResponseData };
}

/// <summary>
/// 验证手机号
/// </summary>
export class Web_User_Check_Phone {
    //接口地址
    static API: string = "/api/user/check_phone";
    //字段声明
    static RequestParams: {
        phone?: string,// 手机号码
        area?: string, // 国家代号
        email?: string, // 邮箱
    } = null;

    static ResponseData: {

    } = null;

    static Request(param: typeof Web_User_Check_Phone.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_User_Check_Phone.ResponseData };
}
/// <summary>
/// 获取验证码
/// </summary>
export class Web_User_Send_Code {
    //接口地址
    static API: string = "/api/user/sendcode";
    //字段声明
    static RequestParams: {
        phone?: string,// 手机号码
        area?: string, // 国家代号
    } = null;

    static ResponseData: {

    } = null;

    static Request(param: typeof Web_User_Send_Code.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_User_Send_Code.ResponseData };
}

/// <summary>
/// 修改密码
/// </summary>
export class Web_User_Modify_Password {
    //接口地址
    static API: string = "/api/user/modify/password";
    //字段声明
    static RequestParams: {
        email?: string,
        phone?: string,  // 手机号码
        password?: string, // 密码
        area?: string,  // 国家代号
        code?: string  // 验证码
    } = null;

    static ResponseData: {
        user_id?: number, s
    } = null;

    static Request(param: typeof Web_User_Modify_Password.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_User_Modify_Password.ResponseData };
}

/// <summary>
/// 修改个人信息
/// </summary>
export class Web_User_Modify_User_Info {
    //接口地址
    static API: string = "/api/user/modify/user_info";
    //字段声明
    static RequestParams: {
        sex?: number,  // 性别
        nick_name?: string, // 名字
        avatar?: string,  // 头像
    } = null;

    static ResponseData: {
        data?: typeof Web_User_Modify_User_Info.Data,
    } = null;
    static Data: {
    } = null;

    static Request(param: typeof Web_User_Modify_User_Info.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_User_Modify_User_Info.ResponseData };
}

/// <summary>
/// 验证用户昵称
/// </summary>
export class Web_User_Check_Nickname {
    //接口地址
    static API: string = "/api/user/check_nickname";
    //字段声明
    static RequestParams: {
        nickname?: string, // 名字
    } = null;

    static ResponseData: {
        data?: typeof Web_User_Modify_User_Info.Data,
    } = null;
    static Data: {
    } = null;

    static Request(param: typeof Web_User_Check_Nickname.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_User_Check_Nickname.ResponseData };
}

/// <summary>
/// 手机号注册
/// </summary>
export class Web_User_Register {
    //接口地址
    static API: string = "/api/user/register";
    //字段声明
    static RequestParams: {
        phone?: string,// 手机号码
        password?: string,  // 密码
        area?: string, // 国家代号
        code?: string,  // 验证码
        email?: string,
        platform?: number,//平台(platform):1-IOS 2-Android 3-Windows 4-OSX 5-Web 6-MiniWeb 7-Linux
    } = null;

    static ResponseData: {
        userId: number,// 用户id
    } = null;

    static Request(param: typeof Web_User_Register.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_User_Register.ResponseData };
}

/// <summary>
/// 查询他人统计数据 - 【数据统计模块】
///
/// 查询他人统计数据
/// </summary>
export class WEB2_data_stat_person {
    //接口地址
    static API: string = "/api/data_stat/person";
    //字段声明
    static RequestParams: {
        breakRandomId?: number,      //1 room 2 mtt 3 mttroom
        breakUserId?: number,         //条目
        roomPath?: number,        //开始下标。例子（offset=0，limit=10，0-9。）
        timeType?: number,     //游戏类型，对应客户端 枚举 GameType
    } = null;

    static Data: {
        breakPrice: string, // 破隐需要的金豆数
        imageType: number,// 影像数据级别 1=生涯 ， 2=30天 ， 3=7天
        totalHand: number,// omaha,普通局特有参数.总手数
        CBet: number, // omaha,普通局特有参数.4Flop持续下注率 如20%返回20即可
        AF: string,// omaha,普通局特有参数.激进程度
        fantasy: number,// 大菠萝特有参数.进范率.如20%返回20即可
        handAverage: number,// 大菠萝特有参数.手牌平均分
        thirdTimes: number,// sng mtt特有参数.第三名次数
        totalGameCnt: number,// omaha,普通局特有参数.总局数
        totalEarn: number,// 总战绩
        VPIP: number,// omaha,普通局特有参数.入池率 如20%返回20即可
        breakStatus: number,// 能否有权限破隐 1401-无权破隐 1402-已破隐（只有已破隐), 1403-可破隐(未破隐)
        threeBet: number,// omaha,普通局特有参数.翻牌前再加注率 如20%返回20即可
        roomPath: number,// 牌局:61-普通局, 71-MTT, 81-SNG 91-奥马哈 51-大菠萝
        PRF: number,// omaha,普通局特有参数.翻牌前加注率 如20%返回20即可
        WTSD: number,// omaha,普通局特有参数.摊牌胜率.如20%返回20即可
        Allin_Wins: number,// omaha,普通局特有参数.全下胜率.如20%返回20即可
        papWins: number,// 大菠萝特有参数.胜率.如20%返回20即可
        fantasyAverage: number,// 大菠萝特有参数.进范平均分
        winTimes: number,// sng mtt特有参数.获奖次数
        firstTimes: number,// sng mtt特有参数.第一名次数
        secondTimes: number, // sng mtt特有参数.第二名次数
        playTimes: number,// sng mtt特有参数.参赛次数
        Wins: number,// omaha,普通局特有参数.入池胜率 如20%返回20即可
    } = null;


    static ResponseData: {
        status: number,
        msg: string,
        data?: typeof WEB2_data_stat_person.Data,
    } = null;

    static Request(param: typeof WEB2_data_stat_person.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof WEB2_data_stat_person.ResponseData };
}

/// <summary>
/// 战绩7，30,生涯数据(MTT,Room)
/// </summary>
export class Web_Stats_User_Stats {
    //接口地址
    static API: string = "/api/stats/user_stats";
    //字段声明
    static RequestParams: {
        game_type?: number,      //游戏类型0-all,1-常规桌，2-OMAHA4，3-OMAHA5，4-OMAHA6,5-mtt
        time_type?: number,      //游戏类型1-今日, 2-7天, 3-30天, 4-生涯
        time_long?: number,      //客户端时间戳
    } = null;

    static MTTRoomData: {
        user_id: string,
        play_times: number,//参赛次数
        win_times: number,//获奖次数
        frist_times: number,//第一名次数
        second_times: string,//第二名次数
        third_times: number,//第三名次数    
    } = null;

    static RoomData: {
        id: string,
        user_id: number,
        game_type: number,//游戏类型： 0-常规桌，1-OMAHA4，2-OMAHA5，3-OMAHA6   
        data_type: number,//数据类型 1--今日；2--7天；3--30天；4--生涯
        total_game_cnt: string,//总局数
        total_hand: number, //总手数   
        total_earn: number,//总盈亏
        aveage_earn: number,//场均战绩
        aveage_earn_hundred: number, //战绩/百手
        vpip: number, //入池率 
        wins: number, //入池胜率
        prf: number,//翻牌前加注率
        bet3: number,//翻牌前再加注率
        af: number,//激进程度
        cbet: number, //4Flop持续下注率
        wtsd: number, //摊牌胜率
        allinWins: number, //全下胜率
    } = null;

    static Data: {
        mtt_room_data: typeof Web_Stats_User_Stats.MTTRoomData,
        room_data: typeof Web_Stats_User_Stats.RoomData,
    } = null;

    static ResponseData: {
        data?: typeof Web_Stats_User_Stats.Data,
    } = null;

    static Request(param: typeof Web_Stats_User_Stats.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Stats_User_Stats.ResponseData };
}

/// <summary>
/// 战绩
/// </summary>
export class Web_Room_Center_History_List {
    //接口地址
    static API: string = "/api/stats/room/history/list";
    //字段声明
    static RequestParams: {
        group_by?: number,      //1 room 2 mtt 3 mttroom
        limit?: number,         //条目
        offset?: number,        //开始下标。例子（offset=0，limit=10，0-9。）
        game_type?: number,     //游戏类型，对应客户端 枚举 GameType
    } = null;

    static Records: {
        Name: string,//房间名称
        Type: number,//房间类型
        MatchID: number,//比赛id
        RoomID: number,//房间id
        Time: string,//开始时间
        Change: number,//筹码变动
        Count: number,//总手数
    } = null;

    static Data: {
        limit: number,
        offset: number,
        total: number,// //总条数
        records: typeof Web_Room_Center_History_List.Records,
    } = null;

    static ResponseData: {
        data?: typeof Web_Room_Center_History_List.Data,
    } = null;

    static Request(param: typeof Web_Room_Center_History_List.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Room_Center_History_List.ResponseData };
}

/// <summary>
/// 手数列表
/// </summary>
export class Web_Room_Center_History_Hand {
    //接口地址
    static API: string = "/api/roomcenter/history/hand";
    //字段声明
    static RequestParams: {
        room_id?: number,
        match_id?: number,
        limit?: number,
        offset?: number,
        type?: number,
        gametype?: number,
    } = null;

    static Record: {
        id: number,                 //查询replay id
        type: number,               //房间类型
        room_id: number,            //房间id
        match_id: number,           //比赛id
        name: string,               //房间名字
        user_id: number,            //玩家id
        hand_num: number,           //本手手数
        open: number,               //0：非公开
        change: number,             //筹码变动
        create_time: string,        //创建时间
        room_unique_id: string,     //房间唯一id
    } = null;

    static Data: {
        limit: number,
        offset: number,
        total: number,              //总条数
        records: typeof Web_Room_Center_History_Hand.Record,
    } = null;

    static ResponseData: {
        data?: typeof Web_Room_Center_History_Hand.Data,
    } = null;

    static Request(param: typeof Web_Room_Center_History_Hand.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Room_Center_History_Hand.ResponseData };
}

/// <summary>
/// 7.玩家查看带入申请列表
/// </summary>
export class APIFriendApplyList {
    //接口地址
    static API: string = "/api/roomcenter/friend/room/apply/user/list";
    //字段声明
    static RequestParams: {
        limit: number,
        offset: number,
        room_id: number,
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIFriendApplyList.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIFriendApplyList.ResponseData };
}

/// <summary>
/// 战绩详情
/// </summary>
export class Web_Stats_Room_Detail {
    //接口地址
    static API: string = "/api/stats/room_detail/{id}";
    //字段声明
    static RequestParams: {
        limit?: number,         //条目
        offset?: number,        //开始下标。例子（offset=0，limit=10，0-9。）
    } = null;

    static UserInfo: {
        is_current_user: boolean,   //是否当前用户
        user_id: number,            //玩家ID
        user_random_id: number,     //玩家随机ID
        nick_name: string,          //玩家昵称
        avatar: string,             //玩家头像
        bring_in: number,           //买入筹码
        bring_out: number,          //带出筹码
        user_room_hand_num: number, //玩家手数
        original_results: number,   //原始战绩
        gold_deduction: number,     //金豆扣减
        finally_game_results: number,//最终战绩
        insurance_buy_in: number,   //保险买入
        insurance_profit: number,   //保险收入
        insurance_sum: number,      //保险合计
        insurance_original: number, //原始保险
    } = null;

    static RoomData: {
        limit: number,
        offset: number,
        total: number,              //总条数
        game_type: number,          //牌局类型(玩法) 游戏类型： 0-常规桌，1-OMAHA4，2-OMAHA5，3-OMAHA6
        game_room_name: string,     //牌局名称
        room_id: number,            //牌局ID
        ante: number,               //前注
        blind: number,              //盲注级别	small_blind
        player_duration: number,    //牌局时长，单位秒
        all_bring_in: number,       //总带入筹码
        room_total_hand_num: number,//本局总手数
        insurance_on: number,       //是否开启保险 0-close, 1- open
        insurance_total: number,    //牌局保险总计
        end_time: string,           //结束时间
        user_list: typeof Web_Stats_Room_Detail.UserInfo,//玩家列表
    } = null;

    static Data: {
        room_data: typeof Web_Stats_Room_Detail.RoomData,
    } = null;

    static ResponseData: {
        data?: typeof Web_Stats_Room_Detail.Data,
    } = null;

    static Request(param: typeof Web_Stats_Room_Detail.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Stats_Room_Detail.ResponseData };
}

/// <summary>
/// MTT战绩详情
/// </summary>
export class Web_Stats_Mtt_Room_Detail {
    //接口地址
    static API: string = "/api/stats/mtt_room_detail/{id}";
    //字段声明
    static RequestParams: {
        limit?: number,         //条目
        offset?: number,        //开始下标。例子（offset=0，limit=10，0-9。）
    } = null;

    static Goods: {
        i: number,   //道具id
        na: string,  //道具名称
        v: number,   //价值等价货币
        n: number,   //数量
    } = null;

    static UserInfo: {
        is_current_user: boolean,   //是否当前用户
        user_id: number,            //玩家ID
        user_random_id: number,     //玩家随机ID
        nick_name: string,          //玩家昵称
        avatar: string,             //玩家头像
        rank: number,               //排名
        hunter_rank: number,          //带出筹码
        hunter_kill: number, //玩家手数
        award: number,   //原始战绩
        hunter_award: number,     //金豆扣减
        buy_in_times: number,//最终战绩
        goods_awrd: typeof Web_Stats_Mtt_Room_Detail.Goods,   //保险买入
    } = null;

    static RoomData: {
        game_type: number,          //牌局类型(玩法) 游戏类型： 0-常规桌，1-OMAHA4，2-OMAHA5，3-OMAHA6
        game_room_name: string,     //牌局名称
        room_id: number,            //牌局ID
        start_time: number,         //赛事开始时间
        end_time: number,           //赛事结束时间
        player_count: number,       //参与人数
        buy_in_count: number,       //买入次数
        limit: number,
        offset: number,
        total: string,              //总条数
        user_list: typeof Web_Stats_Mtt_Room_Detail.UserInfo,//玩家列表
    } = null;

    static Data: {
        room_data: typeof Web_Stats_Mtt_Room_Detail.RoomData,
    } = null;

    static ResponseData: {
        data?: typeof Web_Stats_Mtt_Room_Detail.Data,
    } = null;

    static Request(param: typeof Web_Stats_Mtt_Room_Detail.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Stats_Mtt_Room_Detail.ResponseData };
}



/// <summary>
/// 查询其他玩家信息
/// </summary>
export class Web_Other_User_Info {
    //接口地址
    static API: string = "/api/user/{id}/info";

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {
    } = null;

    static Request(param: typeof Web_Other_User_Info.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof Web_Other_User_Info.ResponseData)[] };
}

/// <summary>
/// 公会消息-带入列表
/// </summary>
export class API_CLUB_APPLY_LIST {
    //接口地址
    static API: string = "/api/roomcenter/club/room/apply/list";

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {
    } = null;

    static Request(param: typeof API_CLUB_APPLY_LIST.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof API_CLUB_APPLY_LIST.ResponseData)[] };
}

/// <summary>
/// 审批玩家带入申请
/// </summary>
export class API_CLUB_APPLY_AUDIT {
    //接口地址
    static API: string = "/api/roomcenter/club/room/apply/audit";

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {
    } = null;

    static Request(param: typeof API_CLUB_APPLY_AUDIT.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof API_CLUB_APPLY_AUDIT.ResponseData)[] };
}

/// <summary>
/// 请求用户数据
/// </summary>
export class Web_User_Info {
    //接口地址
    static API: string = "/api/user/info";
    static RequestParams: {
    } = null;
    static ResponseData: {
        user?: typeof Web_User_Info.UserInfo,        // 用户信息
    } = null;
    static UserInfo: {
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
        user_id
    } = null;
    static Request(param: typeof Web_Login.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_User_Info.ResponseData };
}

/// <summary>
/// 牌局内玩家战绩数据
/// </summary>
export class Web_Stats_Other_User_Stats {
    //接口地址
    static API: string = "/api/stats/other_user_stats/{id}";
    static RequestParams: {
    } = null;
    static ResponseData: {
        data?: typeof Web_Stats_Other_User_Stats.Data,        // 用户信息
    } = null;
    static MTTRoomData: {
        user_id?: number,
        play_times?: number,        //参赛次数
        win_times?: number,         //获奖次数
        frist_times?: number,       //第一名次数
        second_times?: number,      //第二名次数
        third_times?: number,       //第三名次数
    } = null;
    static RoomData: {
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
    static Data: {
        mtt_room_data?: typeof Web_Stats_Other_User_Stats.MTTRoomData[],        //mtt数据
        room_data?: typeof Web_Stats_Other_User_Stats.RoomData[],        //普通牌局数据
    } = null;
    static Request(param: typeof Web_Stats_Other_User_Stats.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Stats_Other_User_Stats.ResponseData };
}

/// <summary>
/// socket channel info
/// </summary>
export class Web_Channel {
    //接口地址
    static API: string = "/api/user/channel";
    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {
        port?: number,        // socket port
    } = null;


    static Request(param: typeof Web_Login.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Channel.ResponseData };
}

/// <summary>
/// 请求频道信息 websocket的port
/// </summary>
export class Web_WS {
    //接口地址
    static API: string = "/api/user/ws";
    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {
        port?: number,        // websocket port
    } = null;


    static Request(param: typeof Web_WS.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_WS.ResponseData };
}

/// <summary>
/// 获取全局配置
/// </summary>
export class Web_Config_Global_Config {

    //接口地址
    static API: string = "/api/config/global/config";

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {
        operating_model?: number,//运营模式 1 直营模式 2 公会联盟模式
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
    static Request(param: typeof Web_Login.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Config_Global_Config.ResponseData };
}


/// <summary>
/// 获取多语言配置
/// </summary>
export class Web_Config_Multi_Language_Template {

    //接口地址
    static API: string = "/api/config/multi_language/template";

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {
        template_id: string,//对应房间key
        cn_name: string,//中
        us_name: string,//英
        br_name: string,//葡语      
    } = null;
    static Request(param: typeof Web_Config_Multi_Language_Template.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof Web_Config_Multi_Language_Template.ResponseData)[] };
}


/// <summary>
/// Banner
/// </summary>
export class Web_Misc_Banner_List {

    //接口地址
    static API: string = "/api/misc/banner/list";

    //字段声明
    static RequestParams: {
        lang?: string,        //语言(zh_CN:简体中文,zh_HK:繁体中文,en_US:英文
        type?: number,        //1-大厅Banner,2-发现页(公会)Banner
        limit?: number,        //条目
        offset?: number,        //开始下标。例子（offset=0，limit=10，0-9。）
    } = null;

    static ResponseData: {
        limit: number,//条目
        offset: number,//开始下标。例子（offset=0，limit=10，0-9。）
        total: number,//总条数
        list: typeof Web_Misc_Banner_List.BannerInfo[]// Banner列表
    } = null;
    static BannerInfo: {
        id: number,//banner id
        lang: string,//语言
        banner_type: number,//1-大厅Banner,2-发现页(公会)Banner
        image_url: string,//Banner图片连接
        redirect_url: string,//跳转连接
        description: string,//描述
    } = null;

    static Request(param: typeof Web_Misc_Banner_List.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Misc_Banner_List.ResponseData };
}

/// <summary>
/// 查询道具信息
/// </summary>
export class Web_Prop_User_Check_Prop_Info {

    //接口地址
    static API: string = "/api/prop/user/check_prop_info";

    //字段声明
    static RequestParams: {
        prop_id?: number,        //道具id
    } = null;

    static ResponseData: {
        data: typeof Web_Prop_User_Check_Prop_Info.Data[]
    } = null;

    static Data: {
        is_free_service_charge: number,//是否免服务费
        prop_balance: string,//道具余量
        prop_property_type: number,//1 普通，2 免服务费
        wallet_balance: string,//钱包余额
    } = null;

    static Request(param: typeof Web_Prop_User_Check_Prop_Info.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Prop_User_Check_Prop_Info.ResponseData };
}

/// <summary>
/// 查看优惠
/// </summary>
export class Web_Room_Center_Mtt_GetDiscounts {

    //接口地址
    static API: string = "/api/prop/user_prop/mtt/list";

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {
        data: typeof Web_Room_Center_Mtt_GetDiscounts.Data[]
    } = null;

    static Data: {
        is_free_service_charge: number,//是否免服务费
        prop_balance: string,//道具余量
        prop_property_type: number,//1 普通，2 免服务费
        wallet_balance: string,//钱包余额
    } = null;

    static Request(param: typeof Web_Room_Center_Mtt_GetDiscounts.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Room_Center_Mtt_GetDiscounts.ResponseData };
}

/// <summary>
/// 购买道具
/// </summary>
export class Web_Prop_User_Buy_Prop {

    //接口地址
    static API: string = "/api/prop/user/buy_inner_prop";

    //字段声明
    static RequestParams: {
        prop_id?: number,         //道具id
        match_id?: number,        //比赛id
    } = null;

    static ResponseData: {
        data: typeof Web_Prop_User_Buy_Prop.Data[]
    } = null;

    static Data: {

    } = null;

    static Request(param: typeof Web_Prop_User_Buy_Prop.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Prop_User_Buy_Prop.ResponseData };
}


/// <summary>
/// 大厅房间列表
/// </summary>
export class Web_Room_Center_Groups {
    //接口地址
    static API: string = "/api/roomcenter/groups";

    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {
        game_type: number,//游戏类型，0 德州，1奥马哈四张，2 奥马哈五张，3 奥马哈六张
        count: number,//房间数量
        player_count: number,//人数
        sub_group: typeof Web_Room_Center_Groups.DataGroupOne[],
    } = null;
    static DataGroupOne: {
        game_type: number,//游戏类型，0 德州，1奥马哈四张，2 奥马哈五张，3 奥马哈六张
        count: number,//房间数量
        poker_type: number,//牌类型 0 长牌，1 短牌
        player_count: number,//人数
        sub_group: typeof Web_Room_Center_Groups.DataGroupTwo[],
    } = null;

    static DataGroupTwo: {
        game_type: number,//游戏类型，0 德州，1奥马哈四张，2 奥马哈五张，3 奥马哈六张
        poker_type: number,//牌类型 0 长牌，1 短牌
        limit_bet_type: number,//下注限制 0 不限制，1 底池限注，2 AOF
        count: number,//房间数量
        player_count: number, //人数
    } = null;

    static Request(param: typeof Web_Room_Center_Groups.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof Web_Room_Center_Groups.ResponseData)[] };
}

/// <summary>
/// 未读消息 （只有五条）
/// </summary>
export class Web_Msg_Message_Unread {
    //接口地址
    static API: string = "/api/msg/message/unread";

    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {
        msg_main_type: number,//消息类型:1-bag,2-club,3-money,4-system,5-tribe
        num: number,//未读消息数量
        title: string,
        content: string,
        remark: string,
        msg_type: number,//消息类型 MessageSubType
        create_time: string,//创建时间
    } = null;
    static Request(param: typeof Web_Msg_Message_Unread.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof Web_Msg_Message_Unread.ResponseData)[] };
}
/// <summary>
/// 小盲列表
/// </summary>
export class Web_Room_Center_Rooms_Blinds {
    //接口地址
    static API: string = "/api/roomcenter/room_blinds";

    //字段声明
    static RequestParams: {
        game_type: number,//游戏类型
        poker_type: number,//牌类型
    } = null;

    static ResponseData: {
        records: (typeof Web_Room_Center_Rooms_Blinds.DataElement)[]
    } = null;

    static DataElement: {
        sb: number,//小盲
        cnt: number,//该条件房间数
    } = null;

    static Request(param: typeof Web_Room_Center_Rooms_Blinds.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof Web_Room_Center_Rooms_Blinds.ResponseData) };
}
/// <summary>
/// 房间详细列表
/// </summary>
export class Web_Room_Center_Rooms {
    //接口地址
    static API: string = "/api/roomcenter/rooms";

    //字段声明
    static RequestParams: {
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

    static ResponseData: {
        total: number,
        limit: number,
        offset: number,
        records: (typeof Web_Room_Center_Rooms.DataElement)[]
    } = null;

    static DataElement: {
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

    static Request(param: typeof Web_Room_Center_Rooms.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof Web_Room_Center_Rooms.ResponseData) };
}

// xyh start
export class Web_Room_Center_Rooms_Blinds_CLUB {
    //接口地址
    static API: string = "/api/roomcenter/club/room_blinds";
}

export class Web_Room_Center_Rooms_CLUB {
    //接口地址
    static API: string = "/api/roomcenter/club/rooms";
}

export class Web_Gold_Change_Log {
    static User: string = "/api/user/gold_change/log";  //金豆变动记录
    static Club: string = "/api/org/club/fund/gold_change/log";  //联盟金豆变动记录
}

//汇率相关接口
export class Web_Rate_Api {
    static GET_RATE_LIST = "/api/cmsext/exchange/list";       //汇率列表
    static SET_CLUB_RATE = "/api/cmsext/exchange/set";       //设置公会汇率
    static DELETE_CLUB_RATE = "/api/cmsext/exchange/delete";       //删除公会汇率
}

export class Web_Order_Rcords {
    // 参数：order_type（订单类型(order_type):1-充豆;2-提豆;3-发豆）
    static CLUB_RECORD = "/api/order/club/order_records";  //公会冲提记录
    static CLUB_GRANT = "/api/order/club/grant_log";  //公会发放记录
    // user_type（0-未知,1-普通用户,2-支桌号,3-牌局机器人,4-牛仔机器人）
    static USER_RECORD = "/api/order/user/order_records";  //玩家冲提记录
}

export class Web_Order_apply {
    // 订单类型(order_type):1-充豆;2-提豆
    static APPLY_LIST = "/api/order/club/member_order/list";
    // 订单号(order_no)   审计类型(audit_type):1-同意;2-拒绝
    static OPRATION_APPLY = "/api/order/club/audit/member_order";
}

export class Web_Club_Issue_Gold {
    // 参数：user_id（用户ID），gold_num（金豆数量）
    static ISSUE = "/api/order/club/grant";
    // 参数：search：成员昵称或ID
    static USER_LIST = "/api/order/club/user_list";
}

export class Web_Mtt {
    static LIST = "/api/roomcenter/mtt/list";  //入口裂变
    static DETAIL = "/api/roomcenter/mtt/{0}";  /// MTT 比赛列表详情
    static ROOMS = "/api/roomcenter/mtt/{0}/rooms";/// MTT 牌桌信息
    static RANKS = "/api/roomcenter/mtt/{0}/ranks";/// MTT 该比赛玩家排名信息
    static HRANKS = "/api/roomcenter/mtt/{0}/hranks";/// MTT 猎人赛排名信息
    static REAL_PRIZE = "/api/roomcenter/mtt/{0}/real_prize";/// MTT 奖励
    static MYAWARD = "/api/roomcenter/mtt/{0}/myaward";/// MTT 我的奖励

    static BUYIN = "/api/roomcenter/mtt/{0}/buyin";/// MTT 报名
    static REBUY = "/api/roomcenter/mtt/{0}/rebuy";/// MTT 重购
    static AWARDS = "/api/roomcenter/mtt/{0}/awards";
    static MYINFO = "/api/roomcenter/mtt/{0}/myinfo";
    static FREE_REMAIN = "/api/roomcenter/mtt/{0}/free_remain";
}


export class Web_Gold_Change_Insure_Log {
    static API: string = "/api/user/gold_insure_change_log"
}

// xyh end

/// <summary>
/// MTT 比赛列表详情
/// </summary>
export class Web_Room_Center_Mtt_Details {
    //接口地址
    static API: string = "/api/roomcenter/mtt/{id}";

    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {
        data: typeof Web_Room_Center_Mtt_Details.Data[],
    } = null;

    static Data: {
        alive: number,//存活人数
        state_code: number,//当前玩家的状态 MTTPlayerStatus定义
        mtt: typeof Web_Room_Center_Mtt_Details.MttDetails,//比赛细节信息
        state: typeof Web_Room_Center_Mtt_Details.PlayerState,//玩家筹码状态信息
        more: typeof Web_Room_Center_Mtt_Details.More,//盲注等级和奖励池
        top: number,//最大记分牌
    } = null;

    static PlayerState: {
        left_rebuy_times: number,//剩余重购次数
        chip: number,//桌上记分牌
        store: number,//存储记分牌
        init_score: number,//初始化记分牌
        partial_enable: boolean//是否允许部分带入
    } = null;

    static MttDetails: {
        match_id: number, // 比赛id
        name: string, // 比赛名字
        type: number, // 房间类型
        game_type: number,//游戏类型
        poker_type: number,//牌类型
        limit_bet_type: number,//底池限注类型
        rank_type: number,//排名类型
        enter_time: string,//进入时间
        start_time: string,//开始时间
        end_time: string,//结束时间
        hunter_on: number,//猎人赛开启  1：开启，0关闭
        hunter_bonus: number,//0-100  //猎人赛滚雪球比例 0~100 0:杀白丁无收益 1～99 单次收益 100:不滚雪球
        partial_on: number,//部分带入开启  1：开启，0：关闭
        parital_return_bl: number,//部分带入返还金币盲注等级
        straddle_on: number,//强制盲注开启 1：开启，0：关闭
        straddle_max: number,//强制盲注数量
        rooms: number,//房间数量
        max_room_id: number,//最大房间id
        delay_view_card_on: number,//延迟看牌  1：开启，0：关闭
        limit_min: number,//最低参赛人数下限
        limit_delay_times: number,//操作加时次数限制
        limit_auto_check_times: number,//自动过牌次数
        limit_auto_fold_times: number,//自动弃牌次数
        participants: number,//参赛人数
        award_num: number,//奖金
        money_sync: number,//奖励圈同步(截止无法买入以后才会开启)
        status: number,//游戏状态
        seat_count: number,//在座人数
        final_seat_count: number,//最终座位人数
        no_user_wait_duration: number
        initial_score: number,//初始化记分牌
        blindtable_type: number,//盲注表类型
        upblind_interval: number,//升盲时间间隔
        apply_start_time: string,//报名开始时间
        op_duration: number,//操作时间
        max_delay_apply_bl: number,//延迟报名升盲等级
        rebuy_times: number,//重构次数          
        max_rebuy_bl: number,//重购升盲等级
        limit_total_buy_times: number,//最大买入次数上限
        total_buy_times: number,//总买入次数
        total_rebuy_times: number,//总重购次数
        addon_begin_bl: number,//增购开启 升盲等级
        addon_end_bl: number,//增购关闭 升盲等级
        addon_score: number,//增购 记分牌
        total_addon_times: number,//增购次数
        apply_fee_pool: number,//报名费
        apply_fee_service: number,//服务费
        apply_fee_hunter: number,//猎人赛费用
        prize_type: number,//奖励类型
        tribe_id: number,//联盟id
        create_time: string,//创建房间时间
        update_time: string,
        game_icon: string,
        prop_buy_type: number,// 道具使用类型 1: 只能道具 2: 混合 0: 不支持道具
        voiceprint_verify_on: number,//是否开启验证声纹 0 关闭，1 开启。
        voiceprint_verify_duration: number,//验证声纹时长
        buy_prop_id: number,//道具id
        addonplus_m1_on: number,//增购plus 模式一 0 关闭，1 开启
        addonplus_m1_max_times: number,//增购最大次数
        addonplus_m1_limit: number,//增购限制筹码
        total_addonplus_m1_times: number,//总增购次数
        addonplus_m2_on: number,//增购模式2 0 关闭，1 开启
        addonplus_m2_max_times: number,//增购限制最大次数
        addonplus_m2_max_bl: number,//增购 截止盲注
        total_addonplus_m2_times: number,//增购总次数
        buy_ratio: number,//买入倍率
        pre_buyin_bonus: number,//赛前报名多得记分牌
        tablecloth_tag: string,//桌布id
        limit_tag: string,//相同比赛检测tag
        buyin_free_times: number,//报名限免次数
        rebuy_free_times: number,//重购限免次数
        multi_ratio_free_times: number,//多倍率限免次数
        addon_free_times: number,//增购限免次数
        buyin_free_incl_svr: number,//报名限免是否包含服务费，0不包含，1包含
        rebuy_free_incl_svr: number //重购限免是否包含服务费，0不包含，1包含
        multi_ratio_free_incl_svr: number,//多倍率限免是否包含服务费，0不包含，1包含
        addon_free_incl_svr: number,//增购限免是否包含服务费，0不包含，1包含
    } = null;

    static More: {
        ante: number,//当前前注
        nante: number,//下一前注
        bl: number,//当前盲注等级
        nbl: number,//下一盲注等级
        sb: number,//当前小盲
        nsb: number,//下一小盲
        prize_pool: number,//奖池
    } = null;

    static Request(param: typeof Web_Room_Center_Mtt_Details.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Room_Center_Mtt_Details.Data };
}

/// <summary>
/// MTT 报名
/// </summary>
export class Web_Room_Center_Mtt_Buyin {
    //接口地址
    static API: string = "/api/roomcenter/mtt/{id}/buyin";

    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {
        ticket: boolean,//几人池
        ratio: number,
    } = null;

    static Request(param: typeof Web_Room_Center_Mtt_Buyin.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof Web_Room_Center_Mtt_Buyin.ResponseData)[] };
}

/// <summary>
/// MTT 重购
/// </summary>
export class Web_Room_Center_Mtt_Rebuy {
    //接口地址
    static API: string = "/api/roomcenter/mtt/{id}/rebuy";

    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {
        ticket: boolean,//几人池
        ratio: number,
    } = null;

    static Request(param: typeof Web_Room_Center_Mtt_Rebuy.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof Web_Room_Center_Mtt_Rebuy.ResponseData)[] };
}

/// <summary>
/// MTT 该比赛玩家排名信息
/// </summary>
export class Web_Room_Center_Mtt_Ranks {
    //接口地址
    static API: string = "/api/roomcenter/mtt/{id}/ranks";

    //字段声明
    static RequestParams: {
        limit: number,//几人池
        offset: number,
    } = null;

    static ResponseData: {
        data: typeof Web_Room_Center_Mtt_Ranks.Data[],
    } = null;

    static Data: {
        limit: number,//条目
        offset: number,//开始下标。例子（offset=0，limit=10，0-9。）
        alive: number,//存活人数
        total: number,//总人数
        records: typeof Web_Room_Center_Mtt_Ranks.PlayerListElement[],// 玩家列表
    } = null;

    static PlayerListElement: {
        rank: number,//排名
        chip: number,//记分牌
        alive: number,//是否被淘汰
        rid: number,//桌号
        urid: number,//玩家随机id
        seat: number,//座位号
        rebuy: number,//重构次数
        addon: number,//是否重构
        name: number,//名字
    } = null;

    static Request(param: typeof Web_Room_Center_Mtt_Ranks.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof Web_Room_Center_Mtt_Ranks.ResponseData)[] };
}

/// <summary>
/// MTT 猎人赛排名信息
/// </summary>
export class Web_Room_Center_Mtt_Hranks {
    //接口地址
    static API: string = "/api/roomcenter/room/{id}/hranks";

    //字段声明
    static RequestParams: {
        limit: number,//几人池
        offset: number,
    } = null;

    static ResponseData: {
        data: typeof Web_Room_Center_Mtt_Hranks.Data[],
    } = null;

    static Data: {
        limit: number,//条目
        offset: number,//开始下标。例子（offset=0，limit=10，0-9。）
        alive: number,//存活人数
        total: number,//总人数
        records: typeof Web_Room_Center_Mtt_Hranks.PlayerListElement[],
    } = null;

    static PlayerListElement: {
        uid: number,//玩家id
        rank: number,//排名
        h: number,//猎头
        award: number,//赏金
        rid: number,//桌号
        seat: number,//座位号
        name: string,//名字
        avatar: string,//头像
        urid: number,//随机id
    } = null;

    static Request(param: typeof Web_Room_Center_Mtt_Hranks.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof Web_Room_Center_Mtt_Hranks.ResponseData)[] };
}

/// <summary>
/// MTT 牌桌信息
/// </summary>
export class Web_Room_Center_Mtt_Rooms {
    //接口地址
    static API: string = "/api/roomcenter/mtt/{id}/rooms";

    //字段声明
    static RequestParams: {
        limit: number,//几人池
        offset: number,
    } = null;

    static ResponseData: {
        data: typeof Web_Room_Center_Mtt_Rooms.Data[],
    } = null;

    static Data: {
        limit: number,//条目
        offset: number,//开始下标。例子（offset=0，limit=10，0-9。）
        total: number,//总人数
        records: typeof Web_Room_Center_Mtt_Rooms.DeskListElement[],
    } = null;

    static players: {
        uid: number,//玩家id
        chip: number,//玩家筹码
        seat: number,//玩家座位号
    } = null;

    static DeskListElement: {
        rid: number,//桌号
        service_id: number,//用于查询IP列表IP Port
        roomers: typeof Web_Room_Center_Mtt_Rooms.players[],
    } = null;

    static Request(param: typeof Web_Room_Center_Mtt_Rooms.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof Web_Room_Center_Mtt_Rooms.ResponseData)[] };
}

/// <summary>
/// MTT 奖励
/// </summary>
export class Web_Room_Center_Mtt_Real_Prize {
    //接口地址
    static API: string = "/api/roomcenter/mtt/{id}/real_prize";

    //字段声明
    static RequestParams: {
        limit: number,//几人池
        offset: number,
    } = null;

    static ResponseData: {
        data: typeof Web_Room_Center_Mtt_Real_Prize.Data[],
    } = null;

    static Data: {
        dynamic: boolean,//是否是动态
        award: boolean//总奖池
        award_type: number,//奖励类型
        award_num: number,//奖励圈人数
        participants: number,//参与人数
        next_award_count: number,//1. 如果是动态奖池 其实是下一等级参与人数, 会影响奖励人数  2. 如果是静态奖池 是下一个等级的买入人次, 会影响奖励人数
        prizes: typeof Web_Room_Center_Mtt_Real_Prize.Prize[],
    } = null;

    static Prize: {
        min: number,//最小名次
        max: number,//最大名次
        award: number,//奖励
        goods: typeof Web_Room_Center_Mtt_Real_Prize.Goods[],
    } = null;

    static Goods: {
        i: number,//道具id
        na: string//道具名称
        v: number,//价值等价货币
        n: number,//数量
    } = null;

    static Request(param: typeof Web_Room_Center_Mtt_Real_Prize.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof Web_Room_Center_Mtt_Real_Prize.ResponseData)[] };
}

/// <summary>
/// MTT 我的奖励
/// </summary>
export class Web_Room_Center_Mtt_Myaward {
    //接口地址
    static API: string = "/api/roomcenter/mtt/{id}/myaward";

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {
        data: typeof Web_Room_Center_Mtt_Myaward.Data,
    } = null;

    static Data: {
        uid: number,//开始下标。例子（offset=0，limit=10，0-9。）
        rank: number,//存活人数
        award_gold: number,//总人数
        award_goods: typeof Web_Room_Center_Mtt_Myaward.AwardGoods,
        hunter_award: number,//
        hunter_rank: number,//
        hunter_kill: number,//
        is_final: boolean,//
        awarded: boolean,//
        username: string,//
        avatar: string,//
    } = null;

    static AwardGoods: {
        i: number,//道具ID
        na: string,//道具名字
        v: number,//道具价值
        n: number,//道具数量
    } = null;

    static Request(param: typeof Web_Room_Center_Mtt_Myaward.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof Web_Room_Center_Mtt_Myaward.ResponseData)[] };
}

/// <summary>
/// 查询在该房间保险赔率表
/// </summary>
export class Web_User_Room_insur {
    //接口地址
    static API: string = "/api/roomcenter/room/{id}/insur";

    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {
        pot_user_count: number,//几人池
        detail: typeof Web_User_Room_insur.Outs[],
    } = null;

    static Outs: {
        outs: number,//outs 张数
        odds: number,//对应outs张数赔率
    } = null;

    static Request(param: typeof Web_User_Room_insur.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: (typeof Web_User_Room_insur.ResponseData)[] };
}


/// <summary>
/// 查询在该房间带出信息
/// </summary>
export class Web_User_Room {
    //接口地址
    static API: string = "/api/user/room/{id}";


    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {
        last_bring_out: typeof Web_User_Room.BringOut,
        wallet: typeof Web_User_Room.Wallet,
        bring_in_apply: typeof Web_User_Room.BringIn,
    } = null;

    static BringOut: {
        to_wallet: number,//带出（减去服务费后的带出金额）
        fee: number,//服务费
    } = null;

    static Wallet: {
        w_u_id: number,//钱包id
        gold: number,//钱包金额
        gold_lock: number,//被锁定金额
        wallet_status: number,//钱包状态
    } = null;

    static BringIn: {
        room_id: number,//房间ID
        user_id: number,//用户ID
        bring_in: number,//带入筹码
        status: number,// 状态 1 待审批，2通过，3拒绝，4取消
    } = null;

    static Request(param: typeof Web_User_Room.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_User_Room.ResponseData };

}

/// <summary>
/// </summary>
export class Web_Org_Club_Create {
    //接口地址
    static API: string = "/api/org/club/create";


    //字段声明
    static RequestParams: {
        area_id: null,
        club_name: null,
        desc: null,
        logo: null,
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof Web_Org_Club_Create.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Create.ResponseData };

}

export class Web_Org_Club_Get {
    //接口地址
    static API: string = "/api/org/club/user_club";


    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {
        // random_id: number,
        // club_name: string,
        // more_contact: string,
        // club_id: number,
        // level: number,
        // upper_limit: number,
        // search_switch: any
        // auto_audit_switch: any
    } = null;
    static Request(param: typeof Web_Org_Club_Create.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Get.ResponseData };

}

export class Web_Recharge_Gold {
    //接口地址
    static API: string = "/api/order/user/recharge";

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: { amount: number }) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Get.ResponseData };
}
export class Web_Tiqu_Gold {
    //接口地址
    static API: string = "/api/order/user/withdraw";

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: { amount: number }) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Get.ResponseData };

}

export class Web_Recharge_Gold_Club {
    //接口地址
    static API: string = "/api/order/club/recharge";

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: { amount: number }) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Get.ResponseData };
}
export class Web_Tiqu_Gold_Club {
    //接口地址
    static API: string = "/api/order/club/withdraw";

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: { amount: number }) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Get.ResponseData };

}

export class Web_Org_Club_Player_Apply_List {
    //接口地址
    static API: string = "/api/org/club/user/join/list";


    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof Web_Org_Club_Player_Apply_List.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Player_Apply_List.ResponseData };

}
export class Web_Org_Club_Search_By_Id {
    //接口地址
    static API: string = "/api/org/club/info";


    //字段声明
    static RequestParams: {
        club_random_id: null;
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof Web_Org_Club_Search_By_Id.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Search_By_Id.ResponseData };

}

export class Web_Org_Club_Join {
    //接口地址
    static API: string = "/api/org/club/user/join/apply";


    //字段声明
    static RequestParams: {
        club_id: null;
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof Web_Org_Club_Join.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Org_Club_Join.ResponseData };

}
export class APIOrgClubCancleJoinClub {
    //接口地址
    static API: string = "/api/org/club/user/join/cancel";


    //字段声明
    static RequestParams: {
        apply_id: null;
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgClubCancleJoinClub.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIOrgClubCancleJoinClub.ResponseData };

}
export class APIOrgClubIsManger {
    //接口地址
    static API: string = "/api/org/club/admin/has";


    //字段声明
    static RequestParams: {
        club_id: null;
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgClubIsManger.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIOrgClubIsManger.ResponseData };

}
export class APIOrgClubApprovalJoin {
    //接口地址
    static API: string = "/api/org/club/user/join/audit";

    //字段声明
    static RequestParams: {
        "apply_id": ''
        "audit_op": ''
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgClubApprovalJoin.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIOrgClubApprovalJoin.ResponseData };
}
export class APIOrgClubGetJoinlList {
    //接口地址
    static API: string = "/api/org/club/join/list";


    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgClubGetJoinlList.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIOrgClubGetJoinlList.ResponseData };
}
/// <summary>
/// 查询结算信息
/// </summary>
export class Web_User_Room_Settle_Detail {
    //接口地址
    static API: string = "/api/user/room_settle/detail/{id}";

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {
        list: typeof Web_User_Room_Settle_Detail.UsersInfo[],
        self_settle: typeof Web_User_Room_Settle_Detail.SelfSettle
    } = null;

    static SelfSettle:
        {
            user_random_id: number,
            nick_name: string,//昵称
            avatar: string,//头像
            user_hand_num: number,//手数
            bring_in: number,//带入
            bring_out: number,//带出
        } = null;
    static UsersInfo:
        {
            user_random_id: number,//user id
            nick_name: string,//昵称
            avatar: string,//头像
            user_hand_num: number,//手数
            bring_in: number,//带入
            bring_out: number,//带出
        }

    static Request(param: typeof Web_User_Room_Settle_Detail.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_User_Room_Settle_Detail.ResponseData };

}

export class APIOrgClubQuit {
    //接口地址
    static API: string = "/api/org/club/user/quit";


    //字段声明
    static RequestParams: {
        club_id: null;
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgClubQuit.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIOrgClubQuit.ResponseData };
}

export class APIMsgMessageList {
    //接口地址
    static API: string = "/api/msg/message/list";


    //字段声明
    static RequestParams: {
        msg_type: number,//消息类型
        limit: number,//条目
        offset: number,//开始下标。例子（offset=0，limit=10，0-9。）
    } = null;

    static ResponseData: {
        data?: typeof APIMsgMessageList.Data,
    } = null;
    static Data: {
        offset: number,//开始下标。例子（offset=0，limit=10，0-9。）
        total: number,//总条目数
        list: typeof APIMsgMessageList.MsgInfo,
    } = null;

    static MsgInfo:
        {
            msg_main_type: number,//消息类型:1-bag,2-club,3-money,4-system,5-tribe
            num: number,//未读消息数量
            msg_id: number,//消息ID
            title: string,
            content: string,
            remark: string,
            msg_type: number,//消息类型 MessageSubType
            create_time: string,//创建时间
            game_type: number,//游戏类型
            multi_language_id: string,//房间名称key
        }

    static Request(param: typeof APIMsgMessageList.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIMsgMessageList.ResponseData };
}

export class APITicketCreate {
    //接口地址
    static API: string = "/api/cmsext/exchange/ticket/create";


    //字段声明
    static RequestParams: {
        user_id: number,// 玩家ID
        user_random_id: number,// 玩家randomID
        phone: number,// 电话
        email: string,// 邮箱
        ticket_type: number,// 问题类型
        description: string,//  问题描述
        img_url: string,//  图片描述
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APITicketCreate.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APITicketCreate.ResponseData };
}

export class APIIsPhoneUser {
    //接口地址
    static API: string = "/api/user/isPhoneUser";


    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIIsPhoneUser.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIIsPhoneUser.ResponseData };
}

export class APIOrgClubUploadIcon {
    //接口地址
    static API: string = "/api/oss/upload/avatar";


    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgClubUploadIcon.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIOrgClubUploadIcon.ResponseData };
}
export class APIOrgMemberList {
    //接口地址
    static API: string = "/api/org/club/member/list";


    //字段声明
    static RequestParams: {
        club_id: null;
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgMemberList.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIOrgMemberList.ResponseData };
}
export class APIOrgMangerList {
    //接口地址
    static API: string = "/api/org/club/admin/list";


    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgMangerList.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIOrgMangerList.ResponseData };
}


// 6.玩家申请加入公会列表
export class APIClubJoinList {
    //接口地址
    static API: string = "/api/org/club/user/join/list";

    //字段声明
    static RequestParams: {
        "limit": number,
        "offset": number
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIClubJoinList.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIClubJoinList.ResponseData };
}

// 17.公会管理员冻结公会成员
export class APILockUser {
    //接口地址
    static API: string = "/api/org/club/admin/lock/user";


    //字段声明
    static RequestParams: {
        user_id: number;
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APILockUser.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APILockUser.ResponseData };
}

// 18.公会管理员解冻公会成员
export class APIUnlockUser {
    //接口地址
    static API: string = "/api/org/club/admin/unlock/user";


    //字段声明
    static RequestParams: {
        user_id: number;
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIUnlockUser.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIUnlockUser.ResponseData };
}

// 19.公会管理员删除公会成员
export class APIDeleleUser {
    //接口地址
    static API: string = "/api/org/club/admin/delele/user";


    //字段声明
    static RequestParams: {
        user_id: number;
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIDeleleUser.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIDeleleUser.ResponseData };
}

// 22.管理员查看玩家退会记录
export class APIClubQuitList {
    //接口地址
    static API: string = "/api/org/club/user/quit/log";


    //字段声明
    static RequestParams: {
        "limit": number,
        "offset": number
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIClubQuitList.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIClubQuitList.ResponseData };
}

// 查看成员战绩
export class APIClubStandings {
    //接口地址
    static API: string = "/api/stats/user/standings";


    //字段声明
    static RequestParams: {
        "user_id": number,
        "game_type": number,
        "time_type": number,
        "time_long": number
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIClubStandings.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIClubStandings.ResponseData };
}

export class APIOrgClubGold {
    //接口地址
    static API: string = "/api/org/club/fund/detail";


    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {
        org_id: number, // 公会ID
        gold: number, // 公会金豆数
        gold_lock: number, // 公会被锁定的金豆数
        forbidden: boolean, // 是否冻结 true已冻结，false未冻结
        club_name: string,   //公会名字
    } = null;
    static Request(param: typeof APIOrgClubGold.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIOrgClubGold.ResponseData };
}

/// <summary>
/// 收藏牌普
/// </summary>
export class Web_Misc_Game_Record_Round {
    //接口地址
    static API: string = "/api/misc/game/record_round";

    //字段声明
    static RequestParams: {
        id: number, // 牌普id
        room_id: number, // 普通牌局，
        match_id: number, // mtt赛事id
        room_unique_id: string, // room唯一标识
        name: string, // 
        hand_num: number, // 手数
        change: number, // 金币变动值
        type: number, // 类型
        open: number, // 是否公开
    } = null;

    static ResponseData: {
    } = null;
    static Request(param: typeof Web_Misc_Game_Record_Round.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Misc_Game_Record_Round.ResponseData };
}

/// <summary>
/// 查询牌普列表
/// </summary>
export class Web_Misc_Game_Round_List {
    //接口地址
    static API: string = "/api/misc/game/round/list";

    //字段声明
    static RequestParams: {
        limit: number,
        offset: number,
    } = null;

    static ResponseData: {
    } = null;
    static Request(param: typeof Web_Misc_Game_Round_List.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Misc_Game_Round_List.ResponseData };
}

/// <summary>
/// 成就任务列表
/// </summary>
export class API_PROP_TASK_LIST {
    //接口地址
    static API: string = "/api/prop/task/task_list";

    //字段声明
    static RequestParams: {
        type: number, // 类型ID  任务类型  1；每日任务 2：成就任务
        timezone: number, // 时区 0-巴西 1-utc
        limit: number,
        offset: number,
    } = null;

    static ResponseData: {
    } = null;
    static Request(param: typeof API_PROP_TASK_LIST.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof API_PROP_TASK_LIST.ResponseData };
}

/// <summary>
/// 用户的装扮道具背包
/// </summary>
export class API_BAG_PENDANT_LIST {
    //接口地址
    static API: string = "/api/prop/user_prop/pendant_list";

    //字段声明
    static RequestParams: {
        prop_type: number,
    } = null;

    static ResponseData: {
    } = null;
    static Request(param: typeof API_BAG_PENDANT_LIST.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof API_BAG_PENDANT_LIST.ResponseData };
}

/// <summary>
/// 用户当前装扮的道具
/// </summary>
export class API_BAG_CURRENT_PENDANT_LIST {
    //接口地址
    static API: string = "/api/prop/user_prop/current_pendant_list";

    //字段声明
    static RequestParams: {
        prop_type: number,
    } = null;

    static ResponseData: {
    } = null;
    static Request(param: typeof API_BAG_CURRENT_PENDANT_LIST.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof API_BAG_CURRENT_PENDANT_LIST.ResponseData };
}

/// <summary>
/// 我得背包
/// </summary>
export class Web_Prop_User_Prop_List {
    //接口地址
    static API: string = "/api/prop/user_prop/list";

    //字段声明
    static RequestParams: {
        prop_type: number,//道具类型(prop_type):0-全部;1-mtt门票，2-实物，3-电话卡，4-购物卡，5-代金卷 6-线下门票 7-免服务费代金券 8-充值代金券 9-金豆券 10-一元购活动券 11-道具代替劵
        limit: number,//条目
        offset: number,//开始下标。例子（offset=0，limit=10，0-9。）
    } = null;

    static ResponseData: {
    } = null;
    static Request(param: typeof Web_Prop_User_Prop_List.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Prop_User_Prop_List.ResponseData };
}

/// <summary>
/// 用户穿上装扮道具
/// </summary>
export class API_BAG_PANDANT_UP {
    //接口地址
    static API: string = "/api/prop/user_prop/pendant_up";

    //字段声明
    static RequestParams: {
        prop_id: number, //道具id
    } = null;

    static ResponseData: {
    } = null;
    static Request(param: typeof API_BAG_PANDANT_UP.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof API_BAG_PANDANT_UP.ResponseData };
}

/// <summary>
/// 用户移除装扮道具
/// </summary>
export class API_BAG_PANDANT_DOWN {
    //接口地址
    static API: string = "/api/prop/user_prop/pendant_down";

    //字段声明
    static RequestParams: {
        prop_id: number, //道具id
    } = null;

    static ResponseData: {
    } = null;
    static Request(param: typeof API_BAG_PANDANT_DOWN.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof API_BAG_PANDANT_DOWN.ResponseData };
}

/// <summary>
/// 成就任务领取奖励
/// </summary>
export class API_PROP_TASK_RECEIVE {
    //接口地址
    static API: string = "/api/prop/task/task_receive";

    //字段声明
    static RequestParams: {
        task_id: number,
        timezone: number,
    } = null;

    static ResponseData: {
    } = null;
    static Request(param: typeof API_PROP_TASK_RECEIVE.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof API_PROP_TASK_RECEIVE.ResponseData };
}

/// <summary>
/// 查询牌普列表是否是状态
/// </summary>
export class Web_Misc_Game_Round_Status {
    //接口地址
    static API: string = "/api/misc/game/get_round_status";

    //字段声明
    static RequestParams: {
        room_id: number, //普通牌局，
        room_unique_id: string, // room唯一标识
        hand_num: number, //手数
    } = null;

    static ResponseData: {
    } = null;
    static Request(param: typeof Web_Misc_Game_Round_Status.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Misc_Game_Round_Status.ResponseData };
}

/// <summary>
/// 设置消息模版
/// </summary>
export class API_SET_MSG_TEMPLATE {
    //接口地址
    static API: string = "/api/chat/club/inform/template/set";

    //字段声明
    static RequestParams: {
        template_name: string, //名称,
        content: string, //内容
    } = null;

    static ResponseData: {
    } = null;
    static Request(param: typeof API_SET_MSG_TEMPLATE.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof API_SET_MSG_TEMPLATE.ResponseData };
}

/// <summary>
/// 获取用户消息模版列表
/// </summary>
export class API_GET_MSG_LIST {
    //接口地址
    static API: string = "/api/chat/club/inform/template/list";

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {
    } = null;
    static Request(param: typeof API_GET_MSG_LIST.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof API_GET_MSG_LIST.ResponseData };
}

/// <summary>
/// 删除消息模版
/// </summary>
export class API_DEL_MSG_TEMPLATE {
    //接口地址
    static API: string = "/api/chat/club/inform/template/del";

    //字段声明
    static RequestParams: {
        id: number
    } = null;

    static ResponseData: {
    } = null;
    static Request(param: typeof API_DEL_MSG_TEMPLATE.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof API_DEL_MSG_TEMPLATE.ResponseData };
}

export class API_SEND_MSG {
    public static API: string = "/api/chat/club/send_messages";
    //字段声明
    public static RequestParams: {
        "content": string,
        "message_type": number,  // 消息类型 1 普通消息 2 会长公告 3 战绩分享 4 牌谱分享
        "standings_user_id": number, // 消息类型为 3战绩分享 时，分享的玩家ID
        "game_round_id": number,// 消息类型为 4牌谱分享 时，牌谱ID
        "amount": number
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof API_SEND_MSG.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof API_SEND_MSG.ResponseData
    };
}

/// <summary>
/// 取消收藏牌普
/// </summary>
export class Web_Misc_Game_Remove_Round {

    //接口地址
    static API: string = "/api/misc/game/remove_round";

    //字段声明
    static RequestParams: {
        room_id: number, // 普通牌局，
        room_unique_id: string, // room唯一标识
        hand_num: number, // 手数
    } = null;

    static ResponseData: {
    } = null;
    static Request(param: typeof Web_Misc_Game_Remove_Round.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Misc_Game_Remove_Round.ResponseData };
}

/// <summary>
/// 单手回放信息 生涯（战绩，牌谱）
/// </summary>
export class Web_Room_Center_History_Replay {
    static API: string = "/api/roomcenter/history/replay/{id}";

    //字段声明
    static RequestParams: {

    } = null;


    static ResponseData: {
        org_id: number, // 公会ID
        gold: number, // 公会金豆数
        gold_lock: number, // 公会被锁定的金豆数
        forbidden: boolean, // 是否冻结 true已冻结，false未冻结
        club_name: string,   //公会名字
    } = null;
    static Request(param: typeof Web_Room_Center_History_Replay.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof Web_Room_Center_History_Replay.ResponseData };

    // public sealed class ResponseData : WebResponseDataBase
    // {
    //     public Data data { get; set; }
    // }
    // public sealed class Data
    // {
    //     public List<int> d { get; set; }//自己手牌
    //     public S s { get; set; }
    //     public int u { get; set; }//自己用户随机ID

    // }

    // public sealed class S
    // {
    //     public List<Result> result { get; set; }
    //     public int etime { get; set; }//结束时间戳
    //     public bool straddle { get; set; }//是否开启straddle
    //     public int stime { get; set; }//开始时间戳
    //     public int hand { get; set; }//手数
    //     public Table table { get; set; }//参与牌局的所有人信息
    //     public string name { get; set; }//房间名字
    //     public int rid { get; set; }//房间id
    //     public int mid { get; set; }//比赛id
    //     public string unique { get; set; }//唯一id
    //     public Procedure procedure { get; set; }
    // }

    // public sealed class Result
    // {
    //     public int sn { get; set; }//座位号
    //     public long win { get; set; }//赢的筹码
    //     public int ins { get; set; }//保险
    //     public int fee { get; set; }//服务费
    //     public bool active { get; set; }//是否存活
    //     public List<int> maxcard_idx { get; set; }//最大牌型数组下标
    //     public int card_type { get; set; }//最大牌型
    //     public List<int> card { get; set; }//玩家手牌
    //     public List<int> maxcard_idx2 { get; set; }//第二套牌，最大牌型数组下标
    //     public int card_type2 { get; set; }//最大牌型
    //     public List<SpDetail> sp_detail { get; set; }//第二套牌赢牌详情
    // }

    // public sealed class SpDetail
    // {
    //     public long win { get; set; }//赢得筹码
    //     public bool is_winner { get; set; }//是否赢牌
    // }

    // public sealed class Table
    // {
    //     public long ante { get; set; }//前注
    //     public List<Pl> pl { get; set; }
    //     public SbAndBb sb { get; set; }//小盲注
    //     public SbAndBb bb { get; set; }//大盲注
    //     public bool straddle { get; set; }//强制盲注
    //     public int btn { get; set; }//庄位
    //     public int seatcount { get; set; }//最大座位号
    // }
    // public sealed class Procedure
    // {
    //     public Ante ante { get; set; }
    //     public Preflop preflop { get; set; }
    //     public Flop flop { get; set; }
    //     public Turn turn { get; set; }
    //     public Tiver river { get; set; }
    // }

    // public sealed class Ante
    // {
    //     public List<ProcedurePl> pl { get; set; }
    // }

    // public sealed class Pl
    // {
    //     public int sn { get; set; }//座位号
    //     public long c { get; set; }//初始筹码
    //     public string avatar { get; set; }//头像
    //     public string name { get; set; }//名字
    //     public int uid { get; set; }//随机id
    // }
    // public sealed class SbAndBb
    // {
    //     public int sn { get; set; }//座位号
    //     public long bet { get; set; }//下注筹码
    // }
    // public sealed class Preflop
    // {
    //     public List<ProcedurePl> pl { get; set; }
    // }
    // public sealed class Flop
    // {
    //     public List<ProcedurePl> pl { get; set; }
    //     public List<int> card { get; set; }//公共牌
    //     public bool showcard { get; set; }//是否show牌

    // }
    // public sealed class Turn
    // {
    //     public List<ProcedurePl> pl { get; set; }
    //     public List<int> card { get; set; }//公共牌
    //     public bool showcard { get; set; }//是否show牌
    // }
    // public sealed class Tiver
    // {
    //     public List<ProcedurePl> pl { get; set; }
    //     public List<int> card { get; set; }//公共牌
    //     public bool showcard { get; set; }//是否show牌
    //     public List<int> scard { get; set; }//第二套公共牌
    // }
    // public sealed class ProcedurePl
    // {
    //     public long c { get; set; }//剩余筹码
    //     public long pot_out { get; set; }//池
    //     public int sn { get; set; }//座位号
    //     public string act { get; set; }//动作
    //     public long act_amt { get; set; }//该动作筹码
    //     public int ins { get; set; }//保险
    // }

    // public static string Request(RequestData data)
    // {
    //     return JsonHelper.ToJson(data);
    // }

    // public static ResponseData Response(string json)
    // {
    //     return JsonHelper.FromJson<ResponseData>(json);
    // }
}

export class APIOrgTribeSearchByID {
    //接口地址
    static API: string = "/api/org/tribe/info";


    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgTribeSearchByID.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIOrgTribeSearchByID.ResponseData };
}

export class APIOrgJoinTrip {
    //接口地址
    static API: string = "/api/org/tribe/club/join/apply";


    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgJoinTrip.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: { code?: number, message?: string, data?: typeof APIOrgJoinTrip.ResponseData };
}


export class APIOrgChangeClubData {
    //接口地址
    static API: string = "/api/org/club/modify/club_info";

    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgChangeClubData.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: {
        code?: number, message?: string, data?: typeof APIOrgChangeClubData.ResponseData
    };
}

export class APIOrgCreateTemplate {
    //接口地址
    static API: string = "/api/cmsext/room/template/create";


    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgCreateTemplate.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: {
        code?: number, message?: string, data?: typeof APIOrgCreateTemplate.ResponseData
    };
}
export class APIOrgGetTemplate {
    //接口地址
    static API: string = "/api/cmsext/room/template/list";


    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgGetTemplate.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: {
        code?: number, message?: string, data?: typeof APIOrgGetTemplate.ResponseData
    };
}
export class APIOrgTemplateDelete {
    //接口地址
    static API: string = "/api/cmsext/room/template/delete";


    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgTemplateDelete.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: {
        code?: number, message?: string, data?: typeof APIOrgTemplateDelete.ResponseData
    };
}
export class APIOrgUpdateTemplate {
    //接口地址
    static API: string = "/api/cmsext/room/template/update";


    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgUpdateTemplate.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: {
        code?: number, message?: string, data?: typeof APIOrgUpdateTemplate.ResponseData
    };
}
export class APIOrgRoomCreate {
    //接口地址
    static API: string = "/api/cmsext/room/create";


    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {
        room_id: null;
    } = null;
    static Request(param: typeof APIOrgRoomCreate.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: {
        code?: number, message?: string, data?: typeof APIOrgRoomCreate.ResponseData
    };
}
export class APIOrgGetRoomConfig {
    //接口地址
    static API: string = "/api/cmsext/room/fixed/config";

    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgGetRoomConfig.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: {
        code?: number, message?: string, data?: typeof APIOrgGetRoomConfig.ResponseData
    };
}
export class APIOrgRoomConfigCreate {
    //接口地址
    static API: string = "/api/cmsext/room/config/create";

    //字段声明
    static RequestParams: {

    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgRoomConfigCreate.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: {
        code?: number, message?: string, data?: typeof APIOrgRoomConfigCreate.ResponseData
    };

}
//#region MTT
/// <summary>
/// MTT 比赛列表
///  </summary>
export class Web_Room_Center_Mtt_list {
    static API: string = "/api/roomcenter/mtt/list";
    //字段声明
    static RequestParams: {
        limit: number,  // 页码
        offset: number,  // 页大小
        name: string,  //名字(name)
        mine: boolean,  //是否只有我报名(mine)
        types: number[], // 类型(types)
        hunter: boolean, //猎人模式(hunter)
        tribe_id: number, //联盟ID(tribe_id)
        start_time_s: number, // 开始时间开始(start_time_s)
        start_time_e: number, // 开始时间结束(start_time_e)
        enter_time_s: number,  //进入时间开始(enter_time_s)
        enter_time_e: number,  //进入时间开始(enter_time_e)
        game_type: number[], //游戏类型(game_type)
        poker_type: number[], // 牌类型(poker_type)
        limit_bet_type: number[],  //下注类型(limit_bet_type)
        order: string[], // 排序(order[id_asc,id_desc,start_xxx,enter_xxx])  //asc 正序   //desc 倒序
        buyin_min: number, // 最低买入价格(buyin_min),不包括服务费,人头费
        buyin_max: number // 最高买入价格(buyin_max),不包括服务费,人头费
        status: number[]//0已创建 1正在进行 2已关闭
    } = null;

    static ResponseData: {
        limit: number,
        offset: number,
        total: number,
        records: typeof Web_Room_Center_Mtt_list.RoomListElement[]  // mtt列表
    } = null;

    static RoomListElement:
        {
            match_id: number,//比赛id
            name: string,//比赛名称
            type: number,//room path 房间类型
            game_type: number,//游戏类型
            poker_type: number,//牌类型
            limit_bet_type: number,//底池限注类型
            rank_type: number,//排名类型
            enter_time: string,//进入时间
            start_time: string,//开始时间
            end_time: string,//结束时间
            hunter_on: number,//是否猎人赛
            hunter_bonus: number,//人头奖金
            partial_on: number,//部分带入是否开启 1：开启，0：关闭
            parital_return_bl: number,//部分带入返还升盲等级
            straddle_on: number,//强制盲注是否打开，1：开启，0：关闭
            straddle_max: number,//强制盲注最大次数
            rooms: number,//总桌子
            max_room_id: number,//最大房间id
            delay_view_card_on: number,//延迟看牌。1：开启，0：关闭
            limit_min: number,//参赛人数下限
            limit_delay_times: number,//玩家操作加时次数限制
            limit_auto_check_times: number,//最大check次数
            limit_auto_fold_times: number,//最大fold次数
            participants: number,//参赛人次
            award_num: number,//奖金
            money_sync: number,//奖励圈同步(截止无法买入以后才会开启)
            status: number,//游戏状态
            seat_count: number,//座位总数。9
            final_seat_count: number,//最终座位数量
            no_user_wait_duration: number,
            initial_score: number,//初始记分牌
            blindtable_type: number,//盲注表类型
            upblind_interval: number,//升盲时间
            apply_start_time: string,//报名时间
            op_duration: number,//操作时间
            max_delay_apply_bl: number,//关闭延迟报名，升盲等级
            rebuy_times: number,//重构次数
            max_rebuy_bl: number,//关闭重购，升盲等级
            limit_total_buy_times: number,//最大重购次数
            total_buy_times: number,//总报名次数
            total_rebuy_times: number,//总重购次数
            addon_begin_bl: number,//增购开始盲注等级
            addon_end_bl: number,//增购结束盲注等级
            addon_score: number,//增购记分牌
            total_addon_times: number,//总增购次数
            apply_fee_pool: number,//报名费
            apply_fee_service: number,//服务费
            apply_fee_hunter: number,//猎人赛人头费
            prize_type: number,//奖励类型
            prize_base_pool: number,//奖励数量
            tribe_id: number,//联盟id
            create_time: string,//创建时间
            update_time: string,//
            bought: number,// 0: 无法报名 , 1: 报名中 , 2: 参与中
            alive: number,//存活人数
            is_buy_in: boolean,//是否已经买入
            prop_buy_type: number,// 道具使用类型 1: 只能道具 2: 混合 0: 不支持道具
        } = null;

    static Request(param: typeof Web_Room_Center_Mtt_list.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: {
        code?: number, message?: string, data?: typeof Web_Room_Center_Mtt_list.ResponseData
    };
}
export class APIOrgInvitationRoom {
    //接口地址
    static API: string = "/api/roomcenter/invitation/room";

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgInvitationRoom.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: {
        code?: number, message?: string, data?: typeof APIOrgInvitationRoom.ResponseData
    };

}
export class APIOrgFriendRoomList {
    //接口地址
    static API: string = "/api/roomcenter/friend/rooms";

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgFriendRoomList.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: {
        code?: number, message?: string, data?: typeof APIOrgFriendRoomList.ResponseData
    };

}
export class APIOrgFriendApplyList {
    //接口地址’
    static API: string = "/api/roomcenter/friend/room/apply/list"

    //字段声明
    static RequestParams: {
    } = null;

    static ResponseData: {

    } = null;
    static Request(param: typeof APIOrgFriendApplyList.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    static Response: {
        code?: number, message?: string, data?: typeof APIOrgFriendApplyList.ResponseData
    };

}
export class APIOrgFriendApplyDeal {
    //接口地址’
    public static API: string = "/api/roomcenter/friend/room/apply/audit"

    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgFriendApplyDeal.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgFriendApplyDeal.ResponseData
    };

}
export class APIOrgFriendRoomInfo {
    //接口地址’
    public static API: string = "/api/roomcenter/room/info"

    //字段声明
    public static RequestParams: {

    } = null;

    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgFriendRoomInfo.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgFriendRoomInfo.ResponseData
    };
}
/**
 * 朋友桌带入申请
 */
export class APIOrgFriendBringIn {
    public static API: string = "/api/roomcenter/friend/room/apply/bring_in";
    //字段声明
    public static RequestParams: {
        room_id: number,  // 房间id
        bring_in: number // 带入值
    } = null;
    public static ResponseData: {
        data: typeof APIOrgFriendBringIn.Data
    } = null;
    public static Data: {
        id: number,
        room_creator_id: number,
        bring_in: number,
        status: number,
        op_id: number,
        create_time: string,
        update_time: string,
    } = null;
    public static Request(param: typeof APIOrgFriendBringIn.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgFriendBringIn.ResponseData
    };
}

export class APIOrgClubDelAdmin {
    public static API: string = "/api/org/club/admin/del_admin";
    //字段声明
    public static RequestParams: {
        user_id: number,  //
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubDelAdmin.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgClubDelAdmin.ResponseData
    };
}

export class APIOrgClubCreateRoomChange {
    public static API: string = "/api/org/club/admin/create_room_switch";
    //字段声明
    public static RequestParams: {
        user_id: number,  //
        create_room: number //
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubCreateRoomChange.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgClubCreateRoomChange.ResponseData
    };
}
export class APIOrgClubAddAdmin {
    public static API: string = "/api/org/club/admin/add_admin";
    //字段声明
    public static RequestParams: {
        user_id: number,  //
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubAddAdmin.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgClubAddAdmin.ResponseData
    };
}
export class APIOrgClubMember {
    public static API: string = "/api/org/club/member/ordinary_list";
    //字段声明
    public static RequestParams: {
        club_random_id: number,  //
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubMember.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgClubMember.ResponseData
    };
}
export class APIOrgClubActivityCreate {
    public static API: string = "/api/cmsext/activity/club/update";
    //字段声明
    public static RequestParams: {
        club_id: number,  //
        activity_type: number,  //
        description: string,
        img_url: string,
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubActivityCreate.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgClubActivityCreate.ResponseData
    };
}

export class APIOrgClubActivityInfo {
    public static API: string = "/api/cmsext/activity/club/info";
    //字段声明
    public static RequestParams: {

    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubActivityInfo.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgClubActivityInfo.ResponseData
    };
}
export class APIOrgClubEarning {
    public static API: string = "/api/stats/club/profit";
    //字段声明
    public static RequestParams: {

    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubEarning.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgClubEarning.ResponseData
    };
}
export class APIOrgClubMemberEarning {
    public static API: string = "/api/stats/club/user_profit";
    //字段声明
    public static RequestParams: {

    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubMemberEarning.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgClubMemberEarning.ResponseData
    };
}
export class APISendEmailCode {
    public static API: string = "/api/user/send_email_code";
    //字段声明
    public static RequestParams: {
        lang: number,
        email: string,
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APISendEmailCode.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APISendEmailCode.ResponseData
    };
}
export class APIEmailExist {
    public static API: string = "/api/user/check_email";
    //字段声明
    public static RequestParams: {
        email: string,
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIEmailExist.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIEmailExist.ResponseData
    };
}
export class APIGetBlindStatus {
    public static API: string = "/api/user/bind_status";
    //字段声明
    public static RequestParams: {
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIGetBlindStatus.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIGetBlindStatus.ResponseData
    };
}

export class APIBindEmail {
    public static API: string = "/api/user/bind_email";
    //字段声明
    public static RequestParams: {
        email: string,
        code: string,
        password: string,
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIBindEmail.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIBindEmail.ResponseData
    };
}
export class APIBindPhone {
    public static API: string = "/api/user/bind_phone";
    //字段声明
    public static RequestParams: {
        phone: string,
        code: string,
        area: string,
        password: string,
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIBindPhone.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIBindPhone.ResponseData
    };
}
export class APIBindThrid {
    public static API: string = "/api/user/bind_third_party";
    //字段声明
    public static RequestParams: {

    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIBindPhone.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIBindPhone.ResponseData
    };
}
export class APIOrgClubLevelBenefit {
    public static API: string = "/api/org/club/level_benefit";
    //字段声明
    public static RequestParams: {

    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubLevelBenefit.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgClubLevelBenefit.ResponseData
    };
}

export class APIOrgClubLevelInfo {
    public static API: string = "/api/org/club/level_info";
    //字段声明
    public static RequestParams: {

    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubLevelInfo.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgClubLevelInfo.ResponseData
    };
}
export class APIOrgClubLevelCost {
    public static API: string = "/api/org/club/level_cost";
    //字段声明
    public static RequestParams: {

    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubLevelCost.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgClubLevelCost.ResponseData
    };
}

export class APIOrgClubUpLevel {
    public static API: string = "/api/org/club/level_up";
    //字段声明
    public static RequestParams: {

    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubUpLevel.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgClubUpLevel.ResponseData
    };
}


export class APIOrgClubRoom {
    public static API: string = "/api/roomcenter/club/rooms";
    //字段声明
    public static RequestParams: {

    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubRoom.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgClubRoom.ResponseData
    };
}

export class APIOrgSendMess {
    public static API: string = "/api/chat/club/send_messages";
    //字段声明
    public static RequestParams: {
        "content": string,
        "message_type": number,  // 消息类型 1 普通消息 2 会长公告 3 战绩分享 4 牌谱分享
        "standings_user_id": number, // 消息类型为 3战绩分享 时，分享的玩家ID
        "game_round_id": number// 消息类型为 4牌谱分享 时，牌谱ID
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgSendMess.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgSendMess.ResponseData
    };
}
export class APIOrgGetMessList {
    public static API: string = "/api/chat/club/messages";
    //字段声明
    public static RequestParams: {
        "history_id": number, // 查历史，小于此ID的消息
        "last_id": number, // 查最新，大于此ID的消息
        "limit": 10,
        "offset": 0
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgGetMessList.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgGetMessList.ResponseData
    };


}

export class APIOrgGetNewMessNum {
    public static API: string = "/api/chat/club/messages/new_count";
    //字段声明
    public static RequestParams: {
        "msg_id": number
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgGetNewMessNum.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgGetNewMessNum.ResponseData
    };
}

export class APIOrgClubUserInfo {
    public static API: string = "/api/org/club/user/info";
    //字段声明
    public static RequestParams: {
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubUserInfo.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgClubUserInfo.ResponseData
    };
}

export class APIOrgClubUserRemarks {
    public static API: string = "/api/org/club/user/update";
    //字段声明
    public static RequestParams: {
    } = null;
    public static ResponseData: {

    } = null;
    public static Request(param: typeof APIOrgClubUserRemarks.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: {
        code?: number, message?: string, data?: typeof APIOrgClubUserRemarks.ResponseData
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
(window as any).Web_Room_Center_Mtt_list = Web_Room_Center_Mtt_list;
