import ComFormTitle from "../common/ComFormTitle";
import List from "../common/List";
import { UIDefine } from "../define/UIDefine";
import HttpRequest from "../net/https/HttpRequest";
import { Web_Recharge_Gold } from "../net/https/WebRequest";
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
        this.ruleBtn.off(cc.Node.EventType.TOUCH_END, this.clickRuleBtn, this);
        this.ruleBtn.on(cc.Node.EventType.TOUCH_END, this.clickRuleBtn, this);
        this.tipNode.off(cc.Node.EventType.TOUCH_END, this.clickTipNode, this);
        this.tipNode.on(cc.Node.EventType.TOUCH_END, this.clickTipNode, this);
    }

    onShow(type: EWalletGoldOpration): void {
        super.onShow(type);
        this._type = type;

        this.initView();
    }

    initView() {
        let title = this._type == EWalletGoldOpration.in ? "充豆" : "提豆";
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

    clickRuleBtn() {
        this.tipNode.active = true;
        this.tipLab.string = "汇率：1:1"
    }

    clickTipNode() {
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
            UIComponent.open(UIDefine.UIDialogComponent,
                {
                    type: UIDialogComponent.DialogType.CommitCancel,
                    title: "提示",
                    content: this.getApplyContent(goldNum, price),
                    contentCommit: "确定",
                    contentCancel: "取消",
                    actionCommit: () => {
                        let paramas: any = {};
                        paramas.amount = Number(this.edit.string)
                        HttpRequest.Send({
                            request: Web_Recharge_Gold,
                            body: Web_Recharge_Gold.Request(paramas),
                            onSuccess: function (data) {
                                console.log(data);
                            }.bind(this),
                        });
                    },
                    noAnimation: true,
                });
        }

    }

    getApplyContent(goldNum: number, price: number) {
        if (this._type == EWalletGoldOpration.in) {
            return `确定向${"xxx"}工会申请充值${goldNum}金豆。花费${price}`
        }
        return `确定向${"xxx"}工会申请提取${goldNum}金豆。折合${price}`
    }
}