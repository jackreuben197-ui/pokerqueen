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
            // this.reqInfo(param.info.RoomID);
        }

    }

    reqInfo(roomId) {
        let info = {
            limit: 100,         //条目
            offset: 0,        //开始下标。例子（offset=0，limit=10，0-9。）
        }
        LobbyControl.getInstance().getRecordDetailInfo(roomId, info).then(
            (res) => {
                this.refreshListView(res);
            },
            (res) => {
            }
        )
    }

    refreshListView(data) {
       
    }

}
