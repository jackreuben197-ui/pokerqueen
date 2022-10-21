import { UIDefine, UIDefineType } from "../../define/UIDefine";
import GGEvent from "../../event/GGEvent";
import GC from "../../frame/GameControl";
import { GameCache } from "../../game/GameCache";
import { GameType } from "../../game/GameUtil";
import WebImageHelper from "../../helper/WebImageHelper";
import { Web_User_Info } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { EMatchViewTabType } from "./MatchViewConfig";





const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/matchView/UIMatchPlayViewForm')
export default class UIMatchPlayViewForm extends BaseForm {
    private gold_Bg: cc.Node = null;
    private lbl_glod: cc.Label = null;
    private lbl_name: cc.Label = null;
    private tabBtnsParent: cc.Node = null;
    private tabViewParents: Array<cc.Node> = [];

    private _tabViewData: Array<UIDefineType> = [
        UIDefine.UIMatchChessView,
        UIDefine.UIMatchSportsView,
        UIDefine.UIMatchGameView,
        UIDefine.UIMatchRealityView,

    ]

    private _defultGameType: GameType = null;
    private _tabViews: Map<EMatchViewTabType, UIBase> = new Map();
    private _tabViewLoadintState: Map<EMatchViewTabType, boolean> = new Map();

    private _curType: EMatchViewTabType = EMatchViewTabType.no;
    onLoad() {
        super.onLoad();
    }

    protected lateLoad(): void {
        super.lateLoad();

        this.gold_Bg = this.getChildNodeOrComponent("gold_bg");
        this.lbl_glod = this.getChildNodeOrComponent("lbl_glod").getComponent(cc.Label);
        this.lbl_name = this.getChildNodeOrComponent("Text_LeftTop").getComponent(cc.Label);

        this.tabBtnsParent = this.getChildNodeOrComponent("tabBtns");
        let subView: cc.Node = this.getChildNodeOrComponent("subView");
        this.tabViewParents = subView.children;
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.tabBtnsParent.children.forEach((item, index) => {
            this.bindClick(item, this.onClickTabBtns, index);
        })

        this.bindClick(this.gold_Bg, this.clickGoldBg);
    }

    onShow(data?: any, fromUI?: BaseForm) {
        super.onShow(data, fromUI);
        this._defultGameType = data.type;
        this._curType = EMatchViewTabType.no;
        this.switchTab(data.page);

        this.initTopUI();
        this.refreshHeadImg();
        this.refreshUserName();
        // this.switchTab(EMatchViewTabType.chess);
    }

    /**
     * 注册广播事件
     */
    protected regiterDispatchEvent() {
        this.listen(GGEvent.Refresh_UserHead, this.refreshHeadImg);
        this.listen(GGEvent.Refresh_UserName, this.refreshUserName);
    }

    refreshHeadImg() {
        let img_head: cc.Sprite = this.getChildNodeOrComponent("user_icon", cc.Sprite);
        img_head.node.active = false;
        WebImageHelper.SetUrlImage(img_head, GameCache.Instance.headPic).then(() => {
            img_head.node.active = true;
        });
    }

    refreshUserName() {
        let lbl_nickname = this.getChildNodeOrComponent("Text_LeftTop", cc.Label);
        lbl_nickname.string = Web_User_Info.Response.data.user.nickname;
    }

    private initTopUI(): void {
        this.setText(this.lbl_glod, GC.data.user.info.displayGold)
        this.setText(this.lbl_name, GC.data.user.info.nickname);
        // this.lbl_glod.string = GameCache.Instance.gold.toString();
        // this.lbl_name.string = GameCache.Instance.nick.toString();
    }

    private onClickTabBtns(index: number): void {
        this.switchTab(index);
    }

    private clickGoldBg() {
        UIComponent.open(UIDefine.MyWalletForm)
    }


    switchTab = (type: EMatchViewTabType) => {
        if (this._curType != type) {
            this._curType = type;
            this.switchTabBtnState();

            this.switchTabView(type);
        }
    }

    switchTabBtnState() {
        this.tabBtnsParent.children.forEach((item, index) => {
            let choose = item.getChildByName("choose");
            let normal = item.getChildByName("normal");
            choose.active = this._curType == index;
            normal.active = this._curType != index;
        })

        this.tabViewParents.forEach((parent, index) => {
            parent.active = this._curType == index;
        })
    }

    switchTabView(type: EMatchViewTabType) {
        let parmas = type == EMatchViewTabType.chess ? this._defultGameType : null;
        if (!this._tabViewLoadintState.get(type) && !this._tabViews.get(type)) {
            this._tabViewLoadintState.set(type, true)
            let parent = this.tabViewParents[type];
            let uiDefine = this._tabViewData[type];
            this.loadPrefab(uiDefine.Path, (node: cc.Node) => {
                this._tabViewLoadintState.set(type, false)

                node.parent = parent;
                let baseScript = node.getComponent(UIBase);
                this._tabViews.set(type, baseScript);
                this.updateTabView(baseScript, type);
                // baseScript.onShow(parmas);
            }, () => {
                this._tabViewLoadintState.set(type, false)
            })
        } else if (this._tabViews.get(type)) {
            let baseScript = this._tabViews.get(type);
            // this._tabViews.get(type).onShow(parmas);
            this.updateTabView(baseScript, type);
        }
    }

    updateTabView(baseScript: UIBase, type: EMatchViewTabType) {
        if (type == EMatchViewTabType.chess) {
            baseScript.onShow(this._defultGameType, false);
        } else {
            baseScript.onShow();
        }
    }
}
