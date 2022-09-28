/*
 * @Author: xfj
 * @Date: 2022-09-14 19:02:14
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-28 17:04:54
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIJoinUnion.ts
 */

import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { APIOrgTribeSearchByID, Web_Org_Club_Player_Apply_List, Web_Org_Club_Search_By_Id } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "./UIClubModel";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIJoinUnion extends BaseForm {
    @property(cc.EditBox)
    EditBox: cc.EditBox = null;

    @property(cc.Node)
    searchNode: cc.Node = null;

    @property(cc.Node)
    joinNode: cc.Node = null;

    @property(cc.Node)
    contentList: cc.Node = null;

    @property(cc.Node)
    lb: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
    }
    async sousuoBtn() {
        let string = this.EditBox.string
        if (string == '') {
            // UIComponent.Instance.Toast(i18nMgr.Get('club_creat_7'))
            return;
        }
        await UIClubModel.mInstance.APIOrgTribeSearchByID(Number(string));
        let data: any = APIOrgTribeSearchByID.Response.data
        if (data) {
            this.lb.active = false
            this.initItem(this.searchNode, data, async () => {
                this.hideSearchNode();
                // await UIClubModel.mInstance.APIOrgClubJoinClub(data.club_id);
                // this.initApplyList();
            })
        } else {
            this.lb.active = true
        }
    }
    initItem(node, data, cb) {
        let name = node.getChildByName('name').getComponent(cc.Label)
        name.string = data.club_name
        let id = node.getChildByName('id').getComponent(cc.Label)
        id.string = data.random_id

        let icon = cc.find("iconMask/icon", node).getComponent(cc.Sprite)
        WebImageHelper.SetUrlImage(icon, data.logo)
        let current = cc.find("number/current", node).getComponent(cc.Label)
        current.string = data.club_members
        let total = cc.find("number/total", node).getComponent(cc.Label)
        total.string = data.upper_limit;
        node.active = true;
        let join = node.getChildByName('join')
        join.on(cc.Node.EventType.TOUCH_END, cb, this)
    }
    hideSearchNode() {
        this.searchNode.active = false;
        this.lb.active = false
    }
    // update (dt) {}
}
