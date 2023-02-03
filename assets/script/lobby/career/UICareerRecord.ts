/*
 * @Author: xfj
 * @Date: 2023-02-02 16:40:21
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-03 09:51:21
 * @FilePath: /pokerqueen/assets/script/lobby/career/UICareerRecord.ts
 */

import List from "../../common/List";
import TabNode from "../../common/tabNode";
import { CareerRecordTabConfig } from "../../frame/config/tabConfig";
import TimeHelper from "../../helper/TimeHelper";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import recordItem from "./recordItem";


const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/career/UICareerRecord')
export default class UICareerRecord extends BaseFormPlus {
    @property(cc.Node)
    titleNode: cc.Node = null;
    @property(TabNode)
    tabNode: TabNode = null;
    @property(cc.Node)
    lb_tip: cc.Node = null;

    @property(cc.Node)
    Rectangle: cc.Node = null;

    @property(cc.Node)
    mtt: cc.Node = null;
    @property(cc.Node)
    listNode: cc.Node = null;

    @property(List)
    list: List = null;

    _titleSelect = 0;
    _tabSelect = 0;
    _list = [];
    _offset = 0;
    _total = 0;
    _reqing = false;
    _reqEnd = false;
    protected lateLoad(): void {
        super.lateLoad();
    }
    onShow(param?, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        this.tabNode.initData(CareerRecordTabConfig, this.titleNodeClick.bind(this), this);
        this.titleNode.children.forEach((item, index) => {
            item.getChildByName('title').color = this._titleSelect == index ? cc.color().fromHEX('#EEF5FF') : cc.color().fromHEX('#757CAB')
            item.getChildByName('block').active = this._titleSelect == index
            this.bindClick(item, this.onClickTypeTabBtns, index);
        })
        this.reqDataAgain();
        this.onClickTypeTabBtns(0);
    }
    titleNodeClick(customData) {
        this._tabSelect = customData
    }

    onClickTypeTabBtns(_index) {
        this._titleSelect = _index
        this.titleNode.children.forEach((item, index) => {
            item.getChildByName('title').color = this._titleSelect == index ? cc.color().fromHEX('#EEF5FF') : cc.color().fromHEX('#757CAB')
            item.getChildByName('block').active = this._titleSelect == index
        })
        this.mtt.active = this._titleSelect == 3
        this.Rectangle.active = !this.mtt.active
        // TimeHelper.Sleep(1000);
        // this.listNode.getComponent(cc.Widget).top = 0
        // this.listNode.getComponent(cc.Widget).bottom = 0
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


        // await UIClubModel.mInstance.APIOrgMemberList(params);
        // let _data: any = APIOrgMemberList.Response.data
        let _data = { data: [1, 2, 34, 56], total: 5 }
        this._reqing = false
        if (!_data.data) {
            _data.data = [];
        }

        _data.data.forEach(element => {
            this._list.push(element);
        });  //分页的时候使用的
        this._total = _data.total

        this.list.numItems = this._list.length;
        this._offset = this._list.length;
        this._reqEnd = this._list.length == this._total;
        this.lb_tip.active = this.list.numItems == 0
    }
    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(recordItem);
        item.initData(this._list[index]);//
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
