
import { Md5 } from "ts-md5";
import ButtonClickCD from "../../common/ButtonClickCD";
import ComTabToggles, { ETabToggle } from "../../common/ComTabToggles";
import { ELoginProcess, ELoginType } from "../../config/EEnumConfig";
import { EventName } from "../../config/EventName";
import { LanguageList } from "../../config/GameConfig";
import { ProcedureEnum } from "../../define/EIDefine";
import { UIDefine } from "../../define/UIDefine";
import GGEvent from "../../event/GGEvent";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { i18nLabel } from "../../i18n/i18nLabel";
import { i18nMgr } from "../../i18n/i18nMgr";
import ProcedureManager from "../../manager/ProcedureManager";
import ToastManager from "../../manager/ToastManager";
import LoginSession from "../../session/LoginSession";
import StorageKey from "../../session/StorageKey";
import AssetContext, { AssetFold } from "../component/AssetContext";
import LabelCDTime from "../component/LabelCDTime";
import UIComponent from "../UIComponent";
import BaseScene from "./BaseScene";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginScene extends BaseScene {
    /**
     * 节点|组件 定义
     */
    private languageBtn: cc.Node = null;
    private languageFlag: cc.Sprite = null;
    private languageLayer: cc.Node = null;
    private languageNode: cc.Node = null;
    private languageItem: cc.Node = null;

    private tabToggles: ComTabToggles = null;

    private areaNode: cc.Node = null;
    private areaFlag: cc.Label = null;
    private areaNum: cc.Label = null;

    private mailNode: cc.Node = null;
    private phoneEdit: cc.EditBox = null;

    private vcodeNode: cc.Node = null;
    private vcodeEdit: cc.EditBox = null;
    private getVLab: cc.Label = null;
    private getVCDTime: LabelCDTime = null;

    private passwordNode: cc.Node = null;
    private passwordEdit: cc.EditBox = null;
    private eyesBtn: cc.Node = null;
    private closeEyes: cc.Node = null;
    private openEyes: cc.Node = null;

    private sureBtn: cc.Node = null;
    private sureBtnLab: cc.Label = null;
    private forgotBtn: cc.Node = null;
    private changeLoginBtn: cc.Node = null;
    private registerBtn: cc.Node = null;
    private backLoginBtn: cc.Node = null;


    private facebook: cc.Node = null;
    private google: cc.Node = null;
    private instagram: cc.Node = null;

    private btnAgreeNode: cc.Node = null;
    private downAgreeNode: cc.Node = null;
    private agreeNode: cc.Node = null;
    private agreeToggle: cc.Toggle = null;
    private agreeTip1: cc.Label = null;
    private agreeTip2: cc.Label = null;

    private otherLoginNode: cc.Node = null;

    private _loginType: ELoginType = ELoginType.phone   //  手机  邮箱
    private _loginProcess: ELoginProcess = ELoginProcess.login; // 登录   注册    找回密码

    private _isQuiklyLogin: boolean = false;    //快速登录
    private _vcodeBtnCanClick: boolean = true;

    _curretnLanguage: Number = 0;
    onLoad() {
        super.onLoad();
        this.initView();
    }

    protected lateLoad() {
        super.lateLoad();

        this.languageBtn = this.getChildNodeOrComponent("languageBtn")
        this.languageFlag = this.getChildNodeOrComponent("languageFlag", cc.Sprite)
        this.languageLayer = this.getChildNodeOrComponent("languageLayer")
        this.languageNode = this.getChildNodeOrComponent("languageNode")
        this.languageItem = this.getChildNodeOrComponent("languageItem")
        this.tabToggles = this.getChildNodeOrComponent("tabToggles", ComTabToggles)
        this.areaNode = this.getChildNodeOrComponent("areaNode")
        this.areaFlag = this.getChildNodeOrComponent("areaFlag", cc.Label)
        this.areaNum = this.getChildNodeOrComponent("areaNum", cc.Label)
        this.mailNode = this.getChildNodeOrComponent("mailNode")
        this.phoneEdit = this.getChildNodeOrComponent("phoneEdit", cc.EditBox)
        this.vcodeNode = this.getChildNodeOrComponent("vcodeNode")
        this.vcodeEdit = this.getChildNodeOrComponent("vcodeEdit", cc.EditBox)
        this.getVLab = this.getChildNodeOrComponent("getVLab", cc.Label)
        this.passwordNode = this.getChildNodeOrComponent("passwordNode")
        this.passwordEdit = this.getChildNodeOrComponent("passwordEdit", cc.EditBox)
        this.eyesBtn = this.getChildNodeOrComponent("eyesBtn")
        this.closeEyes = this.getChildNodeOrComponent("closeEyes")
        this.openEyes = this.getChildNodeOrComponent("openEyes")
        this.sureBtn = this.getChildNodeOrComponent("sureBtn")
        this.sureBtnLab = this.getChildNodeOrComponent("sureBtnLab", cc.Label)
        this.forgotBtn = this.getChildNodeOrComponent("forgotBtn")
        this.changeLoginBtn = this.getChildNodeOrComponent("changeLoginBtn")
        this.registerBtn = this.getChildNodeOrComponent("registerBtn")
        this.backLoginBtn = this.getChildNodeOrComponent("backLoginBtn")
        this.facebook = this.getChildNodeOrComponent("facebook")
        this.google = this.getChildNodeOrComponent("google")
        this.instagram = this.getChildNodeOrComponent("instagram")
        this.btnAgreeNode = this.getChildNodeOrComponent("btnAgreeNode")
        this.downAgreeNode = this.getChildNodeOrComponent("downAgreeNode")
        this.agreeNode = this.getChildNodeOrComponent("agreeNode")
        this.agreeToggle = this.getChildNodeOrComponent("agreeToggle", cc.Toggle)
        this.agreeTip1 = this.getChildNodeOrComponent("agreeTip1", cc.Label)
        this.agreeTip2 = this.getChildNodeOrComponent("agreeTip2", cc.Label)
        this.otherLoginNode = this.getChildNodeOrComponent('otherLoginNode')
        this.getVCDTime = this.getVLab.node.addComponent(LabelCDTime);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(GGEvent.Change_AreaCode, this.onChangeAreaCode);
        this.listen(EventName.switchLanguages, this.switchLanguages)
    }

    protected regiterTouchEvents() {
        super.regiterTouchEvents();
        this.bindClick(this.eyesBtn, this.clickEyes);
        this.bindClick(this.forgotBtn, this.clickForgot);
        this.bindClick(this.registerBtn, this.clickRegister);
        this.bindClick(this.areaNode, this.clickAreaNode)
        this.bindClick(this.languageBtn, this.clickLanguage);
        this.bindClick(this.languageLayer, this.clickLanguageLayer);
        this.bindClick(this.agreeTip2, this.clickUserAgreeRule);
        this.bindClick(this.changeLoginBtn, this.clickChangeLoginBtn);
        this.bindClick(this.backLoginBtn, this.clickBackLoginBtn);
        this.bindClick(this.facebook, this.clickFaceBook, null, true);
        this.bindClick(this.google, this.clickGoogle, null, true);
        this.bindClick(this.instagram, this.clickInstagram, null, true);
    }

    protected lateEnter() {
        super.lateEnter();
        this.refreshLanguageFlag();
    }

    initView() {
        this.agreeToggle.isChecked = false;
        this.setEyesOpen(false);
        this.initLanguageLayer();
        this.initToggles();
        this.setAreaAndPhone();

    }

    initLanguageLayer() {
        this.languageItem.active = false;
        LanguageList.forEach((value, index, list) => {
            let item = cc.instantiate(this.languageItem);
            item.parent = this.languageNode;
            this.setActive(item, true);
            this.bindClick(item, this.clickLanguageItem, value);

            let flag = item.getChildByName("flag").getComponent(cc.Sprite);
            let lab = item.getChildByName("lab").getComponent(cc.Label);
            let line = item.getChildByName("line");

            flag.spriteFrame = AssetContext.getAsset<cc.SpriteFrame>(`flag_${value.lan}`, AssetFold.texture_flag);
            lab.node.getComponent(i18nLabel).i18NString = value.name;
            this.setActive(line, index < list.length - 1);
        })
        this.setLanLayerActive(false);
    }

    switchLanguages() {
        this.updatePhonePlaceholder();
    }

    initToggles() {
        this.tabToggles.initData(this.onToggle, ETabToggle.text);
        this.tabToggles.setParams([ELoginType.phone, ELoginType.mail]);
        this.tabToggles.clickTab(0, null, true);
    }

    onToggle = (index: number, type: ELoginType) => {
        this._loginType = type;
        this.updateViewStatus();
    }

    updateViewStatus() {
        this.phoneEdit.string = "";
        this.vcodeEdit.string = "";
        this.passwordEdit.string = "";

        this.phoneEdit.inputMode = this._loginType == ELoginType.phone ? cc.EditBox.InputMode.PHONE_NUMBER : cc.EditBox.InputMode.EMAIL_ADDR;
        this.setActive(this.vcodeNode, this._loginProcess != ELoginProcess.login || this._isQuiklyLogin)
        this.setActive(this.passwordNode, true)
        this.setActive(this.forgotBtn, this._loginProcess == ELoginProcess.login && !(this._loginType == ELoginType.phone && this._isQuiklyLogin));
        this.setActive(this.registerBtn, this._loginProcess == ELoginProcess.login);
        this.setActive(this.backLoginBtn, this._loginProcess != ELoginProcess.login);
        this.sureBtnLab.node.getComponent(i18nLabel).i18NString = this._loginProcess == ELoginProcess.login ? "UILogin_BtnLogin" : "CommitOK";

        this.setToggleTitles();
        this.setPhoneNodeStatus();
        this.updateAgreeNodeStatus();
        this.updateQuiklyLoginStatus();
        this.updateVCodeCDTime();
    }

    setToggleTitles(pro: ELoginProcess = this._loginProcess) {
        let titles = ["UILogin_phone_login", "UILogin_mail_login"];
        if (this._loginProcess == ELoginProcess.register) {
            titles = ["UILogin_phone_register", "UILogin_mail_register"];
        }
        else if (this._loginProcess == ELoginProcess.reset) {
            titles = ["UILogin_phone_reset", "UILogin_mail_reset"];
        }
        this.tabToggles.setTitles(titles);
    }

    setPhoneNodeStatus() {
        this.setActive(this.areaNode, this._loginType == ELoginType.phone);
        this.setActive(this.mailNode, this._loginType == ELoginType.mail);

        this.updatePhonePlaceholder();
    }

    updatePhonePlaceholder() {
        let key = this._loginType == ELoginType.phone ? "UILogin_InputMoblie" : "UILogin_InputMail";
        this.phoneEdit.placeholder = GC.language.getLocal(key);
    }

    updateAgreeNodeStatus() {
        this.setActive(this.btnAgreeNode, this._loginProcess != ELoginProcess.reset);
        this.setActive(this.otherLoginNode, this._loginProcess != ELoginProcess.reset)

        // if (this.agreeNode.active) {
        //     if (this._loginProcess == ELoginProcess.login) {
        //         this.agreeNode.parent = this.downAgreeNode;
        //         this.agreeNode.anchorX = 0.5;
        //         this.agreeNode.setPosition(cc.v2(0, 0))
        //         this.agreeTip1.fontSize = 12 * 3.31;
        //         this.agreeTip2.fontSize = 12 * 3.31;
        //     } else if (this._loginProcess == ELoginProcess.register) {
        //         this.agreeNode.parent = this.btnAgreeNode;
        //         this.agreeNode.anchorX = 0;
        //         this.agreeNode.setPosition(cc.v2(0, 0));
        //         this.agreeTip1.fontSize = 10 * 3.31;
        //         this.agreeTip2.fontSize = 10 * 3.31;
        //     }
        // }
    }

    updateQuiklyLoginStatus() {
        this.setActive(this.changeLoginBtn, this._loginType == ELoginType.phone && this._loginProcess == ELoginProcess.login);
        if (this.changeLoginBtn.active) {
            this.setText(this.changeLoginBtn.getComponent(cc.Label), this._isQuiklyLogin ? "UILogin_phone_pwd_l" : "UILogin_phone_vcode_l");
            this.setActive(this.vcodeNode, this._isQuiklyLogin);
            this.setActive(this.passwordNode, !this._isQuiklyLogin);
        }
    }

    updateVCodeCDTime() {
        if (this.vcodeNode.active) {
            let codeTime = GC.localStore.getItem(this.codeTimeKey);
            if (codeTime != null && codeTime != "") {
                this._vcodeBtnCanClick = false;
                this.getVCDTime.resetUI(+codeTime, this.resetVCodeTime);
            } else {
                this.resetVCodeTime();
            }
        }
    }

    setAreaAndPhone() {
        this.areaNum.string = LoginSession.AreaCode;
        this.phoneEdit.string = LoginSession.Phone;
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
    /**
     * 刷新旗子
     */
    refreshLanguageFlag() {
        this.languageFlag.spriteFrame = AssetContext.getAsset<cc.SpriteFrame>(`flag_${i18nMgr.language}`, AssetFold.texture_flag);
    }

    ///////////////////////////////////按钮响应回调//////////////////////////////////////////
    /**
     * 眼睛点击
     */
    clickEyes() {
        this.setEyesOpen(!this.openEyes.active);
    }


    /**
     * 找回密码点击
     */
    clickForgot() {
        cc.log("clickForgot");
        this._loginProcess = ELoginProcess.reset;
        this.updateViewStatus();
    }

    /**
     * 注册账号点击
     */
    clickRegister() {
        cc.log("clickRegister");
        this._loginProcess = ELoginProcess.register;
        this.updateViewStatus();
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
    /**
     * 语言切换点击
     */
    clickLanguage() {
        cc.log("clickLanguage");
        this.setLanLayerActive(!this.languageLayer.active);
    }
    /**
     * 语言面板层点击
     */
    clickLanguageLayer() {
        this.setLanLayerActive(false);
    }

    setLanLayerActive(boo: boolean) {
        this.languageLayer.active = boo;
        this.languageNode.scale = 1;
        if (boo) {
            this.languageNode.stopAllActions();
            this.languageNode.scale = 0;
            cc.tween(this.languageNode).to(.2, { scale: 1 }, cc.easeBackOut()).start();
        }
    }

    clickLanguageItem(data: { lan: string, name: string }) {
        i18nMgr.setLanguage(data.lan);
        this.clickLanguageLayer();
        this.refreshLanguageFlag();
    }

    /**
     * 用戶注意事項
     */
    clickUserAgreeRule() {
        UIComponent.open(UIDefine.UserAgreeForm);
    }

    //改变登录方式  手机号  快速登录  密码登录
    clickChangeLoginBtn() {
        this._isQuiklyLogin = !this._isQuiklyLogin;
        this.updateViewStatus();
    }

    // 从注册状态返回登录
    clickBackLoginBtn() {
        this._loginProcess = ELoginProcess.login;
        this.updateViewStatus();
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
        if (this._loginType == ELoginType.phone) {
            //获取手机验证码
            if (this._loginProcess == ELoginProcess.register) {
                //验证手机号是否已注册
                let result: any = await LoginSession.APIPHoneExist({ phone: account, area }).catch((e) => { });
                if (result == undefined) return;
                if (result?.data) {
                    ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1006"));//("此号码已注册");
                    return;
                }
            }

            //验证获取验证码是否发送成功
            let result = await LoginSession.APISendCode({ phone: account, area }).catch(() => { });
            if (result == undefined) return;
            this.startVCodeTime();
        } else if (this._loginType == ELoginType.mail) {

            //获取邮箱验证码
            if (this._loginProcess == ELoginProcess.register) {
                //验证邮箱是否已注册
                let result: any = await LoginSession.APIEmailExist({ email: account }).catch((e) => { });
                if (result == undefined) return;
                if (result?.data) {
                    ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1006"));//("此号码已注册");
                    return;
                }
            }

            //验证获取验证码是否发送成功
            let lang = i18nMgr.getLanguage()
            let result = await LoginSession.APISendEmailCode({ email: account, lang: lang }).catch(() => { });
            if (result == undefined) return;

            this.startVCodeTime();
            // ToastManager.Instance.createToast("获取邮箱验证码  还没有！！！");
        }
    }

    resetData() {
        this.agreeToggle.isChecked = false;
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
        if (this._loginProcess == ELoginProcess.login && this._isQuiklyLogin) {
            return StorageKey.CODE_TIME_QUIKLY_LOGIN_PHONE;
        } else if (this._loginProcess == ELoginProcess.register) {
            return [StorageKey.CODE_TIME_REGIST_PHONE, StorageKey.CODE_TIME_REGIST_MAIL][this._loginType]
        } else if (this._loginProcess == ELoginProcess.reset) {
            return [StorageKey.CODE_TIME_RESET_PHONE, StorageKey.CODE_TIME_RESET_MAIL][this._loginType]
        }
    }

    // 点击登录、确定
    clickSure(button: cc.Button) {
        if (!ButtonClickCD.canClick(button.target)) return;

        let area: string = this.areaNum.string.trim().substring(1);
        let account: string = this.phoneEdit.string.trim();
        let password: string = this.passwordEdit.string.trim();
        let vcode = this.vcodeEdit.string.trim();
        let agree_checked = this.agreeToggle.isChecked;


        if (this.haveErrorTip(area, account, password, vcode, agree_checked)) {
            return;
        }

        if (this._loginProcess == ELoginProcess.login) {
            this.checkLogin(area, account, password, vcode);
        } else if (this._loginProcess == ELoginProcess.register) {
            this.checkRegister(area, account, password, vcode);
        } else {
            this.checkResetPwd(area, account, password, vcode);
        }
    }

    /*** ResetPwd ***/
    async checkResetPwd(area, account, password, vcode) {
        if (this._loginType == ELoginType.phone) {
            //找回手机密码
            let result = await LoginSession.APISendModifyPW({
                phone: account,
                area: area,
                code: vcode,
                password: Md5.hashStr(password)
            }).catch(() => { })
            if (result) {
                this.resetVCodeTime();
                ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1009"));//("更改密码成功");
                this.clickBackLoginBtn();
            }
        } else {
            //找回邮箱密码
            let result = await LoginSession.APISendModifyPW({
                email: account,
                area: area,
                code: vcode,
                password: Md5.hashStr(password)
            }).catch(() => { })
            if (result) {
                this.resetVCodeTime();
                ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1009"));//("更改密码成功");
                this.clickBackLoginBtn();
            }
            // ToastManager.Instance.createToast("找回邮箱密码  还没有！！！");
        }
    }

    //提示
    haveErrorTip(area, account, password, vcode, agree_checked) {
        if (this.accoutHaveErrorTip(account)) {
            return true
        }

        // 没有勾选用户须知提示
        if (this.btnAgreeNode.active && !agree_checked) {
            ToastManager.Instance.createToast(i18nMgr.Get("UILogin_ReadOK"));//("阅读并同意用户协议");
            return true
        }

        //验证码不对提示
        if (this.vcodeNode.active) {
            if (vcode == "") {
                ToastManager.Instance.createToast(i18nMgr.Get("UILogin_1008"));//("请输入验证码");
                return true
            }
            if (vcode.length != 4) {
                ToastManager.Instance.createToast("UILogin_vcode_len_limit_tip");//验证码只能是4位数
                return true
            }
        }
        if (!this._isQuiklyLogin) {
            //密码不对提示
            if (this.passwordNode.active && password.length < 6) {
                ToastManager.Instance.createToast(CPErrorCode.LanguageDescription(10330));
                return true;
            }
        }
    }

    accoutHaveErrorTip(account) {
        //账号为空提示
        if (account == "") {
            if (this._loginType == ELoginType.phone) {
                ToastManager.Instance.createToast(CPErrorCode.LanguageDescription(10329));
            } else {
                ToastManager.Instance.createToast("请输入邮箱账号");
            }
            return true
        }

        if (this._loginType == ELoginType.phone) {
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

    /*** Login ***/
    checkLogin(area, account, password, vcode) {
        if (this._loginType == ELoginType.phone) {
            this.checkPhoneLogin(area, account, password, vcode);
        } else {
            this.checkMailLogin(account, password, area);
        }
    }
    // 手机号登录
    checkPhoneLogin(area, account, password, vcode) {
        if (this._isQuiklyLogin) {
            //手机号 快速登录
            this.tryEnterGame(area, account, vcode);
            // ToastManager.Instance.createToast("手机号 快速登录  还没有！！！");
        } else {
            //手机号普通登录
            this.tryEnterGame(area, account, password);
        }
    }

    // 邮箱登录
    checkMailLogin(account, password, area) {
        //邮件 密码登录
        this.tryEnterGame(area, account, password);
        // ToastManager.Instance.createToast("邮件 密码登录  还没有！！！");
    }

    /*** Register ***/
    protected async checkRegister(area, account, password, vcode) {
        if (this._loginType == ELoginType.phone) {
            //手机号注册
            let result = await LoginSession.APISendRegister({
                phone: account,
                password: Md5.hashStr(password),
                area: area,
                code: vcode,
                platform: 5,
            }).catch(() => { });

            if (result) {
                this.resetData();
                this.tryEnterGame(area, account, password);
            }
        } else {
            let result = await LoginSession.APISendRegister({
                email: account,
                password: Md5.hashStr(password),
                area: area,
                code: vcode,
                platform: 5,
            }).catch(() => { });

            if (result) {
                this.resetData();
                this.tryEnterGame(area, account, password);
            }
            // ToastManager.Instance.createToast("邮箱注册  还没有！！！");
        }
    }

    //尝试进入游戏
    tryEnterGame(area, account, password) {

        if (this._loginType == ELoginType.phone) {
            if (this._isQuiklyLogin) {
                ProcedureManager.StartProcedure(ProcedureEnum.EnterLobby, {
                    phone: account,
                    code: password,
                    area: area,
                    is_simulator: false
                });
            }
            else {
                ProcedureManager.StartProcedure(ProcedureEnum.EnterLobby, {
                    phone: account,
                    password: Md5.hashStr(password),
                    area: area,
                    is_simulator: false
                });
            }

        } else {
            ProcedureManager.StartProcedure(ProcedureEnum.EnterLobby, {
                email: account,
                password: Md5.hashStr(password),
                area: area,
                is_simulator: false
            });
        }

    }



    /*** 第三方登录 ***/
    clickGoogle() {
        GC.sdk.googleLogin()
    }
    clickFaceBook() {
        GC.sdk.faceBookLogin();
    }
    clickInstagram() {
        GC.sdk.instagramLogin();
    }
}
