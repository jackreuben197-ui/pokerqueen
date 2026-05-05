/*
 * @Author: xfj
 * @Date: 2022-10-24 10:50:41
 * @description: 
 * @LastEditors: 
 * @LastEditTime: 2023-03-29 16:23:03
 * @FilePath: /pokerqueen/assets/script/frame/data/user/UserInfoData.ts
 */
import { TUserInfo } from "../../../config/TTypeConfig";
import { UIClubModel } from "../../../uimodel/UIClubModel";
import { WebOrgClubGet, WebUserInfo } from "../../../net/https/WebRequest";
import { BaseData } from "../../base/BaseData";
import UserInfoModel from "./UserInfoModel";

export default class UserInfoData extends BaseData {
    info: UserInfoModel = new UserInfoModel();
    isRegist = false
    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case WebUserInfo.API: {
                this.rspUserInfo(msg.user);
            } break;
        }
    }

    rspUserInfo(msg: TUserInfo) {
        this.info.updateData(msg);
        !WebOrgClubGet?.Response && UIClubModel.mInstance.APIOrgClubGet()
        // !GC.data.languageTemp.temp.haveReq && GC.data.languageTemp.reqLanguageTemp();
    }
}
