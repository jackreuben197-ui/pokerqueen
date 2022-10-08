import { TDeskNameTemp, TRoomList } from "../../../config/TTypeConfig";
import { Web_Config_Multi_Language_Template, Web_Room_Center_Groups, Web_Room_Center_Rooms, Web_Room_Center_Rooms_Blinds, Web_Room_Center_Rooms_Blinds_CLUB, Web_Room_Center_Rooms_CLUB } from "../../../net/https/WebRequest";
import { BaseData } from "../../base/BaseData";
import DeskNameTempModel from "./DeskNameTempModel";
import LobbyGroupModel from "./LobbyGroupModel";
import LobbyRoomBlindsModel from "./LobbyRoomBlindsModel";
import LobbyRoomListModel from "./LobbyRoomListModel";

export default class LobbyData extends BaseData {
    private _roomBlinds: LobbyRoomBlindsModel = null;
    private _nameTemp: DeskNameTempModel = null;
    private _lobbyGroup: LobbyGroupModel = null;
    private _roomList: LobbyRoomListModel = null;
    protected notify(api: any, msg: any, sendInfo?: any): void {
        switch (api) {
            case Web_Room_Center_Rooms_Blinds.API: {
                this.respRoomBlinds(msg, sendInfo, false);
            } break;
            case Web_Room_Center_Rooms_Blinds_CLUB.API: {
                this.respRoomBlinds(msg, sendInfo, true);
            } break;
            case Web_Room_Center_Groups.API: {
                this.respLobbyBaseData(msg, sendInfo);
            } break;
            case Web_Config_Multi_Language_Template.API: {
                this.respDeskNameTemp(msg, sendInfo);
            } break;
            case Web_Room_Center_Rooms.API: {
                this.respRoomList(msg, sendInfo, false);
            } break;
            case Web_Room_Center_Rooms_CLUB.API: {
                this.respRoomList(msg, sendInfo, true);
            } break;
        }
    }

    get nameTemp() {
        if (!this._nameTemp) {
            this._nameTemp = new DeskNameTempModel();
        }
        return this._nameTemp;
    }

    get lobbyGroup() {
        if (!this._lobbyGroup) {
            this._lobbyGroup = new LobbyGroupModel();
        }
        return this._lobbyGroup;
    }

    get roomBlinds() {
        if (!this._roomBlinds) {
            this._roomBlinds = new LobbyRoomBlindsModel();
        }
        return this._roomBlinds;
    }

    get roomList() {
        if (!this._roomList) {
            this._roomList = new LobbyRoomListModel();
        }
        return this._roomList;
    }


    respLobbyBaseData(msg, sendInfo) {
        this.lobbyGroup.updataData(msg);
    }

    respRoomBlinds(msg, sendInfo, isClub) {
        this.roomBlinds.updateData(msg.records, isClub);
    }

    respDeskNameTemp(msg: Array<TDeskNameTemp>, sendInfo) {
        this.nameTemp.updateData(msg);
    }

    respRoomList(msg: TRoomList, sendInfo, isClub) {
        this.roomList.updateData(msg, isClub);
    }

    //请求盲注信息
    reqRoomBlinds(game_type: number, poker_type: number, isClub: boolean = false, onSuccess?: Function) {
        let url = isClub ? Web_Room_Center_Rooms_Blinds_CLUB.API : Web_Room_Center_Rooms_Blinds.API;
        this.reqServePost(url, { game_type: game_type, poker_type: poker_type }, onSuccess);
    }

    //请求桌子名字模版
    reqDeskNameTemp(onSuccess?: Function): void {
        this.reqServePost(Web_Config_Multi_Language_Template.API, null, onSuccess)
    }

    //请求大厅基础数据
    reqLobbyGroupData(onSuccess?: Function) {
        this.reqServePost(Web_Room_Center_Groups.API, null, onSuccess)
    }

    //请求房间牌桌列表   大标签
    reqRoomList(offset: number, sb_min: number, sb_max: number, game_type: number, poker_type: number, isClub = false, limit = 7) {
        this.reqRoomBlinds(game_type, poker_type, isClub, () => {
            this.reqRoomListSB(offset, sb_min, sb_max, game_type, poker_type, isClub, limit);
        })
    }

    //请求房间牌桌列表   小标签
    reqRoomListSB(offset: number, sb_min: number, sb_max: number, game_type: number, poker_type: number, isClub = false, limit = 7) {
        this.reqDeskNameTemp(() => {
            let url = isClub ? Web_Room_Center_Rooms_CLUB.API : Web_Room_Center_Rooms.API;
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
                offset: offset
            })
        })
    }
}