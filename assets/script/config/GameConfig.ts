/*
 * @Author: xfj
 * @Date: 2022-09-19 17:20:26
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-22 10:03:21
 * @FilePath: /pokerqueen/assets/script/config/GameConfig.ts
 */
/**
 * GameConfig
 * 游戏配置
 */
import { INetWork } from "../define/EIDefine";

export class GameConfig {

    static debug: boolean = true;
    static Web_Host_Test1 = "test1.awanptest.com";
    static Web_Host_Dev1 = "dev1.awanptest.com";
    static Web_Host_Dev = "dev.k8s.awanptest.com";
    //0: http://dev.k8s.awanptesting.com 
    //1: http://test1.awanptesting.com  
    //2: http://dev1.awanptesting.com 
    //3: https://test1.awanptesting.com  
    //4: https://dev1.awanptesting.com 
    static BuildType: number = 3;
    //版本号
    static Version: string = "20221122_1700";

    static Default_Language: string = "en";
    //是否使用代理
    static useProxy: boolean = false;
    //是否使用新域名
    //static IsNewArea: boolean = false;
    //设计分辨率
    static DesignResolution = cc.size(1242, 2688);
    //fps
    static FrameRate = 60;
    //多点触摸
    static ENABLE_MULTI_TOUCH = false;

    //服务器类型 1测试 2正式
    static Server_Type = 2;

    //对应 GlobalProto.txt
    static GlobalProto: { NetLineSwitchUrl?: string } = null;
    //网络配置
    static Network: INetWork = null;

    //默认区号
    static DefaultAreaCode: string = "+55";

}
/**
 * 网络配置
 */
export var NetWorkBase = {
    WebHostIP: "152.70.234.14",
    LoginHostIP: "152.70.234.14",
    LoginPort: "8058",
    APIPort: "5060",
    PayPort: "9403",
    HeadPort: "5051",
    PaipuPort: "6038",
    UploadPort: "5050",
    UseDNS: "false",
    AboutWeURL: "xxx",
    UserAgentURL: "xxx",
    DataAnalysisURL: "xxx",
}

/**
 * 语言列表
 */
export var LanguageList: { lan: string, name: string }[] = [
    { lan: "en", name: "UILogin_USA" },
    { lan: "pt", name: "sl_ptyyPutao" },
    { lan: "cn", name: "UILogin_China" },
];
/**
 * Log样式
 */
export var LogStyle = {
    http_request: "color:yellow;background:#1E1E1E",
    http_response: "color:#38A7F1;background:#1E1E1E",
    ws_request: "color:#E3C127;background:#47100A",
    ws_response: "color:#19FF00;background:#47100A",
}
