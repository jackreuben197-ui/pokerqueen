import { UIDefine } from "../../../define/UIDefine";
import LobbyData from "../../../frame/data/lobby/LobbyData";
import GC from "../../../frame/GameControl";
import TimeHelper from "../../../helper/TimeHelper";
import { Web_Stats_User_Stats, Web_User_Info } from "../../../net/https/WebRequest";
import UIDialogComponent from "../../../ui/dialog/UIDialogComponent";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";
import { UIClubModel } from "../../labor/UIClubModel";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIRecord extends BaseForm {

    lastGameType: number = 1;
    lastTimeType: number = 1;
    oldDates: Array<string> = [];

    protected lateLoad() {
        super.lateLoad();
    }

    _fromParm = null;
    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        this._fromParm = param
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

        this.reqUpInfo(this.lastGameType, this.lastTimeType);
        this.reqDownInfo();
    }

    reqUpInfo(gameType, timeType) {
        let info = {
            game_type: gameType,       //游戏类型0-all,1-常规桌，2-OMAHA4，3-OMAHA5，4-OMAHA6,5-mtt
            time_type: timeType,      //游戏类型1-今日, 2-7天, 3-30天, 4-生涯
            time_long: new Date().getTime(),      //客户端时间戳
        }
        LobbyControl.getInstance().getUserStatsInfo(info).then(
            (res) => {
                this.refreshUpUI(res);
            },
            (res) => {
            }
        )
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

    refreshChooseNLH(index) {
        for (let i = 1; i < 6; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("btn_pt_" + i);
            let label = btn_pt_1.getChildByName("lbl").getComponent(cc.Label);
            if (i == index) {
                label.fontSize = 46;
                btn_pt_1.opacity = 255;
            } else {
                label.fontSize = 38;
                btn_pt_1.opacity = 76.5;
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

    onClickNLH(event) {
        let node = event.target;
        let index = node.index;
        this.refreshChooseNLH(index);
        this.lastGameType = index;
        this.reqUpInfo(index, this.lastTimeType);
        this.reqDownInfo();
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
        let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        scrollView.content.removeAllChildren();
    }

    refreshUpUI(data) {
        for (let i = 1; i < 7; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("pi_" + i);
            let lbl = btn_pt_1.getChildByName("lbl").getComponent(cc.Label);
            let label = btn_pt_1.getComponent(cc.Label);
            let room_data = data.data.room_data;
            let mtt_room_data = data.data.mtt_room_data;

            if (this.lastGameType == 5) {
                // MTT
                if (i == 1) {
                    lbl.string = "冠军数";
                } else if (i == 2) {
                    lbl.string = "前3数";
                } else if (i == 3) {
                    lbl.string = "奖励圈数";
                }

                if (i == 1) {
                    label.string = mtt_room_data.frist_times;
                } else if (i == 2) {
                    let total = mtt_room_data.frist_times + mtt_room_data.second_times + mtt_room_data.third_times;
                    LobbyControl.getInstance().setWinColor(label, total, true);
                } else if (i == 3) {
                    label.string = mtt_room_data.win_times;
                } else if (i == 4) {
                    label.string = room_data.vpip + "%";
                } else if (i == 5) {
                    label.string = room_data.prf + "%";
                } else if (i == 6) {
                    label.string = room_data.allinWins + "%";
                }
            } else {
                //普通
                if (i == 1) {
                    lbl.string = "局数";
                } else if (i == 2) {
                    lbl.string = "盈亏";
                } else if (i == 3) {
                    lbl.string = "手数";
                }

                if (i == 1) {
                    label.string = room_data.total_game_cnt;
                } else if (i == 2) {
                    LobbyControl.getInstance().setWinColor(label, room_data.total_earn, true);
                } else if (i == 3) {
                    label.string = room_data.total_hand;
                } else if (i == 4) {
                    label.string = room_data.vpip + "%";
                } else if (i == 5) {
                    label.string = room_data.prf + "%";
                } else if (i == 6) {
                    label.string = room_data.allinWins + "%";
                }
            }
        }


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
                LobbyControl.getInstance().setWinColor(lbl_bx_score, info.Change, true);
                _cloneNode.getChildByName("lbl_deskName").getComponent(cc.Label).string = nameStr;
                let sbStr = `${info.small_blind}/${info.small_blind * 2}`
                _cloneNode.getChildByName("lbl_sb").getComponent(cc.Label).string = sbStr;
                _cloneNode.getChildByName("lbl_bx").active = info.insurance_on == 1;
                let longStr = LobbyControl.getInstance().getLongTimeStr(info.play_duration);
                _cloneNode.getChildByName("lbl_total").getComponent(cc.Label).string = longStr;
                _cloneNode.getChildByName("img_dian_now").active = true;
                let ts = Date.parse(info.Time)
                let date = new Date(ts)
                let timeStr = TimeHelper.ZeroNum(date.getHours()) + ":" + TimeHelper.ZeroNum(date.getMinutes());
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
                    typeStr = "公会桌";
                } else if (info.origin_type == 4) {
                    typeStr = "朋友桌";
                }
                _cloneNode.getChildByName("lbl_type").getComponent(cc.Label).string = typeStr;
            }
            scrollView.content.height = panel_item.height * (len + 3);
        }
    }

    isExistDate(date) {
        let isExist = false;
        this.oldDates.forEach((v) => {
            if (date == v) {
                isExist = true;
            }
        });
        return isExist;
    }

    // 返回今天 昨天 或者 月.日 如果存在 返回 -1 今天存在  -2 非今天存在
    cacluDate(ts) {
        let date = new Date(ts);
        let str = "";
        ts = (ts / 1000) ^ 0;
        let code = -2;
        if (TimeHelper.isToday(ts)) {
            str = "今天";
            code = -1;
        } else {
            if (TimeHelper.isYesterday(ts)) {
                str = "昨天";
            } else {
                let month = date.getMonth() + 1;
                let day = date.getDate();
                str = month + "." + day;
            }
        }
        if (this.isExistDate(str)) {
            return code;
        }
        this.oldDates.push(str);
        return str;
    }

    onClickItem(event) {
        let target = event.target;
        let info = target.info;
        if (this._fromParm && this._fromParm.Name == UIDefine.UILaborPlayViewForm.Name) {
            UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
                {
                    type: UIDialogComponent.DialogType.CommitCancel,
                    title: "提示",
                    content: '即将分享到聊天中',
                    contentCommit: "确定",
                    contentCancel: "取消",
                    actionCommit: () => {
                        UIClubModel.mInstance.APIOrgSendMess(
                            {
                                "content": JSON.stringify(info),
                                "message_type": 3,
                                "standings_user_id": Web_User_Info.Response.data.user.user_id,
                                "game_round_id": 0,
                            }
                        )
                    },
                    noAnimation: true,
                });
            return
        }

        UIComponent.open(UIDefine.UIRecordDetail, { info: info });
    }

}
