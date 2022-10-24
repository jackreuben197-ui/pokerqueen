import UIBase from "../../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/mtt/realTime/MttRealTime')
export default class MttRealTime extends UIBase {
    lateLoad() {
        super.lateLoad();

    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    onShow(param?: any): void {
        super.onShow(param);
    }

    onRender(node: cc.Node, index: number) {
        
    }
}