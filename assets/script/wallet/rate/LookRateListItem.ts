import RateItemModel from "../../frame/data/rate/RateItemModel";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import UIBase from "../../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/rate/LookRateListItem')
export default class LookRateListItem extends UIBase {
    private icon: cc.Sprite = null;
    private flag: cc.Label = null;
    private rate: cc.Label = null;

    private _data: RateItemModel = null;
    lateLoad() {
        super.lateLoad();
        this.icon = this.getChildNodeOrComponent("icon", cc.Sprite);
        this.flag = this.getChildNodeOrComponent("flag", cc.Label);
        this.rate = this.getChildNodeOrComponent("rate", cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    initData(data: RateItemModel) {
        this._data = data;

        this.icon.spriteFrame = AssetContext.getAsset(this._data.path, AssetFold.texture_flag);
        this.setText(this.flag, this._data.country);
        this.setText(this.rate, `1-${this._data.rate}`);
    }
}