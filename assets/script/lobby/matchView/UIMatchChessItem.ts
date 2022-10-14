import { ProcedureEnum } from "../../define/EIDefine";
import { UIDefine } from "../../define/UIDefine";
import LobbyRoomListItem from "../../frame/data/lobby/LobbyRoomListItem";
import GC from "../../frame/GameControl";
import GameUtil from "../../game/GameUtil";
import { i18nMgr } from "../../i18n/i18nMgr";
import ProcedureManager from "../../manager/ProcedureManager";
import WebSocketClient from "../../net/websocket/WebSocketClient";
import LobbySession from "../../session/LobbySession";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import PlayViewItem from "../view/PlayViewItem";

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

    private img_head: cc.Sprite = null;
    private lbl_unionName: cc.Label = null;

    private _data: LobbyRoomListItem = null;
    lateLoad() {
        super.lateLoad();
        this.lbl_center_left = this.getChildNodeOrComponent("lbl_center_left", cc.Label);
        this.item_choose = this.getChildNodeOrComponent("item_choose");
        this.item_normal = this.getChildNodeOrComponent("item_normal");
        this.lbl_time = this.getChildNodeOrComponent("lbl_time", cc.Label);
        this.lbl_deskName = this.getChildNodeOrComponent("lbl_deskName", cc.Label);
        this.lbl_num = this.getChildNodeOrComponent("lbl_num", cc.Label);

        this.img_head = this.getChildNodeOrComponent("img_head", cc.Sprite);
        this.lbl_unionName = this.getChildNodeOrComponent("lbl_unionName", cc.Label);

        this.setActive(this.img_head, false)
        this.setActive(this.lbl_unionName, false)
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

        let isJoin = this._data.participation_status == 1;
        this.item_choose.active = isJoin;
        this.item_normal.active = !isJoin;

        let displayNode = this._data.participation_status == 0 ? this.item_normal : this.item_choose;
        displayNode.getChildByName("lbl_gameType").getComponent(cc.Label).string = this.gameTypeName;

        let playView = this.node.getChildByName("lbl_time").getComponent(PlayViewItem)
        if (isJoin) {
            playView.updateItemInfo(this._data);
        } else {
            playView.updateNormalItem(this._data.play_duration);
        }
    }


    private async EnterRoomAPI() {
        if (WebSocketClient.WS?.readyState == WebSocket.OPEN) {
            if (this._data.room_type_is_legal) {
                //未开放房间类型
                if (!GameUtil.IsOpenRoomType(this._data.room_type)) {
                    //UIComponent.Instance.Toast(i18nMgr.Get("adaptation10301"));
                    UIComponent.Instance.Toast();
                    return;
                }
                let response = LobbySession.APIWebUserRoominsur(this._data.rid).catch(() => { });
                if (response) {
                    GC.data.lobby.roomList.selected = this._data;
                    ProcedureManager.StartProcedure(ProcedureEnum.EnterTexas, { fromUI: UIDefine.UIMatchPlayViewForm, lookOn: false });//[this.UIDefine, false, 0]
                }
            } else {
                console.warn("房间类型未解析:", this._data.room_type);
                UIComponent.Instance.Toast(`room_type:${this._data.room_type} is error`);
            }
        } else {
            cc.warn("websocket is not open:", WebSocketClient.WS.readyState);
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