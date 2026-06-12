import { GameCache } from '../../../../../game/GameCache';
import { i18nMgr } from '../../../../../i18n/i18nMgr';
import { BringInChipsType } from '../../constant/BringInChipsType';
import { GameType, PokerType } from '../../constant/LogicTypeConf';
import { TableType } from '../../constant/TableType';
import GameplayUtil from '../../util/GameplayUtil';
import { StringHelper } from '../../../../../helper/StringHelper';
import UIComponent from '../../../../../ui/UIComponent';
import { UIDefine } from '../../../../../define/UIDefine';
import UIBase from '../../../../../ui/UIBase';
import { WebOrderUserUsdtRecharge, WebPropGoldPriceList, WebUserTraderApply, WebUserTraderApplyList, WWW } from '../../../../../net/https/WebRequest';
import { HttpUSDTPriceListProtocol } from '../../../../module/message/CPHotfixWebMessage/usdt/HttpUSDTPriceListProtocol';
import USDTDiamond from './usdtdiamond/USDTDiamond';
import USDTPaytype, { RateDetail } from './usdtdiamond/USDTPaytype';
import { HttpUSDTRechargeProtocol } from '../../../../module/message/CPHotfixWebMessage/usdt/HttpUSDTRechargeProtocol';
import { UIConfirmDialogParam } from '../common/UIConfirmDialog';
import { HttpUSDTApplyListProtocol } from '../../../../module/message/CPHotfixWebMessage/usdt/HttpUSDTApplyListProtocol';
import { UIRechargeDiamondParam } from './UIRechargeDiamond';
import { HttpUSDTApplyProtocol } from '../../../../module/message/CPHotfixWebMessage/usdt/HttpUSDTApplyProtocol';
import RemoteSprite from '../common/RemoteSprite';
import { RoomInfo } from '../../../../../protobuf/holdem/define_pb';
import StepSlider from '../common/StepSlider';
import SwitchNode from '../common/SwitchNode';
const { ccclass, menu, property } = cc._decorator;

/** 标题枚举 */
enum E_TitleType {
    /** 带入标题 */
    Chips,
    /** 钻石标题 */
    Diamond
}

export interface RetainInfo {
    RetainType: number; // 0 无 1 手动 2 自动
    RetainMinRate: number;
    RetainMaxRate: number;
}

export interface IWallet {
    /** 俱乐部 ID */
    club_id: number;
    /** 联盟 ID */
    tribe_id: number;
    /** 钱包类型：1 联盟币 (gold)，2 USDT */
    gold_type: number;
    /** 币种三字码 */
    gold_currency: string;
    /** 钱包 ID */
    w_u_id: number;
    /** 钱包金额 */
    gold: number;
    /** 被锁定金额 */
    gold_lock: number;
    /** 俱乐部名称 */
    club_name: string;
    /** 俱乐部随机 ID */
    club_random_id: number;
    /** 俱乐部头像 */
    club_logo: string;
    /** 充值预付状态：1 开启，2 关闭 */
    deposit_advance: number;
    /** 联盟随机 ID */
    tribe_random_id: number;
    /** 用户状态 */
    user_status: number;
    /** 用户类型 */
    user_type: number;
    /** 钱包状态 */
    wallet_status: number;
    /** 钱包联盟状态 */
    wallet_tribe_status: number;
}

// 带入筹码数据
export class AddChipsData {
    /** 大盲 */
    public _bigBlind: number = 0;
    /** 小盲 */
    public _smallBlind: number = 0;
    /** 当前最小带入倍数 */
    public _currentMinRate: number = 0;
    /** 当前最大带入倍数 */
    public _currentMaxRate: number = 0;
    /** 玩家剩余记分牌 */
    public _tableChips: number = 0;
    /** 藏钱记分牌 */
    public _storeChips?: number = 0;
    /** 类型 1：货币 2：钻石 3:信用额度*/
    public _type: number = 0;
    /** 钱包列表 */
    public _wallets: IWallet[] = null;
    /** 0带入申请 1补充筹码 2菜单自动充值 3蘑菇 */
    public _source: BringInChipsType = BringInChipsType.BRING_IN;

    /** 点确认按钮 */
    public _commit: (bringInTotal: number, store: number, autoOnTable: number, clubID: number) => void;
    /** 授信额度 */
    public _creditNum: number = 0;
    /** 押金 */
    public _deposit: number = 0;
    /** diamonds */
    public _diamonds: number = 0;
    /** 是不是批发商 */
    public _isTrader: boolean = false;
    public _retainInfo: RetainInfo = null;
}
const LN = '[UIGameplayAddChipsAndDiamondComponent]';

/**
 * 核心玩法：带入筹码界面
 */
