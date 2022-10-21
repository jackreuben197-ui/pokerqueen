import { EApplyStatus } from "../../../../config/EEnumConfig";
import { TOrderRecordItem } from "../../../../config/TTypeConfig";

export default class OrderRecordItemModel {
    private _msg: TOrderRecordItem = null;
    constructor(msg: TOrderRecordItem) {
        this._msg = msg;
    }

    get order() {
        return this._msg.order_no;
    }
    get orderType() {
        return this._msg.order_type;
    }

    get goldNum() {
        return Math.floor(this._msg.gold_num)/100;
    }

    get status():EApplyStatus {
        return this._msg.status;
    }

    get time() {
        return this._msg.create_time;
    }

}