/**
 * 适配组件
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class AdapterComponent extends cc.Component {
    override onLoad() {
        this.node.setContentSize(cc.view.getVisibleSize());
        this.node.setPosition(cc.v2(0, 0));

        if (!this.node.getComponent(cc.BlockInputEvents)) {
            this.node.addComponent(cc.BlockInputEvents);
        }
    }
}
