import ComFormTitle from "../../common/ComFormTitle";
import ComTabToggles, { ETabToggle } from "../../common/ComTabToggles";
import List from "../../common/List";
import { EOrderType } from "../../config/EEnumConfig";
import GC from "../../frame/GameControl";
import { Web_Order_apply } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import OrderApplyItem from "./OrderApplyItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/apply/OrderApplyForm')
export default class OrderApplyForm extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    private toggles: ComTabToggles = null;
    private list: List = null;

    lateLoad() {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.toggles = this.getChildNodeOrComponent("tabToggles", ComTabToggles);
        this.list = this.getChildNodeOrComponent("list", List);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_Order_apply.APPLY_LIST: {
                this.updateList();
            } break;
        }
    }

    onShow(param?: any, fromUI?: any, sceneUI?: cc.Node): void {
        super.onShow(param, fromUI, sceneUI);

        this.comFormTitle.initData("UIAppay", this);
        this.toggles.initData(this.onToggle, ETabToggle.sprite, { data: [EOrderType.chongzhi, EOrderType.tiqu] });
        this.toggles.clickTab(0, null, true)

        this.list.scrollingCB = this.scrollingCB;
    }

    onToggle = (index, type) => {
        GC.data.wallet.apply.reqList(0, type);
    }

    scrollingCB = (scrollView: cc.ScrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset();
            let isDown = cur.y >= max.y;
            if (isDown) {
                GC.data.wallet.apply.dropDownReq();
            }
        }
    };

    updateList() {
        this.list.numItems = GC.data.wallet.apply.list.length;
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(OrderApplyItem);
        item.initData(GC.data.wallet.apply.list[index]);
    }


}