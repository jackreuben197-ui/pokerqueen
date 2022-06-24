import { UIFadeEffectEnum } from "./EIDefine";



export enum UIType {
    Scene,
    Form,
    Board,
    Dialog,
}

export const UIDefine = {
    /**
     *  场景
     */
    //预加载
    PreloadingScene: { UIType: UIType.Scene, Name: "PreloadingScene", Bundle: null, Path: "prefab/scene/PreloadingScene", IsAdaptScreen: true },
    //登录场景
    LoginScene: { UIType: UIType.Scene, Name: "LoginScene", Bundle: null, Path: "prefab/scene/LoginScene", IsAdaptScreen: true },
    //大厅场景
    LobbyScene: { UIType: UIType.Scene, Name: "LobbyScene", Bundle: null, Path: "prefab/scene/LobbyScene", IsAdaptScreen: true },

    /**
     *  标题窗口
     */
    //标题模板(不使用)
    SampleForm: { UIType: UIType.Form, Name: "SampleForm", Bundle: null, Path: "prefab/form/SampleForm", Title: "Sample", IsAdaptScreen: true, UIFadeEffect: UIFadeEffectEnum.RightInOut },
    //重置密码
    ResetPassForm: { UIType: UIType.Form, Name: "ResetPassForm", Bundle: null, Path: "prefab/form/ResetPassForm", Title: "Reset Password", IsAdaptScreen: true, UIFadeEffect: UIFadeEffectEnum.RightInOut },
    //注册账号
    RegisterForm: { UIType: UIType.Form, Name: "RegisterForm", Bundle: null, Path: "prefab/form/RegisterForm", Title: "Register", IsAdaptScreen: true, UIFadeEffect: UIFadeEffectEnum.RightInOut },

    LanguageForm: { UIType: UIType.Form, Name: "LanguageForm", Bundle: null, Path: "prefab/form/LanguageForm", Title: "Language", IsAdaptScreen: true, UIFadeEffect: UIFadeEffectEnum.RightInOut },

    /**
     *  触摸板子（触摸黑色底板关闭）
     */
    //触摸板子模板(不使用)
    BaseTouchBoard: { UIType: UIType.Board, Name: "BaseTouchBoard", Bundle: null, Path: "prefab/board/BaseTouchBoard", IsAdaptScreen: true },
    TestTouchBoard: { UIType: UIType.Board, Name: "TestTouchBoard", Bundle: null, Path: "prefab/board/TestTouchBoard", IsAdaptScreen: true },

    /**
     * 弹窗面板(默认触摸全屏可关闭)
     */
    BaseDialog: { UIType: UIType.Dialog, Name: "BaseDialog", Bundle: null, Path: "prefab/dialog/BaseDialog", IsAdaptScreen: true },

}
//批量设置
cc.game.on(cc.game.EVENT_GAME_INITED, () => {
    for (const key in UIDefine) {
        let constructor = cc.js.getClassByName(key);
        if (constructor) constructor['UIDefine'] = UIDefine[key];
    }
});

