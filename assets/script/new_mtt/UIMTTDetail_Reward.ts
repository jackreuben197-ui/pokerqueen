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
import { WebWww, WebRoomCenterMttHranks, WebRoomCenterMttRanks, WebRoomCenterMttRealPrize } from "../net/https/WebRequest";
import LobbySession from "../session/LobbySession";
import UIBasePlus from "../ui/UIBasePlus";
import { MTTMatchStatus, UIMTTModel } from "./UIMTTModel";




const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMTTDetail_Reward extends UIBasePlus {

    $top_reward: cc.Node = null;

    $scroller_reward: cc.Node = null;

    $null_reward: cc.Node = null;

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
            this.$top_reward.children[2].getComponent(cc.Label).string = `${res.data.award / 100}`;
            this.$top_reward.children[3].getComponent(cc.Label).string = `${res.data.award_num}`;

        } else {
            this.$top_reward.children[2].getComponent(cc.Label).string = '';
            this.$top_reward.children[3].getComponent(cc.Label).string = '';
        }
    }

    reqList() {

        WebWww.Instance.CommonAPI(
            {
                web_class: WebRoomCenterMttRealPrize,
                api_id: this.mtt_detail.mtt.match_id
            }
        ).then(
            (res: any) => {

                this.refreshTop(res);
                this.listEx.refresh(res.data.prizes, 1);
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
            list: this.$scroller_reward.getComponent(List),
            nullNode: this.$null_reward,
            this: this,
            request: this.reqList
        });
    }
    //滚动节点渲染
    render_item(node: cc.Node, index: number) {

        let data = this.listEx.data[index];

        this.setChildLabel(node, "rank", data.min == data.max ? `${data.min}` : `${data.min}-${data.max}`);

        let b = "";

        let a = "";

        let award = data.award || 0;

        if (data.goods) {

            for (let i = 0; i < data.goods.length; i++) {
                if (i == 0 && award == 0) {
                    b += `${LobbySession.getLanguageValueByKey(data.goods[i].na)} x${data.goods[i].n}`;
                }
                else {
                    b += `+${LobbySession.getLanguageValueByKey(data.goods[i].na)} x${data.goods[i].n}`;
                }
            }

            if (UIMTTModel.Instance.MttInfo.mtt.hunter_on == 0) {
                if (award == 0) {

                    a = b;
                } else {

                    a = `${award / 100}${b}`;
                }
            }
            else {
                if (award == 0) {

                    a = `${b}+${i18nMgr.Get("UIReward_Bounty")}`
                }
                else {
                    a = `${award / 100}${b}+${i18nMgr.Get("UIReward_Bounty")}`
                }
            }

        } else {
            if (UIMTTModel.Instance.MttInfo.mtt.hunter_on == 0) {
                //等于0是关闭猎人赛
                a = `${award / 100}`;
            }
            else {
                a = `${award / 100}+${i18nMgr.Get("UIReward_Bounty")}`;
            }
        }

        this.setChildLabel(node, "award", a);
    }
}
