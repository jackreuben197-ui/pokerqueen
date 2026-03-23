/*
 * @Author: xfj
 * @Date: 2022-10-24 10:50:41
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-04 16:02:15
 * @FilePath: /pokerqueen/assets/script/frame/data/club/ClubData.ts
 */
import { WebOrgClubGold, WebOrgClubGet } from "../../../net/https/WebRequest";
import { BaseData } from "../../base/BaseData";
import ClubInfoModel from "./ClubInfoModel";

export default class ClubData extends BaseData {
    info: ClubInfoModel = new ClubInfoModel();

    protected notify(id: any, msg: any, sendInfo?: any) {
        switch (id) {
            case WebOrgClubGet.API: {
                this.info.updateData(msg);
            } break;
            case WebOrgClubGold.API: {
                this.info.updateGold(msg);
            } break;
        }
    }
}