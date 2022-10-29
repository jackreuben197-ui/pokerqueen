/*
 * @Author: xfj
 * @Date: 2022-10-28 16:30:12
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-29 13:47:02
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIClubDataMange.ts
 */

import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { LobbyControl } from "../control/LobbyControl";


const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIClubDataMange')
export default class UIClubDataMange extends BaseForm {
    lastGameType: number = 1;
    lastTimeType: number = 1;
    oldDates: Array<string> = [];
    _info: any = null;

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
            btn_pd_1.on(cc.Node.EventType.TOUCH_END, this.openCalendar, this)
        }

        // this.reqUpInfo(0, 1);
        // this.reqDownInfo();
    }
    openCalendar() {
        UIComponent.open(UIDefine.UICalendar)
    }
    onClickDate(event) {
        let node = event.target;
        let index = node.index;
        this.refreshChooseDate(index);
        this.lastTimeType = index;
        // this.reqUpInfo(this.lastGameType, index);
    }

    resetUI() {
        this.lastGameType = 1;
        this.lastTimeType = 1;
        this.refreshChooseNLH(1);
        this.refreshChooseDate(1);
    }
    reqUpInfo(gameType, timeType) {
        let info = {
            user_id: this._info.user_id,
            game_type: gameType,       //游戏类型0-all,1-常规桌，2-OMAHA4，3-OMAHA5，4-OMAHA6,5-mtt
            time_type: timeType,      //游戏类型1-今日, 2-7天, 3-30天, 4-生涯
            time_long: new Date().getTime(),      //客户端时间戳
        }
        LobbyControl.getInstance().reqClubStandings(info).then(
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
        // this.reqUpInfo(index, this.lastTimeType);
        // this.reqDownInfo();
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
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
            let room_data = data.data.room_data;
            //普通
            if (i == 1) {
                lbl.string = "总收益";
                label.string = room_data.total_game_cnt;
            } else if (i == 2) {
                lbl.string = "服务费";
                LobbyControl.getInstance().setWinColor(label, room_data.total_earn);
            } else if (i == 3) {
                lbl.string = "道具分成";
                label.string = room_data.total_hand;
            }
            else if (i == 4) {
                lbl.string = "手数/局数";
                label.string = room_data.vpip + "%";
            } else if (i == 5) {
                lbl.string = "新增";
                label.string = room_data.prf + "%";
            } else if (i == 6) {
                lbl.string = "活跃";
                label.string = room_data.allinWins + "%";
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
    reqDownInfo() {
        let group_by = 1;
        if (this.lastGameType == 5) {
            group_by = 2;
        }
        let info = {
            group_by: group_by,      //1 room 2 mtt 3 mttroom
            limit: 100,         //条目
            offset: 0,        //开始下标。例子（offset=0，limit=10，0-9。）
            game_type: this.lastGameType - 1,     //游戏类型，对应客户端 枚举 GameType
        }
        LobbyControl.getInstance().getHistoryInfo(info).then(
            (res) => {
                this.refreshListView(res);
            },
            (res) => {
            }
        )
    }

    refreshListView(data) {
        let records = data.data.records;
        let lbl_noshow: cc.Node = this.getChildNodeOrComponent("lbl_notShow");
        let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        scrollView.content.removeAllChildren();
        scrollView.scrollToTop();
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
                _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
                _cloneNode.parent = scrollView.content;
                let nameStr = GC.data.languageTemp.temp.getName(info.Name);
                // 分数
                let lbl_bx_score = _cloneNode.getChildByName("lbl_score").getComponent(cc.Label);
                LobbyControl.getInstance().setWinColor(lbl_bx_score, info.Change);
                _cloneNode.getChildByName("lbl_deskName").getComponent(cc.Label).string = nameStr;
                let sbStr = `${info.small_blind}/${info.small_blind * 2}`
                _cloneNode.getChildByName("lbl_sb").getComponent(cc.Label).string = sbStr;
                _cloneNode.getChildByName("lbl_bx").active = info.insurance_on == 1;
                let longStr = LobbyControl.getInstance().getLongTimeStr(info.play_duration);
                _cloneNode.getChildByName("lbl_total").getComponent(cc.Label).string = longStr;
                _cloneNode.getChildByName("img_dian_now").active = true;
                let ts = Date.parse(info.Time)
                let date = new Date(ts)
                let timeStr = TimeHelper._zeroNum(date.getHours()) + ":" + TimeHelper._zeroNum(date.getMinutes());
                _cloneNode.getChildByName("lbl_time").getComponent(cc.Label).string = timeStr;
                _cloneNode["info"] = info;
                _cloneNode.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)
                let dateStr = this.cacluDate(ts);
                if (dateStr == -2) {
                    _cloneNode.getChildByName("img_kuang_now").active = false;
                    _cloneNode.getChildByName("img_dian_now").active = false;
                    _cloneNode.getChildByName("lbl_date").getComponent(cc.Label).string = "";
                } else {
                    if (dateStr == "今天" || dateStr == -1) {
                        _cloneNode.getChildByName("img_kuang_now").active = true;
                        _cloneNode.getChildByName("img_dian_now").active = true;
                    } else {
                        _cloneNode.getChildByName("img_dian_now").active = false;
                        _cloneNode.getChildByName("img_kuang_now").active = false;
                    }
                    if (dateStr == -1) {
                        _cloneNode.getChildByName("lbl_date").getComponent(cc.Label).string = "";
                    } else {
                        _cloneNode.getChildByName("lbl_date").getComponent(cc.Label).string = dateStr.toString();
                    }
                }

                let typeStr = "";
                if (info.origin_type == 1) {
                    typeStr = "平台桌";
                } else if (info.origin_type == 2) {
                    typeStr = "联盟桌";
                } else if (info.origin_type == 3) {
                    typeStr = "工会桌";
                } else if (info.origin_type == 4) {
                    typeStr = "朋友桌";
                }
                _cloneNode.getChildByName("lbl_type").getComponent(cc.Label).string = typeStr;
            }
            scrollView.content.height = panel_item.height * (len + 1);
        }
    }

}
