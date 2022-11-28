
import { UIDefine } from "../../define/UIDefine";
import MttListItemModel from "../../frame/data/mtt/MttListItemModel";
import { MTTJoinAction, UIMatchMttModel } from "../../frame/data/mtt/UIMatchMttModel";
import { GameCache } from "../../game/GameCache";
import MTTGame from "../../game/texas/MTTGame";
import MTTGameUtil from "../../game/util/MTTGameUtil";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { LobbyControl } from "../../lobby/control/LobbyControl";
import ToastManager from "../../manager/ToastManager";
import HttpRequest from "../../net/https/HttpRequest";
import { Web_Room_Center_Mtt_Details, Web_Room_Center_Mtt_Hranks, Web_Room_Center_Mtt_Myaward, Web_Room_Center_Mtt_Ranks, Web_Room_Center_Mtt_Real_Prize, Web_Room_Center_Mtt_Rooms } from "../../net/https/WebRequest";

import BaseForm from "../../ui/form/BaseForm";

import UIMttSignDialogComponent from "./UIMttSignDialogComponent";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/mtt/detail/MttDetailForm')
export default class MttDetailForm extends BaseForm {
    curType: number = 0;   // 0 - 4 对应上方5种类型
    _data: any = null;
    panel_dialog: cc.Node = null;
    panel_dialog2: UIMttSignDialogComponent = null;

    NeedVoiceprintVerification: boolean = false;
    isCurTimeOverEnterTime: boolean = false;
    _matchID: number = 0;
    isCanClick: boolean = true;
    isStar: boolean = false;

