/*
 * @Author: xfj
 * @Date: 2022-10-24 10:50:41
 * @description: 
 * @LastEditors: 
 * @LastEditTime: 2022-12-05 20:31:02
 * @FilePath: /pokerqueen/assets/script/wallet/apply/OrderApplyItem.ts
 */
import ListItem from "../../common/ListItem";
import { EApplyStatus, EOrderOprationStatus } from "../../config/EEnumConfig";
import { EventName } from "../../config/EventName";
import OrderApplyItemModel from "../../frame/data/wallet/apply/OrderApplyItemModel";
import GC from "../../frame/GameControl";
import WebImageHelper from "../../helper/WebImageHelper";
import WebHelper from "../../net/https/WebHelper";
import { Web_Order_apply } from "../../net/https/WebRequest";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/apply/OrderApplyItem')
export default class OrderApplyItem extends ListItem {
    private icon: cc.Sprite = null;
    private userName: cc.Label = null;
    private userDesc: cc.Label = null;
    private userId: cc.Label = null;
    private typeTip: cc.Label = null;
    private num: cc.Label = null;
    private openNode: cc.Node = null;
    private sureBtn: cc.Node = null;
    private cancelBtn: cc.Node = null;
    private closeNode: cc.Node = null;
    private time: cc.Label = null;
    private status: cc.Label = null;

    private _data: OrderApplyItemModel = null;
    lateLoad() {
        super.lateLoad();
        this.icon = this.getChildNodeOrComponent("icon", cc.Sprite);
        this.userName = this.getChildNodeOrComponent("userName", cc.Label);
        this.userDesc = this.getChildNodeOrComponent("userDesc", cc.Label);
        this.userId = this.getChildNodeOrComponent("userId", cc.Label);
        this.typeTip = this.getChildNodeOrComponent("typeTip", cc.Label);
        this.num = this.getChildNodeOrComponent("num", cc.Label);

        this.openNode = this.getChildNodeOrComponent("openNode");
        this.sureBtn = this.getChildNodeOrComponent("sureBtn");
        this.cancelBtn = this.getChildNodeOrComponent("cancelBtn");
        this.closeNode = this.getChildNodeOrComponent("closeNode");
        this.time = this.getChildNodeOrComponent("time", cc.Label);
        this.status = this.getChildNodeOrComponent("status", cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.orderApplyItemChange, this.orderApplyItemChange);
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.sureBtn, this.clickSure);
        this.bindClick(this.cancelBtn, this.clickCancel);
    }

    initData(data: OrderApplyItemModel) {
        this._data = data;

        // this.setTexture();
        WebImageHelper.SetHeadImage(this.icon, this._data.avatar)
        this.setText(this.userName, this._data.nickname);
        this.setText(this.userDesc, "UIUserDesc", this._data.desc);
        this.setText(this.userId, `ID:${this._data.user_id}`);
        this.setText(this.num, this._data.gold_num);

        let typeTip = GC.language.getLocal("UIAppay") + GC.language.getLocal(["Text_Add", "Text_Getchips", "Text_Trans"][this._data.order_type - 1]);
        this.setText(this.typeTip, typeTip);
        this.updateStatus();
    }

    orderApplyItemChange(data: OrderApplyItemModel) {
        if (data.id == this._data.id) {
            this.updateStatus();
        }
    }

    updateStatus() {
        this.setActive(this.openNode, this._data.status == EApplyStatus.ing);
        this.setActive(this.closeNode, this._data.status != EApplyStatus.ing);
        if (this._data.status != EApplyStatus.ing) {
            this.setText(this.status, GC.language.getLocal(`UIOrder_Apply_Status_${this._data.status}`));
            this.setText(this.time, this._data.update_time);
        }
    }

    clickSure() {
        GC.data.wallet.reqOrderApplyOpration(this._data.order_no, EOrderOprationStatus.agree);
    }

    clickCancel() {
        GC.data.wallet.reqOrderApplyOpration(this._data.order_no, EOrderOprationStatus.refused);
    }
}