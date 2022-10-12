import { ProcedureEnum } from "../../define/EIDefine";
import { UIDefine } from "../../define/UIDefine";
import LobbyRoomListItem from "../../frame/data/lobby/LobbyRoomListItem";
import { GameCache } from "../../game/GameCache";
import { RoomType } from "../../game/GameUtil";
import ProcedureManager from "../../manager/ProcedureManager";
import WebSocketClient from "../../net/websocket/WebSocketClient";
import LobbySession from "../../session/LobbySession";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/matchView/UIMatchChessItem')
export default class UIMatchChessItem extends UIBase {
    private lbl_center_left: cc.Label = null;
    private item_choose: cc.Node = null;
    private item_normal: cc.Node = null;
    private lbl_time: cc.Label = null;
    private lbl_deskName: cc.Label = null;
    private lbl_num: cc.Label = null;

    private _data: LobbyRoomListItem = null;
    lateLoad() {
        super.lateLoad();
        this.lbl_center_left = this.getChildNodeOrComponent("lbl_center_left", cc.Label);
        this.item_choose = this.getChildNodeOrComponent("item_choose");
        this.item_normal = this.getChildNodeOrComponent("item_normal");
        this.lbl_time = this.getChildNodeOrComponent("lbl_time", cc.Label);
        this.lbl_deskName = this.getChildNodeOrComponent("lbl_deskName", cc.Label);
        this.lbl_num = this.getChildNodeOrComponent("lbl_num", cc.Label);
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.node, this.EnterRoomAPI);
    }

    initData(data: LobbyRoomListItem) {
        this._data = data;
        this.initView();
    }

    initView() {
        let sb = this._data.sb / 100;
        this.setText(this.lbl_center_left, `${sb}/${sb * 2}(${this._data.ante})`)
        this.setText(this.lbl_deskName, this._data.name)
        this.setText(this.lbl_num, `${this._data.seat_count - this._data.empty_seat}/${this._data.seat_count}`);

        this.item_choose.active = this._data.participation_status != 0;
        this.item_normal.active = this._data.participation_status == 0;
        if (this._data.participation_status != 0) {
            //值取小数点后一位
            let duration = Math.floor((this._data.play_duration * 1.0 / 3600) * 10) / 10
            this.setText(this.lbl_time, `${duration}h/${duration}h`)
        }

        let displayNode = this._data.participation_status == 0 ? this.item_normal : this.item_choose;
        displayNode.getChildByName("lbl_gameType").getComponent(cc.Label).string = this.gameTypeName;
    }


    private async EnterRoomAPI() {
        //判断websocket是否已经连接上
        if (WebSocketClient.WS?.readyState != WebSocket.OPEN) {
            console.warn("websocket is not open");
            return;
        }
        if (!RoomType[this._data.room_type]) {
            console.warn("房间类型未解析:", this._data.room_type);
            UIComponent.Instance.Toast(`room_type:${this._data.room_type} is error`);
            return;
        }
        GameCache.Instance.serviceId = this._data.service_id;
        GameCache.Instance.roomName = this._data.name;
        GameCache.Instance.room_type = this._data.room_type;
        GameCache.Instance.game_type = this._data.game_type;
        GameCache.Instance.poker_type = this._data.poker_type;
        GameCache.Instance.bet_type = this._data.limit_bet_type;
        GameCache.Instance.room_id = this._data.rid;
        GameCache.Instance.seat_count = this._data.seat_count;
        GameCache.Instance.straddle = this._data.straddle_on;
        GameCache.Instance.insurance = this._data.insurance_on > 0;
        GameCache.Instance.muck_switch = this._data.muck_on;
        GameCache.Instance.voiceprint_verify_on = this._data.voiceprint_verify_on;
        GameCache.Instance.voiceprint_verify_duration = this._data.voiceprint_verify_duration;
        if (WebSocketClient.WS?.readyState == WebSocket.OPEN) {

            let response = LobbySession.APIWebUserRoominsur(this._data.rid).catch(() => { });
            if (response) {
                //UIComponent.close(UIDefine.UIMatchPlayViewForm);
                ProcedureManager.StartProcedure(ProcedureEnum.EnterTexas, { fromUI: UIDefine.UIMatchPlayViewForm, lookOn: false });//[this.UIDefine, false, 0]
            }
        } else {
            cc.warn("websocket还没有连接上:", WebSocketClient.WS.readyState);
        }
    }


    get gameTypeName() {
        let str = "NLH";
        if (this._data.game_type == 1) {
            str = "PLO4";
        } else if (this._data.game_type == 2) {
            str = "PLO5";
        } else if (this._data.game_type == 3) {
            str = "PLO6";
        } else if (this._data.poker_type == 2) {
            str = "6+";
        }
        return str;
    }

}