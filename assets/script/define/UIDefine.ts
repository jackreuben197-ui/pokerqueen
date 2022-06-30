
import { UIFadeStyleEnum, UIType } from "./EIDefine";

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
        Path: "prefab/scene/LobbyScene"
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
        UIFadeStyle: UIFadeStyleEnum.RightInOut
    },
    SampleForm: {
        UIType: UIType.Form,
        Name: "SampleForm",
        Bundle: null,
        Path: "prefab/form/SampleForm",
        Title: "Sample",
        UIFadeStyle: UIFadeStyleEnum.RightInOut
    },
    //重置密码
    ResetPassForm: {
        UIType: UIType.Form,
        Name: "ResetPassForm",
        Bundle: null,
        Path: "prefab/form/ResetPassForm",
        Title: "Reset Password",
        UIFadeStyle: UIFadeStyleEnum.RightInOut
    },
    //注册账号
    RegisterForm: {
        UIType: UIType.Form,
        Name: "RegisterForm",
        Bundle: null,
        Path: "prefab/form/RegisterForm",
        Title: "Register",
        UIFadeStyle: UIFadeStyleEnum.RightInOut
    },

    LanguageForm: {
        UIType: UIType.Form,
        Name: "LanguageForm",
        Bundle: null,
        Path: "prefab/form/LanguageForm",
        Title: "Language",
        UIFadeStyle: UIFadeStyleEnum.RightInOut
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

    /**
     * 确认取消 弹窗面板(默认触摸全屏可关闭)
     */
    BaseAlert: {
        UIType: UIType.Alert,
        Name: "BaseAlert",
        Bundle: null,
        Path: "prefab/alert/BaseAlert",
        UIFadeStyle: UIFadeStyleEnum.ScaleInOut
    },

}
//批量设置
cc.game.on(cc.game.EVENT_GAME_INITED, () => {
    for (const key in UIDefine) {
        let constructor = cc.js.getClassByName(key);
        if (constructor) constructor['UIDefine'] = UIDefine[key];
    }
});
