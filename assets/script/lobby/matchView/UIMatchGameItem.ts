import ToastManager from "../../manager/ToastManager";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import UIBase from "../../ui/UIBase";
import { TMatchGameDataType } from "./MatchViewConfig";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/matchView/UIMatchGameItam')
export default class UIMatchGameItam extends UIBase {

    private icon: cc.Sprite = null;
    private nameLab: cc.Label = null;


    private _data: TMatchGameDataType = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.icon = this.getChildNodeOrComponent("icon", cc.Sprite);
        this.nameLab = this.getChildNodeOrComponent("name", cc.Label);
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.node.off(cc.Node.EventType.TOUCH_END, this.clickBg, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.clickBg, this);
    }

    initData(data: TMatchGameDataType) {
        this._data = data;

        this.icon.spriteFrame = AssetContext.getAsset(this._data.bgPath, AssetFold.texture_match_view);
        this.nameLab.string = this._data.name;
    }

    clickBg() {
        ToastManager.Instance.createToast(this._data.url);
    }
}