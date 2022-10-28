/*
 * @Author: xfj
 * @Date: 2022-10-24 13:42:49
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-28 11:05:16
 * @FilePath: /pokerqueen/assets/script/lobby/labor/JoinitemNode.ts
 */

import { EventName } from "../../config/EventName";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import WebHelper from "../../net/https/WebHelper";
import UIBase from "../../ui/UIBase";
import { UIClubModel } from "./UIClubModel";


const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/labor/JoinitemNode')
export default class JoinitemNode extends UIBase {

    private lb_gameType: cc.Label = null;
    private lb_id: cc.Label = null;
    private lbl_playerName: cc.Label = null;
    private lbl_deskName: cc.Label = null;
    private lbl_num: cc.Label = null;
    private lbl_creatTime: cc.Label = null;
    private lbl_result: cc.Label = null;

    private lbNode: cc.Node = null;
    private btnNode: cc.Node = null;

    private img_head: cc.Sprite = null;
    _data = null;

    lateLoad() {
        this.getChildNodeOrComponent("lbl_center_left", cc.Label);
        super.lateLoad();
        this.lb_gameType = this.getChildNodeOrComponent('lb_gameType', cc.Label);
        this.lb_id = this.getChildNodeOrComponent('lb_id', cc.Label);
        this.lbl_playerName = this.getChildNodeOrComponent('lbl_playerName', cc.Label);
        this.lbl_deskName = this.getChildNodeOrComponent('lbl_deskName', cc.Label);
        this.lbl_num = this.getChildNodeOrComponent('lbl_num', cc.Label);
        this.lbl_creatTime = this.getChildNodeOrComponent('lbl_creatTime', cc.Label);
        this.lbl_result = this.getChildNodeOrComponent('lbl_result', cc.Label);

        this.lbNode = this.node.getChildByName('lbNode');
        this.btnNode = this.node.getChildByName('btnNode');
        this.img_head = this.getChildNodeOrComponent('img', cc.Sprite);
    }
    onShow() {
        super.onShow();
    }
    initData(data) {
        this._data = data;
        this.initView();
    }

    initView() {
        this.setText(this.lb_gameType, this.gameTypeName)
        this.setText(this.lb_id, 'ID: ' + this._data.user_random_id)
        this.setText(this.lbl_playerName, this._data.user_name)
        this.setText(this.lbl_deskName, this._data.room_name)
        this.setText(this.lbl_num, this._data.bring_in / 100)
        this.setText(this.lbl_creatTime, TimeHelper.convertUTCTimeToLocalTime(this._data.create_time))
        this.setText(this.lbl_result, this.gameDealType)

        WebImageHelper.SetHeadImage(this.img_head, this._data.avatar);
        this.btnNode.active = this._data.status == 1;
        this.lbNode.active = !this.btnNode.active;

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
    get gameDealType() {
        let str = "已通过";
        if (this._data.status == 2) {
            str = "已通过";
        } else if (this._data.status == 3) {
            str = "已拒绝";
        } else if (this._data.status == 3) {
            str = "已取消";
        }
        return str;
    }

    async btnClick(event, customData) {
        await UIClubModel.mInstance.APIOrgFriendApplyDeal(this._data.id, Number(customData))
        this.post(EventName.updateFrendApplyList)
    }

    // update (dt) {}
}
