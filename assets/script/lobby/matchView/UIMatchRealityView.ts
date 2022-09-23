import List from "../../common/List";
import UIBase from "../../ui/UIBase";
import { TMatchRealityDataType } from "./MatchViewConfig";
import UIMatchRealityItam from "./UIMatchRealityItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/matchView/UIMatchRealityView')
export default class UIMatchRealityView extends UIBase {
    private list: List = null;

    private _data: Array<TMatchRealityDataType> = [
        { bgPath: "realityIcon_1", name: "炸金花", url: "url:炸金花" },
        { bgPath: "realityIcon_2", name: "牛牛", url: "url:牛牛" },
        { bgPath: "realityIcon_3", name: "三公", url: "url:三公" },
        { bgPath: "realityIcon_4", name: "龙虎斗", url: "url:龙虎斗" },
        { bgPath: "realityIcon_5", name: "21点", url: "url:21点" },
        { bgPath: "realityIcon_6", name: "轮盘", url: "url:轮盘" },

    ]

    protected lateLoad(): void {
        super.lateLoad();
        this.list = this.getChildNodeOrComponent("list", List);
    }

    onShow(param?: any): void {
        super.onShow(param);

        this.list.numItems = this._data.length;
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(UIMatchRealityItam);
        item.initData(this._data[index])
    }
}