import { executionAsyncResource } from "async_hooks";
import { UIDefine } from "../../define/UIDefine";
import { ClubCache } from "../../frame/data/club/ClubCache";
import { i18nMgr } from "../../i18n/i18nMgr";
import { APIMsgMessageList, Web_Msg_Message_Unread, WWW } from "../../net/https/WebRequest";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIComponent from "../../ui/UIComponent";
import ItemMyMessage from "./ItemMyMessage";
import MyMessageModel, { EnumMSG } from "./MyMessageModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMyMessage extends BaseFormPlus {
    @property([cc.SpriteFrame])
    icon_res = [];
    ///////////////////////引用声明////////////////////////
    $ItemMyMessage: cc.Node = null;
    $content: cc.Node = null;
    ////////////////////////////////////////////////////
    protected lateLoad() {
        super.lateLoad();
        this.initUI();
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
    }
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.refreshUI();
        this.reqUnreads();
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
    }
    initUI() {
        this.$content.children.forEach((item, index) => {
            let item_sc = item.getComponent(ItemMyMessage);
            item_sc.refreshIcon(this.icon_res[index]);
            item_sc.index = index;
            this.setButtonClick(item, this.onItemClick);
        })
    }
    refreshUI() {
        let from = this._param.from;
        let indexs: number[] = MyMessageModel.Instance.ui_show_from[from];
        this.$content.children.forEach((item, index) => {
            //过滤显示当前应该展示的条目
            if (~indexs.indexOf(index)) {
                item.active = true;
            } else {
                item.active = false;
            }

            if (indexs[index] == 5 && from == 1 && !this._param.apply) {
                item.active = false;
            }

            let item_sc = item.getComponent(ItemMyMessage);
            item_sc.refreshName(i18nMgr.Get(MyMessageModel.Instance.message_items[index].name));
            item_sc.refreshContent(i18nMgr.Get("MsgContentUnRead"), MyMessageModel.Instance.content_colors[0]);
        })
    }
    //刷新未读消息
    lateRefreshUI(data: any[]) {
        if (data?.length) {
            data.forEach(item => {
                let order = MyMessageModel.Instance.message_order[item.msg_main_type];
                let item_node = this.$content.children[order];
                let content = i18nMgr.Get("UIMine_MsgHasNoRead").replace("{0}", item.num);
                item_node.getComponent(ItemMyMessage).refreshContent(content, MyMessageModel.Instance.content_colors[1]);
            })
        }
    }
    //请求未读消息
    reqUnreads() {
        WWW.Instance.CommonAPI(
            {
                web_class: Web_Msg_Message_Unread,
            }
        ).then(
            (res: any) => {
                this.lateRefreshUI(res.data);
            },
            (res: any) => {

            }
        )
    }
    onItemClick(button: cc.Button) {
        let index = button.node.getComponent(ItemMyMessage).index;
        let item = MyMessageModel.Instance.message_items[index];
        switch (index) {
            case 0://系统消息
                UIComponent.open(UIDefine.UIMsgSystem, { msg_type: item.msg_type, name: item.name });
                break;
            case 1://钱包消息
                //this.reqMsgList(EnumMSG.MSG_Money);
                UIComponent.open(UIDefine.UIMsgSystem, { msg_type: item.msg_type, name: item.name });
                break;
            case 2://背包消息
                //this.reqMsgList(EnumMSG.MSG_Backpack);
                UIComponent.open(UIDefine.UIMsgSystem, { msg_type: item.msg_type, name: item.name });
                break;
            case 3://公会消息
                UIComponent.open(UIDefine.UIMsgSystem, { msg_type: item.msg_type, name: item.name });
                break;
            case 4://联盟消息
                UIComponent.open(UIDefine.UIMsgSystem, { msg_type: item.msg_type, name: item.name });
                break;
            case 5://带入申请
                UIComponent.open(UIDefine.UIMsgBring, { from: this._param.from, name: item.name });
                break;
        }
    }

    // export enum EnumMSG {
    //     MSG_Backpack = 1,//背包消息
    //     MSG_Club,//俱乐部
    //     MSG_Money,//钱包
    //     MSG_System,//系统
    //     MSG_League,//联盟
    //     MSG_ApplyList,//带入申请
    // }


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
                //club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {

            },
            (res: any) => {

            }
        )
    }
}
