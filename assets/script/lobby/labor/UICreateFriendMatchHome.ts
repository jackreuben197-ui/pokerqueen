/*
 * @Author: xfj
 * @Date: 2022-10-20 15:47:35
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-14 16:09:44
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UICreateFriendMatchHome.ts
 */

import List from "../../common/List";
import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import LobbyRoomListItem from "../../frame/data/lobby/LobbyRoomListItem";
import GameUtil from "../../game/util/GameUtil";
import SceneManager from "../../manager/SceneManager";
import { WebOrgFriendRoomList } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import UIMatchChessItem from "../matchView/UIMatchChessItem";
import { UIClubModel } from "./UIClubModel";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UICreateFriendMatchHome')
export default class UICreateFriendMatchHome extends UIBase {
    @property(cc.EditBox)
    EditBox: cc.EditBox = null;

    @property(cc.Node)
    numNode: cc.Node = null;

    @property(cc.Node)
    dr: cc.Node = null;
    @property(cc.Node)
    lb_tip: cc.Node = null;
    @property(List)
    list: List = null;
    _roomList: any = []

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
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
    }
    reFreshApplyState(parms) {
        this.dr.active = parms[0];
    }
    async reqDataAgain() {
        let result: any = await UIClubModel.mInstance.WebOrgFriendRoomList().catch((content) => { console.log(`>> catch error:${WebOrgFriendRoomList.API}`, content) });
        if (!result) return;
        let data: any = WebOrgFriendRoomList.Response.data
        this._roomList = data?.records;
        this.list.numItems = data?.records?.length;

        this.lb_tip.active = this.list.numItems == 0
    }

    createMatch() {
        UIComponent.open(UIDefine.UICreateMatch, null, { SceneUI: SceneManager.Instance.currUI });
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
        UIComponent.open(UIDefine.UIApplyJoin)
    }
    async joinMatch() {
        this.EditBox.string.trim();
        if (this.EditBox.string.length != 7) {
            return;
        }
        let _data: any = await UIClubModel.mInstance.APIOrgInvitationRoom(this.EditBox.string);
        if (_data?.data?.data) {
            _data = new LobbyRoomListItem(_data?.data?.data);
            GameUtil.EnterRoomAPI(_data, [UIDefine.UICreateMatch]);
        }
        else {
            UIComponent.Instance.Toast('房间信息错误')
        }
    }



    // update (dt) {}
}
