import ComFormTitle from "../../common/ComFormTitle";
import { TRateConfig, TRateItem } from "../../config/TTypeConfig";
import { UIDefine } from "../../define/UIDefine";
import { RateConfig } from "../../frame/data/rate/RateConfig";
import RateItemModel from "../../frame/data/rate/RateItemModel";
import RateModel from "../../frame/data/rate/RateModel";
import GC from "../../frame/GameControl";
import ToastManager from "../../manager/ToastManager";
import { Web_Rate_Api } from "../../net/https/WebRequest";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import SelectRateTypeNode from "./SelectRateTypeNode";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/rate/EditRateForm')
export default class EditRateForm extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    private fromIcon: cc.Sprite = null;
    private fromCountry: cc.Label = null;
    private fromRate: cc.Label = null;
    private toIcon: cc.Sprite = null;
    private toCountry: cc.Label = null;
    private toRate: cc.EditBox = null;

    private selectBtn: cc.Node = null;

    private rateTip: cc.Label = null;
    private sureBtn: cc.Node = null;
    private sureLab: cc.Label = null;



    private selectRateTypeNode: SelectRateTypeNode = null;


    private _data: RateItemModel = null;
    private _rate: RateModel = null;
    private _from: TRateConfig = null;
    private _to: TRateConfig = null;
    onLoad() {
        super.onLoad();
        this._rate = GC.data.rate.rate;
    }
    lateLoad() {
        super.lateLoad();

        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle)
        this.fromIcon = this.getChildNodeOrComponent("fromIcon", cc.Sprite)
        this.fromCountry = this.getChildNodeOrComponent("fromCountry", cc.Label)
        this.fromRate = this.getChildNodeOrComponent("fromRate", cc.Label)
        this.toIcon = this.getChildNodeOrComponent("toIcon", cc.Sprite)
        this.toCountry = this.getChildNodeOrComponent("toCountry", cc.Label)
        this.toRate = this.getChildNodeOrComponent("toRate", cc.EditBox)
        this.selectBtn = this.getChildNodeOrComponent("selectBtn")
        this.rateTip = this.getChildNodeOrComponent("rateTip", cc.Label)
        this.sureBtn = this.getChildNodeOrComponent("sureBtn");
        this.sureLab = this.getChildNodeOrComponent("sureLab", cc.Label)

        this.selectRateTypeNode = this.getChildNodeOrComponent("selectRateTypeNode", SelectRateTypeNode);
        this.selectRateTypeNode.node.active = false;
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.sureBtn, this.clickSure);
        this.bindClick(this.selectBtn, this.clickSelect);
    }

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_Rate_Api.SET_CLUB_RATE: {
                UIComponent.close(UIDefine.EditRateForm);
            } break;
        }
    }

    onShow(type?: string, fromUI?: any): void {
        super.onShow(type, fromUI);

        this.setActive(this.selectBtn, !type);
        this.selectCountry(type);
    }

    selectCountry(type: string) {
        this._data = this._rate.getRate(type, false);

        this._from = this._rate.getCfg("USD");
        this._to = this._rate.getCfg(this._data ? this._data.country : type);

        this.fromIcon.spriteFrame = AssetContext.getAsset(this._from.path, AssetFold.texture_flag);
        this.setText(this.fromCountry, this._from.country);
        this.setText(this.fromRate, 1);


        this.toIcon.spriteFrame = null;
        this.setText(this.toCountry, "");
        this.setText(this.toRate, "");
        if (this._to) {
            this.toIcon.spriteFrame = AssetContext.getAsset(this._to.path, AssetFold.texture_flag);
            this.setText(this.toCountry, this._to.country);
        }
        if (this._data) {
            this.setText(this.toRate, this._data.rate);
        }

        this.updateType();
        this.updateRateTips();
    }

    updateType() {
        let title = this._data ? "UITitle_setRate" : "UITitle_addRate";
        this.comFormTitle.initData(title, this);
        this.setText(this.sureLab, this._data ? "CommitOK" : "UIBtnLab_add");
    }

    editChange(edit: cc.EditBox, str) {
        if (this._to) {
            this.updateRateTips();
        }
    }

    updateRateTips() {
        this.setText(this.rateTip, `1${this._from.flag} = ${this.toRate.string}${this._to ? this._to.flag : ""}`)
    }

    clickSelect() {
        this.setActive(this.selectRateTypeNode, true);
        this.selectRateTypeNode.open(RateConfig.filter(cfg => cfg.country != "USD"), this.selectItem);
    }

    selectItem = (country: string) => {
        this.selectRateTypeNode.close();
        this.selectCountry(country);
    }

    clickSure() {
        let rate = Number(this.toRate.string)
        if (this._from && this._to && rate) {
            let tips = GC.language.getLocal("UISetRateTostTip", this._from.desc, this._from.country, this._to.desc, this._to.country, this.rateTip.string);
            UIComponent.open(UIDefine.UIDialogComponent,
                {
                    type: UIDialogComponent.DialogType.CommitCancel,
                    title: "adaptation10007",
                    content: tips,
                    contentCommit: "adaptation10012",
                    contentCancel: "adaptation10013",
                    actionCommit: () => {
                        GC.data.rate.reqSetRate(this._to.country, rate, this._data?.id || null, false);
                    },
                    noAnimation: true,
                });
        } else {
            ToastManager.Instance.createToast("UIRateSetEditIsNullTip");
        }
    }

    lateClose(param?: any): void {
        super.lateClose();
        this.selectRateTypeNode.close(false);
    }
}