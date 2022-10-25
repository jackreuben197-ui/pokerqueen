import { stringify } from "querystring";
import ComFormTitle from "../../common/ComFormTitle";
import ComTabToggles, { ETabToggle } from "../../common/ComTabToggles";
import MTTGameUtil from "../../frame/data/mtt/MttGameUtils";
import MttListItemModel from "../../frame/data/mtt/MttListItemModel";
import GC from "../../frame/GameControl";
import LanguageManager from "../../frame/manager/LanguageManager";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { LobbyControl } from "../../lobby/control/LobbyControl";
import BaseForm from "../../ui/form/BaseForm";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/mtt/detail/MttDetailForm')
export default class MttDetailForm extends BaseForm {
    curType: number = 0;   // 0 - 4 对应上方5种类型
    _data: any = null;
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

        let tabToggles: cc.Node = this.getChildNodeOrComponent("tabToggles");
        for (let i=1; i<6; i++) {
            let btn_pt_1: cc.Node = tabToggles.children[i-1];
            btn_pt_1["index"] = i - 1;
            btn_pt_1.on(cc.Node.EventType.TOUCH_END, this.onClickTop, this)
        }

        

        this.updateUI();
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
            let panel_item2: cc.Node = this.getChildNodeOrComponent("panel_item2");
            sv_status.content.height = panel_item2.height * 1.2;
            sv_status.scrollToTop();
            panel_item2.x = 0;
            panel_item2.y = 0;
            panel_item2.parent = sv_status.content;

