/*
 * @Author: xfj
 * @Date: 2023-02-03 16:57:42
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-04-26 12:21:16
 * @FilePath: /pokerqueen/assets/script/lobby/career/UIInsurance.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import List from "../../common/List";
import { i18nMgr } from "../../i18n/i18nMgr";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import { LobbyControl } from "../control/LobbyControl";
import { UIClubModel } from "../labor/UIClubModel";
import insuranceItem from "./insuranceItem";
import recordScoreItem from "./recordScoreItem";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/career/UIInsurance')
export default class UIInsurance extends BaseFormPlus {
    @property(cc.Node)
    lb_tip: cc.Node = null;
    @property(cc.Label)
    totalNum: cc.Label = null;

    @property(List)
    list: List = null;

    _titleSelect = 0;
    _tabSelect = 0;
    _list = [];
    _offset = 0;
    _total = 0;
    _reqing = false;
    _reqEnd = false;
    _type = 1;
    _roomData = null;
    protected lateLoad(): void {
        super.lateLoad();
    }
    onShow(param?, fromUI?: cc.Node): void {
        this._type = param.type;
        this._roomData = param.roomData;
        super.onShow(param, fromUI);
        this.list.scrollingCB = this.scrollingCB;
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
        let str = i18nMgr.Get('UIMine_Paipu_count')
        let _data = null;
        let info = {
            room_id: this._roomData?.room_id || 0,
            match_id: this._roomData?.match_id || 0,
            limit: 20,
            offset: this._offset,
        }
        _data = await UIClubModel.mInstance.WebStatsRoomInsuranceInfo(info)
        this._reqing = false
        if (!_data?.data?.list) {
            _data.data.list = [];
        }
        this.totalNum.string = _data.data.insurance_amount;

        _data.data.list.forEach(element => {
            this._list.push(element);
        });  //分页的时候使用的
        this._total = _data.total

        this.list.numItems = this._list.length;
        this._offset = this._list.length;
        this._reqEnd = this._list.length == this._total;
        this.lb_tip.active = this.list.numItems == 0
    }
    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(insuranceItem);
        item.initData(this._list[index], index);//
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
