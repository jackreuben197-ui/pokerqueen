/*
 * @Author: xfj
 * @Date: 2022-09-06 16:14:44
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-06 16:50:57
 * @FilePath: /pokerqueen/assets/script/game/UITexasHistoryComponent.ts
 */

import UIBase from "../ui/UIBase";
import CPMessageDispatherComponent from "../event/CPMessageDispatherComponent";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { GameCache } from "./GameCache";
import { StringHelper } from "../helper/StringHelper";
export class HistoryInfoData {
    public bInsurance: boolean;
    public bJackPot: boolean;
    public Blindstr: string;
    public bgroupBet: number;
    public handNum: number;
    // public ReferenceCollector rcPokerSprite;
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasHistoryComponent extends UIBase {
    currentPage = 0;
    totalPage = 0;
    private historyInfoData: HistoryInfoData;

    protected lateLoad(): void {
        super.lateLoad();
        let Image_MenuMask: any = this.getChildNodeOrComponent('Image_MenuMask');
        Image_MenuMask.on('click', this.imageMaskCloseClick, this)
    }

    private registerHandler() {
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_PublicReplay, this.Protocol_Holdem_PublicReplay_Handler);//自己坐下
    }

    private removeHandler() {
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_PublicReplay, this.Protocol_Holdem_PublicReplay_Handler);//自己坐下
    }
    Protocol_Holdem_PublicReplay_Handler(response) {

        if (response == null) {
            return;
        }
        if (response.status == 0) {
            // this.UpdateViewList(response);
        }


        // var ResponseData = (response as Protocol_Holdem_PublicReplay)?.response;
        // if (ResponseData == null || ResponseData.Data.ToStringUtf8() == "") {
        //     // Log.Debug("rec.Data is null");
        //     return;
        // }
        // var data = JsonHelper.FromJson<Web_Room_Center_History_Replay.Data>(ResponseData.Data.ToStringUtf8());
        // HandleHistoryReplay(data);
    }
    /**
     * @methos 初始化房间顶部信息
     */
    private InitRoomInfo() {
        let RoomNameText = this.getChildNodeOrComponent('RoomNameText').getComponent(cc.Label);
        let RoomIDText = this.getChildNodeOrComponent('RoomIDText').getComponent(cc.Label);
        let BlindText = this.getChildNodeOrComponent('BlindText').getComponent(cc.Label);
        let PlayerNumText = this.getChildNodeOrComponent('PlayerNumText').getComponent(cc.Label);
        let Title = this.getChildNodeOrComponent('Title')
        RoomNameText.string = GameCache.Instance.roomName;

        if (this.historyInfoData.bgroupBet > 0) {
            BlindText.string = this.historyInfoData.Blindstr + "(" + StringHelper.getStringDiv100(this.historyInfoData.bgroupBet) + ")";
        }
        else {
            BlindText.string = this.historyInfoData.Blindstr;
        }
        PlayerNumText.string = "0";
        RoomIDText.string = GameCache.Instance.room_id + "-" + 0;
        // scrollview_Content.gameObject.SetActive(false);
    }
    onShow(param?: any): void {
        if (null == param)
            return;
        this.historyInfoData = param as HistoryInfoData;
        // rcPokerSprite = this.historyInfoData.rcPokerSprite;
        this.currentPage = 0;
        this.InitRoomInfo();
        this.totalPage = this.historyInfoData.handNum == 0 ? this.historyInfoData.handNum : this.historyInfoData.handNum - 1;
        if (this.totalPage == 0) {
            //第一手没打完不请求
            return;
        }
        // RefreshData(totalPage);

    }
    imageMaskCloseClick() {
        this.node.destroy();
    }
    protected onDestroy(): void {
        this.removeHandler();
    }


}
