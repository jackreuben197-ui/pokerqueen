import UIBase from "../../ui/UIBase";
import MttRealTimeBlindItem from "./MttRealTimeBlindItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/mtt/realTime/MttRealTimeBlindsNode')
export default class MttRealTimeBlindsNode extends UIBase {
    lateLoad() {
        super.lateLoad();

    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    initData() {

    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(MttRealTimeBlindItem);
        item.initData();
    }
}