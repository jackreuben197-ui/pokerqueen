/*
 * @Author: xfj
 * @Date: 2022-10-17 11:45:09
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-21 19:51:51
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UICreateMatchItem.ts
 */

import { EventName } from "../../config/EventName";
import { ProcedureEnum } from "../../define/EIDefine";
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import GameUtil, { RoomType } from "../../game/util/GameUtil";
import ProcedureManager from "../../manager/ProcedureManager";
import { APIOrgRoomCreate } from "../../net/https/WebRequest";
import WebSocketClient from "../../net/websocket/WebSocketClient";
import LobbySession from "../../session/LobbySession";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import PlayViewItem from "../view/PlayViewItem";
import { UIClubModel } from "./UIClubModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UICreateMatchItem extends UIBase {
    private lbl_center_left: cc.Label = null;
    private item_choose: cc.Node = null;
    private item_normal: cc.Node = null;
    private lbl_time: cc.Label = null;
    private lbl_deskName: cc.Label = null;
    private lbl_num: cc.Label = null;

    private img_head: cc.Sprite = null;
    private lbl_unionName: cc.Label = null;
    _data = null;
    initData(data) {
        this._data = data
        this.initView();
    }
    initView() {
        let sb = this._data.sb / 100;
        this.setText(this.lbl_center_left, `${sb}/${sb * 2}(${this._data.ante})`)
        this.setText(this.lbl_deskName, this._data.name)
        // this.setText(this.lbl_num, `${this._data.seat_count - this._data.empty_seat}/${this._data.seat_count}`);

        // let isJoin = this._data.participation_status == 1;
        // this.item_choose.active = isJoin;
        // this.item_normal.active = !isJoin;

        // let displayNode = this._data.participation_status == 0 ? this.item_normal : this.item_choose;
        this.item_choose.getChildByName("lbl_gameType").getComponent(cc.Label).string = this.gameTypeName;
        let playView = this.node.getChildByName("lbl_time").getComponent(PlayViewItem)
        playView.updateNormalItem(this._data.play_duration);
        // if (isJoin) {
        //     playView.updateItemInfo(this._data);
        // } else 
        // {
        //     playView.updateNormalItem(this._data.play_duration);
        // }
    }

    lateLoad() {
        super.lateLoad();
        this.lbl_center_left = this.getChildNodeOrComponent("lbl_center_left", cc.Label);
        this.item_choose = this.getChildNodeOrComponent("item_choose");
        this.item_normal = this.getChildNodeOrComponent("item_normal");
        this.lbl_time = this.getChildNodeOrComponent("lbl_time", cc.Label);
        this.lbl_deskName = this.getChildNodeOrComponent("lbl_deskName", cc.Label);
        this.lbl_num = this.getChildNodeOrComponent("lbl_num", cc.Label);

        this.img_head = this.getChildNodeOrComponent("img_head", cc.Sprite);
        this.lbl_unionName = this.getChildNodeOrComponent("lbl_unionName", cc.Label);

        this.setActive(this.img_head, false)
        this.setActive(this.lbl_unionName, false)
    }
    get gameTypeName() {
        let str = "NLH";
        if (this._data.game_type == 1) {
            str = "PLO4";
        } else if (this._data.game_type == 2) {
            str = "PLO5";
        } else if (this._data.game_type == 3) {
            str = "PLO6";
        } else if (this._data.poker_type == 2) {
            str = "6+";
        }
        return str;
    }

    benganMatch() {
        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
            {
                type: UIDialogComponent.DialogType.CommitCancel,
                title: "提示",
                content: `使用模版 ${this._data.name} 开局`,
                contentCommit: "确定",
                contentCancel: "取消",
                actionCommit: async () => {
                    this.began();
                },
                noAnimation: true,
            });
    }
    editModel() {
        UIComponent.open(UIDefine.UICreateMatch, this._data);
    }
    delateModel() {
        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
            {
                type: UIDialogComponent.DialogType.CommitCancel,
                title: "提示",
                content: `确定删除模版 ${this._data.name} `,
                contentCommit: "确定",
                contentCancel: "取消",
                actionCommit: async () => {
                    await UIClubModel.mInstance.APIOrgTemplateDelete(this._data.id)
                    this.post(EventName.matchModelChange)
                },
                noAnimation: true,
            });
    }
    async began() {
        await UIClubModel.mInstance.APIOrgRoomCreate(this._data.id);
        let code = APIOrgRoomCreate.Response.code
        if (code == 0) {
            UIComponent.Instance.Toast('开局成功')
        }
        this.post(EventName.updateChessView);
    }

}
