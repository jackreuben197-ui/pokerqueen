import { CommonDefine } from "../define/CommonDefine";
import { IUIDefine } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";

import { StringHelper } from "../helper/StringHelper";
import { i18nLabel } from "../i18n/i18nLabel";
import { i18nMgr } from "../i18n/i18nMgr";
import { UIMineModel } from "../lobby/UIMineModel";
import { ResManager } from "../manager/ResManager";
import ToastManager from "../manager/ToastManager";

import { RoomInfo } from "../protobuf/holdem/define_pb";
import GlobalSession from "../session/GlobalSession";
import AssetContext, { AssetFold } from "../ui/component/AssetContext";
import BaseScene from "../ui/scene/BaseScene";
import UIComponent from "../ui/UIComponent";
import { GameCache } from "./GameCache";

import TexasGame from "./TexasGame";
import UIAddChipsComponent from "./ui/UIAddChipsComponent";
import { HistoryInfoData } from "./UITexasHistoryComponent";


export class PotInfo {
    public pot: number;
    public textPot: cc.Label;
    public imagePot: cc.Sprite;
    public imagePotFrame: cc.Sprite;
    public imagePotText: cc.Label;

    constructor(public trans: cc.Node) {
        if (null != trans) {
            this.imagePotFrame = trans.getChildByName("Image_PotFrame").getComponent(cc.Sprite);
            this.imagePot = trans.getChildByName("Image_Pot").getComponent(cc.Sprite);
            this.textPot = trans.getChildByName("Text_Pot").getComponent(cc.Label);
            this.imagePotText = this.imagePot.node.getChildByName("Image_PotText").getComponent(cc.Label);
        }
    }
}
export class PublicCardInfo {
    public imageCard: cc.Sprite;
    public imageSelect: cc.Sprite;
    constructor(public cardId: number, public trans: cc.Node) {
        this.imageCard = trans.getComponent(cc.Sprite);
        this.imageSelect = trans.getChildByName("Image_SelectPublicCard").getComponent(cc.Sprite);
    }
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexas extends BaseScene {

    /**
     * 节点|组件 定义
     */
    desk_bg: cc.Sprite = null;
    table_bg: cc.Sprite = null;

    menu_btn: cc.Node = null;
    report_btn: cc.Node = null;
    cursituation_btn: cc.Node = null;
    chat_btn: cc.Node = null;

    textRoomInfo: cc.Label = null;

    //补盲按钮
    buttonWaitBlind: cc.Node = null;
    //左侧边菜单
    transSubMenu: cc.Node = null;
    imageMenuMask: cc.Node = null;
    textTotalBean: cc.Label = null;
    Menu_Buttons: cc.Node = null;

    textStoreBean: cc.Label = null;

    //按钮模板节点
    Menu_Button: cc.Node = null;


    UIOperation: cc.Node = null;

    imageWaitForStartTips: cc.Node = null;

    //座位节点
    Seat: cc.Node = null;


    UIAddChips: UIAddChipsComponent = null;

    textAlreadAnte: cc.Label = null;
    //个性设置界面
    //UITexasSetting: cc.Node = null;


    public transPots: cc.Node = null;
    public transPot: cc.Node = null;
    public transAllPot: cc.Node = null;



    imagePublicCard0: cc.Node = null;
    imagePublicCard1: cc.Node = null;
    imagePublicCard2: cc.Node = null;
    imagePublicCard3: cc.Node = null;
    imagePublicCard4: cc.Node = null;

    imageSecondPublicCard0: cc.Node = null;
    imageSecondPublicCard1: cc.Node = null;
    imageSecondPublicCard2: cc.Node = null;
    imageSecondPublicCard3: cc.Node = null;
    imageSecondPublicCard4: cc.Node = null;


    buttonDelay: cc.Node = null;

    ///////////////////////////////////
    /**
     * 声明内容
     */
    listCards: PublicCardInfo[] = null;
    listSecondCards: PublicCardInfo[] = null;
    listPotInfo: PotInfo[] = null;

    IMenuButton_Type: {
        node: cc.Node;
        text: string;
        i18n_string: string;
        hideLine?: boolean;
        onClick?: Function;
    };

    MenuButtons_Dic: Record<
        "Button_Standup" |
        "Button_Rebuy" |
        "Button_Owner" |
        "Button_Setting" |
        "Button_Rule" |
        "Button_SetAutoOnTable" |
        "Button_AddChips" |
        "Button_TakeOut" |
        "Button_Trust" |
        "Button_LeaveDesk" |
        "Button_Exit",
        typeof this.IMenuButton_Type> = {
            Button_Standup: {
                node: null,
                text: "Sit out",
                i18n_string: "UITexas_standUp",
                onClick: this.onClickStandup
            },
            Button_Rebuy: {
                node: null,
                text: "Rebuy",
                i18n_string: "UITexas_Rebuy",
                onClick: this.Click_Button_Rebuy
            },
            Button_Owner: {
                node: null,
                text: "Functions",
                i18n_string: "UITexas_OwerFund",
                onClick: this.Click_Button_Owner
            },
            Button_Setting: {
                node: null,
                text: "Options",
                i18n_string: "UITexas_Setting",
                onClick: this.Click_Button_Setting
            },
            Button_Rule: {
                node: null,
                text: "Rules",
                i18n_string: "UITexas_RuleTips",
                onClick: this.Click_Button_Rule
            },
            Button_SetAutoOnTable: {
                node: null,
                text: "Set up automatic table chips",
                i18n_string: "UITexasAutoOutChip",
                onClick: this.Click_Button_SetAutoOnTable
            },
            Button_AddChips: {
                node: null,
                text: "Supplementary scoreboard",
                i18n_string: "UITexas_AddChipsMenu",
                onClick: this.Click_Button_AddChips
            },
            Button_TakeOut: {
                node: null,
                text: "Bring out the scoreboard",
                i18n_string: "UITexas_BringOutChipsMenu",
                onClick: this.Click_Button_TakeOut
            },
            Button_Trust: {
                node: null,
                text: "Auto check/fold",
                i18n_string: "UITexas_TrustGame",
                onClick: this.Click_Button_Trust
            },
            Button_LeaveDesk: {
                node: null,
                text: "Leave the table",
                i18n_string: "UITexas_LeaveTheTable",
                onClick: this.Click_Button_LeaveDesk
            },
            Button_Exit: {
                node: null,
                text: "Exit to lobby",
                i18n_string: "UITexas_Leave",
                hideLine: true,
                onClick: this.Click_Button_Exit
            },

        }
    game: TexasGame = null;
    lastClickTime: number = 0;
    ///////////////////////////////////
    protected lateLoad(): void {

        super.lateLoad();




        this.desk_bg = this.getChildNodeOrComponent("desk_bg", cc.Sprite);
        this.table_bg = this.getChildNodeOrComponent("table_bg", cc.Sprite);

        this.menu_btn = this.getChildNodeOrComponent("menu_btn");
        this.report_btn = this.getChildNodeOrComponent("report_btn");
        this.cursituation_btn = this.getChildNodeOrComponent("cursituation_btn");
        this.chat_btn = this.getChildNodeOrComponent("chat_btn");
        this.textRoomInfo = this.getChildNodeOrComponent("Text_RoomInfo", cc.Label);
        this.imageWaitForStartTips = this.getChildNodeOrComponent("Image_WaitForStartTips");
        this.Seat = this.getChildNodeOrComponent("Seat");
        this.UIAddChips = this.getChildNodeOrComponent("UIAddChips", UIAddChipsComponent);
        this.buttonWaitBlind = this.getChildNodeOrComponent("Button_WaitBlind");

        this.transSubMenu = this.getChildNodeOrComponent("SubMenu");
        this.imageMenuMask = this.getChildNodeOrComponent("Image_MenuMask");
        this.textTotalBean = this.getChildNodeOrComponent("Text_TotalBean", cc.Label);
        this.textStoreBean = this.getChildNodeOrComponent("Text_StoreBean", cc.Label);

        this.textAlreadAnte = this.getChildNodeOrComponent("Text_AlreadAnte", cc.Label);

        this.Menu_Buttons = this.getChildNodeOrComponent("Menu_Buttons");
        this.Menu_Button = this.getChildNodeOrComponent("Menu_Button");


        this.transPots = this.getChildNodeOrComponent("Pots");
        this.transPot = this.getChildNodeOrComponent("Pot");
        this.transAllPot = this.getChildNodeOrComponent("AllPot");

        this.imagePublicCard0 = this.getChildNodeOrComponent("Image_PublicCard0");
        this.imagePublicCard1 = this.getChildNodeOrComponent("Image_PublicCard1");
        this.imagePublicCard2 = this.getChildNodeOrComponent("Image_PublicCard2");
        this.imagePublicCard3 = this.getChildNodeOrComponent("Image_PublicCard3");
        this.imagePublicCard4 = this.getChildNodeOrComponent("Image_PublicCard4");

        this.imageSecondPublicCard0 = this.getChildNodeOrComponent("Image_SecondPublicCard0");
        this.imageSecondPublicCard1 = this.getChildNodeOrComponent("Image_SecondPublicCard1");
        this.imageSecondPublicCard2 = this.getChildNodeOrComponent("Image_SecondPublicCard2");
        this.imageSecondPublicCard3 = this.getChildNodeOrComponent("Image_SecondPublicCard3");
        this.imageSecondPublicCard4 = this.getChildNodeOrComponent("Image_SecondPublicCard4");

        //this.UITexasSetting = this.getChildNodeOrComponent("UITexasSetting");

        this.UIOperation = this.getChildNodeOrComponent("UIOperation");

        this.buttonDelay = this.getChildNodeOrComponent("Button_Delay");



        this.game = GameCache.Instance.CurGame;

        this.game.uirc = this;

        //#region 公共牌数据(UI、Id)
        if (null == this.listCards)
            this.listCards = [];
        if (this.listCards.length > 0)
            this.listCards = [];
        this.listCards.push(new PublicCardInfo(-1, this.imagePublicCard0))
        this.listCards.push(new PublicCardInfo(-1, this.imagePublicCard1))
        this.listCards.push(new PublicCardInfo(-1, this.imagePublicCard2))
        this.listCards.push(new PublicCardInfo(-1, this.imagePublicCard3))
        this.listCards.push(new PublicCardInfo(-1, this.imagePublicCard4))


        //#endregion
        //#region 第二套公共牌数据
        if (null == this.listSecondCards)
            this.listSecondCards = [];
        if (this.listSecondCards.length > 0)
            this.listSecondCards = [];


        this.listSecondCards.push(new PublicCardInfo(-1, this.imageSecondPublicCard0));
        this.listSecondCards.push(new PublicCardInfo(-1, this.imageSecondPublicCard1));
        this.listSecondCards.push(new PublicCardInfo(-1, this.imageSecondPublicCard2));
        this.listSecondCards.push(new PublicCardInfo(-1, this.imageSecondPublicCard3));
        this.listSecondCards.push(new PublicCardInfo(-1, this.imageSecondPublicCard4));

        //#endregion
        // 公共牌默认位置
        if (null == this.game.listDefaultPublicCardsLPos)
            this.game.listDefaultPublicCardsLPos = [];
        if (this.game.listDefaultPublicCardsLPos.length > 0)
            this.game.listDefaultPublicCardsLPos = [];
        this.game.listDefaultPublicCardsLPos.push(this.imagePublicCard0.position);
        this.game.listDefaultPublicCardsLPos.push(this.imagePublicCard1.position);
        this.game.listDefaultPublicCardsLPos.push(this.imagePublicCard2.position);
        this.game.listDefaultPublicCardsLPos.push(this.imagePublicCard3.position);
        this.game.listDefaultPublicCardsLPos.push(this.imagePublicCard4.position);

        // 第二套公共牌默认位置
        if (null == this.game.listDefaultSecondPublicCardsLPos)
            this.game.listDefaultSecondPublicCardsLPos = [];
        if (this.game.listDefaultSecondPublicCardsLPos.length > 0)
            this.game.listDefaultSecondPublicCardsLPos = [];
        this.game.listDefaultSecondPublicCardsLPos.push(this.imageSecondPublicCard0.position);
        this.game.listDefaultSecondPublicCardsLPos.push(this.imageSecondPublicCard1.position);
        this.game.listDefaultSecondPublicCardsLPos.push(this.imageSecondPublicCard2.position);
        this.game.listDefaultSecondPublicCardsLPos.push(this.imageSecondPublicCard3.position);
        this.game.listDefaultSecondPublicCardsLPos.push(this.imageSecondPublicCard4.position);


        // 分池UI
        if (null == this.listPotInfo) this.listPotInfo = [];


        this.buildMenuButtons();
        //GameCache.Instance.room_type
        //TexasGame game = GameUtil.InstantiateTexasGameplayObject((RoomType)GameCache.Instance.room_type, this);

        this.UIAddChips.node.active = false;

        this.Seat.active = false;

    }
    private buildMenuButtons() {
        for (let key in this.MenuButtons_Dic) {
            let item: typeof this.IMenuButton_Type = this.MenuButtons_Dic[key];
            let button = cc.instantiate(this.Menu_Button);
            button.parent = this.Menu_Buttons;
            button.active = false;
            button.getChildByName("Text").getComponent(cc.Label).string = item.text;
            button.getChildByName("Text").getComponent(i18nLabel).i18NString = item.i18n_string;
            button.getChildByName("Line").active = !item.hideLine;
            button.on("click", item.onClick, this);
            button.on(cc.Node.EventType.TOUCH_START, this.onMenuButtonTouchStart, this);
            button.on(cc.Node.EventType.TOUCH_END, this.onMenuButtonTouchEnd, this);
            button.on(cc.Node.EventType.TOUCH_CANCEL, this.onMenuButtonTouchEnd, this);
            item.node = button;
        }
        this.Menu_Button.active = false;
    }

    protected regiterTouchEvents(): void {
        this.menu_btn.on("click", this.sideClick, this);
        this.report_btn.on("click", this.sideClick, this);
        this.cursituation_btn.on("click", this.sideClick, this);
        this.chat_btn.on("click", this.sideClick, this);

        this.imageMenuMask.on("click", this.hideMenu, this);

    }


    Enter(param: { fromUI: IUIDefine, lookOn: boolean }): void {

        super.Enter(param);

        if (param != null) { // { fromUI: this.UIDefine, lookOn: false }

            this.game.IsLookOn = param?.lookOn || false;
            //param?.fromUI && UIComponent.close(param.fromUI);
        }

        this.game.setDeskType(this.game.deskType);

    }
    Exit(param) {
        super.Exit(param);
    }

    private sideClick(e: cc.Button) {
        switch (e.node) {
            case this.menu_btn://菜单按钮
                cc.log("menu_btn is clicked");
                //this.CallbackExit();
                if (this.CanClick() == false) return;
                this.lastClickTime = GlobalSession.NowTimeMS;
                this.showMenu();
                break;
            case this.report_btn://报告按钮
                this.Click_Report_Btn();
                cc.log("report_btn is clicked");
                break;
            case this.cursituation_btn://状况按钮
                this.Click_Cursituation_btn();
                cc.log("cursituation_btn is clicked");
                break;
            case this.chat_btn://聊天按钮
                cc.log("chat_btn is clicked");
                break;
        }
    }

    private showMenu(): void {
        this.UpdateMenu();
        if (null != this.transSubMenu)
            cc.tween(this.transSubMenu).to(0.25, { x: -621 }).start();
        if (null != this.imageMenuMask)
            this.imageMenuMask.active = true;
    }
    protected hideMenu(animation: boolean = true): void {
        if (null != this.transSubMenu) {
            if (animation) {
                cc.tween(this.transSubMenu).to(0.25, { x: -1320 }).start();
            } else {
                this.transSubMenu.x = -1320;
            }
        }
        if (null != this.imageMenuMask)
            this.imageMenuMask.active = false;
    }

    protected UpdateMenu(): void {
        UIMineModel.mInstance.ObtainUserInfo(pDto => {
            this.textTotalBean.string = StringHelper.getStringDiv100(GameCache.Instance.gold);
        });
        // //更新金豆

        this.textStoreBean.string = StringHelper.getStringDiv100(this.game.mainPlayer.cacheStoreChips);
        this.textStoreBean.node.parent.active = (this.game.mainPlayer.cacheStoreChips > 0);

        let UserSitdown = this.game.UserSitdown();

        //let menuHeight = UserSitdown == true ? 1615 : 1800;

        this.MenuButtons_Dic.Button_Setting.node.active = true;
        this.MenuButtons_Dic.Button_Rule.node.active = true;
        this.MenuButtons_Dic.Button_Exit.node.active = true;

        if (UserSitdown) //已坐下
        {

            this.MenuButtons_Dic.Button_Standup.node.active = true;
            this.MenuButtons_Dic.Button_AddChips.node.active = true;

            if (this.game.mainPlayer.chips >= GameCache.Instance.carry_small * (this.game.currentMaxRate + 1)) {
                //已带入最大值,不可点击
                this.MenuButtons_Dic.Button_AddChips.node.getComponent(cc.Button).interactable = false;
            }
            else {
                this.MenuButtons_Dic.Button_AddChips.node.getComponent(cc.Button).interactable = true;
            }

            let buttonoutChips: cc.Node = this.MenuButtons_Dic.Button_TakeOut.node;

            if (this.game.CurlimitOutChip == RoomInfo.RetainType.RT_MANUAL && this.game.gamestatus >= 1 && this.game.gamestatus < 7) {
                buttonoutChips.active = true;
                buttonoutChips.getComponent(cc.Button).interactable = true;
                buttonoutChips.getChildByName("Text").color = cc.Color.WHITE;
                buttonoutChips.getChildByName("Text").opacity = 255;
                buttonoutChips.getChildByName("Arrow").active = true;
            }
            else if (this.game.CurlimitOutChip == RoomInfo.RetainType.RT_MANUAL && this.game.gamestatus != 1 && this.game.gamestatus < 7) {
                buttonoutChips.active = true;
                buttonoutChips.getComponent(cc.Button).interactable = false;
                buttonoutChips.getChildByName("Text").color = cc.Color.WHITE;
                buttonoutChips.getChildByName("Text").opacity = 120;
                buttonoutChips.getChildByName("Arrow").active = false;
            }
            else {
                buttonoutChips.active = false;
                buttonoutChips.getComponent(cc.Button).interactable = false;
            }

            let Button_LeaveDesk: cc.Node = this.MenuButtons_Dic.Button_LeaveDesk.node;

            Button_LeaveDesk.active = true;

            if (this.game.gamestatus != 1)//游戏没开始的时候，座离桌按钮显示不可点击状态   !HasStarted()
            {
                Button_LeaveDesk.getChildByName("Text").color = cc.Color.WHITE;
                Button_LeaveDesk.getChildByName("Text").opacity = 120;
                Button_LeaveDesk.getComponent(cc.Button).interactable = false;
                Button_LeaveDesk.getChildByName("Arrow").active = false;
            }
            else {
                Button_LeaveDesk.getChildByName("Text").color = cc.Color.WHITE;
                Button_LeaveDesk.getChildByName("Text").opacity = 255;
                Button_LeaveDesk.getComponent(cc.Button).interactable = true;
                Button_LeaveDesk.getChildByName("Arrow").active = true;
            }
            if (this.game.CurlimitOutChip == RoomInfo.RetainType.RT_AUTO) {
                this.MenuButtons_Dic.Button_SetAutoOnTable.node.active = true;
            }

        }
        else //未坐下
        {
            this.MenuButtons_Dic.Button_Standup.node.active = false;
            this.MenuButtons_Dic.Button_AddChips.node.active = false;
            this.MenuButtons_Dic.Button_Trust.node.active = false;
            this.MenuButtons_Dic.Button_TakeOut.node.active = false;
            this.MenuButtons_Dic.Button_LeaveDesk.node.active = false;
            this.MenuButtons_Dic.Button_SetAutoOnTable.node.active = false;
        }

        // //线路
        // buttonNetline.transform.Find("Text").GetComponent<Text>().text = GlobalData.Instance.NameForServerID(GlobalData.Instance.CurrentUsingServerID());

        // 	RectTransform mRectTransform = transSubMenu as RectTransform;
        // if (null != mRectTransform)
        //     mRectTransform.sizeDelta = new Vector2(mRectTransform.sizeDelta.x, menuHeight);
    }


    /******左侧菜单按钮点击******/
    //站起
    onClickStandup() {
        this.hideMenu();
        if (null == this.game.mainPlayer) {
            ToastManager.Instance.createToast(i18nMgr.Get("Good_luck"));
            //需要进行错误重连
            //Game.EventSystem.Run(EventIdType.GameErrorReconnect);
            return;
        }
        this.game.Standup();
    }
    Click_Button_Rebuy() {

    }
    Click_Button_Owner() {

    }
    Click_Button_Setting() {
        this.hideMenu();
        // let UITexasSetting: any = this.node.getChildByName('UITexasSetting')
        // if (!UITexasSetting) {
        //     let prefab = ResManager.LoadAsset(UIDefine.UITexasSetting.Bundle, UIDefine.UITexasSetting.Path)
        //     // let prefab = AssetContext.getAsset<cc.Prefab>('UITexasSetting', AssetFold.texas_prefab_widgetLayer)
        //     UITexasSetting = cc.instantiate(prefab);
        //     UITexasSetting.parent = this.node
        //     UITexasSetting.active = true;
        // } else {
        //     UITexasSetting.active = true;
        // }
        UIComponent.open(UIDefine.UITexasSettingComponent, null, this.node);

    }
    Click_Button_Rule() {
        this.hideMenu();
        // let UITexasRule: any = this.node.getChildByName('UITexasRule')
        // if (!UITexasRule) {
        //     let prefab = ResManager.LoadAsset(UIDefine.UITexasRule.Bundle, UIDefine.UITexasRule.Path)
        //     // let prefab = AssetContext.getAsset<cc.Prefab>('UITexasSetting', AssetFold.texas_prefab_widgetLayer)
        //     UITexasRule = cc.instantiate(prefab);
        //     UITexasRule.parent = this.node
        //     UITexasRule.active = true;
        // } else {
        //     UITexasRule.active = true;
        // }
        UIComponent.open(UIDefine.UITexasRule, null, this.node);
    }
    Click_Button_SetAutoOnTable() {

    }
    Click_Button_AddChips() {

    }
    Click_Button_TakeOut() {

    }
    Click_Button_Trust() {

    }
    Click_Button_LeaveDesk() {

    }
    Click_Button_Exit() {
        this.CallbackExit();
    }
    Click_Report_Btn() {
        let UITexasReport: any = this.node.getChildByName('UITexasReport')
        let prefab = ResManager.LoadAsset(UIDefine.UITexasReport.Bundle, UIDefine.UITexasReport.Path)
        // let prefab = AssetContext.getAsset<cc.Prefab>('UITexasSetting', AssetFold.texas_prefab_widgetLayer)
        UITexasReport = cc.instantiate(prefab);
        UITexasReport.parent = this.node
        UITexasReport.active = true;

        // let UITexasReport: any = this.node.getChildByName('UITexasReport')
        // if (!UITexasReport) {
        //     let prefab = ResManager.LoadAsset(UIDefine.UITexasReport.Bundle, UIDefine.UITexasReport.Path)
        //     // let prefab = AssetContext.getAsset<cc.Prefab>('UITexasSetting', AssetFold.texas_prefab_widgetLayer)
        //     UITexasReport = cc.instantiate(prefab);
        //     UITexasReport.parent = this.node
        //     UITexasReport.active = true;
        // } else {
        //     UITexasReport.active = true;
        // }
    }
    Click_Cursituation_btn() {
        let UITexasHistory: any = this.node.getChildByName('UITexasHistory')
        let prefab = ResManager.LoadAsset(UIDefine.UITexasHistory.Bundle, UIDefine.UITexasHistory.Path)
        // let prefab = AssetContext.getAsset<cc.Prefab>('UITexasSetting', AssetFold.texas_prefab_widgetLayer)
        UITexasHistory = cc.instantiate(prefab);
        UITexasHistory.parent = this.node
        UITexasHistory.active = true;
        let historyInfoData = new HistoryInfoData()

        historyInfoData.bInsurance = GameCache.Instance.CurGame.insurance;
        historyInfoData.bJackPot = GameCache.Instance.jackPot_on == 1;
        historyInfoData.Blindstr = StringHelper.getStringDiv100(GameCache.Instance.CurGame.smallBlind) + '/' + StringHelper.getStringDiv100(GameCache.Instance.CurGame.bigBlind);
        historyInfoData.bgroupBet = GameCache.Instance.CurGame.groupBet;
        // historyInfoData.rcPokerSprite = rcHistoryPokerSprite,
        historyInfoData.handNum = GameCache.Instance.CurGame.mHandNum;
        UITexasHistory.getComponent('UITexasHistoryComponent').onShow(historyInfoData);
    }



    onMenuButtonTouchStart(e: cc.Event.EventTouch) {
        let target: cc.Node = e.currentTarget;
        target.getChildByName("Text").color = CommonDefine.Color_Yellow;
        target.getChildByName("Arrow").color = CommonDefine.Color_Yellow;
    }
    onMenuButtonTouchEnd(e: cc.Event.EventTouch) {
        let target: cc.Node = e.currentTarget;
        target.getChildByName("Text").color = cc.Color.WHITE;
        target.getChildByName("Arrow").color = cc.Color.WHITE;
    }

    CanClick(): boolean {
        if (GlobalSession.NowTimeMS - this.lastClickTime > 500) {
            return true;
        }
        return false;
    }
    /**
     * 响应退出触发
     */
    public CallbackExit() {
        this.hideMenu(false);
        this.game.TexasGameUtils.LeaveRoom();
    }

}
