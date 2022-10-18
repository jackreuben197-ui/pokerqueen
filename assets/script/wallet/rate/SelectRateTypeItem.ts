import RateItemModel from "../../frame/data/rate/RateItemModel";
import GC from "../../frame/GameControl";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import UIBase from "../../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/rate/SelectRateTypeItem')
export default class SelectRateTypeItem extends UIBase {
    private icon: cc.Sprite = null;
    private flag: cc.Label = null;

    private _data: RateItemModel = null;
    private _isClub: boolean = false;
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

    initData(data: RateItemModel, isClub: boolean) {
        this._data = data;
        this._isClub = isClub;

        this.icon.spriteFrame = AssetContext.getAsset(this._data.path, AssetFold.texture_flag);
        this.setText(this.flag, this._data.flag);
    }

    clickItem() {
        GC.data.rate.setCureRate(this._data, this._isClub);
    }
}