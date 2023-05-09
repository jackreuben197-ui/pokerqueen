import { ClubCache } from "../../../frame/data/club/ClubCache";
import { StringHelper } from "../../../helper/StringHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import UIBasePlus from "../../../ui/UIBasePlus";

const { ccclass } = cc._decorator;

@ccclass
export default class FunMemberItem extends UIBasePlus {

    $uncheck: cc.Node = null;
    $check: cc.Node = null;

    cc_Sprite$head: cc.Sprite = null;
    cc_Sprite$rank_icon: cc.Sprite = null;

    cc_Label$nick: cc.Label = null;
    cc_Label$id: cc.Label = null;
    cc_Label$gold: cc.Label = null;

    $icon: cc.Node = null;

    _check: boolean = false;

    data: { data: any, index: number, gold_type: number, check: boolean, handler: any } = null;

    onShow(param: any): void {

        super.onShow(param);

        this.data = param;

        this.check = param.check;

        this.refreshUI(param.data);

    }

    protected regiterTouchEvents(): void {

        super.regiterTouchEvents();

        this.setButtonClick(this.node, this.click);
    }


    refreshUI(data: any) {

        this.cc_Label$nick.string = data.nick_name;
        this.cc_Label$id.string = `ID:${data.random_num}`;

        this.cc_Sprite$rank_icon.spriteFrame = ClubCache.getUserLevelIcon(data.user_level);

        WebImageHelper.SetHeadImage(this.cc_Sprite$head, data.avatar);

        this.setChildVisible(this.$icon, "uc", this.data.gold_type == 1);
        this.setChildVisible(this.$icon, "gc", this.data.gold_type == 2);


        this.cc_Label$gold.string = StringHelper.GetLongString(this.data.gold_type == 1 ? data.gold : data.usdt);

    }




    public set check(boo: boolean) {
        this.$uncheck.active = !boo;
        this.$check.active = boo;
        this._check = boo;
    }
    public get check(): boolean {
        return this._check;
    }

    private click() {
        this.check = !this.check;
        this.data?.handler?.item_click(this.data.index, this.check);
    }

}
