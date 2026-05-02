import ComTabToggles, { ETabToggle } from "../../common/ComTabToggles";
import List from "../../common/List";
import TabNode from "../../common/tabNode";
import { EMttRealTimeTabType } from "../../config/EEnumConfig";
// import { mttRealTimeTabConfig } from "../../frame/config/tabConfig";
import GC from "../../frame/GameControl";
import { GameCache } from "../../game/GameCache";
import TimeHelper from "../../helper/TimeHelper";
import { WebMtt } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import MttRealTimeActionNode from "./MttRealTimeActionNode";
import MttRealTimeBlindsNode from "./MttRealTimeBlindsNode";
import MttRealTimeRankItem from "./MttRealTimeRankItem";
import MttRealTimeRewardNode from "./MttRealTimeRewardNode";
import MttRealTimeTablesNode from "./MttRealTimeTablesNode";

const mttRealTimeTabConfig =  { data: ["UITexasReport_Label_AllBarSK", "UITexasReport_Label_AllBarPZ", "UITexasReport_Label_AllBarJL", "UITexasReport_Label_AllBarMZ"], defaultIndex: 0, defaultWidth: 1060, defaultHeight: 133 }

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/mtt/realTime/MttRealTime')
export default class MttRealTime extends UIBase {
    private shadows: cc.Node = null;
    // private tabToggles: ComTabToggles = null;
    private rankList: List = null;
    private tabNode: TabNode = null;
    private firstBtn: cc.Node = null;
    private frontBtn: cc.Node = null;
    private nextBtn: cc.Node = null;
    private lastBtn: cc.Node = null;
    private pageNum: cc.Label = null;
    private text_Time: cc.Label = null;
    private ranking: cc.Node = null;
    private HunterRanting: cc.Node = null;

    private _tabVievs: Map<EMttRealTimeTabType, any> = new Map();
    private _tabViewLoadStatus: Map<EMttRealTimeTabType, boolean> = new Map();
    private _tabViewInitStatus: Map<EMttRealTimeTabType, boolean> = new Map();
    private _tabViewParents: Map<EMttRealTimeTabType, cc.Node> = new Map();
    mRoomLeaveTime: any = null;
    lateLoad() {
        super.lateLoad();
        this.shadows = this.getChildNodeOrComponent("shadows");
        // this.tabToggles = this.getChildNodeOrComponent("tabToggles", ComTabToggles);
        this.tabNode = this.getChildNodeOrComponent("tabNode", TabNode);
        this.rankList = this.getChildNodeOrComponent("rankList", List);

        this.firstBtn = this.getChildNodeOrComponent("firstBtn");
        this.frontBtn = this.getChildNodeOrComponent("frontBtn");
        this.nextBtn = this.getChildNodeOrComponent("nextBtn");
        this.lastBtn = this.getChildNodeOrComponent("lastBtn");
        this.pageNum = this.getChildNodeOrComponent("pageNum", cc.Label);
        this.ranking = this.getChildNodeOrComponent("ranking");
        this.HunterRanting = this.getChildNodeOrComponent("HunterRanting");

        this._tabViewParents.set(EMttRealTimeTabType.sk, this.getChildNodeOrComponent("subViewAction"))
        this._tabViewParents.set(EMttRealTimeTabType.pz, this.getChildNodeOrComponent("subViewTables"))
        this._tabViewParents.set(EMttRealTimeTabType.jl, this.getChildNodeOrComponent("subViewReward"))
        this._tabViewParents.set(EMttRealTimeTabType.mz, this.getChildNodeOrComponent("subViewBlind"))
        this.text_Time = this.getChildNodeOrComponent('Text_Time', cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        GC.notify.register(WebMtt.RANKS, this.updateRankList, this)
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.shadows, () => UIComponent.close(this.UIDefine));

        this.bindClick(this.firstBtn, this.clickFirst);
        this.bindClick(this.frontBtn, this.clickFront);
        this.bindClick(this.nextBtn, this.clickNext);
        this.bindClick(this.lastBtn, this.clickLast);

        this.bindClick(this.ranking, this.titleClick, 0);
        this.bindClick(this.HunterRanting, this.titleClick, 1);
    }
    titleClick(customdata) {
        this.ranking.parent.children.forEach((evement, index) => {
            if (customdata == index) {
                evement.color = cc.color().fromHEX('#EEF5FF')
                evement.getChildByName('block').active = true;
            } else {
                evement.color = cc.color().fromHEX('#757CAB')
                evement.getChildByName('block').active = false;
            }

        })

    }

