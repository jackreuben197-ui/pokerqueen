/*
 * @Author: xfj
 * @Date: 2022-10-28 17:58:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-03 11:39:33
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubShareMatchItem.ts
 */

import GGEvent from "../../event/GGEvent";
import WebImageHelper from "../../helper/WebImageHelper";
import UIBase from "../../ui/UIBase";
import { UIClubModel } from "../labor/UIClubModel";


const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/new_club/UIClubShareMatchItem')
export default class UIClubShareMatchItem extends UIBase {
    _data = null;
    _type = 0
    initData(data, type) {
        this._data = data
        this._type = type;
        this.initView();
    }
    initView() {
        this.node.getChildByName('name').getComponent(cc.Label).string = this._data.nickname
        this.node.getChildByName('id').getComponent(cc.Label).string = this._data.user_random_id
        let icon = cc.find('iconMask/icon', this.node);
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), this._data.avatar)
        let btnNode = this.node.getChildByName("btnNode")
        btnNode.active = this._type == 1
        let canclebtnNode = this.node.getChildByName("canclebtnNode")
        canclebtnNode.active = this._type == 0
        let refuse = cc.find('btnNode/refuse', this.node)
        refuse.on(cc.Node.EventType.TOUCH_END, () => {
            // UIClubModel.mInstance.APIOrgClubApprovalJoin(this._data.id, 3);
            this.node.active = false
        }, this)

        let agree = cc.find('btnNode/agree', this.node)
        agree.on(cc.Node.EventType.TOUCH_END, async () => {
            // await UIClubModel.mInstance.APIOrgClubApprovalJoin(this._data.id, 2);
            this.node.active = false
            // this.post(GGEvent.CLUB_DELE_USER);
        }, this)

        let cancle = cc.find('canclebtnNode/cancle', this.node)
        cancle.on(cc.Node.EventType.TOUCH_END, async () => {
            // await UIClubModel.mInstance.APIOrgClubApprovalJoin(this._data.id, 2);
            this.node.active = false
            // this.post(GGEvent.CLUB_DELE_USER);
        }, this)
    }
}

