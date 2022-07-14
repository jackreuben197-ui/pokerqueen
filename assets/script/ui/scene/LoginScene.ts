
import { Md5 } from "ts-md5";
import ButtonClickCD from "../../common/ButtonClickCD";
import { AreaCodeConfig } from "../../config/AreaCodeConfig";
import { GameConfig } from "../../config/GameConfig";
import { DialogParam, ProcedureEnum } from "../../define/EIDefine";
import { UIDefine } from "../../define/UIDefine";
import Dispatcher from "../../event/Dispatcher";
import GGEvent from "../../event/GGEvent";
import ProcedureManager from "../../manager/ProcedureManager";
import ToastManager from "../../manager/ToastManager";

import UIManager from "../../manager/UIManager";
import { Web_Login } from "../../net/https/WebRequest";
import LoginSession from "../../session/LoginSession";
import StorageKey from "../../session/StorageKey";
import BaseScene from "./BaseScene";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginScene extends BaseScene {
    /**
     * 节点|组件 定义
     */
    phone_editbox: cc.EditBox = null;

    pass_editbox: cc.EditBox = null;

    open_eyes_icon: cc.Node = null;

    close_eyes_icon: cc.Node = null;

    eyes_button: cc.Node = null;

    confirm_button: cc.Node = null;

    forgot_button: cc.Node = null;

    register_button: cc.Node = null;

    language_button: cc.Node = null;

    area_label: cc.Label = null;

    code_button: cc.Node = null;
    ///////////////////////////////////
    /**
     * 声明内容
     */
    testLayout: cc.Node = null;

    ///////////////////////////////////
    protected lateLoad() {
        super.lateLoad();

        this.phone_editbox = this.getChildNodeOrComponent("phone_editbox", cc.EditBox);
        this.pass_editbox = this.getChildNodeOrComponent("pass_editbox", cc.EditBox);
        this.open_eyes_icon = this.getChildNodeOrComponent("open_eyes_icon");
        this.close_eyes_icon = this.getChildNodeOrComponent("close_eyes_icon");
        this.eyes_button = this.getChildNodeOrComponent("eyes_button");
        this.confirm_button = this.getChildNodeOrComponent("confirm_button");
        this.forgot_button = this.getChildNodeOrComponent("forgot_button");
        this.register_button = this.getChildNodeOrComponent("register_button");
        this.language_button = this.getChildNodeOrComponent("language_button");
        this.area_label = this.getChildNodeOrComponent("area_label", cc.Label);
        this.code_button = this.getChildNodeOrComponent("code_button");
        this.setAreaAndPhone();
        this.setEyesOpen(false);

    }

    protected regiterDispatchEvent(): void {
        Dispatcher.on(GGEvent.Change_AreaCode, this.onChangeAreaCode, this);
    }

    protected regiterTouchEvents() {
        this.eyes_button.on("click", this.onEyesClick, this);
        this.confirm_button.on("click", this.onConfirmClick, this);
        this.forgot_button.on("click", this.onForgotClick, this);
        this.register_button.on("click", this.onRegisterClick, this);
        this.code_button.on("click", this.onCodeClick, this);
    }
    protected lateEnter() {

    }

    setAreaAndPhone() {
        this.area_label.string = LoginSession.AreaCode;
        this.phone_editbox.string = LoginSession.Phone;
    }

    setEyesOpen(boo: boolean) {
        this.open_eyes_icon.active = boo;
        this.close_eyes_icon.active = !boo;
    }

    ///////////////////////////////////按钮响应回调//////////////////////////////////////////
    /**
     * 眼睛点击
     */
    onEyesClick() {
        this.setEyesOpen(!this.open_eyes_icon.active);
        if (this.open_eyes_icon.active) {
            this.pass_editbox.inputFlag = cc.EditBox.InputFlag.DEFAULT;
        } else {
            this.pass_editbox.inputFlag = cc.EditBox.InputFlag.PASSWORD;
        }
    }
    /**
    * 登录点击
    */
    onConfirmClick(button: cc.Button) {

        if (!ButtonClickCD.canClick(button.node)) return;

        let phone: string = this.phone_editbox.string;
        let password: string = this.pass_editbox.string;
        let area: string = this.area_label.string.substring(1);
        //判断用户名
        cc.log("account:", phone, "password:", password);

        if (phone == "") {
            return ToastManager.ins.craeteToast("account is null");

        }
        if (password.length < 6) {
            return ToastManager.ins.craeteToast("password length is error");
        }

        let param: typeof Web_Login.RequestParams = {
            phone,
            password: Md5.hashStr(password),
            area,
            is_simulator: false
        }
        ProcedureManager.StartProcedure(ProcedureEnum.Enter, param);
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
    /**
     * 区号点击
     */
    onCodeClick() {
        UIManager.open(UIDefine.AreaCodeForm);
    }
    /**
     * 区号改变
     */
    onChangeAreaCode() {
        this.area_label.string = LoginSession.AreaCode;
    }
}
