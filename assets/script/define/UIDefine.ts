import { UIType } from "./EIDefine";

export const UIDefine = {
    /**
     *  场景
     */
    //预加载
    PreloadingScene: {
        UIType: UIType.Scene,
        Name: "PreloadingScene",
        Bundle: null,
        Path: "prefab/scene/PreloadingScene"
    },
    //登录场景
    LoginScene: {
        UIType: UIType.Scene,
        Name: "LoginScene",
        Bundle: null,
        Path: "prefab/scene/LoginScene"
    },
    //大厅场景
    LobbyScene: {
        UIType: UIType.Scene,
        Name: "LobbyScene",
        Bundle: null,
        Path: "lobby/prefab/scene/LobbyScene"
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
        Path: "prefab/form/BaseForm",
        Title: "BaseForm",
    },
    SampleForm: {
        UIType: UIType.Form,
        Name: "SampleForm",
        Bundle: null,
        Path: "prefab/form/SampleForm",
        Title: "Sample",
    },
    //重置密码
    ResetPassForm: {
        UIType: UIType.Form,
        Name: "ResetPassForm",
        Bundle: null,
        Path: "prefab/form/ResetPassForm",
        Title: "UILogin_Forget",
    },
    //注册账号
    RegisterForm: {
        UIType: UIType.Form,
        Name: "RegisterForm",
        Bundle: null,
        Path: "prefab/form/RegisterForm",
        Title: "UILogin_Register",
    },
    //语言
    LanguageForm: {
        UIType: UIType.Form,
        Name: "LanguageForm",
        Bundle: null,
        Path: "prefab/form/LanguageForm",
        Title: "UIMine_SettingLanguage",
    },
    //电话区号
    AreaCodeForm: {
        UIType: UIType.Form,
        Name: "AreaCodeForm",
        Bundle: null,
        Path: "prefab/form/AreaCodeForm",
        Title: "UILogin_Local",
    },
    //电话区号
    UserAgreeForm: {
        UIType: UIType.Form,
        Name: "UserAgreeForm",
        Bundle: null,
        Path: "prefab/form/UserAgreeForm",
        Title: "tc_5E0V3qlb",
    },
    //设置
    SettingsForm: {
        UIType: UIType.Form,
        Name: "SettingsForm",
        Bundle: null,
        Path: "prefab/form/SettingsForm",
        Title: "UIMine_btn_setting",
    },

    //房间模版
    UIMatchPlayViewForm: {
        UIType: UIType.Form,
        Name: "UIMatchPlayViewForm",
        Bundle: null,
        Path: "lobby/prefab/UIMatchPlayViewForm"
    },

    /**
     *  触摸板子（触摸黑色底板关闭）
     */
    //触摸板子模板(不使用)
    BaseTouchBoard: {
        UIType: UIType.Board,
        Name: "BaseTouchBoard",
        Bundle: null,
        Path: "prefab/board/BaseTouchBoard",

    },
    RightTouchBoard: {
        UIType: UIType.Board,
        Name: "RightTouchBoard",
        Bundle: null,
        Path: "prefab/board/RightTouchBoard",

    },

    BottomTouchBoard: {
        UIType: UIType.Board,
        Name: "BottomTouchBoard",
        Bundle: null,
        Path: "prefab/board/BottomTouchBoard",
    },

    /**
     * 确认取消 弹窗面板(默认触摸全屏可关闭)
     */
    UIDialogComponent: {
        UIType: UIType.Dialog,
        Name: "UIDialogComponent",
        Bundle: null,
        Path: "prefab/dialog/UIDialogComponent",
    },

    UIPromptComponent: {
        UIType: UIType.Prompt,
        Name: "UIPromptComponent",
        Bundle: null,
        Path: "prefab/component/UIPromptComponent",
    },
    TexasPreLoad: {
        UIType: UIType.TexasPreLoad,
        Name: "TexasPreLoad",
        Bundle: null,
        Path: "prefab/component/TexasPreLoad",
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
        Name: "UITexasGameEnd",
        Bundle: 'texas',
        Path: "prefab/ui/UITexasGameEnd",
    },
    UICreatelabor: {
        UIType: UIType.Form,
        Name: "UICreatelabor",
        Bundle: null,
        Path: "lobby/prefab/UICreatelabor",
    },
    UIlaborJoin: {
        UIType: UIType.Form,
        Name: "UIlaborJoin",
        Bundle: null,
        Path: "lobby/prefab/UIlaborJoin",
    },
    //房间模版
    UILaborPlayViewForm: {
        UIType: UIType.CommonUI,
        Name: "UILaborPlayViewForm",
        Bundle: null,
        Path: "lobby/prefab/UILaborPlayViewForm"
    },
}
//批量设置
cc.game.on(cc.game.EVENT_GAME_INITED, () => {
    for (const key in UIDefine) {
        let constructor = cc.js.getClassByName(key);
        if (constructor) constructor['UIDefine'] = UIDefine[key];
    }
});

(window as any).UIDefine = UIDefine;