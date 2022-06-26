import AdapterComponent from "../AdapterComponent";

import DialogManager from "../manager/DialogManager";

const { ccclass, property } = cc._decorator;

@ccclass

export default class UIBase extends cc.Component {

    protected param: any;

    protected onLoad() {
        this.UIDefine.DisAdaptScreen || this.node.addComponent(AdapterComponent);
        this.lateLoad();
    }

    onShow(param: any = null) {
        this.param = param;
        cc.log("::", this.UIDefine.Name, "onShow()", "param:", param);
    }

    onClose(param: any = null) {
        cc.log("::", this.UIDefine.Name, "onClose()");
        this.stopAllTweens();
        this.lateClose(param);
    }

    protected lateLoad() {

    }

    protected lateClose(param: any = null) {

    }

    /**
     * 停止所有tweens
     */
    protected stopAllTweens() {

    }

    get UIDefine() {
        return this.constructor["UIDefine"];
    }

}
