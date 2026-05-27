import SimpleNodePool from '../common/MyNodePool';
import { UIDefine } from '../define/UIDefine';
import { Sequence } from '../dotween/DOTween';
import GC from '../frame/GameControl';
import PublicHelper from '../helper/PublicHelper';
import { StringHelper } from '../helper/StringHelper';
import TimeHelper from '../helper/TimeHelper';
import { i18nMgr } from '../i18n/i18nMgr';
import { BUNDLE_RESOURCES, BUNDLE_TEXAS } from '../manager/ResManager';
import MttAgainBuy from '../mtt/detail/MttAgainBuy';
import GlobalSession from '../session/GlobalSession';
import StorageKey from '../session/StorageKey';
import AssetContext from '../ui/component/AssetContext';
import BaseScene from '../ui/scene/BaseScene';
import UIComponent, { PrefabUI } from '../ui/UIComponent';
import { GameCache } from './GameCache';
import UIAutoBringIn from './new_ui/UIAutoBringIn';
import UIBringIn from './new_ui/UIBringIn';
import UIBringOut from './new_ui/UIBringOut';
import UIInsuranceNewPanel, { InsuranceData, WrapTriggerInsuranceData } from './new_ui/UIInsuranceNewPanel';
import TexasGame from './texas/TexasGame';
import UIAgreeSecondPcsComponent from './ui/UIAgreeSecondPcsComponent';
import UIAutoOperationComponent from './ui/UIAutoOperationComponent';
import UIMTTTimeComponent from './ui/UIMTTTimeComponent';
import UIOperationComponent from './ui/UIOperationComponent';
import UIOutChipsTipComponent from './ui/UIOutChipsTipComponent';
import UITexasMenu from './ui/UITexasMenu';
import GameUtil, { GameEnterType, some_pos } from './util/GameUtil';
import Seat from './seat/Seat';
import ToastManager from '../manager/ToastManager';
import AgoraManager from '../net/agora/AgoraManager';
import AgoraVideoRender from '../net/agora/AgoraVideoRender';
import { WebUserRoomBringin, WWW } from '../net/https/WebRequest';
import { VideoModel } from '../crazyPoker/gameplay/common/constant/VideoModel';
import GameplayUtil from '../crazyPoker/gameplay/common/util/GameplayUtil';
import { TableType } from '../crazyPoker/gameplay/common/constant/TableType';
import { HttpRoomBringInByIDProtocol } from '../crazyPoker/module/message/CPHotfixWebMessage/room/HttpRoomBringInByIDProtocol';
import H5MsgMgr from '../H5MsgMgr';
import ProtocolAgency from '../net/websocket/ProtocolAgency';
import { ProtocolCode } from '../net/websocket/ProtocolCode';
import { Def } from '../protobuf/holdem/define_pb';
import UITexasReportComponent from './UITexasReportComponent';
import GGEvent from '../event/GGEvent';
const LN = '[UI][UITexas]';

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
            this.imagePotFrame = trans.getChildByName('Image_PotFrame').getComponent(cc.Sprite);
            this.imagePot = trans.getChildByName('Image_Pot').getComponent(cc.Sprite);
            this.textPot = trans.getChildByName('Text_Pot').getComponent(cc.Label);
            this.imagePotText = trans.getChildByName('Image_PotText')?.getComponent(cc.Label);
        }
    }
}

export class PublicCardInfo {
    public imageCard: cc.Sprite;
    public imageSelect: cc.Sprite;

