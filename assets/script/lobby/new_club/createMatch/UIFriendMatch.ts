/*
 * @Author: xfj
 * @Date: 2023-03-23 10:00:32
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-13 14:26:20
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/createMatch/UIFriendMatch.ts
 */
/*
 * @Author: xfj
 * @Date: 2022-10-20 15:47:35
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-04-06 10:31:45
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/createMatch/UIFriendMatch.ts
 */

import List from "../../../common/List";
import { EventName } from "../../../config/EventName";
import { UIDefine } from "../../../define/UIDefine";
import LobbyRoomListItem from "../../../frame/data/lobby/LobbyRoomListItem";
import GameUtil, { GameEnterType } from "../../../game/util/GameUtil";
import SceneManager from "../../../manager/SceneManager";
import { APIOrgFriendRoomList, APIUserDiamondsWallet, web_api_friend_room_stats } from "../../../net/https/WebRequest";
import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";
import { UIClubModel } from "../../labor/UIClubModel";
import TabNode from "../../../common/tabNode";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import UIFriendMatchItem from "./../createMatch/UIFriendMatchItem";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { StringHelper } from "../../../helper/StringHelper";
import { WWW } from "../../../net/https/WebRequest";
import { Web_RoomSitApplyRecords } from "../../../net/https/WebRequest";
import GC from "../../../frame/GameControl";
import { ProtocolCode } from "../../../net/websocket/ProtocolCode";
import { ServerMessageGetMsg } from "../../../protobuf/holdem/recv_get_msg_pb";
import { Broadcast, BroadcastCode } from "../../../net/websocket/ProtocolHoldemMessages";
import PublicHelper from "../../../helper/PublicHelper";
const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/UIFriendMatch')
export default class UIFriendMatch extends UIBase {
    @property(cc.Node)
    numNode: cc.Node = null;

    @property(cc.Label)
    pjlbl: cc.Label = null;

    @property(cc.Label)
    datalbl: cc.Label = null;

    @property(cc.Node)
    lb_tip: cc.Node = null;
    @property(List)
    list: List = null;

