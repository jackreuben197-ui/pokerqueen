import { TMttDetailData } from "../../../config/TTypeConfig";

export default class MttDetailModel {
    private _msg: TMttDetailData = null;
    updateData(msg: TMttDetailData) {
        this._msg = msg;
    }


    /// 最大记分牌
    get top() {
        return Math.floor(this._msg.top) / 100;
    }
    /// 存活人数
    get alive() {
        return this._msg.alive;
    }
    //总买入次数
    get total_buy_time() {
        return this._msg.mtt.total_buy_times
    }
    //奖池
    get prize_pool() {
        return Math.floor(this._msg.more.prize_pool) / 100;
    }
    //当前小盲
    get sb() {
        return Math.floor(this._msg.more.sb) / 100;
    }
    //下一小盲
    get nsb() {
        return Math.floor(this._msg.more.nsb) / 100;
    }

    //升盲时间间隔
    get upblind_interval() {
        return this._msg.mtt.upblind_interval;
    }


}