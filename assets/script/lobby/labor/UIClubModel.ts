/*
 * @Author: xfj
 * @Date: 2022-09-20 16:26:41
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-05 12:54:03
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIClubModel.ts
 */

import { ClubCache } from "../../frame/data/club/ClubCache";
import HttpRequest from "../../net/https/HttpRequest";
import { APIOrgClubAgentUser_list, APIOrgClubShareApproveList, APIOrgClubShareApplyList, APIOrgClubShareAudit, APIOrgClubSharePendingList, APIOrgClubNotice, APIOrgClubNotice_update, APIOrgRoomClubCreate, APIOrgRoomBatchCreate, APIOrgClubCancleJoinTribe, APIOrgClubApplyTribeList, APIOrgClubUserRole_change, APIOrgClubUserGameInfo, APIOrgClubUserRemarks, APIOrgClubUserInfo, APIOrgGetNewMessNum, APIOrgGetMessList, APIOrgSendMess, APIOrgClubRoom, APIOrgClubUpLevel, APIOrgClubLevelCost, APIOrgClubLevelInfo, APIOrgClubLevelBenefit, APIOrgClubMemberEarning, APIOrgClubEarning, APIOrgClubActivityInfo, APIOrgClubActivityCreate, APIOrgClubDelAdmin, APIOrgClubCreateRoomChange, APIOrgClubMember, APIOrgClubAddAdmin, APIOrgFriendRoomInfo, APIOrgFriendApplyDeal, APIOrgFriendApplyList, APIOrgFriendRoomList, APIOrgInvitationRoom, APIOrgRoomConfigCreate, APIOrgGetRoomConfig, APIOrgRoomCreate, APIOrgUpdateTemplate, APIOrgTemplateDelete, APIOrgGetTemplate, APIOrgCreateTemplate, APIOrgChangeClubData, APIOrgJoinTrip, APIOrgTribeSearchByID, APIOrgClubGold, APIOrgMemberList, APIOrgMangerList, Web_Org_Club_Create, Web_Org_Club_Get, Web_Org_Club_Player_Apply_List, Web_Org_Club_Search_By_Id, Web_Org_Club_Join, APIOrgClubCancleJoinClub, APIOrgClubIsManger, APIOrgClubGetJoinlList, APIOrgClubApprovalJoin, APIOrgClubQuit, APIOrgClubUploadIcon, Web_Club_Fund_ChangeLog, Web_Recharge_Gold_Club, Web_Tiqu_Gold_Club, Web_Club_Fund_OrderList, Web_Club_Fund_ApplyList, Web_Club_Player_Order_Record } from "../../net/https/WebRequest";
import upLoadIcon from "../upLoadIcon";

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

    APIOrgClubGetJoinList(random_id, limit = 1000, offset = 0) {
        let parms: any = {
            club_id: random_id,
            limit: limit,
            offset: offset
        };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubGetJoinlList,
                body: APIOrgClubGetJoinlList.Request(parms),
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

    async APIOrgClubUploadIcon() {
        let _data: any = await upLoadIcon.openFile();
        console.log('data====', _data)

        let data = new FormData()
        data.append("file", _data, _data.name)
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubUploadIcon,
                body: APIOrgClubUploadIcon.Request(data),
                onSuccess: function () {
                    resolve(APIOrgClubUploadIcon.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                isJson: false,
            });
        });
    }

    APIOrgMangerList(id, limit = 5, offset = 0) {
        let params: any = {
            club_random_id: id,
            "limit": limit,
            "offset": offset,

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

    APIOrgMemberList(params) {
        // let params: any = {
        //     club_id: id,
        //     club_random_id:
        //     "limit": limit,
        //     "offset": offset,
        //     search: search
        // };
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
    APIOrgTribeSearchByID(id) {
        let paramas: any = { tribe_random_id: id };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgTribeSearchByID,
                body: APIOrgTribeSearchByID.Request(paramas),
                onSuccess: function () {
                    resolve(APIOrgTribeSearchByID.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgJoinTrip(parms) {

        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgJoinTrip,
                body: APIOrgJoinTrip.Request(parms),
                onSuccess: function () {
                    resolve(APIOrgJoinTrip.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgChangeClubData(params) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgChangeClubData,
                body: APIOrgChangeClubData.Request(params),
                onSuccess: function () {
                    resolve(APIOrgChangeClubData.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgCreateTemplate(params) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgCreateTemplate,
                body: APIOrgCreateTemplate.Request(params),
                onSuccess: function () {
                    resolve(APIOrgCreateTemplate.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }
    APIOrgUpdateTemplate(params) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgUpdateTemplate,
                body: APIOrgUpdateTemplate.Request(params),
                onSuccess: function () {
                    resolve(APIOrgUpdateTemplate.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }
    APIOrgGetTemplate(params) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgGetTemplate,
                body: APIOrgGetTemplate.Request(params),
                onSuccess: function () {
                    resolve(APIOrgGetTemplate.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }
    APIOrgTemplateDelete(id) {
        let params = { id: id }
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgTemplateDelete,
                body: APIOrgTemplateDelete.Request(params),
                onSuccess: function () {
                    resolve(APIOrgTemplateDelete.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }
    APIOrgRoomCreate(id) {
        let params = { template_id: id }
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgRoomCreate,
                body: APIOrgRoomCreate.Request(params),
                onSuccess: function () {
                    resolve(APIOrgRoomCreate.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });

    }

    APIOrgRoomConfigCreate(params) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgRoomConfigCreate,
                body: APIOrgRoomConfigCreate.Request(params),
                onSuccess: function () {
                    resolve(APIOrgRoomConfigCreate.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }


    APIOrgRoomBatchCreate(params) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgRoomBatchCreate,
                body: APIOrgRoomBatchCreate.Request(params),
                onSuccess: function () {
                    resolve(APIOrgRoomBatchCreate.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }
    APIOrgRoomClubCreate(params) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgRoomClubCreate,
                body: APIOrgRoomClubCreate.Request(params),
                onSuccess: function () {
                    resolve(APIOrgRoomClubCreate.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }




    APIOrgGetRoomConfig() {
        let params = {}
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgGetRoomConfig,
                body: APIOrgGetRoomConfig.Request(params),
                onSuccess: function () {
                    resolve(APIOrgGetRoomConfig.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgInvitationRoom(code) {
        let params = { code: code }
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgInvitationRoom,
                body: APIOrgInvitationRoom.Request(params),
                onSuccess: function () {
                    resolve(APIOrgInvitationRoom.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgFriendRoomList() {
        let params = {}
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgFriendRoomList,
                body: APIOrgFriendRoomList.Request(params),
                onSuccess: function () {
                    resolve(APIOrgFriendRoomList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgFriendApplyList(offset = 0, limit = 10) {
        let params = {}//offset: offset, limit: limit
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgFriendApplyList,
                body: APIOrgFriendApplyList.Request(params),
                onSuccess: function () {
                    resolve(APIOrgFriendApplyList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgFriendApplyDeal(apply_id, audit_op) {
        let params = {
            apply_id: apply_id,
            audit_op: audit_op,
        }//offset: offset, limit: limit
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgFriendApplyDeal,
                body: APIOrgFriendApplyDeal.Request(params),
                onSuccess: function () {
                    resolve(APIOrgFriendApplyDeal.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgFriendRoomInfo(room_id) {
        let params = {
            room_id: room_id,
        }//offset: offset, limit: limit
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgFriendRoomInfo,
                body: APIOrgFriendRoomInfo.Request(params),
                onSuccess: function () {
                    resolve(APIOrgFriendRoomInfo.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    APIOrgClubCreateRoomChange(user_id, create_room) {
        let params = {
            user_id: user_id,
            create_room: create_room
        }//offset: offset, limit: limit
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubCreateRoomChange,
                body: APIOrgClubCreateRoomChange.Request(params),
                onSuccess: function () {
                    resolve(APIOrgClubCreateRoomChange.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgClubAddAdmin(user_id) {
        let params = {
            user_id: user_id,
        }//offset: offset, limit: limit
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubAddAdmin,
                body: APIOrgClubAddAdmin.Request(params),
                onSuccess: function () {
                    resolve(APIOrgClubAddAdmin.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgClubDelAdmin(user_id) {
        let params = {
            user_id: user_id,
        }//offset: offset, limit: limit
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubDelAdmin,
                body: APIOrgClubDelAdmin.Request(params),
                onSuccess: function () {
                    resolve(APIOrgClubDelAdmin.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgClubMember(club_random_id, offset = 0, limit = 10, search = null) {
        let params = {
            club_random_id: club_random_id,
            "limit": offset,
            "offset": limit,
            search: search
        }//offset: offset, limit: limit
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubMember,
                body: APIOrgClubMember.Request(params),
                onSuccess: function () {
                    resolve(APIOrgClubMember.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgClubActivityCreate(params) {

        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubActivityCreate,
                body: APIOrgClubActivityCreate.Request(params),
                onSuccess: function () {
                    resolve(APIOrgClubActivityCreate.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgClubActivityInfo() {
        let params = {}
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubActivityInfo,
                body: APIOrgClubActivityInfo.Request(params),
                onSuccess: function () {
                    resolve(APIOrgClubActivityInfo.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgClubEarning(params) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubEarning,
                body: APIOrgClubEarning.Request(params),
                onSuccess: function () {
                    resolve(APIOrgClubEarning.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgClubMemberEarning(params) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubMemberEarning,
                body: APIOrgClubMemberEarning.Request(params),
                onSuccess: function () {
                    resolve(APIOrgClubMemberEarning.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgClubLevelBenefit(params) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubLevelBenefit,
                body: APIOrgClubLevelBenefit.Request(params),
                onSuccess: function () {
                    resolve(APIOrgClubLevelBenefit.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgClubLevelInfo(params) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubLevelInfo,
                body: APIOrgClubLevelInfo.Request(params),
                onSuccess: function () {
                    resolve(APIOrgClubLevelInfo.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgClubLevelCost(params) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubLevelCost,
                body: APIOrgClubLevelCost.Request(params),
                onSuccess: function () {
                    resolve(APIOrgClubLevelCost.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }


    APIOrgClubUpLevel(params) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubUpLevel,
                body: APIOrgClubUpLevel.Request(params),
                onSuccess: function () {
                    resolve(APIOrgClubUpLevel.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgClubRoom(parms) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubRoom,
                body: APIOrgClubRoom.Request(parms),
                onSuccess: function () {
                    resolve(APIOrgClubRoom.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    APIOrgSendMess(parms) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgSendMess,
                body: APIOrgSendMess.Request(parms),
                onSuccess: function () {
                    resolve(APIOrgSendMess.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    APIOrgGetMessList(parms) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgGetMessList,
                body: APIOrgGetMessList.Request(parms),
                onSuccess: function () {
                    resolve(APIOrgGetMessList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    APIOrgGetNewMessNum(parms) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgGetNewMessNum,
                body: APIOrgGetNewMessNum.Request(parms),
                onSuccess: function () {
                    resolve(APIOrgGetNewMessNum.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    APIOrgClubUserInfo(parms) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubUserInfo,
                body: APIOrgClubUserInfo.Request(parms),
                onSuccess: function () {
                    resolve(APIOrgClubUserInfo.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgClubUserRemarks(parms) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubUserRemarks,
                body: APIOrgClubUserRemarks.Request(parms),
                onSuccess: function () {
                    resolve(APIOrgClubUserRemarks.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgClubUserGameInfo(parms) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubUserGameInfo,
                body: APIOrgClubUserGameInfo.Request(parms),
                onSuccess: function () {
                    resolve(APIOrgClubUserGameInfo.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgClubUserRole_change(parms) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubUserRole_change,
                body: APIOrgClubUserRole_change.Request(parms),
                onSuccess: function () {
                    resolve(APIOrgClubUserRole_change.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgClubApplyTribeList(parms) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubApplyTribeList,
                body: APIOrgClubApplyTribeList.Request(parms),
                onSuccess: function () {
                    resolve(APIOrgClubApplyTribeList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    APIOrgClubCancleJoinTribe(parms) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubCancleJoinTribe,
                body: APIOrgClubCancleJoinTribe.Request(parms),
                onSuccess: function () {
                    resolve(APIOrgClubCancleJoinTribe.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }



    /**
     * 请求公会基金变动
     */
    reqClubFundChangeLog(club_id, param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Club_Fund_ChangeLog,
                body: Web_Club_Fund_ChangeLog.Request(param),
                onSuccess: function () {
                    resolve(Web_Club_Fund_ChangeLog.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                //headers: [["X-Club", club_id]]
            });
        });
    }

    /**
     * 请求公会基金信息
     */
    reqClubFund(club_id, param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubGold,
                body: APIOrgClubGold.Request(param),
                onSuccess: function () {
                    resolve(APIOrgClubGold.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
            });
        });
    }
    //公会基金充值 
    reqClubFundRecharge(club_id, param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Recharge_Gold_Club,
                body: Web_Recharge_Gold_Club.Request(param),
                onSuccess: function () {
                    resolve(Web_Recharge_Gold_Club.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [["X-Club", club_id]]
            });
        });
    }

    //公会基金提取
    reqClubFundWithDraw(club_id, param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Tiqu_Gold_Club,
                body: Web_Tiqu_Gold_Club.Request(param),
                onSuccess: function () {
                    resolve(Web_Tiqu_Gold_Club.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [["X-Club", club_id]]
            });
        });
    }
    //公会基金充提转记录
    reqClubFundOrderList(club_id, param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Club_Fund_OrderList,
                body: Web_Club_Fund_OrderList.Request(param),
                onSuccess: function () {
                    resolve(Web_Club_Fund_OrderList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [["X-Club", club_id]]
            });
        });
    }
    //公会基金申请列表
    reqClubFundList(club_id, param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Club_Fund_ApplyList,
                body: Web_Club_Fund_ApplyList.Request(param),
                onSuccess: function () {
                    resolve(Web_Club_Fund_ApplyList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [["X-Club", club_id]]
            });
        });
    }
    APIOrgClubNotice_update(param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubNotice_update,
                body: APIOrgClubNotice_update.Request(param),
                onSuccess: function () {
                    resolve(APIOrgClubNotice_update.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [["X-Club", ClubCache.club_id]]
            });
        });
    }
    APIOrgClubNotice(param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubNotice,
                body: APIOrgClubNotice.Request(param),
                onSuccess: function () {
                    resolve(APIOrgClubNotice.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [["X-Club", ClubCache.club_id]]
            });
        });
    }
    //.共享申请待审批列表（共享目标公会查看
    APIOrgClubSharePendingList(param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubSharePendingList,
                body: APIOrgClubSharePendingList.Request(param),
                onSuccess: function () {
                    resolve(APIOrgClubSharePendingList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [["X-Club", ClubCache.club_id]]
            });
        });
    }

    //.共享申请审批操作（共享目标公会查看
    APIOrgClubShareAudit(param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubShareAudit,
                body: APIOrgClubShareAudit.Request(param),
                onSuccess: function () {
                    resolve(APIOrgClubShareAudit.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [["X-Club", ClubCache.club_id]]
            });
        });
    }

    //.共享申请审批操作（共享目标公会查看
    APIOrgClubShareApproveList(param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubShareApproveList,
                body: APIOrgClubShareApproveList.Request(param),
                onSuccess: function () {
                    resolve(APIOrgClubShareApproveList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [["X-Club", ClubCache.club_id]]
            });
        });
    }

    //共享申请列表（发起共享的公会查看）
    APIOrgClubShareApplyList(param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubShareApplyList,
                body: APIOrgClubShareApplyList.Request(param),
                onSuccess: function () {
                    resolve(APIOrgClubShareApplyList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [["X-Club", ClubCache.club_id]]
            });
        });
    }
    //公会代理下线成员列表
    APIOrgClubAgentUser_list(param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIOrgClubAgentUser_list,
                body: APIOrgClubAgentUser_list.Request(param),
                onSuccess: function () {
                    resolve(APIOrgClubAgentUser_list.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
            });
        });
    }

    //////////////////////////////////////////////////////
    CommonAPI(clubid: number, param: any, web: any,) {
        return new Promise((resolve, reject) => {
            let obj: any = {
                request: web,
                body: web.Request(param),
                onSuccess: function () {
                    resolve(web.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            }
            clubid > 0 && (obj.headers = [["X-Club", clubid]]);

            HttpRequest.Send(obj);
        });
    }
}
