const { ccclass, property } = cc._decorator;
import { UIDefine, UIDefineType } from "../../define/UIDefine";
import { GameCache } from "../../game/GameCache";
import { ResManager } from "../../manager/ResManager";
import BaseForm from "../../ui/form/BaseForm";
import UIBase from "../../ui/UIBase";
import { EMatchViewTabType } from "./MatchViewConfig";





@ccclass
export default class UIMatchPlayViewForm extends BaseForm {

    private _tabBtnsParent: cc.Node = null;
    private _tabViewParents: Array<cc.Node> = [];
    private _tabViewData: Array<UIDefineType> = [
        UIDefine.UIMatchChessView,
        UIDefine.UIMatchSportsView,
        UIDefine.UIMatchGameView,
        UIDefine.UIMatchRealityView,

    ]

    private _machPlayers: any = null;
    private _tabViews: Map<EMatchViewTabType, cc.Node> = new Map();
    private _tabViewLoadintState: Map<EMatchViewTabType, boolean> = new Map();

    private _curType: EMatchViewTabType = EMatchViewTabType.no;
    onLoad() {
        super.onLoad();
    }

    onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
        this._machPlayers = param;
        this._curType = EMatchViewTabType.no;

        this.initUI();
        this.registerClickEvent()
        this.switchTab(EMatchViewTabType.chess);
    }

    private initUI(): void {
        let lbl_glod: cc.Label = this.getChildNodeOrComponent("lbl_glod").getComponent(cc.Label);
        lbl_glod.string = GameCache.Instance.gold.toString();
        let lbl_name: cc.Label = this.getChildNodeOrComponent("Text_LeftTop").getComponent(cc.Label);
        lbl_name.string = GameCache.Instance.nick.toString();

        this._tabBtnsParent = this.getChildNodeOrComponent("tabBtns");

        let subView: cc.Node = this.getChildNodeOrComponent("subView");
        this._tabViewParents = subView.children;
    }


    private registerClickEvent(): void {
        this._tabBtnsParent.children.forEach((item, index) => {
            item["index"] = index;
            item.on(cc.Node.EventType.TOUCH_END, this.onClickCTTop, this)
        })
    }

    private onClickCTTop(e: cc.Event.EventTouch): void {
        let target: cc.Node = e.target;
        let index = target["index"];

        this.switchTab(index);
    }


    switchTab = (type: EMatchViewTabType) => {
        if (this._curType != type) {
            this._curType = type;
            this.switchTabState();

            if (!this._tabViewLoadintState.get(type) && !this._tabViews.get(type)) {
                this._tabViewLoadintState.set(type, true)
                let parent = this._tabViewParents[type];
                let uiDefine = this._tabViewData[type];
                ResManager.Load(uiDefine.Bundle, uiDefine.Path, cc.Prefab, (err, asset: cc.Prefab) => {
                    this._tabViewLoadintState.set(type, false)
                    if (err) {
                        return;
                    }
                    let node = cc.instantiate(asset);
                    node.parent = parent;
                    let baseScript = node.getComponent(UIBase);
                    baseScript.onShow(this._machPlayers);
                    this._tabViews.set(type, node);
                });
            }
        }

    }

    switchTabState() {
        this._tabBtnsParent.children.forEach((item, index) => {
            let choose = item.getChildByName("choose");
            let normal = item.getChildByName("normal");
            choose.active = this._curType == index;
            normal.active = this._curType != index;
        })

        this._tabViewParents.forEach((parent, index) => {
            parent.active = this._curType == index;
        })
    }

    async onClose(param: any = null) {
        cc.log("UIMatchPlayView onClose");
        super.onClose();
    }

}