    lateLoad() {
        super.lateLoad();
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    lateClose(param: any = null) {
        super.lateClose(param);
        this.curType = 0;
    }

    onShow(data?: MttListItemModel): void {
        super.onShow(data);

        this._data = data;

        let panel_item2: cc.Node = this.getChildNodeOrComponent("panel_item");
        let img_av: cc.Sprite = panel_item2.getChildByName("img_av").getComponent(cc.Sprite);
        img_av.spriteFrame = null;


        let tabToggles: cc.Node = this.getChildNodeOrComponent("tabToggles");
        for (let i = 1; i < 6; i++) {
            let btn_pt_1: cc.Node = tabToggles.children[i - 1];
            btn_pt_1["index"] = i - 1;
            btn_pt_1.on(cc.Node.EventType.TOUCH_END, this.onClickTop, this)
        }

        this.panel_dialog = this.getChildNodeOrComponent("panel_dialog");
        let panel_root: cc.Node = this.getChildNodeOrComponent("panel_root");
        this.panel_dialog.active = false;
        this.loadPrefab(UIDefine.UIMttSignDialogComponent.Path, (node: cc.Node) => {
            node.parent = panel_root;
            let baseScript = node.getComponent(UIMttSignDialogComponent);
            this.panel_dialog2 = baseScript;
            baseScript.onShow();
            this.panel_dialog2.setVisible(false);
        })

        let btn_addMtt: cc.Node = this.getChildNodeOrComponent("btn_addMtt");
        btn_addMtt.on(cc.Node.EventType.TOUCH_END, this.OnClickSignBtn, this);



        this.updateUI();

        this.RefreshMttDetails();
    }

    refreshStatusUI(res) {
        let panel_item2: cc.Node = this.getChildNodeOrComponent("panel_item");
        let mttDetails = res;
        let isStar = false;
        // 根据比赛状态设置状态标签
        switch (mttDetails.mtt.status) {
            case MTTGame.MTTMatchStatus.Created:
                {
                    isStar = false;
                }
                break;
            case MTTGame.MTTMatchStatus.Running:
                {
                    isStar = true;
                }
                break;
        }
        let lbl_test = this.getChildNodeOrComponent("lbl_test").getComponent(cc.Label);
        lbl_test.string = mttDetails.mtt.name;

        let img_av: cc.Sprite = panel_item2.getChildByName("img_av").getComponent(cc.Sprite);
        WebImageHelper.SetUrlImage(img_av, mttDetails.mtt.game_icon);
        let dialogStr = i18nMgr.Get("UIMTT_StateHuntChampionshipsDialogDetail");
        let msg = LobbyControl.getInstance().formatString(dialogStr, mttDetails.mtt.hunter_bonus, 100 - mttDetails.mtt.hunter_bonus);
        this.updateDialogUI(msg);
        for (let i = 1; i < 5; i++) {
            let btn_pt_1: cc.Node = panel_item2.getChildByName("node" + i);
            let lbl_gold = btn_pt_1.getChildByName("lbl_gold").getComponent(cc.Label);
            if (i == 1) {
                lbl_gold.string = (mttDetails.more.prize_pool * 0.01).toString();
            } else if (i == 2) {
                lbl_gold.string = mttDetails.mtt.award_num.toString();
            } else if (i == 3) {
                lbl_gold.string = `${mttDetails.alive}` + "/" + `${mttDetails.mtt.participants}`;
            } else if (i == 4) {
                let singType = i18nMgr.Get("UIMatch_MttDetailState_ReyBuFerr").split(",");
                if (mttDetails.mtt.prop_buy_type == 0) {
                    if (mttDetails.mtt.apply_fee_pool + mttDetails.mtt.apply_fee_service + mttDetails.mtt.apply_fee_hunter <= 0) {
                        lbl_gold.string = singType[0];
                    }
                    else {
                        let num = mttDetails.mtt.apply_fee_pool + mttDetails.mtt.apply_fee_service + mttDetails.mtt.apply_fee_hunter;
                        lbl_gold.string = `${num * 0.01}`;
                    }
                }
                else if (mttDetails.mtt.prop_buy_type == 1) {
                    lbl_gold.string = singType[1];
                }
                else {
                    if (mttDetails.mtt.apply_fee_pool + mttDetails.mtt.apply_fee_service + mttDetails.mtt.apply_fee_hunter <= 0) {
                        lbl_gold.string = singType[2];
                    }
                    else {
                        let num = mttDetails.mtt.apply_fee_pool + mttDetails.mtt.apply_fee_service + mttDetails.mtt.apply_fee_hunter;
                        lbl_gold.string = `${i18nMgr.Get("UIMatch_MttDetailState_ReyBuFerr02"),
                        num * 0.01}`;
                    }
                }
            }

            if (!isStar) {

                let lbl_time: cc.Label = this.getChildNodeOrComponent("lbl_time_sign", cc.Label);

                let timespan = TimeHelper.RFC3339TimeConvertToUTCTime(mttDetails.mtt.start_time);
                // let len = TimeHelper.NumberToChinese(TimeHelper.GetDateTimer(timespan).Month).Split('^').Length;

                // let month = TimeHelper.NumberToChinese(int.Parse(TimeHelper.GetDateTimer(timespan).Month.ToString())).Replace("<size=40>", "");
                // if (len > 1)
                // {
                // 	month = TimeHelper.NumberToChinese(int.Parse(TimeHelper.GetDateTimer(timespan).Month.ToString())).Split('^')[0];
                // }
                //textBeginTime.text = month.Replace("</size>", "") + " " + TimeHelper.GetDateTimer(timespan).Day.ToString() + "  " + TimeHelper.TimerDateMinStr(TimeHelper.GetTimestampByDateTime(TimeHelper.RFC3339TimeConvertToUTCTime(mttDetails.mtt.start_time)));
                // lbl_time.string = TransitionNumAdd0(TimeHelper.GetDateTimer(timespan).Day) + "/" + 
                // TransitionNumAdd0(TimeHelper.GetDateTimer(timespan).Month) + "/" + 
                // TransitionNumAdd0(TimeHelper.GetDateTimer(timespan).Year) + " - " + 
                // TimeHelper.TimerDateMinStr(TimeHelper.GetTimestampByDateTime(
                //     TimeHelper.RFC3339TimeConvertToUTCTime(mttDetails.mtt.start_time)));
                let date = new Date(timespan);
                let ymd = TimeHelper.getDateStructYMD(timespan / 1000);
                lbl_time.string = ymd.day + "/" + ymd.month + "/" + ymd.year + " - " + date.getHours().toString() + ":" + date.getMinutes().toString();
            }
            this.isStar = isStar;
        }

        let type_List = ["NLH", "PLO4", "PLO5", "PLO6"];
        let six_List = ["NLH 6+", "PLO4 6+", "PLO5 6+", "PLO6 6+"];
        for (let i = 1; i < 10; i++) {
            let baseNode: cc.Node = panel_item2.getChildByName("node_down").children[i - 1];
            let lbl_1 = baseNode.getChildByName("lbl_1").getComponent(cc.Label);
            let lbl_2 = baseNode.getChildByName("lbl_2").getComponent(cc.Label);
            if (i == 1) {
                lbl_1.string = `${i18nMgr.Get("MTT_State_gametype")}`;
                lbl_2.string = mttDetails.mtt.poker_type == 2 ? six_List[mttDetails.mtt.game_type] : type_List[mttDetails.mtt.game_type];
            } else if (i == 2) {
                lbl_1.string = i18nMgr.Get("MTT_State_Starting_Scoreboard");
                lbl_2.string = `${mttDetails.mtt.initial_score * 0.01}` + "(" + `${(mttDetails.mtt.initial_score / (MTTGameUtil.BlindAtLevel(0, mttDetails.mtt.blindtable_type, 1) * 2))}` + "BB)";
            } else if (i == 3) {
                let lbl_3 = baseNode.getChildByName("lbl_3").getComponent(cc.RichText);
                let btn_open: cc.Node = baseNode.getChildByName("btn_open");

                if (mttDetails.mtt.apply_fee_hunter > 0) {
                    baseNode.active = true;
                    // lbl_3.node.active = true;
                    // btn_open.active = true;
                    // lbl_1.node.active = true;
                    // lbl_2.node.active = true;
                    // lbl_3.node.active = true;
                    btn_open.on(cc.Node.EventType.TOUCH_END, this.onClickOpen, this)
                    lbl_1.string = i18nMgr.Get("UIMTT_StateReward");
                    lbl_2.string = `${mttDetails.alive}` + "/" + `${mttDetails.mtt.participants}`;
                    lbl_3.string = i18nMgr.Get("UIMTT_StateHuntChampionshipsDetail").replace("{0}", " " + (mttDetails.mtt.apply_fee_hunter / 100).toString() + " ");
                } else {
                    baseNode.active = false;
                    // lbl_3.node.active = false;
                    // btn_open.active = false;
                    // lbl_1.node.active = false;
                    // lbl_2.node.active = false;
                    // lbl_3.node.active = false;
                }
            } else if (i == 4) {//截止买入
                lbl_1.string = `${i18nMgr.Get("MTT_State_ShangXian")}:`;
                if (mttDetails.mtt.max_delay_apply_bl > mttDetails.more.bl) {
                    if (mttDetails.mtt.addon_begin_bl == 0 && mttDetails.mtt.addon_end_bl == 0) {
                        lbl_2.string = LobbyControl.getInstance().formatString(i18nMgr.Get("MTT_State_DelayDetailNoAddOn"), mttDetails.mtt.limit_total_buy_times.toString(), mttDetails.mtt.max_delay_apply_bl);
                    }
                    else {
                        lbl_2.string = LobbyControl.getInstance().formatString(i18nMgr.Get("MTT_State_DelayDetail"), mttDetails.mtt.limit_total_buy_times.toString(), mttDetails.mtt.max_delay_apply_bl, mttDetails.mtt.addon_begin_bl, mttDetails.mtt.addon_end_bl);
                    }
                }
                else {
                    lbl_2.string = i18nMgr.Get("MTT_State_CannotDelay");
                }
            } else if (i == 5) {//重构次数
                lbl_1.string = `${i18nMgr.Get("MTT_State_RebuyTime")}:`;
                if (mttDetails.mtt != null) {
                    // lbl_2.string = `${mttDetails.state.left_rebuy_times}` + "/" + `${mttDetails.mtt.rebuy_times}`;
                    lbl_2.string = mttDetails.mtt.rebuy_times;
                }
                else {
                    lbl_2.string = `${i18nMgr.Get("UIMTT_StateUnLimitRebuy")}`;
                }
            } else if (i == 6) {//当前盲注
                lbl_1.string = `${i18nMgr.Get("UITexasReport_Text_MatchCurrBlindTip")}:` + "-" + mttDetails.more.bl.toString();
                lbl_2.string = mttDetails.more.sb.toString() + "/" + (mttDetails.more.sb * 2).toString() + mttDetails.more.ante.toString();
            } else if (i == 7) {//下一盲注
                lbl_1.string = `${i18nMgr.Get("UITexasReport_Text_MatchNextBlindTip")}:` + "-" + mttDetails.more.nbl.toString();
                lbl_2.string = mttDetails.more.nsb.toString() + "/" + (mttDetails.more.nsb * 2).toString() + mttDetails.more.nante.toString();
            } else if (i == 8) {//涨盲时间
                lbl_1.string = `${i18nMgr.Get("MTT_State_UpBlindTime")}:`;
                lbl_2.string = `${i18nMgr.Get("UITexasReport_Text_MatchZmsysj")}:`.replace("{0}", (mttDetails.mtt.upblind_interval / 60).toString());
            } else if (i == 9) {//记分牌(只显示最大记分牌)
                lbl_1.string = `${i18nMgr.Get("UITexasReport_Label_AllBarJL")}:`;
                lbl_2.string = i18nMgr.Get("Maximum") + mttDetails.top.toString();
            }
        }
    }

    updateUI() {

        let panel_0: cc.Node = this.getChildNodeOrComponent("panel_0");
        let panel_1: cc.Node = this.getChildNodeOrComponent("panel_1");
        let panel_1_top: cc.Node = this.getChildNodeOrComponent("panel_1_top");
        let panel_2_top: cc.Node = this.getChildNodeOrComponent("panel_2_top");
        let panel_3_top: cc.Node = this.getChildNodeOrComponent("panel_3_top");
        let panel_4_top: cc.Node = this.getChildNodeOrComponent("panel_4_top");
        let sv_down1: cc.Node = this.getChildNodeOrComponent("sv_down1");
        let sv_down2: cc.Node = this.getChildNodeOrComponent("sv_down2");
        let sv_down3: cc.Node = this.getChildNodeOrComponent("sv_down3");
        let sv_down4: cc.Node = this.getChildNodeOrComponent("sv_down4");
        if (this.curType == 0) {
            panel_0.active = true;
            panel_1.active = false;
            let sv_status = this.getChildNodeOrComponent("sv_status", cc.ScrollView);
            let panel_item2: cc.Node = this.getChildNodeOrComponent("panel_item");
            sv_status.content.height = panel_item2.height * 1.2;
            sv_status.scrollToTop();
            panel_item2.x = 0;
            panel_item2.y = 0;
            panel_item2.parent = sv_status.content;

            if (this._data && this._data._msg.match_id) {
                // LobbyControl.getInstance().reqMTTDetailInfo(this._data._msg.match_id, {}).then(
                //     (res: any) => {
                //         this.refreshStatusUI(res);
                //     },
                //     (res) => {
                //     }
                // )
                this.RefreshMttDetails();
            }

        } else if (this.curType == 1) {
            panel_0.active = false;
            panel_1.active = true;
            panel_1_top.active = true;
            panel_2_top.active = false;
            panel_3_top.active = false;
            panel_4_top.active = false;
            sv_down1.active = true;
            sv_down2.active = false;
            sv_down3.active = false;
            sv_down4.active = false;
            let reqInfo = {
                limit: 100,//几人池
                offset: 0,
            }
            HttpRequest.Send({
                api: Web_Room_Center_Mtt_Ranks.API.replace("{id}", this._data._msg.match_id.toString()),
                request: Web_Room_Center_Mtt_Ranks,
                body: Web_Room_Center_Mtt_Ranks.Request(reqInfo),
                onSuccess: function () {
                    let tResp = Web_Room_Center_Mtt_Ranks.Response;
                    if (tResp.code == 0)
                    {
                        this.refreshListView(2, tResp.data);
                    }
                    else
                    {
                      
                    }
                }.bind(this),
                onFailure: function (content) {
                }.bind(this)
            });
        } else if (this.curType == 2) {
            panel_0.active = false;
            panel_1.active = true;
            panel_1_top.active = false;
            panel_2_top.active = true;
            panel_3_top.active = false;
            panel_4_top.active = false;
            sv_down1.active = false;
            sv_down2.active = true;
            sv_down3.active = false;
            sv_down4.active = false;
            let reqInfo = {
                limit: 100,//几人池
                offset: 0,
            }
            HttpRequest.Send({
                api: Web_Room_Center_Mtt_Real_Prize.API.replace("{id}", this._data._msg.match_id.toString()),
                request: Web_Room_Center_Mtt_Real_Prize,
                body: Web_Room_Center_Mtt_Real_Prize.Request(reqInfo),
                onSuccess: function () {
                    let tResp = Web_Room_Center_Mtt_Real_Prize.Response;
                    if (tResp.code == 0)
                    {
                        this.refreshListView(3, tResp);
                    }
                    else
                    {
                      
                    }
                }.bind(this),
                onFailure: function (content) {
                }.bind(this)
            });
        } else if (this.curType == 3) {
            panel_0.active = false;
            panel_1.active = true;
            panel_1_top.active = false;
            panel_2_top.active = false;
            panel_3_top.active = true;
            panel_4_top.active = false;
            sv_down1.active = false;
            sv_down2.active = false;
            sv_down3.active = true;
            sv_down4.active = false;
            let reqInfo = {
                limit: 100,//几人池
                offset: 0,
            }
            HttpRequest.Send({
                api: Web_Room_Center_Mtt_Rooms.API.replace("{id}", this._data._msg.match_id.toString()),
                request: Web_Room_Center_Mtt_Rooms,
                body: Web_Room_Center_Mtt_Rooms.Request(reqInfo),
                onSuccess: function () {
                    let tResp = Web_Room_Center_Mtt_Rooms.Response;
                    if (tResp.code == 0)
                    {
                        this.refreshListView(4, tResp);
                    }
                    else
                    {
                      
                    }
                }.bind(this),
                onFailure: function (content) {
                }.bind(this)
            });
        } else if (this.curType == 4) {
            panel_0.active = false;
            panel_1.active = true;
            panel_1_top.active = false;
            panel_2_top.active = false;
            panel_3_top.active = false;
            panel_4_top.active = true;
            sv_down1.active = false;
            sv_down2.active = false;
            sv_down3.active = false;
            sv_down4.active = true;
            let reqInfo = {
                limit: 100,//几人池
                offset: 0,
            }
            HttpRequest.Send({
                api: Web_Room_Center_Mtt_Details.API.replace("{id}", this._data._msg.match_id.toString()),
                request: Web_Room_Center_Mtt_Details,
                body: Web_Room_Center_Mtt_Details.Request(reqInfo),
                onSuccess: function () {
                    let tResp = Web_Room_Center_Mtt_Details.Response;
                    if (tResp.code == 0)
                    {
                        this.refreshListView(5, tResp);
                    }
                    else
                    {
                      
                    }
                }.bind(this),
                onFailure: function (content) {
                }.bind(this)
            });
        }

        this.refreshTopUI(this.curType);
    }

    // sv需要拆出来
    refreshListView(index, data) {
        if (data == null) {
            return;
        }
        data = data.data;
        let info = data;
        if (index == 3) {
            data = data.prizes;
        }
        // 有数据 刷新列表
        let len = 0;
        if (index == 5) {
            len = data.mtt.blindtable_type;
        } else {
            len = data.length;
        }
        let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item" + index);
        let scrollView = this.getChildNodeOrComponent("sv_down" + (index-1), cc.ScrollView);
        scrollView.scrollToTop();
        scrollView.content.removeAllChildren();
        for (let i = 0; i < len; i++) {
            let _cloneNode = cc.instantiate(panel_item);
            _cloneNode.x = 0;
            _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
            _cloneNode.parent = scrollView.content;
            _cloneNode.getChildByName("lbl_jp").getComponent(cc.Label).string = i.toString();
            let itemInfo = data[i];
            // 奖励
            if (index == 3) {
                let lbl_addNum21 = this.getChildNodeOrComponent("lbl_addNum21");
                lbl_addNum21.getComponent(cc.Label).string = info.award.toString();
                let lbl_addNum22 = this.getChildNodeOrComponent("lbl_addNum22");
                lbl_addNum22.getComponent(cc.Label).string = info.award_num.toString();
                let rank = itemInfo.min == itemInfo.max ? itemInfo.min : itemInfo.min - itemInfo.max;
                let lbl_jp = _cloneNode.getChildByName("lbl_jp");
                lbl_jp.getComponent(cc.Label).string = rank.toString();
                let lbl_score = _cloneNode.getChildByName("lbl_score");
                lbl_jp.active = true;
                if (UIMatchMttModel.Instance.MttInfo.mtt.hunter_on == 0)
                {
                    //等于0是关闭猎人赛
                    lbl_score.getComponent(cc.Label).string = itemInfo.award.toString();
                }
                else
                {
                    lbl_score.getComponent(cc.Label).string = itemInfo.award.toString() + "+" + i18nMgr.Get("UIReward_Bounty");
                }
                let img_jp_1 = _cloneNode.getChildByName("img_jp_1");
                let img_jp_2 = _cloneNode.getChildByName("img_jp_2");
                let img_jp_3 = _cloneNode.getChildByName("img_jp_3");
                if (itemInfo.min == itemInfo.max)
                {
                    switch (itemInfo.min)
                    {
                        case 1:
                            img_jp_1.active = true;
                            img_jp_2.active = false;
                            img_jp_3.active = false;
                            lbl_jp.active = false;
                            break;
                        case 2:
                            img_jp_1.active = false;
                            img_jp_2.active = true;
                            img_jp_3.active = false;
                            lbl_jp.active = false;
                            break;
                        case 3:
                            img_jp_1.active = false;
                            img_jp_2.active = false;
                            img_jp_3.active = true;
                            lbl_jp.active = false;
                            break;
                        default:
                            break;
                    }
                }
            }
            // 盲注
            if (index == 5) {
                let lbl_addNum4 = this.getChildNodeOrComponent("lbl_addNum4");
                lbl_addNum4.getComponent(cc.Label).string = len.toString();
                let lbl_jp = _cloneNode.getChildByName("lbl_jp");
                lbl_jp.getComponent(cc.Label).string = (i+1).toString();
                let lbl_mz = _cloneNode.getChildByName("lbl_mz");
                let lbl_go = _cloneNode.getChildByName("lbl_go");
                let lbl_time = _cloneNode.getChildByName("lbl_time");
                let img_stop = _cloneNode.getChildByName("img_stop");
                img_stop.active = false;
                let sb = MTTGameUtil.BlindAtLevel(i, data.mtt.blindtable_type, 1);
                let ante = MTTGameUtil.AnteAtLevel(i, data.mtt.blindtable_type, 1);
                lbl_mz.getComponent(cc.Label).string = sb.toString() + "/" + (sb * 2).toString();
                lbl_go.getComponent(cc.Label).string = ante.toString();
                lbl_time.getComponent(cc.Label).string = i18nMgr.Get("UITexasReport_Text_MatchNextBlindTime").replace("{0}", (data.mtt.upblind_interval / 60).toString());
                if (data.mtt.addon_begin_bl.toString() == (i+1).toString() && data.mtt.addon_begin_bl > 0)
                {
                    // img_stop.active = true;
                    // des_text.text = LanguageManager.Get("MTT_Blind_Deadline_add_op");
                }
                if (data.mtt.addon_end_bl.toString() == (i+1) && data.mtt.addon_end_bl > 0)
                {
                    img_stop.active = true;
                    // des_text.text = LanguageManager.Get("MTT_Blind_Deadline_add_cl");
    
                }
            }
        }
        scrollView.content.height = panel_item.height * (len + 5);
    }

    refreshTopUI(index) {
        let tabToggles: cc.Node = this.getChildNodeOrComponent("tabToggles");
        for (let i = 1; i < 6; i++) {
            let btn_pt_1: cc.Node = tabToggles.children[i - 1];
            let line = btn_pt_1.getChildByName("line");
            if (index == i - 1) {
                line.active = true;
                btn_pt_1.color = cc.color(53, 163, 179);
            } else {
                line.active = false;
                btn_pt_1.color = cc.color(255, 255, 255);
            }
        }
    }

    onClickOpen(event) {
        this.panel_dialog.active = true;
    }

    updateDialogUI(msg) {
        let btn_ok = this.panel_dialog.getChildByName("btn_ok");
        let btn_cancle = this.panel_dialog.getChildByName("btn_cancle");
        let panel_click = this.panel_dialog.getChildByName("panel_click");
        btn_ok.on(cc.Node.EventType.TOUCH_END, this.onClickOk, this)
        btn_cancle.on(cc.Node.EventType.TOUCH_END, this.onClickCancle, this)
        panel_click.on(cc.Node.EventType.TOUCH_END, this.onClickCancle, this)
        let rt_dialog = this.panel_dialog.getChildByName("rt_dialog").getComponent(cc.RichText);
        rt_dialog.string = msg;
    }

    onClickOk() {
        this.panel_dialog.active = false;
    }

    onClickCancle() {
        this.panel_dialog.active = false;
    }

    onClickTop(event) {
        let target = event.target;
        let index = target.index;
        this.curType = index;
        this.updateUI();
    }

    onClickAddMtt() {
        this.panel_dialog2.setVisible(true);
    }

    RefreshMttDetails(callback = null) {
        // if (IsDisposed)
        // {
        //     return;
        // }

        UIMatchMttModel.Instance.RequestMTTDetails(this._data._msg.match_id, code => {
            if (code == 0) {
                this.UpdateBtn();
                this.refreshStatusUI(UIMatchMttModel.Instance.MttInfo)
                //声纹获取麦克风权限
                if (UIMatchMttModel.Instance.MttInfo.mtt.voiceprint_verify_on == 1) {
                    // if (!MicrophoneHelper.IsMicrophonePermissionAllowed())
                    // {
                    //     return;
                    // }

                    // UITexasModel.mInstance.APIUserVoiceprint(0, 0, Act =>
                    // {
                    //     if (Act.code == 0)
                    //     {
                    //         if (Act.data == null)
                    //         {
                    //             NeedVoiceprintVerification = true;
                    //         }
                    //     }
                    // });
                }
                ///免服务费逻辑
                if (UIMatchMttModel.Instance.MttInfo.mtt.buy_prop_id != 0) {
                    UIMatchMttModel.Instance.APIPropUserCheckPropInfo(res => {

                        if (res.code == 0) {
                            GameCache.Instance.gold = res.data.wallet_balance;
                            if (res.data.prop_property_type == 2)//如果Type == 2  免服务费 
                            {
                                UIMatchMttModel.Instance.MttInfo.mtt.prop_buy_type = 0;
                            }
                            // UI mUI = UIComponent.Instance.Get(UIType.UIMatch_MttDetailState);
                            // if (null != mUI)
                            // {
                            //     UIMatch_MttDetailStateComponent mUIComponent = mUI.UiBaseComponent as UIMatch_MttDetailStateComponent;
                            //     mUIComponent.UpdateInfo(UIMatchMttModel.Instance.MttInfo);
                            // }
                        }
                        else {
                            // UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(res.code));
                        }
                    });
                }
                else {
                    // UI mUI = UIComponent.Instance.Get(UIType.UIMatch_MttDetailState);
                    // if (null != mUI)
                    // {
                    //     UIMatch_MttDetailStateComponent mUIComponent = mUI.UiBaseComponent as UIMatch_MttDetailStateComponent;
                    //     mUIComponent.UpdateInfo(UIMatchMttModel.Instance.MttInfo);
                    // }
                }
                //判断当前时间是否大于进入比赛时间
                this.isCurTimeOverEnterTime = TimeHelper.Now >= TimeHelper.RFC3339TimeConvertToUTCTime(UIMatchMttModel.Instance.MttInfo.mtt.enter_time);
                if (callback) {
                    callback();
                }
            }
            else {
                // UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(code));
            }
        }, httpState => {
            // UIComponent.Instance.Toast($"{nameof(HTTPRequestStates)}: {httpState}");
        });
    }

    update() {
        if (UIMatchMttModel.Instance.MttInfo == null || this.isCurTimeOverEnterTime) {
            return;
        }
        if (TimeHelper.Now >= TimeHelper.RFC3339TimeConvertToUTCTime(UIMatchMttModel.Instance.MttInfo.mtt.enter_time)) {
            this.RefreshMttDetails();
            this.isCurTimeOverEnterTime = true;
        }

    }

    OnClickSignBtn(go) {
        if (!this.isCanClick) {
            return;
        }

        let openMatchApply = GameCache.Instance.IsAllowOpenMatchApply;
        openMatchApply = true; // 2.0后端暂不支持功能开关
        if (!openMatchApply) {
            return;
        }

        // if (!btnSignUp.interactable)
        // {
        //     return;
        // }
        if (this.NeedVoiceprintVerification) {
            // if (!MicrophoneHelper.IsMicrophonePermissionAllowed())
            // {
            //     return;
            // }
            // Game.Scene.GetComponent<UIComponent>().ShowNoAnimation(UIType.UITexasHumanYZ, new UITexasHumanYZComponent.VerificationDataInfo()
            // {
            //     cacheVoiceprint = VoiceprintRoomType.Hall,
            // });
            return;
        }
        this.RefreshMttDetails(() => {
            // if (!go.GetComponent<Button>().interactable)
            // {
            //     return;
            // }
            let mttInfo = UIMatchMttModel.Instance.MttInfo;
            switch (mttInfo.state_code) {
                case MTTGame.MTTPlayerStatus.CanApplyNotStart:
                case MTTGame.MTTPlayerStatus.CanApplyDelay:
                    {
                        UIMatchMttModel.Instance.HandleMTTJoinAction(MTTJoinAction.Apply, code => {
                            this.RefreshMttDetails();
                        }, httpState => {
                            // UIComponent.Instance.Toast($"{nameof(HTTPRequestStates)}: {httpState}");
                        });
                    }
                    break;
                case MTTGame.MTTPlayerStatus.CanJoin:
                    {
                        UIMatchMttModel.Instance.HandleMTTJoinAction(MTTJoinAction.PartialBringIn, bringInCode => {
                            if (bringInCode == 0) {
                                //进入MTT房间时添加firebase事件触发
                                // let paramMap = [];
                                // paramMap.push("game_type", GameCache.Instance.game_type + "");//游戏类型
                                // paramMap.push("roomId", GameCache.Instance.room_id + "");//房间id
                                // paramMap.push("roomName", GameCache.Instance.roomName + "");//房间名称
                                // paramMap.push("room_type", GameCache.Instance.room_type + "");//房间类型
                                // paramMap.push("match_id", GameCache.Instance.match_id + "");//比赛id
                                // GoogleFirebaseHelper.LevelStartEvent(paramMap);
                                //添加到appsFlyer统计进入MTT房间消息
                                // let valuesMap = [];
                                // valuesMap.push("game_type", GameCache.Instance.game_type + "");//游戏类型
                                // valuesMap.push("roomId", GameCache.Instance.room_id + "");//房间id
                                // valuesMap.push("roomName", GameCache.Instance.roomName + "");//房间名称
                                // valuesMap.push("room_type", GameCache.Instance.room_type + "");//房间类型
                                // valuesMap.push("match_id", GameCache.Instance.match_id + "");//比赛id
                                // AppsFlyerHelper.MTTGameEnterEvent(valuesMap);
                                // UIMatchMttModel.Instance.ShowGameplayUI(fromUI: UIType.UIMatch_MttDetail, isLookOn: false, roomid: 0);
                                UIMatchMttModel.Instance.ShowGameplayUI([UIDefine.MttDetailForm, UIDefine.MttListForm], false, 0);
                            }
                            else {
                                this.RefreshMttDetails();
                                // UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(bringInCode));
                            }
                        }, httpState => {
                            // ToastManager.Instance.createToast($"{nameof(HTTPRequestStates)}: {httpState}");
                        });
                    }
                    break;
                case MTTGame.MTTPlayerStatus.LoseCanRebuy:
                    {
                        UIMatchMttModel.Instance.HandleMTTJoinAction(MTTJoinAction.Rebuy, rebuyCode => {
                            if (rebuyCode == 0) {
                                UIMatchMttModel.Instance.ShowGameplayUI([UIDefine.MttDetailForm, UIDefine.MttListForm], false, 0);
                                // UIMatchMttModel.Instance.ShowGameplayUI(fromUI: UIType.UIMatch_MttDetail, isLookOn: false, roomid: 0);
                            }
                            else {
                                this.RefreshMttDetails();
                                // UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rebuyCode));
                            }
                        }, httpState => {
                            // UIComponent.Instance.Toast($"{nameof(HTTPRequestStates)}: {httpState}");
                        });
                    }
                    break;
            }
        });
    }

    UpdateBtn() {
        // 主按钮状态
        let lbl_signUp = this.getChildNodeOrComponent("lbl_signUp").getComponent(cc.Label);
        let btn_addMtt: cc.Node = this.getChildNodeOrComponent("btn_addMtt");
        let btnSignUp = btn_addMtt.getComponent(cc.Button);
        let img_can = btn_addMtt.getChildByName("img_can");
        let img_no = btn_addMtt.getChildByName("img_no");
        btnSignUp.interactable = false;
        img_can.active = false;
        img_no.active = true;
        switch (UIMatchMttModel.Instance.MttInfo.state_code) {
            case MTTGame.MTTPlayerStatus.WaitingApply:
                {
                    lbl_signUp.string = i18nMgr.Get("mtt_btn_waiting_start");
                }
                break;
            case MTTGame.MTTPlayerStatus.CanApplyNotStart:
                {

                    lbl_signUp.string = i18nMgr.Get("MTT-Apply");
                    btnSignUp.interactable = true;
                    img_can.active = true;
                    img_no.active = false;
                }
                break;
            case MTTGame.MTTPlayerStatus.CanApplyDelay:
                {
                    lbl_signUp.string = i18nMgr.Get("mtt_btn_delay");
                    btnSignUp.interactable = true;
                    img_can.active = true;
                    img_no.active = false;
                }
                break;
            case MTTGame.MTTPlayerStatus.AppliedNotStart:
                {
                    // TODO: 配置译文描述已报名但还不能进场状态
                    lbl_signUp.string = i18nMgr.Get("Mtt_AppliedNotStart");
                }
                break;
            case MTTGame.MTTPlayerStatus.CanJoin:
                {
                    lbl_signUp.string = i18nMgr.Get("mtt_btn_enter");
                    btnSignUp.interactable = true;
                    img_can.active = true;
                    img_no.active = false;
                }
                break;
            case MTTGame.MTTPlayerStatus.CannotApplyStarted:
                {
                    lbl_signUp.string = i18nMgr.Get("mtt_btn_sign_up_deadline");
                }
                break;
            case MTTGame.MTTPlayerStatus.LoseCanRebuy:
                {
                    lbl_signUp.string = i18nMgr.Get("MTT_Rebuy");
                    btnSignUp.interactable = true;
                    img_can.active = true;
                    img_no.active = false;
                }
                break;
            case MTTGame.MTTPlayerStatus.Lose:
                {
                    if (UIMatchMttModel.Instance.MttInfo.more.bl >= UIMatchMttModel.Instance.MttInfo.mtt.max_rebuy_bl) {
                        lbl_signUp.string = i18nMgr.Get("mtt_btn_Stopbuying");
                    }
                    else {
                        lbl_signUp.string = i18nMgr.Get("MTT_Rebuy") + " " + UIMatchMttModel.Instance.MttInfo.state.left_rebuy_times + "/" + UIMatchMttModel.Instance.MttInfo.mtt.rebuy_times;
                    }
                }
                break;
            case MTTGame.MTTPlayerStatus.JoinComplete:
            case MTTGame.MTTPlayerStatus.NotJoinComplete:
                {
                    // TODO: 配置对应译文描述比赛已结束状态
                    lbl_signUp.string = i18nMgr.Get("Mtt_Complete");
                }
                break;
            case MTTGame.MTTPlayerStatus.CannotJoinOvertime:
                {
                    // TODO: 配置对应译文描述超时停止进入
                    lbl_signUp.string = i18nMgr.Get("Mtt_CannotJoinOvertime");
                }
                break;
            default:
                {
                    lbl_signUp.string = "";
                }
                break;
        }
        this.isCanClick = btnSignUp.interactable;
    }

}