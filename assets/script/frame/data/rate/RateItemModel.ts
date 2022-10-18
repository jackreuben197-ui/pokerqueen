import { TRateConfig, TRateItem } from "../../../config/TTypeConfig";
import GC from "../../GameControl";

export default class RateItemModel {
    private _msg: TRateItem = null;
    private _cfg: TRateConfig = null;
    constructor(msg: any) {
        this.updateData(msg);
    }
    updateData(msg: any) {
        this._msg = msg;
        this._cfg = GC.data.rate.rate.getCfg(this._msg.to_currency);
    }

    updateRate(msg: any) {
        this._msg.to_rate = msg.to_rate;
    }

    get id() {
        return this._msg.id;
    }
    get rate() {
        return this._msg.to_rate;
    }

    get path() {
        return this._cfg.path;
    }

    get country() {
        return this._cfg.country;
    }

    get flag() {
        return this._cfg.flag;
    }

    changeToNum(num) {
        return Math.floor(num * this.rate * 100) / 100;
    }


}