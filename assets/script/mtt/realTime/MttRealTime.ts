import ComTabToggles, { ETabToggle } from "../../common/ComTabToggles";
import List from "../../common/List";
import TabNode from "../../common/tabNode";
import { EMttRealTimeTabType } from "../../config/EEnumConfig";
import { mttRealTimeTabConfig } from "../../frame/config/tabConfig";
import GC from "../../frame/GameControl";
import { Web_Mtt } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import MttRealTimeActionNode from "./MttRealTimeActionNode";
import MttRealTimeBlindsNode from "./MttRealTimeBlindsNode";
import MttRealTimeRankItem from "./MttRealTimeRankItem";
import MttRealTimeRewardNode from "./MttRealTimeRewardNode";
import MttRealTimeTablesNode from "./MttRealTimeTablesNode";

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

    private _tabVievs: Map<EMttRealTimeTabType, any> = new Map();
    private _tabViewLoadStatus: Map<EMttRealTimeTabType, boolean> = new Map();
    private _tabViewInitStatus: Map<EMttRealTimeTabType, boolean> = new Map();
    private _tabViewParents: Map<EMttRealTimeTabType, cc.Node> = new Map();
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

        this._tabViewParents.set(EMttRealTimeTabType.sk, this.getChildNodeOrComponent("subViewAction"))
        this._tabViewParents.set(EMttRealTimeTabType.pz, this.getChildNodeOrComponent("subViewTables"))
        this._tabViewParents.set(EMttRealTimeTabType.jl, this.getChildNodeOrComponent("subViewReward"))
        this._tabViewParents.set(EMttRealTimeTabType.mz, this.getChildNodeOrComponent("subViewBlind"))

    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        GC.notify.register(Web_Mtt.RANKS, this.updateRankList, this)
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.shadows, () => UIComponent.close(this.UIDefine));

        this.bindClick(this.firstBtn, this.clickFirst);
        this.bindClick(this.frontBtn, this.clickFront);
        this.bindClick(this.nextBtn, this.clickNext);
        this.bindClick(this.lastBtn, this.clickLast);
    }

    // protected notify(id: any, msg: any, sendInfo?: any): void {
    //     //id = id.replace(/(?<=mtt\/)\d+/g, "{0}");
    //     switch (id) {
    //         case Web_Mtt.RANKS: {
    //             this.updateRankList();
    //         } break;
    //     }
    // }

    onShow(param: any, fromUI: any): void {
        super.onShow(param, fromUI);

        this._tabViewInitStatus.clear();

        GC.data.mtt.realTime.reqRankList();
        this.tabNode.initData(mttRealTimeTabConfig, this.onToggle, this)
        this.pageNum.string = `${GC.data.mtt.realTime.curPage + 1}/${GC.data.mtt.realTime.totlePage + 1}`
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