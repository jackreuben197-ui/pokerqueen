import GC from "../../../frame/GameControl";
import { GameCache } from "../../../game/GameCache";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import { Web_Stats_User_Stats } from "../../../net/https/WebRequest";
import BaseForm from "../../../ui/form/BaseForm";
import { LobbyControl } from "../../control/LobbyControl";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIRecordInto extends BaseForm {


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
        Text_title.string = "带入申请";
        if (param && param.info) {
            this.reqInfo(param.info);
        }

    }

    reqInfo(param) {
        let data = param.data;
        if (data == null) {
            return;
        }
        let room_data = data.room_data;
        let info = {
            limit: 100,
            offset: 0,
            // room_id: room_data.room_id,
            room_id: 90785674
        }
        LobbyControl.getInstance().reqFriendAppleList(info).then(
            (res) => {
                this.refreshListView(res);
            },
            (res) => {
            }
        )
    }

    //  status // 状态 1 待审批，2通过，3拒绝，4取消
    refreshListView(param) {
        let data = param.data;
        let len = data.total;
        let lbl_no : cc.Node = this.getChildNodeOrComponent("lbl_no");
        lbl_no.active = len == 0;
        if (data == null || data.total == 0) {
            return;
        }
        let records = data.data.records;
        
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
            // _cloneNode.getChildByName("lbl_next").getComponent(cc.Label).string = "第" + info.hand_num + "手";
            // let score = info.change;
            // let scLbl = _cloneNode.getChildByName("lbl_score").getComponent(cc.Label);
            // LobbyControl.getInstance().setWinColor(scLbl, score);

            // _cloneNode["index"] = i;
            // _cloneNode.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)
        }
        scrollView.content.height = panel_item.height * (len+2);
    }

}
