import SimpleNodePool from "../../common/MyNodePool";
import { GetGameTypeName } from "../../config/GameConfig";
import { ClubCache } from "../../frame/data/club/ClubCache";
import { GameCache } from "../../game/GameCache";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { API_CLUB_APPLY_AUDIT, API_CLUB_APPLY_LIST, Web_Me_Apply, Web_RoomSitApplyAudit, Web_RoomSitApplyRecords, WWW } from "../../net/https/WebRequest";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIComponent from "../../ui/UIComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMsgBring extends BaseFormPlus {

    ///////////////////////引用声明////////////////////////
    $content: cc.Node = null;
    $ItemMsgBring: cc.Node = null;
    $Null: cc.Node = null;
    ////////////////////////////////////////////////////

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
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
        this.reqMsgList();
    }
    refreshList(data: any[]) {
        this.clearList();
        if (data?.length) {
            data.forEach((item, index) => {
                let item_node = this.item_pool.GetNode();
                item_node.parent = this.$content;
                item_node["data"] = item;
                item_node["index"] = index;
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

        let index = node["index"];

        this.setChildVisible(node, "bg", index % 2 == 0);

        this.setChildLabel(node, "label_title", `<color=#FEEC8E>${GetGameTypeName(data)}</color><color=#757CAB> ID：${data.room_id}</color>`);

        this.setChildVisible(node, "room_type/club", data.origin_type == 3);
        this.setChildVisible(node, "room_type/friend", data.origin_type == 4);

        this.setChildLabel(node, "room_type/label_room", data.sender_name);


        this.setChildLabel(node, "label_nick", data.user_name);
        this.setChildLabel(node, "label_id", `ID：${data.user_random_id}`);
        this.setChildLabel(node, "label_bring", StringHelper.GetLongString(data.bring_in));
        this.setChildLabel(node, "label_time", TimeHelper.UTCToLocal(data.create_time));

        WebImageHelper.SetHeadImage(node.getChildByName("head").getComponent(cc.Sprite), data.avatar);

        switch (data.status) {
            case 1://待审核
                this.setChildVisible(node, "refuse", true);
                this.setChildVisible(node, "agree", true);
                this.setChildVisible(node, "label_status", false);
                this.setChildButtonClick(node, "refuse", this.click_refuse);//this.reqApplyDeal.bind(this, data, 3));
                this.setChildButtonClick(node, "agree", this.click_agree);//this.reqApplyDeal.bind(this, data, 2));
                break;
            case 2:// 审核通过
                this.setChildVisible(node, "refuse", false);
                this.setChildVisible(node, "agree", false);
                this.setChildVisible(node, "label_status", true);
                this.setChildLabel(node, "label_status", `<color=#B0FFAE>${i18nMgr.Get("UIClub_AuditRecords_ok")}</color>`);
                break;
            case 4:// 取消
                this.setChildVisible(node, "refuse", false);
                this.setChildVisible(node, "agree", false);
                this.setChildVisible(node, "label_status", true);
                this.setChildLabel(node, "label_status", `<color=#B0FFAE>${i18nMgr.Get("adaptation10013")}</color>`);
                break;
            case 5:// 自动拒绝
                this.setChildVisible(node, "refuse", false);
                this.setChildVisible(node, "agree", false);
                this.setChildVisible(node, "label_status", true);
                this.setChildLabel(node, "label_status", `<color=#B0FFAE>${i18nMgr.Get("UIClub_AuditRecords_auto")}</color>`);
                break;
            default://已拒绝 3
                this.setChildVisible(node, "refuse", false);
                this.setChildVisible(node, "agree", false);
                this.setChildVisible(node, "label_status", true);
                this.setChildLabel(node, "label_status", `<color=#FF7C7C>${i18nMgr.Get("UIClub_AuditRecords_no")}</color>`);
                break;
        }
    }

    clearList() {
        this.$content.children.forEach(item => {
            this.item_pool.BackNode(item);
        })
        this.$content.removeAllChildren();
    }
    click_refuse(button: cc.Button) {
        if (this._param.from == 2) return;
        let data = button.node.parent["data"];
        this.reqApplyDeal(data, 3);
    }
    click_agree(button: cc.Button) {
        if (this._param.from == 2) return;
        let data = button.node.parent["data"];
        this.reqApplyDeal(data, 2);
    }

    reqApplyDeal(data, op) {
        //op 2通过 3拒绝
        let web_class = null;
        let club_id = 0;
        let body = {
            "apply_id": data.id,
            "audit_op": op
        }
        if (data.origin_type == 4) {
            web_class = Web_RoomSitApplyAudit;
        } else {
            web_class = API_CLUB_APPLY_AUDIT;
            club_id = data.club_id;

        }
        WWW.Instance.CommonAPI(
            {
                web_class: web_class,
                body: body,
                club_id: club_id
            }
        ).then(
            (res: any) => {

                UIComponent.Instance.ToastLanguage("Uiclubrechargeconfirmordersuccessfully");
                this.reqMsgList();
                GameCache.Instance.CurGame?.UpdateMsgBtnSprite();
            },
            (res: any) => {

            }
        )
    }

    reqMsgList() {
        let from = this._param.from;
        let web_class = null;
        let club_id = 0;
        let body: any = null;
        switch (from) {
            case 0://朋友桌
                web_class = Web_RoomSitApplyRecords;
                body = {
                    "limit": 10,
                    "offset": 0,
                    "status": 0 //0-all，1-待审批，2-通过，3-拒绝，4-取消
                }
                break;
            case 1://公会桌
                web_class = API_CLUB_APPLY_LIST;
                club_id = ClubCache.club_id;
                body = {
                    "limit": 10,
                    "offset": 0,
                }
                break;
            case 2://我的
                web_class = Web_Me_Apply;
                body = {
                    "limit": 10,
                    "offset": 0,
                }
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
                this.refreshList(null);
            }
        )
    }
}
