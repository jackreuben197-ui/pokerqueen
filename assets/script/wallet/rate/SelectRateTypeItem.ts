import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import UIBase from "../../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/rate/SelectRateTypeItem')
export default class SelectRateTypeItem extends UIBase {
    private icon: cc.Sprite = null;
    private flag: cc.Label = null;

    private _data: { country: string, path: string } = null;
    private _selectItem: Function = null;
    lateLoad() {
        super.lateLoad();
        this.icon = this.getChildNodeOrComponent("icon", cc.Sprite);
        this.flag = this.getChildNodeOrComponent("flag", cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.node, this.clickItem);
    }

    initData(data: { country: string, path: string }, selectItem: Function) {
        this._data = data;
        this._selectItem = selectItem;

        this.icon.spriteFrame = AssetContext.getAsset(this._data.path, AssetFold.texture_flag);
        this.setText(this.flag, this._data.country);
    }

    clickItem() {
        this._selectItem && this._selectItem(this._data.country);
        // GC.data.rate.rate.setCurRate(this._data, this._isClub);
    }
}