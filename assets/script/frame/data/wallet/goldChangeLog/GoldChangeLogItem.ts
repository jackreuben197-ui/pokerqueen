import { TClubGoldChangeLogItem, TUserGoldChangeLogItem } from "../../../../config/TTypeConfig";
import GC from "../../../GameControl";

export default class GoldChangeLogItem {
    private _displayTime: boolean = false;
    get displayTime() {
        return this._displayTime;
    }
    set displayTime(t) {
        this._displayTime = t;
    }

    private _base: TClubGoldChangeLogItem | TUserGoldChangeLogItem = null;
    constructor(base: TClubGoldChangeLogItem | TUserGoldChangeLogItem) {
        this._base = base;
    }

    get user_id() {
        return this._base.user_id;
    }
    get src_type() {
        return this._base.src_type;
    }
    get src_room_id() {
        return this._base.src_room_id;
    }
    get src_match_id() {
        return this._base.src_match_id;
    }
    get name() {
        let str = "";
        if (this.src_type == 0) {
            let key = this.gold_change > 0 ? "Text_Add" : "Text_Getchips";
            return GC.language.getLocal(key);
        } else {
            let key = ["UITexasInfo_Texas", "UITexasInfo_mtt", "UIData_YGvXd5iXr_011"][this.src_type - 1];
            str = GC.language.getLocal(key);
            if (this._base.name) {
                str += "_"
                str += GC.data.languageTemp.temp.getName(this._base.name)
            }
        }
        return str;
    }
    get op_id() {
        return this._base.op_id;
    }
    get op_code() {
        return this._base.op_code;
    }
    get gold_before() {
        return this._base.gold_before;
    }
    get gold_change() {
        return this._base.gold_change;
    }
    get gold_after() {
        return this._base.gold_after;
    }
    get gold_lock_before() {
        return this._base.gold_lock_before;
    }
    get gold_lock_change() {
        return this._base.gold_lock_change;
    }
    get gold_lock_after() {
        return this._base.gold_lock_after;
    }
    get create_time() {
        return new Date(this._base.create_time).getTime() / 1000;
    }



}