import ComFormTitle from "../common/ComFormTitle";
import List from "../common/List";
import GC from "../frame/GameControl";
import { Web_Mtt } from "../net/https/WebRequest";
import BaseForm from "../ui/form/BaseForm";
import MttListItem from "./MttListItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/mtt/MttListForm')
export default class MttListForm extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    private list: List = null;
    lateLoad() {
        super.lateLoad();
        this.list = this.getChildNodeOrComponent("list", List);
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_Mtt.LIST: {
                this.updateList();
            } break;
        }
    }

    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node): void {
        super.onShow(param, fromUI, sceneUI);

        this.comFormTitle.initData("UIMTTList_mtt", this);
        this.list.scrollingCB = this.scrollingCB;
        GC.data.mtt.list.reqList();

    }

    scrollingCB = (scrollView: cc.ScrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset();
            let isDown = cur.y >= max.y;
            if (isDown) {
                GC.data.mtt.list.dropDownReq();
            }
        }
    };

    updateList() {
        this.list.numItems = GC.data.mtt.list.list.length;
    }

    onRender(node: cc.Node, index) {
        let item = node.getComponent(MttListItem);
        item.initData(GC.data.mtt.list.list[index]);
    }

    lateClose(param?: any): void {
        super.lateClose();
        this.list.numItems = 0;
    }
}