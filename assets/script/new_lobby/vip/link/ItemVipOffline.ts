import { ClubCache } from "../../../frame/data/club/ClubCache";
import { StringHelper } from "../../../helper/StringHelper";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import { i18nMgr } from "../../../i18n/i18nMgr";
import AssetContext, { AssetFold } from "../../../ui/component/AssetContext";
import GGSwitch from "../../../ui/component/GGSwitch";
import UIBasePlus from "../../../ui/UIBasePlus";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemVipOffline extends UIBasePlus {
    /////////////////声明/////////////////
    $bg: cc.Node = null;
    cc_Label$nick: cc.Label = null;
    cc_Label$id: cc.Label = null;
    cc_Label$remark: cc.Label = null;
    cc_Label$member: cc.Label = null;
    cc_Label$time: cc.Label = null;

    $Sort_Layout: cc.Node = null;
    cc_Label$Sort_Type: cc.Label = null;


    cc_Sprite$head: cc.Sprite = null;
    cc_Sprite$icon: cc.Sprite = null;
    $Forbidden: cc.Node = null;
    $ToggleClick: cc.Node = null;
    $T_On: cc.Node = null;
    $T_Off: cc.Node = null;
    //////////////////////////////////////
    //protected _param: { data: any, index: number, sort_type: number, hide_follow: boolean, parent: { onItemClick?: (index: number, switch_on: boolean) => void } } = null;
    private _checked: boolean = false;

    //成员排序key
    // private sort_type_key = {
    //     1: "total_room_game_results",
    //     2: "hands_time",
    //     3: "total_service_profit",
    //     4: "last_login_time_str",
    // }
    onShow(param?: any): void {
        super.onShow(param);
        this.refreshUI(param.data);
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$ToggleClick, this.checkClick);
    }

    public refreshUI(data) {

        //user_level //用户等级 0 普通 1会长  3管理员 4代理

        this.$bg.active = this.index % 2 == 0;

        this.cc_Label$nick.string = StringHelper.LengthNick(data.nick_name);

        this.cc_Label$id.string = `ID:${data.random_num}`;

        this.cc_Label$time.string = data.last_login_time_str;

        this.cc_Label$remark.node.active = data.remark_desc.length > 0;

        this.cc_Label$member.node.active = !this._param.hide_follow;

        this.cc_Label$remark.string = `${i18nMgr.Get("UIGuild_MemberDetailsRemarks")}${data.remark_desc}`;

        this.cc_Label$member.string = `${i18nMgr.Get("UIGuild_MemberDetails_OfflineNum")}${data.follow_user_count}`;


        WebImageHelper.SetHeadImage(this.cc_Sprite$head, data.avatar || "");

        this.$Forbidden.active = data.wallet_forbidden;

        this.cc_Sprite$icon.spriteFrame = ClubCache.getUserLevelIcon(this._param.data.user_level);

        if (this._param.edit_obj) {

            this.$ToggleClick.active = true;

            this.cc_Label$time.node.active = false;

            this.checked = this._param.edit_obj.checked;

        } else {
            this.$ToggleClick.active = false;

            this.cc_Label$time.node.active = true;
        }

    }

    vislbleFollow(boo: boolean) {
        this.cc_Label$member.node.active = boo;
    }

    set checked(status: boolean) {
        this._checked = status;
        this.$T_On.active = status;
        this.$T_Off.active = !status;
    }
    get checked(): boolean {
        return this._checked;
    }
    //开关点击
    private checkClick() {
        this.checked = !this.checked;
        this._param.edit_obj?.own?.onToggleCheck?.(this.checked, this._param.data.user_id);
    }
}
