
import AdapterComponent from "../../AdapterComponent";
import UIBase from "../UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseScene extends UIBase {

    //public UIDefine: { Name: string, Bundle: string, Path: string } = null;

    onLoad() {
        super.onLoad();
        this.node.addComponent(AdapterComponent);
        this.lateLoad();
    }

    Enter(param) {
        cc.log("::", this.UIDefine.Name, "Enter()", "param:", param);
        this.lateEnter();
    }
    Exit(param) {
        cc.log("::", this.UIDefine.Name, "Exit()", "param:", param);
        this.lateExit();
    }

    protected lateEnter() {

    }
    protected lateExit() {

    }

    protected lateLoad() {

    }
}
