import List from "../../common/List";
import ListEx from "../../common/ListEx";
import SimpleNodePool from "../../common/MyNodePool";
import { ClubCache } from "../../frame/data/club/ClubCache";
import { APIMsgMessageList, WWW } from "../../net/https/WebRequest";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import ItemMsgSystem from "./ItemMsgSystem";
import { EnumMSG } from "./MyMessageModel";


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
        this.initEX();
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
    }
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.title_label.i18NString = param.name;
        this.$Null.active = false;
        this.clearList();
        this.listEx.reset();
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
        //this.reqMsgList();
        this.listEx.dropRequest();
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
        //this.cc_ScrollView$list.scrollToTop(0);
    }


    reqMsgList(offset: number = 0) {
        WWW.Instance.CommonAPI(
            {
                web_class: APIMsgMessageList,
                body: {
                    clubID: ClubCache.club_id,
                    TribeID: ClubCache.tribe_id,
                    msg_type: this._param.msg_type,
                    limit: 10,
                    offset: offset
                },
            }
        ).then(
            (res: any) => {
                //this.refreshList(res.data.list);
                this.listEx.refresh(res.data.list, res.data.total);
            },
            (res: any) => {
                this.listEx.error();
            }
        )
    }
    ///////////////////////////////////////////////////////////
    private List$list: List = null;

    private listEx: ListEx = null;

    //初始化滚动列表的补充数据
    private initEX() {
        this.listEx = new ListEx({
            list: this.List$list,
            nullNode: this.$Null,//this.$Page0.getChildByName("Null"),
            this: this,
            request: this.reqMsgList
        });
    }
    //////////////////////////////////滚动节点渲染///////////////////////
    render_item(node: cc.Node, index: number) {
        let item_data = this.listEx.data[index];
        node.getComponent(ItemMsgSystem).onShow({ data: item_data, type: this._param.msg_type == EnumMSG.MSG_System ? 0 : 1 });
    }

}
