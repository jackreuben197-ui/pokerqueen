import WebImageHelper from "../../../helper/WebImageHelper";
import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";
import { UICommonMgr } from "../../../ui/UIMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemAgentLink extends UIBase {

    On: cc.Node = null;
    Off: cc.Node = null;
    SwitchClick: cc.Node = null;

    Label_Nick: cc.Label = null;
    Label_ID: cc.Label = null;

    Head: cc.Sprite = null;

    _switch: boolean = false;

    protected _param: { data: any, index: number, parent: { onItemClick: (index: number, switch_on: boolean) => void } }

    protected declare_list: [string, any?][] = [
        ["On"],
        ["Off"],
        ["SwitchClick"],
        ["Label_Nick", cc.Label],
        ["Label_ID", cc.Label],
        ["Head", cc.Sprite],
    ]
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
        this.setButtonClick(this.SwitchClick, this.switchClick);
    }

    private refreshUI() {
        this.Label_Nick.string = this._param.data.nick;
        this.Label_ID.string = `ID:  ${this._param.data.id}`;
        WebImageHelper.SetHeadImage(this.Head, this._param.data.avatar || "");
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
        this.On.active = true;
        this.Off.active = false;
    }
    //设置取消
    private switchOff() {
        this.On.active = false;
        this.Off.active = true;
    }
    ///////////////////点击
    //开关点击
    private switchClick() {
        this.switch = !this.switch;
        this._param.parent?.onItemClick?.(this._param.index, this.switch);
    }
}   
