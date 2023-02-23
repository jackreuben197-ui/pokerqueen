import SimpleNodePool from "../../common/MyNodePool";
import { ClubCache } from "../../frame/data/club/ClubCache";
import { i18nMgr } from "../../i18n/i18nMgr";
import { APIMsgMessageList, Web_Msg_Message_Unread, WWW } from "../../net/https/WebRequest";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import ItemMsgSystem from "./ItemMsgSystem";
import ItemMyMessage from "./ItemMyMessage";
import MyMessageModel, { EnumMSG } from "./MyMessageModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMsgSystem extends BaseFormPlus {

    ///////////////////////引用声明////////////////////////
    $content: cc.Node = null;
    $ItemMsgSystem: cc.Node = null;
    $Null: cc.Node = null;
    ////////////////////////////////////////////////////
    item_pool: SimpleNodePool = null;
    protected lateLoad() {
        super.lateLoad();
        this.item_pool = new SimpleNodePool(this.$ItemMsgSystem);
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
    }
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.title_label.i18NString = param.name;
        this.$Null.active = false;
        this.clearList();
        this.reqMsgList(param.msg_type);
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
    }
    initUI() {

    }
    refreshList(list: any[]) {
        this.clearList();
        if (list?.length) {
            list.forEach(item => {
                let item_node = this.item_pool.GetNode();
                let item_sc = item_node.getComponent(ItemMsgSystem);
                item_node.parent = this.$content;
                item_sc.onShow({ data: item, type: this._param.msg_type == EnumMSG.MSG_System ? 0 : 1 });
            })
        } else {
            this.$Null.active = true;
        }
    }
    // onItemClick(button: cc.Button) {
    //     //let index = button.node.getComponent(ItemMyMessage).index;
    // }
    clearList() {
        this.$content.children.forEach(item => {
            this.item_pool.BackNode(item);
        })
        this.$content.removeAllChildren();
    }


    reqMsgList(type: number) {
        WWW.Instance.CommonAPI(
            {
                web_class: APIMsgMessageList,
                body: {
                    clubID: ClubCache.club_id,
                    TribeID: ClubCache.tribe_id,
                    msg_type: type,
                    limit: 20,
                    offset: 0
                },
            }
        ).then(
            (res: any) => {
                this.refreshList(res.data.list);
            },
            (res: any) => {

            }
        )
    }
}