    // protected notify(id: any, msg: any, sendInfo?: any): void {
    //     //id = id.replace(/(?<=mtt\/)\d+/g, "{0}");
    //     switch (id) {
    //         case WebMtt.RANKS: {
    //             this.updateRankList();
    //         } break;
    //     }
    // }

    onShow(param: any, fromUI: any): void {
        super.onShow(param, fromUI);
        this.unscheduleAllCallbacks();
        this._tabViewInitStatus.clear();

        GC.data.mtt.realTime.reqRankList();
        this.tabNode.initData(mttRealTimeTabConfig, this.onToggle, this)
        this.pageNum.string = `${GC.data.mtt.realTime.curPage + 1}/${GC.data.mtt.realTime.totlePage + 1}`
        this.initRoomTime();
    }

    onToggle = (index: number) => {
        this._tabViewParents.forEach((node, t) => {
            this.setActive(node, index == t);
        })

        let item = this._tabVievs.get(index);
        if (!item && !this._tabViewLoadStatus.get(index)) {
            this._tabViewLoadStatus.set(index, true);

            this.loadPrefab([
                "main/mtt/realTime/MttRealTimeActionNode",
                "main/mtt/realTime/MttRealTimeTablesNode",
                "main/mtt/realTime/MttRealTimeRewardNode",
                "main/mtt/realTime/MttRealTimeBlindsNode",
            ][index], node => {
                this._tabViewLoadStatus.set(index, false);
                let scprpt = [MttRealTimeActionNode, MttRealTimeTablesNode, MttRealTimeRewardNode, MttRealTimeBlindsNode][index];
                item = node.getComponent(scprpt);
                this._tabVievs.set(index, item);
                node.parent = this._tabViewParents.get(index);
                if (!this._tabViewInitStatus.get(index)) {
                    item?.initData();
                }
            })
        } else if (!this._tabViewInitStatus.get(index)) {
            item?.initData();

        }
    }
    initRoomTime() {
        GC.data.mtt.list.list.forEach(item => {
            if (item.match_id == GameCache.Instance.match_id) {
                if (item.start_time == null) {
                    return;
                }
                let roomLeftTime = new Date().getTime() / 1000 - item.start_time
                if (roomLeftTime > 0) {
                    this.mRoomLeaveTime = roomLeftTime;
                    let textTitle = this.getChildNodeOrComponent('Text_Time').getComponent(cc.Label);
                    textTitle.string = TimeHelper.ShowRemainingSemicolon2(this.mRoomLeaveTime);
                    this.ShowLeaveTimer();
                }
            }
        })




    }
    ShowLeaveTimer() {
        this.schedule(() => {
            if (this.mRoomLeaveTime >= 0 && this.node.isValid) {
                this.mRoomLeaveTime++;
                if (this.text_Time != null)
                    this.text_Time.string = TimeHelper.ShowRemainingSemicolon2(this.mRoomLeaveTime);
            } else {
                if (this.text_Time != null && !cc.isValid(this.node, true)) {
                    this.text_Time.string = "00:00";
                }
            }
        }, 1)
    }


    updateRankList() {
        let ranks = GC.data.mtt.realTime.ranks;
        if (ranks) {
            this.rankList.numItems = ranks.length;
        }
    }

    onRenderRankItem(node: cc.Node, index: number) {
        let item = node.getComponent(MttRealTimeRankItem);
        item.initData(GC.data.mtt.realTime.ranks[index]);
    }

    clickFirst() {
        GC.data.mtt.realTime.firstPage();
        this.updateRankList();
    }

    clickFront() {
        GC.data.mtt.realTime.frontPage();
        this.updateRankList();
    }

    clickNext() {
        GC.data.mtt.realTime.nextPage();
        this.updateRankList();
    }

    clickLast() {
        GC.data.mtt.realTime.lastPage();
        this.updateRankList();
    }

}