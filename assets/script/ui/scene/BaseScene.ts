
import UIBase from "../UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseScene extends UIBase {

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
        super.lateLoad();
    }
}
