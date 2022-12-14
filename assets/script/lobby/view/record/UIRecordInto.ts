import ComFormTitle from "../../../common/ComFormTitle";
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


    private comFormTitle: ComFormTitle = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }

    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);

        // this.comFormTitle.initData('', this);

        // this.comFormTitle.title.string = "带入申请";

        // let Text_title = this.getChildNodeOrComponent("Text_title", cc.Label);
        // Text_title.string = "带入申请";
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
            room_id: room_data.room_id,
            // room_id: 90785674
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
        let records = data.data;
        
        // 有数据 刷新列表
        let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
        let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        scrollView.content.removeAllChildren();
        let _gameTypeName = ["NLH", "PLO4", "PLO5", "PLO6", "6+"];
        for (let i=0; i<len; i++) {
            let _cloneNode = cc.instantiate(panel_item);
            _cloneNode.x = 0;
            _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
            _cloneNode.parent = scrollView.content;

            let info = records[i];

            _cloneNode.getChildByName("lbl_deskName").getComponent(cc.Label).string = info.room_name;

            _cloneNode.getChildByName("lbl_nlh").getComponent(cc.Label).string = _gameTypeName[info.game_type];
            

            let img_head: cc.Sprite = _cloneNode.getChildByName("img_head").getComponent(cc.Sprite);
            // img_head.node.active =false;
            WebImageHelper.SetUrlImage(img_head, info.avatar).then(()=>{
                img_head.node.active =true;
            });

            _cloneNode.getChildByName("lbl_id").getComponent(cc.Label).string = "ID: " + info.user_random_id;

            _cloneNode.getChildByName("lbl_time").getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(info.create_time);

            let label = _cloneNode.getChildByName("lbl_score").getComponent(cc.Label)
            LobbyControl.getInstance().setWinColor(label, info.bring_in);

            let str = "";
            if (info.status == 1) {
                str = "待审批";
            } else if (info.status == 2) {
                str = "已通过";
            } else if (info.status == 3) {
                str = "已拒绝";
            } else if (info.status == 3) {
                str = "已取消";
            }
            _cloneNode.getChildByName("lbl_status").getComponent(cc.Label).string = str;
        }
        scrollView.content.height = panel_item.height * (len+5);
    }

}
