
import BaseForm from "./BaseForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ResetPassForm extends BaseForm {
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
    eyesIsOpen: boolean = false;

    ///////////////////////////////////

    protected lateLoad() {
        super.lateLoad();
        this.setEyesOpen(this.eyesIsOpen);
    }

    protected lateClose(param: any = null) {
        super.lateClose(param);
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
