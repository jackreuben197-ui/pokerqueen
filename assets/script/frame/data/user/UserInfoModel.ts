import { EventName } from "../../../config/EventName";
import { TUserInfo } from "../../../config/TTypeConfig";
import GC from "../../GameControl";

export default class UserInfoModel {
    private _msg: TUserInfo = null;
    updateData(msg: TUserInfo) {
        this._msg = msg;
        GC.notify.post(EventName.myGoldChange);
    }


    get user_id() {
        return this._msg.user_id;
    }

    get area() {
        return this._msg.area;
    }
    get phone() {
        return this._msg.phone;
    }
    get status() {
        return this._msg.status;
    }
    get forbid() {
        return this._msg.forbid;
    }
    get lc() {
        return this._msg.lc;
    }
    get lt() {
        return this._msg.lt;
    }
    get ut() {
        return this._msg.ut;
    }
    get forbid_bring_in() {
        return this._msg.forbid_bring_in;
    }
    get forbid_withdraw_gold() {
        return this._msg.forbid_withdraw_gold;
    }
    get limit() {
        return this._msg.limit;
    }
    get description() {
        return this._msg.description;
    }
    get ub_operator_id() {
        return this._msg.ub_operator_id;
    }
    get w_u_id() {
        return this._msg.w_u_id;
    }

    get wallet_status() {
        return this._msg.wallet_status;
    }
    get p_u_id() {
        return this._msg.p_u_id;
    }
    get un_id() {
        return this._msg.un_id;
    }
    get nickname() {
        return this._msg.nickname;
    }
    get avatar() {
        return this._msg.avatar;
    }
    get sex() {
        return this._msg.sex;
    }
    get birthday() {
        return this._msg.birthday;
    }
    get country() {
        return this._msg.country;
    }
    get city() {
        return this._msg.city;
    }
    get province() {
        return this._msg.province;
    }
    get platform() {
        return this._msg.platform;
    }
    get mnt() {
        return this._msg.mnt;
    }
    get mat() {
        return this._msg.mat;
    }
    get operator_id() {
        return this._msg.operator_id;
    }
    get vip() {
        return this._msg.vip;
    }
    get vip_endtime() {
        return this._msg.vip_endtime;
    }

    get gold_lock() {
        return this._msg.gold_lock;
    }
    set gold_lock(g) {
        this._msg.gold_lock = g;
    }

    //后端返回的金币，是*100后的值
    get displayGold() {
        return Math.floor(this.gold) / 100;
    }
    get gold() {
        return this._msg.gold;
    }
    set gold(g) {
        this._msg.gold = g;
        GC.notify.post(EventName.myGoldChange);
    }

    //{"flow_id":1835678,"wallet":{"gold":100,"gold_lock":200,"forbidden":false}}
    goldTiquApplySuc(msg: any) {
        this.gold = msg.wallet.gold;
        this.gold_lock = msg.wallet.gold_lock;
    }

}