@ccclass
@menu('CrazyPoker/AddChips/UIGameplayAddChipsAndDiamondComponent')
export default class UIGameplayAddChipsAndDiamondComponent extends UIBase {
    // 组件引用
    @property(StepSlider)
    private bringInSlider: StepSlider = null;
    @property(cc.Node)
    private sliderArea: cc.Node = null;
    @property(cc.Node)
    private walletArea: cc.Node = null;
    @property(cc.Node)
    private buttonCommit: cc.Node = null;
    @property(cc.Node)
    private buttonCommitSrc: cc.Node = null;
    @property(cc.Node)
    private buttonCommit2: cc.Node = null;
    @property(cc.Node)
    private buttonCommit2Src: cc.Node = null;
    @property(cc.Node)
    private buttonClose: cc.Node = null;
    @property(cc.Node)
    private buttonMask: cc.Node = null;
    @property(cc.Node)
    private triangleNode: cc.Node = null;
    @property(cc.Label)
    private textBlind: cc.Label = null;
    @property(cc.Label)
    private textBlindLabel: cc.Label = null;
    @property(cc.Label)
    private textCoin: cc.Label = null;
    @property(cc.Node)
    private balanceNode: cc.Node = null;
    @property(cc.Label)
    private textTotalCoin: cc.Label = null;
    @property(cc.Label)
    private textTotalCoinTitle: cc.Label = null;
    @property(cc.Node)
    private creditNode: cc.Node = null;
    @property(cc.Label)
    private textTotalCredit: cc.Label = null;
    @property(cc.Label)
    private textTotalCreditTitle: cc.Label = null;
    @property(cc.Node)
    private diamondNode: cc.Node = null;
    @property(cc.Label)
    private textTotalDiamond: cc.Label = null;
    @property(cc.Label)
    private textTotalDiamondTitle: cc.Label = null;
    /**
     * 金币图标
     */
    @property(cc.Sprite)
    private textTitle: cc.Label = null;
    // 自动充值部分
    @property(cc.Node)
    private autoBringinArea: cc.Node = null;
    @property(SwitchNode)
    private switchAutoBringin: SwitchNode = null;
    @property(cc.Node)
    private autoBringinSliderArea: cc.Node = null;
    @property(StepSlider)
    private autoSlider: StepSlider = null;
    @property(cc.Label)
    private autoSliderAmount: cc.Label = null;
    private tips: cc.Node = null;
    /**
     * 提示遮罩按钮
     */
    @property(cc.Node)
    public tipsMask: cc.Node = null;
    private recordTipsBtn: cc.Node = null;
    /**
     * 带入筹码描述
     */
    @property(cc.Label)
    public coinTipText: cc.Label = null;
    @property(cc.Label)
    public coinTipTextBottom: cc.Label = null;
    /**
     * 俱乐部预制体
     */
    @property(cc.Prefab)
    private clueItemPrefab: cc.Prefab = null;
    /**
     * 俱乐部列表
     */
    @property(cc.ScrollView)
    private walletScrollView: cc.ScrollView = null;
    /**
     * 未选择俱乐部列表
     */
    @property(cc.Node)
    private emptySelectWallet: cc.Node = null;
    private _cloneNode: cc.Node = null; // 这是用来显示选中状态的node
    /**
     * 选择钱包按钮
     */
    @property(cc.Node)
    private buttonSelectWallet: cc.Node = null;
    @property(cc.Node)
    private arrowDown: cc.Node = null;
    /**
     * 带入筹码描述按钮
     */
    @property(cc.Node)
    public bringBtn: cc.Node = null;
    /**
     * 带入筹码具体描述
     */
    @property(cc.Node)
    public bringTips: cc.Node = null;
    // ========== 钻石相关 ==========
    /** 显示钻石区域 */
    @property(cc.Node)
    public diamondArea: cc.Node = null;
    /** 显示带入区域 */
    @property(cc.Node)
    public addChipsArea: cc.Node = null;
    /** 带入标题 */
    @property(cc.Label)
    public chipInfo: cc.Label = null;
    /** 钻石标题 */
    @property(cc.Label)
    private diamondInfo: cc.Label = null;
    /** 下划线 */
    @property(cc.Node)
    private chipLine: cc.Node = null;
    /** 钻石下划线 */
    @property(cc.Node)
    private diamondLine: cc.Node = null;
    // 钻石余额
    @property(cc.Label)
    private diamondAmount: cc.Label = null;
    // 余额Label
    @property(cc.Label)
    private diamondAmountLabel: cc.Label = null;
    // 购买项
    @property(cc.Prefab)
    private diamondItem: cc.Prefab = null;
    @property(cc.Node)
    private diamondBoard: cc.Node = null;
    @property(cc.Label)
    private exchangeRateText: cc.Label = null;
    @property(cc.Prefab)
    private payttypeItem: cc.Prefab = null;
    @property(cc.Node)
    private paytypes: cc.Node = null;
    @property(cc.Label)
    private payNowText: cc.Label = null;
    @property(cc.Button)
    private payNowBtn: cc.Button = null;
    private _isApplyingTrader: boolean = false;
    private _toApplyTrader: boolean = false;
    private _rechargeData: HttpUSDTRechargeProtocol.RequestData = null;
    private _payType: number = 0; //1 //2
    private _exchangeRate: number = 0;
    // ========== end 钻石相关 ==========
    // 滑动条长度，和最小刻度
    private _bringInRange: number = 0;
    private _bringInMin: number = 0;
    // 自动带入滑动条长度和最小刻度
    private _autoBringInRange: number = 0;
    private _autoBringInMin: number = 0;
    // 状态变量
    private addChipsData: AddChipsData = null;
    private mySelectWallet: IWallet = null;
    private currentSelect: number = 0;
    private walletToggles: cc.Toggle[] = [];
    /** 带入分段 */
    public sliderSpace: number = 50;
    private _bringInAmount: number = 0;
    private _autoOnTable: number = 0;
    private _autoBringin: boolean = false;

