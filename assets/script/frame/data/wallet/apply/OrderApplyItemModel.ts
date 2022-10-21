import { EApplyStatus, EOrderType } from "../../../../config/EEnumConfig";
import { TOrderApplyItem } from "../../../../config/TTypeConfig";

export default class OrderApplyItemModel {
    private _msg: TOrderApplyItem = null;
    constructor(msg: TOrderApplyItem) {
        this._msg = msg;
    }


    get user_id() {
        return this._msg.user_id;
    }
    get order_no() {
        return this._msg.order_no;
    }
    get order_type(): EOrderType {
        return this._msg.order_type;
    }
    get gold_num() {
        return Math.floor(this._msg.gold_num)/100;
    }
    get status(): EApplyStatus {
        return this._msg.status;
    }
    get update_time() {
        return this._msg.update_time;
    }
    get desc() {
        return this._msg.desc;
    }
    get nickname() {
        return this._msg.nickname;
    }
    get avatar() {
        return this._msg.avatar;
    }
}