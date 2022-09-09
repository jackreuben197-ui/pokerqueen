import { UIDefine } from "../define/UIDefine";
import CPMessageDispatherComponent from "../event/CPMessageDispatherComponent";
import { StringHelper } from "../helper/StringHelper";
import WebImageHelper from "../helper/WebImageHelper";
import { i18nLabel } from "../i18n/i18nLabel";
import { i18nMgr } from "../i18n/i18nMgr";
import {CPErrorCode} from "../i18n/CPErrorCode";
import { ResManager } from "../manager/ResManager";
import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { Protocol_Holdem_BringIn, Protocol_Holdem_Roomers } from "../net/websocket/ProtocolHoldemMessages";
import { Def } from "../protobuf/holdem/define_pb";
import { ServerMessageLeave } from "../protobuf/holdem/req_leave_pb";
import { ServerMessageRoomers } from "../protobuf/holdem/req_roomers_pb";
import UIBase from "../ui/UIBase";
import { GameCache } from "./GameCache";
import { Web_Room_Center_Rooms, } from "../../../assets/script/net/https/WebRequest";
import TimeHelper from "../helper/TimeHelper";
import { LobbyControl } from "../lobby/control/LobbyControl";

/*
 * @Author: xfj
 * @Date: 2022-09-01 11:38:48
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-01 13:56:09
 * @FilePath: /pokerqueen/assets/script/game/UITexasReportComponent.ts
 */
const { ccclass, property } = cc._decorator;
export class ReportPlayer {
    public userId;
    public nickName;
    public hand;
    public bringIn;//带入
    public score;//输赢
    public outChip;//带出
}

@ccclass
export default class UITexasReportComponent extends UIBase {