    protected override lateLoad(): void {
        super.lateLoad();
        // 初始化一个节点
        const targetIndex = this.buttonSelectWallet.getSiblingIndex();
        const cnd = cc.instantiate(this.clueItemPrefab);
        this.buttonSelectWallet.parent.insertChild(cnd, targetIndex);
        cnd.name = 'cloneWalletItem';
        cnd.active = false;
        this._cloneNode = cnd;
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.setButtonClick(this.buttonCommitSrc, this.onClickCommit);
        this.setButtonClick(this.buttonCommit2Src, this.onClickCommit);
        this.setButtonClick(this.buttonClose, this.onClickClose);
        this.setButtonClick(this.buttonMask, this.onClickClose);
        let maskNode = this.getChildNodeOrComponent<cc.Node>('Mask');
        this.setButtonClick(maskNode, this.onClickMask);
        this.setButtonClick(this.buttonSelectWallet, () => {
            this.onClickWalletBtn();
        });
        this.setButtonClick(this.tipsMask, () => {
            this.onClickTipsMask();
        });
        this.setButtonClick(this.chipInfo?.node, () => {
            this.onClickChips(this.chipInfo?.node);
        });
        this.setButtonClick(this.diamondInfo?.node, () => {
            this.onClickDiamond(this.diamondInfo?.node);
        });
        this.setButtonClick(this.recordTipsBtn, () => {
            if (this.tips) this.tips.active = true;
            if (this.tipsMask) this.tipsMask.active = true;
        });
        this.setButtonClick(this.bringBtn, () => {
            if (this.tipsMask) this.tipsMask.active = true;
            if (this.bringTips) this.bringTips.active = true;
        });
        this.payNowBtn.node.on('click', () => {
            this.onPayNowOrApplyTraderClicked(this._toApplyTrader, this._payType, this._rechargeData);
        });
        this.switchAutoBringin.onSwitchCallback = isOn => {
            this.autoBringinSliderArea.active = isOn;
            this._autoBringin = isOn;
        };
    }

    onShow(obj?: any): void {
        super.onShow(obj);
        this.addChipsData = obj as AddChipsData;
        this._updateDisplay();
    }

    private _updateDisplay() {
        console.log(LN, '_updateDisplay', this.addChipsData);
        // 默认带入页面
        this._changeTitleType(E_TitleType.Chips);
        // 初始化钻石购买页
        this.initDiamond();
        // 根据来源设置标题
        switch (this.addChipsData._source) {
            case BringInChipsType.BRING_IN:
                if (this.textTitle) this.textTitle.string = i18nMgr.Get('UIClub_RoomSitApplyRecords_title');
                break;
            case BringInChipsType.SUPPLEMENT:
                if (this.textTitle) this.textTitle.string = i18nMgr.Get('UITexas_AddChipsMenu');
                break;
            case BringInChipsType.AUTO_RECHARGE:
                if (this.textTitle) this.textTitle.string = i18nMgr.Get('UICreate_AutoRechage');
                break;
            case BringInChipsType.MUSHROOM:
                if (this.textTitle) this.textTitle.string = i18nMgr.Get('UITexas_AddChipsMenu');
                break;
            case BringInChipsType.SQUID:
                if (this.textTitle) this.textTitle.string = i18nMgr.Get('UITexas_AddChipsMenu');
                break;
            case BringInChipsType.MATCH:
                if (this.textTitle) this.textTitle.string = i18nMgr.Get('UIClub_RoomSitApplyRecords_title');
                break;
            default:
                if (this.textTitle) this.textTitle.string = i18nMgr.Get('UIClub_RoomSitApplyRecords_title');
                break;
        }
        switch (this.addChipsData._type) {
            // 货币
            case 1:
                this._updateDisplayForWallet();
                break;
            case 2:
                this._updateDisplayForDiamond();
                break;
            case 3:
                this._updateDisplayForClubCredit();
                break;
        }
    }

    private _updateDisplayForWallet() {
        this.buttonCommit.active = false;
        this.buttonCommit2.active = false;
        // 货币显示
        this.balanceNode.active = true;
        this.creditNode.active = false;
        this.diamondNode.active = false;
        this.textTotalCoin.string = '0';
        this.textTotalCoinTitle.string = i18nMgr.Get('UIClub_CreateRoom31');
        // 设置带入滑块
        this._setupSlider(false);
        // 设置自动充值部分(非AOF藏钱才会有)
        if (this.addChipsData._retainInfo.RetainType == RoomInfo.RetainType.RT_DISABLE) {
            this.autoBringinArea.active = true;
            this._setUpAutoOnTableSlider();
            this.switchAutoBringin.onoff(false, true);
        }
        // 钱包列表
        this.walletArea.active = true;
        this._setupWalletList();
    }

