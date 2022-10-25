import { EMTTGameType, EMttItemStatus } from "../../../config/EEnumConfig";
import { TMttListItem } from "../../../config/TTypeConfig";
import GC from "../../GameControl";

export default class MttListItemModel {
    private _msg: TMttListItem = null;
    private _startTime: number = 0;
    private _upblindInterval: number = 0;
    private _maxDelayApplyBl: number = 0;
    constructor(msg: TMttListItem) {
        this._msg = msg;
        this._startTime = new Date(this._msg.start_time).getTime() / 1000;
        this._upblindInterval = new Date(this._msg.upblind_interval).getTime() / 1000;
        this._maxDelayApplyBl = new Date(this._msg.max_delay_apply_bl).getTime() / 1000;
    }

    get mttName() {
        return GC.data.languageTemp.temp.getName(this._msg.name);
    }
    get match_id() {
        return this._msg.match_id;
    }
    get type() {
        return this._msg.type;
    }
    get poker_type() {
        return this._msg.poker_type;
    }
    get game_type() {
        return this._msg.game_type
    }
    get start_time(): number {
        return this._startTime;
    }
    get upblind_interval() {
        return this._upblindInterval;
    }
    get max_delay_apply_bl() {
        return this._maxDelayApplyBl;
    }

    // 状态 0 无法报名 1: 报名中 2: 参与中
    get bought() {
        return this._msg.bought;
    }

    // 盲注类型 0-快速赛/1-锦标赛/2-豪克塞/3-免费赛/4-110滚雪球赛/5-每日票赛/6-特色赛事880滚雪球赛/7-最新免费赛/8-周1.2特色赛事/9-周3特色赛/10-周4.5特色赛事/11-周六特色赛事/12-周末特色赛事
    get blindtable_type(): EMTTGameType {
        return this._msg.blindtable_type;
    }


    //参与人数
    get participants() {
        return this._msg.participants;
    }
    // 活跃人数
    get alive() {
        return this._msg.alive;
    }
    get status(): EMttItemStatus {
        return this._msg.status;
    }
    set status(s) {
        this._msg.status = s;
    }

    //奖金
    get prize_base_pool() {
        return Math.floor(this._msg.prize_base_pool) / 100;
    }
    get apply_fee_pool() {
        return Math.floor(this._msg.apply_fee_pool) / 100;
    }
    get apply_fee_service() {
        return Math.floor(this._msg.apply_fee_service) / 100;
    }
    get apply_fee_hunter() {
        return Math.floor(this._msg.apply_fee_hunter) / 100;
    }
    //买入值
    get buyIn() {
        return this.apply_fee_pool + this.apply_fee_service + this.apply_fee_hunter;
    }

    // 截止延迟报名时间
    get delayApplyEndTime() {
        return this.start_time + this.upblind_interval * this.max_delay_apply_bl;
    }

}