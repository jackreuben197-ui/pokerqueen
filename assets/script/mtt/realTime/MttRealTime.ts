import ComTabToggles, { ETabToggle } from "../../common/ComTabToggles";
import List from "../../common/List";
import { EMttRealTimeTabType } from "../../config/EEnumConfig";
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
    private tabToggles: ComTabToggles = null;
    private rankList: List = null;

    private firstBtn: cc.Node = null;
    private frontBtn: cc.Node = null;
    private nextBtn: cc.Node = null;
    private lastBtn: cc.Node = null;

    private _tabVievs: Map<EMttRealTimeTabType, any> = new Map();
    private _tabViewLoadStatus: Map<EMttRealTimeTabType, boolean> = new Map();
    private _tabViewInitStatus: Map<EMttRealTimeTabType, boolean> = new Map();
    private _tabViewParents: Map<EMttRealTimeTabType, cc.Node> = new Map();
    lateLoad() {
        super.lateLoad();
        this.shadows = this.getChildNodeOrComponent("shadows");
        this.tabToggles = this.getChildNodeOrComponent("tabToggles", ComTabToggles);
        this.rankList = this.getChildNodeOrComponent("rankList", List);

        this.firstBtn = this.getChildNodeOrComponent("firstBtn");
        this.frontBtn = this.getChildNodeOrComponent("frontBtn");
        this.nextBtn = this.getChildNodeOrComponent("nextBtn");
        this.lastBtn = this.getChildNodeOrComponent("lastBtn");

        this._tabViewParents.set(EMttRealTimeTabType.sk, this.getChildNodeOrComponent("subViewAction"))
        this._tabViewParents.set(EMttRealTimeTabType.pz, this.getChildNodeOrComponent("subViewTables"))
        this._tabViewParents.set(EMttRealTimeTabType.jl, this.getChildNodeOrComponent("subViewReward"))
        this._tabViewParents.set(EMttRealTimeTabType.mz, this.getChildNodeOrComponent("subViewBlind"))

    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.shadows, () => UIComponent.close(this.UIDefine));

        this.bindClick(this.firstBtn, this.clickFirst);
        this.bindClick(this.frontBtn, this.clickFront);
        this.bindClick(this.nextBtn, this.clickNext);
        this.bindClick(this.lastBtn, this.clickLast);
    }

    protected notify(id: any, msg: any, sendInfo?: any): void {
        id = id.replace(/(?<=mtt\/)\d+/g, "{0}");
        switch (id) {
            case Web_Mtt.RANKS: {
                this.updateRankList();
            } break;
        }
    }

    onShow(param: any, fromUI: any): void {
        super.onShow(param, fromUI);

        this._tabViewInitStatus.clear();

        GC.data.mtt.realTime.reqRankList();
        this.tabToggles.initData(this.onToggle, ETabToggle.sprite, {
            title: ["UITexasReport_Label_AllBarSK", "UITexasReport_Label_AllBarPZ", "UITexasReport_Label_AllBarJL", "UITexasReport_Label_AllBarMZ"],
            data: [EMttRealTimeTabType.sk, EMttRealTimeTabType.pz, EMttRealTimeTabType.jl, EMttRealTimeTabType.mz]
        });
        this.tabToggles.clickTab(0);
    }

    onToggle = (index: number, type: EMttRealTimeTabType) => {
        this._tabViewParents.forEach((node, t) => {
            this.setActive(node, type == t);
        })

        let item = this._tabVievs.get(type);
        if (!item && !this._tabViewLoadStatus.get(type)) {
            this._tabViewLoadStatus.set(type, true);

            this.loadPrefab([
                "main/mtt/realTime/MttRealTimeActionNode",
                "main/mtt/realTime/MttRealTimeTablesNode",
                "main/mtt/realTime/MttRealTimeRewardNode",
                "main/mtt/realTime/MttRealTimeBlindsNode",
            ][type], node => {
                this._tabViewLoadStatus.set(type, false);
                let scprpt = [MttRealTimeActionNode, MttRealTimeTablesNode, MttRealTimeRewardNode, MttRealTimeBlindsNode][type];
                item = node.getComponent(scprpt);
                this._tabVievs.set(type, item);
                node.parent = this._tabViewParents.get(type);
                if (!this._tabViewInitStatus.get(type)) {
                    item?.initData();
                }
            })
        } else if (!this._tabViewInitStatus.get(type)) {
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