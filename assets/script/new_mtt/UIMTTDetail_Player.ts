import List from "../common/List";
import ListEx from "../common/ListEx";
import TabsGroup from "../common/TabsGroup";
import { Tabs_Status, TextColor } from "../config/GameConfig";
import MTTGame from "../game/texas/MTTGame";
import MTTGameUtil from "../game/util/MTTGameUtil";
import { StringHelper } from "../helper/StringHelper";
import TimeHelper from "../helper/TimeHelper";
import WebImageHelper from "../helper/WebImageHelper";
import { i18nMgr } from "../i18n/i18nMgr";
import { WWW, Web_Room_Center_Mtt_Hranks, Web_Room_Center_Mtt_Ranks } from "../net/https/WebRequest";
import LobbySession from "../session/LobbySession";
import UIBasePlus from "../ui/UIBasePlus";
import { MTTMatchStatus, UIMTTModel } from "./UIMTTModel";




const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMTTDetail_Player extends UIBasePlus {


    //猎人赛头部
    $block2: cc.Node = null;
    //比赛标题
    $block1: cc.Node = null;
    //列表
    $scroller_player: cc.Node = null;
    //列表标题
    $title_player: cc.Node = null;

    $null_player: cc.Node = null;

    tips: cc.Node = null;

    mtt_detail: any;

    hunter_group: TabsGroup = null;

    select_hunter: boolean;

    isInit: boolean = false;

    onShow(param: any = null): void {
        super.onShow(param);
        this.mtt_detail = param;
        console.log("onShow UIMTTDetail_Player");
        if (!this.isInit) {
            this.isInit = true;
            this.initEX();
        }
        this.refreshTop();
        this.hunter_group.reset();
    }
    refreshTop(res?: any) {
        if (res) {
            this.$block1.active = res.data.records != null && res.data.records.length > 0;
            this.$block1.children[2].getComponent(cc.Label).string = `${res.data.alive || 0}`;
            this.$block1.children[3].getComponent(cc.Label).string = `${res.data.total || 0}`;

        } else {
            this.$block2.active = this.mtt_detail.mtt.hunter_on == 1;
            this.$scroller_player.getComponent(cc.Widget).top = this.mtt_detail.mtt.hunter_on == 1 ? 534 : 362;
            this.$block1.active = false;
        }

    }

    //页签点击
    click_hunter(items: cc.Node[], index: number) {
        let status_list = Tabs_Status[index];
        items.forEach((item, index) => {
            let status = status_list[index];
            this.setChildOpacity(item, "bg", status ? 255 : 90);
            this.setChildColor(item, "label", status ? TextColor.Color1 : TextColor.Color3);
        })
        //////////////////////////////////
        switch (index) {
            case 0:
                this.$title_player.children[2].active = true;//Rebuy
                this.$title_player.children[4].active = true;//记分牌
                this.$title_player.children[3].active = false;//猎人赛
                this.select_hunter = false;
                this.listEx.reset();
                this.listEx.dropRequest();
                break;
            case 1:
                this.$title_player.children[2].active = false;//Rebuy
                this.$title_player.children[4].active = false;//记分牌
                this.$title_player.children[3].active = true;//猎人赛
                this.select_hunter = true;
                this.listEx.reset();
                this.listEx.dropRequest();
                break;
        }

    }
    reqList() {

        if (this.select_hunter) {//猎人
            WWW.Instance.CommonAPI(
                {
                    web_class: Web_Room_Center_Mtt_Hranks,
                    api_id: this.mtt_detail.mtt.match_id
                }
            ).then(
                (res: any) => {

                    //测试数据
                    // res.data.alive = 100;
                    // res.data.total = 30;

                    // for (let i = 0; i < 30; i++) {
                    //     res.data.records.push(
                    //         {
                    //             name: "A1",
                    //             urid: 1,
                    //             rank: i,
                    //             award: i * 100
                    //         }
                    //     )
                    // }


                    this.refreshTop(res);
                    this.listEx.refresh(res.data.records, res.data.total);
                },
                (res: any) => {
                    this.$null_player.active = res?.code == 10001;
                }
            )
        } else {//非猎人
            WWW.Instance.CommonAPI(
                {
                    web_class: Web_Room_Center_Mtt_Ranks,
                    api_id: this.mtt_detail.mtt.match_id
                }
            ).then(
                (res: any) => {
                    //测试数据
                    // res.data.alive = 100;
                    // res.data.total = 30;

                    // for (let i = 0; i < 30; i++) {
                    //     res.data.records.push(
                    //         {
                    //             name: "A1",
                    //             urid: 1,
                    //             rank: i,
                    //             award: i * 100
                    //         }
                    //     )
                    // }
                    this.refreshTop(res);
                    this.listEx.refresh(res.data.records, res.data.total);
                },
                (res: any) => {
                    this.$null_player.active = res?.code == 10001;
                }
            )
        }
    }


    ////////////////////////////////////List/////////////////////////////
    private listEx: ListEx = null;

    //初始化滚动列表的补充数据
    private initEX() {
        this.hunter_group = new TabsGroup(this.$block2.children, this.click_hunter, this);
        this.listEx = new ListEx({
            list: this.$scroller_player.getComponent(List),
            nullNode: this.$null_player,
            this: this,
            request: this.reqList
        });
    }
    //滚动节点渲染
    render_item(node: cc.Node, index: number) {

        let data = this.listEx.data[index];

        this.setChildLabel(node, "rank", data.rank);
        this.setChildLabel(node, "name", data.name);
        this.setChildLabel(node, "rebuy", data.rebuy || "--");

        if (this.select_hunter) {
            this.setChildVisible(node, "rebuy", false);
            this.setChildVisible(node, "award", false);
            this.setChildVisible(node, "hunter", true);
            this.setChildLabel(node, "hunter", data.award / 100);
        }
        else {
            this.setChildVisible(node, "rebuy", true);
            this.setChildVisible(node, "award", true);
            this.setChildVisible(node, "hunter", false);
            this.setChildLabel(node, "award", `${data.award / 100}\n(${data.award / (MTTGameUtil.BlindAtLevel(0, UIMTTModel.Instance.MttInfo.mtt.blindtable_type, 1) * 2)}BB)`);

        }

    }
}
