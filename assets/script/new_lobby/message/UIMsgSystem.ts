import List from "../../common/List";
import ListEx from "../../common/ListEx";
import { UIDefine } from "../../define/UIDefine";
import { ClubCache } from "../../frame/data/club/ClubCache";
import { WebMsgMessageList, WebWww } from "../../net/https/WebRequest";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIComponent from "../../ui/UIComponent";
import ItemMsgSystem from "./ItemMsgSystem";
import { EnumMSG } from "./MyMessageModel";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMsgSystem extends BaseFormPlus {

    ///////////////////////引用声明////////////////////////
    $content: cc.Node = null;
    //$ItemMsgSystem: cc.Node = null;
    $Null: cc.Node = null;
    ////////////////////////////////////////////////////
    //item_pool: SimpleNodePool = null;
    protected lateLoad() {
        super.lateLoad();
        //this.item_pool = new SimpleNodePool(this.$ItemMsgSystem);
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

    click_item(button: cc.Button) {
        let item_sc = button.node.getComponent(ItemMsgSystem);
        if (item_sc.isLarge) {
            //开启完整信息显示
            console.log("打开完整信息");
            UIComponent.open(UIDefine.UIMsgSystemEx, button.node["obj"]);
        }
    }
    clearList() {
        this.$content.removeAllChildren();
    }

    reqMsgList(offset: number = 0) {
        // let tribe_id = ClubCache.tribe_id;

        // if (this._param.from == 2 || this._param.from.from == 1) tribe_id = 0;

        let club_id = 0;
        if (this._param.from == 1) club_id = ClubCache.club_id;

        WebWww.Instance.CommonAPI(
            {
                web_class: WebMsgMessageList,
                body: {
                    //clubID: ClubCache.club_id,
                    //TribeID: tribe_id,
                    msg_type: this._param.msg_type,
                    limit: 10,
                    offset: offset
                },
                club_id: club_id
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
        let show_obj = { data: item_data, type: this._param.msg_type == EnumMSG.MSG_System ? 0 : 1 };
        let click_obj = { name: this._param.name, isFromEx: true, data: item_data, type: this._param.msg_type == EnumMSG.MSG_System ? 0 : 1 }
        node["obj"] = click_obj;
        node.getComponent(ItemMsgSystem).onShow(show_obj);
        node.on("click", this.click_item, this);
    }

}
