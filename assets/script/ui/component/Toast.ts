import LabelI18N from "../../i18n/LabelI18N";



const { ccclass, property } = cc._decorator;

@ccclass
export default class Toast extends cc.Component {

    @property(LabelI18N)
    labelI18N: LabelI18N = null;
    posY: number;
    //记录渐入浅出起始时间
    markFadeOriTime: number;

    setLabel(content: string) {
        this.labelI18N.key = content;
        this.labelI18N.translate();
        //@ts-ignore
        this.labelI18N.node.getComponent(cc.Label)._forceUpdateRenderData();
        let layout = this.node.getComponent(cc.Layout);
        // layout.type = cc.Layout.Type.NONE;
        layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        layout.updateLayout();
        
    }
    reset() {
        //this.setLabel("");
        this.node.stopAllActions();
        this.node.opacity = 255;
    }

}
