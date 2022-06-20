
import AdapterComponent from "../../AdapterComponent";
import FormManager from "../../manager/FormManager";
import UIBase from "../UIBase";

const { ccclass } = cc._decorator;

@ccclass
export default class SampleForm extends UIBase {


    title_label: cc.Label = null;

    onLoad(): void {
        super.onLoad();
        this.node.addComponent(AdapterComponent);
        cc.find("top/title", this.node).getComponent(cc.Label).string = this.UIDefine?.Title || "Title";
        this.lateLoad();
    }

    onShow(param: any = null) {
        cc.log("::", this.UIDefine.Name, "onShow()", "param:", param);
    }

    onClose() {
        cc.log("::", this.UIDefine.Name, "onClose()");
        this.lateClose();
    }

    protected lateLoad() {

    }

    protected lateClose() {
        FormManager.ins.closeForm();
    }

    

}
