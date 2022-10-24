import { UIDefine } from "../../../define/UIDefine";
import { GameCache } from "../../../game/GameCache";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import { Web_Stats_User_Stats } from "../../../net/https/WebRequest";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIRecordDetail extends BaseForm {

    respInfo: any = null;

    protected lateLoad() {
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
        let Text_title = this.getChildNodeOrComponent("Text_title", cc.Label);
        Text_title.string = "牌桌名称+ID";
        if (param && param.info) {
            this.reqInfo(param.info.RoomID);
        }
        let panel_up1: cc.Node = this.getChildNodeOrComponent("panel_up1");
        panel_up1.on(cc.Node.EventType.TOUCH_END, this.onClickScore, this)

        let panel_up2: cc.Node = this.getChildNodeOrComponent("panel_up2");
        panel_up2.on(cc.Node.EventType.TOUCH_END, this.onClickInto, this)
    }

    onClickScore() {
        UIComponent.open(UIDefine.UIRecordScore, {info: this.respInfo});
    }

    onClickInto() {
        UIComponent.open(UIDefine.UIRecordInto);
    }

    reqInfo(roomId) {
        let info = {
            limit: 100,         //条目
            offset: 0,        //开始下标。例子（offset=0，limit=10，0-9。）
        }
        LobbyControl.getInstance().getRecordDetailInfo(roomId, info).then(
            (res) => {
                this.respInfo = res;
                this.refreshUpUI(res);
                this.refreshListView(res);
            },
            (res) => {
            }
        )
    }

    refreshUpUI(data) {
        let roomData = data.data.room_data;
        let user_list = roomData.user_list;
        let ts = Date.parse(roomData.end_time);
        let date = new Date(ts);
        let dateStr = TimeHelper._zeroNum(date.getHours()) + ":" + TimeHelper._zeroNum(date.getMinutes());
        let timeStr = `${date.getMonth() + 1}` + "/" + `${date.getDate()}` + " " + dateStr;
        this.getChildNodeOrComponent("lbl_time", cc.Label).string = timeStr;
        let sbStr = `${roomData.blind}/${roomData.blind * 2}`
        this.getChildNodeOrComponent("lbl_sb", cc.Label).string = sbStr;
        let longStr = LobbyControl.getInstance().getLongTimeStr(roomData.player_duration);
        this.getChildNodeOrComponent("lbl_long", cc.Label).string = longStr;
        let lbl_nickname: cc.Node = this.getChildNodeOrComponent("lbl_nickname")
        lbl_nickname.active = false;
        let lbl_club: cc.Node = this.getChildNodeOrComponent("lbl_club")
        lbl_club.active = false;
        let lbl_desk: cc.Node = this.getChildNodeOrComponent("lbl_desk")
        lbl_desk.active = false;

        let len = user_list.length;
        let node1: cc.Node = this.getChildNodeOrComponent("node1")
        let node2: cc.Node = this.getChildNodeOrComponent("node2")
        let node3: cc.Node = this.getChildNodeOrComponent("node3")
        let refreshHead = function(nodeInfo, node) {
            let img_head = node.getChildByName("img_head");
            let lbl_name = node.getChildByName("lbl_name");
            WebImageHelper.SetHeadImage(img_head.getComponent(cc.Sprite), nodeInfo.avatar);
            lbl_name.getComponent(cc.Label).string = nodeInfo.nick_name;
        }
        if (len == 1) {
            node1.active = false;
            node2.active = true;
            node3.active = false;
            refreshHead(user_list[0], node2);
        } else if (len == 2) {
            node1.active = true;
            node2.active = true;
            node3.active = false;
            refreshHead(user_list[0], node2);
            refreshHead(user_list[1], node1);
        } else if (len >= 3) {
            node1.active = true;
            node2.active = true;
            node3.active = true;
            refreshHead(user_list[0], node2);
            refreshHead(user_list[1], node1);
            refreshHead(user_list[2], node3);
        } else {
            node1.active = false;
            node2.active = false;
            node3.active = false;
        }

        let score = 0;
        let scoreStr = "";
        user_list.forEach(element => {
            if (element.user_random_id == GameCache.Instance.nUserId) {
                score = element.finally_game_results;
            }
        });
        scoreStr = score.toString();
        if (score > 0) {
            scoreStr = "+" + score.toString();
        }
        LobbyControl.getInstance().setWinColor(this.getChildNodeOrComponent("lbl_record_num", cc.Label), score);

        this.getChildNodeOrComponent("lbl_total_num", cc.Label).string = roomData.room_total_hand_num.toString();

        this.getChildNodeOrComponent("lbl_gold_num", cc.Label).string = roomData.all_bring_in.toString();
    

        let lbl_bx_score = this.getChildNodeOrComponent("lbl_bx_score", cc.Label);
        LobbyControl.getInstance().setWinColor(lbl_bx_score, roomData.insurance_total);
    }

    refreshListView(data) {
        let roomData = data.data.room_data;
        let user_list = roomData.user_list;
        let len = user_list.length;
        // 有数据 刷新列表
        let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
        let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        scrollView.content.removeAllChildren();
        for (let i=0; i<len; i++) {
            let _cloneNode = cc.instantiate(panel_item);
            _cloneNode.x = 0;
            _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
            _cloneNode.parent = scrollView.content;

            _cloneNode.getChildByName("lbl_rank").getComponent(cc.Label).string = (i+1).toString();
        
            let info = user_list[i];
            let head = _cloneNode.getChildByName("img_head").getComponent(cc.Sprite);
            WebImageHelper.SetHeadImage(head, info.avatar);
            _cloneNode.getChildByName("item_name").getComponent(cc.Label).string = info.nick_name;
            _cloneNode.getChildByName("item_gold").getComponent(cc.Label).string = info.bring_in;
            let score = info.finally_game_results;
            let scLbl = _cloneNode.getChildByName("item_score").getComponent(cc.Label);
            LobbyControl.getInstance().setWinColor(scLbl, score);

            let img_line = _cloneNode.getChildByName("img_line");
            img_line.active = i != len - 1;
        }
        scrollView.content.height = panel_item.height * (len+2);
    }

}
