/*
 * @Author: xfj
 * @Date: 2022-09-20 16:26:41
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-28 13:52:59
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIClubModel.ts
 */

import HttpRequest from "../../net/https/HttpRequest";
import { APIOrgClubGold, APIOrgMemberList, APIOrgMangerList, Web_Org_Club_Create, Web_Org_Club_Get, Web_Org_Club_Player_Apply_List, Web_Org_Club_Search_By_Id, Web_Org_Club_Join, APIOrgClubCancleJoinClub, APIOrgClubIsManger, APIOrgClubGetJoinlList, APIOrgClubApprovalJoin, APIOrgClubQuit, APIOrgClubUploadIcon } from "../../net/https/WebRequest";

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
    /**
     * @method  俱乐部信息
     * @returns 
     */
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
    APIOrgClubPlayerApplyList() {
        let paramas: any = {};
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Org_Club_Player_Apply_List,
                body: Web_Org_Club_Player_Apply_List.Request(paramas),
                onSuccess: function () {
                    resolve(Web_Org_Club_Player_Apply_List.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgClubSearchByID(id) {
        let paramas: any = { club_random_id: id };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Org_Club_Search_By_Id,
                body: Web_Org_Club_Search_By_Id.Request(paramas),
                onSuccess: function () {
                    resolve(Web_Org_Club_Search_By_Id.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgClubJoinClub(id) {
        let paramas: any = { club_id: id };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Org_Club_Join,
                body: Web_Org_Club_Join.Request(paramas),
                onSuccess: function () {
                    resolve(Web_Org_Club_Join.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgClubCancleJoinClub(id) {
        let paramas: any = { apply_id: id };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubCancleJoinClub,
                body: APIOrgClubCancleJoinClub.Request(paramas),
                onSuccess: function () {
                    resolve(APIOrgClubCancleJoinClub.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgClubIsManger(id) {
        let paramas: any = { club_id: id };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubIsManger,
                body: APIOrgClubIsManger.Request(paramas),
                onSuccess: function () {
                    resolve(APIOrgClubIsManger.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgClubGetJoinlList() {
        let paramas: any = {
            limit: 1000,
            offset: 0
        };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubGetJoinlList,
                body: APIOrgClubGetJoinlList.Request(paramas),
                onSuccess: function () {
                    resolve(APIOrgClubGetJoinlList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgClubApprovalJoin(apply_id, audit_op) {
        let paramas: any = {
            apply_id: apply_id,
            audit_op: audit_op
        };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubApprovalJoin,
                body: APIOrgClubApprovalJoin.Request(paramas),
                onSuccess: function () {
                    resolve(APIOrgClubApprovalJoin.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgClubQuit() {
        let paramas: any = {};
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubQuit,
                body: APIOrgClubQuit.Request(paramas),
                onSuccess: function () {
                    resolve(APIOrgClubQuit.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgClubUploadIcon(buffer) {

        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubUploadIcon,
                body: APIOrgClubUploadIcon.Request(buffer),
                onSuccess: function () {
                    resolve(APIOrgClubUploadIcon.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                // headers: [["Content-Type", "multipart/form-data"], ["Content-Type", " boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"]]
            });
        });
    }

    APIOrgMangerList(id) {
        let params: any = {
            club_random_id: id,
            "limit": 5,
            "offset": 0
        };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgMangerList,
                body: APIOrgMangerList.Request(params),
                onSuccess: function () {
                    resolve(APIOrgMangerList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                //headers: [['Content-Type:', 'image/jpeg']]
            });
        });
    }

    APIOrgMemberList(id) {
        let params: any = {
            club_random_id: id,
            "limit": 5,
            "offset": 0
        };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgMemberList,
                body: APIOrgMemberList.Request(params),
                onSuccess: function () {
                    resolve(APIOrgMemberList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                //headers: [['Content-Type:', 'image/jpeg']]
            });
        });
    }
    APIOrgClubGold(id) {
        let params: any = {
            club_random_id: id,
        };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubGold,
                body: APIOrgClubGold.Request(params),
                onSuccess: function () {
                    resolve(APIOrgClubGold.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                //headers: [['Content-Type:', 'image/jpeg']]
            });
        });
    }

}
