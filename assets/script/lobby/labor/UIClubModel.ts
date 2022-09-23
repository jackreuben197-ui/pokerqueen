/*
 * @Author: xfj
 * @Date: 2022-09-20 16:26:41
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-23 10:11:49
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIClubModel.ts
 */

import HttpRequest from "../../net/https/HttpRequest";
import { Web_Org_Club_Create, Web_Org_Club_Get } from "../../net/https/WebRequest";

export class UIClubModel {
    private static instance: UIClubModel = null;
    public static get mInstance(): UIClubModel {
        if (!this.instance) {
            this.instance = new UIClubModel();
        }
        return this.instance;
    }
    /// <summary>
    /// 创建俱乐部
    /// </summary>
    public APIOrgClubCreate(image, club_name, desc, contact) {
        let paramas: any = {};
        paramas.logo = image
        paramas.club_name = club_name
        paramas.desc = desc
        paramas.more_contact = contact
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Org_Club_Create,
                body: Web_Org_Club_Create.Request(paramas),
                onSuccess: function () {
                    resolve(Web_Org_Club_Create.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    };
    public APIOrgClubGet() {
        let paramas: any = {};
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Org_Club_Get,
                body: Web_Org_Club_Get.Request(paramas),
                onSuccess: function () {
                    resolve(Web_Org_Club_Get.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    };


}
