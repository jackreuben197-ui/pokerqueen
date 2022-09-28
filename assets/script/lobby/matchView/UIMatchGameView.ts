import List from "../../common/List";
import UIBase from "../../ui/UIBase";
import { TMatchGameDataType } from "./MatchViewConfig";
import UIMatchGameItam from "./UIMatchGameItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/matchView/UIMatchGameView')
export default class UIMatchGameView extends UIBase {
    private searchEdit: cc.EditBox = null;
    private searchBtn: cc.Node = null;
    private list: List = null;

    private _data: Array<TMatchGameDataType> = [
        { bgPath: "gameCardIcon_1", name: "大鲨鱼", url: "url:大鲨鱼" },
        { bgPath: "gameCardIcon_2", name: "体育明星", url: "url:体育明星" },
        { bgPath: "gameCardIcon_3", name: "Black J", url: "url:Black J" },
        { bgPath: "gameCardIcon_4", name: "21点", url: "url:21点" },
        { bgPath: "gameCardIcon_5", name: "炸金花", url: "url:炸金花" },
        { bgPath: "gameCardIcon_6", name: "消消乐", url: "url:消消乐" },
        { bgPath: "gameCardIcon_7", name: "老虎机", url: "url:老虎机" },
        { bgPath: "gameCardIcon_1", name: "大鲨鱼2", url: "url:大鲨鱼2" },
        { bgPath: "gameCardIcon_2", name: "体育明星2", url: "url:体育明星2" },
        { bgPath: "gameCardIcon_3", name: "Black J2", url: "url:Black J2" },
        { bgPath: "gameCardIcon_4", name: "21点2", url: "url:21点2" },
        { bgPath: "gameCardIcon_5", name: "炸金花2", url: "url:炸金花2" },
        { bgPath: "gameCardIcon_6", name: "消消乐2", url: "url:消消乐2" },
        { bgPath: "gameCardIcon_7", name: "老虎机2", url: "url:老虎机2" },
    ]

    private _searchData: Array<TMatchGameDataType> = [];
    protected lateLoad(): void {
        super.lateLoad();
        this.searchEdit = this.getChildNodeOrComponent("searchEdit", cc.EditBox);
        this.searchBtn = this.getChildNodeOrComponent("searchFlag");
        this.list = this.getChildNodeOrComponent("list", List);
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.searchBtn, this.clickSearch);
    }

    onShow(param?: any): void {
        super.onShow(param);

        this.initView();
    }

    initView() {
        this.searchEdit.string = "";
        this._searchData = this._data;
        this.list.numItems = this._searchData.length;
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(UIMatchGameItam);
        item.initData(this._searchData[index]);
    }

    clickSearch() {
        this._searchData = this._data;
        let str = this.searchEdit.string.trim();
        if (str) {
            this._searchData = this._searchData.filter(data => data.name.includes(str));
        }
        this.list.numItems = this._searchData.length;
    }
}