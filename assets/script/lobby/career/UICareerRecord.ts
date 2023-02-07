/*
 * @Author: xfj
 * @Date: 2023-02-02 16:40:21
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-07 14:24:07
 * @FilePath: /pokerqueen/assets/script/lobby/career/UICareerRecord.ts
 */

import List from "../../common/List";
import TabNode from "../../common/tabNode";
import { CareerRecordTabConfig } from "../../frame/config/tabConfig";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import { LobbyControl } from "../control/LobbyControl";
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

    @property(cc.Node)
    lbl_Node: cc.Node = null;
    @property(cc.Node)
    mtt_lbl_Node: cc.Node = null;

    _titleSelect = 0;
    _tabSelect = 0;
    _coinIndex = 1
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
        this._coinIndex = param || 1
        this.reqDataAgain();
        this.onClickTypeTabBtns(0);
        this.reqUpInfo(this._titleSelect, this._tabSelect)
    }
    titleNodeClick(customData) {
        this._tabSelect = customData
        this.reqUpInfo(this._titleSelect, this._tabSelect)
    }

    onClickTypeTabBtns(_index) {
        this._titleSelect = _index
        this.titleNode.children.forEach((item, index) => {
            item.getChildByName('title').color = this._titleSelect == index ? cc.color().fromHEX('#EEF5FF') : cc.color().fromHEX('#757CAB')
            item.getChildByName('block').active = this._titleSelect == index
        })
        this.mtt.active = this._titleSelect == 3
        this.Rectangle.active = !this.mtt.active
        this.reqUpInfo(this._titleSelect, this._tabSelect)
    }

    reqUpInfo(gameType, timeType) {
        let info = {
            game_type: gameType + 1,       //游戏类型0-all,1-常规桌，2pl0，3-6,4-mtt
            time_type: timeType + 1,      //游戏类型1-今日, 2-7天, 3-30天, 4-生涯
            time_long: TimeHelper.Now,      //客户端时间戳
            filter_type: this._coinIndex
        }
        // UIData_KrVdD5WqB=生涯
        // UIData_TodayMoney=今日盈利
        // UIData_WeekMoney=7日盈利
        // UIData_MonthMoney=30日盈利

        LobbyControl.getInstance().getUserStatsInfo(info).then(
            (res) => {
                this.refreshUpUI(res);
            },
            (res) => {
            }
        )
    }

    refreshUpUI(data) {
        let room_data = data.data.room_data;
        let mtt_room_data = data.data.mtt_room_data;
        if (this._titleSelect == 3) //mtt
        {
            for (let index = 0; index < this.mtt_lbl_Node.childrenCount; index++) {
                const element = this.mtt_lbl_Node.children[index];
                let lbl_1 = element.children[index].getComponent(cc.Label)
                switch (index) {
                    case 0:
                        lbl_1.string = mtt_room_data.play_times
                        break;
                    case 1:
                        lbl_1.string = mtt_room_data.win_times
                        break;
                    case 2:
                        lbl_1.string = mtt_room_data.frist_times
                        break;
                    case 3:
                        lbl_1.string = mtt_room_data.second_times
                        break;
                    case 4:
                        lbl_1.string = mtt_room_data.third_times
                        break;
                    default:
                        break;
                }
            }
        } else {
            for (let index = 1; index < 14; index++) {
                const element = this.lbl_Node.getChildByName('lbl_' + index).getComponent(cc.Label)
                let str = ''
                switch (index) {
                    case 1:
                        str = room_data.total_game_cnt
                        break;
                    case 2:
                        str = room_data.aveage_earn
                        break;
                    case 3:
                        str = room_data.total_hand
                        break;
                    case 4:
                        str = room_data.aveage_earn_hundred
                        break;
                    case 5:
                        str = room_data.vpip + '%'
                        break;
                    case 6:
                        str = room_data.prf + '%'
                        break;
                    case 7:
                        str = room_data.af + '%'
                        break;
                    case 8:
                        str = room_data.wtsd + '%'
                        break;
                    case 9:
                        str = room_data.wins + '%'
                        break;
                    case 10:
                        str = room_data.bet3 + '%'
                        break;
                    case 11:
                        str = room_data.cbet + '%'
                        break;
                    case 12:
                        str = room_data.allinWins + '%'
                        break;
                    case 13:
                        element.string = (room_data.total_earn < 0 ? '' : '+') + StringHelper.GetLongString(room_data.total_earn || 0)
                        this.setTextColor(element, room_data.total_earn < 0 ? '#FF7C7C' : '#B0FFAE')
                        return

                    default:
                        break;
                }
                element.string = str
            }
        }
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
