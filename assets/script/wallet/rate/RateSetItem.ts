import { UIDefine } from "../../define/UIDefine";
import RateItemModel from "../../frame/data/rate/RateItemModel";
import GC from "../../frame/GameControl";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { i18nMgr } from "../../i18n/i18nMgr";
import { Web_Rate_Api } from "../../net/https/WebRequest";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import { UISuperDialogType } from "../../ui/dialog/UISuperDialog";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/rate/RateSetItem')
export default class RateSetItem extends UIBase {
    private icon: cc.Sprite = null;
    private country: cc.Label = null;
    private rate: cc.Label = null;

    private _data: RateItemModel = null;
    lateLoad() {
        super.lateLoad();

        this.icon = this.getChildNodeOrComponent("icon", cc.Sprite);
        this.country = this.getChildNodeOrComponent("country", cc.Label);
        this.rate = this.getChildNodeOrComponent("rate", cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_Rate_Api.SET_CLUB_RATE: {
                if (msg.id == this._data.id) {
                    this.updateView();
                }
            } break;
        }
    }

    initData(data: RateItemModel) {
        this._data = data;
        this.initView();
    }

    initView() {
        this.icon.spriteFrame = AssetContext.getAsset(this._data.path, AssetFold.texture_flag);
        this.setText(this.country, this._data.country);
        this.updateView();
    }

    updateView() {
        this.setText(this.rate, `1-${this._data.rate}`);
    }

    clickSet() {
        UIComponent.open(UIDefine.EditRateForm, this._data.country);
    }

    clickDelete() {
        let tips = GC.language.getLocal("UIDeletRateTostTip", this._data.fromDesc, this._data.desc);

        UIComponent.open<UISuperDialogType>(UIDefine.UISuperDialog, {
            this: this,
            title: i18nMgr.Get("adaptation10007"),
            content: tips,
            commit: CPErrorCode.LanguageDescription(10012),
            cancel: CPErrorCode.LanguageDescription(10013),
            commit_click: () => {
                GC.data.rate.reqDeleteRate(this._data.id);
            }
        })


    }
}