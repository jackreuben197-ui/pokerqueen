import ComFormTitle from "../common/ComFormTitle";
import { UIDefine } from "../define/UIDefine";
import GC from "../frame/GameControl";
import { GameCache } from "../game/GameCache";
import { StringHelper } from "../helper/StringHelper";
import ToastManager from "../manager/ToastManager";
import { APIOrgClubGold, Web_Org_Club_Get } from "../net/https/WebRequest";
import BaseForm from "../ui/form/BaseForm";
import UIComponent from "../ui/UIComponent";
import { EWalletGoldOpration } from "./WalletConfig";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/MyWalletForm')
export default class MyWalletForm extends BaseForm {

    private comFormTitle: ComFormTitle = null;
    private beanNum: cc.Label = null;

    private _isClub: boolean = false;
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

    onShow(isClub?: boolean): void {
        super.onShow(isClub);
        this._isClub = isClub;
        this.initView();
    }

    initView() {
        this.comFormTitle.initData("UIMine_btn_MyWallet", this, "Text_RecordLine", this.clickRecord);
        this.updateBeanNum();
    }

    updateBeanNum() {
        // this.setText(this.beanNum, GameCache.Instance.gold);
        let gold = GC.data.user.info.displayGold;
        if (this._isClub) {
            gold = Math.floor(APIOrgClubGold.Response.data.gold) / 100
        }
        this.setText(this.beanNum, gold);
    }

    // 点击充豆
    clickChongDou() {
        UIComponent.open(UIDefine.WalletJumpForm, EWalletGoldOpration.in);
    }

    // 点击提豆
    clickTiDou() {
        UIComponent.open(UIDefine.WalletJumpForm, EWalletGoldOpration.out);
    }

    //点击记录
    clickRecord() {
        ToastManager.Instance.createToast("adaptation10105");
    }
}
