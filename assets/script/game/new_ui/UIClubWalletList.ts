import SimpleNodePool from "../../common/MyNodePool";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent from "../../ui/UIComponent";
import ItemClubWallet from "./ItemClubWallet";

const {ccclass, menu} = cc._decorator;

@ccclass
@menu('脚本分组/game/new_ui/UIClubWalletList')
export default class UIClubWalletList extends UIBasePlus {
    $content:cc.Node = null;
    $ItemClubWallet:cc.Node = null;
    //////////////////////////////
    item_pool:SimpleNodePool = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.item_pool = new SimpleNodePool(this.$ItemClubWallet);
    }
    onShow(data: any): void {
        super.onShow(data);
        this.clearAllItem();
        data.data.forEach((item,index) =>{
            let node = this.item_pool.GetNode();
            node.parent = this.$content;
            node.getComponent(ItemClubWallet).index = index;
            node.getComponent(ItemClubWallet).onShow({own:this,data:item,selected_wallet:data.selected_wallet});
        })
    }
    clearAllItem(){
        this.$content.children.forEach(item =>{
            this.item_pool.BackNode(item);
        })
        this.$content.removeAllChildren();
    }
    public refreshSelect(index:number){
        this._param.own.refreshSelect(index);
        this.hideUI();
    }
    hideUI(){
        UIComponent.close(this.UIDefine);
    }
}
