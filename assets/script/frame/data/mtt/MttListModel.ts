import GC from "../../GameControl";
import MttListItemModel from "./MttListItemModel";

export default class MttListModel {
    private _reqing: boolean = false;
    private _reqEnd: boolean = false;

    private _offset: number = 0;

    private _list: Array<MttListItemModel> = [];
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
            this.reqList(this._offset);
        }
    }

    reqList(offset: number = 0) {
        this._reqing = true;
        if (offset == 0) {
            this.resetData();
        }
        GC.data.mtt.reqMttList(offset);
    }

    updateData(msg: any) {
        this._reqing = false;

        msg.records.forEach(item => {
            this._list.push(new MttListItemModel(item))
        })

        this._offset = this._list.length
        this._reqEnd = this._list.length >= msg.total;
    }
}