/*
 * @Author: xfj
 * @Date: 2022-10-20 15:47:35
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-25 17:46:40
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UICreateFriendMatchHome.ts
 */

import List from "../../common/List";
import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import LobbyRoomListItem from "../../frame/data/lobby/LobbyRoomListItem";
import GameUtil, { GameType } from "../../game/GameUtil";
import { APIOrgFriendRoomList } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import UIMatchChessItem from "../matchView/UIMatchChessItem";
import { UIClubModel } from "./UIClubModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UICreateFriendMatchHome extends UIBase {
    @property(cc.EditBox)
    EditBox: cc.EditBox = null;

    @property(cc.Node)
    numNode: cc.Node = null;

    @property(cc.Node)
    redTip: cc.Node = null;

    @property(List)
    list: List = null;
    _roomList: any = []

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any) {
        super.onShow(param);
        this.EditBox.string = ''
        for (let index = 0; index < this.numNode.childrenCount; index++) {
            const element = this.numNode.children[index].getChildByName('New Label').getComponent(cc.Label);
            element.string = '';
        }
        this.reqDataAgain();
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(UIMatchChessItem);
        item.initData(new LobbyRoomListItem(this._roomList[index]));
    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.updateFriendChessView, this.reqDataAgain);
        this.listen(EventName.bringInApply, this.setRedTip);
    }
    async reqDataAgain() {
        await UIClubModel.mInstance.APIOrgFriendRoomList();
        let data: any = APIOrgFriendRoomList.Response.data
        if (!data) return
        this._roomList = data?.records;
        this.list.numItems = data?.records?.length;
    }

    createMatch() {
        UIComponent.open(UIDefine.UICreateMatch);
    }
    numNodeClick() {
        for (let index = 0; index < this.numNode.childrenCount; index++) {
            const element = this.numNode.children[index].getChildByName('New Label').getComponent(cc.Label);
            element.string = '';
        }
        for (let index = 0; index < this.EditBox.string.length; index++) {
            const element = this.EditBox.string[index];
            const item = this.numNode.children[index].getChildByName('New Label').getComponent(cc.Label);
            item.string = element;
        }
    }
    applyJoin() {
        this.redTip.active = false;
        UIComponent.open(UIDefine.UIApplyJoin)
    }
    async joinMatch() {
        this.EditBox.string.trim();
        if (this.EditBox.string.length != 6) {
            return;
        }
        let _data: any = await UIClubModel.mInstance.APIOrgInvitationRoom(this.EditBox.string);
        if (_data?.data?.data) {
            _data = new LobbyRoomListItem(_data?.data?.data);
            GameUtil.EnterRoomAPI(_data, UIDefine.UICreateMatch);
        }
        else {
            UIComponent.Instance.Toast('房间信息错误')
        }
    }
    setRedTip() {
        this.redTip.active = true;
    }


    // update (dt) {}
}
