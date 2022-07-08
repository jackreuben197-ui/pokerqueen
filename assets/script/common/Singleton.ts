
const { ccclass, property } = cc._decorator;

@ccclass

export default class Singleton extends cc.Component {

    onLoad() {
        if (!Singleton[this.constructor.name]) {
            Singleton[this.constructor.name] = true;
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
