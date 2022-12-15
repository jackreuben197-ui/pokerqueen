import { Web_Mtt } from "../../../net/https/WebRequest";
import { BaseData } from "../../base/BaseData";
import GC from "../../GameControl";
import MttDetailModel from "./MttDetailModel";
import MttListModel from "./MttListModel";
import MttRealTimeModel from "./realTime/MttRealTimeModel";

export default class MttData extends BaseData {
    list: MttListModel = new MttListModel();
    realTime: MttRealTimeModel = new MttRealTimeModel();
    detail: MttDetailModel = new MttDetailModel();
    protected notify(id: string, msg: any, sendInfo?: any): void {
        // id = id.replace(/(?<=mtt\/)\d+/g, "{0}");
        id = id.replace(/\d+/, "{0}")
        switch (id) {
            case Web_Mtt.LIST: {
                this.list.updateData(msg);
                GC.notify.post(Web_Mtt.LIST)
            } break;
            case Web_Mtt.RANKS: {
                this.realTime.updateRankList(msg);
                GC.notify.post(Web_Mtt.RANKS)
            } break;
            case Web_Mtt.DETAIL: {
                this.detail.updateData(msg);
                GC.notify.post(Web_Mtt.DETAIL)
            } break;
            case Web_Mtt.REAL_PRIZE: {
                this.realTime.updateRealPrize(msg);
                GC.notify.post(Web_Mtt.REAL_PRIZE)
            } break;
            case Web_Mtt.ROOMS: {
                this.realTime.updateRooms(msg);
                GC.notify.post(Web_Mtt.ROOMS)
            } break;
        }
    }

    reqMttList(offset: number = 0, limit: number = 10) {
        this.reqServePost(Web_Mtt.LIST, { limit: limit, offset: offset });
    }

    reqMttDetail() {
        let api = GC.language.formatString(Web_Mtt.DETAIL, this.list.select.match_id);
        this.reqServePost(api);
    }

    reqRealTimeRankList(offset: number = 0, limit: number = 10) {
        let api = GC.language.formatString(Web_Mtt.RANKS, this.list.select.match_id);
        this.reqServePost(api, { limit: limit, offset: offset });
    }

    reqRealTimeRooms(offset: number = 0, limit: number = 10) {
        let api = GC.language.formatString(Web_Mtt.ROOMS, this.list.select.match_id);
        this.reqServePost(api, { limit: limit, offset: offset });
    }

    reqRealTimeRealPrize() {
        let api = GC.language.formatString(Web_Mtt.REAL_PRIZE, this.list.select.match_id);
        this.reqServePost(api);
    }
}