
import { Md5 } from "ts-md5";
import ToastManager from "../../manager/ToastManager";
import LoginSession from "../../session/LoginSession";
import BaseForm from "./BaseForm";


const { ccclass, property } = cc._decorator;

@ccclass
export default class RegisterForm extends BaseForm {
    /**
     * 节点|组件 定义
     */

    open_eyes_icon: cc.Node = null;

    close_eyes_icon: cc.Node = null;

    eyes_button: cc.Node = null;


    area_label: cc.Label = null;

    phone_editbox: cc.EditBox = null;
    pass_editbox: cc.EditBox = null;
    tcode_editbox: cc.EditBox = null;


    confirm_button: cc.Node = null;
    agree_toggle: cc.Toggle = null;

    ///////////////////////////////////
    /**
     * 声明内容
     */

    ///////////////////////////////////

    protected lateLoad() {
        super.lateLoad();
        this.phone_editbox = this.getChildNodeOrComponent("phone_editbox", cc.EditBox);
        this.pass_editbox = this.getChildNodeOrComponent("pass_editbox", cc.EditBox);
        this.tcode_editbox = this.getChildNodeOrComponent("pass_editbox", cc.EditBox);
        this.agree_toggle = this.getChildNodeOrComponent("agree_toggle", cc.Toggle);
        this.area_label = this.getChildNodeOrComponent("area_label", cc.Label);
        this.open_eyes_icon = this.getChildNodeOrComponent("open_eyes_icon");
        this.close_eyes_icon = this.getChildNodeOrComponent("close_eyes_icon");
        this.eyes_button = this.getChildNodeOrComponent("eyes_button");
        this.confirm_button = this.getChildNodeOrComponent("confirm_button");
    }

    onShow(param?: any): void {
        super.onShow(param);
        this.setArea();
        this.setEyesOpen(false);
        this.resetAgreeCheck();
    }

    protected lateClose(param: any = null) {
        super.lateClose(param);
    }


    protected regiterTouchEvents() {
        super.regiterTouchEvents();
        this.eyes_button.on("click", this.onEyesClick, this);
        this.confirm_button.on("click", this.onConfirmClick, this);

    }
    setArea() {
        this.area_label.string = LoginSession.AreaCode;
    }
    setEyesOpen(boo: boolean) {
        this.open_eyes_icon.active = boo;
        this.close_eyes_icon.active = !boo;
    }
    resetAgreeCheck() {
        this.agree_toggle.uncheck();
    }

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
     * 确认点击
     */
    onConfirmClick() {
        cc.log("onConfirmClick");
        var phone = this.phone_editbox.string.trim();
        var pass = this.pass_editbox.string.trim();
        var tcode = this.tcode_editbox.string.trim();
        var agree_checked = this.agree_toggle.isChecked;
        if (phone == "") {
            ToastManager.ins.craeteToast("UILogin_1001");//("请输入手机号");
            return;
        }
        if (pass.length < 6) {
            ToastManager.ins.craeteToast("UILogin_1002");//("密码不得少于6个字符");
            return;
        }
        if (tcode == "") {
            ToastManager.ins.craeteToast("UILogin_1008");//("请输入验证码");
            return;
        }
        if (agree_checked == false) {
            ToastManager.ins.craeteToast("UILogin_ReadOK");//("阅读并同意用户协议");
            return;
        }
        pass = Md5.hashStr(pass);

    }
}
