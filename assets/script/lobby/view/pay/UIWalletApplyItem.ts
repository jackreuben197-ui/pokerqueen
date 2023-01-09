import UIBasePlus from "../../../ui/UIBasePlus";

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
        this.refreshUI();
    }
    refreshUI() {

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
