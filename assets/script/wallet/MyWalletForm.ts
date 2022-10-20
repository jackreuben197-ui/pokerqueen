import ComFormTitle from "../common/ComFormTitle";
import List from "../common/List";
import { EventName } from "../config/EventName";
import { UIDefine } from "../define/UIDefine";
import GoldChangeLogModel from "../frame/data/wallet/goldChangeLog/GoldChangeLogModel";
import GC from "../frame/GameControl";
import ToastManager from "../manager/ToastManager";
import { APIOrgClubGold, Web_Gold_Change_Log } from "../net/https/WebRequest";
import BaseForm from "../ui/form/BaseForm";
import UIComponent from "../ui/UIComponent";
import GoldChangeRecordItem from "./GoldChangeRecordItem";
import { EWalletGoldOpration } from "./WalletConfig";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/MyWalletForm')
export default class MyWalletForm extends BaseForm {

    private comFormTitle: ComFormTitle = null;
    private beanNum: cc.Label = null;
    private myNode: cc.Node = null;
    private clubNode: cc.Node = null;
    private applyBtn: cc.Node = null;

    private list: List = null;

    private _isClub: boolean = false;

    private _goldChangeLogs: GoldChangeLogModel = null;
    onLoad() {
        super.onLoad();
        this._goldChangeLogs = GC.data.wallet.goldChangeLogs;
    }

    lateLoad() {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.beanNum = this.getChildNodeOrComponent("beanNum", cc.Label);

        this.myNode = this.getChildNodeOrComponent("myNode");
        this.clubNode = this.getChildNodeOrComponent("clubNode");
        this.applyBtn = this.getChildNodeOrComponent("applyBtn");

        this.list = this.getChildNodeOrComponent("list", List);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.list.scrollingCB = this.scrollingCB;

        this.listen(EventName.myGoldChange, this.updateBeanNum);
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.applyBtn, this.clickApply);
    }

    onShow(isClub?: boolean): void {
        super.onShow(isClub);
        this._isClub = isClub;
        this._goldChangeLogs.reqLog(isClub);

        this.initView();
    }

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_Gold_Change_Log.Club: {
                this._isClub && this.updateList();
            } break;
            case Web_Gold_Change_Log.User: {
                !this._isClub && this.updateList();

            } break;
        }
    }

    initView() {
        let title = this._isClub ? "UIClub_FundDetail" : "UIMine_WalletMy";
        this.comFormTitle.initData(title, this, "Text_RecordLine", this.clickRecord);
        this.updateBeanNum();

        this.setActive(this.myNode, !this._isClub)
        this.setActive(this.clubNode, this._isClub)
    }


    updateBeanNum() {
        let gold = GC.data.user.info.displayGold;
        if (this._isClub) {
            gold = Math.floor(APIOrgClubGold.Response.data.gold) / 100
        }
        this.setText(this.beanNum, gold);
    }


    scrollingCB = (scrollView: cc.ScrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset()
            let isDown = cur.y >= max.y;
            if (isDown && this._goldChangeLogs.canReq) {
                this._goldChangeLogs.dropDownReq(this._isClub);
            }
        }
    }

    updateList() {
        this.list.numItems = this._goldChangeLogs.getList(this._isClub).length;;
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(GoldChangeRecordItem);

        let data = this._goldChangeLogs.getList(this._isClub)[index];
        item.initData(data);
        node.getComponent(cc.Layout).updateLayout();
    }

    // 点击充豆
    clickChongDou() {
        UIComponent.open(UIDefine.WalletJumpForm, { type: EWalletGoldOpration.in, isClub: this._isClub });
    }

    // 点击提豆
    clickTiDou() {
        UIComponent.open(UIDefine.WalletJumpForm, { type: EWalletGoldOpration.out, isClub: this._isClub });
    }

    // 点击发放
    clickIssue() {
        UIComponent.open(UIDefine.GoldIssueListForm);
    }

    // 点击查看申请几率
    clickApply() {
        ToastManager.Instance.createToast("adaptation10105");
    }

    // 点击记录
    clickRecord() {
        // ToastManager.Instance.createToast("adaptation10105");
        UIComponent.open(UIDefine.OrderRecordsForm, this._isClub);
    }

    lateClose(param?: any): void {
        super.lateClose();
        this.list.numItems = 0;
    }
}
