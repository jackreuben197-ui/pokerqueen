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
}
/**
 * 流程
 */
export enum ProcedureEnum {
    //闲置
    Idel = 0,
    //初始化
    Init = 1,
    //预加载
    Preloading = 2,
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
    HTTP: string;
    WebHost: string;
    LoginHost: string;
    APIPort: string;
    PayPort: string;
    LoginPort: string;
    HeadPort: string;
    PaipuPort: string; //牌谱
    UploadPort: string; //头像上传
    UseDNS: string;
    AboutWeURL: string;
    UserAgentURL: string;
    DataAnalysURL: string;

    WebURL: string;
    PayURL: string;
    HeadUrl: string;
    BannerImageUrl: string;
    UploadURL: string;
    PaipuBaseUrl: string;

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

///////////////////////////////////////////////////
/**
 * 游戏类型
 */
export enum GameType {
    Holdem = 0,//德州
    Omaha4 = 1,//奥马哈四张
    Omaha5 = 2,//奥马哈五张
    Omaha6 = 3,//奥马哈六张
}

/**
 * 扑克类型
 */
export enum PokerType {
    Normal = 0,//普通
    SixPlus = 2//短牌
}

/**
 * 下注类型
 */
export enum BetType {
    NoLimit = 0,//无限注
    PotLimit = 1,//底池限注
    Aof = 2,//aof
}


export enum RoomType {
    TexasHoldemStandardNoLimit = 0,               //普通局 德州--
    TexasHoldemStandardPotLimit = 1,              //普通局 德州--底池限注
    TexasHoldemStandardAof = 2,                   //普通局 德州--AOF
    TexasHoldemSixPlusFixedNoLimit = 16,          //普通局 德州--短牌
    TexasHoldemSixPlusFixedPotLimit = 17,         //普通局 德州--短牌，底池限注
    TexasHoldemSixPlusFixedAof = 18,              //普通局 德州--短牌，AOF
    Omaha4StandardNoLimit = 64,                   //奥马哈--4张，普通
    Omaha4StandardPotLimit = 65,                  //奥马哈--4张，底池限注
    Omaha4StandardAof = 66,                       //奥马哈--4张，AOF
    Omaha4SixPlusFixedNoLimit = 80,               //奥马哈--4张，短牌
    Omaha4SixPlusFixedPotLimit = 81,              //奥马哈--4张，短牌，底池限注
    Omaha4SixPlusFixedAof = 82,                   //奥马哈--4张，短牌，AOF
    Omaha5StandardNoLimit = 128,                  //奥马哈--5张，普通
    Omaha5StandardPotLimit = 129,                 //奥马哈--5张，底池限注
    Omaha5StandardAof = 130,                      //奥马哈--5张，AOF
    Omaha5SixPlusFixedNoLimit = 144,              //奥马哈--5张，短牌
    Omaha5SixPlusFixedPotLimit = 145,             //奥马哈--5张，短牌底池限注
    Omaha5SixPlusFixedAof = 146,                  //奥马哈--5张，短牌，AOF
    Omaha6StandardNoLimit = 192,                  //奥马哈--6张     
    Omaha6StandardPotLimit = 193,                 //奥马哈--6张，底池限注
    Omaha6StandardAof = 194,                      //奥马哈--6张，AOF
    Omaha6SixPlusFixedNoLimit = 208,              //奥马哈--6张，短牌
    Omaha6SixPlusFixedPotLimit = 209,             //奥马哈--6张，短牌，底池限注
    Omaha6SixPlusFixedAof = 210,                  //奥马哈--6张，短牌，AOF
    MTTTexasHoldemStandardNoLimit = 512,          //MTT--普通
    MTTTexasHoldemStandardPotLimit = 513,
    MTTTexasHoldemStandardAof = 514,
    MTTTexasHoldemSixPlusFixedNoLimit = 528,
    MTTTexasHoldemSixPlusFixedPotLimit = 529,
    MTTTexasHoldemSixPlusFixedAof = 530,
    MTTOmaha4StandardNoLimit = 576,
    MTTOmaha4StandardPotLimit = 577,
    MTTOmaha4StandardAof = 578,
    MTTOmaha4SixPlusFixedNoLimit = 592,
    MTTOmaha4SixPlusFixedPotLimit = 593,
    MTTOmaha4SixPlusFixedAof = 594,
    MTTOmaha5StandardNoLimit = 640,
    MTTOmaha5StandardPotLimit = 641,
    MTTOmaha5StandardAof = 642,
    MTTOmaha5SixPlusFixedNoLimit = 656,
    MTTOmaha5SixPlusFixedPotLimit = 657,
    MTTOmaha5SixPlusFixedAof = 658,
    MTTOmaha6StandardNoLimit = 704,
    MTTOmaha6StandardPotLimit = 705,
    MTTOmaha6StandardAof = 706,
    MTTOmaha6SixPlusFixedNoLimit = 720,
    MTTOmaha6SixPlusFixedPotLimit = 721,
    MTTOmaha6SixPlusFixedAof = 722,

    GameNiuZai = 1024, // 牛仔游戏
}