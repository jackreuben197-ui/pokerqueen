import { Web_Club_Gold_Change_Log, Web_Org_Club_Get, Web_User_Gold_Change_Log } from "../../../net/https/WebRequest";
import { BaseData } from "../../base/BaseData";
import GoldChangeLogModel from "./goldChangeLog/GoldChangeLogModel";

export default class WalletData extends BaseData {
    goldChangeLogs: GoldChangeLogModel = new GoldChangeLogModel();

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_User_Gold_Change_Log.API: {
                this.goldChangeLogs.updateData(msg, false);
            } break;
            case Web_Club_Gold_Change_Log.API: {
                this.goldChangeLogs.updateData(msg, true);
            } break;
            default:
                break;
        }
    }




    reqUserGoldChangeLog(offset: number = 0, limit: number = 10) {
        this.reqServePost(Web_User_Gold_Change_Log.API, { limit: limit, offset: offset })
    }

    reqClubGoldChangeLog(offset: number = 0, limit: number = 10) {
        this.reqServePost(Web_Club_Gold_Change_Log.API, { limit: limit, offset: offset, club_random_id: Web_Org_Club_Get.Response.data.random_id })
    }
}