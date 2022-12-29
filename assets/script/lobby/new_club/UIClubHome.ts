/*
 * @Author: xfj
 * @Date: 2022-12-21 12:49:12
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-29 12:13:30
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubHome.ts
 */

import BaseForm from "../../ui/form/BaseForm";
import ComFormTitle from "../../common/ComFormTitle";
import { ClubCache } from "../../frame/data/club/ClubCache";
import UIComponent from "../../ui/UIComponent";
import { UIDefine } from "../../define/UIDefine";
import WebImageHelper from "../../helper/WebImageHelper";
import { UIClubModel } from "../labor/UIClubModel";
import { APIOrgClubNotice, APIOrgClubUserInfo, Web_User_Info } from "../../net/https/WebRequest";
import { ClubUserDataCache } from "../../frame/data/club/ClubUserDataCache";
import { StringHelper } from "../../helper/StringHelper";
import UIBase from "../../ui/UIBase";
import { GameType, Game_Type, Table_Type } from "../../game/util/GameUtil";
import { WalletType } from "../view/pay/UIWalletLayer";
const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/UIClubHome')
export default class UIClubHome extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    toggleType = 1
    layout: cc.Node = null;

    subView: cc.Node = null;
    messView: cc.Node = null;

    menuNode: cc.Node = null;
    @property(cc.Node)
    menu: cc.Node = null;

    @property(cc.Node)
    menuShow: cc.Node = null;
    private _chessView: UIBase = null;
    private _loadingChessBiew: boolean = false;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.layout = this.getChildNodeOrComponent("layout");
        this.menuNode = this.getChildNodeOrComponent("menuNode");
        this.subView = this.getChildNodeOrComponent("subView");
        this.messView = this.getChildNodeOrComponent("messView");
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIClub_Home"
        this.comFormTitle.initData(title, this);
        this.initAcTiveBord()
        this.initToggle();
        this.initTabBnts()
        this.initTop();
        this.initChessView();
        await UIClubModel.mInstance.APIOrgClubUserInfo({
            "user_id": Web_User_Info.Response.data.user.un_id,
            "club_id": ClubCache.club_id
        })
        let data = APIOrgClubUserInfo.Response.data
        ClubUserDataCache.setUserData(data);
        this.initCoin();



    }
    async initAcTiveBord() {
        await UIClubModel.mInstance.APIOrgClubNotice({ "club_id": ClubCache.club_id })
        let data: any = APIOrgClubNotice.Response.data;
        // data = {
        //     "info": {
        //         "id": 1,
        //         "club_id": 4,
        //         "title": "title",
        //         "content": "content",
        //         "start_time": "2022-12-01T03:34:00Z",
        //         "end_time": "2022-12-30T03:34:00Z"
        //     }
        // }
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let currenTime = new Date(year, month, day).getTime();
        localStorage.getItem(data.info.id + '_' + currenTime)

        if (data.info && data.info.id + '_' + currenTime == '1') {
            UIComponent.open(UIDefine.UIClubActiveBord, data.info)
        }
    }

    initCoin() {
        let topNode: cc.Node = this.getChildNodeOrComponent("topNode");
        let coinNode = topNode.getChildByName('coinNode');
        cc.find('coin/label', coinNode).getComponent(cc.Label).string = StringHelper.GetLongString(ClubUserDataCache.gold);
        cc.find('usdt/label', coinNode).getComponent(cc.Label).string = StringHelper.GetLongString(ClubUserDataCache.usdt);
        coinNode.on(cc.Node.EventType.TOUCH_END, this.onClickPay, this)
    }

    onClickPay() {
        UIComponent.open(UIDefine.UIWalletLayer, { wallet_type: WalletType.Club });
    }

    initTop() {
        let club_introduce = this.layout.getChildByName('club_introduce');
        club_introduce.getComponent(cc.Label).string = ClubCache.desc;
        let messNode = this.layout.getChildByName('messNode');

        let icon = cc.find('iconMask/icon', messNode)
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), ClubCache.logo)
        cc.find('messLayout/nameNode/name', messNode).getComponent(cc.Label).string = ClubCache.club_name;
        cc.find('messLayout/id', messNode).getComponent(cc.Label).string = ClubCache.random_id;
        cc.find('people/data', messNode).getComponent(cc.Label).string = ClubCache.club_members;
        cc.find('table/data', messNode).getComponent(cc.Label).string = ClubCache.club_table;
        let hg = cc.find('messLayout/nameNode/hg', messNode)
        hg.active = true;
        ClubCache.setRoleType(hg, ClubCache.user_level)
        this.menuShow.children.forEach((item, index) => {
            this.bindClick(item, this.onClickTabBtns, index);
        })
        let topNode: cc.Node = this.getChildNodeOrComponent("topNode");
        let joinTrip = topNode.getChildByName('joinTrip');
        let coinNode = topNode.getChildByName('coinNode');
        if (ClubCache.tribe_name) {
            joinTrip.active = false
            coinNode.active = true
        }
        else {
            coinNode.active = false
            if (ClubCache.user_level == 1) {
                joinTrip.active = true
            } else {
                joinTrip.active = false
            }
        }
    }
    initTabBnts() {
        let createBtn: cc.Node = this.getChildNodeOrComponent('createBtn')
        createBtn.active = true
        for (let index = 1; index < this.menuShow.childrenCount; index++) {
            const element = this.menuShow.children[index];
            element.active = true
        }
        //0 普通 1会长 3管理员 4代理
        switch (ClubCache.user_level) {
            case 0:
                this.menuShow.children[2].active = false
                this.menuShow.children[3].active = false
                this.menuShow.children[4].active = false
                this.menuShow.children[5].active = false
                createBtn.active = false
                break;
            case 1:
            case 3:
                this.menuShow.children[1].active = false
                break;
            case 2:
                break;
            case 4:
                createBtn.active = false
                this.menuShow.children[5].active = false
                this.menuShow.children[2].active = false
                break;
            default:
                break;
        }
        if (!ClubCache.tribe_name) this.menuShow.children[5].active = false
    }

    onClickTabBtns(index: number) {
        switch (index) {
            case 0:
                this.menuClick()
                break;
            case 1:
                UIComponent.open(UIDefine.UIPlayerLookLabor)
                break;
            case 2:
                UIComponent.open(UIDefine.UIManageLabor)
                break;
            case 3:
                UIComponent.open(UIDefine.UIClubMerberManager)
                break;
            case 4:
                UIComponent.open(UIDefine.UIClubDataMange)
                break;
            case 5:
                //UIComponent.open(UIDefine.MyWalletForm, true)
                UIComponent.open(UIDefine.UIWalletLayer, { wallet_type: WalletType.Fund });
                break;
            case 6:
                UIComponent.open(UIDefine.UIMine_Message);
                break;
            default:
                break;
        }

    }
    /**
     * @method 聊天--列表
     */
    initToggle() {
        let table = cc.find('toggleNode/Rectangle/table', this.layout)
        let chet = cc.find('toggleNode/Rectangle/chet', this.layout)
        table.getChildByName('Rectangle').active = this.toggleType == 1;
        chet.getChildByName('Rectangle').active = this.toggleType == 2;
        cc.find('labelNode/lbl_1', table).opacity = this.toggleType == 1 ? 255 : 75
        cc.find('labelNode/lbl_2', table).opacity = this.toggleType == 1 ? 255 : 75
        cc.find('labelNode/lbl_1', chet).opacity = this.toggleType == 2 ? 255 : 75
        cc.find('labelNode/lbl_2', chet).opacity = this.toggleType == 2 ? 255 : 75
        this.menuNode.active = this.toggleType == 1;
        this.subView.active = this.toggleType == 1;
        this.messView.active = this.toggleType == 2;

    }
    toggleClick() {
        this.toggleType = this.toggleType == 1 ? 2 : 1
        this.initToggle()
    }
    menuClick() {
        this.menu.active = !this.menu.active
        this.menuShow.active = !this.menu.active
    }
    joinTripClick() {
        UIComponent.open(UIDefine.UIJoinUnion)
    }
    createMatchClick() {

        UIComponent.open(UIDefine.UIClubCreateMatchHome, 0)
    }
    /**
     * @method  牌局列表
     */
    initChessView() {
        if (!this._chessView && !this._loadingChessBiew) {
            this._loadingChessBiew = true;
            this.loadPrefab(UIDefine.UIMatchView.Path, (node: cc.Node) => {
                this._loadingChessBiew = false;
                node.parent = this.subView
                let baseScript = node.getComponent(UIBase);
                this._chessView = baseScript;
                this._chessView.onShow(Game_Type.All, Table_Type.club);
            })
        } else if (this._chessView) {
            this._chessView.onShow(Game_Type.All, Table_Type.club);
        }
    }

}
