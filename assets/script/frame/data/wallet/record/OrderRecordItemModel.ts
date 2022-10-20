import { TOrderRecordItem } from "../../../../config/TTypeConfig";

export default class OrderRecordItemModel {
    private _msg: TOrderRecordItem = null;
    constructor(msg: TOrderRecordItem) {
        this._msg = msg;
    }
}