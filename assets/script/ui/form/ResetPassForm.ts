
/**
 * 密码重置 
 */
const { ccclass } = cc._decorator;
import { Md5 } from "ts-md5";
import ButtonClickCD from "../../common/ButtonClickCD";
import ToastManager from "../../manager/ToastManager";
import LoginSession from "../../session/LoginSession";
import LabelCDTime from "../component/LabelCDTime";
import RegisterForm from "./RegisterForm";


@ccclass
// 先写的RegisterForm 所有这里继承
export default class ResetPassForm extends RegisterForm {


    protected async onConfirmClick(button: cc.Button) {
        cc.log("onConfirmClick");
        if (!ButtonClickCD.canClick(button.node)) return;
        let phone = this.phone_editbox.string.trim();
        let password = this.pass_editbox.string.trim();
        let code = this.tcode_editbox.string.trim();
        let area = this.area_label.string.substring(1);
        if (phone == "") {
            ToastManager.Instance.createToast("UILogin_1001");//("请输入手机号");
            return;
        }
        if (password.length < 6) {
            ToastManager.Instance.createToast("UILogin_1002");//("密码不得少于6个字符");
            return;
        }
        if (code == "") {
            ToastManager.Instance.createToast("UILogin_1008");//("请输入验证码");
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
            ToastManager.Instance.createToast("UILogin_1009");//("更改密码成功");
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
            ToastManager.Instance.createToast("UILogin_1004");//请输入手机号
            return;
        }
        if (!this.tcode_canclick) {
            ToastManager.Instance.createToast("UILogin_1005");//("请稍等再发");
            return;
        }

        this.tcode_canclick = false;

        let result = await LoginSession.APISendCode({ phone, area }).catch(() => { });

        if (result == undefined) return;

        ToastManager.Instance.createToast("UILogin_1007");//("验证码已发送");

        this.getcode_button.getComponent(LabelCDTime).show(5, this.resetGetCodeLabel.bind(this));
    }

}
