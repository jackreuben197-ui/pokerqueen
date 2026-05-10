import UIBase from '../UIBase';
import UIComponent from '../UIComponent';
const { ccclass, property } = cc._decorator;

@ccclass
export default class Toast extends UIBase {
    label: cc.Label;
    posY: number;
    //记录渐入浅出起始时间
    markFadeOriTime: number;

    lateLoad() {
        super.lateLoad();
        this.label = this.getChildNodeOrComponent('label', cc.Label);
    }

    setLabel(content: string) {
        // this.label.getComponent(cc.Label).string = content;
        this.setText(this.label, content);
        //@ts-ignore
        //this.label._forceUpdateRenderData();
        // let layout = this.node.getComponent(cc.Layout);
        // layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        // layout.updateLayout();
    }

    reset() {
        this.node.stopAllActions();
        this.node.opacity = 255;
    }
}
