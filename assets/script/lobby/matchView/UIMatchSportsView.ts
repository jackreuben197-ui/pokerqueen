import List from "../../common/List";
import UIBase from "../../ui/UIBase";
import { TMatchSportsDataType } from "./MatchViewConfig";
import UIMatchSportsItem from "./UIMatchSportsItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/matchView/UIMatchSportsView')
export default class UIMatchSportsView extends UIBase {

    private list: List = null;


    private _data: Array<TMatchSportsDataType> = [
        { bgPath: "sports_1", name: "体育明星", url: "url:name1" },
        { bgPath: "sports_2", name: "体育明星", url: "url:name2" },
        { bgPath: "sports_3", name: "体育明星", url: "url:name3" },
    ]

    protected lateLoad(): void {
        super.lateLoad();
        this.list = this.getChildNodeOrComponent("list", List);
    }

    onShow() {
        super.onShow();

        this.list.numItems = this._data.length;
    }



    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(UIMatchSportsItem);
        item.initData(this._data[index]);
    }


}