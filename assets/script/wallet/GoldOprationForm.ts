import ComFormTitle from "../common/ComFormTitle";
import List from "../common/List";
import { UIDefine } from "../define/UIDefine";
import GC from "../frame/GameControl";
import HttpRequest from "../net/https/HttpRequest";
import { Web_Recharge_Gold, Web_Tiqu_Gold } from "../net/https/WebRequest";
import UIDialogComponent from "../ui/dialog/UIDialogComponent";
import BaseForm from "../ui/form/BaseForm";
import UIComponent from "../ui/UIComponent";
import GoldOprationItem from "./GoldOprationItem";
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

    private _type: EWalletGoldOpration = EWalletGoldOpration.in;
    private _data: Array<number> = [300, 500, 800, 1000, 2000, 3000]
    lateLoad() {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.list = this.getChildNodeOrComponent("list", List);
        this.edit = this.getChildNodeOrComponent("editBox", cc.EditBox);
        this.priceLab = this.getChildNodeOrComponent("priceLab", cc.Label);

        this.ruleBtn = this.getChildNodeOrComponent("ruleBtn");
        this.tipNode = this.getChildNodeOrComponent("tipNode");
        this.tipLab = this.getChildNodeOrComponent("tipLab", cc.Label);

        this.tipNode.active = false;
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.ruleBtn, this.clickRuleBtn);
        this.bindClick(this.tipNode, this.clickTipNode);
    }

    onShow(type: EWalletGoldOpration): void {
        super.onShow(type);
        this._type = type;

        this.initView();
    }

    initView() {
        let title = this._type == EWalletGoldOpration.in ? "Text_Add" : "Text_Getchips";
        this.comFormTitle.initData(title, this);

        this.edit.string = "";
        this.updatePrice();
        this.list.numItems = this._data.length;
    }

    textChanged(str: string, edit: cc.EditBox) {
        this.updatePrice();
    }

    updatePrice() {
        let num = Number(this.edit.string);
        this.priceLab.string = String(num || 0);
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(GoldOprationItem);
        item.initData(this._data[index], this.clickItem);
    }

    clickRuleBtn = () => {
        this.tipNode.active = true;
        this.setText(this.tipLab, "汇率：1:1");
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
                noAnimation: true,
            });
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
}