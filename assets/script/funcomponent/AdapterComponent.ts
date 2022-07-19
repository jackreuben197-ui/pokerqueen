/**
 * 适配组件
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class AdapterComponent extends cc.Component {
    onLoad() {
        this.node.setContentSize(cc.view.getVisibleSize());
    }
}
