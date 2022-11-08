
import { UIType } from "./EIDefine";

export type UIDefineType = {
    UIType?: UIType,
    Name?: string,
    Bundle?: string,
    Path?: string,
    Title?: string,
}

export const UIDefine = {

    //预加载UI
    UIPreloadingComponent: {
        Name: "UIPreloadingComponent"
    },
    //GM界面
    UIGMComponent: {
        Name: "UIGMComponent"
    },
    /**
     *  场景
     */
    //登录场景
    LoginScene: {
        UIType: UIType.Scene,
        Name: "LoginScene",
        Bundle: null,
        Path: "login/scene/LoginScene"
    },
    //大厅场景
    LobbyScene: {
        UIType: UIType.Scene,
        Name: "LobbyScene",
        Bundle: null,
        Path: "main/lobby/prefab/scene/LobbyScene"
    },
    //基础牌桌
    UITexas: {
        UIType: UIType.Scene,
        Name: "UITexas",
        Bundle: "texas",
        Path: "prefab/scene/UITexas"
    },
    /**
     *  标题窗口
     */
    //标题模板(不使用)
    BaseForm: {
        UIType: UIType.Form,
        Name: "BaseForm",
        Bundle: null,
        Path: "login/form/BaseForm",
        Title: "BaseForm",
    },
    //语言
    LanguageForm: {
        UIType: UIType.Form,
        Name: "LanguageForm",
        Bundle: null,
        Path: "main/prefab/form/LanguageForm",
        Title: "UIMine_SettingLanguage",
    },
    //电话区号
    AreaCodeForm: {
        UIType: UIType.Form,
        Name: "AreaCodeForm",
        Bundle: null,
        Path: "login/form/AreaCodeForm",
        Title: "UILogin_Local",
    },
    //电话区号
    UserAgreeForm: {
        UIType: UIType.Form,
        Name: "UserAgreeForm",
        Bundle: null,
        Path: "login/form/UserAgreeForm",
        Title: "tc_5E0V3qlb",
    },
    //设置
    SettingsForm: {
        UIType: UIType.Form,
        Name: "SettingsForm",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_Setting",
        Title: "UIMine_btn_setting",
    },
    //设置-客服
    MyService: {
        UIType: UIType.Form,
        Name: "MyService",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_Service",
        Title: "UIMineMain01",
    },
    //设置-消息
    UIMine_Message: {
        UIType: UIType.Form,
        Name: "UIMine_Message",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_Message",
        Title: "UIMine_Message",
    },
    //设置-玩家信息
    MyPlayInfo: {
        UIType: UIType.Form,
        Name: "MyPlayInfo",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_PlayInfo",
        Title: "",
    },
    //牌谱详情
    UIMine_Poker: {
        UIType: UIType.Form,
        Name: "UIMine_Poker",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_Poker",
        Title: "",
    },
    //设置-版本
    UIMine_SettingVersion: {
        UIType: UIType.Form,
        Name: "UIMine_SettingVersion",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_SettingVersion",
        Title: "",
    },
    //设置-关于
    UIMine_About: {
        UIType: UIType.Form,
        Name: "UIMine_About",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_About",
        Title: "UIMine_SettingAboutus",
    },
    //公会-成员详细
    UIMember: {
        UIType: UIType.Form,
        Name: "UIMember",
        Bundle: null,
        Path: "main/lobby/prefab/record/UIMember",
        Title: "",
    },
    //战绩
    UIRecord: {
        UIType: UIType.Form,
        Name: "UIRecord",
        Bundle: null,
        Path: "main/lobby/prefab/record/UIRecord",
        Title: "UICareerRecord",
    },
    //成就
    UIMineArch: {
        UIType: UIType.Form,
        Name: "UIMineArch",
        Bundle: null,
        Path: "main/lobby/prefab/achi/UIMineArch",
        Title: "",
    },
    //背包
    UIMineBag: {
        UIType: UIType.Form,
        Name: "UIMineBag",
        Bundle: null,
        Path: "main/lobby/prefab/bag/UIMineBag",
        Title: "",
    },
    //战绩详情
    UIRecordDetail: {
        UIType: UIType.Form,
        Name: "UIRecordDetail",
        Bundle: null,
        Path: "main/lobby/prefab/record/UIRecordDetail",
        Title: "",
    },
    //本局牌谱
    UIRecordScore: {
        UIType: UIType.Form,
        Name: "UIRecordScore",
        Bundle: null,
        Path: "main/lobby/prefab/record/UIRecordScore",
        Title: "UIMine_RecordDetailForNormal_FENSVUz3",
    },
    //收藏牌谱
    UICollectScore: {
        UIType: UIType.Form,
        Name: "UICollectScore",
        Bundle: null,
        Path: "main/lobby/prefab/record/UICollectScore",
        Title: "",
    },
    //带入申请
    UIRecordInto: {
        UIType: UIType.Form,
        Name: "UIRecordInto",
        Bundle: null,
        Path: "main/lobby/prefab/record/UIRecordInto",
        Title: "",
    },
    //保险详情
    MttRecordBXListForm: {
        UIType: UIType.Form,
        Name: "MttRecordBXListForm",
        Bundle: null,
        Path: "main/lobby/prefab/record/MttRecordBXListForm",
        Title: "",
    },
    //房间模版
    UIMatchPlayViewForm: {
        UIType: UIType.Form,
        Name: "UIMatchPlayViewForm",
        Bundle: null,
        Path: "main/lobby/prefab/matchView/UIMatchPlayViewForm"
    },

    UIMatchChessView: {
        UIType: UIType.CommonUI,
        Name: "UIMatchChessView",
        Bundle: null,
        Path: "main/lobby/prefab/matchView/UIMatchChessView"
    },

    UIMatchSportsView: {
        UIType: UIType.CommonUI,
        Name: "UIMatchSportsView",
        Bundle: null,
        Path: "main/lobby/prefab/matchView/UIMatchSportsView"
    },

    UIMatchGameView: {
        UIType: UIType.CommonUI,
        Name: "UIMatchGameView",
        Bundle: null,
        Path: "main/lobby/prefab/matchView/UIMatchGameView"
    },

    UIMatchRealityView: {
        UIType: UIType.CommonUI,
        Name: "UIMatchRealityView",
        Bundle: null,
        Path: "main/lobby/prefab/matchView/UIMatchRealityView"
    },

    UIMttSignDialogComponent: {
        UIType: UIType.CommonUI,
        Name: "UIMttSignDialogComponent",
        Bundle: null,
        Path: "main/mtt/detail/UIMttSignDialogComponent"
    },

    /**
     *  触摸板子（触摸黑色底板关闭）
     */
    //触摸板子模板(不使用)
    BaseTouchBoard: {
        UIType: UIType.Board,
        Name: "BaseTouchBoard",
        Bundle: null,
        Path: "main/prefab/board/BaseTouchBoard",

    },
    RightTouchBoard: {
        UIType: UIType.Board,
        Name: "RightTouchBoard",
        Bundle: null,
        Path: "main/prefab/board/RightTouchBoard",

    },

    BottomTouchBoard: {
        UIType: UIType.Board,
        Name: "BottomTouchBoard",
        Bundle: null,
        Path: "main/prefab/board/BottomTouchBoard",
    },

    /**
     * 确认取消 弹窗面板(默认触摸全屏可关闭)
     */
    UIDialogComponent: {
        UIType: UIType.Dialog,
        Name: "UIDialogComponent",
        Bundle: null,
        Path: "main/prefab/dialog/UIDialogComponent",
    },
    UIPromptComponent: {
        UIType: UIType.Prompt,
        Name: "UIPromptComponent",
        Bundle: null,
        Path: "login/UIPromptComponent",
    },
    TexasPreLoad: {
        UIType: UIType.TexasPreLoad,
        Name: "TexasPreLoad",
        Bundle: null,
        Path: "main/prefab/component/TexasPreLoad",
    },
    UITexasSettingComponent: {
        UIType: UIType.CommonUI,
        Name: "UITexasSetting",
        Bundle: 'texas',
        Path: "prefab/widgetLayer/UITexasSetting",
    },
    UITexasRule: {
        UIType: UIType.CommonUI,
        Name: "UITexasRule",
        Bundle: 'texas',
        Path: "prefab/widgetLayer/UITexasRule",
    },
    UITexasReportComponent: {
        UIType: UIType.CommonUI,
        Name: "UITexasReport",
        Bundle: 'texas',
        Path: "prefab/widgetLayer/UITexasReport",
    },
    UITexasHistoryComponent: {
        UIType: UIType.CommonUI,
        Name: "UITexasHistory",
        Bundle: 'texas',
        Path: "prefab/widgetLayer/UITexasHistory",
    },
    UITexasGameEndComponent: {
        UIType: UIType.CommonUI,
        Name: "UITexasGameEndComponent",
        Bundle: 'texas',
        Path: "prefab/ui/UITexasGameEnd",
    },
    UICreatelabor: {
        UIType: UIType.Form,
        Name: "UICreatelabor",
        Bundle: null,
        Path: "main/club/UICreatelabor",
    },
    UIlaborJoin: {
        UIType: UIType.Form,
        Name: "UIlaborJoin",
        Bundle: null,
        Path: "main/club/UIlaborJoin",
    },
    //房间模版
    UILaborPlayViewForm: {
        UIType: UIType.CommonUI,
        Name: "UILaborPlayViewForm",
        Bundle: null,
        Path: "main/prefab/UILaborPlayViewForm"
    },

    UITexasPlayerInfoComponent: {
        UIType: UIType.CommonUI,
        Name: "UITexasPlayerInfo",
        Bundle: 'texas',
        Path: "prefab/ui/UITexasPlayerInfo",
    },

    UITexasInsuranceComponent: {
        UIType: UIType.CommonUI,
        Name: "UITexasInsuranceComponent",
        Bundle: 'texas',
        Path: "prefab/ui/UITexasInsurance",
    },

    UIPlayerLookLabor: {
        UIType: UIType.Form,
        Name: "UIPlayerLookLabor",
        Bundle: null,
        Path: "main/club/UIPlayerLookLabor",
    },
    UIManageLabor: {
        UIType: UIType.Form,
        Name: "UIManageLabor ",
        Bundle: null,
        Path: "main/club/UIManageLabor",
    },
    UIJoinUnion: {
        UIType: UIType.Form,
        Name: "UIJoinUnion ",
        Bundle: null,
        Path: "main/club/UIJoinUnion",
    },
    UIlaborMerberManager: {
        UIType: UIType.Form,
        Name: "UIlaborMerberManager",
        Bundle: null,
        Path: "main/club/UIlaborMerberManager",
    },
    UIlaborExaminatMerber: {
        UIType: UIType.Form,
        Name: "UIlaborExaminatMerber",
        Bundle: null,
        Path: "main/club/UIlaborExaminatMerber",
    },

    MyWalletForm: {
        UIType: UIType.Form,
        Name: "MyWalletForm",
        Bundle: null,
        Path: "main/wallet/MyWalletForm",
    },

    WalletJumpForm: {
        UIType: UIType.Form,
        Name: "WalletJumpForm",
        Bundle: null,
        Path: "main/wallet/WalletJumpForm",
    },

    GoldOprationForm: {
        UIType: UIType.Form,
        Name: "GoldOprationForm",
        Bundle: null,
        Path: "main/wallet/GoldOprationForm",
    },

    UICreateMatchHome: {
        UIType: UIType.Form,
        Name: "UICreateMatchHome",
        Bundle: null,
        Path: "main/club/UICreateMatchHome",
    },

    UICreateMatch: {
        UIType: UIType.Form,
        Name: "UICreateMatch",
        Bundle: null,
        Path: "main/club/UICreateMatch",
    },

    LookRateListDlg: {
        UIType: UIType.CommonUI,
        Name: "LookRateListDlg",
        Bundle: null,
        Path: "main/wallet/rate/LookRateListDlg",
    },
    RateManagerListForm: {
        UIType: UIType.Form,
        Name: "RateManagerListForm",
        Bundle: null,
        Path: "main/wallet/rate/RateManagerListForm",
    },
    EditRateForm: {
        UIType: UIType.Form,
        Name: "EditRateForm",
        Bundle: null,
        Path: "main/wallet/rate/EditRateForm",
    },
    OrderRecordsForm: {
        UIType: UIType.Form,
        Name: "OrderRecordsForm",
        Bundle: null,
        Path: "main/wallet/record/OrderRecordsForm",
    },
    GoldIssueListForm: {
        UIType: UIType.Form,
        Name: "GoldIssueListForm",
        Bundle: null,
        Path: "main/wallet/issue/GoldIssueListForm",
    },
    OrderApplyForm: {
        UIType: UIType.Form,
        Name: "OrderApplyForm",
        Bundle: null,
        Path: "main/wallet/apply/OrderApplyForm",
    },

    MttListForm: {
        UIType: UIType.Form,
        Name: "MttListForm",
        Bundle: null,
        Path: "main/mtt/MttListForm",
    },
    MttDetailForm: {
        UIType: UIType.Form,
        Name: "MttDetailForm",
        Bundle: null,
        Path: "main/mtt/detail/MttDetailForm",
    },
    MttRealTime: {
        UIType: UIType.CommonUI,
        Name: "MttRealTime",
        Bundle: null,
        Path: "main/mtt/realTime/MttRealTime",
    },
    UIApplyJoin: {
        UIType: UIType.Form,
        Name: "UIApplyJoin",
        Bundle: null,
        Path: "main/club/UIApplyJoin",
    },
    UIAuditAdmin: {
        UIType: UIType.Form,
        Name: "UIAuditAdmin",
        Bundle: null,
        Path: "main/club/UIAuditAdmin",
    },
    UIAddAdmin: {
        UIType: UIType.Form,
        Name: "UIAddAdmin",
        Bundle: null,
        Path: "main/club/UIAddAdmin",
    },
    UIActiveMange: {
        UIType: UIType.Form,
        Name: "UIActiveMange",
        Bundle: null,
        Path: "main/club/UIActiveMange",
    },
    UIClubDataMange: {
        UIType: UIType.Form,
        Name: "UIClubDataMange",
        Bundle: null,
        Path: "main/club/UIClubDataMange",
    },

    UICalendar: {
        UIType: UIType.Board,
        Name: "UICalendar",
        Bundle: null,
        Path: "main/club/prefab/UICalendar",
    },
    UIMine_SafeAdmin: {
        UIType: UIType.Form,
        Name: "UIMine_SafeAdmin",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_SafeAdmin",
    },
    UIMine_bindMess: {
        UIType: UIType.Form,
        Name: "UIMine_bindMess",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_bindMess",
    },
    UIMineChangeBind: {
        UIType: UIType.Form,
        Name: "UIMineChangeBind",
        Bundle: null,
        Path: "main/lobby/prefab/UIMineChangeBind",
    },

    UIMineThridBind: {
        UIType: UIType.Form,
        Name: "UIMineThridBind",
        Bundle: null,
        Path: "main/lobby/prefab/UIMineThridBind",
    }






}
//批量设置
cc.game.on(cc.game.EVENT_GAME_INITED, () => {
    for (const key in UIDefine) {
        let constructor = cc.js.getClassByName(key);
        if (constructor) constructor['UIDefine'] = UIDefine[key];
    }
});

(window as any).UIDefine = UIDefine;