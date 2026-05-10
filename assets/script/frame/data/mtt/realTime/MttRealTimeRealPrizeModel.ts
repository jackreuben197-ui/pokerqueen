import { TMttRealPrizeData } from '../../../../config/TTypeConfig';

export default class MttRealTimeRealPrizeModel {
    private _msg: TMttRealPrizeData = null;

    updateData(msg: TMttRealPrizeData) {
        this._msg = msg;
    }

    //总奖池
    get award() {
        return Math.floor(this._msg.award) / 100;
    }

    //奖励圈人数
    get award_num() {
        return this._msg.award_num;
    }

    get prizes() {
        return this._msg.prizes;
    }
}
