/*
 * @Author: xfj
 * @Date: 2022-09-14 19:02:14
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-12 10:18:14
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/createClub/UIJoinUnion.ts
 */

import WebImageHelper from "../../../helper/WebImageHelper";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { Web_Org_Club_Get, APIOrgTribeSearchByID, Web_Org_Club_Player_Apply_List, Web_Org_Club_Search_By_Id, APIOrgClubApplyTribeList } from "../../../net/https/WebRequest";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import { UIClubModel } from "../../labor/UIClubModel";
import ComFormTitle from "../../../common/ComFormTitle";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import TabNode from "../../../common/tabNode";
import { ClubTabConfig, joinClubConfig, joinUnionConfig } from "../../../frame/config/tabConfig";
import { UIDefine } from "../../../define/UIDefine";
import { EventName } from "../../../config/EventName";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/createClub/UIJoinUnion')
export default class UIJoinUnion extends BaseForm {
    @property(cc.Label)
    search_id: cc.Label = null;
    private comFormTitle: ComFormTitle = null;
    // tabNode: TabNode = null;
    list: cc.Node = null;
    searchNode: cc.Node = null;
    @property(cc.Label)
    btn_lbl: cc.Label = null;

    @property(cc.Button)
    sousuo: cc.Button = null;

    @property(cc.Node)
    contentList: cc.Node = null;
    @property(cc.Node)
    joinNode: cc.Node = null;
    type = 0;
    @property(cc.Node)
    noDataTip: cc.Node = null;

    @property(cc.Node)
    canClick: cc.Node = null;
    @property(cc.Node)
    noClick: cc.Node = null;
    @property(cc.Label)
    btnTip: cc.Label = null;

    @property(cc.Label)
    pjlbl: cc.Label = null;
    @property(cc.Label)
    datalbl: cc.Label = null;
    @property(cc.Toggle)
    toggle1: cc.Toggle = null;
    @property(cc.Toggle)
    toggle2: cc.Toggle = null;

    tempString = ''
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        // this.tabNode = this.getChildNodeOrComponent('tabNode', TabNode);
        this.searchNode = this.getChildNodeOrComponent('searchNode');
        this.list = this.getChildNodeOrComponent('list');
    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();

