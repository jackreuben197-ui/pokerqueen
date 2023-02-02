/*
 * @Author: xfj
 * @Date: 2022-10-28 17:58:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-02 11:45:45
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/memberAdmin/ApplyJoinClubItem.ts
 */

import GGEvent from "../../../event/GGEvent";
import WebImageHelper from "../../../helper/WebImageHelper";
import UIBase from "../../../ui/UIBase";
import { UIClubModel } from "../../labor/UIClubModel";


const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/new_club/ApplyJoinClubItem')
export default class ApplyJoinClubItem extends UIBase {
    _data = null;

    initData(data) {
        this._data = data
        this.initView();
    }
    initView() {
        this.node.getChildByName('name').getComponent(cc.Label).string = this._data.nickname
        this.node.getChildByName('id').getComponent(cc.Label).string = this._data.user_random_id
        let icon = cc.find('iconMask/icon', this.node);
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), this._data.avatar)
        let refuse = cc.find('btnNode/refuse', this.node)
        refuse.on(cc.Node.EventType.TOUCH_END, () => {
            UIClubModel.mInstance.APIOrgClubApprovalJoin(this._data.id, 3);
            this.node.active = false
        }, this)

        let agree = cc.find('btnNode/agree', this.node)
        agree.on(cc.Node.EventType.TOUCH_END, async () => {
            await UIClubModel.mInstance.APIOrgClubApprovalJoin(this._data.id, 2);
            this.node.active = false
            this.post(GGEvent.CLUB_DELE_USER);
        }, this)
    }
}

