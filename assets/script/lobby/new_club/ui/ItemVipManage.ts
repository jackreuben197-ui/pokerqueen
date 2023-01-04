import { StringHelper } from "../../../helper/StringHelper";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import GGSwitch from "../../../ui/component/GGSwitch";
import UIBasePlus from "../../../ui/UIBasePlus";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemVipManage extends UIBasePlus {
    /////////////////声明/////////////////
    cc_Label$Nick: cc.Label = null;
    cc_Label$ID: cc.Label = null;
    cc_Label$Notes: cc.Label = null;
    //cc_Label$Time: cc.Label = null;

    cc_Label$Style: cc.Label = null;
    $StyleIcon: cc.Node = null;


    cc_Sprite$Head: cc.Sprite = null;
    cc_Sprite$Icon: cc.Sprite = null;
    $Status: cc.Node = null;
    $ToggleClick: cc.Node = null;
    $T_On: cc.Node = null;
    $T_Off: cc.Node = null;
    //////////////////////////////////////

    protected _param: { data: any, index: number, style: number, parent: { onItemClick?: (index: number, switch_on: boolean) => void } } = null;
    private _switch: boolean = false;

    onShow(param?: any): void {
        super.onShow(param);
        this.refreshUI();
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$ToggleClick, this.switchClick);
    }

    private refreshUI() {

        this.cc_Label$Nick.string = StringHelper.LengthNick(this._param.data.nick);

        this.cc_Label$ID.string = `ID:  ${this._param.data.id}`;

        //this.cc_Label$Time.string = TimeHelper.UTCToLocal(this._param.data.time);

        this.cc_Label$Notes.string = this._param.data.notes;

        WebImageHelper.SetHeadImage(this.cc_Sprite$Head, this._param.data.avatar || "");

        this.$Status.active = true;

        this.style = this._param.style;

        this.switch = false;

        console.log("style:", this._param.style);

    }

    set style(value: number) {
        switch (value) {
            case 0://toggle
                this.$ToggleClick.active = true;
                this.cc_Label$Style.node.active = false;
                this.$StyleIcon.active = false;
                break;
            case 1://时间
                this.$ToggleClick.active = false;
                this.cc_Label$Style.node.active = true;
                this.$StyleIcon.active = false;
                break;
            case 2://
                this.$ToggleClick.active = false;
                this.cc_Label$Style.node.active = true;
                this.$StyleIcon.active = true;
                break;
            case 3:
                this.$ToggleClick.active = false;
                this.cc_Label$Style.node.active = true;
                this.$StyleIcon.active = true;
                break;
        }
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
        this.$T_On.active = true;
        this.$T_Off.active = false;
    }
    //设置取消
    private switchOff() {
        this.$T_On.active = false;
        this.$T_Off.active = true;
    }
    ///////////////////点击
    //开关点击
    private switchClick() {
        this.switch = !this.switch;
        this._param.parent?.onItemClick?.(this._param.index, this.switch);
    }
}
