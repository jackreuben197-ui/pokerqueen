import I18NManager from "../manager/I18NManager";
import CCTools from "../tools/CCTools";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginScene extends cc.Component {

    @property(cc.EditBox)
    phone_editbox: cc.EditBox = null;

    @property(cc.EditBox)
    pass_editbox: cc.EditBox = null;


    @property(cc.Node)
    open_eyes_icon: cc.Node = null;
    @property(cc.Node)
    close_eyes_icon: cc.Node = null;


    // LIFE-CYCLE CALLBACKS:
    eyesIsOpen: boolean = false;
    onLoad() {
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
    }

    /**
     * 注册账号点击
     */
    onRegisterClick() {
        cc.log("onRegisterClick");
    }

    /**
     * 语言切换点击
     */
    onLanguageClick() {
        cc.log("onLanguageClick");
        I18NManager.ins.languageType = (I18NManager.ins.languageType + 1) % 2;
        I18NManager.ins.transLanguage(I18NManager.ins.languageType);
    }

}
