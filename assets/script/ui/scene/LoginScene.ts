
import { FormEffect } from "../../define/GlobalEnum";
import { UIDefine } from "../../define/UIDefine";
import FormManager from "../../manager/FormManager";
import I18NManager from "../../manager/I18NManager";
import BaseScene from "./BaseScene";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginScene extends BaseScene {

    /**
     * 绑定内容
     */
    @property(cc.EditBox)
    phone_editbox: cc.EditBox = null;
    @property(cc.EditBox)
    pass_editbox: cc.EditBox = null;
    @property(cc.Node)
    open_eyes_icon: cc.Node = null;
    @property(cc.Node)
    close_eyes_icon: cc.Node = null;
    ///////////////////////////////////
    /**
     * 声明内容
     */

    eyesIsOpen: boolean = false;

    ///////////////////////////////////
    protected lateLoad() {
        this.setEyesOpen(this.eyesIsOpen);
    }

    start() {

    }

    // update (dt) {}

    setEyesOpen(boo: boolean) {
        this.open_eyes_icon.active = boo;
        this.close_eyes_icon.active = !boo;
    }


    ///////////////////////////////////按钮响应回调//////////////////////////////////////////
    /**
     * 眼睛点击
     */
    onEyesClick() {
        this.setEyesOpen(this.eyesIsOpen = !this.eyesIsOpen);
        if (this.eyesIsOpen) {
            this.pass_editbox.inputFlag = cc.EditBox.InputFlag.DEFAULT;
        } else {
            this.pass_editbox.inputFlag = cc.EditBox.InputFlag.PASSWORD;
        }
    }
    /**
    * 登录点击
    */
    onLoginClick() {
        cc.log("onLoginClick");
        //强制触发输入框的弹出键盘
        //CCTools.EditBoxBeginEditing(this.phone_editbox);
    }
    /**
     * 找回密码点击
     */
    onForgotClick() {
        cc.log("onForgotClick");
        FormManager.ins.openForm(UIDefine.ResetPassForm, FormEffect.RightInOut);
    }

    /**
     * 注册账号点击
     */
    onRegisterClick() {
        cc.log("onRegisterClick");
        FormManager.ins.openForm(UIDefine.RegisterForm, FormEffect.RightInOut);
    }

    /**
     * 语言切换点击
     */
    onLanguageClick() {
        cc.log("onLanguageClick");
        //I18NManager.ins.languageType = (I18NManager.ins.languageType + 1) % 2;
        //I18NManager.ins.transLanguage(I18NManager.ins.languageType);
        FormManager.ins.openForm(UIDefine.LanguageForm, FormEffect.RightInOut);
    
    }

}
