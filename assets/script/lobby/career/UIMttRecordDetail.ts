/*
 * @Author: xfj
 * @Date: 2023-02-02 16:40:21
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-09 11:23:47
 * @FilePath: /pokerqueen/assets/script/lobby/career/UIMttRecordDetail.ts
 */

import List from "../../common/List";
import TabNode from "../../common/tabNode";
import { UIDefine } from "../../define/UIDefine";
import { CareerRecordTabConfig } from "../../frame/config/tabConfig";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIComponent from "../../ui/UIComponent";
import { LobbyControl } from "../control/LobbyControl";
import Data from "../labor/script/Data";
import UICareer from "../new_club/career/UICareer";
import recordDetailItem from "./recordDetailItem";
import recordItem from "./recordItem";
import { UICareerModel } from "./UICareerModel";


const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/career/UIMttRecordDetail')
export default class UIMttRecordDetail extends BaseFormPlus {
    @property(cc.Node)
    lb_tip: cc.Node = null;

    @property(cc.Label)
    data_date: cc.Label = null;

    @property(cc.Label)
    id: cc.Label = null;

    @property(cc.Node)
    lbl_Node: cc.Node = null;


    @property(List)
    list: List = null;
    _titleSelect = 0;
    _tabSelect = 0;
    _list = [];
    _offset = 0;
    _total = 0;
    _reqing = false;
    _reqEnd = false;
    _roomId = null;
    _respInfo = null;
    protected lateLoad(): void {
        super.lateLoad();

    }
    onShow(param?, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        this._roomId = param;
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
        let info = {
            limit: 20,         //条目
            offset: this._offset,        //开始下标。例子（offset=0，limit=10，0-9。）
        }
        let data: any = await UICareerModel.mInstance.api_stats_mtt_room_detail(this._roomId, info)
        let mtt_room_data = data.data.mtt_room_data;
        this.refreshUpUI(mtt_room_data);
        let user_list = mtt_room_data.user_list;
        this._reqing = false
        if (!user_list) {
            user_list = [];
        }
        user_list.forEach(element => {
            this._list.push(element);
        });  //分页的时候使用的
        this._total = user_list.total

        this.list.numItems = this._list.length;
        this._offset = this._list.length;
        this._reqEnd = this._list.length == this._total;
        this.lb_tip.active = this.list.numItems == 0
    }
    refreshUpUI(roomData) {
        this.id.string = 'ID:' + roomData.room_id;
        let _duration = new Date(roomData.end_time).getTime() - new Date(roomData.start_time).getTime();

        this.data_date.string = TimeHelper.convertUTCTimeToLocalTime(roomData.start_time) + ' - ' + TimeHelper.convertUTCTimeToLocalTime(roomData.end_time)

        for (let index = 0; index < this.lbl_Node.childrenCount; index++) {
            const lbl_1 = this.lbl_Node.children[index].getComponent(cc.Label)
            switch (index) {
                case 0:
                    lbl_1.string = this.getMatchName(roomData.game_type)
                    break;
                case 1:
                    lbl_1.string = roomData.player_count
                    break;
                case 2:
                    lbl_1.string = roomData.buy_in_count
                    break;
                case 3:
                    lbl_1.string = TimeHelper.ShowRemainingSemicolon3(_duration / 1000)
                    break;
                default:
                    break;
            }
        }
    }
    getMatchName(type) {
        let name = ''
        switch (type) {
            case 0:
                name = i18nMgr.Get('UITexasRule_texas')
                break;
            case 1:
                name = i18nMgr.Get('UITexasRule_omaha') + 4
                break;
            case 2:
                name = i18nMgr.Get('UITexasRule_omaha') + 5
                break;
            case 3:
                name = i18nMgr.Get('UITexasRule_omaha') + 6
                break;
            default:
                break;
        }
        return name;
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(recordDetailItem);
        item.initData(this._list[index], index, 1);//
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
    // itemClick() {
    //     UIComponent.open(UIDefine.UIRecordHands, { type: 2, roomData: this._respInfo.data.room_data })
    // }

}
