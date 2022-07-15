const { ccclass, property } = cc._decorator;
import UIBase from "../../../assets/script/ui/UIBase";

import HttpRequest from "../../../assets/script/net/https/HttpRequest";
import { Web_Room_Center_Groups } from "../../../assets/script/net/https/WebRequest";
//设置人数 和 桌数
// textPlayer = RoomButtons[i].transform.Find("TextPlayer").GetComponent<Text>();
// textDesk = RoomButtons[i].transform.Find("TextDesk").GetComponent<Text>();
// textPlayer.text = RoomTypesInfos[i].playerCount.ToString();
// textDesk.text = RoomTypesInfos[i].roomCount.ToString();
/**
 * @description: 
 * @return {*}
 */
@ccclass
export default class UIMatchRoom extends UIBase {
    public static instance: UIMatchRoom = null;
    private RoomTypesInfos = [];
    protected lateLoad(): void {
        cc.log(`UIMatchRoom on lateLoad`);
        super.lateLoad();
        if (UIMatchRoom.instance === null) {
            UIMatchRoom.instance = this;
        } else {
            this.destroy();
            return;
        }
        this.initRoom();
    }
    public initRoom(): void {
        let _data = { "code": 0, "data": [{ "game_type": 1, "count": 9, "player_count": 0, "sub_group": [{ "game_type": 1, "poker_type": 2, "count": 8, "player_count": 0, "sub_group": [{ "game_type": 1, "poker_type": 2, "limit_bet_type": 0, "count": 8, "player_count": 0 }] }, { "game_type": 1, "poker_type": 0, "count": 1, "player_count": 0, "sub_group": [{ "game_type": 1, "poker_type": 0, "limit_bet_type": 0, "count": 1, "player_count": 0 }] }] }, { "game_type": 2, "count": 1, "player_count": 0, "sub_group": [{ "game_type": 2, "poker_type": 0, "count": 1, "player_count": 0, "sub_group": [{ "game_type": 2, "poker_type": 0, "limit_bet_type": 0, "count": 1, "player_count": 0 }] }] }, { "game_type": 3, "count": 1, "player_count": 0, "sub_group": [{ "game_type": 3, "poker_type": 0, "count": 1, "player_count": 0, "sub_group": [{ "game_type": 3, "poker_type": 0, "limit_bet_type": 0, "count": 1, "player_count": 0 }] }] }, { "game_type": 0, "count": 5, "player_count": 0, "sub_group": [{ "game_type": 0, "poker_type": 0, "count": 4, "player_count": 0, "sub_group": [{ "game_type": 0, "poker_type": 0, "limit_bet_type": 0, "count": 4, "player_count": 0 }] }, { "game_type": 0, "poker_type": 2, "count": 1, "player_count": 0, "sub_group": [{ "game_type": 0, "poker_type": 2, "limit_bet_type": 0, "count": 1, "player_count": 0 }] }] }] }
        this.handleData(_data.data);
    }
    private handleData(data): void {
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
        for (let key in data) {
            let element = data[key];
            this.RoomTypesInfos[element.game_type].playerCount = element.player_count;
            this.RoomTypesInfos[element.game_type].roomCount = element.count;
            this.SetSixPlusData(element);
        }
        for(let i = 0; i < this.node.childrenCount; i++){
            let btn = this.node.children[i];
            btn.active = this.RoomTypesInfos[i].roomCount > 0
        }
        this.SetRoomListBtnInfo()
    }
    private SetSixPlusData(data: typeof Web_Room_Center_Groups.ResponseData): void {
        let SixPlus = []
        if (data.sub_group == null) {
            return;
        }
        for (let element in data.sub_group) {
            let item = data.sub_group[element];
            if (item.poker_type == 2) {
                SixPlus.push(item);
            }
        }
        for (let element in SixPlus) {
            let item = SixPlus[element];
            this.RoomTypesInfos[this.RoomTypesInfos.length - 1].playerCount += item.player_count;
            this.RoomTypesInfos[this.RoomTypesInfos.length - 1].roomCount += item.count;
            this.RoomTypesInfos[data.game_type].playerCount -= item.player_count;
            this.RoomTypesInfos[data.game_type].roomCount -= item.count;
        }
    }
    private SetRoomListBtnInfo():void{
        for(let i = 0; i < this.node.childrenCount; i++){
            let player:cc.Label = this.getChildNodeOrComponent("TextPlayer_"+(i+1),cc.Label);
            let desk:cc.Label = this.getChildNodeOrComponent("TextDesk_"+(i+1),cc.Label);
            player.string = this.RoomTypesInfos[i].playerCount;
            desk.string = this.RoomTypesInfos[i].roomCount;
        }
    }
}




