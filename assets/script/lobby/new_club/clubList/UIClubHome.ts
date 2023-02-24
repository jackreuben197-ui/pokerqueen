/*
 * @Author: xfj
 * @Date: 2022-12-21 12:49:12
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-24 14:19:53
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/clubList/UIClubHome.ts
 */

import BaseForm from "../../../ui/form/BaseForm";
import ComFormTitle from "../../../common/ComFormTitle";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import UIComponent from "../../../ui/UIComponent";
import { UIDefine } from "../../../define/UIDefine";
import WebImageHelper from "../../../helper/WebImageHelper";
import { UIClubModel } from "../../labor/UIClubModel";
import { APIOrgClubNotice, APIOrgClubUserInfo, APIOrgGetMessList, APIOrgGetNewMessNum, Web_User_Info } from "../../../net/https/WebRequest";
import { ClubUserDataCache } from "../../../frame/data/club/ClubUserDataCache";
import { StringHelper } from "../../../helper/StringHelper";
import UIBase from "../../../ui/UIBase";
import { Game_Type, Table_Type } from "../../../game/util/GameUtil";
import { EventName } from "../../../config/EventName";
import { WalletType } from ".././pay/UIWalletLayer";
import WalletModel from "./../pay/WalletModel";
import PublicHelper from "../../../helper/PublicHelper";
import UIBasePlus from "../../../ui/UIBasePlus";
import TabNode from "../../../common/tabNode";
import { ClubTabConfig } from "../../../frame/config/tabConfig";
const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/UIClubHome')
export default class UIClubHome extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    toggleType = 1
    layout: cc.Node = null;
    menuNode: cc.Node = null;

    @property(cc.Node)
    menu: cc.Node = null;

    @property(cc.Node)
    menuShow: cc.Node = null;

    @property(cc.Button)
    createBtn: cc.Button = null;
    _chessView
    _loadingChessBiew
    _showTsMessIndex = 0;
    _lastGetId = 1
    _fistGetId = 1
    _tsMessArr = []
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.layout = this.getChildNodeOrComponent("layout");
        this.menuNode = this.getChildNodeOrComponent("menuNode");

    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();

        this.listen(EventName.refreshClubTitle, this.refreshData);
    }

    onCopyClick() {
        //拷贝id号码
        PublicHelper.copyToClipBoard(ClubCache.random_id);
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIClub_Info"
        this.comFormTitle.initData(title, this);
        this.initAcTiveBord()
        this.initTabBnts()
        this.initTop();
        await UIClubModel.mInstance.APIOrgClubUserInfo({
            "user_id": Web_User_Info.Response.data.user.user_id,
            "club_id": ClubCache.club_id
        })
        let data = APIOrgClubUserInfo.Response.data
        ClubUserDataCache.setUserData(data);
        this.initCoin();
        this.initChessView()

    }

    async initAcTiveBord() {
        if (ClubCache.show_notice_switch == 2) return
        await UIClubModel.mInstance.APIOrgClubNotice({ "club_id": ClubCache.club_id })
        let data: any = APIOrgClubNotice.Response.data;
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let currenTime = new Date(year, month, day).getTime();
        if (data && data?.info && localStorage.getItem(data.info.id + '_' + currenTime) != '1') {
            UIComponent.open(UIDefine.UIClubActiveBord, data.info)
        }
    }
    /**
     * 初始化金币
     */
    initCoin() {
        let topNode: cc.Node = this.getChildNodeOrComponent("topNode");
        let coinNode = topNode.getChildByName('coinNode');
        cc.find('coin/label', coinNode).getComponent(cc.Label).string = StringHelper.GetLongString(ClubUserDataCache.gold);
        cc.find('usdt/label', coinNode).getComponent(cc.Label).string = StringHelper.GetLongString(ClubUserDataCache.usdt);
        coinNode.on(cc.Node.EventType.TOUCH_END, this.onClickPay, this)
    }
    /**
     * 钱包界面
     */
    onClickPay() {
        WalletModel.Instance.club_id = ClubCache.club_id;
        UIComponent.open(UIDefine.UIWalletLayer, { wallet_type: WalletType.Club });
    }

    /**
     * 刷新用户级别
     */
    refreshData() {
        let club_introduce = this.layout.getChildByName('club_introduce');
        club_introduce.getComponent(cc.Label).string = ClubCache.desc;
        if (ClubCache.desc == '') {
            club_introduce.active = false
            let up: cc.Node = this.getChildNodeOrComponent("up")
            up.active = false;
        }
        this.createBtn.node.active = ClubCache.user_level == 1 || ClubCache.user_level == 3
    }

    initTop() {
        this.refreshData();
        let messNode = this.layout.getChildByName('messNode');
        let icon = cc.find('Round', messNode)
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), ClubCache.logo)
        cc.find('messLayout/nameNode/name', messNode).getComponent(cc.Label).string = ClubCache.club_name;
        cc.find('messLayout/id', messNode).getComponent(cc.Label).string = 'ID:' + ClubCache.random_id;
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
                break;
            case 1:
                UIComponent.open(UIDefine.UIPlayerLookLabor)
                break;
            case 2:
                UIComponent.open(UIDefine.UIManageLabor)
                break;
            case 3:
                if (ClubCache.user_level == 4) {
                    UIComponent.open(UIDefine.UIClubVipMemberManage)
                } else {
                    UIComponent.open(UIDefine.UIClubMerberManager)
                }
                break;
            case 4:
                UIComponent.open(UIDefine.UIClubDataMange)
                break;
            case 5:
                //UIComponent.open(UIDefine.MyWalletForm, true)
                WalletModel.Instance.club_id = ClubCache.club_id;
                UIComponent.open(UIDefine.UIWalletLayer, { wallet_type: WalletType.Fund });
                break;
            case 6:
                //UIComponent.open(UIDefine.UIMine_MessageList, { enterType: 1 });
                UIComponent.open(UIDefine.UIMyMessage, { from: 1 });
                break;
            default:
                break;
        }
        this.menuClick()

    }
    menuClick() {
        this.menu.active = !this.menu.active
        this.menuShow.active = !this.menu.active
    }
    joinTripClick() {
        UIComponent.open(UIDefine.UIJoinUnion, { type: 1 })
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
                node.parent = this.layout
                let baseScript = node.getComponent(UIBase);
                this._chessView = baseScript;
                this._chessView.onShow(Game_Type.All, Table_Type.club);
            })
        } else if (this._chessView) {
            this._chessView.onShow(Game_Type.All, Table_Type.club);
        }
    }
    /** ************************聊天逻辑********************************************** */
    /**
     * @method 聊天列表
     */

    // scrollingCB(scrollView: cc.ScrollView) {
    //     if (scrollView) {
    //         let cur = scrollView.getScrollOffset();
    //         let max = scrollView.getMaxScrollOffset()
    //         let isDown = cur.y >= max.y;
    //         if (isDown && !this._reqing && !this._reqEnd) {
    //             // this.dealData()
    //             this.initChat();
    //         }
    //     }
    // }


    // async initChat() {
    //     this._reqing = true
    //     await UIClubModel.mInstance.APIOrgGetMessList({ last_id: 0, limit: 50, offset: this._offset })
    //     this._reqing = false
    //     let data: any = APIOrgGetMessList.Response.data
    //     let node = null;
    //     data = data.data
    //     // data.sort((a: any, b: any) => {
    //     //     return a.id - b.id
    //     // })
    //     // 消息类型 1 普通消息 2 会长公告 3 战绩分享 4 牌谱分享
    //     if (data?.length == 0) return
    //     let id = data[data.length - 1].id
    //     this._lastGetId = id;
    //     // this.messScoContent.childrenCount = 0
    //     for (let index = 0; index < data.length; index++) {
    //         const element = data[index];
    //         if (element.message_type == 1) {
    //             node = cc.instantiate(this.messNomalItem);
    //         } else if (element.message_type == 2) {
    //             node = cc.instantiate(this.messNomalItem);
    //             this._tsMessArr.push(element);
    //         } else if (element.message_type == 3 || element.message_type == 4) {
    //             node = cc.instantiate(this.messPfItem);
    //         }
    //         node.parent = this.messScoContent
    //         node.getComponent(node.name).initData(element);
    //     }
    //     this._offset = this.messScoContent.childrenCount;
    //     this.staSchedu();
    //     this.scheduleOnce(() => {
    //         this.messScrollView.scrollToBottom();

    //     }, 0.2)
    // }
    // staSchedu() {
    //     this.getNewMess();
    //     this.unscheduleAllCallbacks()
    //     // if (this.toggleType == 2) {
    //     //     this.initChat();
    //     // }
    //     this.schedule(() => {
    //         if (this.toggleType == 2) {
    //             this.initChat();
    //         }
    //         this.getNewMess();
    //     }, 8)
    // }
    // async getNewMess() {
    //     this.changeTsMes()
    //     await UIClubModel.mInstance.APIOrgGetNewMessNum({ msg_id: this._lastGetId });
    //     let data: any = APIOrgGetNewMessNum.Response.data
    //     this._reqEnd = data == 0;
    //     this.setNewNum(data);
    // }
    // changeTsMes() {
    //     let tsData = this._tsMessArr[this._showTsMessIndex];
    //     if (tsData) {
    //         this.tsMESS.active = true
    //         let _messTsItem = this.tsMESS.getChildByName('messTsItem')
    //         _messTsItem.getComponent(_messTsItem.name).initData(tsData);
    //         this._showTsMessIndex++;
    //     } else {
    //         this.tsMESS.active = false
    //     }
    // }
    // setNewNum(string = 0) {
    //     this.lbl_messNewNum.string = `(${string})`;
    // }
    // async clicka() {
    //     let param = { content: this.EditBox.string, message_type: 1 }
    //     await UIClubModel.mInstance.APIOrgSendMess(param)
    //     this.initChat();
    //     this.EditBox.string = ''
    //     this.editChange()

    // }
    // clickbq() {
    //     this.btnNode.active = !this.btnNode.active
    //     //发送
    // }
    // editChange() {
    //     if (this.EditBox.string == '') {
    //         this.item_A.active = false
    //         this.item_bq.active = true
    //     }
    //     else {
    //         this.item_A.active = true
    //         this.item_bq.active = false
    //     }
    //     // this.close()
    // }

    // clickPf() {
    //     // UIComponent.open(UIDefine.UIMine_Poker, { info: '' })
    //     UIComponent.open(UIDefine.UICollectScore, UIDefine.UILaborPlayViewForm,);
    // }
    // clickzj() {
    //     // UIComponent.open(UIDefine.UIRecordDetail, { info: '' });
    //     UIComponent.open(UIDefine.UIRecord, UIDefine.UILaborPlayViewForm);
    // }
    // clickxxts() {
    //     UIComponent.open(UIDefine.UIMsg_Send);
    // }

}
