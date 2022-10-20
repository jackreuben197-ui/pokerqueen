import { EOrderRecordType } from "../../../../config/EEnumConfig";
import { TListStepReq, TOrderRecords } from "../../../../config/TTypeConfig";
import GC from "../../../GameControl";
import OrderRecordItemModel from "./OrderRecordItemModel";

export default class OrderRecordModel {
    private _reccords: Map<EOrderRecordType, Array<OrderRecordItemModel>> = new Map();
    private _status: Map<EOrderRecordType, TListStepReq> = new Map();
    private _isCLub: boolean = false;
    getList(type: EOrderRecordType) {
        let list = this._reccords.get(type);
        if (!list) {
            list = [];
            this._reccords.set(type, list);
        }
        return list;
    }

    getStatus(type: EOrderRecordType) {
        let status = this._status.get(type);
        if (!status) {
            status = { reqing: false, reqEnd: false, offset: 0 };
            this._status.set(type, status);
        }
        return status;
    }

    canReq(type: EOrderRecordType) {
        let status = this.getStatus(type);
        return !status.reqEnd && !status.reqing;
    }

    resetData() {
        this._reccords.clear();
        this._status.clear();
    }

    dropDownReq(type: EOrderRecordType) {
        let status = this.getStatus(type);
        if (!status.reqing && !status.reqEnd) {
            this.reqRecords(type);
        }
    }

    reqRecords(type: EOrderRecordType, isClub: boolean = this._isCLub) {
        let status = this.getStatus(type);
        status.reqing = true
        this._isCLub = isClub;
        if (status.offset == 0) {
            this.getList(type).length = 0;
        }
        GC.data.wallet.reqOrderRecord(type, status.offset, this._isCLub);
    }

    updateData(msg: TOrderRecords, type: EOrderRecordType) {
        let status = this.getStatus(type);
        status.reqing = false;

        let list = this.getList(type);
        msg.list.forEach(record => {
            list.push(new OrderRecordItemModel(record))
        })

        status.offset = list.length
        status.reqEnd = list.length >= msg.total;
    }
}