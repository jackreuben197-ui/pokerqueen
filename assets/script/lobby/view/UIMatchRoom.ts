const { ccclass } = cc._decorator;
import UIBase from "../../ui/UIBase";
import { Web_Room_Center_Groups } from "../../net/https/WebRequest";
import { UIDefine } from "../../define/UIDefine";
import UIComponent from "../../ui/UIComponent";
@ccclass
export default class UIMatchRoom extends UIBase {
    public static instance: UIMatchRoom = null;
    private roomLen: number = 0;
    // 存放三种类型  德州   6+  奥马哈  顺序对应预制体 不能错
    public RoomTypesInfos = [];
    protected lateLoad(): void {
        super.lateLoad();
        if (UIMatchRoom.instance === null) {
            UIMatchRoom.instance = this;
        } else {
            this.destroy();
            return;
        }
    }
    onShow(param?: any): void {
        super.onShow();
        this.handleData(param.data, this.node);
        this.SetRoomListBtnInfo(this.node);
    }
    //gameType 游戏类型 0-德州 1-OMAHA4 2-OMAHA5 3-OMAHA6
    public handleData(data: any, roomContent: cc.Node): any[] {
        this.RoomTypesInfos = [];
        for (let i = 0; i < this.node.childrenCount; i++) {
            let obj = {
                gameType: 0,
                pokerType: 0,
                playerCount: 0,
                roomCount: 0,
            }
            obj.gameType = i;
            this.RoomTypesInfos.push(obj)
        }
        let self = this;
        data.forEach((element) => {
            if (element.game_type == 0) {
                let sub_group = element.sub_group;
                if (sub_group) {
                    sub_group.forEach((subInfo) => {
                        if (subInfo.poker_type == 2) {
                            // 6+
                            self.RoomTypesInfos[1].roomCount += subInfo.count;
                            self.RoomTypesInfos[1].playerCount += subInfo.player_count;
                        } else {
                            // 德州
                            self.RoomTypesInfos[0].roomCount += subInfo.count;
                            self.RoomTypesInfos[0].playerCount += subInfo.player_count;
                        } 
                    })
                }
            } else {
                //奥马哈
                self.RoomTypesInfos[2].roomCount += element.count;
                self.RoomTypesInfos[2].playerCount += element.player_count;
            }
        })
        for (let i = 0; i < roomContent.childrenCount; i++) {
            let btn = roomContent.children[i];
            if (btn.active) {
                this.roomLen++;
            }
        }
        return this.RoomTypesInfos;
    }
    public SetRoomListBtnInfo(room: cc.Node): void {
        this.RoomTypesInfos.forEach((info, index) => {
            let roomChild: cc.Node = room.children[index];
            let player: cc.Label = roomChild.getChildByName("lbl_bottom_left").getComponent(cc.Label);
            let desk: cc.Label = roomChild.getChildByName("lbl_bottom_right").getComponent(cc.Label);
            player.string = info.playerCount;
            desk.string = info.roomCount;
        })
    }
    protected regiterTouchEvents(): void {
        let roomList: cc.Node = this.node;
        roomList.children.forEach((item, index) => {
            item["index"] = index;
            item.on(cc.Node.EventType.TOUCH_END, this.clickRoom, this)
        })
    }
    protected removeTouchEvents(): void {
        let roomList: cc.Node = this.node;
        roomList.children.forEach((item, index) => {
            item.off(cc.Node.EventType.TOUCH_END, this.clickRoom, this)
        })
    }
    private clickRoom(e: cc.Event.EventTouch) {
        let roomInfo = this.RoomTypesInfos[e.target.index];
        let sendDate = {
            game_type: roomInfo.gameType,
            poker_type: roomInfo.pokerType,
            index: parseInt(e.target.index),
            len: this.roomLen,
        }
        UIComponent.open(UIDefine.UIMatchPlayViewForm, sendDate);
    }
}




