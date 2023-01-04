import UIBase from "../UIBase";
import UIBasePlus from "../UIBasePlus";


const { ccclass, property } = cc._decorator;


@ccclass
export default class GGSwitch extends UIBasePlus {

    $On: cc.Node = null;
    $Off: cc.Node = null;

    // protected declare_list: any = [
    //     ["On_Node"],
    //     ["Off_Node"],
    // ]

    _on: boolean = false;

    protected lateLoad() {
        super.lateLoad();

    }
    protected regiterTouchEvents(): void {
        this.setButtonClick(this.node, this.click);
    }
    click() {
        this._on ? this.Off() : this.On();
    }
    public On() {
        this._on = true;
        this.$On.active = this._on;
        this.$Off.active = !this._on;
    }
    public Off() {
        this._on = false;
        this.$On.active = this._on;
        this.$Off.active = !this._on;
    }
    //获取开关是否开启
    get isOn() {
        return this._on;
    }
}
