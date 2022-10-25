import { TMttRankItem } from "../../../../config/TTypeConfig";
import GC from "../../../GameControl";

export default class MttRealTimeRankItemModel {
    private _msg: TMttRankItem = null;
    constructor(msg: TMttRankItem) {
        this._msg = msg;
    }

    //排名
    get rank(): number {
        return this._msg.rank
    }
    //记分牌
    get chip(): number {
        return this._msg.chip
    }
    //桌号
    get rid(): number {
        return this._msg.rid
    }
    //名字
    get name(): string {
        return GC.data.languageTemp.temp.getName(this._msg.name)
        // return this._msg.name
    }

    get isMySelf() {
        return this._msg.urid == GC.data.user.info.user_id;
    }

}