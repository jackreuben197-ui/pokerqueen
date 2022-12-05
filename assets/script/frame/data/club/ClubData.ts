/*
 * @Author: xfj
 * @Date: 2022-10-24 10:50:41
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-05 15:18:17
 * @FilePath: /pokerqueen/assets/script/frame/data/club/ClubData.ts
 */
import { APIOrgClubGold, Web_Org_Club_Get } from "../../../net/https/WebRequest";
import { BaseData } from "../../base/BaseData";
import ClubInfoModel from "./ClubInfoModel";

export default class ClubData extends BaseData {
    info: ClubInfoModel = new ClubInfoModel();

    protected notify(id: any, msg: any, sendInfo?: any) {
        switch (id) {
            case Web_Org_Club_Get.API: {
                this.info.updateData(msg);
            } break;
            case APIOrgClubGold.API: {
                this.info.updateGold(msg);
            } break;
        }
    }
}