        this.listen(EventName.refreshApplyList, this.initList);
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.type = param.type
        let title = this.type == 0 ? "club_3" : "UIClub_TribeJoin"
        this.setText(this.btn_lbl, this.type == 0 ? "UIGuild_SearchBtn" : "UIGuild_SearchUnionBtn")
        this.comFormTitle.initData(title, this);
        // this.tabNode.initData(this.type == 0 ? joinClubConfig : joinUnionConfig, this.titleNodeClick.bind(this), this)
        this.pjlbl.string = this.type == 0 ? i18nMgr.Get('UIGuild_SearchBtn') : i18nMgr.Get('UIGuild_SearchUnionBtn')
        this.datalbl.string = i18nMgr.Get('UIGuild_RecordBtn')
        this.titleNodeClick(null, 1);
        this.toggle1.isChecked = true
        this.toggle2.isChecked = false
        this.setText(this.search_id, this.type == 0 ? "UIClub_JoinQuery_ISNSnu1A" : "UIClub_InputLeagueId")
        this.initList();
        this.tempString = ''
        this.sousuo.interactable = false;
        this.canClick.active = this.sousuo.interactable
        this.noClick.active = !this.sousuo.interactable
        this.btnTip.node.color = this.sousuo.interactable ? cc.color().fromHEX('#EEF5FF') : cc.color().fromHEX('#515774')
    }
    initList(club_id: number = -1) {
        if (this.type == 0) {
            this.initApplyList(club_id);

        } else {
            this.initUnionList()
        }

    }
    async initApplyList(club_id: number = -1) {
        this.contentList.removeAllChildren();
        await UIClubModel.mInstance.APIOrgClubPlayerApplyList()
        let data: any = Web_Org_Club_Player_Apply_List.Response.data
        this.noDataTip.active = data?.items.length == 0;
        let apply_join: boolean = false;
        for (let index = 0; index < data?.items?.length; index++) {
            const element = data?.items[index];
            let item = cc.instantiate(this.joinNode);
            item.parent = this.contentList;
            if (club_id == element.club_id) {
                apply_join = true;
            }
            this.initItem(item, element, async () => {
                await UIClubModel.mInstance.APIOrgClubCancleJoinClub(element.id);
                item.active = false;
            }, index);
        }
        //判断加入俱乐部页面中申请或加入的状态
        if (club_id > -1) UIComponent.Instance.ToastLanguage(apply_join ? "roomError171_5" : "club_join_3");
    }
    async initUnionList() {
        this.contentList.removeAllChildren();
        await UIClubModel.mInstance.APIOrgClubApplyTribeList({ club_id: ClubCache.club_id })
        let data: any = APIOrgClubApplyTribeList.Response.data
        this.noDataTip.active = data?.list.length == 0
        for (let index = 0; index < data?.list?.length; index++) {
            const element = data?.list[index];
            let item = cc.instantiate(this.joinNode);
            item.parent = this.contentList;
            this.initItem(item, element, async () => {
                await UIClubModel.mInstance.APIOrgClubCancleJoinTribe({ apply_id: element.id });
                item.active = false;

            }, index)
        }
    }

    initItem(node, data, cb, index) {

        let club = node.getChildByName('club')
        club.active = false
        let union = node.getChildByName('union')
        union.active = false
        let flag = index % 2 != 0
        node.getChildByName('Rectangle').active = flag
        node.getChildByName('Rectangle1').active = !flag
        if (this.type == 0) {
            let name = club.getChildByName('name').getComponent(cc.Label)
            name.string = data.club_name
            let id = club.getChildByName('id').getComponent(cc.Label)
            id.string = 'ID: ' + data.random_id
            let num = club.getChildByName('num').getComponent(cc.Label)

            num.string = `${i18nMgr.Get('UIGuild_Member')} :${data.club_members}`
            club.active = true

        } else {
            let name = union.getChildByName('name').getComponent(cc.Label)
            name.string = data.club_name
            let id = union.getChildByName('id').getComponent(cc.Label)
            id.string = 'ID: ' + data.tribe_random_id
            union.active = true;
        }
        let icon = cc.find("Round", node).getComponent(cc.Sprite)
        WebImageHelper.SetHeadImage(icon, data.logo)

        node.active = true;
        let join = node.getChildByName('join')
        join.on(cc.Node.EventType.TOUCH_END, cb, this)
    }

    titleNodeClick(event, customData) {
        this.searchNode.active = Number(customData) === 1;
        this.list.active = Number(customData) === 2;
        this.pjlbl.node.opacity = Number(customData) == 1 ? 255 : 100
        this.datalbl.node.opacity = Number(customData) == 2 ? 255 : 100
    }

    keyNodeClick(event, customData) {

        switch (Number(customData)) {
            case 10:
                this.tempString = ''
                this.setText(this.search_id, this.type == 0 ? "UIClub_JoinQuery_ISNSnu1A" : "UIClub_InputLeagueId")
                break;
            case 11:
                if (this.tempString == '') {
                    return;
                }
                this.search_id.string = this.search_id.string.substring(0, this.search_id.string.length - 1)
                this.tempString = this.search_id.string;
                if (this.tempString.length == 0) {
                    this.setText(this.search_id, this.type == 0 ? "UIClub_JoinQuery_ISNSnu1A" : "UIClub_InputLeagueId")
                    this.tempString = ''
                }
                break;

            default:
                if (this.tempString.length < 6) {
                    this.tempString = this.tempString + customData
                    this.search_id.string = this.tempString
                };
                break;
        }
        this.sousuo.interactable = this.tempString.length > 0
        this.canClick.active = this.sousuo.interactable
        this.noClick.active = !this.sousuo.interactable
        this.btnTip.node.color = this.sousuo.interactable ? cc.color().fromHEX('#EEF5FF') : cc.color().fromHEX('#515774')

    }

    async sousuoBtn() {

        if (this.type == 0) {
            await UIClubModel.mInstance.APIOrgClubSearchByID(Number(this.tempString));
            let data: any = Web_Org_Club_Search_By_Id.Response.data
            if (data) {
                UIComponent.open(UIDefine.UISearchJoin, { data: data, type: this.type })
            }
        } else {
            await UIClubModel.mInstance.APIOrgTribeSearchByID(Number(this.tempString));
            let data: any = APIOrgTribeSearchByID.Response.data
            if (data) {
                UIComponent.open(UIDefine.UISearchJoin, { data: data, type: this.type })
            }

        }

    }
    // update (dt) {}
}
