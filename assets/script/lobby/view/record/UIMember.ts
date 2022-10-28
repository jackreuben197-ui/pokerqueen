import { UIDefine } from "../../../define/UIDefine";
import GGEvent from "../../../event/GGEvent";
import LobbyData from "../../../frame/data/lobby/LobbyData";
import GC from "../../../frame/GameControl";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import { Web_Stats_User_Stats } from "../../../net/https/WebRequest";
import UIDialogComponent from "../../../ui/dialog/UIDialogComponent";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMember extends BaseForm {

    lastGameType: number = 1;
    lastTimeType: number = 1;
    oldDates: Array<string> = [];
    _info: any = null;

    protected lateLoad() {
        super.lateLoad();
    }


    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);

        this._info = param.info;
        if (this._info == null) {
            return;
        }
      
        this.resetUI();

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

        for (let i=1; i<4; i++) {
            let btn_1: cc.Node = this.getChildNodeOrComponent("btn_" + i);
            btn_1["index"] = i;
            btn_1.on(cc.Node.EventType.TOUCH_END, this.onClickBtn, this)
        }
        
        this.refreshHeadImg();

        let lbl_nickname = this.getChildNodeOrComponent('lbl_nickname').getComponent(cc.Label)
        lbl_nickname.string = this._info.nick_name;

        let lbl_gold = this.getChildNodeOrComponent('lbl_gold').getComponent(cc.Label)
        lbl_gold.string = this._info.gold;
        

        let lbl_id = this.getChildNodeOrComponent('lbl_id').getComponent(cc.Label)
        lbl_id.string = "ID: " + this._info.random_num;

        
        let lbl_addTime = this.getChildNodeOrComponent('lbl_addTime').getComponent(cc.Label)
        let ts = Date.parse(this._info.user_join_club_time)
        let date = new Date(ts)
        let timeStr = date.getFullYear() + "/" + (date.getMonth()+1).toString() + "/" + date.getDate() + "  " +
        TimeHelper._zeroNum(date.getHours()) + ":" + TimeHelper._zeroNum(date.getMinutes());
        lbl_addTime.string = "加入时间: " + timeStr;

        let btn_1: cc.Node = this.getChildNodeOrComponent("btn_1");
        let btn_2: cc.Node = this.getChildNodeOrComponent("btn_2");
        if (this._info.forbidden) {
            //冻结
            btn_1.active = false;
            btn_2.active = true;
        } else {
            btn_1.active = true;
            btn_2.active = false;
        }

        this.reqUpInfo(0, 1);
    }

    refreshHeadImg() {
        let img_head: cc.Sprite = this.getChildNodeOrComponent("img_head", cc.Sprite);
        img_head.node.active =false;
        WebImageHelper.SetUrlImage(img_head, this._info.avatar).then(()=>{
            img_head.node.active =true;
        });
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

    refreshUpUI(data) {
        for (let i=1; i<5; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("pi_" + i);
            let lbl = btn_pt_1.getChildByName("lbl").getComponent(cc.Label);
            let label = btn_pt_1.getComponent(cc.Label);
            let room_data = data.data.room_data;
            let mtt_room_data = data.data.mtt_room_data;
            
            if (this.lastGameType == 5) {
                // MTT
                if (i == 1) {
                    lbl.string = "总场数";
                } else if (i == 2) {
                    lbl.string = "冠军数";
                } else if (i == 3) {
                    lbl.string = "亚军数";
                } else if (i == 4) {
                    lbl.string = "季军数";
                }

                if (i == 1) {
                    label.string = mtt_room_data.play_times;
                } else if (i == 2) {
                    label.string = mtt_room_data.frist_times;
                } else if (i == 3) {
                    label.string = mtt_room_data.second_times;
                } else if (i == 4) {
                    label.string = mtt_room_data.third_times;
                }
            } else {
                //普通
                if (i == 1) {
                    lbl.string = "局数";
                } else if (i == 2) {
                    lbl.string = "手数";
                } else if (i == 3) {
                    lbl.string = "入池率";
                } else if (i == 4) {
                    lbl.string = "翻牌前加注率";
                }

                if (i == 1) {
                    label.string = room_data.total_game_cnt;
                } else if (i == 2) {
                    label.string = room_data.total_hand;
                } else if (i == 3) {
                    label.string = room_data.vpip + "%";
                } else if (i == 4) {
                    label.string = room_data.prf + "%";
                }
            }
        }
        

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

    // 确定删除XXX?
    onClickBtn(event) {
        let node = event.target;
        let index = node.index;

        let title = "";
        let content = "";
        if (index == 1) {
            // 冻结
            title = "冻结";
            content = "确定冻结" + this._info.nick_name + "?";
        } else if (index == 2) {
            // 解冻
            title = "解冻";
            content = "确定解冻" + this._info.nick_name + "?";
        } else if (index == 3) {
            // 删除
            title = "删除";
            content = "确定删除" + this._info.nick_name + "?";
        }

        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent, {
            type: UIDialogComponent.DialogType.CommitCancel,
            title: title,
            content: content,
            contentCommit: "确定",
            contentCancel: "取消",
            actionCommit: () => {
                let btn_1: cc.Node = this.getChildNodeOrComponent("btn_1");
                let btn_2: cc.Node = this.getChildNodeOrComponent("btn_2");
                if (index == 1) {
                    // 冻结
                    let info = {
                        user_id: this._info.user_id,      
                    }
                    LobbyControl.getInstance().reqClubLockUser(info).then(
                        (res) => {
                            //冻结
                            this.post(GGEvent.CLUB_DELE_USER);
                            btn_1.active = false;
                            btn_2.active = true;
                        },
                        (res) => {
                        }
                    )
                } else if (index == 2) {
                    // 解冻
                    let info = {
                        user_id: this._info.user_id,      
                    }
                    LobbyControl.getInstance().reqClubUnlockUser(info).then(
                        (res) => {
                            //解冻
                            this.post(GGEvent.CLUB_DELE_USER);
                            btn_1.active = true;
                            btn_2.active = false;
                        },
                        (res) => {
                        }
                    )
                } else if (index == 3) {
                    // 删除
                    let info = {
                        user_id: this._info.user_id,      
                    }
                    LobbyControl.getInstance().reqClubDeleleUser(info).then(
                        (res) => {
                            this.post(GGEvent.CLUB_DELE_USER);
                            this.close();
                        },
                        (res) => {
                        }
                    )
                }
            },
            noAnimation: true,
        });
    }

    onClickNLH(event) {
        let node = event.target;
        let index = node.index;
        this.refreshChooseNLH(index);
        this.lastGameType = index;
        this.reqUpInfo(index, this.lastTimeType);
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

    onClickItem(event) {
        let target = event.target;
        let info = target.info;
        UIComponent.open(UIDefine.UIRecordDetail, {info : info});
    }

}
