const { ccclass } = cc._decorator;
import UIBase from "../../ui/UIBase";
import { Web_Room_Center_Groups } from "../../net/https/WebRequest";
import { UIDefine } from "../../define/UIDefine";
import UIComponent from "../../ui/UIComponent";
@ccclass
export default class UIMatchRoom extends UIBase {
    public static instance: UIMatchRoom = null;
    private roomLen: number = 0;
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
    public handleData(data: any, roomContent: cc.Node): any[] {
        this.RoomTypesInfos = [];
        for (let i = 0; i < this.node.childrenCount; i++) {
            let obj = {
                gameType: 0,
                pokerType: 0,
                playerCount: 0,
                roomCount: 0,
            }
            if (i <= 3) {
                obj.gameType = i;
                this.RoomTypesInfos.push(obj)
            } else {
                obj.pokerType = 2;
                this.RoomTypesInfos.push(obj)
            }
        }
        let self = this;
        data.forEach((element) => {
            self.RoomTypesInfos[element.game_type].playerCount = element.player_count;
            self.RoomTypesInfos[element.game_type].roomCount = element.count;
            self.SetSixPlusData(element);
        })
        // for (let key in data) {
        //     let element = data[key];
        //     this.RoomTypesInfos[element.game_type].playerCount = element.player_count;
        //     this.RoomTypesInfos[element.game_type].roomCount = element.count;
        //     this.SetSixPlusData(element);
        // }
        for (let i = 0; i < roomContent.childrenCount; i++) {
            let btn = roomContent.children[i];
            // btn.active = this.RoomTypesInfos[i].roomCount > 0
            if (btn.active) {
                this.roomLen++;
            }
        }
        return this.RoomTypesInfos;
    }
    public SetSixPlusData(data: typeof Web_Room_Center_Groups.ResponseData): void {
        let SixPlus = []
        if (data.sub_group == null) {
            return;
        }
        data.sub_group.forEach((item) => {
            if (item.poker_type == 2) {
                SixPlus.push(item);
            }
        })
        // for (let element in data.sub_group) {
        //     let item = data.sub_group[element];
        //     if (item.poker_type == 2) {
        //         SixPlus.push(item);
        //     }
        // }
        SixPlus.forEach((item) => {
            this.RoomTypesInfos[this.RoomTypesInfos.length - 1].playerCount += item.player_count;
            this.RoomTypesInfos[this.RoomTypesInfos.length - 1].roomCount += item.count;
            this.RoomTypesInfos[data.game_type].playerCount -= item.player_count;
            this.RoomTypesInfos[data.game_type].roomCount -= item.count;
        })
        // for (let element in SixPlus) {
        //     let item = SixPlus[element];
        //     this.RoomTypesInfos[this.RoomTypesInfos.length - 1].playerCount += item.player_count;
        //     this.RoomTypesInfos[this.RoomTypesInfos.length - 1].roomCount += item.count;
        //     this.RoomTypesInfos[data.game_type].playerCount -= item.player_count;
        //     this.RoomTypesInfos[data.game_type].roomCount -= item.count;
        // }
    }
    public SetRoomListBtnInfo(room: cc.Node): void {
        this.RoomTypesInfos.forEach((info, index) => {
            let roomChild: cc.Node = room.children[index];
            let player: cc.Label = roomChild.getChildByName("lbl_bottom_left").getComponent(cc.Label);
            let desk: cc.Label = roomChild.getChildByName("lbl_bottom_right").getComponent(cc.Label);
            player.string = info.playerCount;
            desk.string = info.roomCount;
        })
        // for(let element in this.RoomTypesInfos){
        //     let info = this.RoomTypesInfos[element];
        //     let roomChild:cc.Node = room.children[element];
        //     let player:cc.Label = roomChild.getChildByName("TextPlayer_"+(parseInt(element)+1)).getComponent(cc.Label);
        //     let desk:cc.Label = roomChild.getChildByName("TextDesk_"+(parseInt(element)+1)).getComponent(cc.Label);
        //     player.string = info.playerCount;
        //     desk.string = info.roomCount;
        // }
    }
    protected regiterTouchEvents(): void {
        let roomList: cc.Node = this.node;
        roomList.children.forEach((item, index) => {
            cc.log(`UIMatchRoom-----item-${index}`)
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




