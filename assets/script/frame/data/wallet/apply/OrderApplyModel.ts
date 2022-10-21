import { EOrderType } from "../../../../config/EEnumConfig";
import GC from "../../../GameControl";
import OrderApplyItemModel from "./OrderApplyItemModel";

export default class OrderApplyModel {
    private _reqing: boolean = false;
    private _reqEnd: boolean = false;

    private _offset: number = 0;

    private _list: Array<OrderApplyItemModel> = [];
    private _type: EOrderType = EOrderType.chongzhi;
    get list() {
        return this._list;
    }

    get canReq() {
        return !this._reqEnd && !this._reqing;
    }

    resetData() {
        this._list.length = 0;
        this._reqing = false;
        this._reqEnd = false;
        this._offset = 0;
    }

    dropDownReq() {
        if (!this._reqing && !this._reqEnd) {
            this.reqList(this._offset, this._type);
        }
    }

    reqList(offset: number = 0, type: EOrderType = EOrderType.chongzhi) {
        this._reqing = true;
        this._type = type;
        if (offset == 0) {
            this.resetData();
        }
        GC.data.wallet.reqOrderApplyList(type, offset);
    }

    updateItem(msg: any) {

    }

    updateData(msg: any) {
        this._reqing = false;

        msg.list.forEach(item => {
            this._list.push(new OrderApplyItemModel(item))
        })

        this._offset = this._list.length
        this._reqEnd = this._list.length >= msg.total;
    }
}