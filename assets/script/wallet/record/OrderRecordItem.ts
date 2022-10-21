import ListItem from "../../common/ListItem";
import OrderRecordItemModel from "../../frame/data/wallet/record/OrderRecordItemModel";
import GC from "../../frame/GameControl";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/record/OrderRecordItem')
export default class OrderRecordItem extends ListItem {
    private order: cc.Label = null;
    private num: cc.Label = null;
    private status: cc.Label = null;
    private time: cc.Label = null;

    private _data: OrderRecordItemModel = null;
    lateLoad() {
        super.lateLoad();
        this.order = this.getChildNodeOrComponent("order", cc.Label);
        this.num = this.getChildNodeOrComponent("num", cc.Label);
        this.status = this.getChildNodeOrComponent("status", cc.Label);
        this.time = this.getChildNodeOrComponent("time", cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    initData(data: OrderRecordItemModel) {
        this._data = data;

        this.initView();
    }

    initView() {
        this.setText(this.order, GC.language.getStrByLen(this._data.order, 8));
        this.setText(this.num, this._data.goldNum)
        this.setText(this.status, GC.language.getLocal(`UIOrder_Apply_Status_${this._data.status}`));
        this.setText(this.time, this._data.time)
    }
}