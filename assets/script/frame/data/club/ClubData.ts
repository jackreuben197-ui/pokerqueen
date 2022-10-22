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