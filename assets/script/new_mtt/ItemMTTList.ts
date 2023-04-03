import TimeHelper from "../helper/TimeHelper";
import { i18nMgr } from "../i18n/i18nMgr";
import LobbySession from "../session/LobbySession";
import UIBasePlus from "../ui/UIBasePlus";
import UIComponent from "../ui/UIComponent";
import { MTTMatchStatus } from "./MTTModel";
import UIMTTList from "./UIMTTList";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemMTTList extends UIBasePlus {

    //距离开始倒计时开关
    is_start_delay: boolean = false;

    //倒计时秒数
    d_time: number = 0;

    onShow(param: any) {
        super.onShow(param);
        this.initData();
        this.refreshUI(param);
    }

    private initData() {
        this.is_start_delay = false;
        this.d_time = 0;
    }

    protected update(dt: number): void {
        if (this.is_start_delay) {
            if (this.d_time > 0) {
                this.d_time -= dt;
                this.refreshStartTimeDelay(this.d_time ^ 0);
            }
            else {
                let ui_mttlist = UIComponent.Instance.getComponent<UIMTTList>("UIMTTList");
                if (!ui_mttlist.isReqing) {
                    ui_mttlist.refreshReq();
                }
                this.is_start_delay = false;
            }
        }
    }

    refreshUI(data: any) {
        //let startTime = TimeHelper.GetTimestampByDateTime(TimeHelper.RFC3339TimeConvertToUTCTime(data.start_time));
        //listItemInfo.timend = listItemInfo.startTime + tDto.upblind_interval * 1000 * (tDto.max_delay_apply_bl - 1);
        //设置 rebuy addon 图标显示
        this.setChildVisible(this.node, "b3/layout2/rebuy", data.rebuy_times > 0);
        this.setChildVisible(this.node, "b3/layout2/addon", data.addon_begin_bl > 0 && data.addon_end_bl > 0);
        //设置比赛名称
        this.setChildLabel(this.node, "b1/info", LobbySession.getLanguageValueByKey(data.name));
        //设置比赛奖金
        this.setChildLabel(this.node, "b6/layout/coin", data.prize_base_pool / 100);
        //比赛奖金图标
        this.setChildVisible(this.node, "b6/layout/icon/uc", data.gold_type == 1);
        this.setChildVisible(this.node, "b6/layout/icon/gc", data.gold_type == 2);
        //设置玩家数量
        this.setChildLabel(this.node, "b5/layout/people", data.participants);
        //设置带入数量
        this.setChildLabel(this.node, "b4/layout/buyin", (data.apply_fee_pool + data.apply_fee_service + data.apply_fee_hunter) / 100);

        //设置开始时间
        this.setChildLabel(this.node, "b3/layout1/time", TimeHelper.TransformUTC(data.start_time, 0));

        switch (data.bought) {
            case 1:
                this.setChildVisible(this.node, "b1/flag", true);
                this.setChildVisible(this.node, "b1/flag/icon_0", true);
                this.setChildVisible(this.node, "b1/flag/icon_1", false);
                this.setChildLabel(this.node, "b1/flag/text", i18nMgr.Get("MTT-Applying"));
                break;
            case 2:
                this.setChildVisible(this.node, "b1/flag", true);
                this.setChildVisible(this.node, "b1/flag/icon_0", false);
                this.setChildVisible(this.node, "b1/flag/icon_1", true);
                this.setChildLabel(this.node, "b1/flag/text", i18nMgr.Get("UIMatch_RoomItemMark"));
                break;
            default:
                this.setChildVisible(this.node, "b1/flag", false);
                break;
        }

        switch (data.status) // 游戏状态 0 = 可报名 1 = 等待开赛 2 = 延迟报名 3 = 进行中 4 = 立即进入 5 = 报名截止 6 = 等待审批 7 = 重购条件不足
        {
            case MTTMatchStatus.Created:
                this.setChildVisible(this.node, "b2/status0", true);
                // Registrationstatus(listItemInfo, bmtext, root, month, week, day1, day2);
                //this.setChildLabel(this.node, "b2/status0/labels/time", i18nMgr.Get("UIMTT_Listdistancestart").replace("{0}", "888"));
                this.Registrationstatus(data);
                break;
            case MTTMatchStatus.Running:
                // if (entime - TimeHelper.ClientNow() > 0) {
                //     IsStart = true;
                //     ShowDelayStatus();
                // }
                // else {
                //     ShowRunStatus(changetext, jhtext, Imageyx, yxtext, listItemInfo);
                // }
                break;
            case MTTMatchStatus.Closed:
                //ShowRunStatus(changetext, jhtext, Imageyx, yxtext, listItemInfo);
                break;
            default:
                break;
        }

    }

    Registrationstatus(data: any) {

        //判断时间是否大于一天
        let start_date = new Date(data.start_time);
        let second = (new Date(data.start_time).getTime() - new Date().getTime()) / 1000 ^ 0;
        let month = start_date.getMonth() + 1;
        let day = start_date.getDay();
        let date = start_date.getDate();

        if (second > 3600 * 24) {
            this.setChildVisible(this.node, "b2/status0/labels/b", true);
            this.setChildVisible(this.node, "b2/status0/labels/a", false);
            this.setChildLabel(this.node, "b2/status0/labels/b/month", TimeHelper.MonthLanguage(month).split("^")[0]);
            this.setChildLabel(this.node, "b2/status0/labels/b/day", TimeHelper.DayLanguage(day));
            this.setChildLabel(this.node, "b2/status0/labels/b/date", TimeHelper.PadZero(date));
        } else {

            this.setChildVisible(this.node, "b2/status0/labels/b", false);
            this.setChildVisible(this.node, "b2/status0/labels/a", true);
            if (second > 3600) {
                //设置距离开始的 小时:分钟

                this.setChildLabel(this.node, "b2/status0/labels/a/time", i18nMgr.Get("UIMTT_Listdistancestart").replace("{0}", TimeHelper.TransformUTC(data.start_time, 1)));

            } else {
                //this.setChildLabel(this.node, "b2/status0/labels/a/time", i18nMgr.Get("UIMTT_Listdistancestart").replace("{0}", TimeHelper.MinSec(second)));
                this.refreshStartTimeDelay(second);
                this.is_start_delay = true;
                this.d_time = second;
            }

        }

    }

    //刷新比赛开始倒计时
    private refreshStartTimeDelay(second: number) {
        this.setChildLabel(this.node, "b2/status0/labels/a/time", i18nMgr.Get("UIMTT_Listdistancestart").replace("{0}", TimeHelper.MinSec(second)));
    }


}
