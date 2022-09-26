/*
 * @Author: xfj
 * @Date: 2022-09-19 16:24:03
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-26 13:08:47
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UILabarPlayViewForm.ts
 */
const { ccclass, property } = cc._decorator;
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { ResManager } from "../../manager/ResManager";
import { UIDefine, UIDefineType } from "../../define/UIDefine";
import WebImageHelper from "../../helper/WebImageHelper";
import { EMatchViewTabType } from "../matchView/MatchViewConfig";
import BaseForm from "../../ui/form/BaseForm";
import { APIOrgClubIsManger, Web_Org_Club_Get } from "../../net/https/WebRequest";
import { UIClubModel } from "./UIClubModel";

/**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈ ꧁༺ ༒ ༻꧂≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
    房间（牌桌）选择界面
 ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈ ༺༒༻ ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/

enum EnumLoadType {
    "Init" = 1,
    "Refresh" = 2,
    "LoadMore" = 0,
}
enum PokerType {
    Normal = 0,//普通
    SixPlus = 2//短牌
}

@ccclass
export default class UILabarPlayViewForm extends UIBase {
    @property(cc.Node)
    panel_right: cc.Node = null;
    @property(cc.Node)
    tabNode: cc.Node = null;

    private tabBtnsParent: cc.Node = null;
    private tabViewParents: Array<cc.Node> = [];

    private _tabViewData: Array<UIDefineType> = [
        UIDefine.UIMatchChessView,
        UIDefine.UIMatchSportsView,
        UIDefine.UIMatchGameView,
        UIDefine.UIMatchRealityView,

    ]

    private _machPlayers: Array<any> = [];
    private _tabViews: Map<EMatchViewTabType, UIBase> = new Map();
    private _tabViewLoadintState: Map<EMatchViewTabType, boolean> = new Map();

    private _curType: EMatchViewTabType = EMatchViewTabType.no;
    onLoad() {
        super.onLoad();
    }
    protected lateLoad(): void {
        super.lateLoad();

        this.tabBtnsParent = this.getChildNodeOrComponent("tabBtns");
        let subView: cc.Node = this.getChildNodeOrComponent("subView");
        this.tabViewParents = subView.children;
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.tabBtnsParent.children.forEach((item, index) => {
            item["index"] = index;
            item.on(cc.Node.EventType.TOUCH_END, this.onClickTabBtns, this)
        })
    }
    onShow(param?: any, fromUI?: BaseForm) {
        param = {
            game_type: 0,
            poker_type: 0,
            index: 0,
            len: 0,
        }
        super.onShow(param);
        this._machPlayers = param;
        this._curType = EMatchViewTabType.no;

        this.initTop();
        this.switchTab(EMatchViewTabType.chess);
    }

    private onClickTabBtns(e: cc.Event.EventTouch): void {
        let target: cc.Node = e.target;
        let index = target["index"];

        this.switchTab(index);
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
        let parmas = type == EMatchViewTabType.chess ? this._machPlayers : null;
        if (!this._tabViewLoadintState.get(type) && !this._tabViews.get(type)) {
            this._tabViewLoadintState.set(type, true)
            let parent = this.tabViewParents[type];
            let uiDefine = this._tabViewData[type];
            ResManager.Load(uiDefine.Bundle, uiDefine.Path, cc.Prefab, (err, asset: cc.Prefab) => {
                this._tabViewLoadintState.set(type, false)
                if (err) {
                    return;
                }
                let node = cc.instantiate(asset);
                node.parent = parent;
                let baseScript = node.getComponent(UIBase);
                baseScript.onShow(parmas);
                this._tabViews.set(type, baseScript);
            });
        } else if (this._tabViews.get(type)) {
            this._tabViews.get(type).onShow(parmas);
        }
    }


    /***************************************自己界面的数据处理 */

    async initTop() {
        let data: any = Web_Org_Club_Get.Response.data;
        let name = this.panel_right.getChildByName('name').getComponent(cc.Label);
        name.string = data.club_name
        let id = this.panel_right.getChildByName('id').getComponent(cc.Label);
        id.string = 'ID:' + data.random_id
        let icon = cc.find('iconMask/icon', this.panel_right).getComponent(cc.Sprite);
        WebImageHelper.SetUrlImage(icon, data.logo)
        let lbl_glod = cc.find('img_right_bg/lbl_glod', this.panel_right).getComponent(cc.Label);
        await UIClubModel.mInstance.APIOrgClubIsManger(data.club_id)
        let isManger: any = APIOrgClubIsManger.Response.data
        if (isManger) {
            this.tabNode.getChildByName('ghgl').active = true;
        } else {
            this.tabNode.getChildByName('ckgh').active = true;
        }
    }
    tostBtnClick() {
        this.tabNode.active = !this.tabNode.active;
    }
    playerLookLaber() {
        this.tabNode.active = false;
        UIComponent.open(UIDefine.UIPlayerLookLabor);
    }
    managerLookLaber() {
        this.tabNode.active = false;
        UIComponent.open(UIDefine.UIManageLabor);
    }

}
