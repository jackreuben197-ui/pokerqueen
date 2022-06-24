import AdapterComponent from "../AdapterComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIBase extends cc.Component {


    protected onLoad() {
        if (this.constructor["UIDefine"]?.IsAdaptScreen) {
            this.node.addComponent(AdapterComponent);
        }
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
        this.stopAllTweens();
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
