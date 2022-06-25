
import { DialogParam } from "../../define/EIDefine";
import { UIDefine } from "../../define/UIDefine";
import UIManager from "../../manager/UIManager";
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
        UIManager.open(UIDefine.ResetPassForm);
    }

    /**
     * 注册账号点击
     */
    onRegisterClick() {
        cc.log("onRegisterClick");
        UIManager.open(UIDefine.RegisterForm);
    }

    /**
     * 语言切换点击
     */
    onLanguageClick() {
        cc.log("onLanguageClick");
        //I18NManager.ins.languageType = (I18NManager.ins.languageType + 1) % 2;
        //I18NManager.ins.transLanguage(I18NManager.ins.languageType);
        UIManager.open(UIDefine.LanguageForm, { language_id: 0 });

    }

    //////////////////////////////////测试///////////////////////////////////

    onTest001() {
        //BoardManager.ins.open(UIDefine.BaseTouchBoard);
        UIManager.open(UIDefine.TestTouchBoard);
    }
    onTest002() {
        UIManager.open(UIDefine.LanguageForm);
        UIManager.open(UIDefine.RegisterForm);
    }
    onTest003() {
        UIManager.open<DialogParam>(UIDefine.BaseDialog, { title: "大大的标题", content: "无限的能量", confirm: "Sure" });
    }
    onTest004() {

    }
    onTest005() {

    }
    onTest006() {

    }

}
