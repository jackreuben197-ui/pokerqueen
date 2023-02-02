/*
 * @Author: xfj
 * @Date: 2022-10-28 17:58:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-02 11:48:01
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/shareMatch/UIClubShareMatchItem.ts
 */

import { EventName } from "../../../config/EventName";
import GGEvent from "../../../event/GGEvent";
import WebImageHelper from "../../../helper/WebImageHelper";
import UIBase from "../../../ui/UIBase";
import { UIClubModel } from "../../labor/UIClubModel";


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
        // if (this._type == 0) {
        //     this.node.getChildByName('name').getComponent(cc.Label).string = this._data.share_club_name
        //     this.node.getChildByName('id').getComponent(cc.Label).string = this._data.share_club_random_id
        //     let icon = cc.find('iconMask/icon', this.node);
        //     WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), this._data.share_club_logo)
        // } else {
        //     this.node.getChildByName('name').getComponent(cc.Label).string = this._data.apply_club_name
        //     this.node.getChildByName('id').getComponent(cc.Label).string = this._data.apply_club_random_id
        //     let icon = cc.find('iconMask/icon', this.node);
        //     WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), this._data.apply_club_logo)
        // }

        this.node.getChildByName('name').getComponent(cc.Label).string = this._data.share_club_name
        this.node.getChildByName('id').getComponent(cc.Label).string = this._data.share_club_random_id
        let icon = cc.find('iconMask/icon', this.node);
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), this._data.share_club_logo)

        let btnNode = this.node.getChildByName("btnNode")
        btnNode.active = this._type == 1
        let canclebtnNode = this.node.getChildByName("canclebtnNode")
        canclebtnNode.active = this._type == 0

        let refuse = cc.find('btnNode/refuse', this.node)
        refuse.on(cc.Node.EventType.TOUCH_END, async () => {
            await UIClubModel.mInstance.APIOrgClubShareAudit({
                "apply_id": this._data.id,
                "audit_op": 3
            });
            this.post(EventName.refreshShareMatch);
        }, this)

        let agree = cc.find('btnNode/agree', this.node)
        agree.on(cc.Node.EventType.TOUCH_END, async () => {
            await UIClubModel.mInstance.APIOrgClubShareAudit({
                "apply_id": this._data.id,
                "audit_op": 2
            });
            this.post(EventName.refreshShareMatch);
        }, this)

        let cancle = cc.find('canclebtnNode/cancle', this.node)
        cancle.on(cc.Node.EventType.TOUCH_END, async () => {
            await UIClubModel.mInstance.APIOrgClubShareAudit({
                "apply_id": this._data.id,
                "audit_op": 4
            });
            this.post(EventName.refreshShareMatch);
        }, this)
    }
}

