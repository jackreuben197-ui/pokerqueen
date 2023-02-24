import { ClubCache } from "../../../frame/data/club/ClubCache";
import { StringHelper } from "../../../helper/StringHelper";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import AssetContext, { AssetFold } from "../../../ui/component/AssetContext";
import GGSwitch from "../../../ui/component/GGSwitch";
import UIBasePlus from "../../../ui/UIBasePlus";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemVipManage extends UIBasePlus {
    /////////////////声明/////////////////
    cc_Label$Nick: cc.Label = null;
    cc_Label$ID: cc.Label = null;
    cc_Label$Notes: cc.Label = null;
    cc_Label$Follow: cc.Label = null;
    //cc_Label$Time: cc.Label = null;

    $Sort_Layout: cc.Node = null;
    cc_Label$Sort_Type: cc.Label = null;


    cc_Sprite$Head: cc.Sprite = null;
    cc_Sprite$Icon: cc.Sprite = null;
    $Forbidden: cc.Node = null;
    $ToggleClick: cc.Node = null;
    $T_On: cc.Node = null;
    $T_Off: cc.Node = null;
    //////////////////////////////////////
    protected _param: { data: any, index: number, sort_type: number, hide_follow: boolean, parent: { onItemClick?: (index: number, switch_on: boolean) => void } } = null;
    private _switch: boolean = false;

    //成员排序key
    private sort_type_key = {
        1: "total_room_game_results",
        2: "hands_time",
        3: "total_service_profit",
        4: "last_login_time_str",
    }
    onShow(param?: any): void {
        super.onShow(param);
        this.refreshUI();
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$ToggleClick, this.switchClick);
    }

    public refreshUI() {


        //user_level //用户等级 0 普通 1会长  3管理员 4代理

        this.cc_Label$Nick.string = StringHelper.LengthNick(this._param.data.nick_name);

        this.cc_Label$ID.string = `ID:  ${this._param.data.random_num}`;

        //this.cc_Label$Time.string = TimeHelper.UTCToLocal(this._param.data.time);

        this.cc_Label$Notes.node.active = this._param.data.remark_desc.length > 0;

        this.cc_Label$Follow.node.active = !this._param.hide_follow;

        this.cc_Label$Notes.string = `备注:  ${this._param.data.remark_desc}`;

        this.cc_Label$Follow.string = `下线:  ${this._param.data.follow_user_count}`;

        WebImageHelper.SetHeadImage(this.cc_Sprite$Head, this._param.data.avatar || "");

        this.$Forbidden.active = this._param.data.wallet_forbidden;

        this.sort_type = this._param.sort_type;

        this.cc_Sprite$Icon.spriteFrame = ClubCache.getUserLevelIcon(this._param.data.user_level);
        
        this.switch = false;
    }

    vislbleFollow(boo: boolean) {
        this.cc_Label$Follow.node.active = boo;
    }


    //last_login_time_str
    set sort_type(value: number) {
        switch (value) {
            case 0://toggle
                this.$ToggleClick.active = true;
                this.$Sort_Layout.active = false;
                break;
            case 1:
            case 2:
            case 3:
            case 4:
                this.$ToggleClick.active = false;
                this.$Sort_Layout.active = true;
                this.cc_Label$Sort_Type.string = this._param.data[this.sort_type_key[value]];
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
