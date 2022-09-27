import ToastManager from "../../manager/ToastManager";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import UIBase from "../../ui/UIBase";
import { TMatchSportsDataType } from "./MatchViewConfig";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/matchView/UIMatchSportsItem')
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
        this.bindClick(this.node, this.clickBg);
    }


    initData(data: any = null) {
        this._data = data;

        this.setText(this.nameLab, this._data.name);
        this.bgSp.spriteFrame = AssetContext.getAsset(this._data.bgPath, AssetFold.texture_match_view);
    }

    clickBg = () => {
        ToastManager.Instance.createToast(this._data.url);
    }
}