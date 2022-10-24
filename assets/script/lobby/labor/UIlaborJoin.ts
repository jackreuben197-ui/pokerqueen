/*
 * @Author: xfj
 * @Date: 2022-09-14 19:02:14
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-30 18:30:16
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIlaborJoin.ts
 */

import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { Web_Org_Club_Player_Apply_List, Web_Org_Club_Search_By_Id } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "./UIClubModel";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIlaborJoin extends BaseForm {
    @property(cc.EditBox)
    EditBox: cc.EditBox = null;

    @property(cc.Node)
    searchNode: cc.Node = null;

    @property(cc.Node)
    joinNode: cc.Node = null;

    @property(cc.Node)
    contentList: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: cc.Node) {
        super.onShow(param, fromUI);
        this.initApplyList();
        this.EditBox.string = '';
    }
    async sousuoBtn() {
        let string = this.EditBox.string
        if (string == '') {
            // UIComponent.Instance.Toast(i18nMgr.Get('club_creat_7'))
        }
        await UIClubModel.mInstance.APIOrgClubSearchByID(Number(string));
        let data: any = Web_Org_Club_Search_By_Id.Response.data
        if (data) {
            this.initItem(this.searchNode, data, this.joinCb)
        }
    }
    async joinCb() {
        let data: any = Web_Org_Club_Search_By_Id.Response.data
        this.hideSearchNode();
        await UIClubModel.mInstance.APIOrgClubJoinClub(data.club_id);
        this.initApplyList();
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
    }

    async initApplyList() {
        this.contentList.removeAllChildren();
        await UIClubModel.mInstance.APIOrgClubPlayerApplyList()
        let data: any = Web_Org_Club_Player_Apply_List.Response.data
        for (let index = 0; index < data?.data?.length; index++) {
            const element = data?.data[index];
            let item = cc.instantiate(this.joinNode);
            item.parent = this.contentList;
            this.initItem(item, element, async () => {
                await UIClubModel.mInstance.APIOrgClubCancleJoinClub(element.id);
                item.active = false;
            })
        }
    }

    // update (dt) {}
}
