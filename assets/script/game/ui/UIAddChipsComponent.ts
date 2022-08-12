/**
 * 坐下弹出面板
 */

import UIBase from "../../ui/UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIAddChipsComponent extends UIBase {

    Slider: cc.Slider = null;
    Image_Dialog: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.Slider = this.getChildNodeOrComponent("Slider", cc.Slider);
    }
    onShow(param?: any): void {
        super.onShow(param);
        this.animateDialog();
        this.Slider.progress = 0;
    }
    animateDialog() {
        this.Image_Dialog.scale = 0;
        cc.tween(this.Image_Dialog).to(.2, { scale: 1 }, cc.easeBackOut()).start();
    }
}
