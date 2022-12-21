/*
 * @Author: xfj
 * @Date: 2022-12-21 11:16:27
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-21 15:47:11
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubList.ts
 */

import { UIDefine } from "../../define/UIDefine";
import { GameCache } from "../../game/GameCache";
import { StringHelper } from "../../helper/StringHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import SceneManager from "../../manager/SceneManager";
import { Web_Org_Club_Get, Web_User_Info } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "../labor/UIClubModel";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/new_club/UIClubList')
export default class UIClubList extends BaseForm {
    @property(cc.Prefab)
    clubListItem: cc.Prefab = null;
    @property(cc.Prefab)
    clubPageItem: cc.Prefab = null;

    @property(cc.PageView)
    pageViews: cc.PageView = null;

    @property(cc.Label)
    num: cc.Label = null;
    topNode: cc.Node
    pageNode: cc.Node
    listNode: cc.Node
    listType = 2;
    protected lateLoad(): void {
        super.lateLoad();
        this.topNode = this.getChildNodeOrComponent("topNode");
        this.pageNode = this.getChildNodeOrComponent("PageNode");
        this.listNode = this.getChildNodeOrComponent("listNode");
        this.pageNode.active = this.listType == 2
        this.listNode.active = this.listType == 1
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        await UIClubModel.mInstance.APIOrgClubGet()
        let data: any = Web_Org_Club_Get.Response.data
        this.num.string = data.length;
        this.initListNode(data)
        this.initPageNode(data)
        this.initTop()
    }
    initTop() {
        let icon = cc.find('iconMask/icon', this.topNode).getComponent(cc.Sprite);
        WebImageHelper.SetHeadImage(icon, GameCache.Instance.headPic)
        this.topNode.getChildByName('name').getComponent(cc.Label).string = StringHelper.LengthNick(Web_User_Info.Response.data.user.nickname);
        this.topNode.getChildByName('id').getComponent(cc.Label).string = Web_User_Info.Response.data.user.un_id + ""

    }
    initListNode(clubList) {
        let menberlist = this.listNode.getChildByName('menberlist');
        let sv_content = cc.find('view/sv_content', menberlist);
        sv_content.removeAllChildren();
        for (let index = 0; index < clubList.length; index++) {
            const element = clubList[index];
            let clubListItem = cc.instantiate(this.clubListItem);
            clubListItem.parent = sv_content;
            clubListItem.getComponent('clubListItem').initData(element);
        }
    }
    initPageNode(clubList) {
        let menberlist = this.pageNode.getChildByName('PageView');
        let content = cc.find('view/content', menberlist);
        content.removeAllChildren();
        for (let index = 0; index < clubList.length; index++) {
            const element = clubList[index];
            let clubPageItem = cc.instantiate(this.clubPageItem);
            this.pageViews.addPage(clubPageItem)
            clubPageItem.getComponent('clubPageItem').initData(element);
        }
        let clubPageItem = cc.instantiate(this.clubPageItem);
        this.pageViews.addPage(clubPageItem)
        clubPageItem.getComponent('clubPageItem').initData(null);

    }
    ceateClub() {
        UIComponent.open(UIDefine.UICreatelabor, null, { SceneUI: SceneManager.Instance.currUI });
    }
    joinClub() {
        UIComponent.open(UIDefine.UIlaborJoin, null, { SceneUI: SceneManager.Instance.currUI });
    }
    changeMenu() {

        let union = cc.find('menuChange/union', this.topNode);
        let list = cc.find('menuChange/list', this.topNode);

        this.listType = this.listType == 1 ? 2 : 1
        this.pageNode.active = this.listType == 2
        this.listNode.active = this.listType == 1
        union.active = this.pageNode.active
        list.active = this.listNode.active

    }

}
