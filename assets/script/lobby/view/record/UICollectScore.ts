import { UIDefine } from "../../../define/UIDefine";
import GGEvent from "../../../event/GGEvent";
import GC from "../../../frame/GameControl";
import { GameCache } from "../../../game/GameCache";
import { HistoryInfoData } from "../../../game/UITexasHistoryComponent";
import { StringHelper } from "../../../helper/StringHelper";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import { Web_Stats_User_Stats } from "../../../net/https/WebRequest";
import UIDialogComponent from "../../../ui/dialog/UIDialogComponent";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";
import { UIClubModel } from "../../labor/UIClubModel";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UICollectScore extends BaseForm {

    _fromParm = null;
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
        this._fromParm = param
        let Text_title = this.getChildNodeOrComponent("Text_title", cc.Label);
        Text_title.string = "收藏牌谱";

        this.reqInfo();
    }


    /**
     * 注册广播事件
     */
    protected regiterDispatchEvent() {
        this.listen(GGEvent.UPD_CARD_SCORE, this.reqInfo);
    }

    reqInfo() {
        let info = {
            limit: 100,
            offset: 0,
        }
        LobbyControl.getInstance().reqRoundList(info).then(
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
        let lbl_no: cc.Node = this.getChildNodeOrComponent("lbl_no");
        lbl_no.active = len == 0;
        // 有数据 刷新列表
        let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
        let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        scrollView.content.removeAllChildren();
        for (let i = 0; i < len; i++) {
            let _cloneNode = cc.instantiate(panel_item);
            _cloneNode.x = 0;
            _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
            _cloneNode.parent = scrollView.content;

            let item_sv = _cloneNode.getChildByName("sv_item").getComponent(cc.ScrollView);

            let info = records[i];

            let nameStr = GC.data.languageTemp.temp.getName(info.name);
            item_sv.content.getChildByName("lbl_deskName").getComponent(cc.Label).string = nameStr;
            item_sv.content.getChildByName("lbl_next").getComponent(cc.Label).string = "第" + info.hand_num + "手";
            let score = info.change;
            let scLbl = item_sv.content.getChildByName("lbl_score").getComponent(cc.Label);
            LobbyControl.getInstance().setWinColor(scLbl, score, true);

            _cloneNode["index"] = i;
            // item_sv.content.width = 2000;
            item_sv.content.x = 0;

            // item_sv.node.on("scrolling", this.onScrolling, this);
            let btn_dele = item_sv.content.getChildByName("btn_dele");

            item_sv.content["info"] = info;
            item_sv.content.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)

            btn_dele["data"] = info;
            btn_dele.on(cc.Node.EventType.TOUCH_END, this.onClickCancle, this)
        }
        scrollView.content.height = panel_item.height * (len + 5);
    }

    onScrolling(event) {

    }

    onClickCancle(event: any) {
        let target: any = event.currentTarget;
        let data = target.data;
        let info = {
            room_id: data.room_id, // 普通牌局，
            room_unique_id: data.room_unique_id, // room唯一标识
            hand_num: data.hand_num, // 手数
        }
        LobbyControl.getInstance().reqRemoveRound(info).then(
            (res) => {
                this.reqInfo();
            },
            (res) => {
            }
        )
    }

    onClickItem(event) {
        let node = event.target;
        let info = node.info;
        let e = { info: info }

        if (this._fromParm && this._fromParm.Name == UIDefine.UILaborPlayViewForm.Name) {
            UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
                {
                    type: UIDialogComponent.DialogType.CommitCancel,
                    title: "提示",
                    content: '即将分享到聊天中',
                    contentCommit: "确定",
                    contentCancel: "取消",
                    actionCommit: () => {
                        UIClubModel.mInstance.APIOrgSendMess(
                            {
                                "content": JSON.stringify(e),
                                "message_type": 4,
                                "standings_user_id": 0,
                                "game_round_id": info.room_id,
                            }
                        )
                    },
                    noAnimation: true,
                });
            return
        }

        UIComponent.open(UIDefine.UIMine_Poker, { info: e });
    }

}