            if (this._data && this._data._msg.match_id) {
                LobbyControl.getInstance().reqMTTDetailInfo(this._data._msg.match_id, {}).then(
                    (res: any) => {
                        let mttDetails = res.data;
                        let img_av: cc.Sprite = panel_item2.getChildByName("img_av").getComponent(cc.Sprite);
                        WebImageHelper.SetUrlImage(img_av, mttDetails.mtt.game_icon);
                        for (let i=1; i<5; i++) {
                            let btn_pt_1: cc.Node = panel_item2.getChildByName("node" + i);
                            let lbl_gold = btn_pt_1.getChildByName("lbl_gold").getComponent(cc.Label);
                            if (i == 1) {
                                lbl_gold.string = mttDetails.more.prize_pool.toString();
                            } else if (i == 2) {
                                lbl_gold.string = mttDetails.mtt.award_num.toString();
                            } else if (i == 3) {
                                lbl_gold.string = `${mttDetails.alive}` + "/" + `${mttDetails.mtt.participants}`;
                            } else if (i == 4) {
                                let singType = i18nMgr.Get("UIMatch_MttDetailState_ReyBuFerr").split(",");
                                if (mttDetails.mtt.prop_buy_type == 0)
                                {
                                    if (mttDetails.mtt.apply_fee_pool + mttDetails.mtt.apply_fee_service + mttDetails.mtt.apply_fee_hunter <= 0)
                                    {
                                        lbl_gold.string = singType[0];
                                    }
                                    else
                                    {
                                        lbl_gold.string = `${mttDetails.mtt.apply_fee_pool + mttDetails.mtt.apply_fee_service + mttDetails.mtt.apply_fee_hunter}`;
                                    }
                                }
                                else if (mttDetails.mtt.prop_buy_type == 1)
                                {
                                    lbl_gold.string = singType[1];
                                }
                                else
                                {
                                    if (mttDetails.mtt.apply_fee_pool + mttDetails.mtt.apply_fee_service + mttDetails.mtt.apply_fee_hunter <= 0)
                                    {
                                        lbl_gold.string = singType[2];
                                    }
                                    else
                                    {
                                        lbl_gold.string = `${i18nMgr.Get("UIMatch_MttDetailState_ReyBuFerr02"), 
                                        mttDetails.mtt.apply_fee_pool + mttDetails.mtt.apply_fee_service + mttDetails.mtt.apply_fee_hunter}`;
                                    }
                                }
                            }
                        }
                        
                        let type_List = ["NLH", "PLO4", "PLO5", "PLO6" ];
                        let six_List = ["NLH 6+", "PLO4 6+", "PLO5 6+", "PLO6 6+" ];
                        for (let i=1; i<10; i++) {
                            let baseNode: cc.Node = panel_item2.getChildByName("node_down").children[i-1];
                            let lbl_1 = baseNode.getChildByName("lbl_1").getComponent(cc.Label);
                            let lbl_2 = baseNode.getChildByName("lbl_2").getComponent(cc.Label);
                            if (i == 1) {
                                lbl_1.string = `${i18nMgr.Get("MTT_State_gametype")}`;
                                lbl_2.string = mttDetails.mtt.poker_type == 2 ? six_List[mttDetails.mtt.game_type] : type_List[mttDetails.mtt.game_type];
                            } else if (i == 2) {
                                lbl_1.string = i18nMgr.Get("MTT_State_Starting_Scoreboard");
                                lbl_2.string = `${mttDetails.mtt.initial_score}}` + `${(mttDetails.mtt.initial_score / (MTTGameUtil.BlindAtLevel(0, mttDetails.mtt.blindtable_type, 1) * 2))}` + " BB";
                            } else if (i == 3) {
                                let lbl_3 = baseNode.getChildByName("lbl_3").getComponent(cc.RichText);
                                let btn_open: cc.Node = baseNode.getChildByName("btn_open");
                                btn_open.on(cc.Node.EventType.TOUCH_END, this.onClickOpen, this)
                                lbl_1.string = i18nMgr.Get("UIMTT_StateReward");
                                lbl_2.string = `${mttDetails.alive}` + "/" + `${mttDetails.mtt.participants}`;
                                lbl_3.string = i18nMgr.Get("UIMTT_StateHuntChampionshipsDetail").replace("{0}", " " + (mttDetails.mtt.apply_fee_hunter/100).toString() + " ");  
                            } else if (i == 4) {//截止买入
                                lbl_1.string = `${i18nMgr.Get("MTT_State_ShangXian")}:`;
                                if (mttDetails.mtt.max_delay_apply_bl > mttDetails.more.bl)
                                {
                                    if (mttDetails.mtt.addon_begin_bl == 0 && mttDetails.mtt.addon_end_bl == 0)
                                    {
                                        lbl_2.string = LobbyControl.getInstance().formatString(i18nMgr.Get("MTT_State_DelayDetailNoAddOn"), mttDetails.mtt.limit_total_buy_times.toString(), mttDetails.mtt.max_delay_apply_bl);
                                    }
                                    else
                                    {
                                        lbl_2.string =  LobbyControl.getInstance().formatString(i18nMgr.Get("MTT_State_DelayDetail"), mttDetails.mtt.limit_total_buy_times.toString(), mttDetails.mtt.max_delay_apply_bl, mttDetails.mtt.addon_begin_bl, mttDetails.mtt.addon_end_bl);
                                    }
                                }
                                else
                                {
                                    lbl_2.string = i18nMgr.Get("MTT_State_CannotDelay");
                                }
                            } else if (i == 5) {//重构次数
                                lbl_1.string = `${i18nMgr.Get("MTT_State_RebuyTime")}:`;
                                if (mttDetails.state != null)
                                {
                                    lbl_2.string = `${mttDetails.state.left_rebuy_times}` + "/" + `${mttDetails.mtt.rebuy_times}`;
                                }
                                else
                                {
                                    lbl_2.string = `${i18nMgr.Get("UIMTT_StateUnLimitRebuy")}`;
                                }
                            } else if (i == 6) {//当前盲注
                                lbl_1.string = `${i18nMgr.Get("UITexasReport_Text_MatchCurrBlindTip")}:` + "-" + mttDetails.more.bl.toString();
                                lbl_2.string = mttDetails.more.sb.toString() + "/" + (mttDetails.more.sb * 2).toString() + "{" + mttDetails.more.ante.toString() + "}";
                            } else if (i == 7) {//下一盲注
                                lbl_1.string = `${i18nMgr.Get("UITexasReport_Text_MatchNextBlindTip")}:` + "-" + mttDetails.more.nbl.toString();
                                lbl_2.string = mttDetails.more.nsb.toString() + "/" + (mttDetails.more.nsb * 2).toString() + "{" + mttDetails.more.nante.toString() + "}";
                            } else if (i == 8) {//涨盲时间
                                lbl_1.string = `${i18nMgr.Get("MTT_State_UpBlindTime")}:`;
                                lbl_2.string = `${i18nMgr.Get("UITexasReport_Text_MatchZmsysj")}:`.replace("{0}", (mttDetails.mtt.upblind_interval / 60).toString());
                            } else if (i == 9) {//记分牌(只显示最大记分牌)
                                lbl_1.string = `${i18nMgr.Get("UITexasReport_Label_AllBarJL")}:`;
                                lbl_2.string = i18nMgr.Get("Maximum") + mttDetails.top.toString();
                            }
                        }
                        
                    },
                    (res) => {
                    }
                )
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
            this.refreshListView("panel_item", "sv_down1");
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
            this.refreshListView("panel_item3", "sv_down2");
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
            this.refreshListView("panel_item4", "sv_down3");
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
            this.refreshListView("panel_item5", "sv_down4");
        }
        
        this.refreshTopUI(this.curType);
    }
    
    // sv需要拆出来
    refreshListView(panelName, svName) {
        // 有数据 刷新列表
        let len = 50;
        let panel_item: cc.Node = this.getChildNodeOrComponent(panelName);
        let scrollView = this.getChildNodeOrComponent(svName, cc.ScrollView);
        scrollView.scrollToTop();
        scrollView.content.removeAllChildren();
        for (let i=0; i<len; i++) {
            let _cloneNode = cc.instantiate(panel_item);
            _cloneNode.x = 0;
            _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
            _cloneNode.parent = scrollView.content;
            _cloneNode.getChildByName("lbl_jp").getComponent(cc.Label).string = i.toString();
        }
        scrollView.content.height = panel_item.height * (len+5);
    }

    refreshTopUI(index) {
        let tabToggles: cc.Node = this.getChildNodeOrComponent("tabToggles");
        for (let i=1; i<6; i++) {
            let btn_pt_1: cc.Node = tabToggles.children[i-1];
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

    }

    onClickTop(event) {
        let target = event.target;
        let index = target.index;
        this.curType = index;
        this.updateUI();
    }
}