    constructor(
        public cardId: number,
        public trans: cc.Node
    ) {
        this.imageCard = trans.getComponent(cc.Sprite);
        this.imageSelect = trans.getChildByName('Image_SelectPublicCard').getComponent(cc.Sprite);
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
    // 设置
    btn_menu: cc.Node = null;
    // 消息
    btn_msg: cc.Node = null;
    // 客服
    btn_im: cc.Node = null;
    table_add_chip: cc.Node = null;
    // 小屏适配：记住按钮原始 Y 坐标，避免重复累加偏移
    private _btnMenuOrigY: number = 0;
    private _btnImOrigY: number = 0;
    private _tableAddChipOrigY: number = 0;
    private _remainingSquidCountOrigY: number = 0;
    private _btnSafetyGuardOrigY: number = 0;
    //安全卫士
    btn_safety_guard: cc.Node = null;
    // main_menu 按钮
    // 战绩
    btn_report: cc.Node = null;
    // 牌谱
    btn_poker: cc.Node = null;
    // 表情
    btn_emoji: cc.Node = null;
    // 效果
    btn_effect: cc.Node = null;
    // 音效
    btn_audio: cc.Node = null;
    // 视频
    btn_camera: cc.Node = null;
    // 聊天
    chatBtn: cc.Node = null;
    // 远端音频/视频控制按钮
    muteMicOpenBtn: cc.Node = null;
    muteMicCloseBtn: cc.Node = null;
    hideVideoOpenBtn: cc.Node = null;
    hideVideoCloseBtn: cc.Node = null;
    // 视频控制按钮状态
    private _cameraOn: boolean = false;
    private _micOn: boolean = false;
    //座位节点容器
    seats_content: cc.Node = null;
    /**
     * 牌桌信息
     */
    textRoomInfo: cc.Label = null;
    RemainingSquidCount: cc.Node = null;
    RemainingSquidLabelCount: cc.Label = null;
    SquidSwitch: cc.Node = null;
    private SquidSwitchClickNode: cc.Node = null;
    SquidStandUp: cc.Node = null;
    SquidJoinLabel: cc.Label = null;
    SquidStart: cc.Node = null;
    SquidStartAnim: cc.Animation = null;
    BombPotOpen: cc.Node = null;
    BombPotOpenAnim: cc.Animation = null;
    BombPotLogo: cc.Node = null;
    BombPotLogoAnim: cc.Animation = null;
    CriticalHitStart: cc.Node = null;
    CriticalHitStartAnim: cc.Animation = null;
    callTimeArea: cc.Node = null;
    callTimeDes: cc.Label = null;
    StartGameButton: cc.Node = null;
    /**
     * 牌桌上的分享按钮，在未开始牌局前显示
     */
    _buttonShare: cc.Node = null;
    JackpotButton: cc.Node = null;
    JackpotGoldLabel: cc.Label | cc.RichText = null;
    JackpotAnimRoot: cc.Node = null;
    //补盲按钮
    buttonWaitBlind: cc.Node = null;
    /**
     * 等待开局提示
     */
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
    Button_LookHandCard: cc.Node = null;
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
    Invitation: cc.Node = null;
    Text_InvateCode: cc.Label = null;
    Copy_InvateCode: cc.Node = null;
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
    UIInsuranceNewPanel: UIInsuranceNewPanel = null;
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
    override update(dt: number) {
        this.game?.Update(dt);
    }

    protected override lateLoad(): void {
        this.name = 'UITexas';
        super.lateLoad();
        this.sp_table_bg = this.getChildNodeOrComponent('sp_table_bg', cc.Sprite);
        this.sp_table_face = this.getChildNodeOrComponent('sp_table_face', cc.Sprite);
        this.main = this.getChildNodeOrComponent('main');
        this.btn_menu = this.getChildNodeOrComponent('btn_menu');
        this.btn_msg = this.getChildNodeOrComponent('btn_msg');
        this.btn_report = this.getChildNodeOrComponent('btn_report');
        this.btn_poker = this.getChildNodeOrComponent('btn_poker');
        this.btn_im = this.getChildNodeOrComponent('btn_im');
        this.btn_safety_guard = this.getChildNodeOrComponent('btn_safety_guard');
        if (this.btn_safety_guard) {
            this.btn_safety_guard.active = false;
        }
        this.table_add_chip = this.getChildNodeOrComponent('table_add_chip');
        // 记住按钮原始 Y 坐标，用于小屏适配偏移
        if (this.btn_menu) this._btnMenuOrigY = this.btn_menu.y;
        if (this.btn_im) this._btnImOrigY = this.btn_im.y;
        if (this.btn_safety_guard) this._btnSafetyGuardOrigY = this.btn_safety_guard.y;
        if (this.table_add_chip) this._tableAddChipOrigY = this.table_add_chip.y;
        // main_menu 按钮（main_menu 在 side_btns 下，load_all_object 已递归索引）
        this.btn_emoji = this.getChildNodeOrComponent('btn_emoji');
        this.btn_effect = this.getChildNodeOrComponent('btn_effect');
        this.btn_audio = this.getChildNodeOrComponent('btn_audio');
        this.btn_camera = this.getChildNodeOrComponent('btn_camera');
        this.chatBtn = this.getChildNodeOrComponent('chatBtn');
        // 远端音频/视频控制按钮（muteMicNode / hideVideoNode）
        const muteMicNode = this.getChildNodeOrComponent('muteMicNode') as cc.Node;
        if (muteMicNode) {
            const bg = muteMicNode.getChildByName('background');
            this.muteMicOpenBtn = bg?.getChildByName('openBtn');
            this.muteMicCloseBtn = bg?.getChildByName('closeBtn');
        }
        const hideVideoNode = this.getChildNodeOrComponent('hideVideoNode') as cc.Node;
        if (hideVideoNode) {
            const bg = hideVideoNode.getChildByName('background');
            this.hideVideoOpenBtn = bg?.getChildByName('openBtn');
            this.hideVideoCloseBtn = bg?.getChildByName('closeBtn');
        }
        this.seats_content = this.getChildNodeOrComponent('seats_content');
        this.textRoomInfo = this.getChildNodeOrComponent('Text_RoomInfo', cc.Label);
        this.Image_WaitForStartTips = this.getChildNodeOrComponent('Image_WaitForStartTips');
        this._buttonShare = this.Image_WaitForStartTips.getChildByName('ShareButton');
        this.Image_ReserveSeatTips = this.getChildNodeOrComponent('Image_ReserveSeatTips');
        this.Image_InsuranceTips = this.getChildNodeOrComponent('Image_InsuranceTips');
        // 座位管理
        this.seats_content = this.getChildNodeOrComponent('seats_content');
        this.Seat_Temp = this.getChildNodeOrComponent('Seat_Temp');
        // 鱿鱼
        this.RemainingSquidCount = this.main?.getChildByName('RemainingSquidCount');
        this.RemainingSquidLabelCount = this.RemainingSquidCount?.getChildByName('RemainingSquidLabel')
            ?.getChildByName('RemainingSquidLabelCount')
            ?.getComponent(cc.Label);
        if (this.RemainingSquidCount) {
            this.RemainingSquidCount.active = false;
            this._remainingSquidCountOrigY = this.RemainingSquidCount.y;
        }
        this.SquidSwitch = this.main?.getChildByName('SquidSwitch');
        this.SquidSwitchClickNode = this.SquidSwitch?.getChildByName('content')?.getChildByName('GGSwitch2') || this.SquidSwitch;
        this.SquidJoinLabel = this.SquidSwitch?.getChildByName('content')?.getChildByName('$joinLabel')?.getComponent(cc.Label);
        if (this.SquidJoinLabel) {
            this.SquidJoinLabel.string = i18nMgr.Get('UIClub_RoomJoin');
        }
        if (this.SquidSwitch) {
            this.SquidSwitch.active = false;
        }
        this.SquidStandUp = this.main?.getChildByName('squidStandUp');
        if (this.SquidStandUp) {
            this.SquidStandUp.active = false;
        }
        this.SquidStart = this.getChildNodeOrComponent('squid_start');
        this.SquidStartAnim = this.SquidStart?.getComponent(cc.Animation);
        if (this.SquidStart) {
            this.SquidStart.active = false;
            this.SquidStartAnim?.stop();
        }
        this.BombPotOpen = this.main?.getChildByName('bombpot_open');
        this.BombPotOpenAnim = this.BombPotOpen?.getComponent(cc.Animation);
        if (this.BombPotOpen) {
            this.BombPotOpen.active = false;
            this.BombPotOpenAnim?.stop();
        }
        this.BombPotLogo = this.main?.getChildByName('bombpot_logo');
        this.BombPotLogoAnim = this.BombPotLogo?.getComponent(cc.Animation);
        if (this.BombPotLogo) {
            this.BombPotLogo.active = false;
            this.BombPotLogoAnim?.stop();
        }
        this.CriticalHitStart = this.main?.getChildByName('critical_hit_start');
        this.CriticalHitStartAnim = this.CriticalHitStart?.getComponent(cc.Animation);
        if (this.CriticalHitStart) {
            this.CriticalHitStart.active = false;
            this.CriticalHitStartAnim?.stop();
        }
        this.callTimeArea = this.main?.getChildByName('callTimeArea');
        this.callTimeDes = this.callTimeArea?.getChildByName('callTimeDes')?.getComponent(cc.Label) || null;
        if (this.callTimeArea) {
            this.callTimeArea.active = false;
        }
        this.StartGameButton =
            this.main?.getChildByName('StartGameButton') || this.getChildNodeOrComponent('StartGameButton') || cc.find('main/StartGameButton', this.node);
        if (this.StartGameButton) {
            this.StartGameButton.active = false;
        } else {
            cc.warn('[UITexas] StartGameButton not found');
        }
        this.JackpotButton = this.main?.getChildByName('Button_Jackpot');
        if (this.JackpotButton) {
            this.JackpotButton.active = false;
            const jackpotTextNode = this.JackpotButton.getChildByName('Label_Gold');
            this.JackpotGoldLabel = jackpotTextNode?.getComponent(cc.Label) || jackpotTextNode?.getComponent(cc.RichText) || null;
        }
        this.JackpotAnimRoot = this.main?.getChildByName('JackpotAnimRoot');
        if (this.JackpotAnimRoot) {
            this.JackpotAnimRoot.active = false;
            this.JackpotAnimRoot.getComponent(cc.Animation)?.stop();
        }
        //this.UIOutChips = this.getChildNodeOrComponent("UIOutChips", UIOutChipsComponent);
        this.buttonWaitBlind = this.getChildNodeOrComponent('Button_WaitBlind');
        this.Text_AlreadAnte = this.getChildNodeOrComponent('Text_AlreadAnte', cc.Label);
        this.transPots = this.getChildNodeOrComponent('Pots');
        this.transPot = this.getChildNodeOrComponent('Pot');
        this.transAllPot = this.getChildNodeOrComponent('AllPot');
        this.Button_Delay = this.getChildNodeOrComponent('Button_Delay');
        this.Button_SeeMorePublic = this.getChildNodeOrComponent('Button_SeeMorePublic');
        this.Button_LookHandCard = this.getChildNodeOrComponent('Button_LookHandCard');
        this.Image_SeeMorePublicTips = this.getChildNodeOrComponent('Image_SeeMorePublicTips');
        this.textSeeMorePublicTips = this.getChildNodeOrComponent('Text_SeeMorePublicTips', cc.Label);
        this.textSeeMorePublic = this.getChildNodeOrComponent('Text_SeeMorePublic', cc.Label);
        this.textSeeMorePublicGold = this.getChildNodeOrComponent('Text_SeeMorePublicGold', cc.Label);
        //托管
        this.Button_CancelTrust = this.getChildNodeOrComponent('Button_CancelTrust');
        this.Text_CancelTrust = this.getChildNodeOrComponent('Text_CancelTrust', cc.Label);
        //MTT
        this.Button_AddOn = this.getChildNodeOrComponent('Button_AddOn');
        this.Image_RedistributionTips = this.getChildNodeOrComponent('Image_RedistributionTips');
        this.pullDownText = this.Image_RedistributionTips.getChildByName('Text_Tips')?.getComponent(cc.Label);
        //this.armatureRewardCircleZH = rc.Get<GameObject>("Armature_RewardCircle_zh").GetComponent<UnityArmatureComponent>();
        //this.armatureRewardCircleEN = rc.Get<GameObject>("Armature_RewardCircle_en").GetComponent<UnityArmatureComponent>();
        this.Image_WaitForStartBathTips = this.getChildNodeOrComponent('Image_WaitForStartBathTips');
        this.BathText = this.Image_WaitForStartBathTips?.getChildByName('Text_Tips')?.getComponent(cc.Label);
        //this.Button_BringIn = this.getChildNodeOrComponent("Button_BringIn");
        //朋友桌邀请码
        this.Invitation = this.getChildNodeOrComponent('Invitation');
        this.Text_InvateCode = this.getChildNodeOrComponent('Text_InvateCode', cc.Label);
        this.Copy_InvateCode = this.getChildNodeOrComponent('Copy_InvateCode');
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
        this.UIMTTTime_Con = this.getChildNodeOrComponent('UIMTTTime_Con');
        this.UIMTTTime_Com = this.AddComponents(PrefabUI.UIMTTTimeComponent, this.UIMTTTime_Con);
        //2.操作面板
        this.UIOperation_Con = this.getChildNodeOrComponent('UIOperation_Con');
        this.UIOperation_Com = this.AddComponents(PrefabUI.UIOperationComponent, this.UIOperation_Con);
        this.UIAutoOperation_Com = this.AddComponents(PrefabUI.UIAutoOperationComponent, this.UIOperation_Con);
        //3.菜单
        this.UITexasMenu_Con = this.getChildNodeOrComponent('UITexasMenu_Con');
        //this.UITexasMenu_Com = this.AddComponents(PrefabUI.UITexasMenuComponent, this.UITexasMenu_Con, true);
        this.UITexasMenu = this.AddComponents(PrefabUI.UITexasMenu, this.UITexasMenu_Con, true);
        //4.通用容器 放置 桌面设置，实时战况，战绩
        this.Common_Con = this.getChildNodeOrComponent('Common_Con');
        //5.带入面板 带出面板
        this.UIChips_Con = this.getChildNodeOrComponent('UIChips_Con');
        //this.UIAddChips_Com = this.AddComponents(PrefabUI.UIAddChipsComponent, this.UIChips_Con);
        //this.UIOutChips_Com = this.AddComponents(PrefabUI.UIOutChipsComponent, this.UIChips_Con);
        //this.UIAutoChips_Com = this.AddComponents(PrefabUI.UIAutoChipsComponent, this.UIChips_Con);
        this.UIOutChipsTip_Com = this.AddComponents(PrefabUI.UIOutChipsTipComponent, this.UIChips_Con);
        this.UIBringIn = this.AddComponents(PrefabUI.UIBringIn, this.UIChips_Con);
        this.UIAutoBringIn = this.AddComponents(PrefabUI.UIAutoBringIn, this.UIChips_Con);
        this.UIBringOut = this.AddComponents(PrefabUI.UIBringOut, this.UIChips_Con);
        //6.保险面板
        this.UIInsurance_Con = this.getChildNodeOrComponent('UIInsurance_Con');
        this.UIInsuranceNewPanel = this.AddComponents(PrefabUI.UIInsuranceNewPanel, this.UIInsurance_Con);
        //7.二套牌投票面板
        this.UIAgreeSecondPcs_Con = this.getChildNodeOrComponent('UIAgreeSecondPcs_Con');
        this.UIAgreeSecondPcs_Com = this.AddComponents(PrefabUI.UIAgreeSecondPcsComponent, this.UIAgreeSecondPcs_Con);
        //8.MTT重购面板
        this.MttAgainBuy_Con = this.getChildNodeOrComponent('UIMttSignDialog_Con');
        this.MttAgainBuy = this.AddComponents(PrefabUI.MttAgainBuy, this.MttAgainBuy_Con, false, BUNDLE_RESOURCES);
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
    private AddComponents(prefab_name: string, parent: cc.Node, show: boolean = false, bundle: string = BUNDLE_TEXAS) {
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

    protected override regiterTouchEvents(): void {
        this.setButtonClick(this.btn_menu, this.click_side_button);
        this.setButtonClick(this.btn_msg, this.click_side_button);
        this.setButtonClick(this.btn_report, this.click_side_button);
        this.setButtonClick(this.btn_poker, this.click_side_button);
        this.setButtonClick(this.btn_im, this.click_btn_im);
        this.setButtonClick(this.btn_safety_guard, this.click_btn_safety_guard);
        if (this.table_add_chip) {
            this.table_add_chip.on(cc.Node.EventType.TOUCH_END, this.click_table_add_chip, this);
        }
        // main_menu 按钮
        this.setButtonClick(this.btn_emoji, this.click_btn_emoji);
        this.setButtonClick(this.btn_effect, this.click_btn_effect);
        this.setButtonClick(this.btn_audio, this.click_btn_audio);
        this.setButtonClick(this.btn_camera, this.click_btn_camera);
        this.setButtonClick(this.chatBtn, this.click_chatBtn);
        // 远端音频/视频控制按钮
        this.setButtonClick(this.muteMicOpenBtn, this.click_muteMicOpen);
        this.setButtonClick(this.muteMicCloseBtn, this.click_muteMicClose);
        this.setButtonClick(this.hideVideoOpenBtn, this.click_hideVideoOpen);
        this.setButtonClick(this.hideVideoCloseBtn, this.click_hideVideoClose);
        ///////////////////////////
        this.setButtonClick(this.Button_Delay, this.onClickDelay);
        this.setButtonClick(this.Button_SeeMorePublic, this.onClickSeeMorePublic);
        this.setButtonClick(this.Button_LookHandCard, this.onClickLookHandCard);
        this.setButtonClick(this.buttonWaitBlind, this.onClickWaitBlind);
        this.setButtonClick(this.StartGameButton, this.onClickStartGame);
        this.setButtonClick(this._buttonShare, this.OnButtonShareClick);
        this.setButtonClick(this.JackpotButton, this.onClickJackpot);
        this.setButtonClick(this.SquidSwitchClickNode, this.onClickJoinGame);
        this.setButtonClick(this.SquidStandUp, this.onClickSquidStandUp);
        this.setButtonClick(this.Button_AddOn, this.onClickAddOn);
        //this.setButtonClick(this.Button_BringIn, this.onClickBringIn);
        this.setButtonClick(this.Button_CancelTrust, this.onClickCancelTrust);
        this.setButtonClick(this.textRoomInfo?.node, this.onClickTextRoomInfo);
        this.setButtonClick(this.Copy_InvateCode, this.onClickCopyInvateCode);
    }

    // Enter Called by SceneManager.switchScene & enter
    override Enter(param: { game_enter_type: GameEnterType; isLookOn: boolean }): void {
        super.Enter(param);
        this.AdaptiveMain();
        this.game = GameCache.Instance.CurGame;
        // 设置UI对象
        this.game.uirc = this;
        // 设置公共牌位置
        this.game.InitPublicLocalPos();
        // 是否是观看(MTT)
        this.game.IsLookOn = param?.isLookOn ?? false;
        // 设置桌布类型
        this.game.SetDeskType(this.game.deskType);
        // 分池UI
        if (null == this.listPotInfo) this.listPotInfo = [];
        this.EnterInitUI();
        // 进入牌桌后请求一次战绩数据，填充缓存，使战绩面板打开时可以立即显示
        this.requestRoomersForCache();
        // ── 实时战绩缓存增量更新监听（对应 Unity TexasSituationController） ──
        // Roomers 回包：写入基线缓存
        this.listen(ProtocolCode.Protocol_Holdem_Roomers, this.onGlobalRoomersUpdate);
        // 自己坐下
        this.listen(ProtocolCode.Protocol_Holdem_Seated, this.onSeatedUpdate);
        // 别人坐下
        this.listen(ProtocolCode.Protocol_Holdem_SeatedOthers, this.onSeatedOthersUpdate);
        // 补充筹码（只处理 CcNone）
        this.listen(ProtocolCode.Protocol_Holdem_ChipsChange, this.onChipsChangeUpdate);
        // 站起（下桌）
        this.listen(ProtocolCode.Protocol_Holdem_Standup, this.onStandupUpdate);
        // 开始新一手：补写 startTime
        this.listen(ProtocolCode.Protocol_Holdem_StartInfo, this.onStartInfoUpdate);
        // Winner：每手结算增量更新
        this.listen(ProtocolCode.Protocol_Holdem_Winner, this.onWinnerUpdate);
    }

    private showDebugInsurancePopup(): void {
        if (!this.game || !this.UIInsuranceNewPanel) {
            return;
        }
        // 正式逻辑里这里会被两层拦截：
        // 1. 必须 operatorList 里包含自己，观众不会进入保险弹窗。
        // 2. 观众没有“自己的手牌”，首行玩家会是空数据。
        // 这里是纯调试入口，直接绕过第一层，并在 InsuranceData 上打标记绕过第二层。
        const seat1 = this.game.GetSeatByServerSeatID(1);
        const participantCards = seat1?.Player?.cards?.length ? seat1.Player.cards.slice(0, this.game.HandCards) : this.game.GetEmptyHandCards();
        const participantName = seat1?.Player?.nick || 'Seat1';
        const participantUserId = seat1?.Player?.userID || 0;
        const createTriggerData = (
            potId: number,
            potAmount: number,
            bet: number,
            max: number,
            min: number,
            potUserCount: number,
            potLeaderCount: number
        ): WrapTriggerInsuranceData => {
            const trigger = new WrapTriggerInsuranceData();
            trigger.subPot = potId;
            trigger.pot = potAmount;
            trigger.potTotalCost = bet;
            trigger.mostAmount = max;
            trigger.leastAmount = min;
            trigger.insuranced = 0;
            trigger.odds = 8;
            trigger.potAllowOutSelection = 1;
            trigger.potUserCount = potUserCount;
            trigger.potLeaderCount = potLeaderCount;
            trigger.userNames = [participantName];
            trigger.userIds = [participantUserId];
            trigger.outsPerUser = [4];
            trigger.playerCards = [[...participantCards]];
            trigger.outsCards = [
                [
                    { card: 11, isEqual: false },
                    { card: 12, isEqual: false },
                    // { card: 13, isEqual: true },
                    { card: 56, isEqual: false },
                    // { card: 26, isEqual: true },
                    { card: 41, isEqual: false }
                ]
            ];
            return trigger;
        };
        const insuranceData = new InsuranceData();
        insuranceData.publicCards = this.game.GetPublicCards(1);
        insuranceData.timeLeft = 15;
        insuranceData.delayTimes = 0;
        insuranceData.round = Def.Round.TURN;
        insuranceData.debugObserverUseFirstPlayerAsMine = this.game.IsLookOn;
        insuranceData.triggedDatas = [
            createTriggerData(1, 1920, 640, 240, 1, 3, 1)
            // createTriggerData(2, 1460, 730, 182, 1, 2, 1)
        ];
        UIComponent.Instance.ShowUI(PrefabUI.UIInsuranceNewPanel, insuranceData);
    }

    private requestRoomersForCache(): void {
        const roomId = GameCache.Instance.room_id;
        const matchId = GameCache.Instance.match_id;
        if (!roomId) return;
        ProtocolAgency.Send({
            Code: ProtocolCode.Protocol_Holdem_Roomers,
            RoomID: roomId,
            MatchID: matchId,
            Body: {
                room: { roomId, matchId },
                history: true,
                historyLimit: 1000,
                historyOffset: 0
            }
        });
    }

    // ── 自己坐下（Protocol_Holdem_Seated） ──
    private onSeatedUpdate(response: any): void {
        if (!response || response.status !== 0) return; // 失败（如带入不足）不写缓存
        const userRid = GameCache.Instance.nUserId;
        const name = GameCache.Instance.nick || '';
        const avatar = GameCache.Instance.headPic || '';
        const isNew = UITexasReportComponent.applySitDown(userRid, response.totalBringin || 0, response.deposit || 0, name, avatar);
        if (isNew) this.post(GGEvent.SituationRefresh);
    }

    // ── 别人坐下（Protocol_Holdem_SeatedOthers） ──
    private onSeatedOthersUpdate(response: any): void {
        if (!response) return;
        const isNew = UITexasReportComponent.applySitDown(
            response.userRid,
            response.totalBringin || 0,
            response.deposit || 0,
            response.name || '',
            response.avatar || ''
        );
        if (isNew) this.post(GGEvent.SituationRefresh);
    }

    // ── 补充筹码（Protocol_Holdem_ChipsChange），只处理 CcNone ──
    private onChipsChangeUpdate(response: any): void {
        if (!response) return;
        let hasNew = false;
        for (const change of response.changesList || []) {
            if (change.reason !== 0 /* Def.ChipChangeReason.CC_NONE */) continue;
            const seat = GameCache.Instance.CurGame?.GetSeatByServerSeatID(change.seatId);
            if (!seat?.Player) continue;
            const isNew = UITexasReportComponent.applyChipChange(seat.Player.userID, change.chips || 0, seat.Player.nick || '', seat.Player.headPic || '');
            if (isNew) hasNew = true;
        }
        if (hasNew) this.post(GGEvent.SituationRefresh);
    }

    // ── 下桌（Protocol_Holdem_Standup） ──
    private onStandupUpdate(response: any): void {
        if (!response) return;
        const seat = GameCache.Instance.CurGame?.GetSeatByServerSeatID(response.seatId);
        if (!seat?.Player) return;
        const isNew = UITexasReportComponent.applyStandUp(seat.Player.userID, response.bringOut || 0, seat.Player.nick || '', seat.Player.headPic || '');
        if (isNew) this.post(GGEvent.SituationRefresh);
    }

    // ── 开始新一手，补写 startTime（Protocol_Holdem_StartInfo） ──
    private onStartInfoUpdate(_response: any): void {
        UITexasReportComponent.applyStartInfo();
    }

    private onWinnerUpdate(response: any): void {
        // 对应 Unity: TexasSituationController.HandResult() 更新缓存
        UITexasReportComponent.applyWinnerResult(response);
        // 对应 Unity: Game.EventSystem.Run(EventIdType.EVENT_GAMPLAY_SITUATION_REFRESH)
        this.post(GGEvent.SituationRefresh, response);
    }

    private onGlobalRoomersUpdate(response: any): void {
        if (!response || response.status !== 0) return;
        UITexasReportComponent.updateRoomersCache(GameCache.Instance.room_id, response);
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
        // RemainingSquidCount 锚点 (0,1)，将其定位到距屏幕左侧 20px
        this.adjustRemainingSquidX();
        // 延迟到下一帧计算座位偏移，确保 Widget 布局已完成
        this.scheduleOnce(() => {
            this.adjustSeatYOffset();
            // 偏移量计算完后，刷新已有座位的实际位置
            this.applySeatOffset();
        }, 0);
    }

    /**
     * 将 RemainingSquidCount 的 x 定位到距屏幕左侧 20px
     * main 缩放后，需将 Canvas 坐标反向换算回 main 局部坐标
     */
    private adjustRemainingSquidX() {
        if (!this.RemainingSquidCount || !this.main) return;
        const scale = this.main.scaleX;
        const visibleWidth = cc.view.getVisibleSize().width;
        // Canvas 坐标系中屏幕左边缘 + 20px，换算到 main 局部坐标
        this.RemainingSquidCount.x = (-visibleWidth / 2 + 20 - this.main.x) / scale;
    }

    /**
     * 小屏适配：根据 main_menu 上边缘计算所有座位的 y 偏移量
     * 确保 seat 0（最底部头像）不被 main_menu 遮挡，
     * 同时保证最上方头像不超出屏幕顶部
     */
    private adjustSeatYOffset() {
        some_pos.seatYOffset = 0;
        const mainMenu = this.getChildNodeOrComponent('main_menu') as cc.Node;
        if (!mainMenu || !this.seats_content) return;
        // 用 getBoundingBoxToWorld 获取 main_menu 在世界坐标系中的实际包围盒
        const menuBox = mainMenu.getBoundingBoxToWorld();
        const menuTopWorldY = menuBox.y + menuBox.height;
        // seat 0 中心点的世界坐标
        const seat0LocalPos = some_pos.all_seat_pos[0];
        const seat0WorldPos = this.seats_content.convertToWorldSpaceAR(seat0LocalPos);
        const seat0WorldY = seat0WorldPos.y;
        // 世界坐标中 main_menu 上边缘与 seat 0 中心的重叠量
        const overlapWorld = menuTopWorldY - seat0WorldY;
        if (overlapWorld <= 0) return; // 无重叠
        // 将世界坐标的重叠量转换为 seats_content 本地坐标
        const mainScale = this.main.scaleY;
        const overlapLocal = overlapWorld / mainScale;
        const margin = 30;
        let offset = overlapLocal + margin;
        // 校验顶部座位：seat 4/5/6 的 y = -440，上移后不能超出屏幕
        const topSeatY = some_pos.all_seat_pos[5].y; // -440（最高）
        const topSeatNewY = topSeatY + offset;
        // seats_content 的 y=0 是顶部（anchor 0.5/1），座位中心不能超过 0
        if (topSeatNewY > 0) {
            offset = offset - topSeatNewY; // clamp 到刚好不超出
        }
        some_pos.seatYOffset = offset;
    }

    /**
     * 将已创建的座位重新定位（应用 seatYOffset）
     * 同时将 btn_menu、btn_im、table_add_chip 上移 seatYOffset/2
     */
    private applySeatOffset() {
        if (!this.game?.listSeat) return;
        for (const seat of this.game.listSeat) {
            seat.UpdateSeatUIInfo(seat.ClientSeatId);
        }
        // 按钮上移 seatYOffset / 2
        const halfOffset = some_pos.seatYOffset / 2;
        if (this.btn_menu) this.btn_menu.y = this._btnMenuOrigY + halfOffset;
        if (this.btn_im) this.btn_im.y = this._btnImOrigY + halfOffset;
        if (this.btn_safety_guard) this.btn_safety_guard.y = this._btnSafetyGuardOrigY + halfOffset;
        if (this.table_add_chip) this.table_add_chip.y = this._tableAddChipOrigY + halfOffset;
        if (this.RemainingSquidCount) this.RemainingSquidCount.y = this._remainingSquidCountOrigY + halfOffset;
    }

    //进入初始UI
    EnterInitUI() {
        this.ShowInvateCode();
        //this.setActive(this.Button_BringIn, false);
        this.setActive(this.Button_AddOn, false);
        this.setActive(this.SquidSwitch, false);
        this.setActive(this.SquidStandUp, false);
        this.setActive(this.StartGameButton, false);
        this.setActive(this.BombPotOpen, false);
        this.setActive(this.BombPotLogo, false);
        //消息按钮显示
        this.btn_msg.active = GameUtil.GetFriendsOrClubTable() == 1 || GameUtil.GetFriendsOrClubTable() == 2;
        // 视频控制按钮初始状态
        this._cameraOn = false;
        this._micOn = false;
        this._syncVideoButtonVisuals();
        // 远端音频/视频控制按钮初始状态（默认：功能开启 → 显示 closeBtn）
        this._initRemoteMediaButtons();
        this.refreshViewOnSitAndStandup(this.game.UserSitdown());
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
            PrefabUI.UIInsuranceNewPanel
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
            this.SquidSwitch,
            this.SquidStandUp,
            this.StartGameButton,
            this.JackpotButton,
            this.JackpotAnimRoot,
            this.BombPotOpen,
            this.BombPotLogo
        ].forEach(item => {
            this.setActive(item, false);
        });
        //关闭菜单
        this.HideMenu(false);
        //关闭个人信息
        UIComponent.close(UIDefine.UIPlayerInfo);
        //关闭设置
        UIComponent.close(UIDefine.UITexasSettingComponent);
        //关闭规则
        UIComponent.close(UIDefine.UITexasRule);
        //关闭牌谱
        UIComponent.close(UIDefine.UITexasHistory);
    }

    // refreshViewOnSitAndStandup 因为站起/坐下更新视图
    public refreshViewOnSitAndStandup(sit: boolean) {
        if (sit) {
            this.setActive(this.table_add_chip, true);
            return;
        }
        this.setActive(this.table_add_chip, false);
    }

    override Exit(param: any): void {
        // Unity 策略：离房不主动清 roomers 缓存，进房时 requestRoomersForCache() 的回包会覆盖当前房间缓存
        super.Exit(param);
    }

    /// <param name="num"></param>几张
    /// <param name="premium"></param>保费
    /// <param name="paynum"></param>赔付金额
    public async ShowInsuranceTip(num: number, premium: number, paynum: number) {
        this.Image_InsuranceTips.active = true;
        this.Image_InsuranceTips.getChildByName('Text_Tips').getComponent(cc.Label).string =
            `${i18nMgr.Get('UILobby_Menu_menu_btn_my')}......\n` +
            StringHelper.FormatString(i18nMgr.Get('UIInsurance_tips001'), num, StringHelper.GetLongString(premium), StringHelper.GetLongString(paynum));
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

    /**
     * 点击房间信息文本
     */
    private onClickTextRoomInfo() {
        // TODO: 实现房间信息点击逻辑
        console.log('==>onClickTextRoomInfo');
        UIComponent.open(UIDefine.UIGameplayTableSetting, {
            isFromBringIn: false,
            bringInAct: null,
            roomPermissions: null,
            noAnimation: true
        });
    }

    public ShowInvateCode(): void {
        const isFriendTable = GameplayUtil.GetTableType() === TableType.FRIEND;
        if (this.Invitation) this.Invitation.active = isFriendTable;
        if (isFriendTable && this.Text_InvateCode) {
            this.Text_InvateCode.string = GameCache.Instance._friendsTableCode;
        }
    }

    private onClickCopyInvateCode() {
        const code = GameCache.Instance._friendsTableCode;
        if (!code) return;
        PublicHelper.copyToClipBoard(code);
    }

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
        let OpenBarrage: number = +GC.localStore.getItem(StorageKey.OpenBarrage);
        this.barragePanel && (this.barragePanel.active = OpenBarrage != 2);
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

    private onClickLookHandCard() {
        this.game.onClickLookHandCard();
    }

    private onClickWaitBlind() {
        this.game?.onClickWaitBlind();
    }

    private onClickStartGame() {
        this.game?.onClickStartGame();
    }

    private onClickJackpot() {
        this.game?.OnClickJackpot();
    }

    private onClickJoinGame() {
        console.log(`==>onClickJoinGame`);
        this.game?.OnClickSquidJoinSwitch();
    }

    private onClickSquidStandUp() {
        this.game?.OnClickSquidStandUp();
    }

    /**
     * 分享按钮点击回调
     * 点击分享按钮，分享牌局信息
     */
    private OnButtonShareClick() {
        console.log(`==>onButtonShareClick`);
        // TODO: 实现分享逻辑
        ToastManager.Instance.createToast('还未开发');
    }

    public async ShowInsuranceTipJieSuan(paynum: number) {
        this.Image_InsuranceTips.active = true;
        this.Image_InsuranceTips.getChildByName('Text_Tips').getComponent(cc.Label).string = StringHelper.FormatString(
            i18nMgr.Get('UIInsurance_tips003'),
            StringHelper.GetLongString(paynum)
        );
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
            case this.btn_menu: //菜单按钮
                this.ShowMenu();
                break;
            case this.btn_msg: //消息
                if (GameUtil.GetFriendsOrClubTable() == 1) {
                    UIComponent.open(UIDefine.UIMsgBring, { from: 0, name: 'UIClub_RoomSitApplyRecords_title' });
                }
                if (GameUtil.GetFriendsOrClubTable() == 2) {
                    UIComponent.open(UIDefine.UIMsgBring, { from: 1, name: 'UIClub_RoomSitApplyRecords_title' });
                }
                break;
            case this.btn_report: //实时战况
                this.Click_Report_Btn();
                break;
            case this.btn_poker: //战绩牌谱
                this.Click_Cursituation_btn();
                break;
        }
    }

    // main_menu 按钮点击
    private click_btn_emoji() {
        UIComponent.open(UIDefine.UIEmojiDlg);
    }

    private async click_btn_effect() {
        // 非视频房间
        if (GameCache.Instance._videoModel === VideoModel.NONE) {
            ToastManager.Instance.createToast(i18nMgr.Get('UIEffectNoVideo'));
            return;
        }
        // 节能模式未开启
        if (GameCache.Instance._videoPowerSaving !== 1) {
            ToastManager.Instance.createToast(i18nMgr.Get('UIEffectNoPowerSaving'));
            return;
        }
        // 摄像头未开启
        const headNode = this.game?.listSeat?.find((s: Seat) => s.IsMySeat)?.uirc?.Raw_Head?.node;
        const vr = headNode?.getComponent(AgoraVideoRender);
        if (!vr?.isRendering) {
            ToastManager.Instance.createToast(i18nMgr.Get('UIEffectNoCamera'));
            return;
        }
        const mySeat = this.game?.listSeat?.find((s: Seat) => s.IsMySeat);
        if (!mySeat) {
            ToastManager.Instance.createToast('请先入座');
            return;
        }
        // videoMaskId 循环 +1，大于4回到1
        const oldMaskId = this.game.mainPlayer.videoMaskId || 0;
        let newMaskId = oldMaskId + 1;
        if (newMaskId > 4) newMaskId = 1;
        // 立即更新本地数据和窗花显示（乐观更新）
        this.game.mainPlayer.videoMaskId = newMaskId;
        if (headNode?.isValid) {
            if (vr) vr.setVideoMaskId(newMaskId);
        }
        // 请求服务器广播窗花变更，失败时回滚
        const ok = await this.game.TexasGameProtocol?.requestSetVideoMask(newMaskId);
        if (!ok) {
            this.game.mainPlayer.videoMaskId = oldMaskId;
            if (headNode?.isValid) {
                const vrNow = headNode.getComponent(AgoraVideoRender);
                if (vrNow) vrNow.setVideoMaskId(oldMaskId);
            }
        }
    }

    private async click_btn_audio() {
        if (GameCache.Instance._videoModel === VideoModel.NONE) {
            ToastManager.Instance.createToast('当前房间未开启语音');
            return;
        }
        const mySeat = this.game?.listSeat?.find((s: Seat) => s.IsMySeat);
        if (!mySeat) {
            ToastManager.Instance.createToast('请先入座');
            return;
        }
        const agora = AgoraManager.Instance;
        if (!agora.isJoined) return;
        if (this._micOn) {
            agora.setMicMuted(true);
            this._micOn = false;
        } else {
            if (!agora.localAudioTrack) {
                const ok = await agora.enableMic();
                this._micOn = ok;
            } else {
                agora.setMicMuted(false);
                this._micOn = true;
            }
        }
        this._syncVideoButtonVisuals();
        // 麦克风状态变更后刷新所有 MicIcon
        this.game?.TexasGameProtocol?.refreshMicIcons();
    }

    private async click_btn_camera() {
        if (GameCache.Instance._videoModel === VideoModel.NONE) {
            ToastManager.Instance.createToast('当前房间未开启视频');
            return;
        }
        if (GameCache.Instance._videoModel === VideoModel.FULL_TIME) {
            ToastManager.Instance.createToast(i18nMgr.Get('UIVideoModelverifyFullTime02'));
            return;
        }
        // 麦序模式：无论是否在操作，都不允许手动切换摄像头
        if (GameCache.Instance._videoModel === VideoModel.SEQUENCE) {
            ToastManager.Instance.createToast(i18nMgr.Get('UICantOpenVideoOnMicSeq'));
            return;
        }
        if (GameCache.Instance._randomVideoActive) {
            const remainSec = Math.max(0, Math.ceil((GameCache.Instance._randomVideoEndTime - Date.now()) / 1000));
            ToastManager.Instance.createToast(i18nMgr.Get('UIVideoModelverifyRandom02').replace('{0}', String(remainSec)));
            return;
        }
        const mySeat = this.game?.listSeat?.find((s: Seat) => s.IsMySeat);
        if (!mySeat) {
            ToastManager.Instance.createToast('请先入座');
            return;
        }
        const agora = AgoraManager.Instance;
        if (!agora.isJoined) return;
        // 以实际渲染状态为准，防止 _cameraOn 与实际脱节（如渲染异常静默停止）
        const headNode = mySeat.uirc?.Raw_Head?.node;
        const vr = headNode?.getComponent(AgoraVideoRender);
        const actuallyRendering = vr?.isRendering === true;
        this._cameraOn = actuallyRendering;
        if (this._cameraOn) {
            const headNode = mySeat.uirc?.Raw_Head?.node;
            const vr = headNode?.getComponent(AgoraVideoRender);
            if (vr) vr.stopRender();
            await agora.disableCamera();
            this._cameraOn = false;
        } else {
            await this.game.TexasGameProtocol.renderLocalVideoOnMySeat();
            this._cameraOn = !!agora.localVideoTrack;
        }
        this._syncVideoButtonVisuals();
    }

    /**
     * 同步摄像头/麦克风按钮的视觉状态
     */
    private _syncVideoButtonVisuals(): void {
        if (this.btn_camera) {
            this.btn_camera.opacity = this._cameraOn ? 255 : 128;
            const sprite = this.btn_camera.getComponent(cc.Sprite);
            if (sprite) this.setSpriteShowGray(sprite, !this._cameraOn);
        }
        if (this.btn_audio) {
            this.btn_audio.opacity = this._micOn ? 255 : 128;
            const sprite = this.btn_audio.getComponent(cc.Sprite);
            if (sprite) this.setSpriteShowGray(sprite, !this._micOn);
        }
        // 窗花按钮：视频房间 + 节能模式开启 + 本地视频正在渲染
        if (this.btn_effect) {
            const headNode = this.game?.listSeat?.find((s: Seat) => s.IsMySeat)?.uirc?.Raw_Head?.node;
            const vr = headNode?.getComponent(AgoraVideoRender);
            const effectEnabled = GameCache.Instance._videoModel !== VideoModel.NONE && GameCache.Instance._videoPowerSaving === 1 && vr?.isRendering === true;
            this.btn_effect.opacity = effectEnabled ? 255 : 128;
            const sprite = this.btn_effect.getComponent(cc.Sprite);
            if (sprite) this.setSpriteShowGray(sprite, !effectEnabled);
        }
    }

    /**
     * 从 AgoraManager 实际状态同步按钮（由 TexasGameProtocol 调用）
     */
    public syncVideoButtonsFromAgora(): void {
        const agora = AgoraManager.Instance;
        this._cameraOn = !!agora.localVideoTrack;
        this._micOn = !!agora.localAudioTrack;
        this._syncVideoButtonVisuals();
    }

    /**
     * 重置视频按钮状态（离开房间时调用）
     */
    public resetVideoButtons(): void {
        this._cameraOn = false;
        this._micOn = false;
        this._syncVideoButtonVisuals();
        this._initRemoteMediaButtons();
    }

    /**
     * 初始化远端音频/视频控制按钮的显隐状态
     * 进入房间时调用，确保 UI 与 AgoraManager 状态一致
     * 非视频房间直接隐藏整个 muteMicNode / hideVideoNode
     * 默认：远端音频/视频开启 → openBtn 可见（表示当前开着），closeBtn 隐藏
     */
    private _initRemoteMediaButtons(): void {
        const isVideoRoom = GameCache.Instance._videoModel !== VideoModel.NONE;
        // 非视频房间：隐藏整个按钮节点
        const muteMicNode = this.muteMicOpenBtn?.parent?.parent;
        const hideVideoNode = this.hideVideoOpenBtn?.parent?.parent;
        if (muteMicNode) muteMicNode.active = isVideoRoom;
        if (hideVideoNode) hideVideoNode.active = isVideoRoom;
        if (!isVideoRoom) return;
        const agora = AgoraManager.Instance;
        // 功能开启 → openBtn 可见；功能关闭 → closeBtn 可见
        const audioOn = !agora.isRemoteAudioMuted;
        if (this.muteMicOpenBtn) this.muteMicOpenBtn.active = audioOn;
        if (this.muteMicCloseBtn) this.muteMicCloseBtn.active = !audioOn;
        const videoOn = !agora.isRemoteVideoMuted;
        if (this.hideVideoOpenBtn) this.hideVideoOpenBtn.active = videoOn;
        if (this.hideVideoCloseBtn) this.hideVideoCloseBtn.active = !videoOn;
    }

    /**
     * 远端音频：openBtn 被点击 → 当前开着，点击后关闭（静音）
     */
    private click_muteMicOpen() {
        if (this.muteMicOpenBtn) this.muteMicOpenBtn.active = false;
        if (this.muteMicCloseBtn) this.muteMicCloseBtn.active = true;
        AgoraManager.Instance.setRemoteAudioEnabled(false);
    }

    /**
     * 远端音频：closeBtn 被点击 → 当前关闭，点击后开启（恢复声音）
     */
    private click_muteMicClose() {
        if (this.muteMicCloseBtn) this.muteMicCloseBtn.active = false;
        if (this.muteMicOpenBtn) this.muteMicOpenBtn.active = true;
        AgoraManager.Instance.setRemoteAudioEnabled(true);
    }

    /**
     * 远端视频：openBtn 被点击 → 当前开着，点击后关闭（隐藏视频）
     */
    private async click_hideVideoOpen() {
        if (this.hideVideoOpenBtn) this.hideVideoOpenBtn.active = false;
        if (this.hideVideoCloseBtn) this.hideVideoCloseBtn.active = true;
        await AgoraManager.Instance.setRemoteVideoEnabled(false);
    }

    /**
     * 远端视频：closeBtn 被点击 → 当前关闭，点击后开启（恢复视频）
     */
    private async click_hideVideoClose() {
        if (this.hideVideoCloseBtn) this.hideVideoCloseBtn.active = false;
        if (this.hideVideoOpenBtn) this.hideVideoOpenBtn.active = true;
        await AgoraManager.Instance.setRemoteVideoEnabled(true);
    }

    private click_chatBtn() {
        UIComponent.open(UIDefine.UIChatDlg);
    }

    private async click_btn_im() {
        // 如果是UC桌且钱包的俱乐部ID未缓存，先请求接口获取带入俱乐部ID（如果有），再打开支持聊天面板
        if (this.game?.bringInClubId <= 0 && GameCache.Instance.gold_type == 1) {
            try {
                const res = await WWW.Instance.CommonAPI<HttpRoomBringInByIDProtocol.ResponseData>({
                    web_class: WebUserRoomBringin,
                    api_id: GameCache.Instance.room_id
                });
                const clubId = Number(res?.data?.club_id || 0);
                if (clubId > 0) {
                    this.game.bringInClubId = clubId;
                }
            } catch (e) {
                console.warn(LN, '[supportChat] bringInClubId query failed', e);
            }
        }
        H5MsgMgr.sendToH5('showPanel', 1, {
            panelType: 'supportChat',
            props: {
                tribeId: this.game.tribeId,
                clubId: this.game.bringInClubId || this.game.clubId
            }
        });
    }

    private click_btn_safety_guard() {
        H5MsgMgr.sendToH5('showPanel', 1, {
            panelType: 'safetyGuard',
            props: {
                tribeId: this.game.tribeId
            }
        });
    }

    private click_table_add_chip() {
        this.game.StartAddChips();
    }
}
