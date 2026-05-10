import SimpleNodePool from '../../common/MyNodePool';
import UIBasePlus from '../../ui/UIBasePlus';
import UIComponent from '../../ui/UIComponent';
import ItemClubWallet from './ItemClubWallet';
const { ccclass, menu } = cc._decorator;

@ccclass
export default class UIClubWalletList extends UIBasePlus {
    $back: cc.Node = null;
    $content: cc.Node = null;
    $ItemClubWallet: cc.Node = null;
    //////////////////////////////
    item_pool: SimpleNodePool = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.item_pool = new SimpleNodePool(this.$ItemClubWallet);
        this.setButtonClick(this.$back, this.hideUI);
    }

    onShow(data: any): void {
        super.onShow(data);
        this.clearAllItem();
        data.wallets.forEach((item, index) => {
            let node = this.item_pool.GetNode();
            node.parent = this.$content;
            node['index'] = index;
            node.getComponent(ItemClubWallet).onShow({ data: item, selected_wallet: data.selected_wallet });
            this.setButtonClick(node, this.onItemClick);
        });
    }

    clearAllItem() {
        this.$content.children.forEach(item => {
            this.item_pool.BackNode(item);
        });
        this.$content.removeAllChildren();
    }

    private onItemClick(button: cc.Button): void {
        let index = button.node['index'];
        this._param.own.refreshSelect(index);
        this.hideUI();
    }

    hideUI() {
        UIComponent.close(this.UIDefine);
    }
}
