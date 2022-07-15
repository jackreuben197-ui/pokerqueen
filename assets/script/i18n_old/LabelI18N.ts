/**
 * 文本多语言插件
 */

import I18NManager from "../manager/I18NManager";

const { ccclass, property } = cc._decorator;


@ccclass
export default class LabelI18N extends cc.Component {


    label: cc.Label | cc.EditBox = null;

    isEditBox: boolean;

    key: string;

    onLoad() {
        this.checkLabel(this.node.getComponent(cc.Label));
        this.checkEditBox(this.node.getComponent(cc.EditBox));
    }
    protected onEnable(): void {
        //cc.log("LabelI18N key:",this.key);
        //节点被激活触发
        this.translate();
    }

    checkLabel(label: cc.Label) {
        if (label) {
            this.label = label;
            this.key = label.string;
            this.isEditBox = false;
            I18NManager.ins.registerLabel(this);
        }
    }
    checkEditBox(label: cc.EditBox) {
        if (label) {
            this.label = label;
            this.key = label.placeholder;
            this.isEditBox = true;
            I18NManager.ins.registerLabel(this);
        }
    }

    translate() {
        let value = I18NManager.ins.getValue(this.key);
        if (this.isEditBox) {
            (<cc.EditBox>this.label).placeholder = value;
        } else {
            (<cc.Label>this.label).string = value;
        }
    }
}
