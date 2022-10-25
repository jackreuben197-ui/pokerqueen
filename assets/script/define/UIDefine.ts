
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
    //重置密码
    ResetPassForm: {
        UIType: UIType.Form,
        Name: "ResetPassForm",
        Bundle: null,
        Path: "login/form/ResetPassForm",
        Title: "UILogin_Forget",
    },
    //注册账号
    RegisterForm: {
        UIType: UIType.Form,
        Name: "RegisterForm",
        Bundle: null,
        Path: "login/form/RegisterForm",
        Title: "UILogin_Register",
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
    //设置-玩家信息
    MyPlayInfo: {
        UIType: UIType.Form,
        Name: "MyPlayInfo",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_PlayInfo",
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
    //工会-成员详细
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
    //带入申请
    UIRecordInto: {
        UIType: UIType.Form,
        Name: "UIRecordInto",
        Bundle: null,
        Path: "main/lobby/prefab/record/UIRecordInto",
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