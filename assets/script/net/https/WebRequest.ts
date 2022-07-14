
// export interface IResponseData {
//     code: number;
//     message?: string;
//     data?: any;
// }

/**
 * https 请求登录获取Token
 */
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


/**
 * https 验证手机号
 */
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
/**
 * https 获取验证码
 */
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

/**
 * https 修改密码
 */
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
        user_id?: number,s
    } = null;

    public static Request(param: typeof Web_User_Modify_Password.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_User_Modify_Password.ResponseData };
}

/**
 * https 手机号用户注册
 */
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

/**
 * https 请求用户信息
 */
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

/**
 * https 请求频道信息 socket的port
 */
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
/**
 * https 获取全局配置
 */
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


/**
 * https 获取多语言配置
 */
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


/**
 * https 获取banner列表
 */
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
        list: typeof Web_Misc_Banner_List.BannerInfo// Banner列表
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


/**
 * https 获取大厅房间列表
 */
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

/**
 * https 获取未读消息 （只有五条）
 */
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