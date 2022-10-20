import List from "../../common/List";
import { UIDefine } from "../../define/UIDefine";
import RateItemModel from "../../frame/data/rate/RateItemModel";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import LookRateListItem from "./LookRateListItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/rate/LookRateListDlg')
export default class LookRateListDlg extends UIBase {
    private listNode: cc.Node = null;
    private list: List = null;
    private empty: cc.Node = null;

    private _data: Array<RateItemModel> = [];
    lateLoad() {
        super.lateLoad();
        this.listNode = this.getChildNodeOrComponent("listNode");
        this.empty = this.getChildNodeOrComponent("empty");
        this.list = this.getChildNodeOrComponent("list", List);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    onShow(data: Array<RateItemModel>): void {
        super.onShow(data);
        this._data = data;

        this.initView();
    }

    initView() {
        this.setActive(this.listNode, this._data.length);
        this.setActive(this.empty, !this._data.length);
        this.list.numItems = this._data.length;
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(LookRateListItem);
        item.initData(this._data[index])
    }

    clickSure() {
        UIComponent.close(this.UIDefine);
    }
}