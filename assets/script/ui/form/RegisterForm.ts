
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


    pass_editbox: cc.EditBox = null;


    confirm_button: cc.Node = null;


    ///////////////////////////////////
    /**
     * 声明内容
     */

    ///////////////////////////////////

    protected lateLoad() {
        super.lateLoad();
        this.pass_editbox = this.getChildNode("pass_editbox")?.getComponent(cc.EditBox);
        this.open_eyes_icon = this.getChildNode("open_eyes_icon");
        this.close_eyes_icon = this.getChildNode("close_eyes_icon");
        this.eyes_button = this.getChildNode("eyes_button");
        this.confirm_button = this.getChildNode("confirm_button");

        this.setEyesOpen(false);
    }

    protected lateClose(param: any = null) {
        super.lateClose(param);
    }


    protected regiterTouchEvents() {
        super.regiterTouchEvents();
        this.eyes_button.on("click", this.onEyesClick, this);
        this.confirm_button.on("click", this.onConfirmClick, this);

    }


    setEyesOpen(boo: boolean) {
        this.open_eyes_icon.active = boo;
        this.close_eyes_icon.active = !boo;
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
    onConfirmClick() {
        cc.log("onConfirmClick");
    }

}
