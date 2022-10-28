import SimpleNodePool from "../common/MyNodePool";
import { IUIDefine } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import { DOTween, Sequence } from "../dotween/DOTween";
import GC from "../frame/GameControl";

import { StringHelper } from "../helper/StringHelper";

import { i18nMgr } from "../i18n/i18nMgr";

import { Bundle_Texas, ResManager } from "../manager/ResManager";

import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../net/websocket/ProtocolCode";


import { Def, RoomInfo } from "../protobuf/holdem/define_pb";
import { ClientMessageAddOn } from "../protobuf/holdem/req_add_on_pb";
import { ClientMessageAddTime } from "../protobuf/holdem/req_add_time_pb";
import { ClientMessageShowPublicCards } from "../protobuf/holdem/req_show_public_cards_pb";
import GlobalSession from "../session/GlobalSession";
import StorageKey from "../session/StorageKey";
import AssetContext from "../ui/component/AssetContext";
import LabelCDTime from "../ui/component/LabelCDTime";
import BaseScene from "../ui/scene/BaseScene";
import UIComponent, { PrefabUI } from "../ui/UIComponent";
import { GameCache } from "./GameCache";


import TexasGame from "./texas/TexasGame";
import UIAddChipsComponent, { AddClipsData } from "./ui/UIAddChipsComponent";
import UIAutoChipsComponent from "./ui/UIAutoChipsComponent";
import UIAutoOperationComponent from "./ui/UIAutoOperationComponent";
import UIInsuranceComponent from "./ui/UIInsuranceComponent";
import UIOperationComponent from "./ui/UIOperationComponent";
import UIOutChipsComponent, { OutClipsData } from "./ui/UIOutChipsComponent";
import UITexasMenuComponent from "./ui/UITexasMenuComponent";
import { HistoryInfoData } from "./UITexasHistoryComponent";
import GameUtil from "./util/GameUtil";


