/*
 * @Author: xfj
 * @Date: 2022-12-19 15:49:57
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-30 21:45:45
 * @FilePath: /pokerqueen/assets/script/frame/data/mtt/MttData.ts
 */
import { Web_Mtt } from "../../../net/https/WebRequest";
import { BaseData } from "../../base/BaseData";
import GC from "../../GameControl";
import { ClubCache } from "../club/ClubCache";
import MttDetailModel from "./MttDetailModel";
import MttListModel from "./MttListModel";
import MttRealTimeModel from "./realTime/MttRealTimeModel";

export default class MttData extends BaseData {
    list: MttListModel = new MttListModel();
    realTime: MttRealTimeModel = new MttRealTimeModel();
    detail: MttDetailModel = new MttDetailModel();
    user_wallet: any = [];
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
            case Web_Mtt.USER_WALLET: {
                this.user_wallet = (msg);
                GC.notify.post(Web_Mtt.USER_WALLET)
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
    // reqUserWallet(offset: number = 0, limit: number = 10) {
    //     let api = GC.language.formatString(Web_Mtt.USER_WALLET, this.list.select.match_id);
    //     this.reqServePost(api, { club_id: ClubCache.club_id, limit: limit, offset: offset });
    // }
}