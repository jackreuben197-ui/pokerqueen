import { TextColor } from "../config/GameConfig";
import MTTGame from "../game/texas/MTTGame";
import MTTGameUtil from "../game/util/MTTGameUtil";
import { StringHelper } from "../helper/StringHelper";
import TimeHelper from "../helper/TimeHelper";
import WebImageHelper from "../helper/WebImageHelper";
import { i18nMgr } from "../i18n/i18nMgr";
import LobbySession from "../session/LobbySession";
import UIBasePlus from "../ui/UIBasePlus";
import { MTTMatchStatus } from "./UIMTTModel";




const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMTTDetail_State extends UIBasePlus {



    private type_List = ["NLH", "PLO4", "PLO5", "PLO6"];
    private six_List = ["NLH 6+", "PLO4 6+", "PLO5 6+", "PLO6 6+"];

    cc_Sprite$logo: cc.Sprite = null;

    //比赛名称
    cc_Label$mtt_name: cc.Label = null;
    // //比赛奖励
    // cc_Label$mtt_bonus: cc.Label = null;
    // //buy in 费用
    // cc_Label$mtt_fee: cc.Label = null;

    //开始时间
    cc_Label$start_time: cc.Label = null;
    //人数
    cc_Label$cur_people: cc.Label = null;
    //buy-in
    cc_Label$buyin: cc.Label = null;

    /////////////////////////////////////////////
    $Status: cc.Node = null;
    //游戏类型
    $GameType: cc.Node = null;
    //起始行
    $Qishi: cc.Node = null;
    //猎人奖励
    $HuntReward: cc.Node = null;
    //买入上限
    $Shangxian: cc.Node = null;
    //重构次数
    $RebuyTime: cc.Node = null;
    //当前盲注
    $CurrentMang: cc.Node = null;
    //下个盲注
    $NextMang: cc.Node = null;
    //涨盲时间
    $UpBlindTime: cc.Node = null;
    //记分牌
    $JiFenPai: cc.Node = null;

    private isStar: boolean = false;
    private runTime: number = 0;
    private runText: string;

    //距离开始倒计时开关
    is_start_delay: boolean = false;
    //距离结束倒计时开关
    is_end_delay: boolean = false;
    //倒计时秒数
    d_time: number = 0;
    //
    end_time: number = 0;

    onShow(param: any = null): void {
        super.onShow(param);
        console.log("onShow UIMTTDetail_State");
        this.reset();
    }

    reset() {
        this.setChildVisible(this.cc_Sprite$logo.node, "box", false);
        this.isStar = false;
        this.is_start_delay = false;
        this.is_end_delay = false;
        this.d_time = 0;
        this.end_time = 0;
    }

    UpdateInfo(mtt_detail: any, list_item_data: any) {

        // 根据比赛状态设置状态标签
        switch (mtt_detail.mtt.status) {
            case MTTGame.MTTMatchStatus.Created:
                this.setChildVisible(this.cc_Sprite$logo.node, "box", true);
                this.setChildVisible(this.cc_Sprite$logo.node, "box/image1", true);
                this.setChildVisible(this.cc_Sprite$logo.node, "box/image2", false);
                this.setChildColor(this.cc_Sprite$logo.node, "box/label", "#47E9B8");
                this.setChildLabel(this.cc_Sprite$logo.node, "box/label", i18nMgr.Get("MTT-Applying"));
                this.isStar = false;
                break;
            case MTTGame.MTTMatchStatus.Running:
                this.setChildVisible(this.cc_Sprite$logo.node, "box", true);
                this.setChildVisible(this.cc_Sprite$logo.node, "box/image1", false);
                this.setChildVisible(this.cc_Sprite$logo.node, "box/image2", true);
                this.setChildColor(this.cc_Sprite$logo.node, "box/label", "#FF7C7C");
                this.setChildLabel(this.cc_Sprite$logo.node, "box/label", i18nMgr.Get("MTT-Processing"));

                this.runTime = TimeHelper.Now - new Date(mtt_detail.mtt.start_time).getTime();
                this.runText = LobbySession.getLanguageValueByKey("UIMatch_MttDetailState_timetitle02");
                this.isStar = true;
                break;
            default:
                {
                    this.setChildVisible(this.cc_Sprite$logo.node, "box", false);
                }
                break;
        }
        WebImageHelper.SetUrlImage(this.cc_Sprite$logo, mtt_detail.mtt.game_icon)

        //this.cc_Label$mtt_name.string = LobbySession.getLanguageValueByKey(mtt_detail.mtt.name);
        //排名/奖励圈
        //m_Text_RewardCircle.text = $"{mttDetails.mtt.award_num}";
        //奖池
        //m_Text_Award.text = StringHelper.GetLongString(mttDetails.more.prize_pool);


        //游戏类型
        this.$GameType.children[0].getComponent(cc.Label).string = `${i18nMgr.Get("MTT_State_gametype")}:`;
        this.$GameType.children[1].getComponent(cc.Label).string = mtt_detail.mtt.poker_type == 2 ? this.six_List[mtt_detail.mtt.game_type] : this.type_List[mtt_detail.mtt.game_type];;

        //起始记分牌
        this.$Qishi.children[0].getComponent(cc.Label).string = i18nMgr.Get("MTT_State_Starting_Scoreboard");
        this.$Qishi.children[1].getComponent(cc.Label).string = `${StringHelper.GetDecimalN(mtt_detail.mtt.initial_score / 100)}(${StringHelper.GetDecimalN(mtt_detail.mtt.initial_score / (MTTGameUtil.BlindAtLevel(0, mtt_detail.mtt.blindtable_type, 1) * 2))}BB)`;// /roomInfo.mtt.sb[0] * 2 / 100

        if (mtt_detail.mtt.hunter_on > 0) {
            this.$HuntReward.active = true;
            this.$HuntReward.children[0].getComponent(cc.Label).string = i18nMgr.Get("UIMTT_StateReward");
            this.$HuntReward.children[1].children[0].getComponent(cc.Label).string = i18nMgr.Get("UIMTT_StateHuntChampionships");
            this.$HuntReward.children[2].getComponent(cc.Label).string = StringHelper.Format(i18nMgr.Get("UIMTT_StateHuntChampionshipsDetail"), [`${StringHelper.GetDecimalN(mtt_detail.mtt.apply_fee_hunter / 100)}`]);
            this.setButtonClick(this.$HuntReward.children[1].children[1], this.hunt_click);
        }
        else {
            this.$HuntReward.active = false;
        }

        //买入上限
        this.$Shangxian.children[0].getComponent(cc.Label).string = `${i18nMgr.Get("MTT_State_ShangXian")}:`;


        if (mtt_detail.mtt.max_delay_apply_bl > mtt_detail.more.bl) {
            if (mtt_detail.mtt.addon_begin_bl == 0 && mtt_detail.mtt.addon_end_bl == 0) {
                this.$Shangxian.children[1].getComponent(cc.Label).string = StringHelper.Format(i18nMgr.Get("MTT_State_DelayDetailNoAddOn"), [`${mtt_detail.mtt.limit_total_buy_times}`, `${mtt_detail.mtt.max_delay_apply_bl}`]);
            }
            else {
                this.$Shangxian.children[1].getComponent(cc.Label).string =
                    StringHelper.Format(i18nMgr.Get("MTT_State_DelayDetail"), [`${mtt_detail.mtt.limit_total_buy_times}`, `${mtt_detail.mtt.max_delay_apply_bl}`, `${mtt_detail.mtt.addon_begin_bl}`, `${mtt_detail.mtt.addon_end_bl}`]);
            }
        }
        else {
            this.$Shangxian.children[1].getComponent(cc.Label).string = i18nMgr.Get("MTT_State_CannotDelay");
        }
        //重构次数
        this.$RebuyTime.children[0].getComponent(cc.Label).string = `${i18nMgr.Get("MTT_State_RebuyTime")}:`;


        if (mtt_detail.state != null) {
            this.$RebuyTime.children[1].getComponent(cc.Label).string = `${mtt_detail.state.left_rebuy_times}/${mtt_detail.mtt.rebuy_times}`;
        }
        else {
            this.$RebuyTime.children[1].getComponent(cc.Label).string = i18nMgr.Get("UIMTT_StateUnLimitRebuy");
        }

        //当前盲注
        this.$CurrentMang.children[0].getComponent(cc.Label).string = `${i18nMgr.Get("UITexasReport_Text_MatchCurrBlindTip")} - ${mtt_detail.more.bl}:`;
        this.$CurrentMang.children[1].getComponent(cc.Label).string = `${mtt_detail.more.sb / 100}/${mtt_detail.more.sb * 2 / 100}(${mtt_detail.more.ante / 100})`;

        //下一盲注
        this.$NextMang.children[0].getComponent(cc.Label).string = `${i18nMgr.Get("UITexasReport_Text_MatchNextBlindTip")} - ${mtt_detail.more.nbl}:`;
        this.$NextMang.children[1].getComponent(cc.Label).string = `${mtt_detail.more.nsb / 100}/${mtt_detail.more.nsb * 2 / 100}(${mtt_detail.more.nante / 100})`;

        //涨盲时间
        this.$UpBlindTime.children[0].getComponent(cc.Label).string = `${i18nMgr.Get("MTT_State_UpBlindTime")}:`;

        this.$UpBlindTime.children[1].getComponent(cc.Label).string = StringHelper.Format(i18nMgr.Get("UITexasReport_Text_MatchZmsysj"), [`${mtt_detail.mtt.upblind_interval / 60}`]);

        //记分牌(只显示最大记分牌)
        this.$JiFenPai.children[0].getComponent(cc.Label).string = `${i18nMgr.Get("UITexasReport_Label_AllBarJL")}:`;

        this.$JiFenPai.children[1].getComponent(cc.Label).string = `${i18nMgr.Get("Maximum")}${mtt_detail.top / 100}`;

        // if (!this.isStar) {

        //     let timespan = new Date(mtt_detail.mtt.start_time);

        // 		long timespan = TimeHelper.GetTimestampByDateTime(TimeHelper.RFC3339TimeConvertToUTCTime(mttDetails.mtt.start_time));
        // 		int len = TimeHelper.NumberToChinese(TimeHelper.GetDateTimer(timespan).Month).Split('^').Length;

        // 		string month = TimeHelper.NumberToChinese(int.Parse(TimeHelper.GetDateTimer(timespan).Month.ToString())).Replace("<size=40>", "");
        //     if (len > 1) {
        //         month = TimeHelper.NumberToChinese(int.Parse(TimeHelper.GetDateTimer(timespan).Month.ToString())).Split('^')[0];
        //     }
        //     //textBeginTime.text = month.Replace("</size>", "") + " " + TimeHelper.GetDateTimer(timespan).Day.ToString() + "  " + TimeHelper.TimerDateMinStr(TimeHelper.GetTimestampByDateTime(TimeHelper.RFC3339TimeConvertToUTCTime(mttDetails.mtt.start_time)));
        //     //textBeginTime.text = TransitionNumAdd0(TimeHelper.GetDateTimer(timespan).Day) + "/" + TransitionNumAdd0(TimeHelper.GetDateTimer(timespan).Month) + "/" + TransitionNumAdd0(TimeHelper.GetDateTimer(timespan).Year) + " - " + TimeHelper.TimerDateMinStr(TimeHelper.GetTimestampByDateTime(TimeHelper.RFC3339TimeConvertToUTCTime(mttDetails.mtt.start_time)));
        // }

        this.InitListInfo(list_item_data);
    }

    public InitListInfo(data) {
        // if (data == null || listItemInfo == null) return;
        // listItemInfo.allFee = tDto.prize_base_pool;
        // listItemInfo.canPlayerRebuy = tDto.rebuy_times > 0;
        // listItemInfo.currEntryNum = tDto.participants;
        // listItemInfo.entryFee = tDto.apply_fee_pool;
        // listItemInfo.gameStatus = tDto.status;
        // //listItemInfo.hasGpsLimit = tDto.hasGpsLimit;
        // listItemInfo.instate = tDto.bought;
        // listItemInfo.leftPlayer = tDto.alive;
        // //listItemInfo.logoUrl = tDto.logoUrl;
        // listItemInfo.matchId = tDto.match_id;
        // listItemInfo.matchName = tDto.name;
        // listItemInfo.mttType = tDto.prize_type;
        // listItemInfo.rebuyPlayers = tDto.total_rebuy_times;
        // //listItemInfo.serviceId = tDto.serviceId;
        // listItemInfo.startTime = TimeHelper.GetTimestampByDateTime(TimeHelper.RFC3339TimeConvertToUTCTime(tDto.start_time));
        // listItemInfo.timend = listItemInfo.startTime + tDto.upblind_interval * 1000 * (tDto.max_delay_apply_bl - 1);
        // //listItemInfo.upperLimit = tDto.upperLimit;
        // //listItemInfo.voucher = tDto.voucher;
        // listItemInfo.apply_fee_hunter = tDto.apply_fee_hunter;
        // listItemInfo.serviceFee = tDto.apply_fee_service;
        // listItemInfo.prop_buy_type = tDto.prop_buy_type;
        // listItemInfo.hunter_on = tDto.hunter_on;
        // listItemInfo.canShowAddon = tDto.addon_begin_bl > 0 && tDto.addon_end_bl > 0;
        // listItemInfo.game_type = tDto.game_type;
        // listItemInfo.poker_type = tDto.poker_type;
        // SetItemInfo();


        this.cc_Label$start_time.string = TimeHelper.TransformUTC(data.start_time, 0);
        this.cc_Label$cur_people.string = `${data.participants}`;
        this.cc_Label$buyin.string = `${(data.apply_fee_pool + data.apply_fee_service + data.apply_fee_hunter) / 100}`;

        let start_time: number = new Date(data.start_time).getTime();
        this.end_time = start_time + data.upblind_interval * 1000 * (data.max_delay_apply_bl - 1);

        switch (data.status) // 游戏状态 0 = 可报名 1 = 等待开赛 2 = 延迟报名 3 = 进行中 4 = 立即进入 5 = 报名截止 6 = 等待审批 7 = 重购条件不足
        {
            case MTTMatchStatus.Created:
                this.setStatus(0);
                this.Registrationstatus(data);
                break;
            case MTTMatchStatus.Running:
                if (this.end_time - TimeHelper.Now > 0) {
                    this.is_end_delay = true;
                    this.setStatus(1);
                }
                else {
                    this.ShowRunStatus(data);
                }
                break;
            case MTTMatchStatus.Closed:
                this.ShowRunStatus(data);
                break;
            default:
                break;
        }

    }

    ShowRunStatus(data: any) {
        //进行中
        this.setStatus(2);

        //运行中剩余玩家/总玩家数量显示
        if ((data.alive > 1000 && (data.participants + data.total_rebuy_times) > 1000) || data.alive > 100) {

            this.setChildLabel(this.node, "b2/status2/time", data.alive + "/" + "\n" + data.participants);
        }
        else {
            this.setChildLabel(this.node, "b2/status2/time", data.alive + "/" + data.participants);
        }
    }

    setStatus(status: number) {
        this.setChildVisible(this.$Status, "b2/status0", status == 0);
        this.setChildVisible(this.$Status, "b2/status1", status == 1);
        this.setChildVisible(this.$Status, "b2/status2", status == 2);
    }

    Registrationstatus(data: any) {

        //判断时间是否大于一天
        let start_date = new Date(data.start_time);
        let second = (new Date(data.start_time).getTime() - new Date().getTime()) / 1000 ^ 0;
        let month = start_date.getMonth() + 1;
        let day = start_date.getDay();
        let date = start_date.getDate();

        if (second > 3600 * 24) {
            this.setChildVisible(this.$Status, "b2/status0/labels/b", true);
            this.setChildVisible(this.$Status, "b2/status0/labels/a", false);
            this.setChildLabel(this.$Status, "b2/status0/labels/b/month", TimeHelper.MonthLanguage(month).split("^")[0]);
            this.setChildLabel(this.$Status, "b2/status0/labels/b/day", TimeHelper.DayLanguage(day));
            this.setChildLabel(this.$Status, "b2/status0/labels/b/date", TimeHelper.PadZero(date));
        } else {

            this.setChildVisible(this.$Status, "b2/status0/labels/b", false);
            this.setChildVisible(this.$Status, "b2/status0/labels/a", true);
            if (second > 3600) {
                //设置距离开始的 小时:分钟

                this.setChildLabel(this.$Status, "b2/status0/labels/a/time", i18nMgr.Get("UIMTT_Listdistancestart").replace("{0}", TimeHelper.TransformUTC(data.start_time, 1)));

            } else {
                //this.setChildLabel(this.node, "b2/status0/labels/a/time", i18nMgr.Get("UIMTT_Listdistancestart").replace("{0}", TimeHelper.MinSec(second)));
                this.refreshStartTimeDelay(second);
                this.is_start_delay = true;
                this.d_time = second;
            }
        }

    }



    protected update(dt: number): void {
        if (this.is_start_delay) {
            if (this.d_time > 0) {
                this.d_time -= dt;
                if (this.d_time > 0) {
                    this.refreshStartTimeDelay(this.d_time ^ 0);
                } else {
                    this.refreshStartTimeDelay(0);
                }
            }
            else {
                this.is_start_delay = false;
            }
        }

        if (this.is_end_delay) {

            if (this.end_time - TimeHelper.Now > 0) {
                this.refreshCloseDelay((this.end_time - TimeHelper.Now) / 1000 ^ 0);
            }
            else {
                this.is_end_delay = false;
            }
        }
    }
    //刷新比赛开始倒计时
    private refreshStartTimeDelay(second: number) {
        this.setChildLabel(this.$Status, "b2/status0/labels/a/time", i18nMgr.Get("UIMTT_Listdistancestart").replace("{0}", TimeHelper.MinSec(second)));
    }
    //刷新比赛关闭倒计时
    private refreshCloseDelay(second: number) {
        this.setChildLabel(this.node, "b2/status1/labels/time", i18nMgr.Get("UIMTT_Listdistancesclose").replace("{0}", TimeHelper.MinSec(second)));
    }

    hunt_click() {
        // UIComponent.Instance.ShowNoAnimation(UIType.UIDialog, new UIDialogComponent.DialogData()
        // {
        //         type = UIDialogComponent.DialogData.DialogType.Commit,
        //         title = LanguageManager.Get("UIMTT_StateHuntChampionships"),
        //         content = string.Format(LanguageManager.Get("UIMTT_StateHuntChampionshipsDialogDetail"), mttDetails.mtt.hunter_bonus, 100 - mttDetails.mtt.hunter_bonus),
        //         contentCommit = LanguageManager.Get("UIBackDiolg_Konw_01"),
        //         actionCommit = () => {
        //             UIComponent.Instance.Remove(UIType.UIDialog);
        //         }
        //     });
    }
}
