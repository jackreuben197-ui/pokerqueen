/*
 * @Author: xfj
 * @Date: 2022-09-19 17:20:26
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-29 13:13:55
 * @FilePath: /pokerqueen/assets/script/config/GameConfig.ts
 */
/**
 * GameConfig
 * 游戏配置
 */
import { INetWork } from "../define/EIDefine";

export class GameConfig {

    static publish: boolean = false;

    //需要清理storage,就递增这个值
    static clean_all_flag: number = 2;
    static Web_Host_Test1 = "test1.awanptest.com";
    static Web_Host_Dev1 = "dev1.awanptest.com";
    static Web_Host_Dev = "dev.awanptest.com";
    static Web_Host_Test2 = "test2.awanptest.com";
    //0: http://dev.awanptest.com 
    //1: http://test1.awanptest.com  
    //2: http://dev1.awanptest.com 
    //3: https://test1.awanptest.com  
    //4: https://dev1.awanptest.com 
    static BuildType: number = 5;
    //版本号
    static Version: string = "20230421_1800";

    static Default_Language: string = "cn";
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
    static Server_Type = 1;

    //对应 GlobalProto.txt
    //static GlobalProto: any = null;
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
    { lan: "en", name: "sl_K8cPNvxU" },
    { lan: "pt", name: "sl_ptyyPutao" },
    { lan: "cn", name: "sl_bnftN7UY" },
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
//文本选中文字颜色
//export var Text_Colors = ["#FFFFFF", "#35A3B3"];

export var TextColor = {
    Color1: "#FFFFFF",//白色
    Color2: "#35A3B3",//亮蓝色
    Color3: "#757CAB",//灰色
    Color4: "#7187FF",//蓝色
    Color5: "#B0FFAE",//亮绿
    Color6: "#FF7C7C",//亮红
    Color7: "#EEF5FF",//次白色
    Color8: "#FEEC8E",//淺黃色

}
//成员管理排序表
export var Member_Order_List = [
    { show: "UIGuild_MemberManagerSortByWinOrLose", index: 0, icon: "Up", sort_type: 1, order_type: 1 },

    { show: "UIGuild_MemberManagerSortByHands", index: 2, icon: "Up", sort_type: 2, order_type: 1 },

    { show: "UIGuild_MemberManagerSortByServiceFee", index: 4, icon: "Up", sort_type: 3, order_type: 1 },

    { show: "UIGuild_MemberManagerSortByLastLoginTime", index: 6, icon: "Up", sort_type: 4, order_type: 1 },

];
//页签状态 暂时支持6个页签
export var Tabs_Status =
{
    [-1]: [0, 0, 0, 0, 0, 0],
    0: [1, 0, 0, 0, 0, 0],
    1: [0, 1, 0, 0, 0, 0],
    2: [0, 0, 1, 0, 0, 0],
    3: [0, 0, 0, 1, 0, 0],
    4: [0, 0, 0, 0, 1, 0],
    5: [0, 0, 0, 0, 0, 1],
}
//获取游戏类型名
export function GetGameTypeName(data: any): string {
    let str = "NLH";
    if (data.game_type == 1) {
        str = "PLO4";
    } else if (data.game_type == 2) {
        str = "PLO5";
    } else if (data.game_type == 3) {
        str = "PLO6";
    } else if (data.poker_type == 2) {
        str = "6+";
    }
    return str;
}
