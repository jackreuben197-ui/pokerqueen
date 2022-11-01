/*
 * @Author: xfj
 * @Date: 2022-10-28 16:30:12
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-01 15:48:52
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIClubDataMange.ts
 */

import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import { Web_Org_Club_Get } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { LobbyControl } from "../control/LobbyControl";
import Data from "./script/Data";
import { UIClubModel } from "./UIClubModel";


const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIClubDataMange')
export default class UIClubDataMange extends BaseForm {
    @property(cc.Label)
    lbl_num: cc.Label = null;
    @property(cc.Node)
    sureBtn: cc.Node = null;

    lastGameType: number = 1;
    lastTimeType: number = 1;
    oldDates: Array<string> = [];
    _info: any = null;
    _clickDataItem = null;
    protected lateLoad(): void {
        super.lateLoad();
    }
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        // this._info = param;
        // if (this._info == null) {
        //     return;
        // }
        this.resetUI();

        for (let i = 1; i < 6; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("btn_pt_" + i);
            btn_pt_1["index"] = i;
            btn_pt_1.on(cc.Node.EventType.TOUCH_END, this.onClickNLH, this)
        }

        for (let i = 1; i < 4; i++) {
            let btn_pd_1: cc.Node = this.getChildNodeOrComponent("btn_pd_" + i);
            btn_pd_1["index"] = i;
            btn_pd_1.on(cc.Node.EventType.TOUCH_END, this.onClickDate, this)
        }
        for (let i = 4; i < 6; i++) {
            let btn_pd_1: cc.Node = this.getChildNodeOrComponent("btn_pd_" + i);
            btn_pd_1["index"] = i;
            btn_pd_1.getComponent(cc.Label).string = i == 4 ? '开始时间' : '结束时间'
            btn_pd_1.on(cc.Node.EventType.TOUCH_END, this.openCalendar, this)
        }
        this.sureBtn["index"] = 5;

