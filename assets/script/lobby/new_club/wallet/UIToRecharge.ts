
import { UIDefine } from "../../../define/UIDefine";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import UIComponent from "../../../ui/UIComponent";

//跳转充值界面
const { ccclass } = cc._decorator;

@ccclass
export default class UIToRecharge extends BaseFormPlus {

    $click: cc.Node = null;

    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$click, this.onClick);
    }
    onClick() {
        UIComponent.open(UIDefine.UIRecharge, this._param);
    }
}
