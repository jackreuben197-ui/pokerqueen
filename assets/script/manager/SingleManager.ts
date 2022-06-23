
const { ccclass, property } = cc._decorator;

@ccclass

export default class SingleManager extends cc.Component {

    onLoad() {

        if (!this.constructor["ins"]) {
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
