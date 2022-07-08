
export interface IResponseData {
    code: number;
    message?: string;
    data?: any;
}
// export interface IRequest {
//     API: number;
//     RequestParams?: any;
//     Request: (param: typeof this.RequestParams)
// }
/**
 * https 请求的数据模型
 */
export class Web_Login {
    //接口地址
    public static API: string = "/api/user/login";
    //字段声明
    public static RequestParams: {
        phone?            : string,        // 手机号
        password?         : string,        // 密码MD5
        area?             : string,        // 区号ProtocolCode
        device_id?        : string,        // 设备唯一id
        mac_addr?         : string,        // mac地址
        is_simulator?     : boolean,        // 是否是模拟器
        simulator_name?   : string,        // 模拟器名称
        system_version?   : string,        // 系统版本号
        user_device_no?   : string,        // 设备机型
    } = null;

    public static ResponseData: {
        token?        : string,        // 手机号
        expire_at?    : number,        // 密码MD5
    } = null;


    public static Request(param: typeof Web_Login.RequestParams) {
        Web_Login.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_Login.ResponseData };
}


export class Web_User_Info {
    //接口地址
    public static API: string = "/api/user/info";
    public static RequestParams: {
    } = null;
    public static ResponseData: {
        user?       : typeof Web_User_Info.UserInfo,        // 用户信息
    } = null;
    public static UserInfo : {
        area?                   : string,        //手机号地区 例子：+86
        phone?                  : string,        //手机号
        forbid?                 : number,        //0禁止登陆; 1正常登录
        gold?                   : number,        //金豆
        gold_lock?              : number,        //被锁金豆
        wallet_status?          : number,        //钱包状态
        un_id?                  : number,        //玩家随机id
        nickname?               : string,        //名字
        avatar?                 : string,        //头像
        sex?                    : number,        //性别
        birthday?               : string,        //生日
        country?                : string,        //国家
        city?                   : string,        //城市
        province?               : string,        //省会
        mnt?                    : number,        //修改用户[名称]次数
        mat?                    : number,        //修改用户[头像]次数
        ut?                     : number,        //1 普通用户; 2 支桌号; 3 牌局机器人; 4 牛仔机器人
        forbid_withdraw_gold?   : number,        //提现冻结，1 开启，2 关闭
        forbid_bring_in?        : number,        //带入冻结，1 开启，2 关闭
    } = null;
    public static Request(param: typeof Web_Login.RequestParams) {
        Web_User_Info.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_User_Info.ResponseData };
}

