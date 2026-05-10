import { TClubGoldChangeLogItem, TUserGoldChangeLogItem } from '../../../../config/TTypeConfig';
import GC from '../../../GameControl';

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
        let key = ['UITexasInfo_Texas', 'UITexasInfo_mtt', 'UIData_YGvXd5iXr_011'][this.src_type - 1];
        let str = GC.language.getLocal(key);
        if (this._base.name) {
            str += '·';
            str += GC.data.languageTemp.temp.getName(this._base.name);
        }
        return str;
    }

    get opName() {
        let str = GC.language.getLocal(`OpCodeString_${this.op_code}`);
        if (this.src_type != 0) {
            str += ` ${this.name}`;
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
        return Math.floor(this._base.gold_before) / 100;
    }

    get gold_change() {
        return Math.floor(this._base.gold_change) / 100;
    }

    get gold_after() {
        return Math.floor(this._base.gold_after) / 100;
    }

    get gold_lock_before() {
        return Math.floor(this._base.gold_lock_before) / 100;
    }

    get gold_lock_change() {
        return Math.floor(this._base.gold_lock_change) / 100;
    }

    get gold_lock_after() {
        return Math.floor(this._base.gold_lock_after) / 100;
    }

    get create_time() {
        return new Date(this._base.create_time).getTime() / 1000;
    }

    get changeNum() {
        return this.gold_change || this.gold_lock_change;
    }
}
