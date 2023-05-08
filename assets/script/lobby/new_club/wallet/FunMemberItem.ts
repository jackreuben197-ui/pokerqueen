import UIBasePlus from "../../../ui/UIBasePlus";

const { ccclass } = cc._decorator;

@ccclass
export default class FunMemberItem extends UIBasePlus {

    $uncheck: cc.Node = null;
    $check: cc.Node = null;

    _check: boolean = false;

    data: { data: any, index: number, check: boolean, handler: any } = null;

    onShow(param: any): void {

        super.onShow(param);

        this.data = param;

        this.check = param.check;

    }

    protected regiterTouchEvents(): void {

        super.regiterTouchEvents();

        this.setButtonClick(this.node, this.click);
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