    private _updateDisplayForDiamond() {
        // 货币显示
        this.balanceNode.active = false;
        this.creditNode.active = false;
        this.diamondNode.active = true;
        this.textTotalDiamond.string = StringHelper.GetLongStringLocale(this.addChipsData._diamonds, 1, 0);
        this.textTotalDiamondTitle.string = i18nMgr.Get('UIClub_CreateRoom31');
        // 设置滑块
        this._setupSlider(true);
        // 没有自动充值
        this.autoBringinArea.active = false;
        //提交按钮
        this.buttonCommit2.active = true;
        // 不处理钱包
        this.walletArea.active = false;
    }

    private _updateDisplayForClubCredit() {
        // 货币显示
        this.balanceNode.active = false;
        this.creditNode.active = true;
        this.diamondNode.active = false;
        this.textTotalCredit.string = StringHelper.GetLongStringLocale(this.addChipsData._creditNum, 1, 0);
        this.textTotalCreditTitle.string = i18nMgr.Get('UIClubCreditLimit2');
        // 设置滑块
        this._setupSlider(true);
        // 没有自动充值
        this.autoBringinArea.active = false;
        //提交按钮
        this.buttonCommit2.active = true;
        // 不处理钱包
        this.walletArea.active = false;
    }

    // _setupSlider 设置买入的滑动条
    private _setupSlider(display: boolean): void {
        console.log(LN, 'setupSlider', this.addChipsData);
        this.sliderArea.active = display;
        if (this.addChipsData == null) return;
        // 隐藏押金区域
        // if (this.depositObj) this.depositObj.active = false;
        // this.setClubDeposit();
        // 设置盲注文本
        if (this.checkIsAnte()) {
            this.textBlindLabel.string = i18nMgr.Get('UIClub_RoomCreat_gmo7laWj');
            this.textBlind.string = StringHelper.GetLongString(this.addChipsData._smallBlind * 2);
        } else if (GameCache.Instance.game_type == GameType.FANTASY) {
            this.textBlindLabel.string = i18nMgr.Get('UIFantasy_Dizhu2');
            this.textBlind.string = StringHelper.GetLongString(this.addChipsData._smallBlind);
        } else if (GameCache.Instance.game_type == GameType.MAHJONG) {
            this.setMahjongInfo();
        } else if (GameCache.Instance.game_type == GameType.EGG) {
            this.textBlindLabel.string = i18nMgr.Get('UIFantasy_Dizhu2');
            this.textBlind.string = StringHelper.GetLongString(this.addChipsData._smallBlind);
        } else {
            console.log(
                LN,
                'setupSlider',
                `${StringHelper.GetLongString(this.addChipsData._smallBlind)}/${StringHelper.GetLongString(this.addChipsData._bigBlind)}`
            );
            this.textBlindLabel.string = i18nMgr.Get('UITexas_smallBigBlind');
            this.textBlind.string = `${StringHelper.GetLongString(this.addChipsData._smallBlind)}/${StringHelper.GetLongString(this.addChipsData._bigBlind)}`;
        }
        this._setCoinTipText();
        // 计算最大带入
        let minRate = this.addChipsData._currentMinRate;
        if (this.addChipsData._retainInfo.RetainType > 0) {
            minRate = Math.max(minRate, this.addChipsData._retainInfo.RetainMinRate);
        }
        const currentMaxBring = this.addChipsData._currentMaxRate * this.addChipsData._bigBlind - this.addChipsData._tableChips;
        this._bringInMin = minRate * this.addChipsData._bigBlind + this.addChipsData._deposit;
        this._bringInRange = currentMaxBring - this._bringInMin;
        this._autoBringInRange = (this.addChipsData._currentMaxRate - this.addChipsData._currentMinRate) * this.addChipsData._bigBlind;
        this._autoBringInMin = this.addChipsData._currentMinRate * this.addChipsData._bigBlind;
        const step = 1 / (this._bringInRange / this.addChipsData._bigBlind);
        this.bringInSlider.step = Math.round(step * 10000) / 10000;
        this.bringInSlider.onValueChanged = (progress: number) => {
            // 注意精度
            const amount = Math.min(
                this._bringInRange + this._bringInMin,
                Math.round((progress * this._bringInRange) / this.addChipsData._bigBlind) * this.addChipsData._bigBlind + this._bringInMin
            );
            this._bringInAmount = amount;
            this.textCoin.string = StringHelper.GetLongString(amount);
        };
        this.bringInSlider.setProgress(0);
    }

    // _setUpAutoOnTableSlider 设置自动买筹码的滑动条
    private _setUpAutoOnTableSlider() {
        const step = 1 / (this._autoBringInRange / this.addChipsData._bigBlind);
        this.autoSlider.step = Math.round(step * 10000) / 10000;
        this.autoSlider.onValueChanged = (progress: number) => {
            // 注意精度
            const amount = Math.min(
                this._autoBringInRange + this._autoBringInMin,
                Math.round((progress * this._autoBringInRange) / this.addChipsData._bigBlind) * this.addChipsData._bigBlind + this._autoBringInMin
            );
            this._autoOnTable = amount;
            this.autoSliderAmount.string = StringHelper.GetLongString(amount);
        };
        this.autoSlider.setProgress(0);
    }

