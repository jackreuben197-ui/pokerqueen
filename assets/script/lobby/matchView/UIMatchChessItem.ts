import { ProcedureEnum } from "../../define/EIDefine";
import { UIDefine } from "../../define/UIDefine";
import { GameCache } from "../../game/GameCache";
import { RoomType } from "../../game/GameUtil";
import { i18nMgr } from "../../i18n/i18nMgr";
import ProcedureManager from "../../manager/ProcedureManager";
import { Web_Room_Center_Rooms } from "../../net/https/WebRequest";
import WebSocketClient from "../../net/websocket/WebSocketClient";
import LobbySession from "../../session/LobbySession";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;
@ccclass
export default class UIMatchChessItem extends UIBase {
    private _data: typeof Web_Room_Center_Rooms.DataElement = null;

    private _localDicRoomName: Map<string, { [key: string]: string }> = new Map();
    initData(data, roomNames) {
        this._data = data;
        this._localDicRoomName = roomNames;
        this.initView();
    }

    initView() {
        this.node.getChildByName("lbl_center_left").getComponent(cc.Label).string = `${this.GetLongString(this._data.sb)}/${this.GetLongString(this._data.sb * 2)}${this.GetLongString(this._data.ante)}`;
        // item.getChildByName("Text_Type").getComponent(cc.Label).string = roomInfo.poker_type == 2 ? this.six_List[roomInfo.game_type] : this.type_List[roomInfo.game_type];
        // let layout: cc.Node = item.getChildByName("Text_Icon_Layout");
        // if (roomInfo.play_duration == 0) {
        // status 0:待创建 1:已创建未开始 2:已开始 3:已结束
        // participation_status 参与状态:0 未参与 1: 参与中
        if (this._data.participation_status == 0) {
            this.node.getChildByName("item_choose").active = false;
            this.node.getChildByName("item_normal").active = true;
            //     layout.getChildByName("Text_Icon_Time").active = false;
            //     layout.getChildByName("Text_Icon_Time_node").active = true;
        } else {
            this.node.getChildByName("item_choose").active = true;
            this.node.getChildByName("item_normal").active = false;
            //     layout.getChildByName("Text_Icon_Time").active = true;
            //     layout.getChildByName("Text_Icon_Time_node").active = false;
            //值取小数点后一位
            let duration = Math.floor((this._data.play_duration * 1.0 / 3600) * 10) / 10
            this.node.getChildByName("lbl_time").getComponent(cc.Label).string = `${duration}h/${duration}h`
        }
        this.node.getChildByName("lbl_deskName").getComponent(cc.Label).string = this.GetRoomNameByKey(this._data.name);


        this.node.getChildByName("item_choose").active = false;
        this.node.getChildByName("item_normal").active = true;
        // let peopleNum1: cc.Label = item.getChildByName("Text_Number").getChildByName("Text_Number_1").getComponent(cc.Label);
        // let peopleNum2: cc.Label = item.getChildByName("Text_Number").getChildByName("Text_Number_2").getComponent(cc.Label);
        // peopleNum1.string = `${roomInfo.seat_count - roomInfo.empty_seat}/`;
        // peopleNum2.string = `${roomInfo.seat_count}`
        this.node["roomInfo"] = this._data;
        this.node.getChildByName("lbl_num").getComponent(cc.Label).string = `${this._data.seat_count - this._data.empty_seat}/${this._data.seat_count}`;
        this.node.off(cc.Node.EventType.TOUCH_END, this.EnterRoomAPI, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.EnterRoomAPI, this);
    }


    private async EnterRoomAPI(e: cc.Event.EventCustom) {
        let roominfo: typeof Web_Room_Center_Rooms.DataElement = e.target.roomInfo;

        //判断websocket是否已经连接上
        if (WebSocketClient.WS?.readyState != WebSocket.OPEN) {
            console.warn("websocket is not open");
            return;
        }
        if (!RoomType[roominfo.room_type]) {
            console.warn("房间类型未解析:", roominfo.room_type);
            UIComponent.Instance.Toast(`room_type:${roominfo.room_type} is error`);
            return;
        }
        GameCache.Instance.serviceId = roominfo.service_id;
        GameCache.Instance.roomName = this.GetRoomNameByKey(roominfo.name);
        GameCache.Instance.room_type = roominfo.room_type;
        GameCache.Instance.game_type = roominfo.game_type;
        GameCache.Instance.poker_type = roominfo.poker_type;
        GameCache.Instance.bet_type = roominfo.limit_bet_type;
        GameCache.Instance.room_id = roominfo.rid;
        GameCache.Instance.seat_count = roominfo.seat_count;
        GameCache.Instance.straddle = roominfo.straddle_on;
        GameCache.Instance.insurance = roominfo.insurance_on > 0;
        GameCache.Instance.muck_switch = roominfo.muck_on;
        GameCache.Instance.voiceprint_verify_on = roominfo.voiceprint_verify_on;
        GameCache.Instance.voiceprint_verify_duration = roominfo.voiceprint_verify_duration;
        if (WebSocketClient.WS?.readyState == WebSocket.OPEN) {

            let response = LobbySession.APIWebUserRoominsur(roominfo.rid).catch(() => { });
            if (response) {
                UIComponent.close(UIDefine.UIMatchPlayViewForm);
                ProcedureManager.StartProcedure(ProcedureEnum.EnterTexas, { fromUI: this.UIDefine, lookOn: false });//[this.UIDefine, false, 0]
            }
        } else {
            cc.warn("websocket还没有连接上:", WebSocketClient.WS.readyState);
        }
    }

    //通过key值给房间命名
    public GetRoomNameByKey(pStrKey: string): string {
        let name: string = "";
        let strArray = pStrKey.split("-");
        let name_obj = this._localDicRoomName.get(strArray[0]);
        if (name_obj) {
            name = name_obj[i18nMgr.language] || "";
        }
        if (strArray.length > 1) {
            name += "-" + strArray[1];
        }
        return name;
    }

    private GetLongString(num: number): string {
        if (num == 0) {
            return "0"
        }
        return num / 100 + "";
    }

}