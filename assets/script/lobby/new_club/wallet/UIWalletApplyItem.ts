import { StringHelper } from "../../../helper/StringHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import UIBasePlus from "../../../ui/UIBasePlus";
import WalletModel from "./WalletModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIWalletApplyItem extends UIBasePlus {

    cc_Sprite$Head: cc.Sprite = null;

    // cc_Label$nick: cc.Label = null;
    // cc_Label$id: cc.Label = null;
    // cc_Label$remark: cc.Label = null;
    // cc_Label$status: cc.Label = null;


    $refuse: cc.Node = null;
    $agree: cc.Node = null;

    index: number;

    protected _param: { data: any, own: { refuseClick, agreeClick } } = null;

    lateLoad() {
        super.lateLoad();
        this.setButtonClick(this.$refuse, this.refuseClick);
        this.setButtonClick(this.$agree, this.agreeClick);
    }

    onShow(param?: any): void {
        super.onShow(param);
        this.refreshUI(param.data);
    }
    refreshUI(data: any) {
        this.setChildVisible(this.node, "bg_1", this.index % 2 == 0);
        this.setChildVisible(this.node, "bg_2", this.index % 2 == 1);
        this.setChildLabel(this.node, "status", WalletModel.Instance.getApplyStatusText(data.order_type));
        this.setChildLabel(this.node, "coin/count", StringHelper.GetLongString(data.gold_num));
        this.setChildLabel(this.node, "nick", data.nickname);
        this.setChildLabel(this.node, "id", `ID:${data.user_random_id}`);
        this.setChildLabel(this.node, "result", WalletModel.Instance.getApplyResultText(data.status));//猜测 2通过 3拒绝

        this.setChildLabel(this.node, "remark_content", data.user_desc);

        this.$refuse.active = data.status == 1;
        this.$agree.active = data.status == 1;
        WebImageHelper.SetHeadImage(this.cc_Sprite$Head, data.avatar);

    }
    //////////////点击
    //拒绝
    refuseClick() {
        this._param?.own?.refuseClick?.(this.index);
    }
    //同意
    agreeClick() {
        this._param?.own?.agreeClick?.(this.index);
    }
}
