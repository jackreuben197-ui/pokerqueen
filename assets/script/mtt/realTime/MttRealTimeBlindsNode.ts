import List from "../../common/List";
import GC from "../../frame/GameControl";
import UIBase from "../../ui/UIBase";
import MttRealTimeBlindItem from "./MttRealTimeBlindItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/mtt/realTime/MttRealTimeBlindsNode')
export default class MttRealTimeBlindsNode extends UIBase {
    private list: List = null;

    private _data: Array<any> = [];
    lateLoad() {
        super.lateLoad();
        this.list = this.getChildNodeOrComponent("list", List);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    initData() {
        this._data = GC.data.mtt.realTime.blinds.list;
        this.list.numItems = this._data.length;
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(MttRealTimeBlindItem);
        item.initData(this._data[index]);
    }
}