/**
 * 适配组件
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class AdapterComponent extends cc.Component {
    onLoad() {
        this.node.setContentSize(cc.view.getVisibleSize());
        this.node.setPosition(cc.v2(0, 0));
    }
}
