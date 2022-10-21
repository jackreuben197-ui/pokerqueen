/*
 * @Author: xfj
 * @Date: 2022-09-19 16:24:03
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-17 11:36:31
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
import { APIOrgClubGold, APIOrgClubIsManger, Web_Org_Club_Get } from "../../net/https/WebRequest";
import { UIClubModel } from "./UIClubModel";
import { GameType } from "../../game/GameUtil";
import { EWalletGoldOpration } from "../../wallet/WalletConfig";

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
    @property(cc.Node)
    chongzhi: cc.Node = null;

    private tabBtnsParent: cc.Node = null;
    private tabViewParents: Array<cc.Node> = [];

    private _tabViewData: Array<UIDefineType> = [
        UIDefine.UIMatchChessView,
        UIDefine.UIMatchSportsView,
        UIDefine.UIMatchGameView,
        UIDefine.UIMatchRealityView,

    ]

    private _chessView: UIBase = null;
    private _loadingChessBiew: boolean = false;

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

    }
    onShow(param?: any, fromUI?: BaseForm) {
        param = {
            game_type: 0,
            poker_type: 0,
            index: 0,
            len: 0,
        }
        super.onShow(param);

        this.initTop();
        this.initChessView();
    }

    initChessView() {
        if (!this._chessView && !this._loadingChessBiew) {
            this._loadingChessBiew = true;
            this.loadPrefab(UIDefine.UIMatchChessView.Path, (node: cc.Node) => {
                this._loadingChessBiew = false;
                node.parent = this.tabViewParents[0];
                let baseScript = node.getComponent(UIBase);
                this._chessView = baseScript;
                this._chessView.onShow(GameType.Holdem, true);
            })
        } else if (this._chessView) {
            this._chessView.onShow(GameType.Holdem, true);
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

        UIClubModel.mInstance.APIOrgClubGold(data.random_id).then(() => {
            let data: any = APIOrgClubGold.Response.data
            lbl_glod.string = data.gold / 100 + "";
        })

        UIClubModel.mInstance.APIOrgClubIsManger(data.club_id).then(() => {
            let isManger: any = APIOrgClubIsManger.Response.data
            if (isManger) {
                this.chongzhi.active = true;
                this.tabNode.getChildByName('chpj').active = true;
                this.tabNode.getChildByName('ghgl').active = true;
                this.tabNode.getChildByName('ckgh').active = false;
            } else {
                this.chongzhi.active = false;
                this.tabNode.getChildByName('chpj').active = false;
                this.tabNode.getChildByName('ghgl').active = false;
                this.tabNode.getChildByName('ckgh').active = true;
            }
        })

    }
    addCoin() {
        // UIComponent.open(UIDefine.GoldOprationForm, { type: EWalletGoldOpration.in, isClub: true });
        UIComponent.open(UIDefine.OrderApplyForm);
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
    createMatch() {
        this.tabNode.active = false;
        UIComponent.open(UIDefine.UICreateMatchHome);
    }

}
