import { EventName } from "../../../config/EventName";
import { TRoomList } from "../../../config/TTypeConfig";
import { GameCache } from "../../../game/GameCache";
import { WebOrgFriendRoomList, WebConfigGlobalConfig, WebConfigMultiLanguageTemplate, WebRoomCenterGroups, WebRoomCenterRooms, WebRoomCenterRoomsBlinds, WebRoomCenterRoomsBlindsClub, WebRoomCenterRoomsClub } from "../../../net/https/WebRequest";
import { BaseData } from "../../base/BaseData";
import GC from "../../GameControl";
import LobbyGroupModel from "./LobbyGroupModel";
import LobbyRoomBlindsModel from "./LobbyRoomBlindsModel";
import LobbyRoomListModel from "./LobbyRoomListModel";

export default class LobbyData extends BaseData {
    roomBlinds: LobbyRoomBlindsModel = new LobbyRoomBlindsModel();
    lobbyGroup: LobbyGroupModel = new LobbyGroupModel();
    roomList: LobbyRoomListModel = new LobbyRoomListModel();
    protected notify(api: any, msg: any, sendInfo?: any): void {
        switch (api) {
            case WebRoomCenterRoomsBlinds.API: {
                this.respRoomBlinds(msg, sendInfo, false);
            } break;
            case WebRoomCenterRoomsBlindsClub.API: {
                this.respRoomBlinds(msg, sendInfo, true);
            } break;
            case WebRoomCenterGroups.API: {
                this.respLobbyBaseData(msg, sendInfo);
                GC.notify.post(EventName.refreshLobby);
            } break;
            // case WebConfigMultiLanguageTemplate.API: {
            //     this.respDeskNameTemp(msg, sendInfo);
            // } break;
            case WebRoomCenterRooms.API: {
                sendInfo.limit && this.respRoomList(msg, sendInfo, false);
            } break;
            case WebRoomCenterRoomsClub.API: {
                sendInfo.limit && this.respRoomList(msg, sendInfo, true);
            } break;
        }
    }


    respLobbyBaseData(msg, sendInfo) {
        this.lobbyGroup.updataData(msg);
    }

    respRoomBlinds(msg, sendInfo, isClub) {
        this.roomBlinds.updateData(msg.records, isClub);
    }

    // respDeskNameTemp(msg: Array<TDeskNameTemp>, sendInfo) {
    //     this.nameTemp.updateData(msg);
    // }

    respRoomList(msg: TRoomList, sendInfo, isClub) {
        this.roomList.updateData(msg, isClub);
    }

    //请求盲注信息
    reqRoomBlinds(game_type: number, poker_type: number, isClub: boolean = false, onSuccess?: Function) {
        let url = isClub ? WebRoomCenterRoomsBlindsClub.API : WebRoomCenterRoomsBlinds.API;
        this.reqServePost(url, { game_type: game_type, poker_type: poker_type }, onSuccess);
    }

    //请求桌子名字模版
    // reqDeskNameTemp(onSuccess?: Function): void {
    //     this.reqServePost(WebConfigMultiLanguageTemplate.API, null, onSuccess)
    // }

    //请求大厅基础数据
    reqLobbyGroupData(onSuccess?: Function) {
        this.reqServePost(WebRoomCenterGroups.API, null, onSuccess)
    }

    //请求房间牌桌列表   大标签
    reqRoomList(offset: number, sb_min: number, sb_max: number, game_type: number, poker_type: number, isClub = false, limit = 7) {
        this.reqRoomBlinds(game_type, poker_type, isClub, () => {
            this.reqRoomListSB(offset, sb_min, sb_max, game_type, poker_type, isClub, limit);
        })
    }

    //请求房间牌桌列表   小标签
    reqRoomListSB(offset: number, sb_min: number, sb_max: number, game_type: number, poker_type: number, isClub = false, limit = 7) {
        GC.data.languageTemp.reqLanguageTemp(() => {
            let url = isClub ? WebRoomCenterRoomsClub.API : WebRoomCenterRooms.API;
            this.reqServePost(url, {
                name: "",
                ante_min: 0,
                ante_max: 0,
                sb_min: sb_min,
                sb_max: sb_max,
                tribe_id: 0,
                start_time_s: 0,
                start_time_e: 0,
                enter_time_s: 0,
                enter_time_e: 0,
                game_type: [game_type],
                poker_type: [poker_type],
                limit_bet_type: [],
                limit: limit,
                offset: offset,
                order: ["sb_asc"]
            })
        })
    }

    reqRoomByIds(ids: Array<number>, callBack?: Function, isClub = false) {
        let url = WebRoomCenterRooms.API
        if (GameCache.Instance.origin_type == 4) {
            url = WebOrgFriendRoomList.API
        } else if (GameCache.Instance.origin_type == 3) {
            url = WebRoomCenterRoomsClub.API
        }
        // let url = isClub ? WebRoomCenterRoomsClub.API : WebRoomCenterRooms.API;
        this.reqServePost(url, {
            room_ids: ids,
            order: ["sb_asc"]
        }, callBack)
    }
}