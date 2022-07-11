/**
 * GameConfig
 * 游戏配置
 */

import { INetWork } from "../define/EIDefine";

export class GameConfig {
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
/** 区号 简体中文 */
export var AreaCode_CN: Map<string, string> = new Map([
    ["巴西", "+55"],
    ["美国", "+1"],
    ["英国", "+44"],
    ["法国", "+33"],
    ["德国", "+49"],
    ["意大利", "+39"],
    ["西班牙", "+34"],
    ["葡萄牙", "+351"],
    ["澳大利亚", "+61"],
    ["荷兰", "+31"],
    ["新西兰", "+64"],
    ["香港", "+852"],
    ["澳门", "+853"],
    ["菲律宾	", "+63"],
    ["韩国", "+82"],
    ["柬埔寨", "+855"],
    ["马来西亚	", "+60"],
    ["日本", "+81"],
    ["泰国", "+66"],
    ["台湾", "+886"],
    ["文莱", "+673"],
    ["新加坡", "+65"],
    ["印度", "+91"],
    ["印度尼西亚", "+62"],
    ["越南", "+84"],
    ["俄罗斯", "+7"],
    ["阿拉伯酋长国", "+971"]
])


/** 区号 台湾省 */
export var AreaCode_TW: Map<string, string> = new Map([
    ["巴西", "+55"],
    ["美國", "+1"],
    ["英國", "+44"],
    ["法國", "+33"],
    ["德國", "+49"],
    ["意大利", "+39"],
    ["西班牙", "+34"],
    ["葡萄牙", "+351"],
    ["澳大利亞", "+61"],
    ["荷蘭", "+31"],
    ["新西蘭", "+64"],
    ["香港", "+852"],
    ["澳門", "+853"],
    ["菲律賓", "+63"],
    ["韓國", "+82"],
    ["柬埔寨", "+855"],
    ["馬來西亞  ", "+60"],
    ["日本", "+81"],
    ["泰國", "+66"],
    ["臺灣", "+886"],
    ["文萊", "+673"],
    ["新加坡", "+65"],
    ["印度", "+91"],
    ["印度尼西亞", "+62"],
    ["越南", "+84"],
    ["俄羅斯", "+7"],
    ["阿拉伯酋长国", "+971"]
])

/** 区号 英语地区 */
export var AreaCode_EN: Map<string, string> = new Map([
    ["Brazil", "+55"],
    ["United States", "+1"],
    ["British", "+44"],
    ["France", "+33"],
    ["Germany", "+49"],
    ["Italy", "+39"],
    ["Spain", "+34"],
    ["Portugal", "+351"],
    ["Australia", "+61"],
    ["Netherlands", "+31"],
    ["New Zealand", "+64"],
    ["Hong Kong", "+852"],
    ["Macau", "+853"],
    ["Philippines", "+63"],
    ["South Korea", "+82"],
    ["Cambodia", "+855"],
    ["Malaysia", "+60"],
    ["Japan", "+81"],
    ["Thailand", "+66"],
    ["Taiwan", "+886"],
    ["Brunei", "+673"],
    ["Singapore", "+65"],
    ["India", "+91"],
    ["Indonesia", "+62"],
    ["Vietnamese", "+84"],
    ["Russia", "+7"],
    ["The United Arab Emirates", "+971"]
])

/** 区号 巴西 */
export var AreaCode_BR: Map<string, string> = new Map([
    ["Brasil", "+55"],
    ["Estados Unidos", "+1"],
    ["Britânico", "+44"],
    ["França", "+33"],
    ["Alemanha", "+49"],
    ["Itália", "+39"],
    ["Espanha", "+34"],
    ["Portugal", "+351"],
    ["Austrália", "+61"],
    ["Holanda", "+31"],
    ["Nova Zelândia", "+64"],
    ["Hong Kong", "+852"],
    ["Macau", "+853"],
    ["Filipinos", "+63"],
    ["Coréia", "+82"],
    ["Camboja", "+855"],
    ["Malásia", "+60"],
    ["Japão", "+81"],
    ["Tailândia", "+66"],
    ["Taiwan", "+886"],
    ["Brunei", "+673"],
    ["Cingapura", "+65"],
    ["Índio", "+91"],
    ["Indonésio", "+62"],
    ["vietnamita", "+84"],
    ["Rússia", "+7"],
    ["Os Emirados Árabes Unidos", "+971"]
])