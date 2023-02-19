import SimpleNodePool from "../../common/MyNodePool";
import { i18nMgr } from "../../i18n/i18nMgr";
import { Web_Prop_User_Prop_List, WWW } from "../../net/https/WebRequest";
import UIBackDialog from "../../ui/dialog/UIBackDialog";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import ItemMyPack from "./ItemMyPack";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMyPack extends BaseFormPlus {

    //$ItemMall:cc.Node = null;
    $content: cc.Node = null;
    $null: cc.Node = null;
    $ItemMyPack: cc.Node = null;
    /////////////////////////////////////////////
    item_pool: SimpleNodePool = null;


    lateLoad() {
        super.lateLoad();
        this.item_pool = new SimpleNodePool(this.$ItemMyPack);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.cleanList();
        this.$null.active = false;
        this.reqPackList();
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
    }
    //道具类型(prop_type):
    //0-全部;
    //1-mtt门票，2-实物，3-电话卡，4-购物卡，
    //5-代金卷 6-线下门票 7-免服务费代金券 
    //8-充值代金券 9-金豆券 10-一元购活动券 
    //11-道具代替劵
    //请求背包列表
    reqPackList() {

        WWW.Instance.CommonAPI(
            {
                web_class: Web_Prop_User_Prop_List,
                body: {
                    prop_type: 0,
                    limit: 20,
                    offset: 0
                }
            }
        ).then(
            (res: any) => {
                if (res.data.list?.length) {
                    this.refreshList(res.data.list);
                } else {
                    this.$null.active = true;
                }
            },
            (res: any) => {

            }
        )
    }
    refreshList(list: any) {
        list.forEach((item, index) => {
            let item_node: cc.Node = this.item_pool.GetNode();
            item_node.parent = this.$content;
            let item_sc: ItemMyPack = item_node.getComponent(ItemMyPack);
            item_sc.index = index;
            item_sc.onShow(item);
            item_sc.$button.on("click", this.onItemClick, this);
        });
    }
    //清理列表
    cleanList() {
        this.$content.children.forEach(item => {

            this.item_pool.BackNode(item);
        })
        this.$content.removeAllChildren();
    }
    onItemClick(button: cc.Button) {
        // let item_sc:ItemMall = button.node.getComponent(ItemMall);
        // console.log("购买",item_sc.index);
        let item_sc: ItemMyPack = button.node.getComponent(ItemMyPack);
        let index = item_sc.index;
        let item_data = Web_Prop_User_Prop_List.Response.data.list[index];
        let dialog_param:typeof UIBackDialog.type = null;
        switch (item_data.prop_type) {
            case 2:
                dialog_param = {
                    status: 2,
                    title:i18nMgr.Get("UIBackDiolg_title04"),
                    content: i18nMgr.Get("UIBackDiolg_textContent03").replace("{0}",item_data.prop_name),
                    texts: [i18nMgr.Get("UIBackDiolg_Cancel_02"), i18nMgr.Get("UIBackDiolg_Commit_02")],
                    //callbacks: [this.goWalletList, this.goCharge],
                    this: this
                    
                }

                break;
            case 3:
                break;
            case 4:
                break;
            case 5:
                break;
            case 6:
                break;
            case 7:
                break;
            case 8:
                break;
            case 9:
                break;
        }
    }
}
