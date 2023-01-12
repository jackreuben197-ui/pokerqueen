/*
 * @Author: xfj
 * @Date: 2022-10-20 15:47:35
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-12 14:44:31
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIFriendMatch.ts
 */

import List from "../../common/List";
import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import LobbyRoomListItem from "../../frame/data/lobby/LobbyRoomListItem";
import GameUtil from "../../game/util/GameUtil";
import SceneManager from "../../manager/SceneManager";
import { APIOrgFriendRoomList } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "../labor/UIClubModel";
import UIMatchChessItem from "../matchView/UIMatchChessItem";
import ComFormTitle from "../../common/ComFormTitle";
import UIClubMatchItem from "./UIClubMatchItem";
const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/UIFriendMatch')
export default class UIFriendMatch extends UIBase {
    @property(cc.EditBox)
    EditBox: cc.EditBox = null;

    @property(cc.Node)
    numNode: cc.Node = null;

    // @property(cc.Node)
    // dr: cc.Node = null;
    @property(cc.Node)
    lb_tip: cc.Node = null;
    @property(List)
    list: List = null;
    _roomList: any = []

    titleNode: cc.Node = null;
    fastBeganNode: cc.Node = null;
    dataNode: cc.Node = null;
    node0: cc.Node = null;
    node1: cc.Node = null;
    private comFormTitle: ComFormTitle = null;
    _selectTitle = 0;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

        this.titleNode = this.getChildNodeOrComponent('titleNode')
        this.fastBeganNode = this.getChildNodeOrComponent('fastBeganNode')
        this.dataNode = this.getChildNodeOrComponent('dataNode')
        this.node0 = this.getChildNodeOrComponent('node0')
        this.node1 = this.getChildNodeOrComponent('node1')

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIClub_FastBangan"
        this.comFormTitle.initData(title, this);

        this.EditBox.string = ''
        for (let index = 0; index < this.numNode.childrenCount; index++) {
            const element = this.numNode.children[index].getChildByName('New Label').getComponent(cc.Label);
            element.string = '';
        }
        this.titleNodeClick(null, this._selectTitle)
        this.reqDataAgain();
    }
    titleNodeClick(event, customData) {
        this._selectTitle = customData
        this.node0.getChildByName('block').active = this._selectTitle == 0
        this.node1.getChildByName('block').active = this._selectTitle == 1
        this.node0.getChildByName('title').color = this._selectTitle == 0 ? cc.color().fromHEX('#35A3B3') : cc.color().fromHEX('#FFFFFF')
        this.node1.getChildByName('title').color = this._selectTitle == 1 ? cc.color().fromHEX('#35A3B3') : cc.color().fromHEX('#FFFFFF')
        this.fastBeganNode.active = this._selectTitle == 0;
        this.dataNode.active = this._selectTitle == 1;
        this.initDiamond();
    }
    initDiamond() {

    }
    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(UIClubMatchItem);
        item.initData(this._roomList[index]); //new LobbyRoomListItem(this._roomList[index])
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.updateFriendChessView, this.reqDataAgain);
    }
    reFreshApplyState(parms) {
        // this.dr.active = parms[0];
    }
    async reqDataAgain() {
        let result: any = await UIClubModel.mInstance.APIOrgFriendRoomList().catch((content) => { console.log(`>> catch error:${APIOrgFriendRoomList.API}`, content) });
        if (!result) return;
        let data: any = APIOrgFriendRoomList.Response.data
        this._roomList = data?.records;
        this.list.numItems = data?.records?.length;

        this.lb_tip.active = this.list.numItems == 0
    }

    createMatch() {
        UIComponent.open(UIDefine.UIClubCreateMatchHome, 1, { SceneUI: SceneManager.Instance.currUI });
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
        UIComponent.open(UIDefine.UIMine_Message)
    }
    async joinMatch() {
        this.EditBox.string.trim();
        if (this.EditBox.string.length != 6) {
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
    openMessageList() {
        UIComponent.open(UIDefine.UIMine_MessageList, { enterType: 0 });

    }
    // update (dt) {}
}
