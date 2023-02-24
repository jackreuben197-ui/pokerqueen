/*
 * @Author: xfj
 * @Date: 2023-01-29 20:55:53
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-24 12:53:40
 * @FilePath: /pokerqueen/assets/script/ui/component/GGSwitch.ts
 */
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
    //设置开关是否开启
    public setIsOn(flag) {
        flag ? this.On() : this.Off();
    }
    //添加点击回调
    addClick() {

    }
}
