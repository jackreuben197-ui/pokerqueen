import DialogManager from "./DialogManager";
import FormManager from "./FormManager";

const { ccclass, property } = cc._decorator;

@ccclass

export default class SingleManager extends cc.Component {

    onLoad() {
        if (!SingleManager[this.constructor.name]) {
            SingleManager[this.constructor.name] = true;
            this.constructor["ins"] = this;
            this.lateLoad();
        } else {
            this.destroy();
            cc.log("重复创建单例:", this.name);
            return;
        }
    }
    protected lateLoad() {

    }
}