    // 设置带入筹码Text
    private _setCoinTipText(): void {
        if (this.coinTipText) {
            this.coinTipText.string =
                this.addChipsData._deposit > 0 ? `${i18nMgr.Get('UITexas_AddChips')}+${i18nMgr.Get('UIFantasy_dairuyajin')}` : i18nMgr.Get('UITexas_AddChips');
            this.coinTipTextBottom.string = i18nMgr.Get('UITexas_AddChips');
        }
        if (this.bringBtn) {
            this.bringBtn.active = this.addChipsData._deposit > 0;
            this.scheduleOnce(() => {
                let worldPos = this.bringBtn.parent.convertToWorldSpaceAR(this.bringBtn.position);
                let localPos = this.triangleNode.parent.convertToNodeSpaceAR(worldPos);
                this.triangleNode.setPosition(localPos.x + 100, localPos.y - 53);
            }, 0);
        }
    }

    // onPayNowOrApplyTraderClicked 点击立即支付或者申请批发商
    private async onPayNowOrApplyTraderClicked(apply: boolean, payType: number, data: HttpUSDTRechargeProtocol.RequestData) {
        //console.log(LN, apply, payType, data);
        if (apply) {
            UIComponent.open<UIConfirmDialogParam>(UIDefine.UIConfirmDialog, {
                content:
                    '1、钻石批发商申请费为<color=#05E7AE>1000</color>钻石，审核被拒后退还；\n2、申请通过后，需在60天内购买批发商专属钻石，否则资格将失效；\n3、批发商资格失效或者审批被拒需重新付费<color=#05E7AE>1000</color>钻石申请；\n4、申请后，我们将通过系统消息联系您，请留意消息',
                ok: '支付1000钻石',
                ok_click: () => {
                    this._applyForTrader();
                }
            });
            return;
        }
        try {
            const resp = await WWW.Instance.CommonAPI<HttpUSDTRechargeProtocol.ResponseData>({
                web_class: WebOrderUserUsdtRecharge,
                body: data
            });
            if (resp.code != 0) {
                console.error(LN, 'recharge request error', resp.code);
                return;
            }
            const rechargeDiamondParam: UIRechargeDiamondParam = {
                exchangeRate: this._exchangeRate,
                amount: data.pay_price,
                qrcode: resp.data.usdt_address.qr_code,
                address: resp.data.usdt_address.address,
                addressType: resp.data.usdt_address.address_type,
                onConfirm: () => {}
            };
            // 正常渠道支付
            if (payType == 1) {
                UIComponent.open<UIRechargeDiamondParam>(UIDefine.UIRechargeDiamond, rechargeDiamondParam);
                return;
            }
            if (payType == 2) {
                UIComponent.Instance.Toast(i18nMgr.Get('UIMine_Setting108'));
                return;
            }
        } catch (e) {
            console.error(LN, 'recharge request exception', e);
            return;
        }
    }

    // _applyForTrader 申请批发商
    private async _applyForTrader() {
        try {
            const resp = await WWW.Instance.CommonAPI<HttpUSDTApplyProtocol.ResponseData>({
                web_class: WebUserTraderApply
            });
            if (resp.code != 0) {
                console.error(LN, 'apply trader error', resp.code);
                return;
            }
            const btn = this.payNowBtn;
            this._isApplyingTrader = true;
            btn.node.color = cc.Color.fromHEX(new cc.Color(), '#777777');
            this._rechargeData = null;
            this.payNowText.string = i18nMgr.Get('roomError171_5');
            btn.interactable = false;
            return;
        } catch (e) {
            console.error(LN, 'apply trader exception', e);
            return;
        }
    }

    // _callbackForChooseOne 选择购买项后的回调
    private _callbackForChooseOne(payData: HttpUSDTRechargeProtocol.RequestData, isSp: boolean, payType: number) {
        const btn = this.payNowBtn;
        // 批发商的，但是你在申请中
        if (isSp && this._isApplyingTrader) {
            btn.node.color = cc.Color.fromHEX(new cc.Color(), '#777777');
            this._rechargeData = null;
            this.payNowText.string = i18nMgr.Get('roomError171_5');
            btn.interactable = false;
            return;
        }
        // 批发商选项，且你不是批发商
        btn.interactable = true;
        btn.node.color = cc.Color.fromHEX(new cc.Color(), '#FFFFFF');
        if (isSp && !this.addChipsData._isTrader) {
            this._toApplyTrader = true;
            this.payNowText.string = i18nMgr.Get('OpCodeString_TRADERAPPLYFEE');
            return;
        }
        this._rechargeData = payData;
        this._payType = payType;
        this.payNowText.string = StringHelper.FormatString(i18nMgr.Get('Wallet_PayNow'), StringHelper.GetLongString(payData.pay_price, 1, 4));
    }

