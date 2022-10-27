const { ccclass } = cc._decorator;
import UIBase from "../../ui/UIBase";
import { Web_Room_Center_Groups } from "../../net/https/WebRequest";
import { UIDefine } from "../../define/UIDefine";
import UIComponent from "../../ui/UIComponent";
import GC from "../../frame/GameControl";
import { GameType } from "../../game/util/GameUtil";
import { TLobbyGroup } from "../../config/TTypeConfig";
import SceneManager from "../../manager/SceneManager";
@ccclass
export default class UIMatchRoom extends UIBase {
    private room_NLH: cc.Node = null;
    private room_Plus6: cc.Node = null;
    private room_456: cc.Node = null;

    // 存放三种类型  德州   6+  奥马哈  顺序对应预制体 不能错
    public RoomTypesInfos = [];
    protected lateLoad(): void {
        super.lateLoad();
        this.room_NLH = this.getChildNodeOrComponent("room_NLH");
        this.room_Plus6 = this.getChildNodeOrComponent("room_Plus6");
        this.room_456 = this.getChildNodeOrComponent("room_456");
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.room_NLH, this.clickRoom, GameType.Holdem);
        this.bindClick(this.room_Plus6, this.clickRoom, GameType.Plus6);
        this.bindClick(this.room_456, this.clickRoom, GameType.Omaha4);
    }

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_Room_Center_Groups.API: {
                this.updateView();
            } break;
        }
    }

    updateView() {
        let group = GC.data.lobby.lobbyGroup;
        this.setRoomInfo(this.room_NLH, group.getGroupByType(GameType.Holdem))
        this.setRoomInfo(this.room_Plus6, group.getGroupByType(GameType.Plus6))
        this.setRoomInfo(this.room_456, group.omahaGroup)
    }

    public setRoomInfo(room: cc.Node, data: TLobbyGroup): void {
        let player: cc.Label = room.getChildByName("lbl_bottom_left").getComponent(cc.Label);
        let desk: cc.Label = room.getChildByName("lbl_bottom_right").getComponent(cc.Label);
        this.setText(player, data.player_count);
        this.setText(desk, data.count);
    }


    private clickRoom(type: GameType) {
        UIComponent.open(
            UIDefine.UIMatchPlayViewForm,
            {
                type: type,
                page: 0
            },
            { SceneUI: SceneManager.Instance.currUI }
        );
    }
}




