/*
 * @Author: xfj
 * @Date: 2022-10-20 15:47:35
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-07 12:35:12
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/createMatch/UIFriendMatch.ts
 */

import List from "../../../common/List";
import { EventName } from "../../../config/EventName";
import { UIDefine } from "../../../define/UIDefine";
import LobbyRoomListItem from "../../../frame/data/lobby/LobbyRoomListItem";
import GameUtil from "../../../game/util/GameUtil";
import SceneManager from "../../../manager/SceneManager";
import { APIOrgFriendRoomList, APIUserDiamondsWallet } from "../../../net/https/WebRequest";
import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";
import { UIClubModel } from "../../labor/UIClubModel";
import TabNode from "../../../common/tabNode";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import UIFriendMatchItem from "./../createMatch/UIFriendMatchItem";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { StringHelper } from "../../../helper/StringHelper";
const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/UIFriendMatch')
export default class UIFriendMatch extends UIBase {
    @property(cc.Node)
    numNode: cc.Node = null;

    @property(cc.Node)
    lb_tip: cc.Node = null;

    @property(List)
    list: List = null;

    @property(cc.Node)
    joinBtnBg: cc.Node = null;
    @property(cc.Button)
    joinBtn: cc.Button = null;
    @property(cc.Label)
    num_diamond: cc.Label = null;

    _roomList: any = []

    tabNode: TabNode = null;
    fastBeganNode: cc.Node = null;
    dataNode: cc.Node = null;
    node0: cc.Node = null;
    node1: cc.Node = null;
    private comFormTitle: cc.Label = null;
    _selectTitle = 0;
    _keyNodeNumArr = []
    _keyNodeString = ''
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("title_lbl", cc.Label);

        this.tabNode = this.getChildNodeOrComponent('tabNode', TabNode)
        this.fastBeganNode = this.getChildNodeOrComponent('fastBeganNode')
        this.dataNode = this.getChildNodeOrComponent('dataNode')
        this.node0 = this.getChildNodeOrComponent('node0')
        this.node1 = this.getChildNodeOrComponent('node1')

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIClub_RoomJoin_Title"
        this.setText(this.comFormTitle, title)

        for (let index = 0; index < this.numNode.childrenCount; index++) {
            const element = this.numNode.children[index].getChildByName('New Label').getComponent(cc.Label);
            element.string = '';
        }
        this._keyNodeNumArr = []
        this._keyNodeString = ''
        this.reqDataAgain();
        this.initDiamond();

    }
    titleNodeClick(customData) {
        this._selectTitle = Number(customData)
        this.fastBeganNode.active = this._selectTitle == 1;
        this.dataNode.active = this._selectTitle == 2;
    }
    async initDiamond() {
        await UIClubModel.mInstance.APIUserDiamondsWallet();
        let wallet = APIUserDiamondsWallet.Response.data;
        ClubCache._diamonds_wallet = wallet.diamonds_wallet
        this.num_diamond.string = ClubCache._diamonds_wallet.diamonds
    }
    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(UIFriendMatchItem);
        item.initData(this._roomList[index]);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.updateFriendChessView, this.reqDataAgain);
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
        UIComponent.open(UIDefine.UIKeyNode, { cb: this.ketNodeCall.bind(this) })
        // for (let index = 0; index < this.numNode.childrenCount; index++) {
        //     const element = this.numNode.children[index].getChildByName('New Label').getComponent(cc.Label);
        //     element.string = '';
        // }
        // for (let index = 0; index < this.EditBox.string.length; index++) {
        //     const element = this.EditBox.string[index];
        //     const item = this.numNode.children[index].getChildByName('New Label').getComponent(cc.Label);
        //     item.string = element;
        // }
        // this.EditBox.string.trim();
        // this.joinBtn.interactable = this.EditBox.string.length == 6
        // this.joinBtnBg.opacity = this.EditBox.string.length == 6 ? 255 : 25
    }
    ketNodeCall(data) {
        switch (Number(data)) {
            case 10:
                this._keyNodeNumArr = []
                break;
            case 11:
                if (this._keyNodeNumArr.length > 0) {
                    this._keyNodeNumArr.pop()
                    break
                }
            default:
                if (this._keyNodeNumArr.length < 6) {
                    this._keyNodeNumArr.push(data)
                }
                else {
                    this._keyNodeNumArr[5] = data;
                }
                break;
        }
        if (this._keyNodeNumArr.length >= 6) {
            UIComponent.close(UIDefine.UIKeyNode)
        }
        this.joinBtn.interactable = this._keyNodeNumArr.length == 6
        for (let index = 0; index < this.numNode.childrenCount; index++) {
            const element = this.numNode.children[index].getChildByName('New Label').getComponent(cc.Label);
            element.string = '';
            this._keyNodeString = ''
        }
        for (let index = 0; index < this._keyNodeNumArr.length; index++) {
            const item = this.numNode.children[index].getChildByName('New Label').getComponent(cc.Label);
            item.string = this._keyNodeNumArr[index];
            this._keyNodeString = this._keyNodeString + this._keyNodeNumArr[index]
        }

    }

    async joinMatch() {

        let _data: any = await UIClubModel.mInstance.APIOrgInvitationRoom(this._keyNodeString);
        if (_data?.data?.data) {
            _data = new LobbyRoomListItem(_data?.data?.data);
            GameUtil.EnterRoomAPI(_data, [UIDefine.UICreateMatch]);
        }
        else {
            let str = i18nMgr.Get('UIFriendsTable_JoinRoomNumberWrong')
            this._keyNodeString = StringHelper.Format(str, [this._keyNodeString])
            UIComponent.Instance.Toast(this._keyNodeString)
        }
    }
    openMessageList() {
        UIComponent.open(UIDefine.UIMyMessage, { from: 0 });
    }
    // update (dt) {}
}
