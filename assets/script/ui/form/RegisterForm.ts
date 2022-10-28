
import { Md5 } from "ts-md5";
import ButtonClickCD from "../../common/ButtonClickCD";
import { ProcedureEnum } from "../../define/EIDefine";
import { UIDefine } from "../../define/UIDefine";
import GGEvent from "../../event/GGEvent";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import ProcedureManager from "../../manager/ProcedureManager";
import ToastManager from "../../manager/ToastManager";
import LoginSession from "../../session/LoginSession";
import StorageKey from "../../session/StorageKey";
import LabelCDTime from "../component/LabelCDTime";
import UIComponent from "../UIComponent";
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

    code_button: cc.Node = null;

    getcode_button: cc.Node = null;

    lbl_code: cc.Node = null;
    area_label: cc.Label = null;

    phone_editbox: cc.EditBox = null;
    pass_editbox: cc.EditBox = null;
    tcode_editbox: cc.EditBox = null;


    confirm_button: cc.Node = null;
    agree_toggle: cc.Toggle = null;

    agreement_click: cc.Node = null;
    ///////////////////////////////////
    /**
     * 声明内容
     */
    tcode_canclick: boolean = true;

    ///////////////////////////////////

    protected lateLoad() {
        super.lateLoad();
        this.phone_editbox = this.getChildNodeOrComponent("phone_editbox", cc.EditBox);
        this.pass_editbox = this.getChildNodeOrComponent("pass_editbox", cc.EditBox);
        this.tcode_editbox = this.getChildNodeOrComponent("tcode_editbox", cc.EditBox);
        this.agree_toggle = this.getChildNodeOrComponent("agree_toggle", cc.Toggle);
        this.area_label = this.getChildNodeOrComponent("area_label", cc.Label);
        this.open_eyes_icon = this.getChildNodeOrComponent("open_eyes_icon");
        this.close_eyes_icon = this.getChildNodeOrComponent("close_eyes_icon");
        this.eyes_button = this.getChildNodeOrComponent("eyes_button");
        this.confirm_button = this.getChildNodeOrComponent("confirm_button");
        this.code_button = this.getChildNodeOrComponent("code_button");
        this.getcode_button = this.getChildNodeOrComponent("getcode_button");
        this.lbl_code = this.getChildNodeOrComponent("lbl_code");
        this.agreement_click = this.getChildNodeOrComponent("agreement_click");
        this.lbl_code.addComponent(LabelCDTime);
        this.setEyesOpen(false);
    }

    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        this.setArea();
        //this.setEyesOpen(false);
        //this.resetAgreeCheck();
        this.phone_editbox.string = "";
        this.tcode_editbox.string = "";
        this.pass_editbox.string = "";
        // this.resetGetCodeLabel()
        // this.lbl_code.getComponent(LabelCDTime).duration = 0;
        this.resetCDTime();
    }

    resetCDTime() {
        let codeTime = GC.localStore.getItem(StorageKey.CODE_TIME_REGIST);
        if (codeTime != null && codeTime != "") {
            this.lbl_code.getComponent(LabelCDTime).resetUI(+codeTime, this.resetGetCodeLabel.bind(this));
        }
    }

    lateClose(param: any = null) {
        super.lateClose(param);
        this.resetAgreeCheck();
    }
    protected regiterTouchEvents() {
        super.regiterTouchEvents();
        this.eyes_button.on("click", this.onEyesClick, this);
        this.confirm_button.on("click", this.onConfirmClick, this);
        this.code_button.on("click", this.onCodeClick, this);
        this.getcode_button.on("click", this.onGetCodeClick, this);
        this.agreement_click && this.agreement_click.on("click", this.onUserAgreeClick, this);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(GGEvent.Change_AreaCode, this.onChangeAreaCode);
    }



    setArea() {
        this.area_label.string = LoginSession.AreaCode;
    }
    setEyesOpen(boo: boolean) {
        this.open_eyes_icon.active = boo;
        this.close_eyes_icon.active = !boo;
    }
    resetAgreeCheck() {
        this.agree_toggle?.uncheck();
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
    protected async onConfirmClick(button: cc.Button) {
        cc.log("onConfirmClick");
        if (!ButtonClickCD.canClick(button.node)) return;
        let phone = this.phone_editbox.string.trim();
        let password = this.pass_editbox.string.trim();
        let code = this.tcode_editbox.string.trim();
        let agree_checked = this.agree_toggle.isChecked;
        let area = this.area_label.string.substring(1);
        if (phone == "") {
            ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1001"));//("请输入手机号");
            return;
        }
        if (phone.length < 6 || phone.length > 20) {
            ToastManager.Instance.createToast("手机号必须在6到20位之间");//请输入手机号
            return;
        }
        if (this.tcode_canclick) {
            ToastManager.Instance.createToast("请获取验证码");
            return;
        }
        if (code == "") {
            ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1008"));//("请输入验证码");
            return;
        }
        if (code.length != 4) {
            ToastManager.Instance.createToast("UILogin_vcode_len_limit_tip");//验证码只能是4位数
            return;
        }
        if (password.length < 6) {
            ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1002"));//("密码不得少于6个字符");
            return;
        }
        if (agree_checked == false) {
            ToastManager.Instance.createToast(i18nMgr.Get("UILogin_ReadOK"));//("阅读并同意用户协议");
            return;
        }
        password = Md5.hashStr(password);
        let result = await LoginSession.APISendRegister({
            phone,
            password,
            area,
            code,
            platform: 5,
        }).catch(() => { });

        if (result == undefined) return;
        //关闭当前页面
        this.close();
        //进入登录流程
        this.resetGetCodeLabel();
        this.resetAgreeCheck();
        ProcedureManager.StartProcedure(ProcedureEnum.EnterLobby, {
            phone,
            password,
            area,
            is_simulator: false
        });

    }

    /**
     * 获取验证码点击
     */
    protected async onGetCodeClick(button: cc.Button) {

        if (!ButtonClickCD.canClick(button.node)) return;

        let phone = this.phone_editbox.string.trim();
        let area = this.area_label.string.substring(1);


        if (phone == "") {
            ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1004"));//请输入手机号
            return;
        }
        if (phone.length < 6 || phone.length > 20) {
            ToastManager.Instance.createToast("手机号必须在6到20位之间");//请输入手机号
            return;
        }
        if (!this.tcode_canclick) {
            ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1005"));//("请稍等再发");
            return;
        }

        let result: any = await LoginSession.APIPHoneExist({ phone, area }).catch((e) => { });

        if (result == undefined) return;

        if (result?.data) {
            ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1006"));//("此号码已注册");
            return;
        }
        this.tcode_canclick = false;

        result = await LoginSession.APISendCode({ phone, area }).catch(() => { });

        if (result == undefined) return;

        ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1007"));//("验证码已发送");

        this.lbl_code.getComponent(LabelCDTime).show(60, this.resetGetCodeLabel.bind(this));
        let NowTimeS = TimeHelper.NowS;
        GC.localStore.setItem(StorageKey.CODE_TIME_REGIST, NowTimeS.toString());
    }
    /**
     * 重置getcode文本
     */
    resetGetCodeLabel() {
        this.tcode_canclick = true;
        this.lbl_code.getComponent(cc.Label).string = i18nMgr._getLabel("UILogin_GetCode");
        GC.localStore.setItem(StorageKey.CODE_TIME_REGIST, "");
        this.lbl_code.getComponent(LabelCDTime).stop();
    }
    /**
     * 区号点击
     */
    onCodeClick() {
        UIComponent.open(UIDefine.AreaCodeForm);
    }

    /**
     * 区号改变
     */
    onChangeAreaCode() {
        this.area_label.string = LoginSession.AreaCode;
    }

    /**
     * 用戶注意事項
     */
    onUserAgreeClick() {
        UIComponent.open(UIDefine.UserAgreeForm);
    }

}
