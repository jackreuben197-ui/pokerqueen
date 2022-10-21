import { GameCache } from "../../../game/GameCache";
import TimeHelper from "../../../helper/TimeHelper";
import { Web_Stats_User_Stats } from "../../../net/https/WebRequest";
import BaseForm from "../../../ui/form/BaseForm";
import { LobbyControl } from "../../control/LobbyControl";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIRecordDetail extends BaseForm {


    protected lateLoad() {
        super.lateLoad();
    }


    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: BaseForm): void {
        super.onShow(param, fromUI);
        let Text_title = this.getChildNodeOrComponent("Text_title", cc.Label);
        Text_title.string = "牌桌名称+ID";
        this.refreshListView();
        if (param && param.info) {
            this.reqInfo(param.info.RoomID);
        }
    }

    reqInfo(roomId) {
        let info = {
            limit: 100,         //条目
            offset: 0,        //开始下标。例子（offset=0，limit=10，0-9。）
        }
        LobbyControl.getInstance().getRecordDetailInfo(roomId, info).then(
            (res) => {
            },
            (res) => {
            }
        )
    }

    refreshListView() {
        // 有数据 刷新列表
        let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
        let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        scrollView.content.removeAllChildren();
        for (let i=0; i<10; i++) {
            let _cloneNode = cc.instantiate(panel_item);
            _cloneNode.x = 0;
            _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
            _cloneNode.parent = scrollView.content;

            _cloneNode.getChildByName("lbl_rank").getComponent(cc.Label).string = i.toString();
        }
        scrollView.content.height = panel_item.height * 12;
    }

}
