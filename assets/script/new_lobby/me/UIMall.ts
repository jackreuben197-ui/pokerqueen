import SimpleNodePool from "../../common/MyNodePool";
import { Web_MallShopList, Web_Mall_Buy, WWW } from "../../net/https/WebRequest";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import ItemMall from "./ItemMall";
import UIChangeName from "./UIChangeName";
import UIMe from "./UIMe";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMall extends BaseFormPlus {

    $ItemMall: cc.Node = null;
    $content: cc.Node = null;
    /////////////////////////////////////////////
    item_pool: SimpleNodePool = null;

    lateLoad() {
        super.lateLoad();
        this.item_pool = new SimpleNodePool(this.$ItemMall);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.cleanList();
        this.reqMallList();
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
    }
    //请求商城列表P
    reqMallList() {

        WWW.Instance.CommonAPI(
            {
                web_class: Web_MallShopList,
                body: {
                    channel: 1,
                    shopping_type_id: 1
                }
            }
        ).then(
            (res: any) => {
                this.refreshList(res);
            },
            (res: any) => {

            }
        )
    }
    refreshList(res: any) {
        let list = res.data.list;
        if (list.length) {
            list.forEach((room, index) => {
                let item_node: cc.Node = this.item_pool.GetNode();
                item_node.parent = this.$content;
                let item_sc: ItemMall = item_node.getComponent(ItemMall);
                item_sc.index = index;
                item_sc.onShow(room);
                item_sc.$price["index"] = index;
                item_sc.$price.on("click", this.onItemClick, this);
            });
        }
    }
    //清理列表
    cleanList() {
        this.$content.children.forEach(item => {
            //if(item.getComponent(ItemLobbyRoom)){
            this.item_pool.BackNode(item);
            //}
        })
        this.$content.removeAllChildren();
    }
    onItemClick(button: cc.Button) {
        //let item_sc: ItemMall = button.node.getComponent(ItemMall);
        let index = button.node["index"];

        console.log("购买", index);

        let goods_id: number = Web_MallShopList.Response.data.list[index].id;

        WWW.Instance.CommonAPI(
            {
                web_class: Web_Mall_Buy,
                body: {
                    goods_id: goods_id,
                }
            }
        ).then(
            (res: any) => {
                UIComponent.Instance.ToastLanguage("钻石购买成功");
                //let uime: UIMe = UIComponent.Instance.getComponent("UIMe");
                //uime.refreshWallet();
                // let changeName: UIChangeName = UIComponent.Instance.getComponent("UIChangeName");
                // changeName.refreshWallet();
                this.obj.fromComponent?.refreshWallet?.();
            },
            (res: any) => {

            }
        )
    }
}
