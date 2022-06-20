
import { FormEffect } from "../../define/GlobalEnum";
import FormManager from "../../manager/FormManager";
import SampleForm from "./SampleForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RegisterForm extends SampleForm {
    /**
     * 绑定内容
     */
    @property(cc.Node)
    open_eyes_icon: cc.Node = null;
    @property(cc.Node)
    close_eyes_icon: cc.Node = null;
    @property(cc.EditBox)
    pass_editbox: cc.EditBox = null;
    ///////////////////////////////////
    /**
     * 声明内容
     */

    //public UIDefine: { Bundle: string, Path: string, Title: string } = UIDefine.RegisterForm;

    eyesIsOpen: boolean = false;

    ///////////////////////////////////

    protected lateLoad() {
        this.setEyesOpen(this.eyesIsOpen);
    }

    protected lateClose() {
        FormManager.ins.closeForm(null,FormEffect.RightInOut);
    }


    setEyesOpen(boo: boolean) {
        this.open_eyes_icon.active = boo;
        this.close_eyes_icon.active = !boo;
    }


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
     * 确认点击
     */
    onConfirm() {

    }

}
