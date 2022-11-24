import { eventNames } from "process";
import { EventName } from "../../config/EventName";
import GC from "../../frame/GameControl";
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

    @property(cc.EditBox)
    ebx_name: cc.EditBox = null;

    panel_dialog: cc.Node = null;

    clickType = 0; // 0 正常 1 开始 2 结束
    clickTime = 0;
    clickSender = null;

    testStr = [];

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

        this.panel_dialog = this.getChildNodeOrComponent("panel_dialog");
        this.panel_dialog.active = false;

        let btn_send: cc.Node = this.getChildNodeOrComponent("btn_send")
        btn_send.on(cc.Node.EventType.TOUCH_END, this.onClickSend, this);


        let lbl_use: cc.Label = this.getChildNodeOrComponent("lbl_use", cc.Label);
        lbl_use.string = "10";

        let lbl_gold: cc.Label = this.getChildNodeOrComponent("lbl_gold", cc.Label);
        lbl_gold.string = GC.data.club.info.displayGold.toString();

        let btn_close: cc.Node = this.getChildNodeOrComponent("btn_close")
        btn_close.on(cc.Node.EventType.TOUCH_END, this.onClickHide, this);

        let btn_ok: cc.Node = this.getChildNodeOrComponent("btn_ok")
        btn_ok.on(cc.Node.EventType.TOUCH_END, this.onClickOk, this);

        this.resetUI();

        this.updateAutoView();

        this.reqGetMsgList();

    }

    reqSetMsgTempLate(upStr, downStr) {
        let info = {
            template_name: upStr, //名称,
            content: downStr, //内容
        }
        LobbyControl.getInstance().reqSetMsgTempLate(info).then(
            (res) => {
                this.resetDialog();
                this.reqGetMsgList();
            },
            (res) => {
            }
        )
    }

    reqDelMsgTempLate(id) {
        let info = {
            id: id
        }
        LobbyControl.getInstance().reqDelMsgTempLate(info).then(
            (res) => {
                this.reqGetMsgList();
            },
            (res) => {
            }
        )
    }

    reqGetMsgList() {
        let info = {
            

        }
        LobbyControl.getInstance().reqGetMsgList(info).then(
            (res: any) => {
                this.testStr = res.data.data;
                let last = {
                    template_name: " + "
                }
                this.testStr.push(last);
                this.updateAutoView();
            },
            (res) => {
            }
        )
    }

    resetUI() {
        let ebx_4: cc.EditBox = this.getChildNodeOrComponent("ebx_4", cc.EditBox);
        ebx_4.string = "";

        this.resetDialog();
    }

    resetDialog() {
        let ebx_1: cc.EditBox = this.getChildNodeOrComponent("ebx_1", cc.EditBox);
        ebx_1.string = "";

        let ebx_2: cc.EditBox = this.getChildNodeOrComponent("ebx_2", cc.EditBox);
        ebx_2.string = "";

        let lbl_up: cc.Label = this.getChildNodeOrComponent("lbl_up", cc.Label);
        lbl_up.string = "0/8";

        let lbl_down: cc.Label = this.getChildNodeOrComponent("lbl_down", cc.Label);
        lbl_down.string = "0/60";

        this.panel_dialog.active = false;
    }

    update() {
        if (this.clickType == 0) {
            return;
        }

        this.clickTime = this.clickTime + 1;
        if (this.clickTime > 1 / 0.02) {
            this.clickType = 0;
            this.onClickShow(this.clickSender);
            this.clickSender = null;
        }
    }

    updateAutoView() {
        let panel_auto: cc.Node = this.getChildNodeOrComponent("panel_auto");
        panel_auto.removeAllChildren();
        let len = this.testStr.length;
        let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
        for (let i = 0; i < len; i++) {
            let _cloneNode = cc.instantiate(panel_item);
            _cloneNode.parent = panel_auto;

            let item_lbl: any = _cloneNode.getChildByName("item_lbl").getComponent(cc.Label);
            item_lbl.string = this.testStr[i].template_name;
            item_lbl._forceUpdateRenderData();
            _cloneNode.width = item_lbl.node.width + 150;

            _cloneNode["isShow"] = false;
            _cloneNode["isAdd"] = i == len - 1;
            _cloneNode["info"] = this.testStr[i];
            // _cloneNode.on(cc.Node.EventType.TOUCH_END, this.onClickMB, this);

            _cloneNode.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
                this.clickType = 1;
                this.clickTime = 0;
                this.clickSender = event;
            }, this);
            _cloneNode.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch) => {
                this.clickType = 0;
                this.clickSender = null;
            }, this);
            _cloneNode.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
                if (this.clickType == 0) {
                    this.clickSender = null;
                    return
                }
                this.clickType = 0;
                this.clickSender = null;
                let target = event.currentTarget;
                let isAdd = target.isAdd;
                if (isAdd) {
                    this.panel_dialog.active = true;
                    return;
                }
                let info = target.info;
                this.ebx_name.string = info.content;
            }, this);

            let item_close = _cloneNode.getChildByName("item_close");
            item_close["index"] = i;
            item_close["id"] = this.testStr[i].id;
            item_close.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        }
    }

    onChangeText(param) {
        let ebx_4: cc.EditBox = this.getChildNodeOrComponent("ebx_4", cc.EditBox);
        let lbl_max: cc.Label = this.getChildNodeOrComponent("lbl_max", cc.Label);
        lbl_max.string = ebx_4.string.length + " / 200";
    }

    onChangeUp(param) {
        let ebx_2: cc.EditBox = this.getChildNodeOrComponent("ebx_2", cc.EditBox);
        let lbl_up: cc.Label = this.getChildNodeOrComponent("lbl_up", cc.Label);
        lbl_up.string = ebx_2.string.length + "/8";
    }

    onChangeDown(param) {
        let ebx_1: cc.EditBox = this.getChildNodeOrComponent("ebx_1", cc.EditBox);
        let lbl_down: cc.Label = this.getChildNodeOrComponent("lbl_down", cc.Label);
        lbl_down.string = ebx_1.string.length + "/60";
    }

    async onClickSend() {
        if (this.ebx_name.string == "") {
            ToastManager.Instance.createToast("请输入内容");
            return;
        }
        await UIClubModel.mInstance.APIOrgSendMess({
            "content": this.ebx_name.string,
            "message_type": 2,
            "standings_user_id": 0,
            "game_round_id": 0,
            "amount": 1000
        })
        GC.data.user.info.gold = GC.data.club.info.displayGold - 10;
        let lbl_gold: cc.Label = this.getChildNodeOrComponent("lbl_gold", cc.Label);
        lbl_gold.string = GC.data.club.info.displayGold.toString();
        GC.notify.post(EventName.clubGoldChange);
        this.post(EventName.refreshMess)
        this.close();
    }

    onClickHide() {
        this.resetDialog();
    }

    onClickOk() {
        let ebx_1: cc.EditBox = this.getChildNodeOrComponent("ebx_1", cc.EditBox);
        let ebx_2: cc.EditBox = this.getChildNodeOrComponent("ebx_2", cc.EditBox);
        let upStr = ebx_2.string;
        let downStr = ebx_1.string;

        if (upStr == "") {
            ToastManager.Instance.createToast("请输入标题");
            return;
        }

        if (downStr == "") {
            ToastManager.Instance.createToast("请输入内容");
            return;
        }

        this.reqSetMsgTempLate(upStr, downStr);
        // let newList = [];
        // let len = this.testStr.length;
        // for (let i = 0; i < len; i++) {
        //     if (i != len - 1) {
        //         newList.push(this.testStr[i]);
        //     }
        // }
        // newList.push(upStr);
        // newList.push(this.testStr[len - 1]);
        // this.testStr = newList;
        // this.resetDialog();
        // this.updateAutoView();
    }

    onClickMB(event) {
        let target = event.currentTarget;
        let isAdd = target.isAdd;
        if (isAdd) {
            this.panel_dialog.active = true;
            return;
        }
        let info = target.info;
        this.ebx_name.string = info.content;
    }

    onClickShow(event) {
        let target = event.currentTarget;
        let isAdd = target.isAdd;
        if (isAdd) {
            this.panel_dialog.active = true;
            return;
        }
        let isShow = target.isShow;
        let item_close = target.getChildByName("item_close");
        item_close.active = !isShow;
        target.isShow = !isShow;
    }

    onClickClose(event) {
        let target = event.currentTarget;
        let id = target.id;

        this.reqDelMsgTempLate(id);
        // let newList = [];
        // let len = this.testStr.length;
        // for (let i = 0; i < len; i++) {
        //     if (i != index) {
        //         newList.push(this.testStr[i]);
        //     }
        // }
        // this.testStr = newList;
        // this.updateAutoView();
    }

}