    btnShowProblem: cc.Node = null;
    imageMaskClose: cc.Node = null;
    content: cc.Node = null;
    mRoomLeaveTime: any = null;
    IntervalId = null;
    isLoad = true;
    tInfo_0 = []
    tInfo_1 = []
    protected lateLoad(): void {
        super.lateLoad();
        this.registerHandler();
        this.initUI();
        this.RequestRoomers();
    }
    private registerHandler() {
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Roomers, this.ProtocolHoldemRoomersHandler, this);
    }
    protected onDestroy(): void {
        if (this.IntervalId) {
            clearInterval(this.IntervalId)
        }
        this.removeHandler();
        this.isLoad = false;
    }

    private removeHandler() {
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Roomers, this.ProtocolHoldemRoomersHandler, this);
    }

    RequestRoomers() {
        ProtocolAgency.Send({
            protocol: Protocol_Holdem_Roomers,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            body: Protocol_Holdem_Roomers.Request(
                {
                    room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                }),
        })
    }
    ProtocolHoldemRoomersHandler(response: ServerMessageLeave.AsObject) {
        if (response == null) {
            return;
        }
        if (response.status == 0) {
            this.UpdateViewList(response);
        }
    }

    async UpdateViewList(RoomersData) {

        //玩家 
        this.content = this.getChildNodeOrComponent('content')
        let text_Insnum = this.getChildNodeOrComponent('Text_Insnum').getComponent(cc.Label);
        text_Insnum.string = RoomersData.insurance != 0 ? StringHelper.getStringDiv100(RoomersData.insurance) : 0 + "";
        let textTitle = this.getChildNodeOrComponent('Title').getComponent(cc.RichText);
        textTitle.string = "<color=\"#E9BF80FF\">" + GameCache.Instance.room_id + '-' + GameCache.Instance.CurGame.mHandNum + "</color>";
        let tAllNum = 0;
        let totalLen = 0;
        for (let i = 0; i < RoomersData.playersList.length; i++) {
            let tSignPlayer = new ReportPlayer();
            tSignPlayer.userId = RoomersData.playersList[i].userRid;
            tSignPlayer.nickName = RoomersData.playersList[i].name;
            tSignPlayer.hand = RoomersData.playersList[i].handNum;
            tSignPlayer.bringIn = RoomersData.playersList[i].bringInTotal;
            tSignPlayer.score = RoomersData.playersList[i].win;
            tSignPlayer.outChip = RoomersData.playersList[i].bringOutTotal;
            if (RoomersData.playersList[i].Status == Def.CanPlayStatus.NORMAL || RoomersData.playersList[i].Status == Def.CanPlayStatus.AGREE_POST) {
                this.tInfo_0.push(tSignPlayer);
            }
            else {
                this.tInfo_1.push(tSignPlayer);
            }

            tAllNum = tAllNum + RoomersData.playersList[i].bringInTotal;
        }
        let textAllnum = this.getChildNodeOrComponent('Text_Allnum').getComponent(cc.Label);
        textAllnum.string = tAllNum + "";
        try {
            this.tInfo_0.sort((x, y) => { return -x.score.CompareTo(y.score); });
            this.tInfo_1.sort((x, y) => { return -x.score.CompareTo(y.score); });
        }
        catch
        {

        }

        let OnLine = this.getChildNodeOrComponent('OnLine')
        for (let index = 0; index < this.tInfo_0.length; index++) {
            const element: any = cc.instantiate(OnLine);
            element.parent = this.content;
            this.setInfos(element, this.tInfo_0[index], true);
            element.active = true;
        }
        for (let index1 = 0; index1 < this.tInfo_1.length; index1++) {
            const element: any = cc.instantiate(OnLine);
            element.parent = this.content;
            this.setInfos(element, this.tInfo_1[index1], false);
            element.active = true;
        }
        totalLen = totalLen + 100 * (this.tInfo_0.length + this.tInfo_1.length);
        //观众
        let title_viewer: cc.Node = this.getChildNodeOrComponent('title_viewer');
        let element: cc.Node = cc.instantiate(title_viewer);
        element.parent = this.content;
        element.active = true;
        let text_ReportViewer = cc.find('Image/Text_ReportViewer', element)
        text_ReportViewer.getComponent(cc.Label).string = i18nMgr.Get(`adaptation${20052}`) + '(' + RoomersData.observersList.length + ')';
        //Viewer_List
        let viewer_List: cc.Node = this.getChildNodeOrComponent('Viewer_List');
        let item = viewer_List.getChildByName('item');
        viewer_List.parent = this.content;

        for (let index = 1; index < RoomersData.observersList.length; index++) {
            const element = cc.instantiate(item);
            element.parent = viewer_List
        }
        for (let index = 0; index < RoomersData.observersList.length; index++) {
            let tItem: cc.Node = viewer_List.children[index]
            tItem.getChildByName('Text').getComponent(cc.Label).string = RoomersData.observersList[index].name;
            if (RoomersData.observersList[index].avatar != "") {
                let icon = cc.find('image/mask/icon', tItem);
                WebImageHelper.SetUrlImage(icon.getComponent(cc.Sprite), RoomersData.observersList[index].avatar)
            }
            tItem.active = true;
            tItem.getChildByName("ImageGray").active = (RoomersData.observersList[index].sex == 1);

            let watcherId = RoomersData.observersList[index].userRid;
            // UIEventListener.Get(tItem).onClick = (go) => {
            //     UIComponent.Instance.ShowNoAnimation(UIType.UITexasPlayerInfo, new object[] { watcherId, true });
            // };
        }
        let param = Web_Room_Center_Rooms.RequestParams
        param.room_ids = [GameCache.Instance.room_id];
        let roomsInfoData: any = await LobbyControl.getInstance().APIWebRoomCenterRooms(param)
        cc.log('roomsInfoData====', roomsInfoData);
        roomsInfoData.data.records.forEach(item => {
            if (item.rid == GameCache.Instance.room_id) {
                if (item.start_time == null) {
                    return;
                }
                let deadLineTime = TimeHelper.RFC3339TimeConvertToUTCTime(item.start_time)
                let roomLeftTime = deadLineTime / 1000 + item.play_duration - new Date().getTime() / 1000
                if (roomLeftTime > 0) {
                    this.mRoomLeaveTime = roomLeftTime;
                    let textTitle = this.getChildNodeOrComponent('Text_Time').getComponent(cc.RichText);
                    textTitle.string = "<color=\"#E9BF80FF\">" + TimeHelper.ShowRemainingSemicolon(this.mRoomLeaveTime) + "</color>";
                    this.ShowLeaveTimer(textTitle);
                }
            }
        });

    }
    ShowLeaveTimer(textTitle) {
        // TimerComponent mTC = Game.Scene.ModelScene.GetComponent<TimerComponent>();
        this.IntervalId = setInterval(() => {
            if (this.mRoomLeaveTime >= 0 && this.isLoad && this.node.isValid) {
                this.mRoomLeaveTime--;
                if (textTitle != null)
                    textTitle.string = textTitle.string = "<color=\"#E9BF80FF\">" + TimeHelper.ShowRemainingSemicolon(this.mRoomLeaveTime) + "</color>";
            } else {
                if (textTitle != null && !cc.isValid(this.node, true)) {
                    textTitle.string = "00:00";
                }
            }
        }, 1000)
    }
    setInfos(objTemp, pDto, onLine) {
        objTemp.getChildByName('Text_Name').getComponent(cc.RichText).string = this.colorText(onLine, pDto.nickName)
        objTemp.getChildByName('Text_Num').getComponent(cc.RichText).string = this.colorText(onLine, pDto.hand + '')
        objTemp.getChildByName('Text_All').getComponent(cc.RichText).string = this.colorText(onLine, StringHelper.getStringDiv100(pDto.bringIn))
        objTemp.getChildByName('Text_All').getChildByName('Text_outChip').getComponent(cc.RichText).string = pDto.outChip != 0 ? StringHelper.getStringDiv100(pDto.outChip) : 0;
        objTemp.getChildByName('Text_Count').getComponent(cc.RichText).string = StringHelper.getStringDiv100(pDto.score);

        if (pDto.userId == GameCache.Instance.nUserId) {
            objTemp.getChildByName('SelfGo').active = true;
        } else {
            let a = onLine ? 255 : 125;
            if (pDto.score > 0) {
                objTemp.getChildByName('Text_Count').color = cc.color(184, 43, 48, a);
            }
            else if (pDto.score < 0)
                objTemp.getChildByName('Text_Count').color = cc.color(66, 200, 113, a);
        }
    }
    colorText(onLine, str) {
        let tt = "";
        if (onLine) {
            tt = "<color=\"#E9BF80FF\">" + str + "</color>";
        }
        else {
            tt = "<color=\"#E9BF807D\">" + str + "</color>";
        }
        return tt;
    }

    initUI() {
        this.btnShowProblem = this.getChildNodeOrComponent('BtnShowProblem');
        this.btnShowProblem.on('click', this.btnShowProblemClick, this)
        this.imageMaskClose = this.getChildNodeOrComponent('ImageMaskClose');
        this.imageMaskClose.on('click', this.imageMaskCloseClick, this)
        let insurancePool: any = this.getChildNodeOrComponent('InsurancePool');
        if (GameCache.Instance.CurGame != null && !GameCache.Instance.CurGame.insurance) {
            insurancePool.active = false;
        }
    }

    btnShowProblemClick() {
        new Date().getUTCDate()

        this.node.destroy();
        let UITexasRule = this.node.getChildByName('UITexasRule')
        if (!UITexasRule) {
            let prefab = ResManager.LoadAsset(UIDefine.UITexasRule.Bundle, UIDefine.UITexasRule.Path)
            // let prefab = AssetContext.getAsset<cc.Prefab>('UITexasSetting', AssetFold.texas_prefab_widgetLayer)
            let UITexasRule: any = cc.instantiate(prefab);
            UITexasRule.parent = this.node
            UITexasRule.active = true;
        } else {
            UITexasRule.active = true;
        }
    }
    imageMaskCloseClick() {
        this.node.destroy();
    }

}
