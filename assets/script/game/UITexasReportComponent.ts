import { UIDefine } from "../define/UIDefine";
import CPMessageDispatherComponent from "../event/CPMessageDispatherComponent";
import { ResManager } from "../manager/ResManager";
import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { Protocol_Holdem_BringIn, Protocol_Holdem_Roomers } from "../net/websocket/ProtocolHoldemMessages";
import { Def } from "../protobuf/holdem/define_pb";
import { ServerMessageLeave } from "../protobuf/holdem/req_leave_pb";
import { ServerMessageRoomers } from "../protobuf/holdem/req_roomers_pb";
import UIBase from "../ui/UIBase";
import { GameCache } from "./GameCache";

/*
 * @Author: xfj
 * @Date: 2022-09-01 11:38:48
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-01 13:56:09
 * @FilePath: /pokerqueen/assets/script/game/UITexasReportComponent.ts
 */
const { ccclass, property } = cc._decorator;

@ccclass


export class ReportPlayer {
    public userId;
    public nickName;
    public hand;
    public bringIn;//带入
    public score;//输赢
    public outChip;//带出
}

export default class UITexasReportComponent extends UIBase {

    btnShowProblem: cc.Node = null;
    imageMaskClose: cc.Node = null;
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

    UpdateViewList(RoomersData) {

        let text_Insnum = this.getChildNodeOrComponent('Text_Insnum').getComponent(cc.Label);
        text_Insnum.string = RoomersData.insurance + '';
        let textTitle = this.getChildNodeOrComponent('Title').getComponent(cc.Label);
        textTitle.string = GameCache.Instance.room_id + '-' + GameCache.Instance.CurGame.mHandNum
        let tAllNum = 0;

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
        this.node.active = false;
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
        this.node.active = false;
    }

}
