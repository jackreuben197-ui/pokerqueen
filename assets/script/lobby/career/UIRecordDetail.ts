/*
 * @Author: xfj
 * @Date: 2023-02-02 16:40:21
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-09 12:18:02
 * @FilePath: /pokerqueen/assets/script/lobby/career/UIRecordDetail.ts
 */

import List from "../../common/List";
import TabNode from "../../common/tabNode";
import { UIDefine } from "../../define/UIDefine";
import { CareerRecordTabConfig } from "../../frame/config/tabConfig";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIComponent from "../../ui/UIComponent";
import { LobbyControl } from "../control/LobbyControl";
import recordDetailItem from "./recordDetailItem";
import recordItem from "./recordItem";


const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/career/UIRecordDetail')
export default class UIRecordDetail extends BaseFormPlus {
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
        this.list.scrollingCB = this.scrollingCB;
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

        LobbyControl.getInstance().getRecordDetailInfo(this._roomId, info).then(
            (data: any) => {
                this._respInfo = data;
                let roomData = data.data.room_data;
                this.refreshUpUI(roomData);
                let user_list = roomData.user_list;
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
            },
            (res) => {
            }
        )
    }
    refreshUpUI(roomData) {
        this.id.string = 'ID:' + roomData.room_id;
        this.data_date.string = TimeHelper.convertUTCTimeToLocalTime(roomData.start_time) + ' - ' + TimeHelper.convertUTCTimeToLocalTime(roomData.end_time)

        for (let index = 0; index < this.lbl_Node.childrenCount; index++) {
            const lbl_1 = this.lbl_Node.children[index].getComponent(cc.Label)
            switch (index) {
                case 0:
                    lbl_1.string = TimeHelper.ShowRemainingSemicolon3(roomData.player_duration)
                    break;
                case 1:
                    lbl_1.string = StringHelper.GetLongString(roomData.blind) + '/' + StringHelper.GetLongString(roomData.blind * 2)
                    break;
                case 2:
                    lbl_1.string = roomData.room_total_hand_num
                    break;
                case 3:
                    lbl_1.string = StringHelper.GetLongString(roomData.all_bring_in)
                    break;
                default:
                    break;
            }
        }
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(recordDetailItem);
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
    itemClick() {
        UIComponent.open(UIDefine.UIRecordHands, { type: 2, roomData: this._respInfo.data.room_data })
    }

}
