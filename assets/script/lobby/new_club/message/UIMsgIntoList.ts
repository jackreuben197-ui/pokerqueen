
import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import GC from "../../../frame/GameControl";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import WebHelper from "../../../net/https/WebHelper";
import { API_CLUB_APPLY_AUDIT, WWW } from "../../../net/https/WebRequest";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";
import { UIClubModel } from "../../labor/UIClubModel";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMsgIntoList extends BaseFormPlus {

    cc_ScrollView$Scroller: cc.ScrollView = null;
    $lbl_no: cc.Node = null;
    $panel_item: cc.Node = null;

    Result_Text = ["", "", "已通过", "已拒绝"]

    data: any = [];

    protected lateLoad(): void {
        super.lateLoad();
    }


    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        this.reqInfo();
    }

    reqInfo() {
        let info = {
            limit: 100,
            offset: 0,
            status: GC.message.enterType, //0 朋友桌 1 公会桌 2 我的
        }
        LobbyControl.getInstance().reqClubApplyList(ClubCache.club_id, info).then(
            (res: any) => {
                this.refreshListView(this.data = res.data.data);
            },
            (res) => {
            }
        )
    }

    refreshListView(data: {
        game_type?: number,
        room_id?: number,
        user_name?: string,
        user_random_id?: number,
        create_time?: string,
        bring_in?: number,
        status?: number,
        avatar?: string,
    }[]) {
        //GameType
        // data = [
        //     { game_type: 1, room_id: 111, user_name: "abc", user_id: 222, create_time: "2022-11-30T10:52:56Z", bring_in: 888, status: 2 },
        //     { game_type: 2, },
        //     { game_type: 3, },
        // ];
        this.$lbl_no.active = data.length == 0;
        // 有数据 刷新列表
        this.cc_ScrollView$Scroller.content.removeAllChildren();

        data.forEach((item, index) => {
            let item_node = cc.instantiate(this.$panel_item);
            item_node.x = 0;
            item_node.active = true;
            item_node.parent = this.cc_ScrollView$Scroller.content;
            item_node.getChildByName("game_type").getComponent(cc.Label).string = GC.message.GameType[item.game_type];
            item_node.getChildByName("room_id").getComponent(cc.Label).string = `${item.room_id}`;
            item_node.getChildByName("user_name").getComponent(cc.Label).string = `${item.user_name}`;
            item_node.getChildByName("user_id").getComponent(cc.Label).string = `ID:  ${item.user_random_id}`;
            item_node.getChildByName("create_time").getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(item.create_time);
            item_node.getChildByName("bring_in").getComponent(cc.Label).string = `${item.bring_in}`;
            item_node.getChildByName("btn_no").active = item.status == 0;
            item_node.getChildByName("btn_ok").active = item.status == 0;
            item_node.getChildByName("status").getComponent(cc.Label).string = this.Result_Text[item.status];
            item_node["index"] = index;
            WebImageHelper.SetHeadImage(item_node.getChildByName("head").getComponent(cc.Sprite), item.avatar);
            this.setButtonClick(item_node.getChildByName("btn_no"), this.noClick);
            this.setButtonClick(item_node.getChildByName("btn_ok"), this.okClick);
        })
    }
    noClick(button: cc.Button) {
        let index = button.node.parent["index"];
        let c_data = this.data[index];
        WWW.Instance.CommonAPI(
            ClubCache.club_id,
            {
                apply_id: c_data.id,
                audit_op: 3//2同意 3拒绝
            },
            API_CLUB_APPLY_AUDIT
        ).then(
            res => {
                this.reqInfo();
            },
            res => {

            }
        )
    }
    okClick(button: cc.Button) {
        let index = button.node.parent["index"];
        let c_data = this.data[index];
        WWW.Instance.CommonAPI(
            ClubCache.club_id,
            {
                apply_id: c_data.id,
                audit_op: 2//2同意 3拒绝
            },
            API_CLUB_APPLY_AUDIT
        ).then(
            res => {
                this.reqInfo();
            },
            res => {

            }
        )
    }

}
