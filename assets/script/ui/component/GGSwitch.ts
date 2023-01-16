import UIBase from "../UIBase";
import UIBasePlus from "../UIBasePlus";


const { ccclass, property } = cc._decorator;


@ccclass
export default class GGSwitch extends UIBasePlus {

    $On: cc.Node = null;
    $Off: cc.Node = null;

    _on: boolean = false;

    clickObj: { click, self } = null;

    protected lateLoad() {
        super.lateLoad();
    }
    protected regiterTouchEvents(): void {
        this.setButtonClick(this.node, this.click);
    }
    private click() {
        this._on ? this.Off() : this.On();
        if (this.clickObj?.click && this.clickObj?.self) {
            this.clickObj.click.call(this.clickObj.self);
        }
    }
    private On() {
        this._on = true;
        this.$On.active = this._on;
        this.$Off.active = !this._on;
    }
    private Off() {
        this._on = false;
        this.$On.active = this._on;
        this.$Off.active = !this._on;
    }
    //获取开关是否开启
    public get isOn() {
        return this._on;
    }
    //添加点击回调
    addClick() {

    }
}
