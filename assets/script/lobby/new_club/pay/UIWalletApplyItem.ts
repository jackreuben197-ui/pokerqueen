import { StringHelper } from "../../../helper/StringHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import UIBasePlus from "../../../ui/UIBasePlus";
import WalletModel from "./WalletModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIWalletApplyItem extends UIBasePlus {

    cc_Sprite$Head: cc.Sprite = null;
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
        this.setChildLabel(this.node, "des", WalletModel.Instance.Apply_Des_Text[data.gold_type][data.order_type]);
        this.setChildLabel(this.node, "count", StringHelper.GetLongString(data.gold_num));
        this.setChildLabel(this.node, "nick", data.nickname);
        this.setChildLabel(this.node, "snick", data.nickname);
        this.setChildLabel(this.node, "id", `ID:  ${data.user_random_id}`);
        this.setChildLabel(this.node, "snick", data.nickname);
        this.setChildLabel(this.node, "status", WalletModel.Instance.Apply_Status_Text[data.status]);//猜测 2通过 3拒绝
        this.node.getChildByName("btnNode").active = data.status == 1;
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
