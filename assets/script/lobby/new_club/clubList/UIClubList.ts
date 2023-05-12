/*
 * @Author: xfj
 * @Date: 2022-12-21 11:16:27
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-12 10:38:18
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/clubList/UIClubList.ts
 */

import { EventName } from "../../../config/EventName";
import { UIDefine } from "../../../define/UIDefine";
import { clubListConfig } from "../../../frame/data/rate/RateConfig";
import { GameCache } from "../../../game/GameCache";
import { StringHelper } from "../../../helper/StringHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import SceneManager from "../../../manager/SceneManager";
import { Web_Org_Club_Get, Web_User_Info } from "../../../net/https/WebRequest";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import { UIClubModel } from "../../labor/UIClubModel";
import GC from '../../../frame/GameControl'
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
    sortNode: cc.Node
    dropNode_lbl: cc.Label
    listType = 2;
    _selectIndex = 0;
    protected lateLoad(): void {
        this.name  = "UIClubList";
        super.lateLoad();
        this.topNode = this.getChildNodeOrComponent("topNode");
        this.pageNode = this.getChildNodeOrComponent("PageNode");
        this.listNode = this.getChildNodeOrComponent("listNode");
        this.pageNode.active = this.listType == 2
        this.listNode.active = this.listType == 1
        this.sortNode = this.getChildNodeOrComponent("sortNode");
        this.dropNode_lbl = this.getChildNodeOrComponent("dropNode_lbl", cc.Label);
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.refreshList();

        // await UIClubModel.mInstance.APIOrgClubGet()
        // let data: any = Web_Org_Club_Get.Response.data
        // this.num.string = data.length;
        // this.initListNode(data)
        // this.initPageNode(data)
        // this.initTop()
        // this.sortData()
        // this.setText(this.dropNode_lbl, clubListConfig[this._selectIndex].desc);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.myGoldChange, this.initTop)
        this.listen(EventName.refreshClubList, this.refreshList);

    }
    async refreshList() {
        await UIClubModel.mInstance.APIOrgClubGet()
        let data: any = Web_Org_Club_Get.Response.data
        this.num.string = data.length;
        // this.initListNode(data)
        this.initPageNode(data)
        this.initTop()
        this.sortData()
        this.setText(this.dropNode_lbl, clubListConfig[this._selectIndex].desc);
    }
    sortData() {
        let data: any = Web_Org_Club_Get.Response.data
        let _data = data.sort((a, b) => {
            if (this._selectIndex == 0) {
                return new Date(a.create_time).getTime() - new Date(b.create_time).getTime()

            } else if (this._selectIndex == 1) {
                return new Date(b.create_time).getTime() - new Date(a.create_time).getTime()
            }
            else if (this._selectIndex == 2) {
                return a.club_members - b.club_members
            }
            else if (this._selectIndex == 3) {
                return b.club_members - a.club_members
            }
            else if (this._selectIndex == 4) {
                return a.tables - b.tables
            }
            else if (this._selectIndex == 5) {
                return b.tables - a.tables
            }
        })
        this.initListNode(_data)
    }
    initTop() {
        let icon = cc.find('Round', this.topNode).getComponent(cc.Sprite);
        WebImageHelper.SetHeadImage(icon, GC.data.user.info.avatar)//GameCache.Instance.headPic
        this.topNode.getChildByName('name').getComponent(cc.Label).string = StringHelper.LengthNick(Web_User_Info.Response.data.user.nickname);
        this.topNode.getChildByName('id').getComponent(cc.Label).string = 'ID:' + Web_User_Info.Response.data.user.un_id

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
    openDropDownBox() {
        UIComponent.open(UIDefine.dropDownBoxNew, { data: clubListConfig, index: this._selectIndex, cb: this.selectSort.bind(this) })
    }
    selectSort(data, index) {
        this._selectIndex = index;
        this.setText(this.dropNode_lbl, data.desc);
        this.sortData();
    }

    initPageNode(clubList) {
        this.pageViews.removeAllPages();
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
        UIComponent.open(UIDefine.UIJoinUnion, { type: 0 }, { SceneUI: SceneManager.Instance.currUI });
    }
    changeMenu() {

        let union = cc.find('menuChange/union', this.topNode);
        let list = cc.find('menuChange/list', this.topNode);

        this.listType = this.listType == 1 ? 2 : 1
        this.pageNode.opacity = this.listType == 2 ? 255 : 0
        this.listNode.active = this.listType == 1
        union.active = !this.listNode.active
        list.active = this.listNode.active
    }

}
