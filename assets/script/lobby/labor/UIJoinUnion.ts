/*
 * @Author: xfj
 * @Date: 2022-09-14 19:02:14
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-23 20:22:17
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
import TabNode from "../../common/tabNode";
import { ClubTabConfig, joinClubConfig, joinUnionConfig } from "../../frame/config/tabConfig";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIJoinUnion')
export default class UIJoinUnion extends BaseForm {
    @property(cc.Label)
    search_id: cc.Label = null;
    private comFormTitle: ComFormTitle = null;
    tabNode: TabNode = null;
    list: cc.Node = null;
    searchNode: cc.Node = null;
    @property(cc.Label)
    btn_lbl: cc.Label = null;

    @property(cc.Button)
    sousuo: cc.Button = null;
    type = 0;

    tempString = ''
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.tabNode = this.getChildNodeOrComponent('tabNode', TabNode);
        this.searchNode = this.getChildNodeOrComponent('searchNode');
        this.list = this.getChildNodeOrComponent('list');
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.type = param.type
        let title = this.type == 0 ? "club_3" : "UIClub_TribeJoin"
        this.setText(this.btn_lbl, this.type == 0 ? "UISearchClub" : "UISearchUnion")
        this.comFormTitle.initData(title, this);
        this.tabNode.initData(this.type == 0 ? joinClubConfig : joinUnionConfig, this.titleNodeClick.bind(this), this)
        this.titleNodeClick(0);
        this.setText(this.search_id, this.type == 0 ? "UIClub_JoinQuery_ISNSnu1A" : "UIClub_InputLeagueId")
        // this.initApplyList();
    }
    titleNodeClick(customData) {
        this.searchNode.active = customData === 0;
        this.list.active = customData === 1;
    }

    keyNodeClick(event, customData) {

        switch (Number(customData)) {
            case 10:
                this.tempString = ''
                this.setText(this.search_id, this.type == 1 ? "UIClub_JoinQuery_ISNSnu1A" : "UIClub_InputLeagueId")
                break;
            case 11:
                if (this.tempString == '') {
                    return;
                }
                this.search_id.string = this.search_id.string.substring(0, this.search_id.string.length - 1)
                this.tempString = this.search_id.string;
                if (this.tempString.length == 0) {
                    this.setText(this.search_id, this.type == 1 ? "UIClub_JoinQuery_ISNSnu1A" : "UIClub_InputLeagueId")
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
        this.sousuo.interactable = this.tempString.length == 6


    }
    async sousuoBtn() {
        await UIClubModel.mInstance.APIOrgClubSearchByID(Number(this.tempString));
        let data: any = Web_Org_Club_Search_By_Id.Response.data
        if (data) {
        }
    }
    // update (dt) {}
}