    @property(cc.Node)
    red: cc.Node = null;

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
        GC.notify.register(ProtocolCode.Protocol_Holdem_GetMsg, this.ProtocolHoldemGetMsgHandler, this);  // 广播表情
    }
    ProtocolHoldemGetMsgHandler(rec: ServerMessageGetMsg.AsObject) {
        let json = PublicHelper.Base64ToJsonString(rec.extra.toString());
        let responseData = Broadcast.Response(json);
        let code: number = responseData.code;
        //let data: string = responseData.data;
        if (code == BroadcastCode.SeatFriendApplyRefreshMsgNum) {
            this.RefreshMsgRed();
        }
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
        this.initFriendData();
        this.red.active = false;
        this.RefreshMsgRed();
        this.refreshJoinBtn();
    }
    async initFriendData() {
        await UIClubModel.mInstance.web_api_friend_room_stats(false);
        let data = web_api_friend_room_stats.Response.data;
        let lbl_7 = this.getChildNodeOrComponent('lb_7', cc.Label)
        this.setText(lbl_7, data.friend_room_stats_nlh.game_num)
        let lbl_8 = this.getChildNodeOrComponent('lb_8', cc.Label)
        this.setText(lbl_8, data.friend_room_stats_nlh.hand_num)
        let lbl_9 = this.getChildNodeOrComponent('lb_9', cc.Label)
        this.setText(lbl_9, data.friend_room_stats_plo.game_num)
        let lbl_10 = this.getChildNodeOrComponent('lb_10', cc.Label)
        this.setText(lbl_10, data.friend_room_stats_plo.hand_num)
        let lbl_11 = this.getChildNodeOrComponent('lb_11', cc.Label)
        this.setText(lbl_11, data.friend_room_stats_6.game_num)
        let lbl_12 = this.getChildNodeOrComponent('lb_12', cc.Label)
        this.setText(lbl_12, data.friend_room_stats_6.hand_num)


    }
    openDataMange() {
        UIComponent.open(UIDefine.UIFriendDataMange, { type: 1 }, { SceneUI: SceneManager.Instance.currUI })
    }
    openHistory() {
        UIComponent.open(UIDefine.UICareerRecord, { type: 1, coinType: 3 }, { SceneUI: SceneManager.Instance.currUI })

    }

    onDiamondClick() {
        //跳转商城
        UIComponent.open(UIDefine.UIMall, null, { SceneUI: SceneManager.Instance.currUI });
    }

    titleNodeClick(event, customData) {
        this._selectTitle = Number(customData)

        // if (this._selectTitle == 2) {
        //     UIComponent.Instance.Toast(i18nMgr.Get('adaptation10113'))
        // }
        this.fastBeganNode.active = this._selectTitle == 1;
        this.dataNode.active = this._selectTitle == 2;
        this.pjlbl.node.color = this._selectTitle == 1 ? cc.color().fromHEX('#FFFFFF') : cc.color().fromHEX('#E6E8EC')
        this.datalbl.node.color = this._selectTitle == 2 ? cc.color().fromHEX('#FFFFFF') : cc.color().fromHEX('#E6E8EC')
    }
    async initDiamond() {
        await UIClubModel.mInstance.APIUserDiamondsWallet(false);
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
        let result: any = await UIClubModel.mInstance.APIOrgFriendRoomList(false).catch((content) => { console.log(`>> catch error:${APIOrgFriendRoomList.API}`, content) });
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
    }
    ketNodeCall(data) {
        switch (Number(data)) {
            case 10:
                this._keyNodeNumArr = []
                break;
            case 11:
                if (this._keyNodeNumArr.length > 0) {
                    this._keyNodeNumArr.pop()

                }
                break
            // case 0:
            // case 1:
            // case 2:
            // case 3:
            // case 4:
            // case 5:
            // case 6:
            // case 7:
            // case 7:
            // case 8:
            // case 9:
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
        this.refreshJoinBtn();

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

    refreshJoinBtn() {
        this.joinBtn.interactable = this._keyNodeNumArr.length == 6
        this.joinBtn.node.getChildByName('Rectangle').active = this.joinBtn.interactable
    }



    async joinMatch() {

        let _data: any = await UIClubModel.mInstance.APIOrgInvitationRoom(this._keyNodeString);
        if (_data?.data?.data) {
            _data = new LobbyRoomListItem(_data?.data?.data);
            //GameUtil.EnterRoomAPI(_data, [UIDefine.UICreateMatch]);
            GameUtil.EnterRoomAPI(_data, { game_enter_type: GameEnterType.Friend });
        }
        else {
            let str = i18nMgr.Get('UIFriendsTable_JoinRoomNumberWrong')
            this._keyNodeString = StringHelper.Format(str, [this._keyNodeString])
            UIComponent.Instance.Toast(this._keyNodeString)
        }
    }
    openMessageList() {
        UIComponent.open(UIDefine.UIMsgBring, { from: 0, name: 'UIClub_RoomSitApplyRecords_title' });
        // UIComponent.open(UIDefine.UIMsgBring, { from: 0 });
    }
    // update (dt) {}

    //刷新带入红点
    RefreshMsgRed() {

        WWW.Instance.CommonAPI(
            {
                web_class: Web_RoomSitApplyRecords,
                body: {
                    status: 1,
                    limit: 1,
                    offset: 0,
                },
                juhua: false
            }
        ).then(
            (res: any) => {
                if (res.data?.data) {
                    let isShow = false;
                    res.data.data.forEach(recd => {
                        if (recd.status == 1) {
                            isShow = true;
                        }
                    });
                    isShow && (this.red.active = true);
                }
            },
            (res: any) => {

            }
        )
    }
}
