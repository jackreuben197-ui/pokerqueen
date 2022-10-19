import TimeHelper from "../../../helper/TimeHelper";
import { Web_Stats_User_Stats } from "../../../net/https/WebRequest";
import BaseForm from "../../../ui/form/BaseForm";
import { LobbyControl } from "../../control/LobbyControl";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIRecord extends BaseForm {

    lastGameType: number = 1;
    lastTimeType: number = 1;

    protected lateLoad() {
        super.lateLoad();
    }


    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: BaseForm): void {
        super.onShow(param, fromUI);
      

        for (let i=1; i<6; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("btn_pt_" + i);
            btn_pt_1["index"] = i;
            btn_pt_1.on(cc.Node.EventType.TOUCH_END, this.onClickNLH, this)
        }

        for (let i=1; i<4; i++) {
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
            time_long: TimeHelper.Now(),      //客户端时间戳
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
            limit: 10,         //条目
            offset: 0,        //开始下标。例子（offset=0，limit=10，0-9。）
            game_type: this.lastGameType,     //游戏类型，对应客户端 枚举 GameType
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
        for (let i=1; i<6; i++) {
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

    refreshChooseDate(index) {
        for (let i=1; i<4; i++) {
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

    refreshUpUI(data) {
        for (let i=1; i<7; i++) {
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
                    label.string = total;
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
                    label.string = room_data.total_earn;
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
        // if (records.length == 0) {
        //     lbl_noshow.active = true;
        // } else {
            lbl_noshow.active = false;
            // 有数据 刷新列表
            let sv_down: cc.Node = this.getChildNodeOrComponent("sv_down");
            let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
            let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
            let len = 5;
            scrollView.content.removeAllChildren();
            for (let i=1; i<len; i++) {
                let _cloneNode = cc.instantiate(panel_item);
                _cloneNode.x = 0;
                _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i-1);
                _cloneNode.parent = scrollView.content;

                _cloneNode.getChildByName("lbl_score").getComponent(cc.Label).string = i.toString();
            }
            scrollView.content.height = panel_item.height * len;
        // }
    }

}
