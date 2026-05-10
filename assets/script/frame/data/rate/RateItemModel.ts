import { TRateConfig, TRateItem } from '../../../config/TTypeConfig';
import GC from '../../GameControl';

export default class RateItemModel {
    private _msg: TRateItem = null;
    private _fromCfg: TRateConfig = null;
    private _cfg: TRateConfig = null;

    constructor(msg: any) {
        this.updateData(msg);
    }

    updateData(msg: any) {
        this._msg = msg;
        this._fromCfg = GC.data.rate.rate.getCfg(this._msg.from_currency);
        this._cfg = GC.data.rate.rate.getCfg(this._msg.to_currency);
    }

    updateRate(msg: any) {
        this._msg.to_rate = msg.to_rate;
    }

    get id() {
        return this._msg.id;
    }

    get fromPath() {
        return this._fromCfg.path;
    }

    get fromRate() {
        return this._msg.from_rate;
    }

    get fromCountry() {
        return this._fromCfg.country;
    }

    get fromFlag() {
        return this._fromCfg.flag;
    }

    get fromDesc() {
        return this._fromCfg.desc;
    }

    get path() {
        return this._cfg.path;
    }

    get rate() {
        return this._msg.to_rate;
    }

    get country() {
        return this._cfg.country;
    }

    get flag() {
        return this._cfg.flag;
    }

    get desc() {
        return this._cfg.desc;
    }

    changeToNum(num) {
        return Math.floor(num * this.rate * 100) / 100;
    }
}
