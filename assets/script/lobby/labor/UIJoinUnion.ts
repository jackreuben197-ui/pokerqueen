/*
 * @Author: xfj
 * @Date: 2022-09-14 19:02:14
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-23 16:24:09
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIJoinUnion.ts
 */

import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { Web_Org_Club_Get, APIOrgTribeSearchByID, Web_Org_Club_Player_Apply_List, Web_Org_Club_Search_By_Id, APIOrgClubApplyTribeList } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "./UIClubModel";
import ComFormTitle from "../../common/ComFormTitle";
import { ClubCache } from "../../frame/data/club/ClubCache";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIJoinUnion')
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

    @property(cc.Node)
    UIDialogComponent: cc.Node = null;

    @property(cc.RichText)
    Text_Content: cc.RichText = null;

    @property(cc.EditBox)
    contentEdit: cc.EditBox = null;

    private comFormTitle: ComFormTitle = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);

        this.UIDialogComponent.active = false
        let title = "UIClub_TribeJoin"
        this.comFormTitle.initData(title, this);
        this.initApplyList();
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
                this.UIDialogComponent.active = true;
                this.Text_Content.string = ClubCache.club_name + '公会确认加入' + data.name + "联盟<br/>" + '填写您的联系方式';

            })
        } else {
            this.lb.active = true
        }
    }
    initItem(node, data, cb) {
        let name = node.getChildByName('name').getComponent(cc.Label)
        name.string = data.name || data.tribe_name
        let id = node.getChildByName('id').getComponent(cc.Label)
        id.string = 'ID: ' + data.random_id || data.tribe_random_id

        let icon = cc.find("iconMask/icon", node).getComponent(cc.Sprite)
        if (data.logo || data.tribe_logo) {
            WebImageHelper.SetHeadImage(icon, data.logo || data.tribe_logo)
        }
        // let current = cc.find("number/current", node).getComponent(cc.Label)
        // current.string = data.club_count
        // let total = cc.find("number/total", node).getComponent(cc.Label)
        // total.string = data.club_limit;
        node.active = true;
        let join = node.getChildByName('join')
        join.on(cc.Node.EventType.TOUCH_END, cb, this)
    }
    hideSearchNode() {
        this.searchNode.active = false;
        this.lb.active = false
    }
    cancel() {
        this.UIDialogComponent.active = false
    }
    async sure() {
        let data: any = APIOrgTribeSearchByID.Response.data

        let parms: any = { tribe_random_id: data.random_id, contact: this.contentEdit.string, club_id: ClubCache.club_id };
        await UIClubModel.mInstance.APIOrgJoinTrip(parms)
        this.UIDialogComponent.active = false
        this.initApplyList();
    }
    async initApplyList() {
        this.contentList.removeAllChildren();
        await UIClubModel.mInstance.APIOrgClubApplyTribeList({ club_id: ClubCache.club_id })
        let data: any = APIOrgClubApplyTribeList.Response.data
        for (let index = 0; index < data?.list?.length; index++) {
            const element = data?.list[index];
            let item = cc.instantiate(this.joinNode);
            item.parent = this.contentList;
            this.initItem(item, element, async () => {
                await UIClubModel.mInstance.APIOrgClubCancleJoinTribe({ apply_id: element.id });
                item.active = false;

            })
        }
    }
    // update (dt) {}
}
