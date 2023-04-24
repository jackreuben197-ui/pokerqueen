import WebImageHelper from "../../../helper/WebImageHelper";
import UIBasePlus from "../../../ui/UIBasePlus";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemAgentLink extends UIBasePlus {
    /////////////////////声明界面节点组件引用
    $bg: cc.Node = null;
    $On: cc.Node = null;
    $Off: cc.Node = null;
    $SwitchClick: cc.Node = null;
    cc_Label$Nick: cc.Label = null;
    cc_Label$ID: cc.Label = null;
    cc_Sprite$Head: cc.Sprite = null;
    ///////////////////////////////////////
    _switch: boolean = false;

    protected _param: { data: any, index: number, own: { onItemClick: (index: number, switch_on: boolean) => void } }

    protected lateLoad() {
        super.lateLoad();
    }
    onShow(param?: any): void {
        super.onShow(param);
        this.switch = false;
        this.refreshUI();
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$SwitchClick, this.switchClick);
    }

    private refreshUI() {
        this.$bg.active = this._param.index % 2 == 0;
        this.cc_Label$Nick.string = this._param.data.nick_name;
        this.cc_Label$ID.string = `ID:  ${this._param.data.random_num}`;
        WebImageHelper.SetHeadImage(this.cc_Sprite$Head, this._param.data.avatar || "");
    }
    set switch(status: boolean) {
        this._switch = status;
        this._switch ? this.switchOn() : this.switchOff();
    }
    get switch(): boolean {
        return this._switch;
    }
    //设置勾选
    private switchOn() {
        this.$On.active = true;
        this.$Off.active = false;
    }
    //设置取消
    private switchOff() {
        this.$On.active = false;
        this.$Off.active = true;
    }
    ///////////////////点击
    //开关点击
    private switchClick() {
        this.switch = !this.switch;
        this._param.own?.onItemClick?.(this._param.index, this.switch);
    }
}   