    // initDiamond 初始化钻石购买界面
    private async initDiamond(): Promise<void> {
        this.diamondAmountLabel.string = i18nMgr.Get('UISend_diamondsNum') + ':';
        this.diamondAmount.string = StringHelper.GetLongStringLocale(this.addChipsData._diamonds);
        let promises = [];
        promises.push(
            WWW.Instance.CommonAPI<HttpUSDTPriceListProtocol.ResponseData>({
                web_class: WebPropGoldPriceList,
                body: {
                    source_type: 2, // 玩家
                    gold_types: [4],
                    pay_gold_types: [],
                    trader_type: 0,
                    limit: 100,
                    offset: 0
                }
            })
        );
        // 如果不是批发商，还需要请求是否在申请批发商中
        if (!this.addChipsData._isTrader) {
            promises.push(
                WWW.Instance.CommonAPI<HttpUSDTApplyListProtocol.ResponseData>({
                    web_class: WebUserTraderApplyList,
                    body: {
                        status: 1
                    }
                })
            );
        }
        const results = await Promise.all(promises);
        // 判断是否再申请批发商中
        if (results.length > 1) {
            const applyResp = results[1] as HttpUSDTApplyListProtocol.ResponseData;
            if (applyResp.code != 0) {
                console.error(LN, 'get trade apply list error', applyResp.code);
                return;
            }
            this._isApplyingTrader = applyResp.data.list.length > 0;
        }
        // 获取购买项和渠道全信息
        const resp = results[0] as HttpUSDTPriceListProtocol.ResponseData;
        if (resp.code != 0) {
            console.error(LN, 'get diamond list error', resp.code);
            return;
        }
        this.diamondBoard.removeAllChildren();
        // 先初始化所有购买选项
        for (let i = 0; i < resp.data.list.length; i++) {
            const item = resp.data.list[i];
            const node = cc.instantiate(this.diamondItem);
            node.parent = this.diamondBoard;
            const nsdtDiamond = node.getComponent(USDTDiamond);
            nsdtDiamond.initData(item.id, item.gold_count, item.give_gold_count, item.trader_type == 2);
            nsdtDiamond.onChooseOneCallback = (p, t, y) => {
                this._callbackForChooseOne(p, t, y);
            };
        }
        this.paytypes.removeAllChildren();
        // 初始化所有渠道，并触发第一个选中
        for (let i = 0; i < resp.data.pay_types.length; i++) {
            const pt = resp.data.pay_types[i];
            const node = cc.instantiate(this.payttypeItem);
            node.parent = this.paytypes;
            const paytype = node.getComponent(USDTPaytype);
            paytype.initData(pt.id, pt.type, pt.rate, pt.discount, pt.image, pt.name, i == 0);
            paytype.onSelectedCallback = (data: RateDetail) => {
                this.diamondBoard.children.forEach((nd: cc.Node) => {
                    nd.getComponent(USDTDiamond).updateCost(data.payID, data.payType, data.rate, data.discount);
                });
                this._exchangeRate = Math.max(1, Math.round(1 / data.rate));
                this.exchangeRateText.string = StringHelper.FormatString(
                    i18nMgr.Get('UIBuyDiamondExchangeRate'),
                    StringHelper.GetLongString(this._exchangeRate, 1, 0)
                );
            };
            // 以下是处理默认选中状态时候的处理，因为限制导致默认情况无法触发callback，所以只能在这里处理一次
            let toggle = node.getComponent(cc.Toggle);
            if (toggle) {
                if (i == 0) {
                    toggle.isChecked = true;
                    this.diamondBoard.children.forEach((nd: cc.Node, index: number) => {
                        const usdtdiamond = nd.getComponent(USDTDiamond);
                        let payData = usdtdiamond.updateCost(pt.id, pt.type, pt.rate, pt.discount);
                        let toggleChoice = nd.getComponent(cc.Toggle);
                        if (toggleChoice) {
                            if (index == 0) {
                                toggle.isChecked = true;
                                this._callbackForChooseOne(payData, usdtdiamond.isSp, usdtdiamond.payType);
                            } else {
                                toggle.isChecked = false;
                            }
                        }
                    });
                    this._exchangeRate = Math.max(1, Math.round(1 / pt.rate));
                    this.exchangeRateText.string = StringHelper.FormatString(
                        i18nMgr.Get('UIBuyDiamondExchangeRate'),
                        StringHelper.GetLongString(this._exchangeRate, 1, 0)
                    );
                    continue;
                }
                toggle.isChecked = false;
            }
        }
    }

    /**
     * 点击带入
     */
    private onClickChips(obj: cc.Node): void {
        this._changeTitleType(E_TitleType.Chips);
    }

    /**
     * 点击钻石
     */
    private onClickDiamond(obj: cc.Node): void {
        this._changeTitleType(E_TitleType.Diamond);
    }

    /**
     * 切换标题
     */
    private _changeTitleType(titleType: E_TitleType): void {
        if (this.diamondArea) this.diamondArea.active = titleType == E_TitleType.Diamond;
        if (this.diamondLine) {
            this.diamondLine.active = titleType == E_TitleType.Diamond;
            this.diamondLine.color = cc.Color.fromHEX(new cc.Color(), '#fa2b4b');
        }
        if (this.addChipsArea) this.addChipsArea.active = titleType == E_TitleType.Chips;
        if (this.chipLine) {
            this.chipLine.active = titleType == E_TitleType.Chips;
            this.chipLine.color = cc.Color.fromHEX(new cc.Color(), '#fa2b4b');
        }
    }