        this.reqUpInfo(0, 1);
        this.reqDownInfo(0, 1);
    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.refresh_Btn_Data, this.chaneData)
    }
    onDisable() {
        cc.director.off('show');
    }
    openCalendar(event, customData) {
        this._clickDataItem = event.target
        UIComponent.open(UIDefine.UICalendar)
    }
    chaneData() {
        this._clickDataItem['_data'] = Data.getInstance().selDate;
        this._clickDataItem.getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(Data.getInstance().selDate, '/', false)
    }

    onClickDate(event) {
        let node = event.target;
        let index = node.index;
        this.refreshChooseDate(index);
        this.lastTimeType = index;
        this.reqUpInfo(this.lastGameType, index);
    }

    resetUI() {
        this.lastGameType = 1;
        this.lastTimeType = 1;
        this.refreshChooseNLH(1);
        this.refreshChooseDate(1);
    }
    reqUpInfo(gameType, timeType) {

        let data: any = Web_Org_Club_Get.Response.data;
        let info: any = {
            club_id: data.club_id,
            game_type: gameType,       //游戏类型0-all,1-常规桌，2-OMAHA4，3-OMAHA5，4-OMAHA6,5-mtt
            time_type: timeType,      //游戏类型1-今日, 2-7天, 3-30天, 4-生涯
            time_long: new Date().getTime(),      //客户端时间戳
        }
        let btn_pd_4 = this.getChildNodeOrComponent("btn_pd_4", cc.Label);
        let btn_pd_5 = this.getChildNodeOrComponent("btn_pd_5", cc.Label);

        if (timeType == 5) {
            if (btn_pd_4.string == '开始时间') {
                UIComponent.Instance.Toast('请选择开始时间')
                return;
            }
            if (btn_pd_5.string == '结束时间') {
                UIComponent.Instance.Toast('请选择结束时间')
                return;
            }
            info.start_time = btn_pd_4.node['_data'].getTime();
            info.end_time = btn_pd_5.node['_data'].getTime();
        }
        UIClubModel.mInstance.APIOrgClubEarning(info).then(
            (res) => {
                this.refreshUpUI(res);
            },
            (res) => {
            }
        )
    }
    onClickNLH(event) {
        let node = event.target;
        let index = node.index;
        this.refreshChooseNLH(index);
        this.lastGameType = index;
        this.reqUpInfo(index, this.lastTimeType);
        this.reqDownInfo(index, this.lastTimeType);
    }


    refreshChooseNLH(index) {
        for (let i = 1; i < 6; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("btn_pt_" + i);
            let label = btn_pt_1.getComponent(cc.Label);
            if (i == index) {
                label.fontSize = 46;
                btn_pt_1.opacity = 255;
            } else {
                label.fontSize = 38;
                btn_pt_1.opacity = 76.5;
            }
        }
    }
    refreshUpUI(data) {
        for (let i = 1; i < 7; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("pi_" + i);
            let lbl = btn_pt_1.getChildByName("lbl").getComponent(cc.Label);
            let label = btn_pt_1.getComponent(cc.Label);
            let room_data = data?.data?.data;
            if (!room_data) return
            //普通
            if (i == 1) {
                lbl.string = "总收益";
                label.string = room_data.total_profit;
            } else if (i == 2) {
                lbl.string = "服务费";
                label.string = room_data.service_profit
            } else if (i == 3) {
                lbl.string = "道具分成";
                label.string = room_data.prop_profit;
            }
            else if (i == 4) {
                lbl.string = "手数/局数";
                label.string = room_data.total_hand + ' / ' + room_data.total_game_cnt;
            } else if (i == 5) {
                lbl.string = "新增";
                label.string = room_data.total_add_register_user_count;
            } else if (i == 6) {
                lbl.string = "活跃";
                label.string = room_data.sum_match_active;
            }
        }

    }

    refreshChooseDate(index) {
        for (let i = 1; i < 4; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("btn_pd_" + i);
            let label = btn_pt_1.getComponent(cc.Label);
            let img_line = btn_pt_1.getChildByName("img_line");
            if (i == index) {
                btn_pt_1.color = cc.color(53, 163, 179, 255);
                img_line.active = true;
            } else {
                btn_pt_1.color = cc.color(255, 255, 255, 255);
                img_line.active = false;
            }
        }
    }
    reqDownInfo(gameType, timeType) {
        let data: any = Web_Org_Club_Get.Response.data;
        let info = {
            club_id: data.club_id,
            game_type: gameType,       //游戏类型0-all,1-常规桌，2-OMAHA4，3-OMAHA5，4-OMAHA6,5-mtt
            time_type: timeType,      //游戏类型1-今日, 2-7天, 3-30天, 4-生涯
            time_long: new Date().getTime(),      //客户端时间戳
        }
        UIClubModel.mInstance.APIOrgClubMemberEarning(info).then(
            (res) => {
                this.refreshListView(res);
            },
            (res) => {
            }
        )
    }

    refreshListView(data) {
        let records = data.data.data;
        let lbl_noshow: cc.Node = this.getChildNodeOrComponent("lbl_notShow");
        let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        scrollView.content.removeAllChildren();
        scrollView.scrollToTop();
        this.lbl_num.string = '( ' + records.length + ' )'
        if (records.length == 0) {
            lbl_noshow.active = true;
        } else {
            lbl_noshow.active = false;
            // 有数据 刷新列表
            let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
            let len = records.length;
            this.oldDates = [];
            for (let i = 0; i < len; i++) {
                let info = records[i];
                let _cloneNode = cc.instantiate(panel_item);
                _cloneNode.x = 0;
                // _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
                _cloneNode.parent = scrollView.content;
                let lbl_up = _cloneNode.getChildByName('lbl_up')

                let lbl_num = lbl_up.getChildByName('lbl_num').getComponent(cc.Label);
                lbl_num.string = (i + 1) + ''

                let lbl_nickName = lbl_up.getChildByName('lbl_nickName').getComponent(cc.Label);
                lbl_nickName.string = info.user_name;

                let lbl_id = lbl_up.getChildByName('lbl_id').getComponent(cc.Label);
                lbl_id.string = 'ID:' + info.user_id

                let lbl_down = _cloneNode.getChildByName('lbl_down')
                let lbl1 = lbl_down.getChildByName('lbl_Node1').getChildByName('lbl_hand').getComponent(cc.Label);
                let lbl2 = lbl_down.getChildByName('lbl_Node2').getChildByName('lbl_hand').getComponent(cc.Label);
                let lbl3 = lbl_down.getChildByName('lbl_Node3').getChildByName('lbl_hand').getComponent(cc.Label);
                let lbl4 = lbl_down.getChildByName('lbl_Node4').getChildByName('lbl_hand').getComponent(cc.Label);
                lbl1.string = info.total_hand + ' / ' + info.total_game_cnt
                lbl2.string = info.service_profit
                lbl3.string = info.prop_profit
                lbl4.string = info.total_earn

            }
        }
    }

}