export class PlayerBarrageRecord {
    public name: string;
    public time: number;
    public msg: string;

}
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
    //设置卡牌id并且刷新显示
    SetSpriteFrame(cardId: number) {
        this.cardId = cardId;
        this.UpdateSpriteFrame();
    }
    //刷新显示
    UpdateSpriteFrame() {
        this.imageCard.spriteFrame = GameCache.Instance.CurGame.GetBigPokerSP(GameUtil.GetCardNameByNum(this.cardId));
    }
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexas extends BaseScene {

    /**
     * 节点|组件 定义
     */
    //desk_bg: cc.Sprite = null;
    //table_bg: cc.Sprite = null;
    Desk: cc.Sprite = null;

    menu_btn: cc.Node = null;
    report_btn: cc.Node = null;
    cursituation_btn: cc.Node = null;
    chat_btn: cc.Node = null;

    textRoomInfo: cc.Label = null;

    //补盲按钮
    buttonWaitBlind: cc.Node = null;

    imageSelectSeatTips: cc.Node = null;
    imageWaitForStartTips: cc.Node = null;
    imageReserveSeatTips: cc.Node = null;

    //座位节点容器
    Seats: cc.Node = null;
    //座位模板
    Seat_Temp: cc.Node = null;


    //UIAddChips: UIAddChipsComponent = null;
    UIOutChips: UIOutChipsComponent = null;

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
    buttonSeeMorePublic: cc.Node = null;
    imageSeeMorePublicTips: cc.Node = null;
    textSeeMorePublicTips: cc.Label = null;
    s
    textSeeMorePublic: cc.Label = null;
    textSeeMorePublicGold: cc.Label = null;

    buttonCancelTrust: cc.Node = null;

    //MTT
    //public buttonRebuy: cc.Node = null;
    public buttonAddOn: cc.Node = null;
    public transCountDownView: cc.Node = null;
    //拆并桌文本提示
    public Image_RedistributionTips: cc.Node = null;
    public Image_WaitForStartBathTips: cc.Node = null;
    public pullDownText: cc.Label = null;
    public BathText: cc.Label = null;



    //带入申请按钮
    Button_BringIn: cc.Node = null;

    //1.左侧菜单容器
    UITexasMenu_Con: cc.Node = null;
    UITexasMenu_Com: UITexasMenuComponent = null;
    //2.带入带出
    UIChips_Con: cc.Node = null;
    UIAddChips_Com: UIAddChipsComponent = null;
    UIOutChips_Com: UIOutChipsComponent = null;
    UIAutoChips_Com: UIAutoChipsComponent = null;
    //3.操作面板
    UIOperation_Con: cc.Node = null;
    UIOperation_Com: UIOperationComponent = null;
    UIAutoOperation_Com: UIAutoOperationComponent = null;
    //4.保险面板
    UIInsurance_Con: cc.Node = null;
    UIInsurance_Com: UIInsuranceComponent = null;
    ///////////////////////////////////
    /**
     * 声明内容
     */
    listCards: PublicCardInfo[] = null;
    listSecondCards: PublicCardInfo[] = null;
    listPotInfo: PotInfo[] = null;


    game: TexasGame = null;

    lastClickTime: number = 0;

    TransPot_Pool: SimpleNodePool = null;


    //#region 弹幕界面
    /// <summary>
    /// 弹幕界面
    /// </summary>
    private barragePanel: cc.Node = null;
    private barrageItemOrdinary: cc.Node = null;
    private barrageItemCool: cc.Node = null;
    private barrageItemColorful: cc.Node = null;
    private barrageParenPos: cc.Node[] = null;
    private barrageIndex: number = 0;
    public barrageRecordList: PlayerBarrageRecord[] = [];
    public barrageCountDown: number = 0;
    private barrageAnimationSequence_obj = {};
    private barrageAnimationSequence: Sequence<{}> = null;
    //#endregion



    ///////////////////////////////////
    protected lateLoad(): void {

        super.lateLoad();

        //this.desk_bg = this.getChildNodeOrComponent("desk_bg", cc.Sprite);
        //this.table_bg = this.getChildNodeOrComponent("table_bg", cc.Sprite);
        this.Desk = this.getChildNodeOrComponent("Desk", cc.Sprite);

        this.menu_btn = this.getChildNodeOrComponent("menu_btn");
        this.report_btn = this.getChildNodeOrComponent("report_btn");
        this.cursituation_btn = this.getChildNodeOrComponent("cursituation_btn");
        this.chat_btn = this.getChildNodeOrComponent("chat_btn");
        this.textRoomInfo = this.getChildNodeOrComponent("Text_RoomInfo", cc.Label);
        this.imageSelectSeatTips = this.getChildNodeOrComponent("Image_SelectSeatTips");
        this.imageWaitForStartTips = this.getChildNodeOrComponent("Image_WaitForStartTips");
        this.imageReserveSeatTips = this.getChildNodeOrComponent("Image_ReserveSeatTips");

        this.Seats = this.getChildNodeOrComponent("Seats");
        this.Seat_Temp = this.getChildNodeOrComponent("Seat_Temp");
        //this.UIAddChips = this.getChildNodeOrComponent("UIAddChips", UIAddChipsComponent);
        this.UIOutChips = this.getChildNodeOrComponent("UIOutChips", UIOutChipsComponent);
        this.buttonWaitBlind = this.getChildNodeOrComponent("Button_WaitBlind");

        this.textAlreadAnte = this.getChildNodeOrComponent("Text_AlreadAnte", cc.Label);


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


        this.buttonDelay = this.getChildNodeOrComponent("Button_Delay");
        this.buttonSeeMorePublic = this.getChildNodeOrComponent("Button_SeeMorePublic");
        this.imageSeeMorePublicTips = this.getChildNodeOrComponent("Image_SeeMorePublicTips");
        this.textSeeMorePublicTips = this.getChildNodeOrComponent("Text_SeeMorePublicTips", cc.Label);

        this.textSeeMorePublic = this.getChildNodeOrComponent("Text_SeeMorePublic", cc.Label);
        this.textSeeMorePublicGold = this.getChildNodeOrComponent("Text_SeeMorePublicGold", cc.Label);

        this.buttonCancelTrust = this.getChildNodeOrComponent("Button_CancelTrust");

        //MTT
        this.buttonAddOn = this.getChildNodeOrComponent("Button_AddOn");
        this.Image_RedistributionTips = this.getChildNodeOrComponent("Image_RedistributionTips");
        this.pullDownText = this.Image_RedistributionTips.getChildByName("Text_Tips")?.getComponent(cc.Label);
        //this.armatureRewardCircleZH = rc.Get<GameObject>("Armature_RewardCircle_zh").GetComponent<UnityArmatureComponent>();
        //this.armatureRewardCircleEN = rc.Get<GameObject>("Armature_RewardCircle_en").GetComponent<UnityArmatureComponent>();
        this.Image_WaitForStartBathTips = this.getChildNodeOrComponent("Image_WaitForStartBathTips");
        this.BathText = this.Image_WaitForStartBathTips?.getChildByName("Text_Tips")?.getComponent(cc.Label);

        this.Button_BringIn = this.getChildNodeOrComponent("Button_BringIn");

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

        this.Seat_Temp.active = false;

        this.TransPot_Pool = new SimpleNodePool(this.transPot);

        //////////////////装载容器
        //1.菜单
        this.UITexasMenu_Con = this.getChildNodeOrComponent("UITexasMenu_Con");
        this.UITexasMenu_Com = this.AddComponents(PrefabUI.UITexasMenuComponent, this.UITexasMenu_Con, true);
        //2.带入面板 带出面板
        this.UIChips_Con = this.getChildNodeOrComponent("UIChips_Con");
        this.UIAddChips_Com = this.AddComponents(PrefabUI.UIAddChipsComponent, this.UIChips_Con);
        this.UIOutChips_Com = this.AddComponents(PrefabUI.UIOutChipsComponent, this.UIChips_Con);
        this.UIAutoChips_Com = this.AddComponents(PrefabUI.UIAutoChipsComponent, this.UIChips_Con);
        //3.操作面板
        this.UIOperation_Con = this.getChildNodeOrComponent("UIOperation_Con");
        this.UIOperation_Com = this.AddComponents(PrefabUI.UIOperationComponent, this.UIOperation_Con);
        this.UIAutoOperation_Com = this.AddComponents(PrefabUI.UIAutoOperationComponent, this.UIOperation_Con);
        //4.保险面板
        this.UIInsurance_Con = this.getChildNodeOrComponent("UIInsurance_Con");
        this.UIInsurance_Com = this.AddComponents(PrefabUI.UIInsuranceComponent, this.UIInsurance_Con);
    }





    //从预制体添加到容器
    AddComponents(prefab_name: string, parent: cc.Node, show: boolean = false) {
        let prefab: cc.Prefab = AssetContext.getAsset(prefab_name, Bundle_Texas);
        let com = null;
        if (prefab) {
            com = cc.instantiate(prefab).getComponent(prefab_name);
            if (com) {
                UIComponent.Instance.SetPrefabNode(prefab_name, com.node);
                com.node.parent = parent;
                com.node.active = show;
            }
        }
        return com;
    }
    protected regiterTouchEvents(): void {

        this.setButtonClick(this.menu_btn, this.sideClick);
        this.setButtonClick(this.report_btn, this.sideClick);
        this.setButtonClick(this.cursituation_btn, this.sideClick);
        this.setButtonClick(this.chat_btn, this.sideClick);


        this.setButtonClick(this.buttonDelay, this.onClickDelay);
        this.setButtonClick(this.buttonSeeMorePublic, this.onClickSeeMorePublic);

        this.setButtonClick(this.buttonAddOn, this.onClickAddOn);

        this.setButtonClick(this.Button_BringIn, this.onClickBringIn);


    }

    Enter(param: { fromUI: IUIDefine, lookOn: boolean }): void {

        super.Enter(param);

        this.game = GameCache.Instance.CurGame;

        this.game.uirc = this;

        this.game.InitPublicLocalPos();

        // if (param != null) { // { fromUI: this.UIDefine, lookOn: false }
        //     this.game.IsLookOn = param?.lookOn || false;
        // }
        this.game.SetDeskType(this.game.deskType);
        // 分池UI
        if (null == this.listPotInfo) this.listPotInfo = [];

    }
    ClearUI() {
        UIComponent.Instance.HideUI(PrefabUI.UIAddChipsComponent);
        UIComponent.Instance.HideUI(PrefabUI.UIOutChipsComponent);
        this.HideMenu(false);
    }
    Exit(param) {
        this.ClearUI();
        super.Exit(param);
    }
    // CanClick(): boolean {
    //     if (GetNowTime() - lastClickTime > 500) {
    //         return true;
    //     }
    //     return false;
    // }

    private onClickSeeMorePublic() {
        if (this.CanClick() == false)
            return;
        this.lastClickTime = GlobalSession.NowTimeMS;

        let button = this.buttonSeeMorePublic.getChildByName("click").getComponent(cc.Button);

        if (button.interactable == false) {
            return;
        }
        button.interactable = false;

        ProtocolAgency.Send<ClientMessageShowPublicCards.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_ShowPublicCards,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                round: this.game.cacheRound,
                consume: Def.ConsumeType.CT_VC_2,
            },
        });

    }
    private sideClick(e: cc.Button) {
        switch (e.node) {
            case this.menu_btn://菜单按钮
                //this.CallbackExit();
                if (this.CanClick() == false) return;
                this.lastClickTime = GlobalSession.NowTimeMS;
                this.ShowMenu();
                break;
            case this.report_btn://报告按钮
                this.Click_Report_Btn();
                break;
            case this.cursituation_btn://状况按钮
                this.Click_Cursituation_btn();
                break;
            case this.chat_btn://聊天按钮

                UIComponent.Instance.Toast();
                break;
        }
    }

    public ShowMenu(): void {
        this.UITexasMenu_Com?.onShow();
    }
    public HideMenu(animation: boolean = true): void {
        this.UITexasMenu_Com?.onClose(animation);
    }

    Click_Report_Btn() {

        UIComponent.open(UIDefine.UITexasReportComponent, null, { parentUI: this.node });
    }

    Click_Cursituation_btn() {
        let historyInfoData = new HistoryInfoData()
        historyInfoData.bInsurance = GameCache.Instance.CurGame.insurance;
        historyInfoData.bJackPot = GameCache.Instance.jackPot_on == 1;
        historyInfoData.Blindstr = StringHelper.getStringDiv100(GameCache.Instance.CurGame.smallBlind) + '/' + StringHelper.getStringDiv100(GameCache.Instance.CurGame.bigBlind);
        historyInfoData.bgroupBet = GameCache.Instance.CurGame.groupBet;
        historyInfoData.handNum = GameCache.Instance.CurGame.mHandNum;
        UIComponent.open(UIDefine.UITexasHistoryComponent, historyInfoData, { parentUI: this.node })
    }
    protected onClickDelay(): void {
        if (this.CanClick() == false)
            return;
        this.lastClickTime = GlobalSession.NowTimeMS;
        if (this.game.delayCount >= 2)
            return;

        if (!this.UIOperation_Com.node.activeInHierarchy) {
            UIComponent.Instance.Toast(i18nMgr.Get("ServerErrorCode_31045"));
            return;
        }
        ProtocolAgency.Send<ClientMessageAddTime.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_AddTime,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                consume: this.game.TexasGameUtils.GetOpDelayConsumeType(),
            },
        });
    }

    CanClick(): boolean {
        if (GlobalSession.NowTimeMS - this.lastClickTime > 500) {
            return true;
        }
        return false;
    }

    public UpdateBarragePanelActive(): void {
        //this.barrageAnimationSequence = DOTween.Sequence(this.barrageAnimationSequence_obj);
        let OpenBarrage: number = + GC.localStore.getItem(StorageKey.OpenBarrage);
        this.barragePanel && (this.barragePanel.active = (OpenBarrage != 2));
        this.barrageIndex = 0;
    }

    /**
     * 响应退出触发
     */
    public CallbackExit() {
        this.HideMenu(false);
        this.game.TexasGameUtils.LeaveRoom();
    }
    onClickBringIn() {
        UIComponent.open(UIDefine.UIApplyJoin);
        this.game.HideBringIn();
    }
    private onClickAddOn() {
        this.game.onClickAddOn();
    }
}
