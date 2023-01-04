import UIBase from "../UIBase";
import AssetContext, { AssetFold } from "./AssetContext";


const { ccclass, property } = cc._decorator;

@ccclass
export default class GGCombobox extends UIBase {

    Box_Bg: cc.Node = null;
    List: cc.Node = null;
    Item: cc.Node = null;
    Label_Top: cc.Label = null;
    Node_Click: cc.Node = null;

    onOpen: () => void = null;
    onClose: () => void = null;
    onSelect: (index) => void = null;

    item_pool: cc.Node[] = [];
    protected lateLoad() {
        super.lateLoad();
        this.Box_Bg = this.getChildNodeOrComponent("Box_Bg");
        this.List = this.getChildNodeOrComponent("List");
        this.Item = this.getChildNodeOrComponent("Item");
        this.Label_Top = this.getChildNodeOrComponent("Label_Top", cc.Label);
        this.Node_Click = this.getChildNodeOrComponent("Node_Click");
        //this.Item.active = false;
        this.Box_Bg.active = false;
        this.Node_Click.on("click", this.nodeClick, this);
    }
    setTopLabel(text: string) {
        this.Label_Top.string = text;
    }
    //绑定列表
    bindList(list: { show: string, index: number, icon?: string, value?: string }[]) {
        this.clearAllItems();
        this.setTopLabel("");
        if (list.length) {
            for (let item_obj of list) {
                let item = this.getItem();
                item.parent = this.List;
                let label_node = item.getChildByName("Item_Label") || cc.find("RichLabel/Item_Label", item);
                let icon_node = cc.find("RichLabel/Icon", item);
                label_node.getComponent(cc.Label).string = item_obj.show;
                if (icon_node) icon_node.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(item_obj.icon, AssetFold.texture_icon);
                item["obj"] = item_obj;
                if (!item.hasEventListener("click")) {
                    item.on("click", this.itemClick, this);
                }
            }
            this.setTopLabel(list[0].show);
        }
    }
    clearAllItems() {
        this.List.children.forEach(item => {
            this.backItem(item);
        })
        this.List.removeAllChildren();
    }
    getItem() {
        if (this.item_pool.length) return this.item_pool.shift();
        return cc.instantiate(this.Item);
    }
    backItem(item: cc.Node) {
        this.item_pool.push(item);
    }

    itemClick(button: cc.Button) {
        let node = button.node;
        let obj = node["obj"];
        this.setTopLabel(obj.show);
        this.closeBox();
        this.onSelect?.(obj.index);
    }
    nodeClick() {
        this.Box_Bg.active = !this.Box_Bg.active;

        this.Box_Bg.active ? this.onOpen?.() : this.onClose?.();
    }

    closeBox() {
        this.Box_Bg.active = false;
    }

}
