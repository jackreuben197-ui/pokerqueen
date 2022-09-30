/**
 * 全局枚举和接口定义
 */
export enum UIType {
    Scene,
    Form,
    Board,
    Dialog,
    Alert,
    Prompt,
    TexasPreLoad,
    TexasUISting,
    UITexasRule,
    UITexasReport,
    UITexasHistory,
    CommonUI,//普通UI
}
/**
 * 流程
 */
export enum ProcedureEnum {
    //闲置
    Idel = 0,
    //初始化
    Init = 1,
    //预加载login
    PrelLoadLogin = 2,
    //配置
    Config = 3,
    //登录
    Login = 4,
    //进入大厅请求
    EnterLobby = 5,
    //大厅
    Lobby = 6,
    //进入牌桌
    EnterTexas = 7,
    //牌桌
    Texas = 8
}
/**
 * UI 渐入渐出样式
 */
export enum UIFadeStyleEnum {
    None = 0,
    //右边渐入渐出
    RightInOut = 1,
    //左边渐入渐出
    LeftInOut = 2,
    //缩放渐入渐出
    ScaleInOut = 3,
}

/**
 * UIDefine接口
 */
export interface IUIDefine {
    UIType: UIType,
    Name: string,
    Bundle: string,
    Path: string,
    Title?: string,
    DisAdaptScreen?: boolean,
    UIFadeStyle?: UIFadeStyleEnum
}

/**
 * Dialog参数接口
 */
export interface DialogParam {
    title?: string;
    content?: string;
    confirm?: string;
    cancel?: string;
    confirmCallback?: () => void;
    cancelCallback?: () => void;
    block?: boolean;
    style?: any;
}

export interface INetWork {
    //HTTP: string;
    WebHost?: string;
    // LoginHost: string;
    // APIPort: string;
    // PayPort: string;
    // LoginPort: string;
    // HeadPort: string;
    // PaipuPort: string; //牌谱
    // UploadPort: string; //头像上传
    // UseDNS: string;
    // AboutWeURL: string;
    // UserAgentURL: string;
    // DataAnalysURL: string;

    // WebURL: string;
    // PayURL: string;
    // HeadUrl: string;
    // BannerImageUrl: string;
    // UploadURL: string;
    // PaipuBaseUrl: string;
    WSS?: string;

}
/**
 * 刷新接口
 */
export interface IUpdate {
    allowUpdate: boolean;
    awake?(param?: any);
    update(dt: number);
    start?();
    stop?();
}
/**
 * bundle包
 */
export var Bundle = {
    Texas: "texas",
}
/**
 * ITweenDelay接口，注入delay延时字段
 */
export interface ITweenDuration {
    duration: number;
}

///////////////////////////////////////////////////
