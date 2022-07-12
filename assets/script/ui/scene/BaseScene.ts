
import UIBase from "../UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseScene extends UIBase {

    Enter(param: any = null) {
        cc.log("::", this.UIDefine.Name, "Enter()", "param:", param);
        this.lateEnter();
    }
    Exit(param: any = null) {
        cc.log("::", this.UIDefine.Name, "Exit()", "param:", param);
        this.lateExit();
    }

    protected lateEnter(param: any = null) {

    }
    protected lateExit(param: any = null) {

    }

    protected lateLoad() {
        super.lateLoad();
    }
}
