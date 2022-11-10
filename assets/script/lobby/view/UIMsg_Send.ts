import { GameCache } from "../../game/GameCache";
import WebImageHelper from "../../helper/WebImageHelper";
import ToastManager from "../../manager/ToastManager";
import { APIOrgClubUploadIcon } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import { LobbyControl } from "../control/LobbyControl";
import { UIClubModel } from "../labor/UIClubModel";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMsg_Send extends BaseForm {


    ebx_name: cc.EditBox = null;

    testStr = [
        "消息1",
        "测试测试",
        "消息1测试测试",
        "消息1",
        "消息1",
        "消息1测试测试测试试",
        "测试测试",
        "消息1",
        "消息1",
        "测试测试"
    ]

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
        Text_title.string = "消息推送";
        this.resetUI();

        let btn_send: cc.Node = this.getChildNodeOrComponent("btn_send")
        btn_send.on(cc.Node.EventType.TOUCH_END, this.onClickSend, this);


        let lbl_use : cc.Label = this.getChildNodeOrComponent("lbl_use", cc.Label);
        lbl_use.string = "0";

        let lbl_gold : cc.Label = this.getChildNodeOrComponent("lbl_gold", cc.Label);
        lbl_gold.string = "0";
    }

    resetUI() {
        let ebx_1 :cc.EditBox = this.getChildNodeOrComponent("ebx_1", cc.EditBox);
        ebx_1.string = "";
    }

    updateAutoView() {
        let panel_auto :cc.Node = this.getChildNodeOrComponent("panel_auto");
        panel_auto.removeAllChildren();
        let len = this.testStr.length;
        let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
        for (let i=0; i<len; i++) {
            let _cloneNode = cc.instantiate(panel_item);
            _cloneNode.parent = panel_auto;

            let item_lbl: any = _cloneNode.getChildByName("item_lbl").getComponent(cc.Label);
            item_lbl.string = this.testStr[i];
            item_lbl._forceUpdateRenderData();
        }
    }

    onChangeText(param) {
        let ebx_4 :cc.EditBox = this.getChildNodeOrComponent("ebx_4", cc.EditBox);
        let lbl_max : cc.Label = this.getChildNodeOrComponent("lbl_max", cc.Label);
        lbl_max.string = ebx_4.string.length + " / 200";
    }

    onClickSend() {

    }

}
