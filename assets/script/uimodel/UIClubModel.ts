/*
 * @Author: xfj
 * @Date: 2022-09-20 16:26:41
 * @description:
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-05 11:40:36
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIClubModel.ts
 */
import { ClubCache } from '../frame/data/club/ClubCache';
import HttpRequest from '../net/https/HttpRequest';
import {
    WebModifyDigitalWalletAddress,
    WebStatsRoomInsuranceInfo,
    WebClubDataStatsDataDetail,
    WebClubDataStatsDataDetailInfo,
    WebClubDataStatsData,
    WebClubDataStatsDataInfo,
    WebFriendRoomStatsDataDetail,
    WebFriendRoomStatsDataDetailInfo,
    WebFriendRoomStatsDataInfo,
    WebFriendRoomStatsData,
    WebFriendRoomStats,
    WebOrgClubNoticeGet,
    WebOrgClubNoticeIgnore,
    WebMessageRednum,
    WebUserDiamondsWallet,
    WebMttUserWallet,
    WebOrgClubShareApproveList,
    WebOrgClubShareApplyList,
    WebOrgClubShareAudit,
    WebOrgClubSharePendingList,
    WebOrgClubNotice,
    WebOrgClubNoticeUpdate,
    WebOrgRoomClubCreate,
    WebOrgRoomBatchCreate,
    WebOrgClubCancleJoinTribe,
    WebOrgClubApplyTribeList,
    WebOrgClubUserRoleChange,
    WebOrgClubUserGameInfo,
    WebOrgClubUserRemaRks,
    WebOrgClubUserInfo,
    WebOrggetNewMessNum,
    WebOrggetMessList,
    WebOrgSendMess,
    WebOrgClubRoom,
    WebOrgClubUpLevel,
    WebOrgClubLevelCost,
    WebOrgClubLevelInfo,
    WebOrgClubLevelBenefit,
    WebOrgClubMemberEarnIng,
    WebOrgClubEarnIng,
    WebOrgClubActivityInfo,
    WebOrgClubActivityCreate,
    WebOrgClubDelAdmin,
    WebOrgClubCreateRoomChange,
    WebOrgClubMember,
    WebOrgClubAddAdmin,
    WebOrgFriendRoomInfo,
    WebRoomSitApplyRecords,
    WebOrgFriendRoomList,
    WebOrgiNvitatIonRoom,
    WebOrgRoomConfigCreate,
    WebOrggetRoomConfig,
    WebOrgRoomCreate,
    WebOrgUpdateTemplate,
    WebOrgTemplateDelete,
    WebOrggetTemplate,
    WebOrgCreateTemplate,
    WebOrgchaNgeClubData,
    WebOrgJoinTrip,
    WebOrgTribeSearchById,
    WebOrgClubGold,
    WebOrgMemberList,
    WebOrgMangerList,
    WebOrgClubCreate,
    WebOrgClubGet,
    WebOrgClubPlayerApplyList,
    WebOrgClubSearchById,
    WebOrgClubJoin,
    WebOrgClubCancleJoinClub,
    WebOrgClubIsManger,
    WebOrgClubGetJoinlList,
    WebOrgClubApproValJoin,
    WebOrgClubQuit,
    WebOrgClubUploadIcon,
    WebClubFundChangeLog,
    WebRechargeGoldClub,
    WebTiquGoldClub,
    WebClubFundOrderList,
    WebClubFundApplyList,
    WebClubPlayerOrderRecord,
    WebMtt
} from '../net/https/WebRequest';
// import upLoadIcon from "../upLoadIcon";
import { StringHelper } from '../helper/StringHelper';

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
    public APIOrgClubCreate(image: string, club_name: string, desc: string, contact: string) {
        let paramas: any = {};
        paramas.logo = image;
        paramas.club_name = club_name;
        paramas.desc = desc;
        paramas.more_contact = contact;
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubCreate,
                body: WebOrgClubCreate.Request(paramas),
                onSuccess: function () {
                    resolve(WebOrgClubCreate.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * @method  俱乐部信息
     * @returns
     */
    public APIOrgClubGet(juhua: boolean = true) {
        let paramas: any = {};
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubGet,
                body: WebOrgClubGet.Request(paramas),
                onSuccess: function () {
                    resolve(WebOrgClubGet.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                juhua: juhua
            });
        });
    }

    APIOrgClubPlayerApplyList() {
        let paramas: any = {};
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubPlayerApplyList,
                body: WebOrgClubPlayerApplyList.Request(paramas),
                onSuccess: function () {
                    resolve(WebOrgClubPlayerApplyList.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgClubSearchByID(id: number) {
        let paramas: any = { club_random_id: id };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubSearchById,
                body: WebOrgClubSearchById.Request(paramas),
                onSuccess: function () {
                    resolve(WebOrgClubSearchById.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgClubJoinClub(id: number) {
        let paramas: any = { club_id: id };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubJoin,
                body: WebOrgClubJoin.Request(paramas),
                onSuccess: function () {
                    resolve(WebOrgClubJoin.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubCancleJoinClub(id: number) {
        let paramas: any = { apply_id: id };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubCancleJoinClub,
                body: WebOrgClubCancleJoinClub.Request(paramas),
                onSuccess: function () {
                    resolve(WebOrgClubCancleJoinClub.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubIsManger(id: number) {
        let paramas: any = { club_id: id };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubIsManger,
                body: WebOrgClubIsManger.Request(paramas),
                onSuccess: function () {
                    resolve(WebOrgClubIsManger.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    APIOrgClubGetJoinList(random_id: number, limit: number = 1000, offset: number = 0) {
        let parms: any = {
            club_id: random_id,
            limit: limit,
            offset: offset
        };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubGetJoinlList,
                body: WebOrgClubGetJoinlList.Request(parms),
                onSuccess: function () {
                    resolve(WebOrgClubGetJoinlList.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubApproValJoin(apply_id: number, audit_op: number) {
        let paramas: any = {
            apply_id: apply_id,
            audit_op: audit_op
        };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubApproValJoin,
                body: WebOrgClubApproValJoin.Request(paramas),
                onSuccess: function () {
                    resolve(WebOrgClubApproValJoin.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubQuit() {
        let paramas: any = { club_id: ClubCache.club_id };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubQuit,
                body: WebOrgClubQuit.Request(paramas),
                onSuccess: function () {
                    resolve(WebOrgClubQuit.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    // async WebOrgClubUploadIcon() {
    //     let _data: any = await upLoadIcon.Instance.openFile();
    //     console.log('data====', _data, _data.name)
    //     let data = new FormData()
    //     data.append("file", _data, _data.name)
    //     return new Promise((resolve, reject) => {
    //         HttpRequest.Send({
    //             request: WebOrgClubUploadIcon,
    //             body: WebOrgClubUploadIcon.Request(data),
    //             onSuccess: function () {
    //                 resolve(WebOrgClubUploadIcon.Response);
    //             }.bind(this),
    //             onFailure: function (content) {
    //                 reject(content);
    //             }.bind(this),
    //             isJson: false,
    //         });
    //     });
    // }

    WebOrgMangerList(id: number, limit = 5, offset = 0) {
        let params: any = {
            club_random_id: id,
            limit: limit,
            offset: offset
        };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgMangerList,
                body: WebOrgMangerList.Request(params),
                onSuccess: function () {
                    resolve(WebOrgMangerList.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
                //headers: [['Content-Type:', 'image/jpeg']]
            });
        });
    }

    WebOrgMemberList(params: any) {
        // let params: any = {
        //     club_id: id,
        //     club_random_id:
        //     "limit": limit,
        //     "offset": offset,
        //     search: search
        // };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgMemberList,
                body: WebOrgMemberList.Request(params),
                onSuccess: function () {
                    resolve(WebOrgMemberList.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                //headers: [['Content-Type:', 'image/jpeg']]
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrgClubGold(id: number) {
        let params: any = {
            club_random_id: id
        };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubGold,
                body: WebOrgClubGold.Request(params),
                onSuccess: function () {
                    resolve(WebOrgClubGold.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
                //headers: [['Content-Type:', 'image/jpeg']]
            });
        });
    }

    WebOrgTribeSearchById(id: number) {
        let paramas: any = { tribe_random_id: id };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgTribeSearchById,
                body: WebOrgTribeSearchById.Request(paramas),
                onSuccess: function () {
                    resolve(WebOrgTribeSearchById.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgJoinTrip(parms: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgJoinTrip,
                body: WebOrgJoinTrip.Request(parms),
                onSuccess: function () {
                    resolve(WebOrgJoinTrip.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgchaNgeClubData(params: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgchaNgeClubData,
                body: WebOrgchaNgeClubData.Request(params),
                onSuccess: function () {
                    resolve(WebOrgchaNgeClubData.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrgCreateTemplate(params: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgCreateTemplate,
                body: WebOrgCreateTemplate.Request(params),
                onSuccess: function () {
                    resolve(WebOrgCreateTemplate.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrgUpdateTemplate(params: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgUpdateTemplate,
                body: WebOrgUpdateTemplate.Request(params),
                onSuccess: function () {
                    resolve(WebOrgUpdateTemplate.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrggetTemplate(params: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrggetTemplate,
                body: WebOrggetTemplate.Request(params),
                onSuccess: function () {
                    resolve(WebOrggetTemplate.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrgTemplateDelete(id: number) {
        let params = { id: id };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgTemplateDelete,
                body: WebOrgTemplateDelete.Request(params),
                onSuccess: function () {
                    resolve(WebOrgTemplateDelete.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrgRoomCreate(id: number) {
        let params = { template_id: id };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgRoomCreate,
                body: WebOrgRoomCreate.Request(params),
                onSuccess: function () {
                    resolve(WebOrgRoomCreate.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrgRoomConfigCreate(params: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgRoomConfigCreate,
                body: WebOrgRoomConfigCreate.Request(params),
                onSuccess: function () {
                    resolve(WebOrgRoomConfigCreate.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgRoomBatchCreate(params: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgRoomBatchCreate,
                body: WebOrgRoomBatchCreate.Request(params),
                onSuccess: function () {
                    resolve(WebOrgRoomBatchCreate.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrgRoomClubCreate(params: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgRoomClubCreate,
                body: WebOrgRoomClubCreate.Request(params),
                onSuccess: function () {
                    resolve(WebOrgRoomClubCreate.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrggetRoomConfig() {
        let params = {};
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrggetRoomConfig,
                body: WebOrggetRoomConfig.Request(params),
                onSuccess: function () {
                    resolve(WebOrggetRoomConfig.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgiNvitatIonRoom(code: number) {
        let params = { code: code };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgiNvitatIonRoom,
                body: WebOrgiNvitatIonRoom.Request(params),
                onSuccess: function () {
                    resolve(WebOrgiNvitatIonRoom.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgFriendRoomList(juhua: boolean = true) {
        let params = {};
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgFriendRoomList,
                body: WebOrgFriendRoomList.Request(params),
                onSuccess: function () {
                    resolve(WebOrgFriendRoomList.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                juhua: juhua
            });
        });
    }

    // APIOrgFriendApplyList(offset = 0, limit = 10) {
    //     let params = {}//offset: offset, limit: limit
    //     return new Promise((resolve, reject) => {
    //         HttpRequest.Send({
    //             request: APIOrgFriendApplyList,
    //             body: APIOrgFriendApplyList.Request(params),
    //             onSuccess: function () {
    //                 resolve(APIOrgFriendApplyList.Response);
    //             }.bind(this),
    //             onFailure: function (content) {
    //                 reject(content);
    //             }.bind(this)
    //         });
    //     });
    // }
    // APIOrgFriendApplyDeal(apply_id, audit_op) {
    //     let params = {
    //         apply_id: apply_id,
    //         audit_op: audit_op,
    //     }//offset: offset, limit: limit
    //     return new Promise((resolve, reject) => {
    //         HttpRequest.Send({
    //             request: APIOrgFriendApplyDeal,
    //             body: APIOrgFriendApplyDeal.Request(params),
    //             onSuccess: function () {
    //                 resolve(APIOrgFriendApplyDeal.Response);
    //             }.bind(this),
    //             onFailure: function (content) {
    //                 reject(content);
    //             }.bind(this)
    //         });
    //     });
    // }
    WebOrgFriendRoomInfo(room_id: number) {
        let params = {
            room_id: room_id
        }; //offset: offset, limit: limit
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgFriendRoomInfo,
                body: WebOrgFriendRoomInfo.Request(params),
                onSuccess: function () {
                    resolve(WebOrgFriendRoomInfo.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id || 0]]
            });
        });
    }

    WebOrgClubCreateRoomChange(user_id: number, create_room: any) {
        let params = {
            user_id: user_id,
            create_room: create_room
        }; //offset: offset, limit: limit
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubCreateRoomChange,
                body: WebOrgClubCreateRoomChange.Request(params),
                onSuccess: function () {
                    resolve(WebOrgClubCreateRoomChange.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubAddAdmin(user_id: number) {
        let params = {
            user_id: user_id
        }; //offset: offset, limit: limit
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubAddAdmin,
                body: WebOrgClubAddAdmin.Request(params),
                onSuccess: function () {
                    resolve(WebOrgClubAddAdmin.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubDelAdmin(user_id: number) {
        let params = {
            user_id: user_id
        }; //offset: offset, limit: limit
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubDelAdmin,
                body: WebOrgClubDelAdmin.Request(params),
                onSuccess: function () {
                    resolve(WebOrgClubDelAdmin.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubMember(club_random_id: number, offset: number = 0, limit: number = 10, search: any = null) {
        let params = {
            club_random_id: club_random_id,
            limit: offset,
            offset: limit,
            search: search
        }; //offset: offset, limit: limit
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubMember,
                body: WebOrgClubMember.Request(params),
                onSuccess: function () {
                    resolve(WebOrgClubMember.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubActivityCreate(params: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubActivityCreate,
                body: WebOrgClubActivityCreate.Request(params),
                onSuccess: function () {
                    resolve(WebOrgClubActivityCreate.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubActivityInfo() {
        let params = {};
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubActivityInfo,
                body: WebOrgClubActivityInfo.Request(params),
                onSuccess: function () {
                    resolve(WebOrgClubActivityInfo.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubEarnIng(params: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubEarnIng,
                body: WebOrgClubEarnIng.Request(params),
                onSuccess: function () {
                    resolve(WebOrgClubEarnIng.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubMemberEarnIng(params: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubMemberEarnIng,
                body: WebOrgClubMemberEarnIng.Request(params),
                onSuccess: function () {
                    resolve(WebOrgClubMemberEarnIng.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubLevelBenefit(params: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubLevelBenefit,
                body: WebOrgClubLevelBenefit.Request(params),
                onSuccess: function () {
                    resolve(WebOrgClubLevelBenefit.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubLevelInfo(params: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubLevelInfo,
                body: WebOrgClubLevelInfo.Request(params),
                onSuccess: function () {
                    resolve(WebOrgClubLevelInfo.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubLevelCost(params: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubLevelCost,
                body: WebOrgClubLevelCost.Request(params),
                onSuccess: function () {
                    resolve(WebOrgClubLevelCost.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubUpLevel(params: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubUpLevel,
                body: WebOrgClubUpLevel.Request(params),
                onSuccess: function () {
                    resolve(WebOrgClubUpLevel.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubRoom(parms: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubRoom,
                body: WebOrgClubRoom.Request(parms),
                onSuccess: function () {
                    resolve(WebOrgClubRoom.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrgSendMess(parms: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgSendMess,
                body: WebOrgSendMess.Request(parms),
                onSuccess: function () {
                    resolve(WebOrgSendMess.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrggetMessList(parms: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrggetMessList,
                body: WebOrggetMessList.Request(parms),
                onSuccess: function () {
                    resolve(WebOrggetMessList.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrggetNewMessNum(parms: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrggetNewMessNum,
                body: WebOrggetNewMessNum.Request(parms),
                onSuccess: function () {
                    resolve(WebOrggetNewMessNum.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrgClubUserInfo(parms: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubUserInfo,
                body: WebOrgClubUserInfo.Request(parms),
                onSuccess: function () {
                    resolve(WebOrgClubUserInfo.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubUserRemaRks(parms: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubUserRemaRks,
                body: WebOrgClubUserRemaRks.Request(parms),
                onSuccess: function () {
                    resolve(WebOrgClubUserRemaRks.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubUserGameInfo(parms: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubUserGameInfo,
                body: WebOrgClubUserGameInfo.Request(parms),
                onSuccess: function () {
                    resolve(WebOrgClubUserGameInfo.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubUserRoleChange(parms: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubUserRoleChange,
                body: WebOrgClubUserRoleChange.Request(parms),
                onSuccess: function () {
                    resolve(WebOrgClubUserRoleChange.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubApplyTribeList(parms: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubApplyTribeList,
                body: WebOrgClubApplyTribeList.Request(parms),
                onSuccess: function () {
                    resolve(WebOrgClubApplyTribeList.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebOrgClubCancleJoinTribe(parms: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubCancleJoinTribe,
                body: WebOrgClubCancleJoinTribe.Request(parms),
                onSuccess: function () {
                    resolve(WebOrgClubCancleJoinTribe.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 请求公会基金变动
     */
    reqClubFundChangeLog(club_id: number, param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebClubFundChangeLog,
                body: WebClubFundChangeLog.Request(param),
                onSuccess: function () {
                    resolve(WebClubFundChangeLog.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
                //headers: [["X-Club", club_id]]
            });
        });
    }

    /**
     * 请求公会基金信息
     */
    reqClubFund(club_id: number, param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubGold,
                body: WebOrgClubGold.Request(param),
                onSuccess: function () {
                    resolve(WebOrgClubGold.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    //公会基金充值
    reqClubFundRecharge(club_id: number, param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebRechargeGoldClub,
                body: WebRechargeGoldClub.Request(param),
                onSuccess: function () {
                    resolve(WebRechargeGoldClub.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', club_id]]
            });
        });
    }

    //公会基金提取
    reqClubFundWithDraw(club_id: number, param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebTiquGoldClub,
                body: WebTiquGoldClub.Request(param),
                onSuccess: function () {
                    resolve(WebTiquGoldClub.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', club_id]]
            });
        });
    }

    //公会基金充提转记录
    reqClubFundOrderList(club_id: number, param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebClubFundOrderList,
                body: WebClubFundOrderList.Request(param),
                onSuccess: function () {
                    resolve(WebClubFundOrderList.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', club_id]]
            });
        });
    }

    //公会基金申请列表
    reqClubFundList(club_id: number, param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebClubFundApplyList,
                body: WebClubFundApplyList.Request(param),
                onSuccess: function () {
                    resolve(WebClubFundApplyList.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', club_id]]
            });
        });
    }

    WebOrgClubNoticeUpdate(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubNoticeUpdate,
                body: WebOrgClubNoticeUpdate.Request(param),
                onSuccess: function () {
                    resolve(WebOrgClubNoticeUpdate.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrgClubNoticeGet(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubNoticeGet,
                body: WebOrgClubNoticeGet.Request(param),
                onSuccess: function () {
                    resolve(WebOrgClubNoticeGet.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrgClubNotice(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubNotice,
                body: WebOrgClubNotice.Request(param),
                onSuccess: function () {
                    resolve(WebOrgClubNotice.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebOrgClubNoticeIgnore(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubNoticeIgnore,
                body: WebOrgClubNoticeIgnore.Request(param),
                onSuccess: function () {
                    resolve(WebOrgClubNoticeIgnore.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    //.共享申请待审批列表（共享目标公会查看
    WebOrgClubSharePendingList(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubSharePendingList,
                body: WebOrgClubSharePendingList.Request(param),
                onSuccess: function () {
                    resolve(WebOrgClubSharePendingList.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    //.共享申请审批操作（共享目标公会查看
    WebOrgClubShareAudit(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubShareAudit,
                body: WebOrgClubShareAudit.Request(param),
                onSuccess: function () {
                    resolve(WebOrgClubShareAudit.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    //.共享申请审批操作（共享目标公会查看
    WebOrgClubShareApproveList(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubShareApproveList,
                body: WebOrgClubShareApproveList.Request(param),
                onSuccess: function () {
                    resolve(WebOrgClubShareApproveList.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    //共享申请列表（发起共享的公会查看）
    WebOrgClubShareApplyList(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebOrgClubShareApplyList,
                body: WebOrgClubShareApplyList.Request(param),
                onSuccess: function () {
                    resolve(WebOrgClubShareApplyList.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    //mtt钱包
    WebMttUserWallet(match_id: number, param: any) {
        WebMttUserWallet.API = StringHelper.FormatString(WebMtt.USER_WALLET, match_id);
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebMttUserWallet,
                body: WebMttUserWallet.Request(param),
                onSuccess: function () {
                    resolve(WebMttUserWallet.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebUserDiamondsWallet(juhua: boolean = true) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebUserDiamondsWallet,
                body: WebUserDiamondsWallet.Request({}),
                onSuccess: function () {
                    resolve(WebUserDiamondsWallet.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                juhua: juhua
            });
        });
    }

    WebMessageRednum() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebMessageRednum,
                body: WebMessageRednum.Request({ club_id: ClubCache.club_id }),
                onSuccess: function () {
                    resolve(WebMessageRednum.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebFriendRoomStats(juhua: boolean = true) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebFriendRoomStats,
                body: WebFriendRoomStats.Request({}),
                onSuccess: function () {
                    resolve(WebFriendRoomStats.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                juhua: juhua
            });
        });
    }

    WebFriendRoomStatsData(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebFriendRoomStatsData,
                body: WebFriendRoomStatsData.Request(param),
                onSuccess: function () {
                    resolve(WebFriendRoomStatsData.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebFriendRoomStatsDataInfo(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebFriendRoomStatsDataInfo,
                body: WebFriendRoomStatsDataInfo.Request(param),
                onSuccess: function () {
                    resolve(WebFriendRoomStatsDataInfo.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebFriendRoomStatsDataDetailInfo(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebFriendRoomStatsDataDetailInfo,
                body: WebFriendRoomStatsDataDetailInfo.Request(param),
                onSuccess: function () {
                    resolve(WebFriendRoomStatsDataDetailInfo.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebFriendRoomStatsDataDetail(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebFriendRoomStatsDataDetail,
                body: WebFriendRoomStatsDataDetail.Request(param),
                onSuccess: function () {
                    resolve(WebFriendRoomStatsDataDetail.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebClubDataStatsDataInfo(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebClubDataStatsDataInfo,
                body: WebClubDataStatsDataInfo.Request(param),
                onSuccess: function () {
                    resolve(WebClubDataStatsDataInfo.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebClubDataStatsData(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebClubDataStatsData,
                body: WebClubDataStatsData.Request(param),
                onSuccess: function () {
                    resolve(WebClubDataStatsData.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebClubDataStatsDataDetailInfo(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebClubDataStatsDataDetailInfo,
                body: WebClubDataStatsDataDetailInfo.Request(param),
                onSuccess: function () {
                    resolve(WebClubDataStatsDataDetailInfo.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebClubDataStatsDataDetail(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebClubDataStatsDataDetail,
                body: WebClubDataStatsDataDetail.Request(param),
                onSuccess: function () {
                    resolve(WebClubDataStatsDataDetail.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    WebStatsRoomInsuranceInfo(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebStatsRoomInsuranceInfo,
                body: WebStatsRoomInsuranceInfo.Request(param),
                onSuccess: function () {
                    resolve(WebStatsRoomInsuranceInfo.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    WebModifyDigitalWalletAddress(param: any) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebModifyDigitalWalletAddress,
                body: WebModifyDigitalWalletAddress.Request(param),
                onSuccess: function () {
                    resolve(WebModifyDigitalWalletAddress.Response);
                }.bind(this),
                onFailure: function (content: Error) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    //////////////////////////////////////////////////////
}
