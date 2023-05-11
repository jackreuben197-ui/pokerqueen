/*
 * @Author: xfj
 * @Date: 2022-12-19 15:49:57
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-27 11:51:36
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

    private Gold_Type: cc.Label = null;
    private DC: cc.Node = null;

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

        this.Gold_Type = this.getChildNodeOrComponent("Gold_Type", cc.Label);
        this.DC = this.getChildNodeOrComponent("DC");

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

        //刷新货币类型显示
        switch (info.mtt.gold_type) {
            case 1://UC
                this.Gold_Type.string = "UC";
                this.DC.active = false;
                break;
            case 2://GC
                this.Gold_Type.string = "GC";
                this.DC.active = false;
                break;
            case 4://钻石
                this.Gold_Type.string = "";
                this.DC.active = true;
                break;
            default:
                this.Gold_Type.string = "";
                this.DC.active = false;
                break;
        }

        // 进入游戏时才能拿到
        // this.textMatchZmsysj.text = TimeHelper.ShowRemainingSemicolonPure(raiseBlindTime);
    }

    ShowLeaveTimer() {
        // TimerComponent mTC = Game.Scene.ModelScene.GetComponent<TimerComponent>();
        this.time.string = TimeHelper.ShowRemainingSemicolon2(this._mRoomLeaveTime);
        let id = setInterval(() => {
            if (this._mRoomLeaveTime >= 0 && this.node.isValid) {
                this._mRoomLeaveTime--;
                this.time.string = TimeHelper.ShowRemainingSemicolon2(this._mRoomLeaveTime)
            } else {
                this._mRoomLeaveTime = GC.data.mtt.detail.upblind_interval
            }
        }, 1000)
    }
}