/*
 * @Author: xfj
 * @Date: 2022-11-05 12:59:25
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-05 16:05:46
 * @FilePath: /pokerqueen/assets/script/lobby/view/UIMineChangeBind.ts
 */
import ButtonClickCD from "../../common/ButtonClickCD";
import { ELoginType } from "../../config/EEnumConfig";
import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import GGEvent from "../../event/GGEvent";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { i18nMgr } from "../../i18n/i18nMgr";
import ToastManager from "../../manager/ToastManager";
import { APIGetBlindStatus } from "../../net/https/WebRequest";
import LoginSession from "../../session/LoginSession";
import StorageKey from "../../session/StorageKey";
import LabelCDTime from "../../ui/component/LabelCDTime";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMineChangeBind extends BaseForm {
    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    title_tip: cc.Label = null;


    @property(cc.EditBox)
    phoneEdit: cc.EditBox = null;

    @property(cc.EditBox)
    vcodeEdit: cc.EditBox = null;

    @property(cc.EditBox)
    passwordEdit: cc.EditBox = null;

    @property(cc.Node)
    areaNode: cc.Node = null;

    @property(cc.Node)
    mailNode: cc.Node = null;
    @property(cc.Label)
    areaNum: cc.Label = null;

    private eyesBtn: cc.Node = null;
    private closeEyes: cc.Node = null;
    private openEyes: cc.Node = null;
    private passwordNode: cc.Node = null;
    private getVLab: cc.Label = null;
    _isNoAllHave = true;

    type = null;
    private _vcodeBtnCanClick: boolean = true;
    private getVCDTime: LabelCDTime = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.getVLab = this.getChildNodeOrComponent("getVLab", cc.Label)
        this.getVCDTime = this.getVLab.node.addComponent(LabelCDTime);
        this.eyesBtn = this.getChildNodeOrComponent("eyesBtn")
        this.closeEyes = this.getChildNodeOrComponent("closeEyes")
        this.openEyes = this.getChildNodeOrComponent("openEyes")
        this.passwordNode = this.getChildNodeOrComponent("passwordNode")

    }
    async onShow(param?: any, fromUI?: cc.Node) {
        super.onShow(param, fromUI);
        this.initUI(param)
    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(GGEvent.Change_AreaCode, this.onChangeAreaCode);
    }
    protected regiterTouchEvents() {
        super.regiterTouchEvents();
        this.bindClick(this.areaNode, this.clickAreaNode, null, true);
        this.bindClick(this.eyesBtn, this.clickEyes);
    }

    initUI(param) {
        this.phoneEdit.string = "";
        this.vcodeEdit.string = "";
        this.passwordEdit.string = "";
        let data: any = APIGetBlindStatus.Response?.data
        this._isNoAllHave = !data.phone_status.status && !data.email_status.status
        this.passwordNode.active = this._isNoAllHave
        let key = param == 1 ? "UILogin_InputMoblie" : "UILogin_InputMail";
        this.phoneEdit.placeholder = GC.language.getLocal(key);
        this.phoneEdit.inputMode = param == 1 ? cc.EditBox.InputMode.PHONE_NUMBER : cc.EditBox.InputMode.EMAIL_ADDR;
        this.type = param
        if (param == 1) {
            this.areaNode.active = true;
            this.mailNode.active = false;
            if (data.phone_status.status) {
                this.title.string = '更换手机号'
                this.title_tip.string = '更换手机号后，下次登录可用新手机号登录。'
            } else {
                this.title.string = '绑定手机号'
                this.title_tip.string = '你暂时未绑定手机号，绑定手机号后，下次登录可用新手机号登录。'
            }
        } else {
            this.areaNode.active = false;
            this.mailNode.active = true;
            if (data.email_status.status) {
                this.title_tip.string = '更换邮箱后，下次登录可用新邮箱登录。'
                this.title.string = '更换邮箱'
            } else {
                this.title_tip.string = '你暂未绑定邮箱，绑定邮箱后，下次登录可用邮箱登录。'

                this.title.string = '绑定邮箱'
            }
        }
    }
    /**
   * 区号点击
   */
    clickAreaNode() {

        UIComponent.open(UIDefine.AreaCodeForm);
    }
    /**
     * 区号改变
     */
    onChangeAreaCode() {
        this.areaNum.string = LoginSession.AreaCode;
    }
    // 点击登录、确定
    async clickSure(button: cc.Button) {
        if (!ButtonClickCD.canClick(button.target)) return;

        let area: string = this.areaNum.string.trim().substring(1);
        let account: string = this.phoneEdit.string.trim();
        let password: string = this.passwordEdit.string.trim();
        let vcode = this.vcodeEdit.string.trim();


        if (this.haveErrorTip(account, vcode, password)) {
            return;
        }

        if (this.type == 1) {
            await LoginSession.APIBindPhone({ phone: account, code: vcode, area, password })
            // this.checkLogin(area, account, password, vcode);
        } else {
            let data = await LoginSession.APIBindEmail({ email: account, code: vcode, password });
            console.log(";;;;;;;;;;", data)
            // this.checkRegister(area, account, password, vcode);
        }
        await LoginSession.APIGetBlindStatus()
        this.post(EventName.refresh_bind)
        this.close();
    }
    // 点击获取验证码
    async clickGetVCode() {
        let account = this.phoneEdit.string.trim();
        let area = this.areaNum.string.trim().substring(1);


        if (this.accoutHaveErrorTip(account)) {
            return true
        }

        if (!this._vcodeBtnCanClick) {
            ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1005"));//("请稍等再发");
            return;
        }

        await this.checkGetVCode(account, area);
    }
    // 检测判断要获取那种验证码
    async checkGetVCode(account, area) {
        if (this.type == 1) {
            //获取手机验证码
            //验证手机号是否已注册
            let result: any = await LoginSession.APIPHoneExist({ phone: account, area }).catch((e) => { });
            if (result == undefined) return;
            if (result?.data) {
                ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1006"));//("此号码已注册");
                return;
            }
            //验证获取验证码是否发送成功
            result = await LoginSession.APISendCode({ phone: account, area }).catch(() => { });
            if (result == undefined) return;
            this.startVCodeTime();
        } else if (this.type == 2) {

            //获取邮箱验证码
            //验证邮箱是否已注册
            let result: any = await LoginSession.APIEmailExist({ email: account }).catch((e) => { });
            if (result == undefined) return;
            if (result?.data) {
                ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1006"));//("此号码已注册");
                return;
            }
            //验证获取验证码是否发送成功
            let lang = i18nMgr.getLanguage()
            result = await LoginSession.APISendEmailCode({ email: account, lang: lang }).catch(() => { });
            if (result == undefined) return;

            this.startVCodeTime();
            // ToastManager.Instance.createToast("获取邮箱验证码  还没有！！！");
        }
    }

    resetData() {
        this.resetVCodeTime();
    }

    // 开始验证码倒计时
    startVCodeTime() {
        //("验证码已发送");

        this._vcodeBtnCanClick = false;
        ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1007"));
        this.getVCDTime.show(60, this.resetVCodeTime);
        let NowTimeS = TimeHelper.NowS;
        GC.localStore.setItem(this.codeTimeKey, NowTimeS.toString());
    }
    // 清空验证码倒计时状态
    resetVCodeTime = () => {
        this._vcodeBtnCanClick = true;
        this.setText(this.getVLab, "UILogin_GetCode");
        this.getVLab.getComponent(LabelCDTime).stop();
        this.codeTimeKey && GC.localStore.setItem(this.codeTimeKey, "");
    }
    get codeTimeKey() {
        return StorageKey.CODE_TIME_CHANGE_BLIND
    }

    //提示
    haveErrorTip(account, vcode, password) {
        if (this.accoutHaveErrorTip(account)) {
            return true
        }
        //验证码不对提示
        if (vcode == "") {
            ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1008"));//("请输入验证码");
            return true
        }
        if (vcode.length != 4) {
            ToastManager.Instance.createToast("UILogin_vcode_len_limit_tip");//验证码只能是4位数
            return true
        }
        //密码不对提示
        if (this._isNoAllHave) {
            if (this.passwordNode.active && password.length < 6) {
                ToastManager.Instance.createToast(CPErrorCode.LanguageDescription(10330));
                return true;
            }
        }

    }
    accoutHaveErrorTip(account) {
        //账号为空提示
        if (account == "") {
            if (this.type == 1) {
                ToastManager.Instance.createToast(CPErrorCode.LanguageDescription(10329));
            } else {
                ToastManager.Instance.createToast("请输入邮箱账号");
            }
            return true
        }

        if (this.type == 1) {
            if (account.length < 6 || account.length > 20) {
                ToastManager.Instance.createToast("UILogin_phone_len_limit_tip");//请输入手机号
                return true;
            }
        } else {
            let reg = new RegExp(/^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/g);
            if (!reg.test(account)) {
                ToastManager.Instance.createToast("邮箱格式不正确");//请输入手机号
                return true;
            }
        }
        return false;
    }
    /**
    * 眼睛点击
    */
    clickEyes() {
        this.setEyesOpen(!this.openEyes.active);
    }
    setEyesOpen(boo: boolean) {
        this.openEyes.active = boo;
        this.closeEyes.active = !boo;
        if (this.openEyes.active) {
            this.passwordEdit.inputFlag = cc.EditBox.InputFlag.DEFAULT;
        } else {
            this.passwordEdit.inputFlag = cc.EditBox.InputFlag.PASSWORD;

        }
    }
}
