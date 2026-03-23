/*
 * @Author: xfj
 * @Date: 2023-02-02 16:40:21
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-04-10 14:34:13
 * @FilePath: /pokerqueen/assets/script/lobby/career/UICareerRecord.ts
 */

import List from "../../common/List";
import TabNode from "../../common/tabNode";
import { CareerRecordTabConfig } from "../../frame/config/tabConfig";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import { WebConfigMultiLanguageTemplate } from "../../net/https/WebRequest";
import LobbySession from "../../session/LobbySession";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import { LobbyControl } from "../control/LobbyControl";
import recordItem from "./recordItem";
import { UICareerModel } from "./UICareerModel";


const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/career/UICareerRecord')
export default class UICareerRecord extends BaseFormPlus {
    @property(cc.Node)
    titleNode: cc.Node = null;
    @property(TabNode)
    tabNode: TabNode = null;
    @property(cc.Node)
    noDataTip: cc.Node = null;

    @property(cc.Node)
    Rectangle: cc.Node = null;

    @property(cc.Node)
    mtt: cc.Node = null;
    @property(cc.Node)
    listNode: cc.Node = null;

    @property(List)
    list: List = null;
    @property(cc.Label)
    lbl_13: cc.Label = null;

    @property(cc.Node)
    lbl_Node: cc.Node = null;
    @property(cc.Node)
    mtt_lbl_Node: cc.Node = null;

    @property(cc.Node)
    item: cc.Node = null;


    _titleSelect = 0;
    _tabSelect = 0;
    _coinIndex = 1
    _list = [];
    _offset = 0;
    _total = 0;
    _reqing = false;
    _reqEnd = false;
    _room_type = 0;

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?, fromUI?: cc.Node) {
        super.onShow(param, fromUI);
        this._titleSelect = 0;
        this.tabNode.initData(CareerRecordTabConfig, this.titleNodeClick.bind(this), this);
        this.titleNode.children.forEach((item, index) => {
            item.getChildByName('title').color = this._titleSelect == index ? cc.color().fromHEX('#EEF5FF') : cc.color().fromHEX('#757CAB')
            item.getChildByName('block').active = this._titleSelect == index
            this.bindClick(item, this.onClickTypeTabBtns, index);
        })
        this._coinIndex = param.coinType || 1
        this._room_type = param.type
        if (param.type == 0) {
            this.item.active = true
            this.titleNode.getComponent(cc.Layout).spacingX = 110
        } else if (param.type == 1) {
            this.item.active = false
            this.titleNode.getComponent(cc.Layout).spacingX = 200
        }
        // await LobbySession.APIConfig_Multi_Language_Template()
        this.onClickTypeTabBtns(0, true);
        this.list.scrollingCB = this.scrollingCB;
    }
    titleNodeClick(customData) {
        this._tabSelect = customData
        this.reqUpInfo()
    }

    onClickTypeTabBtns(_index, isInit = false) {
        this._titleSelect = _index
        this.titleNode.children.forEach((item, index) => {
            item.getChildByName('title').color = this._titleSelect == index ? cc.color().fromHEX('#EEF5FF') : cc.color().fromHEX('#757CAB')
            item.getChildByName('block').active = this._titleSelect == index
        })
        this.mtt.active = this._titleSelect == 3
        this.Rectangle.active = !this.mtt.active
        if (!isInit) {
            this.reqUpInfo();
        }
    }

    reqUpInfo() {
        let str = 'UIData_TodayMoney'
        switch (this._tabSelect + 1) {
            case 1:
                str = 'UIData_TodayMoney'
                break;
            case 2:
                str = 'UIData_WeekMoney'
                break;
            case 3:
                str = 'UIData_MonthMoney'
                break;
            case 4:
                str = 'UIData_KrVdD5WqB'
                break;

            default:
                break;
        }
        this.setText(this.lbl_13, str)
        let info = {
            game_type: this._titleSelect + 1,       //游戏类型0-all,1-常规桌，2pl0，3-6,4-mtt
            time_type: this._tabSelect + 1,      //游戏类型1-今日, 2-7天, 3-30天, 4-生涯
            time_long: TimeHelper.Now,      //客户端时间戳
            filter_type: this._coinIndex,
            room_type: this._room_type,
        }
        LobbyControl.getInstance().getUserStatsInfo(info).then(
            (res) => {
                this.refreshUpUI(res);
            },
            (res) => {
            }
        )
        this.reqDataAgain()


    }

    refreshUpUI(data) {
        let room_data = data.data.room_data;
        let mtt_room_data = data.data.mtt_room_data;
        if (this._titleSelect == 3) //mtt
        {
            for (let index = 0; index < this.mtt_lbl_Node.childrenCount; index++) {
                const lbl_1 = this.mtt_lbl_Node.children[index].getComponent(cc.Label)
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
                        str = StringHelper.DivFloat(room_data.aveage_earn, 100, -1)
                        break;
                    case 3:
                        str = room_data.total_hand
                        break;
                    case 4:
                        str = StringHelper.DivFloat(room_data.aveage_earn_hundred, 100, -1)
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
        let group_by = 1;
        let _data = null;
        // if (this._gameType == 1) {
        //     group_by = 2;
        // }
        if (this._titleSelect == 3) {
            group_by = 2;
            let info = {
                group_by: group_by,      //1 room 2 mtt 3 mttroom
                limit: 20,         //条目
                offset: this._offset,        //开始下标。例子（offset=0，limit=10，0-9。）
                filter_type: this._coinIndex,
                room_type: this._room_type,
            }
            _data = await UICareerModel.mInstance.WebRoomCenterHistoryGroup(info)

        } else {
            let info = {
                group_by: group_by,      //1 room 2 mtt 3 mttroom
                limit: 20,         //条目
                offset: this._offset,        //开始下标。例子（offset=0，limit=10，0-9。）
                game_type: this._titleSelect + 1,       //游戏类型0-all,1-常规桌，2pl0，3-6,4-mtt
                time_type: this._tabSelect + 1,      //游戏类型1-今日, 2-7天, 3-30天, 4-生涯
                time_long: TimeHelper.Now,      //客户端时间戳
                filter_type: this._coinIndex,
                room_type: this._room_type,
            }
            _data = await LobbyControl.getInstance().getHistoryInfo(info)
        }

        this._reqing = false
        if (!_data?.data.records) {
            _data.data.records = [];
        }

        _data.data.records.forEach(element => {
            this._list.push(element);
        });  //分页的时候使用的
        this._total = _data.data.total

        this.list.numItems = this._list.length;
        this._offset = this._list.length;
        this._reqEnd = this._list.length == this._total;
        //this.lb_tip.active = this.list.numItems == 0
        this.noDataTip.active = this.list.numItems == 0;
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
