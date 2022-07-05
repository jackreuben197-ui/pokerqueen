
import { DialogParam } from "../../define/EIDefine";
import { UIDefine } from "../../define/UIDefine";
import ToastManager from "../../manager/ToastManager";
import UIManager from "../../manager/UIManager";
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
    ///////////////////////////////////
    /**
     * 声明内容
     */
    testLayout: cc.Node = null;

    ///////////////////////////////////
    protected lateLoad() {
        super.lateLoad();

        this.phone_editbox = this.getChildNodeOrComponent("phone_editbox",cc.EditBox);
        this.pass_editbox = this.getChildNodeOrComponent("pass_editbox",cc.EditBox);
        this.open_eyes_icon = this.getChildNodeOrComponent("open_eyes_icon");
        this.close_eyes_icon = this.getChildNodeOrComponent("close_eyes_icon");
        this.eyes_button = this.getChildNodeOrComponent("eyes_button");
        this.confirm_button = this.getChildNodeOrComponent("confirm_button");
        this.forgot_button = this.getChildNodeOrComponent("forgot_button");
        this.register_button = this.getChildNodeOrComponent("register_button");
        this.language_button = this.getChildNodeOrComponent("language_button");
        this.setEyesOpen(false);

        //调试节点
        this.testLayout = this.getChildNodeOrComponent("测试 - layout");
        if (this.testLayout) {
            for (let i = 0; i < this.testLayout.childrenCount; i++) {
                let button = this.testLayout.children[i];
                button.getComponent(cc.Button).name = button.getComponent(cc.Label).string;
                button.on("click", this.testClick, this);
            }
        }
    }

    protected regiterTouchEvents() {
        this.eyes_button.on("click", this.onEyesClick, this);
        this.confirm_button.on("click", this.onConfirmClick, this);
        this.forgot_button.on("click", this.onForgotClick, this);
        this.register_button.on("click", this.onRegisterClick, this);
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
    onConfirmClick() {
        cc.log("onConfirmClick");
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

    //测试按钮触发
    private testClick(e) {
        switch (e.name) {
            case "右入面板":
                UIManager.open(UIDefine.RightTouchBoard);
                break;
            case "多层标题面板":
                UIManager.open(UIDefine.LanguageForm);
                UIManager.open(UIDefine.RegisterForm);
                break;
            case "提示弹板":
                UIManager.open(UIDefine.BaseAlert, {
                    data: {
                        title: "大大的标题", content: "无限的能量", confirm: "Sure", cancel: "Cancel", confirmCallback: () => {
                            ToastManager.ins.craeteToast("面板 确认 回调");
                        },
                        cancelCallback: () => {
                            ToastManager.ins.craeteToast("面板 取消 回调");
                        }
                    }
                });
                break;
            case "Toast":
                let dic = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789阿克苏据了解阿卡链接发圣诞节快乐收到简历咖决胜巅峰";
                let len = 5 + Math.random() * 50 ^ 0;
                let str = "";
                for (let i = 0; i < len; i++) {
                    str += dic[Math.random() * dic.length ^ 0];
                }
                if (str.length > 30) {
                    let a = str.substring(0, str.length / 3 ^ 0);
                    let b = str.substring(str.length / 3 ^ 0, str.length * (2 / 3) ^ 0);
                    let c = str.substring(str.length * (2 / 3) ^ 0, str.length);

                    str = a + "\n" + b + "\n" + c;
                } else if (str.length > 20) {
                    let a = str.substring(0, str.length / 2 ^ 0);
                    let b = str.substring((str.length / 2 ^ 0), str.length - 1);
                    str = a + "\n" + b;
                }

                ToastManager.ins.craeteToast(str);
                break;
            case "下入面板":
                UIManager.open(UIDefine.BottomTouchBoard);
                break;
            case "loading":
                UIManager.open(UIDefine.UIPromptComponent);
                break;

        }
    }

}
