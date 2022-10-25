import GC from "../../frame/GameControl";
import { Web_Mtt } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/mtt/realTime/MttRealTimeActionNode')
export default class MttRealTimeActionNode extends UIBase {
    private time: cc.Label = null;
    private reward: cc.Label = null;
    private max: cc.Label = null;
    private buy: cc.Label = null;
    private cur: cc.Label = null;
    private next: cc.Label = null;
    private nextTime: cc.Label = null;

    lateLoad() {
        super.lateLoad();

    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    protected notify(id: any, msg: any, sendInfo?: any): void {
        id = id.replace(/(?<=mtt\/)\d+/g, "{0}");
        switch (id) {
            case Web_Mtt.DETAIL: {
                this.updateView();
            } break;
        }
    }

    initData() {
        GC.data.mtt.reqMttDetail();
    }

    updateView() {
        let info = GC.data.mtt.detail;

        this.setText(this.reward, info.prize_pool)
        this.setText(this.max, info.top)
        this.setText(this.buy, `${info.alive}/${info.total_buy_time}`)
        this.setText(this.cur, `${info.sb}/${info.sb * 2}`)
        this.setText(this.next, `${info.nsb}/${info.nsb * 2}`)
        this.setText(this.nextTime, "UITexasReport_Text_MatchZmsysj", info.upblind_interval / 60);

        // 进入游戏时才能拿到
        // this.textMatchZmsysj.text = TimeHelper.ShowRemainingSemicolonPure(raiseBlindTime);
    }
}