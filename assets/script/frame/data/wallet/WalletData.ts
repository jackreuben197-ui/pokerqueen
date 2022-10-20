import { EOrderRecordType } from "../../../config/EEnumConfig";
import { Web_Gold_Change_Log, Web_Order_Rcords, Web_Org_Club_Get } from "../../../net/https/WebRequest";
import { BaseData } from "../../base/BaseData";
import GoldChangeLogModel from "./goldChangeLog/GoldChangeLogModel";
import OrderRecordModel from "./record/OrderRecordModel";

export default class WalletData extends BaseData {
    goldChangeLogs: GoldChangeLogModel = new GoldChangeLogModel();
    orderRecord: OrderRecordModel = new OrderRecordModel();;

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_Gold_Change_Log.User: {
                this.goldChangeLogs.updateData(msg, false);
            } break;
            case Web_Gold_Change_Log.Club: {
                this.goldChangeLogs.updateData(msg, true);
            } break;
            case Web_Order_Rcords.USER_RECORD: {
                this.orderRecord.updateData(msg, sendInfo.order_type);
            } break;
            case Web_Order_Rcords.CLUB_RECORD: {

            } break;
            default:
                break;
        }
    }




    reqUserGoldChangeLog(offset: number = 0, limit: number = 10) {
        this.reqServePost(Web_Gold_Change_Log.User, { limit: limit, offset: offset })
    }

    reqClubGoldChangeLog(offset: number = 0, limit: number = 10) {
        this.reqServePost(Web_Gold_Change_Log.Club, { limit: limit, offset: offset, club_random_id: Web_Org_Club_Get.Response.data.random_id })
    }

    reqOrderRecord(type: EOrderRecordType, offset: number = 0, isClub: boolean, limit: number = 25) {
        let sendData: any = { limit: limit, offset: offset, order_type: type };
        if (!isClub) {
            sendData = { limit: limit, offset: offset, order_type: type, user_type: 1 };
        }
        let api = isClub ? Web_Order_Rcords.CLUB_RECORD : Web_Order_Rcords.USER_RECORD;
        this.reqServePost(api, sendData);
    }
}