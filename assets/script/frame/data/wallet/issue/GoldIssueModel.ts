import { TClubGoldChangeLogs, TIssueUserList } from "../../../../config/TTypeConfig";
import GC from "../../../GameControl";
import GoldIssueItemModel from "./GoldIssueItemModel";

export default class GoldIssueModel {
    private _reqing: boolean = false;
    private _reqEnd: boolean = false;

    private _offset: number = 0;

    private _list: Array<GoldIssueItemModel> = [];
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

    dropDownReq(isClub: boolean = false) {
        if (!this._reqing && !this._reqEnd) {
            this.reqUsers(this._offset);
        }
    }

    reqUsers(offset: number = 0) {
        this._reqing = true;
        if (offset == 0) {
            this.resetData();
        }
        GC.data.wallet.reqIssueList(offset);

    }

    searchUser(search) {
        this.resetData();
        GC.data.wallet.reqIssueSearchUser(search);
    }

    updateData(msg: TIssueUserList) {
        this._reqing = false;

        msg.list.forEach(item => {
            this._list.push(new GoldIssueItemModel(item))
        })

        this._offset = this._list.length
        this._reqEnd = this._list.length >= msg.total;
    }
}