import SimpleNodePool from "../../common/MyNodePool";
import { UIDefine } from "../../define/UIDefine";
import { i18nMgr } from "../../i18n/i18nMgr";
import {
    WebPropUserPropList,
    WebPropUserPropUsed,
    WWW,
} from "../../net/https/WebRequest";
import UIBackDialog from "../../ui/dialog/UIBackDialog";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIComponent from "../../ui/UIComponent";
import ItemMyPack from "./ItemMyPack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMyPack extends BaseFormPlus {
    //$ItemMall:cc.Node = null;
    $content: cc.Node = null;
    $Null: cc.Node = null;
    $ItemMyPack: cc.Node = null;
    /////////////////////////////////////////////
    item_pool: SimpleNodePool = null;

    lateLoad() {
        this.name = "UIMyPack";
        super.lateLoad();
        this.item_pool = new SimpleNodePool(this.$ItemMyPack);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.cleanList();
        this.$Null.active = false;
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
        WWW.Instance.CommonAPI({
            web_class: WebPropUserPropList,
            body: {
                prop_type: 0,
                limit: 20,
                offset: 0,
            },
        }).then(
            (res: any) => {
                if (res.data.list?.length) {
                    this.cleanList();
                    this.refreshList(res.data.list);
                } else {
                    this.$Null.active = true;
                }
            },
            (res: any) => {},
        );
    }
    refreshList(list: any) {
        list.forEach((item, index) => {
            let item_node: cc.Node = this.item_pool.GetNode();
            item_node.parent = this.$content;
            let item_sc: ItemMyPack = item_node.getComponent(ItemMyPack);
            item_sc.index = index;
            item_sc.onShow(item);
            item_sc.$button["index"] = index;
            item_sc.$button.on("click", this.onItemClick, this);
        });
    }
    //清理列表
    cleanList() {
        this.$content.children.forEach((item) => {
            this.item_pool.BackNode(item);
        });
        this.$content.removeAllChildren();
    }
    onItemClick(button: cc.Button) {
        // let item_sc:ItemMall = button.node.getComponent(ItemMall);
        // console.log("购买",item_sc.index);
        let index = button.node["index"];
        let item_data = WebPropUserPropList.Response.data.list[index];
        let dialog_param: typeof UIBackDialog.type = null;
        switch (item_data.prop_type) {
            case 1: //门票使用
                break;
            case 2: //实物
                dialog_param = {
                    cancelText: i18nMgr.Get("UIBackDiolg_Cancel_02"),
                    commitText: i18nMgr.Get("UIBackDiolg_Commit_02"),
                    knowText: i18nMgr.Get("UIBackDiolg_Konw_01"),
                    title: i18nMgr.Get("UIBackDiolg_title04"),
                    content: i18nMgr
                        .Get("UIBackDiolg_textContent03")
                        .replace(
                            "{0}",
                            item_data.game_prop?.prop_name ||
                                item_data.prop_name,
                        ),
                    info: item_data,
                    this: this,
                };
                UIComponent.open(UIDefine.UIBackDialog, dialog_param);
                break;
            case 3: //电话卡
                dialog_param = {
                    cancelText: i18nMgr.Get("UIBackDiolg_Cancel_02"),
                    commitText: i18nMgr.Get("UIBackDiolg_Commit_03"),
                    knowText: i18nMgr.Get("UIBackDiolg_Konw_02"),
                    title: i18nMgr.Get("UIBackDiolg_title03"),
                    content: i18nMgr
                        .Get("UIBackDiolg_textContent03")
                        .replace(
                            "{0}",
                            item_data.game_prop?.prop_name ||
                                item_data.prop_name,
                        ),
                    info: item_data,
                    this: this,
                };
                UIComponent.open(UIDefine.UIBackDialog, dialog_param);
                break;
            case 4: //购物
                dialog_param = {
                    cancelText: i18nMgr.Get("UIBackDiolg_Cancel_02"),
                    commitText: i18nMgr.Get("UIBackDiolg_Commit_04"),
                    knowText: i18nMgr.Get("UIBackDiolg_Konw_01"),
                    title: i18nMgr.Get("UIBackDiolg_title02"),
                    content: i18nMgr
                        .Get("UIBackDiolg_textContent03")
                        .replace(
                            "{0}",
                            item_data.game_prop?.prop_name ||
                                item_data.prop_name,
                        ),
                    info: item_data,
                    this: this,
                };
                UIComponent.open(UIDefine.UIBackDialog, dialog_param);
                break;
            case 5: //代金券
                dialog_param = {
                    cancelText: i18nMgr.Get("UIBackDiolg_Cancel_02"),
                    commitText: i18nMgr.Get("UIBackDiolg_Commit_05"),
                    //knowText: i18nMgr.Get("UIBackDiolg_Konw_01"),
                    title: i18nMgr.Get("UIBackDiolg_title05"),
                    content: i18nMgr
                        .Get("UIBackDiolg_textContent03")
                        .replace(
                            "{0}",
                            item_data.game_prop?.prop_name ||
                                item_data.prop_name,
                        ),
                    info: item_data,
                    this: this,
                };
                UIComponent.open(UIDefine.UIBackDialog, dialog_param);
                break;
            case 6: //线下门票
                break;
            case 7: //免服务费代金券
                this.reqUsed(item_data);
                break;
            case 8: //充值代金券
                break;
            case 9: //金豆券
                this.reqUsed(item_data);
                break;
            case 10: //一元购活动券
                this.reqUsed(item_data);
                break;
        }
    }
    reqUsed(item_data: any) {
        WWW.Instance.CommonAPI({
            web_class: WebPropUserPropUsed,
            body: {
                prop_id: item_data.prop_id, //道具id
                type: 0, //"道具类型(type):2-转金豆，3-转平台，4-转IM钱包"
                user_phone: "", //"电话号码"
                quantity: 1, //道具数量
            },
        }).then(
            (res: any) => {
                UIComponent.Instance.ToastLanguage(
                    "UIMine_Backpack_UsedSuccess",
                );
                //let text = prop_number.text.Substring(1);
                //prop_number.text = "x" + (int.Parse(text) - 1).ToString();
                //刷新 UIMyPack
                this.reqPackList();
            },
            (res: any) => {},
        );
    }
}
