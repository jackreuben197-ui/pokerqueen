
/**
 * 密码重置 
 */
const { ccclass } = cc._decorator;
import { Md5 } from "ts-md5";
import ButtonClickCD from "../../common/ButtonClickCD";
import TimeHelper from "../../helper/TimeHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import ToastManager from "../../manager/ToastManager";
import LoginSession from "../../session/LoginSession";
import StorageKey from "../../session/StorageKey";
import LabelCDTime from "../component/LabelCDTime";
import RegisterForm from "./RegisterForm";


@ccclass
// 先写的RegisterForm 所有这里继承
export default class ResetPassForm extends RegisterForm {

    resetCDTime() {
        let codeTime = localStorage.getItem(StorageKey.CODE_TIME_RESET);
        if (codeTime != null && codeTime != "") {
            this.lbl_code.getComponent(LabelCDTime).resetUI(+codeTime, this.resetGetCodeLabel.bind(this));
        }
    }


    protected async onConfirmClick(button: cc.Button) {
        cc.log("onConfirmClick");
        if (!ButtonClickCD.canClick(button.node)) return;
        let phone = this.phone_editbox.string.trim();
        let password = this.pass_editbox.string.trim();
        let code = this.tcode_editbox.string.trim();
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
            ToastManager.Instance.createToast("验证码只能是4位数");//("请输入验证码");
            return;
        }
        if (password.length < 6) {
            ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1002"));//("密码不得少于6个字符");
            return;
        }
        password = Md5.hashStr(password);

        let result = await LoginSession.APISendModifyPW({
            phone,
            area,
            code,
            password
        }).catch(() => { })
        if (result) {
            this.resetGetCodeLabel();
            ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1009"));//("更改密码成功");
            this.close();
        }
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

        this.tcode_canclick = false;

        let result = await LoginSession.APISendCode({ phone, area }).catch(() => { });

        if (result == undefined) return;

        ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1007"));//("验证码已发送");

        this.lbl_code.getComponent(LabelCDTime).show(60, this.resetGetCodeLabel.bind(this));

        let NowTimeS = TimeHelper.NowS;
        localStorage.setItem(StorageKey.CODE_TIME_RESET, NowTimeS.toString());
    }

    /**
     * 重置getcode文本
     */
     resetGetCodeLabel() {
        this.tcode_canclick = true;
        this.lbl_code.getComponent(cc.Label).string = i18nMgr._getLabel("UILogin_GetCode");
        localStorage.setItem(StorageKey.CODE_TIME_RESET, "");
        this.lbl_code.getComponent(LabelCDTime).stop();
    }

}
