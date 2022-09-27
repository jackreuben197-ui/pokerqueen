import ComFormTitle from "../common/ComFormTitle";
import { UIDefine } from "../define/UIDefine";
import BaseForm from "../ui/form/BaseForm";
import UIComponent from "../ui/UIComponent";
import { EWalletGoldOpration } from "./WalletConfig";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/MyWalletForm')
export default class MyWalletForm extends BaseForm {

    private comFormTitle: ComFormTitle = null;
    private beanNum: cc.Label = null;


    lateLoad() {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.beanNum = this.getChildNodeOrComponent("beanNum", cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    onShow(param?: any): void {
        super.onShow(param);
        this.initView();
    }

    initView() {
        this.comFormTitle.initData("我的钱包", this);
        this.updateBeanNum();
    }

    updateBeanNum() {
        this.beanNum.string = "0";
    }

    // 点击充豆
    clickChongDou() {
        UIComponent.open(UIDefine.WalletJumpForm, EWalletGoldOpration.in);
    }

    // 点击提豆
    clickTiDou() {
        UIComponent.open(UIDefine.WalletJumpForm, EWalletGoldOpration.out);
    }
}
