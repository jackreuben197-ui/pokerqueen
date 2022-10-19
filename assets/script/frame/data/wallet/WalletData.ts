import { Web_Gold_Change_Log, Web_Org_Club_Get } from "../../../net/https/WebRequest";
import { BaseData } from "../../base/BaseData";
import GoldChangeLogModel from "./goldChangeLog/GoldChangeLogModel";

export default class WalletData extends BaseData {
    goldChangeLogs: GoldChangeLogModel = new GoldChangeLogModel();

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_Gold_Change_Log.User: {
                this.goldChangeLogs.updateData(msg, false);
            } break;
            case Web_Gold_Change_Log.Club: {
                this.goldChangeLogs.updateData(msg, true);
            } break;
            default:
                break;
        }
    }




    reqUserGoldChangeLog(offset: number = 0, limit: number = 5) {
        this.reqServePost(Web_Gold_Change_Log.User, { limit: limit, offset: offset })
    }

    reqClubGoldChangeLog(offset: number = 0, limit: number = 5) {
        this.reqServePost(Web_Gold_Change_Log.Club, { limit: limit, offset: offset, club_random_id: Web_Org_Club_Get.Response.data.random_id })
    }
}