import TimeHelper from "../../helper/TimeHelper";
import StorageKey from "../../session/StorageKey";

export default class LabelCDTime extends cc.Component {

    label: cc.Label = null;

    duration: number = 0;

    difTime: number = 0;

    passtime: number = 0;

    sendTime: number = 0;

    unit: string = null;

    complete: boolean = false;

    call: Function = null;

    _scheTime: any = null;

    onLoad(): void {
        this.label = this.node.getComponent(cc.Label);
    }

    /**
     * @param unit 单位
     * @param duration 
     */
    show(duration: number = 60, call: Function = null, unit: string = "S") {
        this.call = call;
        this.unit = unit;
        this.sendTime = TimeHelper.NowS();
        this.duration = duration;
        this.passtime = 0;
        this.complete = false;
        this.updateLabel(duration);
    }

    resetUI(sendTime, call: Function = null) {
        this.call = call;
        this.unit = "S";
        this.sendTime = sendTime;
        this.duration = 60;
        this.passtime = 0;
        this.complete = false;
        this.difTime = TimeHelper.NowS() - this.sendTime;
        this.updateLabel(this.duration - this.difTime);
    }

    private fixUpdate() {
        this.difTime = TimeHelper.NowS() - this.sendTime;
        if (this.duration <= this.difTime) {
            this.end();
            return;
        }
        // this.duration--;
        this.updateLabel(this.duration - this.difTime);
    }
    protected update(dt: number): void {
        if (this.complete) return;
        this.passtime += dt;
        while (this.passtime > 1) {
            this.fixUpdate();
            this.passtime -= 1;
        }
    }

    updateLabel(time: number) {
        this.label.string = time + this.unit;
    }

    stop() {
        this.complete = true;
        this.passtime = 0;
        this.sendTime = 0;
    }


    //结束 是否处理回调
    public end(call: boolean = true) {
        this.complete = true;
        this.passtime = 0;
        call && this.call && this.call();
    }
}
