import TimeHelper from "../../helper/TimeHelper";
import Data from "../../lobby/labor/script/Data";
import UIBase from "../../ui/UIBase";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import MTTGame from "../texas/MTTGame";

const { ccclass, property } = cc._decorator;


class MTTTimeData {
    constructor(public nickname: string, public second: number) {
    }
}

@ccclass
export default class UIMTTTimeComponent extends UIBase {

    static MTTTimeData: any = MTTTimeData;

    Text_Time: cc.Label = null;
    Text_MTTTimeName: cc.Label = null;


    private timeCounting: boolean;
    private timeDeltaTime: number = 0;
    private time: number = 0;


    protected lateLoad() {
        super.lateLoad();
        this.Text_Time = this.getChildNodeOrComponent("Text_Time", cc.Label);
        this.Text_MTTTimeName = this.getChildNodeOrComponent("Text_MTTTimeName", cc.Label);
    }
    onShow(param?: MTTTimeData): void {
        super.onShow(param);
        if (null != param) {
            this.Text_MTTTimeName.string = param.nickname;
            if (param.second > 0) {
                this.timeCounting = true;
                this.time = param.second;
            }
            else {
                if (null != this.Text_Time) this.Text_Time.string = "00:00";
            }
        }
    }
    update() {
        if (this.timeCounting) {
            let nowTime = new Date().getTime() / 1000;
            if (nowTime - this.timeDeltaTime > 1) {
                this.timeDeltaTime = nowTime;
                this.time -= 1;
                if (this.time <= 0) {
                    this.TimeEnd();
                }
                else {
                    this.TimeRun();
                }
                if (this.time <= 30) {
                    (GameCache.Instance.CurGame as MTTGame).countDownTo30Second();
                }
            }
        }
    }
    //时间结束
    private TimeEnd() {
        this.timeCounting = false;
        if (null != this.Text_Time) this.Text_Time.string = "00:00";
        (GameCache.Instance.CurGame as MTTGame).upBldCounting = true;
        UIComponent.Instance.HideUI(PrefabUI.UIMTTTimeComponent);
    }
    private TimeRun() {
        if (null != this.Text_Time) {
            TimeHelper.ZeroNum(this.time / 60 ^ 0)
            this.Text_Time.string = `${TimeHelper.ZeroNum(this.time / 60 ^ 0)}:${TimeHelper.ZeroNum(this.time % 60)}`;
        }
    }
}
