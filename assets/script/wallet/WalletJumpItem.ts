import UIBase from "../ui/UIBase";
import UIComponent from "../ui/UIComponent";
import { TWalletGoldOpration } from "./WalletConfig";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/WalletJumpItem')
export default class WalletJumpItem extends UIBase {
    private icon: cc.Sprite = null;
    private title: cc.Label = null;

    private _data: TWalletGoldOpration = null;
    private _isClub: boolean = false;
    lateLoad() {
        super.lateLoad();
        this.icon = this.getChildNodeOrComponent("icon", cc.Sprite);
        this.title = this.getChildNodeOrComponent("title", cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.node.off(cc.Node.EventType.TOUCH_END, this.clickItem, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.clickItem, this);
    }


    initData(data: TWalletGoldOpration, isClub: boolean = false) {
        this._data = data;
        this._isClub = isClub;

        if (this._data.icon) {

        }

        this.setText(this.title, this._data.title);
    }

    clickItem() {
        UIComponent.open(this._data.goto, { type: this._data.param, isClub: this._isClub });
    }

}