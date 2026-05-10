import TimeHelper from '../helper/TimeHelper';
import { i18nMgr } from '../i18n/i18nMgr';
import LobbySession from '../session/LobbySession';
import UIBasePlus from '../ui/UIBasePlus';
import UIComponent from '../ui/UIComponent';
import UIMTTList from './UIMTTList';
import { MTTMatchStatus } from './UIMTTModel';
const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemMTTList extends UIBasePlus {
    //距离开始倒计时开关
    is_start_delay: boolean = false;
    //距离结束倒计时开关
    is_end_delay: boolean = false;
    //倒计时秒数
    d_time: number = 0;
    //
    end_time: number = 0;

    onShow(param: any) {
        super.onShow(param);
        this.initData();
        this.refreshUI(param);
    }

    private initData() {
        this.is_start_delay = false;
        this.is_end_delay = false;
        this.d_time = 0;
        this.end_time = 0;
    }

    protected update(dt: number): void {
        if (this.is_start_delay) {
            if (this.d_time > 0) {
                this.d_time -= dt;
                this.refreshStartTimeDelay(this.d_time ^ 0);
            } else {
                let ui_mttlist = UIComponent.Instance.getComponent<UIMTTList>('UIMTTList');
                if (!ui_mttlist.isReqing) {
                    ui_mttlist.refreshReq();
                }
                this.is_start_delay = false;
            }
        }
        if (this.is_end_delay) {
            if (this.end_time - TimeHelper.Now > 0) {
                this.refreshCloseDelay(((this.end_time - TimeHelper.Now) / 1000) ^ 0);
            } else {
                let ui_mttlist = UIComponent.Instance.getComponent<UIMTTList>('UIMTTList');
                if (!ui_mttlist.isReqing) {
                    ui_mttlist.refreshReq();
                }
                this.is_end_delay = false;
            }
        }
    }

    refreshUI(data: any) {
        //let startTime = TimeHelper.GetTimestampByDateTime(TimeHelper.RFC3339TimeConvertToUTCTime(data.start_time));
        //listItemInfo.timend = listItemInfo.startTime + tDto.upblind_interval * 1000 * (tDto.max_delay_apply_bl - 1);
        //设置 rebuy addon 图标显示
        this.setChildVisible(this.node, 'b3/layout2/rebuy', data.rebuy_times > 0);
        this.setChildVisible(this.node, 'b3/layout2/addon', data.addon_begin_bl > 0 && data.addon_end_bl > 0);
        //设置比赛名称
        this.setChildLabel(this.node, 'b1/info', LobbySession.getLanguageValueByKey(data.name));
        //设置比赛奖金
        this.setChildLabel(this.node, 'b6/layout/coin', data.prize_base_pool / (data.gold_type == 4 ? 1 : 100));
        //比赛奖金图标
        this.setChildVisible(this.node, 'b6/layout/icon/uc', data.gold_type == 1);
        this.setChildVisible(this.node, 'b6/layout/icon/gc', data.gold_type == 2);
        this.setChildVisible(this.node, 'b6/layout/icon/dc', data.gold_type == 4);
        //设置玩家数量
        this.setChildLabel(this.node, 'b5/layout/people', data.participants);
        //设置带入数量
        this.setChildLabel(this.node, 'b4/layout/buyin', (data.apply_fee_pool + data.apply_fee_service + data.apply_fee_hunter) / 100);
        //设置开始时间
        this.setChildLabel(this.node, 'b3/layout1/time', TimeHelper.TransformUTC(data.start_time, 0));
        let start_time: number = new Date(data.start_time).getTime();
        this.end_time = start_time + data.upblind_interval * 1000 * (data.max_delay_apply_bl - 1);
        switch (data.bought) {
            case 1:
                this.setChildVisible(this.node, 'b1/flag', true);
                this.setChildVisible(this.node, 'b1/flag/icon_0', true);
                this.setChildVisible(this.node, 'b1/flag/icon_1', false);
                this.setChildLabel(this.node, 'b1/flag/text', i18nMgr.Get('MTT-Applying'));
                break;
            case 2:
                this.setChildVisible(this.node, 'b1/flag', true);
                this.setChildVisible(this.node, 'b1/flag/icon_0', false);
                this.setChildVisible(this.node, 'b1/flag/icon_1', true);
                this.setChildLabel(this.node, 'b1/flag/text', i18nMgr.Get('UIMatch_RoomItemMark'));
                break;
            default:
                this.setChildVisible(this.node, 'b1/flag', false);
                break;
        }
        switch (
            data.status // 游戏状态 0 = 可报名 1 = 等待开赛 2 = 延迟报名 3 = 进行中 4 = 立即进入 5 = 报名截止 6 = 等待审批 7 = 重购条件不足
        ) {
            case MTTMatchStatus.Created:
                this.setStatus(0);
                this.Registrationstatus(data);
                break;
            case MTTMatchStatus.Running:
                if (this.end_time - TimeHelper.Now > 0) {
                    this.is_end_delay = true;
                    this.setStatus(1);
                } else {
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

    setStatus(status: number) {
        this.setChildVisible(this.node, 'b2/status0', status == 0);
        this.setChildVisible(this.node, 'b2/status1', status == 1);
        this.setChildVisible(this.node, 'b2/status2', status == 2);
    }

    ShowRunStatus(data: any) {
        //进行中
        this.setStatus(2);
        //运行中剩余玩家/总玩家数量显示
        if ((data.alive > 1000 && data.participants + data.total_rebuy_times > 1000) || data.alive > 100) {
            this.setChildLabel(this.node, 'b2/status2/labels/time', data.alive + '/' + '\n' + data.participants);
        } else {
            this.setChildLabel(this.node, 'b2/status2/labels/time', data.alive + '/' + data.participants);
        }
    }

    Registrationstatus(data: any) {
        //判断时间是否大于一天
        let start_date = new Date(data.start_time);
        let now = new Date();
        let second = ((start_date.getTime() - now.getTime()) / 1000) ^ 0;
        let s_year = start_date.getFullYear();
        let s_month = start_date.getMonth() + 1;
        let s_day = start_date.getDay();
        let s_date = start_date.getDate();
        let n_year = now.getFullYear();
        let n_month = now.getMonth() + 1;
        let n_date = now.getDate();
        let same = s_year == n_year && s_month == n_month && s_date == n_date;
        if (!same) {
            this.setChildVisible(this.node, 'b2/status0/labels/b', true);
            this.setChildVisible(this.node, 'b2/status0/labels/a', false);
            this.setChildLabel(this.node, 'b2/status0/labels/b/month', TimeHelper.MonthLanguage(s_month).split('^')[0]);
            this.setChildLabel(this.node, 'b2/status0/labels/b/day', TimeHelper.DayLanguage(s_day));
            this.setChildLabel(this.node, 'b2/status0/labels/b/date', TimeHelper.PadZero(s_date));
        } else {
            this.setChildVisible(this.node, 'b2/status0/labels/b', false);
            this.setChildVisible(this.node, 'b2/status0/labels/a', true);
            if (second > 3600) {
                //设置距离开始的 小时:分钟
                this.setChildLabel(
                    this.node,
                    'b2/status0/labels/a/time',
                    i18nMgr.Get('UIMTT_Listdistancestart').replace('{0}', TimeHelper.TransformUTC(data.start_time, 1))
                );
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
        this.setChildLabel(this.node, 'b2/status0/labels/a/time', i18nMgr.Get('UIMTT_Listdistancestart').replace('{0}', TimeHelper.MinSec(second)));
    }

    //刷新比赛关闭倒计时
    private refreshCloseDelay(second: number) {
        this.setChildLabel(this.node, 'b2/status1/labels/time', i18nMgr.Get('UIMTT_Listdistancesclose').replace('{0}', TimeHelper.MinSec(second)));
    }
}
