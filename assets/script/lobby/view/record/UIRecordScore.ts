import { UIDefine } from "../../../define/UIDefine";
import GC from "../../../frame/GameControl";
import { GameCache } from "../../../game/GameCache";
import { HistoryInfoData } from "../../../game/UITexasHistoryComponent";
import { StringHelper } from "../../../helper/StringHelper";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import { Web_Stats_User_Stats } from "../../../net/https/WebRequest";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIRecordScore extends BaseForm {


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
        if (param && param.info) {
            this.reqInfo(param.info);
        }

    }

    reqInfo(data) {
        let roomData = data.data.room_data;
        let info = {
            room_id: roomData.room_id,         
            match_id: 0,     
            limit: roomData.limit,   
            offset: roomData.offset,
            type: 0,   
            gametype: roomData.game_type,   
        }
        LobbyControl.getInstance().getRecordHandInfo(info).then(
            (res) => {
                this.refreshListView(res);
            },
            (res) => {
            }
        )
    }

    refreshListView(data) {
        let records = data.data.records;
        let len = records.length;
        this.getChildNodeOrComponent("lbl_total", cc.Label).string = "共计" + len + "手";
        let lbl_no : cc.Node = this.getChildNodeOrComponent("lbl_no");
        lbl_no.active = len == 0;
        // 有数据 刷新列表
        let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
        let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        scrollView.content.removeAllChildren();
        for (let i=0; i<len; i++) {
            let _cloneNode = cc.instantiate(panel_item);
            _cloneNode.x = 0;
            _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
            _cloneNode.parent = scrollView.content;

            let info = records[i];

            let nameStr = GC.data.languageTemp.temp.getName(info.name);
            _cloneNode.getChildByName("lbl_deskName").getComponent(cc.Label).string = nameStr;
            _cloneNode.getChildByName("lbl_next").getComponent(cc.Label).string = "第" + info.hand_num + "手";
            let score = info.change;
            let scLbl = _cloneNode.getChildByName("lbl_score").getComponent(cc.Label);
            LobbyControl.getInstance().setWinColor(scLbl, score);

            _cloneNode["index"] = i;
            _cloneNode["info"] = {
                data: data,
                info: info
            };
            _cloneNode.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)
        }
        scrollView.content.height = panel_item.height * (len+2);
    }

    onClickItem(event) {
        let node = event.target;
        let info = node.info;
        UIComponent.open(UIDefine.UIMine_Poker, {info : info});
    }

}
