

const { ccclass, property } = cc._decorator;

@ccclass
export default class Toast extends cc.Component {

    label: cc.Label;

    posY: number;
    //记录渐入浅出起始时间
    markFadeOriTime: number;

    onLoad() {
        this.label = this.node.getChildByName("label").getComponent(cc.Label);
    }

    setLabel(content: string) {
        this.label.getComponent(cc.Label).string = content;
        //@ts-ignore
        this.label.getComponent(cc.Label)._forceUpdateRenderData();
        let layout = this.node.getComponent(cc.Layout);
        layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        layout.updateLayout();

    }
    reset() {
        this.node.stopAllActions();
        this.node.opacity = 255;
    }

}
