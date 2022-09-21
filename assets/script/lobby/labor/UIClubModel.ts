/*
 * @Author: xfj
 * @Date: 2022-09-20 16:26:41
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-21 10:21:21
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIClubModel.ts
 */

import HttpRequest from "../../net/https/HttpRequest";
import { Web_Org_Club_Create } from "../../net/https/WebRequest";

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
    public APIOrgClubCreate(area_id, club_name, desc, logo) {
        let paramas: any = {};
        paramas.area_id = area_id || '1';
        paramas.club_name = club_name
        paramas.desc = desc
        paramas.logo = logo
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

}
