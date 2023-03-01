import { table } from "console";
import { Tabs_Status } from "../config/GameConfig";
import UIBasePlus from "../ui/UIBasePlus"
import UIComponent from "../ui/UIComponent";
import SimpleNodePool from "./MyNodePool";

const { ccclass, menu } = cc._decorator;

export type UIDownSelectorParam = {
    select_texts: string[],
    confirm_text?: string,
    confirm_click?: Function,
    this?: any,
    select?: number,//初始选中项
}
@ccclass
@menu('脚本分组/common/UIDownSelector')
export default class UIDownSelector extends UIBasePlus {
    $black: cc.Node = null;
    $confirm: cc.Node = null;
    $item: cc.Node = null;
    cc_Label$confirm_text: cc.Label = null;

    $content_layout: cc.Node = null;

    _param: UIDownSelectorParam;

    pool: SimpleNodePool;

    select: number;

    lateLoad() {
        super.lateLoad();
        this.pool = new SimpleNodePool(this.$item);
    }

    onShow(data): void {
        super.onShow(data);
        this.select = data.select || 0;
        this.refreshUI(data);
    }
    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$black, this.onClickBlack);
        this.setButtonClick(this.$confirm, this.onClickConfirm);
    }
    refreshUI(data: UIDownSelectorParam) {
        this.clearItems();

        let status = Tabs_Status[this.select];

        data.select_texts.forEach((text, index) => {
            let item = this.pool.GetNode();
            item["index"] = index;
            item.parent = this.$content_layout;
            this.setChildLabel(item, "text", text);
            this.setButtonClick(item, this.onItemClick);
            this.setChildVisible(item, "unselect", !status[index]);
            this.setChildVisible(item, "select", !!status[index]);
        })
    }

    onItemClick(button: cc.Button) {
        let index = button.node["index"];
        this.select = index;
        let status = Tabs_Status[this.select];
        this.$content_layout.children.forEach((item, index) => {
            this.setChildVisible(item, "unselect", !status[index]);
            this.setChildVisible(item, "select", !!status[index]);
        })
    }

    clearItems() {
        this.$content_layout.children.forEach(item => {
            this.pool.BackNode(item);
        })
        this.$content_layout.removeAllChildren();
    }
    //确认点击
    onClickConfirm() {
        this._param.confirm_click?.call(this._param.this, this.select);
        this.hideUI();
    }
    //背景点击
    onClickBlack() {
        this.hideUI();
    }
    hideUI() {
        UIComponent.close(this.UIDefine);
    }
}
