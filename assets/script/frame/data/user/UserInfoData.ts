import { TUserInfo } from "../../../config/TTypeConfig";
import { Web_User_Info } from "../../../net/https/WebRequest";
import { BaseData } from "../../base/BaseData";
import UserInfoModel from "./UserInfoModel";

export default class UserInfoData extends BaseData {
    info: UserInfoModel = new UserInfoModel();

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_User_Info.API: {
                this.rspUserInfo(msg.user);
            } break;
        }
    }

    rspUserInfo(msg: TUserInfo) {
        this.info.updateData(msg);
    }
}