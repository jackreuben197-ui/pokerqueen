import { Md5 } from "ts-md5";
import SimpleNodePool from "../../common/MyNodePool";
import { UIDefine } from "../../define/UIDefine";
import GGEvent from "../../event/GGEvent";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { i18nMgr } from "../../i18n/i18nMgr";
import { WebMallShopList, WebMallBuy, WebUserModifyPassword, WebUserSendCode, WebWww } from "../../net/https/WebRequest";
import LoginSession from "../../session/LoginSession";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIResetPassword extends BaseFormPlus {
    //区号按钮
    $area_code: cc.Node = null;
    //区号文本
    cc_Label$area_code: cc.Label = null;

    //输入手机号文本
    cc_EditBox$mobile_number: cc.EditBox = null;
    //清除手机号输入按钮
    $clear_number: cc.Node = null;
    //发送验证码文本
    cc_Label$send_code: cc.Label = null;
    //验证码输入文本
    cc_EditBox$mobile_vcode: cc.EditBox = null;
    //密码输入文本
    cc_EditBox$mobile_password: cc.EditBox = null;

    //提交
    $confirm: cc.Node = null;

    //default_area_code: string = "+55";

    /////////////////////////////////////////////
    mIsCanClickCode: boolean = false;

    _code_cd_run: boolean = false;

    cd_start_time: number = 60;

    lateLoad() {
        super.lateLoad();
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.resetData();
        this.resetView();
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$area_code, this.click_area_code);
        this.setButtonClick(this.$clear_number, this.click_clear_number);
        this.setButtonClick(this.cc_Label$send_code.node, this.click_send_code);
        this.setButtonClick(this.$confirm, this.click_confirm);
    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(GGEvent.Change_AreaCode, this.onChangeAreaCode);
    }
    resetData() {
        this.mIsCanClickCode = true;
        this.code_cd_run = false;
    }
    resetView() {

        this.cc_EditBox$mobile_number.string = "";
        this.cc_EditBox$mobile_vcode.string = "";
        this.cc_EditBox$mobile_password.string = "";

        this.cc_Label$send_code.string = i18nMgr.Get("UILogin_GetCode");
        this.cc_Label$send_code.node.getComponent(cc.Button).interactable = true;
        this.cc_Label$area_code.string = LoginSession.AreaCode;
    }
    //区号改变
    onChangeAreaCode() {
        this.cc_Label$area_code.string = LoginSession.AreaCode;
    }

    //点击区号
    click_area_code() {
        UIComponent.open(UIDefine.AreaCodeForm);
    }
    //点击清理手机号
    click_clear_number() {
        this.cc_EditBox$mobile_number.string = "";
    }
    //点击发送验证码
    click_send_code() {

        //判断手机号
        let phone: string = this.cc_EditBox$mobile_number.string.trim();
        let area: string = this.cc_Label$area_code.string.replace("+", "");
        if (phone == "") {
            UIComponent.Instance.ToastLanguage("UIMine_Setting102");
            return;
        }
        if (this.cc_Label$send_code.string != i18nMgr.Get("UILogin_GetCode")) {
            UIComponent.Instance.ToastLanguage("UIMine_Setting106");//Toast("请稍等再发");
            return;
        }
        if (this.mIsCanClickCode == false) {
            UIComponent.Instance.ToastLanguage("UIMine_Setting106");//Toast("请稍等再发");
            return;
        }

        this.mIsCanClickCode = false;


        WebWww.Instance.CommonAPI(
            {
                web_class: WebUserSendCode,
                body: {
                    area: area,
                    phone: phone,
                }
            }
        ).then(
            (res: any) => {
                UIComponent.Instance.ToastLanguage("UIMine_Setting107");//Toast("验证码已发送");
                //显示倒计时
                //UILoginModel.mInstance.ShowTimes(textCode);
                this.code_cd_run = true;

                this.mIsCanClickCode = true;
            },
            (res: any) => {
                this.mIsCanClickCode = true;
            }
        )
    }
    //点击提交
    click_confirm() {

        let phone: string = this.cc_EditBox$mobile_number.string.trim();
        let password: string = this.cc_EditBox$mobile_password.string.trim();
        let code: string = this.cc_EditBox$mobile_vcode.string.trim();
        let area: string = this.cc_Label$area_code.string.replace("+", "");
        //判断手机号
        if (phone == "") {
            UIComponent.Instance.ToastLanguage("UIMine_Setting102");
            return;
        }
        //判断密码
        if (password.length < 6) {
            UIComponent.Instance.ToastLanguage("UIMine_Setting103");
            return;
        }
        //判断验证码
        if (code == "") {
            UIComponent.Instance.ToastLanguage("UIMine_Setting104");
            return;
        }

        WebWww.Instance.CommonAPI(
            {
                web_class: WebUserModifyPassword,
                body: {
                    area: area,
                    phone: phone,
                    code: code,
                    password: Md5.hashStr(password)
                }
            }
        ).then(
            (res: any) => {
                UIComponent.Instance.ToastLanguage("UIMine_Setting105");//Toast("更改密码成功~");
                UIComponent.close(UIDefine.UIResetPassword);
            },
            (res: any) => {
                //UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(res.code));
            }
        )
    }

    set code_cd_run(boo: boolean) {

        this._code_cd_run = boo;

        boo && (this.cd_start_time = 60);
    }
    get code_cd_run() {
        return this._code_cd_run;
    }

    protected update(dt: number): void {

        if (this.code_cd_run) {

            this.cd_start_time -= dt;

            let show_time = Math.ceil(this.cd_start_time);

            if (show_time < 0) {
                this.cd_end();
            } else {
                this.cc_Label$send_code.string = `${show_time}s`;
            }
        }
    }
    cd_end() {
        this.code_cd_run = false;
        this.cc_Label$send_code.string = i18nMgr.Get("UILogin_GetCode");
    }
}
