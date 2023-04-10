import List from "../common/List";
import ListEx from "../common/ListEx";
import { StringHelper } from "../helper/StringHelper";
import { i18nMgr } from "../i18n/i18nMgr";
import { WWW, Web_Room_Center_Mtt_Rooms } from "../net/https/WebRequest";
import LobbySession from "../session/LobbySession";
import UIBasePlus from "../ui/UIBasePlus";
import { UIMTTModel } from "./UIMTTModel";




const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMTTDetail_Desk extends UIBasePlus {

    $top_desk: cc.Node = null;

    $scroller_desk: cc.Node = null;

    $null_desk: cc.Node = null;

    mtt_detail: any;

    isInit: boolean = false;

    onShow(param: any = null): void {
        super.onShow(param);
        this.mtt_detail = param;
        console.log("onShow UIMTTDetail_Reward");
        if (!this.isInit) {
            this.isInit = true;
            this.initEX();
        }
        this.refreshTop();
        this.listEx.reset();
        this.listEx.dropRequest();
    }
    refreshTop(res?: any) {
        if (res) {
            this.$top_desk.children[1].getComponent(cc.Label).string = StringHelper.Format(i18nMgr.Get("MTT_Desk_Num"), [res.data.records.length]);

        } else {

            this.$top_desk.children[0].getComponent(cc.RichText).string = StringHelper.Format(i18nMgr.Get("MTT_State_DeskPlayerCount"), [this.mtt_detail.mtt.seat_count]);
            this.$top_desk.children[1].getComponent(cc.Label).string = '';
        }
    }

    reqList() {

        WWW.Instance.CommonAPI(
            {
                web_class: Web_Room_Center_Mtt_Rooms,
                api_id: this.mtt_detail.mtt.match_id
            }
        ).then(
            (res: any) => {

                this.refreshTop(res);
                this.listEx.refresh(res.data.records, res.data.total);
            },
            (res: any) => {

            }
        )
    }
    ////////////////////////////////////List/////////////////////////////
    private listEx: ListEx = null;

    //初始化滚动列表的补充数据
    private initEX() {
        this.listEx = new ListEx({
            list: this.$scroller_desk.getComponent(List),
            nullNode: this.$null_desk,
            this: this,
            request: this.reqList
        });
    }
    //滚动节点渲染
    render_item(node: cc.Node, index: number) {

        let data = this.listEx.data[index];

        this.setChildLabel(node, "table", data.rid);
        this.setChildLabel(node, "player", data.roomers.length);
        this.setChildLabel(node, "min", data.rid);
        this.setChildLabel(node, "max", data.rid);


        if (data.roomers != null && data.roomers.length == 1) {
            this.setChildLabel(node, "min", data.roomers[0].chip / 100);
            this.setChildLabel(node, "max", data.roomers[0].chip / 100);
        }
        else if (data.roomers != null && data.roomers.length > 1) {

            this.setChildLabel(node, "min", this.GetMaxMinChipByPlayerList(data.roomers)[0] / 100);
            this.setChildLabel(node, "max", this.GetMaxMinChipByPlayerList(data.roomers)[1] / 100);
        }
        else {
            this.setChildLabel(node, "min", "");
            this.setChildLabel(node, "max", "");
        }
    }
    GetMaxMinChipByPlayerList(players: any[]) {
        let temp = players.concat();
        temp.sort((a, b) => b.chip - a.chip);
        return [temp[0] || 0, temp[temp.length - 1] || 0];
    }
}