    private removeAddChipsUI(): void {
        // TODO: UIComponent 隐藏逻辑
        // UIComponent.Instance.HideUI(UIType.UI_GAMEPLAY_ADD_CHIPS_DIAMOND);
        UIComponent.close(UIDefine.UIGameplayAddChipsAndDiamond);
    }

    private _confirmBringIn(): void {
        GameCache.Instance._texasData._isAutoPopupBringIn = true;
        if (GameplayUtil.GetTableType() == TableType.CLUB_EXTERNAL && this.mySelectWallet == null) {
            return;
        }
        let bringInAmount = this._bringInAmount;
        let storeAmount = 0;
        // 手动存钱需要自己设置藏多少
        if (this.addChipsData._retainInfo.RetainType == RoomInfo.RetainType.RT_MANUAL) {
            storeAmount = this._bringInAmount - this.addChipsData._retainInfo.RetainMinRate * this.addChipsData._bigBlind;
        }
        // 鱿鱼/蘑菇模式检查
        if (this.addChipsData._source == BringInChipsType.SQUID || this.addChipsData._source == BringInChipsType.MUSHROOM) {
            let isShowToast = !GameCache.Instance._isRoomManager;
            if (isShowToast && GameCache.Instance._friendsTableLimitBringIn) {
                UIComponent.Instance.ToastLanguage('UIWaitManagerAuditTip');
            }
        }
        const autoOnTableAmount = this._autoBringin ? this._autoOnTable : 0;
        let clubID = this.mySelectWallet != null ? this.mySelectWallet.club_id : 0;
        this.addChipsData._commit(bringInAmount, storeAmount, autoOnTableAmount, clubID);
        this.removeAddChipsUI();
    }

    private onClickCommit(): void {
        // DataStatisticsManager.Instance.Record(DataStatisticsConstant.GAME_BRING_COMMIT_BUTTON);
        this._confirmBringIn();
    }

    private onClickMask(): void {
        if (this.addChipsData?._source == BringInChipsType.MATCH) {
            return;
        }
        this.removeAddChipsUI();
    }

    private onClickClose(): void {
        if (this.addChipsData?._source == BringInChipsType.MATCH) {
            GameCache.Instance.CurGame.TexasGameUtils.LeaveRoom();
        }
        if (GameCache.Instance.game_type == GameType.MAHJONG) {
            // MahjongGameManager.Instance._dao._mainTableDao.UpdateNeedBringIn();
        }
        this.removeAddChipsUI();
        // DataStatisticsManager.Instance.Record(DataStatisticsConstant.GAME_BRING_CANCEL_BUTTON);
    }

    // 点击选择钱包按钮
    private onClickWalletBtn(): void {
        if (!this.buttonSelectWallet?.getComponent(cc.Button)?.interactable) {
            return;
        }
        if (this.walletScrollView) {
            this.walletScrollView.node.active = !this.walletScrollView.node.active;
        }
        if (this.arrowDown && this.walletScrollView) {
            if (this.walletScrollView.node.active) {
                this.arrowDown.angle = -180;
            } else {
                this.arrowDown.angle = -0;
            }
        }
        // 更新钱包列表选择状态
        if (this.walletToggles != null && this.walletToggles.length > 0) {
            for (let i = 0; i < this.walletToggles.length; i++) {
                this.walletToggles[i].isChecked = this.currentSelect == i;
            }
        }
    }

    // 点击提示遮罩(押金说明部分)
    private onClickTipsMask(): void {
        if (this.tips) this.tips.active = false;
        if (this.tipsMask) this.tipsMask.active = false;
        if (this.bringTips) this.bringTips.active = false;
    }

    // 设置钱包相关
    // 设置钱包列表
    private _setupWalletList(): void {
        if (!this.addChipsData?._wallets) return;
        console.log(LN, 'wallet:', this.addChipsData._wallets);
        this.walletToggles = [];
        this.currentSelect = -1;
        this.walletScrollView.node.active = false;
        this.mySelectWallet = null;
        // 如果已经有选中状态，要恢复状态
        if (this._cloneNode) this._cloneNode.active = false;
        this.emptySelectWallet.active = true;
        const wallets = this.addChipsData._wallets;
        if (wallets.length == 1) {
            this.mySelectWallet = wallets[0];
            this.sliderArea.active = true;
            GameCache.Instance.ClubRandomID = this.mySelectWallet.club_random_id;
            this._updateTotalCoinAndWalletChoosen(false, this.mySelectWallet.club_name, this.mySelectWallet.gold, this.addChipsData._creditNum);
        } else if (wallets.length > 1) {
            this.emptySelectWallet.active = true;
            let button = this.buttonSelectWallet.getComponent(cc.Button);
            button.interactable = true;
            this.walletScrollView.content.removeAllChildren();
            // 创建钱包列表项
            for (let i = 0; i < wallets.length; i++) {
                let walletItem = wallets[i];
                let temp = cc.instantiate(this.clueItemPrefab);
                // temp.setScale(1, 1, 1);
                // temp.active = true;
                temp.parent = this.walletScrollView.content;
                this._setClubItemData(walletItem, temp, i != wallets.length - 1);
                let toggle = temp.getComponent(cc.Toggle);
                let index = i;
                // 处理选中状态
                if (this.mySelectWallet != null && this.mySelectWallet.club_id == walletItem.club_id) {
                    toggle.isChecked = true;
                    let bgNode = cc.find('bg', temp);
                    if (bgNode) bgNode.active = true;
                    this.currentSelect = index;
                }
                // 添加Toggle监听
                toggle.node.on('toggle', (sender: cc.Toggle) => {
                    let bgNode = cc.find('bg', temp);
                    if (bgNode) bgNode.active = sender.isChecked;
                    if (!sender.isChecked) return;
                    this.currentSelect = index;
                    this.mySelectWallet = wallets[index];
                    this._updateTotalCoinAndWalletChoosen(true, wallets[index].club_name, wallets[index].gold, this.addChipsData._creditNum);
                });
                this.walletToggles.push(toggle);
            }
        }
        // 设置滚动视图高度
        if (wallets.length > 0 && this.walletScrollView) {
            let itemHeight = 60;
            let sep = 10;
            let delta = 60;
            let viewHeight = itemHeight * wallets.length + (wallets.length - 1) * sep + delta;
            // 设置滚动视图高度
            let scrollRT = this.walletScrollView.getComponent(cc.ScrollView);
            if (scrollRT && scrollRT.content) {
                scrollRT.content.height = viewHeight;
            }
        }
    }

