
import { DialogParam } from "../../define/EIDefine";
import { UIDefine } from "../../define/UIDefine";
import ToastManager from "../../manager/ToastManager";
import UIManager from "../../manager/UIManager";
import BaseScene from "./BaseScene";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginScene extends BaseScene {

    /**
     * 绑定内容
     */
    @property(cc.EditBox)
    phone_editbox: cc.EditBox = null;
    @property(cc.EditBox)
    pass_editbox: cc.EditBox = null;
    @property(cc.Node)
    open_eyes_icon: cc.Node = null;
    @property(cc.Node)
    close_eyes_icon: cc.Node = null;
    ///////////////////////////////////
    /**
     * 声明内容
     */
    testLayout: cc.Node = null;
    eyesIsOpen: boolean = false;

    ///////////////////////////////////
    protected lateLoad() {
        this.setEyesOpen(this.eyesIsOpen);
        this.testLayout = cc.find("测试节点/layout", this.node);
        if (this.testLayout) {
            for (let i = 0; i < this.testLayout.childrenCount; i++) {
                let button = this.testLayout.children[i];
                button.getComponent(cc.Button).name = button.getComponent(cc.Label).string;
                button.on("click", this.testClick, this);
            }
        }
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
