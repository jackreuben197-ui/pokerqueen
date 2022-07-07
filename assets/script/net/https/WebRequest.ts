/**
 * https 请求的数据模型
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
    public static Request(param: typeof Web_Login.RequestParams) {
        Web_Login.RequestParams = param;
        return param;
    }
}
