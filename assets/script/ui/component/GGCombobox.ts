import UIBase from '../UIBase';
import UIBasePlus from '../UIBasePlus';
import AssetContext, { AssetFold } from './AssetContext';
const { ccclass, property } = cc._decorator;

@ccclass
export default class GGCombobox extends UIBasePlus {
    $Box_Bg: cc.Node = null;
    $List: cc.Node = null;
    $Item: cc.Node = null;
    $Node_Click: cc.Node = null;
    $Top: cc.Node = null;
    select_index: number;

    onOpen: () => void = null;

    onClose: () => void = null;

    onSelect: (index) => void = null;
    item_pool: cc.Node[] = [];

    protected lateLoad() {
        super.lateLoad();
        //this.Item.active = false;
        this.$Box_Bg.active = false;
        this.$Node_Click.on('click', this.nodeClick, this);
    }

    //设置文本|icon
    setLabel(node: cc.Node, info: any) {
        let label = node.getChildByName('Label')?.getComponent(cc.Label);
        let icon = node.getChildByName('Icon')?.getComponent(cc.Sprite);
        if (label) label.string = info?.show || '';
        if (icon) icon.spriteFrame = AssetContext.getAsset(info?.icon, AssetFold.texture_icon) || null;
    }

    //绑定列表
    bindList(list: { show: string; index: number; icon?: string; value?: string }[]) {
        this.clearAllItems();
        this.setLabel(this.$Top, null);
        if (list.length) {
            for (let item_obj of list) {
                let item = this.getItem();
                item.parent = this.$List;
                this.setLabel(item.getChildByName('Child'), item_obj);
                item['obj'] = item_obj;
                if (!item.hasEventListener('click')) {
                    item.on('click', this.itemClick, this);
                }
            }
            this.setLabel(this.$Top, list[0]);
        }
        this.select_index = 0;
    }

    clearAllItems() {
        this.$List.children.forEach(item => {
            this.backItem(item);
        });
        this.$List.removeAllChildren();
    }

    getItem() {
        if (this.item_pool.length) return this.item_pool.shift();
        return cc.instantiate(this.$Item);
    }

    backItem(item: cc.Node) {
        this.item_pool.push(item);
    }

    itemClick(button: cc.Button) {
        let node = button.node;
        let obj = node['obj'];
        this.setLabel(this.$Top, obj);
        this.closeBox();
        this.select_index = obj.index;
        this.onSelect?.(obj.index);
    }

    nodeClick() {
        this.$Box_Bg.active = !this.$Box_Bg.active;
        this.$Box_Bg.active ? this.onOpen?.() : this.onClose?.();
    }

    closeBox() {
        this.$Box_Bg.active = false;
    }
}
