import ComFormTitle from "../../../common/ComFormTitle";
import List from "../../../common/List";
import BaseForm from "../../../ui/form/BaseForm";
import UIRecordBXListItem from "./UIRecordBXListItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/lobby/view/record/UIRecordBXList')
export default class UIRecordBXList extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    private list: List = null;
    lateLoad() {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.list = this.getChildNodeOrComponent("list", List);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    onShow(param?: any): void {
        super.onShow(param);

        this.comFormTitle.initData("UIMine_InsurancesItems", this);
        this.list.numItems = 10;
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(UIRecordBXListItem);
        item.initData(null, index == 9);
    }
}