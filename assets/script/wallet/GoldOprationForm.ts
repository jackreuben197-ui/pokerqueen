import ComFormTop from "../common/ComFormTop";
import List from "../common/List";
import HttpRequest from "../net/https/HttpRequest";
import { Web_Org_Club_Create, Web_Recharge_Gold } from "../net/https/WebRequest";
import BaseForm from "../ui/form/BaseForm";
import GoldOprationItem from "./GoldOprationItem";
import { EWalletGoldOpration } from "./WalletConfig";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/GoldOprationForm')
export default class GoldOprationForm extends BaseForm {
    private comFormTop: ComFormTop = null;
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
        this.comFormTop = this.getChildNodeOrComponent("comFormTop", ComFormTop);
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
        this.comFormTop.initData(title, this);

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
        let num = Number(this.edit.string);
        if (num) {
            let paramas: any = {};
            paramas.amount = Number(this.edit.string)
            HttpRequest.Send({
                request: Web_Recharge_Gold,
                body: Web_Recharge_Gold.Request(paramas),
                onSuccess: function (data) {
                    console.log(data);
                }.bind(this),
            });
        }
    }
}