    // _setClubItemData 设置俱乐部数据
    private _setClubItemData(walletItem: IWallet, temp: cc.Node, addLine?: boolean): void {
        // 设置头像
        let headImage = cc.find('cnamegrp/spriteClubIcon', temp).getComponent(RemoteSprite);
        headImage.url = walletItem.club_logo;
        // WebImageHelper.SetHeadImage(headImage, walletItem.club_logo);
        // 设置名称
        let nameLabel = cc.find('cnamegrp/labelClubName', temp).getComponent(cc.Label);
        if (nameLabel) nameLabel.string = walletItem.club_name;
        // 设置ID
        let idLabel = cc.find('labelClubId', temp).getComponent(cc.Label);
        if (idLabel) idLabel.string = walletItem.club_random_id.toString();
        // 设置余额标题
        let labelBalanceTitle = cc.find('overlay/balance/labelBalanceTitle', temp).getComponent(cc.Label);
        if (labelBalanceTitle) {
            labelBalanceTitle.string = i18nMgr.Get('UIClub_CreateRoom31');
        }
        let numLabel = cc.find('overlay/balance/labelBalance', temp).getComponent(cc.Label);
        if (numLabel) numLabel.string = StringHelper.GetLongStringLocale(walletItem.gold);
        let line = cc.find('overlay2', temp);
        line.active = addLine;
    }

    // _updateTotalCoinAndWalletChoosen 刷新金币和钱包选择状态
    private _updateTotalCoinAndWalletChoosen(isEnable: boolean, name: string, gold: number, credit: number = 0): void {
        if (this.textTotalCoin) this.textTotalCoin.string = StringHelper.GetLongStringLocale(gold);
        let button = this.buttonSelectWallet.getComponent(cc.Button);
        button.interactable = isEnable;
        this.emptySelectWallet.active = false;
        this.buttonCommit.active = true;
        this._cloneNode.active = true; // 显出出来
        this._setClubItemData(this.mySelectWallet, this._cloneNode, false);
        // 选择区域禁止选择
        this.walletScrollView.node.active = false;
        // 恢复箭头
        this.arrowDown.angle = -0;
        // 显示筹码滑块
        this.sliderArea.active = true;
    }

    private setMahjongInfo(): void {
        if (this.textBlindLabel) this.textBlindLabel.string = i18nMgr.Get('Mahjong_LowScore');
        if (this.textBlind) this.textBlind.string = StringHelper.GetLongString(this.addChipsData._smallBlind);
    }

    close(param?: any): void {
        super.onClose(param);
    }

    onDestroy(): void {
        super.onDestroy();
        this.removeHandler();
        this.mySelectWallet = null;
    }

    private registerHandler(): void {
        // TODO: 注册协议处理器
    }

    private removeHandler(): void {
        // TODO: 移除协议处理器
    }

    /**
     * 判断是否为前注显示； 目前有6+玩法，和bombpot
     */
    private checkIsAnte(): boolean {
        return this.checkIsSixPlus(GameCache.Instance.game_type, GameCache.Instance.poker_type) || GameCache.Instance._texasData._isBombPot;
    }

    /**
     * 判断是否为BombPot
     */
    private checkIsBombPot(): boolean {
        return GameCache.Instance._texasData._isBombPot && GameCache.Instance.game_type != GameType.MAHJONG;
    }

    /**
     * 判断是否为德州玩法
     */
    private checkIsTexas(): boolean {
        return (
            GameCache.Instance.game_type == GameType.HOLDEM ||
            GameCache.Instance.game_type == GameType.OMAHA4 ||
            GameCache.Instance.game_type == GameType.OMAHA5 ||
            GameCache.Instance.game_type == GameType.OMAHA6
        );
    }

    /**
     * 判断是否为6+短牌
     */
    private checkIsSixPlus(gameType: GameType, pokerType: PokerType): boolean {
        return pokerType == PokerType.SIX_PLUS && gameType == GameType.HOLDEM;
    }
}
