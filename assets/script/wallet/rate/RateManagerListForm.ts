import ComFormTitle from "../../common/ComFormTitle";
import List from "../../common/List";
import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import RateModel from "../../frame/data/rate/RateModel";
import GC from "../../frame/GameControl";
import { Web_Rate_Api } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import RateSetItem from "./RateSetItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/rate/RateManagerListForm')
export default class RateManagerListForm extends UIBase {
    private comFormTitle: ComFormTitle = null;
    private list: List = null;
    private emptyNode: cc.Node = null;


    private _rate: RateModel = null;
    onLoad() {
        super.onLoad();
        this._rate = GC.data.rate.rate;
    }

    lateLoad() {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.list = this.getChildNodeOrComponent("list", List);
        this.emptyNode = this.getChildNodeOrComponent("emptyNode");
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.addRateItem, this.updateList);
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_Rate_Api.GET_RATE_LIST: {
                if (sendInfo.config_type == 2) {
                    this.updateList();
                }
            } break;
            case Web_Rate_Api.DELETE_CLUB_RATE: {
                this.updateList();
            } break;
        }
    }

    onShow(param?: any, fromUI?: any): void {
        super.onShow(param, fromUI);

        this.comFormTitle.initData("UITitle_RateSet", this);
        GC.data.rate.reqRateList(false);
    }

    updateList() {
        let list = this._rate.getList(false);
        this.setActive(this.emptyNode, list.length == 0);
        this.list.numItems = this._rate.getList(false).length;
    }

    onRender(node: cc.Node, index: string) {
        let item = node.getComponent(RateSetItem);
        item.initData(this._rate.getList(false)[index]);
    }

    clickAdd() {
        UIComponent.open(UIDefine.EditRateForm);
    }
}