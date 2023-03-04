import SimpleNodePool from "../../common/MyNodePool";
import { GetGameTypeName, TextColor } from "../../config/GameConfig";
import { ClubCache } from "../../frame/data/club/ClubCache";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { APIMsgMessageList, APIOrgFriendApplyDeal, APIOrgFriendApplyList, API_CLUB_APPLY_AUDIT, API_CLUB_APPLY_LIST, Web_Me_Apply, Web_Msg_Message_Unread, WWW } from "../../net/https/WebRequest";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import ItemMsgSystem from "./ItemMsgSystem";
import ItemMyMessage from "./ItemMyMessage";
import MyMessageModel, { EnumMSG } from "./MyMessageModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMsgBring extends BaseFormPlus {

    ///////////////////////引用声明////////////////////////
    $content: cc.Node = null;
    $ItemMsgBring: cc.Node = null;
    $Null: cc.Node = null;
    ////////////////////////////////////////////////////
    Status_Texts = {
        2: { text: "UIClub_RoomSitApplyRecords_ok", color: TextColor.Color5 },
        3: { text: "UIClub_RoomSitApplyRecords_no", color: TextColor.Color6 },
    }
    item_pool: SimpleNodePool = null;
    protected lateLoad() {
        super.lateLoad();
        this.item_pool = new SimpleNodePool(this.$ItemMsgBring);
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
    }
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.title_label.i18NString = param.name;
        this.$Null.active = false;
        this.clearList();
        this.reqMsgList();
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
    }
    refreshList(data: any[]) {
        this.clearList();
        if (data?.length) {
            data.forEach(item => {
                let item_node = this.item_pool.GetNode();
                item_node.parent = this.$content;
                item_node["data"] = item;
                this.refreshItem(item_node, item);
            })
        } else {
            this.$Null.active = true;
        }
    }

    refreshItem(node, data) {

        // {
        //     "id": 4,
        //     "room_id": 95077866,
        //     "club_id": 0,
        //     "origin_type": 0, // 1 平台，2 联盟，3 公会 4 朋友桌
        //     "room_name": "公会普通房间-内部桌-1",
        //     "room_type": 0,
        //     "game_type": 0,
        //     "poker_type": 0,
        //     "small_blind": 1000,
        //     "roomers": 0,
        //     "play_duration": 1800,
        //     "user_id": 8350,
        //     "user_random_id": 97430658,
        //     "user_name": "Player",
        //     "avatar": "http://static.awanptesting.com/image-avatar/98777802-kxnZl.png",
        //     "bring_in": 10000,
        //     "status": 1,
        //     "create_time": "2022-11-30T10:52:56Z"
        //   }
        //"origin_type": 0, // 1 平台，2 联盟，3 公会 4 朋友桌 
        // status 状态 1:申请中 2通过 3拒绝
        this.setChildLabel(node, "label_gametype", GetGameTypeName(data));
        this.setChildLabel(node, "label_roomid", data.room_id);
        this.setChildLabel(node, "label_nick", data.user_name);
        this.setChildLabel(node, "label_id", data.user_random_id);
        this.setChildLabel(node, "label_bring", StringHelper.GetLongString(data.bring_in));
        this.setChildLabel(node, "label_time", TimeHelper.UTCToLocal(data.create_time));
        this.setChildVisible(node, "label_status", data.status > 1);
        this.setChildLabel(node, "label_status", i18nMgr.Get(this.Status_Texts[data.status].text));
        this.setChildLabelColor(node, "label_status", this.Status_Texts[data.status].color);

        this.setChildVisible(node, "refuse", data.status == 1);
        this.setChildVisible(node, "agree", data.status == 1);

        this.setChildButtonClick(node, "refuse", this.onRefuseClick);
        this.setChildButtonClick(node, "agree", this.onAgreeClick);



        WebImageHelper.SetHeadImage(node.getChildByName("head").getComponent(cc.Sprite), data.avatar);


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
    onRefuseClick(button: cc.Button) {
        let data = button.node.parent["data"];
        this.reqApplyDeal(data, 2);
    }
    onAgreeClick(button: cc.Button) {
        let data = button.node.parent["data"];
        this.reqApplyDeal(data, 1);
    }


    reqApplyDeal(data, op) {

        //op 1-同意;2-拒绝

        let web_class = null;
        let body = {
            "apply_id": data.user_id,
            "audit_op": op
        }
        if (data.origin_type == 4) {
            web_class = APIOrgFriendApplyDeal;
        } else {
            web_class = API_CLUB_APPLY_AUDIT;
        }

        WWW.Instance.CommonAPI(
            {
                web_class: web_class,
                body: body,
            }
        ).then(
            (res: any) => {
                //this.refreshList(res.data.data);
                this.reqMsgList();
            },
            (res: any) => {

            }
        )
    }

    reqMsgList() {
        let from = this._param.from;
        let web_class = null;
        let club_id = 0;
        let body: any = {
            "limit": 10,
            "offset": 0,
            "status": from
        }
        switch (from) {
            case 0://朋友桌
                web_class = APIOrgFriendApplyList;
                break;
            case 1://公会卓
                web_class = API_CLUB_APPLY_LIST;
                club_id = ClubCache.club_id;
                break;
            case 2://我的
                web_class = Web_Me_Apply;
                break;
        }

        WWW.Instance.CommonAPI(
            {
                web_class: web_class,
                body: body,
                club_id: club_id
            }
        ).then(
            (res: any) => {
                this.refreshList(res.data.data);
            },
            (res: any) => {

            }
        )
    }
}
