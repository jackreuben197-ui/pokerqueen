import ComFormTitle from "../common/ComFormTitle";
import List from "../common/List";
import { EventName } from "../config/EventName";
import { UIDefine } from "../define/UIDefine";
import RateModel from "../frame/data/rate/RateModel";
import GC from "../frame/GameControl";
import ToastManager from "../manager/ToastManager";
import HttpRequest from "../net/https/HttpRequest";
import { Web_Rate_Api, Web_Recharge_Gold, Web_Recharge_Gold_Club, Web_Tiqu_Gold, Web_Tiqu_Gold_Club } from "../net/https/WebRequest";
import AssetContext, { AssetFold } from "../ui/component/AssetContext";
import UIDialogComponent from "../ui/dialog/UIDialogComponent";
import BaseForm from "../ui/form/BaseForm";
import UIComponent from "../ui/UIComponent";
import GoldOprationItem from "./GoldOprationItem";
import SelectRateTypeNode from "./rate/SelectRateTypeNode";
import { EWalletGoldOpration } from "./WalletConfig";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/GoldOprationForm')
export default class GoldOprationForm extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    private list: List = null;
    private edit: cc.EditBox = null;
    private priceLab: cc.Label = null;
    private ruleBtn: cc.Node = null;
    private tipNode: cc.Node = null;
    private tipLab: cc.Label = null;
    private typeNode: cc.Node = null;
    private typeIcon: cc.Sprite = null;
    private typeLab: cc.Label = null;
    private priceNode: cc.Node = null;

    private typeBg: cc.Node = null;
    private lightArrow: cc.Node = null;

    private selectRateTypeNode: SelectRateTypeNode = null;

    private _type: EWalletGoldOpration = EWalletGoldOpration.in;
    private _isClub: boolean = false;
    private _data: Array<number> = [300, 500, 800, 1000, 2000, 3000];
    private _rate: RateModel = null;
    onLoad() {
        super.onLoad();
        this._rate = GC.data.rate.rate;
    }
    lateLoad() {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.list = this.getChildNodeOrComponent("list", List);
        this.edit = this.getChildNodeOrComponent("editBox", cc.EditBox);
        this.priceLab = this.getChildNodeOrComponent("priceLab", cc.Label);

        this.ruleBtn = this.getChildNodeOrComponent("ruleBtn");
        this.tipNode = this.getChildNodeOrComponent("tipNode");
        this.tipLab = this.getChildNodeOrComponent("tipLab", cc.Label);

        this.typeBg = this.getChildNodeOrComponent("typeBg");
        this.lightArrow = this.getChildNodeOrComponent("lightArrow");

        this.typeNode = this.getChildNodeOrComponent("typeNode");
        this.typeIcon = this.getChildNodeOrComponent("typeIcon", cc.Sprite);
        this.typeLab = this.getChildNodeOrComponent("typeLab", cc.Label);
        this.priceNode = this.getChildNodeOrComponent("priceNode");

        this.selectRateTypeNode = this.getChildNodeOrComponent("selectRateTypeNode", SelectRateTypeNode);

        this.tipNode.active = false;
        this.selectRateTypeNode.node.active = false;
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.curSelectRateChange, this.curSelectRateChange)
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.ruleBtn, this.clickRuleBtn);
        this.bindClick(this.tipNode, this.clickTipNode);
        this.bindClick(this.typeBg, this.clickSelectRate);
    }

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_Rate_Api.GET_RATE_LIST: {
                this.updateRate();
            } break;
            default:
                break;
        }
    }

    onShow(data: { type: EWalletGoldOpration, isClub: boolean }): void {
        super.onShow(data);
        this._type = data.type;
        this._isClub = data.isClub;

        this.initView();
        GC.data.rate.reqRateList(this._isClub);
    }

    initView() {
        let title = this._type == EWalletGoldOpration.in ? "Text_Add" : "Text_Getchips";
        this.comFormTitle.initData(title, this, "UILookRate", this.clickLookRate);

        this.edit.string = "";
        this.list.numItems = this._data.length;

        this.setActive(this.typeNode, false);
        this.setActive(this.priceNode, false)
    }

    textChanged(str: string, edit: cc.EditBox) {
        this.updatePrice();
    }

    updatePrice() {
        let curRate = this._rate.getCurRate(this._isClub);
        if (curRate) {
            let num = Number(this.edit.string);
            this.setText(this.priceLab, curRate.changeToNum(num));
        }
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(GoldOprationItem);
        item.initData(this._data[index], this.clickItem);
    }

    curSelectRateChange() {
        this.selectRateTypeNode.close(true);
        this.updateRate();
    }

    updateRate() {
        let list = this._rate.getList(this._isClub);
        if (list.length) {
            this.setActive(this.typeNode, true);
            this.setActive(this.priceNode, true);

            let curRate = this._rate.getCurRate(this._isClub);
            this.typeIcon.spriteFrame = AssetContext.getAsset(curRate.path, AssetFold.texture_flag);
            this.setText(this.typeLab, curRate.country);
            this.updatePrice();
        }
    }

    clickSelectRate() {
        this.setActive(this.selectRateTypeNode, true);
        let data = this._rate.getList(this._isClub).map(item => {
            return { country: item.country, path: item.path }
        })
        this.selectRateTypeNode.open(data, this.selectItem)
    }

    selectItem = (data: string) => {
        this._rate.setCurRate(data, this._isClub)
    }


    clickRuleBtn = () => {
        this.tipNode.active = true;
        let curRate = this._rate.getCurRate(this._isClub);
        this.setText(this.tipLab, "UIRate_x_x", curRate.rate);
    }

    clickTipNode = () => {
        this.tipNode.active = false;
    }

    clickItem = (goldNum: number) => {
        this.edit.string = String(goldNum);
        this.updatePrice();
    }

    clickSure() {
        let goldNum = Number(this.edit.string);
        if (goldNum) {
            let price = Number(this.priceLab.string);
            let procolType = this._type == EWalletGoldOpration.in ? Web_Recharge_Gold : Web_Tiqu_Gold;
            if (this._isClub) {
                procolType = this._type == EWalletGoldOpration.in ? Web_Recharge_Gold_Club : Web_Tiqu_Gold_Club;
            }
            UIComponent.open(UIDefine.UIDialogComponent,
                {
                    type: UIDialogComponent.DialogType.CommitCancel,
                    title: "adaptation10007",
                    content: this.getApplyContent(goldNum, price),
                    contentCommit: "adaptation10012",
                    contentCancel: "adaptation10013",
                    actionCommit: () => {
                        //后端需要真实数据的100倍
                        let sendNum = Number(this.edit.string) * 100;
                        let paramas: { amount: number } = { amount: sendNum };
                        HttpRequest.Send({
                            request: procolType,
                            body: procolType.Request(paramas),
                            onSuccess: function (data) {
                                this.applySucTip(goldNum, price);
                            }.bind(this),
                        });
                    },
                    noAnimation: true,
                });
        }
    }

    applySucTip(goldNum: number, price: number) {
        UIComponent.open(UIDefine.UIDialogComponent,
            {
                type: UIDialogComponent.DialogType.Commit,
                title: "adaptation10007",
                content: this.getApplySucContent(goldNum, price),
                contentCommit: "adaptation10012",
                contentCancel: "adaptation10013",
                actionCommit: this.backToWallet,
                actionClose: this.backToWallet,
                noAnimation: true,
            });
    }

    backToWallet = () => {
        UIComponent.close(UIDefine.GoldOprationForm);
        UIComponent.close(UIDefine.WalletJumpForm);
    }

    getApplyContent(goldNum: number, price: number) {
        if (this._type == EWalletGoldOpration.in) {
            return GC.language.getLocal("Tips_UIClub_FundRecharge_RechargeConfirm", goldNum);
        }
        return GC.language.getLocal("Tips_UIClub_FundRecharge_WithdrawConfirm", goldNum);
    }

    getApplySucContent(goldNum: number, price: number) {
        return "roomError171_5";
        if (this._type == EWalletGoldOpration.in) {
            return GC.language.getLocal("MsgInfo_3000", goldNum);
        }
        return GC.language.getLocal("MsgInfo_3001", goldNum);
    }

    //点击记录
    clickLookRate() {
        // ToastManager.Instance.createToast("adaptation10105");
        UIComponent.open(UIDefine.LookRateListDlg, this._rate.getList(this._isClub));
    }

    lateClose(param?: any): void {
        super.lateClose();
        this.tipNode.active = false;
        this.selectRateTypeNode.close(false);
    }
}