import List from "../../common/List";
import { EventName } from "../../config/EventName";
import LobbyRoomListModel from "../../frame/data/lobby/LobbyRoomListModel";
import GC from "../../frame/GameControl";
import { GameType, PokerType } from "../../game/util/GameUtil";
import { WebRoomCenterRooms, WebRoomCenterRoomsBlinds, WebRoomCenterRoomsBlindsClub, WebRoomCenterRoomsClub } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import UIMatchChessItem from "./UIMatchChessItem";


/**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈ ꧁༺ ༒ ༻꧂≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
    房间（牌桌）选择界面
 ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈ ༺༒༻ ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/


const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/matchView/UIMatchChessView')
export default class UIMatchChessView extends UIBase {

    private list: List = null;
    private gameTypeNode: cc.Node = null;
    private sbNode: cc.Node = null;
    private sbTab: cc.Node = null;


    private _gameTypeName = ["NLH", "PLO4", "PLO5", "PLO6", "6+"];
    private _curGameType: GameType = null;
    private _roomList: LobbyRoomListModel = null;
    private _isClub: boolean = false;
    async onShow(type?: GameType, isClub: boolean = false) {
        super.onShow(type, isClub);
        this._isClub = isClub;

        this._roomList = GC.data.lobby.roomList;
        this._curGameType = null;
        this.clickGameType(type);
    }

    protected lateLoad(): void {
        super.lateLoad();

        this.list = this.getChildNodeOrComponent("list", List);
        this.gameTypeNode = this.getChildNodeOrComponent("gameTypeNode");
        this.sbNode = this.getChildNodeOrComponent("sbNode");
        this.sbTab = this.sbNode.children[0];

        this.list.scrollingCB = this.scrollingCB;
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.updateChessView, this.reqDataAgain);
    }

    protected regiterTouchEvents(): void {
        this.gameTypeNode.children.forEach((node, index) => {
            let lbl = node.getChildByName("lbl").getComponent(cc.Label);
            this.setText(lbl, this._gameTypeName[index]);
            this.bindClick(node, this.clickGameType, index, true);
        })
    }

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case WebRoomCenterRoomsBlinds.API: {
                if (!this._isClub) {
                    this.updateSBTabs();
                }
            } break;
            case WebRoomCenterRoomsBlindsClub.API: {
                if (this._isClub) {
                    this.updateSBTabs();
                }
            } break;
            case WebRoomCenterRooms.API: {
                if (sendInfo.limit && !this._isClub) {
                    this.updateList();
                }
            } break;
            case WebRoomCenterRoomsClub.API: {
                if (sendInfo.limit && this._isClub) {
                    this.updateList();
                }
            } break;
        }
    }

    updateSBTabs() {
        let sbNodes = this.sbNode.children;
        let sbs = GC.data.lobby.roomBlinds.getSbs(this._isClub);
        sbs.forEach((sb, index) => {
            let sbNode = null;
            if (index < sbNodes.length) {
                sbNode = sbNodes[index];
            } else {
                sbNode = cc.instantiate(this.sbTab);
                sbNode.parent = this.sbNode;
            }
            sbNode.active = true;
            this.bindClick(sbNode, this.clickSB, index, true);
            let lblNode = sbNode.getChildByName("lbl");
            let sbLab = lblNode.getComponent(cc.Label);

            let str = "UIMatch_GtO8YEdb";
            if (sb != 0) {
                let a = sb / 100;
                str = `${a}/${a * 2}`;
            }

            this.setText(sbLab, str);
        })

        if (sbNodes.length > sbs.length) {
            for (let index = sbs.length; index < sbNodes.length; index++) {
                sbNodes[index].active = false;
            }
        }

        this.switchSBTabState(0);
    }

    updateList() {
        this.list.numItems = this._roomList.getList(this._isClub).length;
        let lbl_no:cc.Node = this.getChildNodeOrComponent("lbl_no");
        lbl_no.active = this.list.numItems == 0;
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(UIMatchChessItem);
        item.initData(this._roomList.getList(this._isClub)[index]);
    }

    scrollingCB = (scrollView: cc.ScrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset()
            let isDown = cur.y >= max.y;
            if (isDown && this._roomList.canReq) {
                this._roomList.dropDownReq(true, this._isClub);
            }
        }
    }

    clickGameType(gameType) {
        if (this._curGameType != gameType) {
            this._curGameType = gameType;
            this.switchGameTypeTabState()

            this.reqDataAgain();
        }
    }

    //重新拉取数据
    reqDataAgain() {
        let gt = this._curGameType == GameType.Plus6 ? GameType.Holdem : this._curGameType;
        let pt = this._curGameType == GameType.Plus6 ? PokerType.SixPlus : PokerType.Normal;
        this._roomList.switchTypeTab(gt, pt, this._isClub);
    }

    switchGameTypeTabState() {
        this.gameTypeNode.children.forEach((node, index) => {
            node.opacity = this._curGameType == index ? 255 : 76.5;
        })

        this.switchSBTabState(0);
    }

    clickSB(index) {
        this.switchSBTabState(index);
        this._roomList.switchSBTab(index, true, this._isClub);
    }

    switchSBTabState(selectIndex) {
        this.sbNode.children.forEach((node, index) => {
            node.opacity = selectIndex == index ? 255 : 76.5;
        })
    }

    lateClose(params?: any): void {
        super.lateClose();
        this._curGameType = null;
    }

}