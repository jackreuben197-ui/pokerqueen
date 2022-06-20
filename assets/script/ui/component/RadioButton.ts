
const { ccclass, property } = cc._decorator;

@ccclass
export default class RadioButton extends cc.Component {

    //背景节点
    Background: cc.Node = null;

    //选中节点
    checkmark: cc.Node = null;

    _group: string = null;

    onLoad() {

        this.Background = this.node.getChildByName("Background");

        this.checkmark = this.node.getChildByName("checkmark");

    }

    set group(groupName: string) {
        RadioButton[groupName] ||= [];
        RadioButton[groupName].push(this);
    }

    start() {

    }

    // update (dt) {}
}
