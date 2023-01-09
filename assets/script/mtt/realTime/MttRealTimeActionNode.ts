/*
 * @Author: xfj
 * @Date: 2022-12-19 15:49:57
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-09 15:38:44
 * @FilePath: /pokerqueen/assets/script/mtt/realTime/MttRealTimeActionNode.ts
 */
import GC from "../../frame/GameControl";
import { StringHelper } from "../../helper/StringHelper";
import { Web_Mtt } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import TimeHelper from "../../helper/TimeHelper";
import { setInterval } from "timers";

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
    _mRoomLeaveTime = null;;
    lateLoad() {
        super.lateLoad();
        this.time = this.getChildNodeOrComponent("time", cc.Label);
        this.reward = this.getChildNodeOrComponent("reward", cc.Label);
        this.max = this.getChildNodeOrComponent("max", cc.Label);
        this.buy = this.getChildNodeOrComponent("buy", cc.Label);
        this.cur = this.getChildNodeOrComponent("cur", cc.Label);
        this.next = this.getChildNodeOrComponent("next", cc.Label);
        this.nextTime = this.getChildNodeOrComponent("nextTime", cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();


    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        GC.notify.register(Web_Mtt.DETAIL, this.updateView, this)
    }

    // protected notify(id: any, msg: any, sendInfo?: any): void {
    //     // id = id.replace(/\d+/, "{0}")
    //     switch (id) {
    //         case Web_Mtt.DETAIL: {
    //             this.updateView();
    //         } break;
    //     }
    // }

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
        this.setText(this.nextTime, "UITexasReport_Text_MatchZmsysj", StringHelper.FormatIntOrFloat1(info.upblind_interval / 60))
        if (!this._mRoomLeaveTime) {
            this._mRoomLeaveTime = info.upblind_interval
            this.ShowLeaveTimer()
        }
        // 进入游戏时才能拿到
        // this.textMatchZmsysj.text = TimeHelper.ShowRemainingSemicolonPure(raiseBlindTime);
    }

    ShowLeaveTimer() {
        // TimerComponent mTC = Game.Scene.ModelScene.GetComponent<TimerComponent>();
        this.time.string = TimeHelper.ShowRemainingSemicolon(this._mRoomLeaveTime);
        let id = setInterval(() => {
            if (this._mRoomLeaveTime >= 0 && this.node.isValid) {
                this._mRoomLeaveTime--;
                this.time.string = TimeHelper.ShowRemainingSemicolon(this._mRoomLeaveTime)
            } else {
                clearInterval(id);
                this.time.string = "00:00";
            }
        }, 1000)
    }
}