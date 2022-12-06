/*
 * @Author: xfj
 * @Date: 2022-10-24 10:50:41
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-06 13:42:51
 * @FilePath: /pokerqueen/assets/script/frame/data/wallet/WalletData.ts
 */
import { EOrderOprationStatus, EOrderType } from "../../../config/EEnumConfig";
import { Web_Club_Issue_Gold, Web_Gold_Change_Log, Web_Order_apply, Web_Order_Rcords, Web_Org_Club_Get, Web_Recharge_Gold, Web_Recharge_Gold_Club, Web_Tiqu_Gold, Web_Tiqu_Gold_Club } from "../../../net/https/WebRequest";
import { EWalletGoldOpration } from "../../../wallet/WalletConfig";
import { BaseData } from "../../base/BaseData";
import GC from "../../GameControl";
import OrderApplyModel from "./apply/OrderApplyModel";
import GoldChangeLogModel from "./goldChangeLog/GoldChangeLogModel";
import GoldIssueModel from "./issue/GoldIssueModel";
import OrderRecordModel from "./record/OrderRecordModel";

export default class WalletData extends BaseData {
    goldChangeLogs: GoldChangeLogModel = new GoldChangeLogModel();
    orderRecord: OrderRecordModel = new OrderRecordModel();
    issue: GoldIssueModel = new GoldIssueModel();
    apply: OrderApplyModel = new OrderApplyModel();

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_Gold_Change_Log.User: {
                this.goldChangeLogs.updateData(msg, false);
            } break;
            case Web_Gold_Change_Log.Club: {
                this.goldChangeLogs.updateData(msg, true);
            } break;
            case Web_Order_Rcords.USER_RECORD:
            case Web_Order_Rcords.CLUB_GRANT:
            case Web_Order_Rcords.CLUB_RECORD: {
                this.orderRecord.updateData(msg, sendInfo.order_type);
            } break;
            case Web_Club_Issue_Gold.USER_LIST: {
                this.issue.updateData(msg);
            } break;
            case Web_Order_apply.APPLY_LIST: {
                this.apply.updateData(msg);
            } break;
            case Web_Order_apply.OPRATION_APPLY: {
                this.apply.updateItem(msg);
            } break;
            case Web_Tiqu_Gold.API: {
                GC.data.user.info.goldTiquApplySuc(msg);
            } break;
            case Web_Tiqu_Gold_Club.API: {
                GC.data.club.info.goldTiquApplySuc(msg);
            } break;
            case Web_Club_Issue_Gold.ISSUE: {
                GC.data.club.info.goldIssueSuc(msg);
            } break;
            default:
                break;
        }
    }


    reqOprationGold(type: EWalletGoldOpration, goldNum: number, isClub?: boolean, userId?: number) {
        if (type == EWalletGoldOpration.issue) {
            this.reqServePost(Web_Club_Issue_Gold.ISSUE, { user_id: userId, gold_num: goldNum * 100 })
        } else {
            let api = isClub ? Web_Recharge_Gold_Club.API : Web_Recharge_Gold.API
            if (type == EWalletGoldOpration.out) {
                api = isClub ? Web_Tiqu_Gold_Club.API : Web_Tiqu_Gold.API
            }
            this.reqServePost(api, { amount: goldNum * 100 })
        }
    }


    reqUserGoldChangeLog(offset: number = 0, limit: number = 10) {
        this.reqServePost(Web_Gold_Change_Log.User, { limit: limit, offset: offset })
    }

    reqClubGoldChangeLog(offset: number = 0, limit: number = 10) {
        this.reqServePost(Web_Gold_Change_Log.Club, { limit: limit, offset: offset, club_random_id: Web_Org_Club_Get.Response.data.random_id })
    }

    reqOrderRecord(type: EOrderType, offset: number = 0, isClub: boolean, limit: number = 25) {
        let sendData: any = { limit: limit, offset: offset, order_type: type };
        if (!isClub) {
            sendData = { limit: limit, offset: offset, order_type: type, user_type: 1 };
        }
        let api = isClub ? Web_Order_Rcords.CLUB_RECORD : Web_Order_Rcords.USER_RECORD;
        if (isClub && type == EOrderType.fafang) {
            api = Web_Order_Rcords.CLUB_GRANT
        }
        this.reqServePost(api, sendData);
    }

    reqIssueList(offset: number = 0, limit: number = 10) {
        this.reqServePost(Web_Club_Issue_Gold.USER_LIST, { limit: limit, offset: offset });
    }
    reqIssueSearchUser(search) {
        this.reqServePost(Web_Club_Issue_Gold.USER_LIST, { search: search });
    }

    reqOrderApplyList(type: EOrderType, offset: number = 0, limit: number = 10) {
        this.reqServePost(Web_Order_apply.APPLY_LIST, { limit: limit, offset: offset, order_type: type })
    }
    reqOrderApplyOpration(order_no: string, audit_type: EOrderOprationStatus) {
        this.reqServePost(Web_Order_apply.OPRATION_APPLY, { order_no: order_no, audit_type: audit_type })
    }
}