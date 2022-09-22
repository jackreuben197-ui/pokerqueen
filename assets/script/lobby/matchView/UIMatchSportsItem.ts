import ToastManager from "../../manager/ToastManager";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import UIBase from "../../ui/UIBase";
import { TMatchSportsDataType } from "./MatchViewConfig";

const { ccclass, property } = cc._decorator;
@ccclass
export default class UIMatchSportsItem extends UIBase {

    private bgSp: cc.Sprite = null;
    private nameLab: cc.Label = null;

    private _data: TMatchSportsDataType = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.bgSp = this.node.getComponent(cc.Sprite);
        this.nameLab = this.getChildNodeOrComponent("name", cc.Label);
    }
    
    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.node.off(cc.Node.EventType.TOUCH_END, this.clickBg, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.clickBg, this);
    }


    initData(data: any = null) {
        this._data = data;

        this.nameLab.string = this._data.name;
        this.bgSp.spriteFrame = AssetContext.getAsset(this._data.bgPath, AssetFold.texture_match_view);
    }

    clickBg() {
        ToastManager.Instance.createToast(this._data.url);
    }
}