import SimpleNodePool from "../common/MyNodePool";

import { UIDefine, UIDefineType } from "../define/UIDefine";
import { Sequence } from "../dotween/DOTween";
import GC from "../frame/GameControl";
import { StringHelper } from "../helper/StringHelper";
import TimeHelper from "../helper/TimeHelper";
import { i18nMgr } from "../i18n/i18nMgr";



import { Bundle_Resources, Bundle_Texas } from "../manager/ResManager";
import MttAgainBuy from "../mtt/detail/MttAgainBuy";


import GlobalSession from "../session/GlobalSession";
import StorageKey from "../session/StorageKey";
import AssetContext from "../ui/component/AssetContext";
import BaseScene from "../ui/scene/BaseScene";
import UIComponent, { PrefabUI } from "../ui/UIComponent";
import { GameCache } from "./GameCache";
import UIAutoBringIn from "./new_ui/UIAutoBringIn";
import UIBringIn from "./new_ui/UIBringIn";
import UIBringOut from "./new_ui/UIBringOut";
import UIInsurancePanel from "./new_ui/UIInsurancePanel";
import TexasGame from "./texas/TexasGame";

import UIAgreeSecondPcsComponent from "./ui/UIAgreeSecondPcsComponent";

import UIAutoOperationComponent from "./ui/UIAutoOperationComponent";
import UIMTTTimeComponent from "./ui/UIMTTTimeComponent";
import UIOperationComponent from "./ui/UIOperationComponent";
import UIOutChipsTipComponent from "./ui/UIOutChipsTipComponent";
import UITexasMenu from "./ui/UITexasMenu";
import GameUtil, { GameEnterType } from "./util/GameUtil";
import Seat from "./seat/Seat";

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
    public potType: number;

    constructor(public trans: cc.Node) {
        if (null != trans) {
            this.imagePotFrame = trans.getChildByName("Image_PotFrame").getComponent(cc.Sprite);
            this.imagePot = trans.getChildByName("Image_Pot").getComponent(cc.Sprite);
            this.textPot = trans.getChildByName("Text_Pot").getComponent(cc.Label);
            this.imagePotText = trans.getChildByName("Image_PotText")?.getComponent(cc.Label);
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

const { ccclass, property, executionOrder } = cc._decorator;

@ccclass
@executionOrder(-1)
export default class UITexas extends BaseScene {

    /**
     * 节点|组件 定义
     */
    //桌布背景
    sp_table_bg: cc.Sprite = null;
    //桌台
    sp_table_face: cc.Sprite = null;
    //桌面主容器
    main: cc.Node = null;

    //桌上边缘按钮
    btn_menu: cc.Node = null;
    btn_msg: cc.Node = null;
    btn_report: cc.Node = null;
    btn_poker: cc.Node = null;
    //座位节点容器
    seats_content: cc.Node = null;

    textRoomInfo: cc.Label = null;
    RemainingSquidCount: cc.Node = null;
    RemainingSquidLabelCount: cc.Label = null;
    SquidStart: cc.Node = null;
    SquidStartAnim: cc.Animation = null;

    //补盲按钮
    buttonWaitBlind: cc.Node = null;


    Image_WaitForStartTips: cc.Node = null;
    Image_ReserveSeatTips: cc.Node = null;
    Image_InsuranceTips: cc.Node = null;

    //座位模板
    Seat_Temp: cc.Node = null;


    Text_AlreadAnte: cc.Label = null;
    //个性设置界面
    //UITexasSetting: cc.Node = null;


    public transPots: cc.Node = null;
    public transPot: cc.Node = null;
    public transAllPot: cc.Node = null;


    Button_Delay: cc.Node = null;
    Button_SeeMorePublic: cc.Node = null;
    Image_SeeMorePublicTips: cc.Node = null;
    textSeeMorePublicTips: cc.Label = null;

    textSeeMorePublic: cc.Label = null;
    textSeeMorePublicGold: cc.Label = null;

    Button_CancelTrust: cc.Node = null;
    Text_CancelTrust: cc.Label = null;

    //MTT
    //public buttonRebuy: cc.Node = null;
    public Button_AddOn: cc.Node = null;
    public transCountDownView: cc.Node = null;
    //拆并桌文本提示
    public Image_RedistributionTips: cc.Node = null;
    public Image_WaitForStartBathTips: cc.Node = null;
    public pullDownText: cc.Label = null;
    public BathText: cc.Label = null;


    //带入申请按钮
    //Button_BringIn: cc.Node = null;
    //朋友桌邀请码
    Text_InvateCode: cc.Label = null;


    //1.MTT比赛倒计时
    UIMTTTime_Con: cc.Node = null;
    UIMTTTime_Com: UIMTTTimeComponent = null;
    //2.操作面板
    UIOperation_Con: cc.Node = null;
    UIOperation_Com: UIOperationComponent = null;
    UIAutoOperation_Com: UIAutoOperationComponent = null;
    //3.左侧菜单容器
    UITexasMenu_Con: cc.Node = null;
    //UITexasMenu_Com: UITexasMenuComponent = null;
    UITexasMenu: UITexasMenu = null;
    //4.通用容器 放置 桌面设置，实时战况，战绩
    Common_Con: cc.Node = null;
    //5.带入带出 OutChips提示
    UIChips_Con: cc.Node = null;
    //UIAddChips_Com: UIAddChipsComponent = null;
    //UIOutChips_Com: UIOutChipsComponent = null;
    //UIAutoChips_Com: UIAutoChipsComponent = null;
    UIOutChipsTip_Com: UIOutChipsTipComponent = null;

    UIBringIn: UIBringIn = null;
    UIAutoBringIn: UIAutoBringIn = null;
    UIBringOut: UIBringOut = null;
    //6.保险面板
    UIInsurance_Con: cc.Node = null;
    UIInsurancePanel: UIInsurancePanel = null;
    //7.二套牌投票面板
    UIAgreeSecondPcs_Con: cc.Node = null;
    UIAgreeSecondPcs_Com: UIAgreeSecondPcsComponent = null;
    //8.MTT重购面板
    MttAgainBuy_Con: cc.Node = null;
    MttAgainBuy: MttAgainBuy = null;
    ///////////////////////////////////
    /**
     * 声明内容
     */
    listCards: PublicCardInfo[] = null;
    listSecondCards: PublicCardInfo[] = null;
    listPotInfo: PotInfo[] = null;


    game: TexasGame = null;

    TransPot_Pool: SimpleNodePool = null;
    TransAllPot_Pool: SimpleNodePool = null;


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
    update(dt: number) {
        this.game?.Update(dt);
    }
    protected lateLoad(): void {

        this.name = "UITexas";

        super.lateLoad();

        this.sp_table_bg = this.getChildNodeOrComponent("sp_table_bg", cc.Sprite);
        this.sp_table_face = this.getChildNodeOrComponent("sp_table_face", cc.Sprite);
        this.main = this.getChildNodeOrComponent("main");

        this.btn_menu = this.getChildNodeOrComponent("btn_menu");
        this.btn_msg = this.getChildNodeOrComponent("btn_msg");
        this.btn_report = this.getChildNodeOrComponent("btn_report");
        this.btn_poker = this.getChildNodeOrComponent("btn_poker");

        this.seats_content = this.getChildNodeOrComponent("seats_content");


        this.textRoomInfo = this.getChildNodeOrComponent("Text_RoomInfo", cc.Label);

        this.Image_WaitForStartTips = this.getChildNodeOrComponent("Image_WaitForStartTips");
        this.Image_ReserveSeatTips = this.getChildNodeOrComponent("Image_ReserveSeatTips");
        this.Image_InsuranceTips = this.getChildNodeOrComponent("Image_InsuranceTips");

        this.seats_content = this.getChildNodeOrComponent("seats_content");
        this.Seat_Temp = this.getChildNodeOrComponent("Seat_Temp");
        this.RemainingSquidCount = this.main?.getChildByName("RemainingSquidCount");
        this.RemainingSquidLabelCount = this.RemainingSquidCount
            ?.getChildByName("RemainingSquidLabel")
            ?.getChildByName("RemainingSquidLabelCount")
            ?.getComponent(cc.Label);
        if (this.RemainingSquidCount) {
            this.RemainingSquidCount.active = false;
        }
        this.SquidStart = this.getChildNodeOrComponent("squid_start");
        this.SquidStartAnim = this.SquidStart?.getComponent(cc.Animation);
        if (this.SquidStart) {
            this.SquidStart.active = false;
            this.SquidStartAnim?.stop();
        }

        //this.UIOutChips = this.getChildNodeOrComponent("UIOutChips", UIOutChipsComponent);
        this.buttonWaitBlind = this.getChildNodeOrComponent("Button_WaitBlind");

        this.Text_AlreadAnte = this.getChildNodeOrComponent("Text_AlreadAnte", cc.Label);


        this.transPots = this.getChildNodeOrComponent("Pots");
        this.transPot = this.getChildNodeOrComponent("Pot");
        this.transAllPot = this.getChildNodeOrComponent("AllPot");




        this.Button_Delay = this.getChildNodeOrComponent("Button_Delay");
        this.Button_SeeMorePublic = this.getChildNodeOrComponent("Button_SeeMorePublic");
        this.Image_SeeMorePublicTips = this.getChildNodeOrComponent("Image_SeeMorePublicTips");
        this.textSeeMorePublicTips = this.getChildNodeOrComponent("Text_SeeMorePublicTips", cc.Label);

        this.textSeeMorePublic = this.getChildNodeOrComponent("Text_SeeMorePublic", cc.Label);
        this.textSeeMorePublicGold = this.getChildNodeOrComponent("Text_SeeMorePublicGold", cc.Label);

        //托管
        this.Button_CancelTrust = this.getChildNodeOrComponent("Button_CancelTrust");
        this.Text_CancelTrust = this.getChildNodeOrComponent("Text_CancelTrust", cc.Label);
        //MTT
        this.Button_AddOn = this.getChildNodeOrComponent("Button_AddOn");
        this.Image_RedistributionTips = this.getChildNodeOrComponent("Image_RedistributionTips");
        this.pullDownText = this.Image_RedistributionTips.getChildByName("Text_Tips")?.getComponent(cc.Label);
        //this.armatureRewardCircleZH = rc.Get<GameObject>("Armature_RewardCircle_zh").GetComponent<UnityArmatureComponent>();
        //this.armatureRewardCircleEN = rc.Get<GameObject>("Armature_RewardCircle_en").GetComponent<UnityArmatureComponent>();
        this.Image_WaitForStartBathTips = this.getChildNodeOrComponent("Image_WaitForStartBathTips");
        this.BathText = this.Image_WaitForStartBathTips?.getChildByName("Text_Tips")?.getComponent(cc.Label);
        //this.Button_BringIn = this.getChildNodeOrComponent("Button_BringIn");
        //朋友桌邀请码
        this.Text_InvateCode = this.getChildNodeOrComponent("Text_InvateCode", cc.Label);


        //////////////////公共牌数据（第一套和第二套 ui,id,每套牌5张）
        this.listCards = [];
        this.listSecondCards = [];
        for (let i = 0; i < 5; i++) {
            this.listCards.push(new PublicCardInfo(-1, this.getChildNodeOrComponent(`Image_PublicCard${i}`)));
            this.listSecondCards.push(new PublicCardInfo(-1, this.getChildNodeOrComponent(`Image_SecondPublicCard${i}`)));
        }
        //////////////////创建Pot/////////////////////////////////
        this.transAllPot.active = false;
        this.transPot.active = false;
        this.listPotInfo = [new PotInfo(this.transAllPot)];
        for (let i = 0; i < 8; i++) {
            let pot = cc.instantiate(this.transPot);
            pot.parent = this.transPots;
            this.listPotInfo.push(new PotInfo(pot));
        }


        //////////////////装载容器

        //1.MTT比赛倒计时
        this.UIMTTTime_Con = this.getChildNodeOrComponent("UIMTTTime_Con");
        this.UIMTTTime_Com = this.AddComponents(PrefabUI.UIMTTTimeComponent, this.UIMTTTime_Con);
        //2.操作面板
        this.UIOperation_Con = this.getChildNodeOrComponent("UIOperation_Con");
        this.UIOperation_Com = this.AddComponents(PrefabUI.UIOperationComponent, this.UIOperation_Con);
        this.UIAutoOperation_Com = this.AddComponents(PrefabUI.UIAutoOperationComponent, this.UIOperation_Con);
        //3.菜单
        this.UITexasMenu_Con = this.getChildNodeOrComponent("UITexasMenu_Con");
        //this.UITexasMenu_Com = this.AddComponents(PrefabUI.UITexasMenuComponent, this.UITexasMenu_Con, true);
        this.UITexasMenu = this.AddComponents(PrefabUI.UITexasMenu, this.UITexasMenu_Con, true);

        //4.通用容器 放置 桌面设置，实时战况，战绩
        this.Common_Con = this.getChildNodeOrComponent("Common_Con");
        //5.带入面板 带出面板
        this.UIChips_Con = this.getChildNodeOrComponent("UIChips_Con");
        //this.UIAddChips_Com = this.AddComponents(PrefabUI.UIAddChipsComponent, this.UIChips_Con);
        //this.UIOutChips_Com = this.AddComponents(PrefabUI.UIOutChipsComponent, this.UIChips_Con);
        //this.UIAutoChips_Com = this.AddComponents(PrefabUI.UIAutoChipsComponent, this.UIChips_Con);
        this.UIOutChipsTip_Com = this.AddComponents(PrefabUI.UIOutChipsTipComponent, this.UIChips_Con);
        this.UIBringIn = this.AddComponents(PrefabUI.UIBringIn, this.UIChips_Con);
        this.UIAutoBringIn = this.AddComponents(PrefabUI.UIAutoBringIn, this.UIChips_Con);
        this.UIBringOut = this.AddComponents(PrefabUI.UIBringOut, this.UIChips_Con);
        //6.保险面板
        this.UIInsurance_Con = this.getChildNodeOrComponent("UIInsurance_Con");
        this.UIInsurancePanel = this.AddComponents(PrefabUI.UIInsurancePanel, this.UIInsurance_Con);
        //7.二套牌投票面板
        this.UIAgreeSecondPcs_Con = this.getChildNodeOrComponent("UIAgreeSecondPcs_Con");
        this.UIAgreeSecondPcs_Com = this.AddComponents(PrefabUI.UIAgreeSecondPcsComponent, this.UIAgreeSecondPcs_Con);
        //8.MTT重购面板
        this.MttAgainBuy_Con = this.getChildNodeOrComponent("UIMttSignDialog_Con");
        //this.UIMttSignDialog_Com = this.AddComponents(PrefabUI.UIMttSignDialogComponent, this.UIMttSignDialog_Con, false, Bundle_Resources);
        this.MttAgainBuy = this.AddComponents(PrefabUI.MttAgainBuy, this.MttAgainBuy_Con, false, Bundle_Resources);
        //////////////////////////////////////////////////////////////////////
        //////////////////初始化杂类
        //隐藏座位模板
        //this.Seat_Temp.removeComponent(cc.Widget);
        this.Seat_Temp.active = false;
        //Pot对象池
        this.TransPot_Pool = new SimpleNodePool(this.transPot);
        this.TransAllPot_Pool = new SimpleNodePool(this.transAllPot);
    }


    //从预制体添加到容器
    AddComponents(prefab_name: string, parent: cc.Node, show: boolean = false, bundle: string = Bundle_Texas) {
        let prefab: cc.Prefab = AssetContext.getAsset(prefab_name, bundle);
        let com = null;
        if (prefab) {
            com = cc.instantiate(prefab).getComponent(prefab_name);
            if (com) {
                UIComponent.Instance.SetPrefabNode(prefab_name, com.node);
                com.node.parent = parent;
                com.node.active = show;
                if (show) {

                }
            }
        }
        return com;
    }
    protected regiterTouchEvents(): void {

        this.setButtonClick(this.btn_menu, this.click_side_button);
        this.setButtonClick(this.btn_msg, this.click_side_button);
        this.setButtonClick(this.btn_report, this.click_side_button);
        this.setButtonClick(this.btn_poker, this.click_side_button);
        ///////////////////////////

        this.setButtonClick(this.Button_Delay, this.onClickDelay);
        this.setButtonClick(this.Button_SeeMorePublic, this.onClickSeeMorePublic);

        this.setButtonClick(this.Button_AddOn, this.onClickAddOn);

        //this.setButtonClick(this.Button_BringIn, this.onClickBringIn);

        this.setButtonClick(this.Button_CancelTrust, this.onClickCancelTrust);

    }


    Enter(param: { game_enter_type: GameEnterType, isLookOn: boolean }): void {

        super.Enter(param);

        this.AdaptiveMain();

        this.game = GameCache.Instance.CurGame;

        this.game.uirc = this;

        this.game.InitPublicLocalPos();

        this.game.IsLookOn = param?.isLookOn ?? false;

        this.game.SetDeskType(this.game.deskType);
        // 分池UI
        if (null == this.listPotInfo) this.listPotInfo = [];

        this.EnterInitUI();

    }
    //适配
    AdaptiveMain() {
        //高度小于目标进行缩放
        let view_height = cc.view.getVisibleSize().height;

        let limit_height = 2400;

        if (view_height <= limit_height) {

            this.main.height = 2688;

            let scale = view_height / 2688;

            scale *= 1.09;

            this.main.setScale(scale, scale);

        } else {

            this.main.setScale(1, 1);

            this.main.height = view_height;
        }
    }
    //进入初始UI
    EnterInitUI() {
        //this.ShowInvateCode();
        //this.setActive(this.Button_BringIn, false);
        this.setActive(this.Button_AddOn, false);
        //消息按钮显示
        this.btn_msg.active = GameUtil.GetFriendsOrClubTable() == 1 || GameUtil.GetFriendsOrClubTable() == 2;
    }
    //清理UI
    CleanUI() {
        //隐藏面板
        [
            //PrefabUI.UIAddChipsComponent,
            PrefabUI.UIOutChipsComponent,
            PrefabUI.UIOperationComponent,
            PrefabUI.UIAutoOperationComponent,
            PrefabUI.UIAutoChipsComponent,
            PrefabUI.UIMTTTimeComponent,
            PrefabUI.UIOutChipsTipComponent,
            PrefabUI.UIAgreeSecondPcsComponent,
            PrefabUI.UIMttSignDialogComponent,
            PrefabUI.UIBringIn,
            PrefabUI.UIBringOut,
            PrefabUI.UIAutoBringIn,
            PrefabUI.UIInsurancePanel,
        ].forEach(item => {
            UIComponent.Instance.HideUI(item);
        });
        //隐藏节点
        [
            //this.Button_BringIn,
            this.Button_AddOn,
            this.buttonWaitBlind,

            this.Image_WaitForStartTips,
            this.Image_RedistributionTips,
            this.Image_WaitForStartBathTips,
            this.Image_ReserveSeatTips,
            this.Image_InsuranceTips,
        ].forEach(item => {
            this.setActive(item, false);
        });
        //关闭菜单
        this.HideMenu(false);
        //关闭个人信息
        UIComponent.close(UIDefine.UITexasPlayerInfo);
        //关闭设置
        UIComponent.close(UIDefine.UITexasSettingComponent);
        //关闭规则
        UIComponent.close(UIDefine.UITexasRule);
        //关闭战况
        UIComponent.close(UIDefine.UITexasReportComponent);
        //关闭战绩
        UIComponent.close(UIDefine.UITexasHistoryComponent);
    }
    Exit(param) {
        super.Exit(param);
    }
    /// <param name="num"></param>几张
    /// <param name="premium"></param>保费
    /// <param name="paynum"></param>赔付金额
    public async ShowInsuranceTip(num: number, premium: number, paynum: number) {
        this.Image_InsuranceTips.active = true;
        this.Image_InsuranceTips.getChildByName("Text_Tips").getComponent(cc.Label).string = `${i18nMgr.Get("UILobby_Menu_menu_btn_my")}......\n` + StringHelper.Format(i18nMgr.Get("UIInsurance_tips001"), [num.toString(), StringHelper.GetLongString(premium), StringHelper.GetLongString(paynum)]);
        await TimeHelper.Sleep(2000);
        if (this.Image_InsuranceTips.activeInHierarchy) {
            this.Image_InsuranceTips.active = false;
        }
        // await TimeHelper.Sleep(1000);
        // if (this.Image_InsuranceTips.activeInHierarchy) {
        //     this.Image_InsuranceTips.active = false;
        // }
    }

    onClickCancelTrust() {
        if (!this.game.mainPlayer.IsAutoOp) {
            return;
        }
        this.game.SendTrustAction(false);
    }



    // public ShowBringIn() {
    //     this.setActive(this.Button_BringIn, true);
    // }

    public ShowMenu(): void {
        //this.UITexasMenu_Com?.onShow();
        this.UITexasMenu?.onShow();
    }
    public HideMenu(animation: boolean = true): void {
        //this.UITexasMenu_Com?.onClose(animation);
        this.UITexasMenu?.onClose(animation);
    }

    Click_Report_Btn() {
        this.game.onClickReport();
    }

    Click_Cursituation_btn() {
        this.game.onClickCurSituation();
    }

    public UpdateBarragePanelActive(): void {
        //this.barrageAnimationSequence = DOTween.Sequence(this.barrageAnimationSequence_obj);
        let OpenBarrage: number = + GC.localStore.getItem(StorageKey.OpenBarrage);
        this.barragePanel && (this.barragePanel.active = (OpenBarrage != 2));
        this.barrageIndex = 0;
    }

    // onClickBringIn() {
    //     UIComponent.open(UIDefine.UIApplyJoin);
    //     this.setActive(this.Button_BringIn, false);
    // }
    private onClickAddOn() {
        this.game.onClickAddOn();
    }
    //加时点击
    private onClickDelay() {
        this.game.onClickDelay();
    }
    private onClickSeeMorePublic() {
        this.game.onClickSeeMorePublic();
    }

    public async ShowInsuranceTipJieSuan(paynum: number) {
        this.Image_InsuranceTips.active = true;
        this.Image_InsuranceTips.getChildByName("Text_Tips").getComponent(cc.Label).string = StringHelper.Format(i18nMgr.Get("UIInsurance_tips003"), [StringHelper.GetLongString(paynum)]);
        await TimeHelper.Sleep(2000);
        if (this.Image_InsuranceTips.activeInHierarchy) {
            this.Image_InsuranceTips.active = false;
        }
    }

    //边角按钮点击
    private click_side_button(e: cc.Button) {

        if (this.game.CanClick() == false) return;
        this.game.lastClickTime = GlobalSession.NowTimeMS;
        switch (e.node) {
            case this.btn_menu://菜单按钮
                this.ShowMenu();
                break;
            case this.btn_msg://消息
                if (GameUtil.GetFriendsOrClubTable() == 1) {
                    UIComponent.open(UIDefine.UIMsgBring, { from: 0, name: "UIClub_RoomSitApplyRecords_title" });
                }
                if (GameUtil.GetFriendsOrClubTable() == 2) {
                    UIComponent.open(UIDefine.UIMsgBring, { from: 1, name: "UIClub_RoomSitApplyRecords_title" });
                }
                break;
            case this.btn_report://实时战况
                this.Click_Report_Btn();
                break;
            case this.btn_poker://战绩牌谱
                this.Click_Cursituation_btn();
                break;
        }
    }
}
