/*
 * @Author: xfj
 * @Date: 2023-01-03 11:28:55
 * @description: 共享牌局
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-16 19:27:09
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/shareMatch/UIClubShareMatch.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseForm from "../../../ui/form/BaseForm";
import ComFormTitle from "../../../common/ComFormTitle";
import UIClubShareMatchItem from "./UIClubShareMatchItem";
import List from "../../../common/List";
import { UIClubModel } from "../../labor/UIClubModel";
import { WebMessageRednum, WebOrgClubShareApplyList, WebOrgClubShareApproveList, WebOrgClubSharePendingList } from "../../../net/https/WebRequest";
import { EventName } from "../../../config/EventName";
import TabNode from "../../../common/tabNode";
import { shareMatchTabConfig } from "../../../frame/config/tabConfig";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubShareMatch')
export default class UIClubShareMatch extends BaseForm {
    _selectTitle = 0
    _offset: number = 0;
    _reqing: boolean = false;
    _reqEnd: boolean = false;
    _list: Array<any> = [];
    _total: number = 0
    noDataTip: cc.Node
    // tabNode: TabNode = null;

    @property(cc.Label)
    pjlbl: cc.Label = null;
    @property(cc.Label)
    datalbl: cc.Label = null;
    @property(cc.Toggle)
    toggle1: cc.Toggle = null;
    @property(cc.Toggle)
    toggle2: cc.Toggle = null;
    @property(cc.Node)
    Ellipse: cc.Node = null;

    private comFormTitle: ComFormTitle = null;
    @property(List)
    memberList: List = null;
    protected lateLoad(): void {
        super.lateLoad();
        // this.tabNode = this.getChildNodeOrComponent("tabNode", TabNode);
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.noDataTip = this.getChildNodeOrComponent("noDataTip");
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        // this.tabNode.initData(shareMatchTabConfig, this.titleNodeClick.bind(this), this)
        let title = "UIGuild_ShareGameManager"
        this.comFormTitle.initData(title, this);
        this.memberList.scrollingCB = this.scrollingCB;

        this.titleNodeClick(null, 0);
        this.toggle1.isChecked = true
        this.toggle2.isChecked = false

        await UIClubModel.mInstance.WebMessageRednum()
        let redData = WebMessageRednum.Response.data
        redData.forEach((element) => {
            if (element.type == 4) {
                this.Ellipse.active = element.num != 0
            }

        })
    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.refreshShareMatch, this.reqDataAgain);
    }

    titleNodeClick(event, customData) {
        this._selectTitle = Number(customData)
        this.pjlbl.node.opacity = Number(customData) == 0 ? 255 : 100
        this.datalbl.node.opacity = Number(customData) == 1 ? 255 : 100
        this.reqDataAgain();
    }
    async reqDataAgain() {
        this._offset = 0;
        this._total = 0;
        this._list.length = 0;
        this._reqing = false;
        this._reqEnd = false;
        this.dealData()
    }
    async dealData() {
        this._reqing = true
        let _data: any = [];

        if (this._selectTitle == 1) {
            await UIClubModel.mInstance.WebOrgClubSharePendingList({ limit: 10, offset: this._offset })
            _data = WebOrgClubSharePendingList.Response.data
            this.Ellipse.active = _data.data.length != 0
        } else if (this._selectTitle == 0) {
            await UIClubModel.mInstance.WebOrgClubShareApproveList({ limit: 10, offset: this._offset })
            _data = WebOrgClubShareApproveList.Response.data
        }
        this._reqing = false
        if (!_data.data) {
            _data.data = [];
        }

        _data.data.forEach(element => {
            this._list.push(element);
        });  //分页的时候使用的
        this._total = _data.total
        this.noDataTip.active = this._list.length == 0
        this.memberList.numItems = this._list.length;
        this._offset = this._list.length;
        this._reqEnd = this._list.length == this._total;

    }
    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(UIClubShareMatchItem);
        item.initData(this._list[index], this._selectTitle, index);
    }
    scrollingCB = async (scrollView: cc.ScrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset()
            let isDown = cur.y >= max.y;
            if (isDown && !this._reqing && !this._reqEnd) {
                this.dealData()
            }
        }
    }

}
