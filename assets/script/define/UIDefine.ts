
export const UIDefine = {
    /**
     *  场景
     */
    //预加载
    PreloadingScene: { Name: "PreloadingScene", Bundle: null, Path: "prefab/scene/PreloadingScene" },
    //登录场景
    LoginScene: { Name: "LoginScene", Bundle: null, Path: "prefab/scene/LoginScene" },
    //大厅场景
    LobbyScene: { Name: "LobbyScene", Bundle: null, Path: "prefab/scene/LobbyScene" },


    /**
     *  标题窗口
     */
    //标题模板(不使用)
    SampleForm: { Name: "SampleForm", Bundle: null, Path: "prefab/form/SampleForm", Title: "Sample" },
    //重置密码
    ResetPassForm: { Name: "ResetPassForm", Bundle: null, Path: "prefab/form/ResetPassForm", Title: "Reset Password" },
    //注册账号
    RegisterForm: { Name: "RegisterForm", Bundle: null, Path: "prefab/form/RegisterForm", Title: "Register" },

    LanguageForm: { Name: "LanguageForm", Bundle: null, Path: "prefab/form/LanguageForm", Title: "Language" },
}
//批量设置
cc.game.on(cc.game.EVENT_GAME_INITED, () => {
    for (const key in UIDefine) {
        let constructor = cc.js.getClassByName(key);
        if (constructor) constructor['UIDefine'] = UIDefine[key];
    }
});

