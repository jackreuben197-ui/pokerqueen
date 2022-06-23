
import AdapterComponent from "../../AdapterComponent";
import FormManager from "../../manager/FormManager";
import UIBase from "../UIBase";

const { ccclass } = cc._decorator;

@ccclass
export default class SampleForm extends UIBase {

    title_label: cc.Label = null;

    protected onLoad() {
        super.onLoad();
        cc.find("top/title", this.node).getComponent(cc.Label).string = this.UIDefine?.Title || "Title";
        this.lateLoad();
    }
    protected lateLoad() {
        super.lateLoad();
    }
    protected lateClose() {
        super.lateClose();
        FormManager.ins.close();
    }
}
