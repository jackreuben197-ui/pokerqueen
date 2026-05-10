import { GameCache } from '../../../../../game/GameCache';
import { i18nMgr } from '../../../../../i18n/i18nMgr';
import { BringInChipsType } from '../../constant/BringInChipsType';
import { GameType, PokerType } from '../../constant/LogicTypeConf';
import { RoomOriginType } from '../../constant/RoomOriginType';
import { TableType } from '../../constant/TableType';
import GameplayUtil from '../../util/GameplayUtil';
import { StringHelper } from '../../../../../helper/StringHelper';
import WebImageHelper from '../../../../../helper/WebImageHelper';
import SliderPlus from '../../../../../common/SliderPlus';
import UIComponent from '../../../../../ui/UIComponent';
import { UIDefine } from '../../../../../define/UIDefine';
import UIBase from '../../../../../ui/UIBase';
const { ccclass, menu, property } = cc._decorator;

/** 标题枚举 */
enum E_TitleType {
    /** 带入标题 */
    Chips,
    /** 钻石标题 */
    Diamond
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
    user_status: number;
    user_type: number;
    wallet_status: number;
    wallet_tribe_status: number;
}

/**
 * 带入筹码数据
 */
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
    /** 钱包列表 */
    public _wallets: IWallet[] = null;
    /** 0带入申请 1补充筹码 2菜单自动充值 3蘑菇 */
    public _source: BringInChipsType = BringInChipsType.BRING_IN;

    /** 点确认按钮 */
    public _commit: (amount: number, clubID: number) => void;
    /** 授信额度 */
    public _creditNum: number = 0;
    /** 押金 */
    public _deposit: number = 0;
}
const LN = '[UIGameplayAddChipsAndDiamondComponent]';

/**
 * 核心玩法：带入筹码界面
 */
@ccclass
@menu('脚本分组/crazypoke/gameplay/common/view/UIGameplayAddChipsAndDiamondComponent')
export default class UIGameplayAddChipsAndDiamondComponent extends UIBase {
    // 组件引用
    @property(SliderPlus)
    private sliderCoin: SliderPlus = null;
    @property(cc.Node)
    private sliderArea: cc.Node = null;
    @property(cc.Node)
    private buttonCommit: cc.Node = null;
    @property(cc.Node)
    private buttonClose: cc.Node = null;
    @property(cc.Node)
    private buttonMask: cc.Node = null;
    @property(cc.Node)
    private triangleNode: cc.Node = null;
    /**
     * 盲注
     */
    @property(cc.Label)
    private textBlind: cc.Label = null;
    /**
     * 盲注标题
     */
    @property(cc.Label)
    private textBlindLabel: cc.Label = null;
    /**
     * 带入筹码
     */
    @property(cc.Label)
    private textCoin: cc.Label = null;
    /**
     * 授信额度
     */
    @property(cc.Label)
    private textTotalCoin: cc.Label = null;
    /**
     * 授信额度
     */
    @property(cc.Label)
    private textTotalCoinTitle: cc.Label = null;
    /**
     * 滑动条上的需要的筹码
     */
    @property(cc.Label)
    // private textNeedCoin: cc.Label = null;
    private textWallet: cc.Label = null;
    /**
     * 金币图标
     */
    @property(cc.Sprite)
    private goldImage: cc.Sprite = null;
    private selectWallet: cc.Node = null;
    private right: cc.Node = null;
    private recordFeeObj: cc.Node = null;
    private textTitle: cc.Label = null;
    /**
     * 自动充值描述
     */
    @property(cc.Node)
    private autoObj: cc.Node = null;
    private autoToggle: cc.Toggle = null;
    private autoSliderObj: cc.Node = null;
    private autoSliderMin: cc.Slider = null;
    private autoSliderMax: cc.Slider = null;
    private autoSliderMinFillImg: cc.Sprite = null;
    private autoSliderMaxFillImg: cc.Sprite = null;
    private autoSliderMinBgImg: cc.Sprite = null;
    private autoSliderMaxBgImg: cc.Sprite = null;
    private autoDetailText: cc.Label = null;
    private textNeedCoinAutoMin: cc.Label = null;
    private textNeedCoinAutoMax: cc.Label = null;
    private depositImg: cc.Sprite = null;
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
     * 带入筹码描述按钮
     */
    @property(cc.Node)
    public bringBtn: cc.Node = null;
    /**
     * 带入筹码具体描述
     */
    @property(cc.Node)
    public bringTips: cc.Node = null;
    // 状态变量
    private addChipsData: AddChipsData = null;
    private mySelectWallet: IWallet = null;
    private currentSelect: number = 0;
    private walletToggles: cc.Toggle[] = [];
    private magnification: number = 1;
    private isFirstClick: boolean = false;
    /** 带入分段 */
    public sliderSpace: number = 50;
    /** 带入筹码显示 包含押金 */
    private bringInAmount: number = 0;
    /** 带入筹码 不包含押金 */
    private anteNum: number = 0;
    /** 记录费配置 */
    private config: any = null;
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
    /** 横屏下的滚动 */
    public landSpaceScroll: cc.ScrollView = null;
    // ========== end 钻石相关 ==========
    private rate: number = 0;
    private realMaxBring: number = 0;
    /** 联盟币图标 */
    private unionCoinSpr: cc.SpriteFrame = null;
    /** USDT图标 */
    private usdtSpr: cc.SpriteFrame = null;
    /** 钻石图标 */
    private diamondSpr: cc.SpriteFrame = null;
    /** 授信图标 */
    private creditSpr: cc.SpriteFrame = null;
    private autoMax: string = null;
    private autoMin: string = null;
    private quickLoginInfo: any = null;
    /**
     * 俱乐部预制体
     */
    @property(cc.Node)
    private clueItemPrefab: cc.Node = null;
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
    /**
     * 选择钱包按钮
     */
    @property(cc.Node)
    private buttonSelectWallet: cc.Node = null;
    @property(cc.Node)
    private arrowDown: cc.Node = null;
    // 颜色常量
    private static readonly COLOR_GRAY = new cc.Color(128, 128, 128);
    private static readonly COLOR_WHITE = new cc.Color(255, 255, 255);
    private static readonly COLOR_GOLD = new cc.Color(248, 194, 85);

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.setButtonClick(this.buttonCommit, this.onClickCommit);
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
        // 滑块事件
        if (this.autoSliderMin) {
            this.autoSliderMin.node.on('slide', this.onValueAutoMinSlider, this);
        }
        if (this.autoSliderMax) {
            this.autoSliderMax.node.on('slide', this.onValueAutoMaxSlider, this);
        }
        // 自动充值开关
        if (this.autoToggle) {
            this.autoToggle.node.on(
                'toggle',
                (toggle: cc.Toggle) => {
                    if (this.autoSliderObj) {
                        this.autoSliderObj.active = toggle.isChecked;
                    }
                },
                this
            );
        }
    }

    onShow(obj?: any): void {
        super.onShow(obj);
        // 初始化参数
        if (GameCache.Instance.game_type == GameType.MAHJONG) {
            this.rate = 10; // TODO: MahjongConstant.BRING_IN_RATE(GameCache.Instance.room_type)
            this.sliderSpace = this.rate;
        } else if (GameCache.Instance._originType == RoomOriginType.UNION) {
            this.sliderSpace = 10;
            this.rate = 10;
        } else {
            this.sliderSpace = 50; // TODO: CreateRoomConstant.TEXAS_MIN_BRING_RATE
            this.rate = 50;
        }
        if (obj) {
            this.addChipsData = obj as AddChipsData;
            this.isFirstClick = true;
            this.currentSelect = -1;
            this.walletToggles = [];
            // 根据来源设置标题
            switch (this.addChipsData._source) {
                case BringInChipsType.BRING_IN:
                    if (this.textTitle) this.textTitle.string = i18nMgr.Get('UIClub_RoomSitApplyRecords_title');
                    this.magnification = 1.0;
                    break;
                case BringInChipsType.SUPPLEMENT:
                    if (this.textTitle) this.textTitle.string = i18nMgr.Get('UITexas_AddChipsMenu');
                    this.magnification = 1.0;
                    break;
                case BringInChipsType.AUTO_RECHARGE:
                    if (this.textTitle) this.textTitle.string = i18nMgr.Get('UICreate_AutoRechage');
                    this.magnification = 1.0;
                    break;
                case BringInChipsType.MUSHROOM:
                    if (this.textTitle) this.textTitle.string = i18nMgr.Get('UITexas_AddChipsMenu');
                    this.magnification = 1.0;
                    break;
                case BringInChipsType.SQUID:
                    if (this.textTitle) this.textTitle.string = i18nMgr.Get('UITexas_AddChipsMenu');
                    this.magnification = 1.0;
                    break;
                case BringInChipsType.MATCH:
                    if (this.textTitle) this.textTitle.string = i18nMgr.Get('UIClub_RoomSitApplyRecords_title');
                    this.magnification = 1.0;
                    break;
                default:
                    if (this.textTitle) this.textTitle.string = i18nMgr.Get('UIClub_RoomSitApplyRecords_title');
                    break;
            }
            this.clueItemPrefab.active = false;
            this.walletScrollView.node.active = false;
            this.sliderArea.active = false;
            this.arrowDown.angle = -0;
            this.initDiamond();
            this.setupSlider();
            // 钱包列表
            this.setupWalletList();
        }
    }

    /**
     * 设置滑块
     */
    private setupSlider(): void {
        console.log(LN, 'setupSlider', this.addChipsData);
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
            console.log(LN, 'setupSlider', i18nMgr.Get('UITexas_smallBigBlind'));
            console.log(
                LN,
                'setupSlider',
                `${StringHelper.GetLongString(this.addChipsData._smallBlind)}/${StringHelper.GetLongString(this.addChipsData._bigBlind)}`
            );
            this.textBlindLabel.string = i18nMgr.Get('UITexas_smallBigBlind');
            this.textBlind.string = `${StringHelper.GetLongString(this.addChipsData._smallBlind)}/${StringHelper.GetLongString(this.addChipsData._bigBlind)}`;
        }
        this.setCoinTipText();
        // 计算最大带入
        let currentMaxBring = 0;
        // 自由带入特殊处理
        // if (GameCache.Instance._bringInLimitType == 1 &&
        //     (this.addChipsData._storeChips + this.addChipsData._tableChips) > this.addChipsData._currentMaxRate * this.addChipsData._bigBlind) {
        //     currentMaxBring = this.addChipsData._storeChips;
        //     // if (this.textNeedCoin) this.textNeedCoin.string = StringHelper.GetLongString(this.addChipsData._storeChips);
        // } else {
        // if (this.textNeedCoin) this.textNeedCoin.string = StringHelper.GetLongString(
        //     this.addChipsData._currentMinRate * this.addChipsData._bigBlind
        // );
        currentMaxBring = this.addChipsData._currentMaxRate * this.addChipsData._bigBlind - this.addChipsData._tableChips;
        //}
        // 补充筹码模式特殊处理
        if (this.addChipsData._source == BringInChipsType.SUPPLEMENT) {
            if (GameCache.Instance.game_type == GameType.MAHJONG) {
                currentMaxBring = this.addChipsData._currentMaxRate * this.addChipsData._smallBlind;
            } else {
                if (this.addChipsData._currentMaxRate * this.addChipsData._bigBlind < this.addChipsData._tableChips) {
                    currentMaxBring = 0;
                } else {
                    currentMaxBring = this.addChipsData._currentMaxRate * this.addChipsData._bigBlind - this.addChipsData._tableChips;
                }
            }
        }
        let maxRate = Math.floor((currentMaxBring / this.addChipsData._bigBlind) * 100);
        this.realMaxBring = maxRate;
        if (this.addChipsData._source == BringInChipsType.SUPPLEMENT) {
            maxRate = Math.floor(currentMaxBring / 100);
            this.realMaxBring = currentMaxBring / 100;
        }
        // // 限制最大倍率
        // if (!(GameCache.Instance._bringInLimitType == 1 && this.addChipsData._storeChips > this.addChipsData._currentMaxRate * this.addChipsData._bigBlind)) {
        //     if (this.addChipsData._source != BringInChipsType.SUPPLEMENT) {
        //         if (maxRate > this.addChipsData._currentMaxRate) {
        //             maxRate = this.addChipsData._currentMaxRate;
        //         }
        //     }
        // }
        //常显
        // if (sliderParent) sliderParent.active = this.addChipsData._currentMaxRate != this.addChipsData._currentMinRate;
        // 根据来源设置滑块
        if (
            this.addChipsData._source == BringInChipsType.BRING_IN ||
            this.addChipsData._source == BringInChipsType.MATCH ||
            this.addChipsData._source == BringInChipsType.SQUID ||
            this.addChipsData._source == BringInChipsType.MUSHROOM
        ) {
            console.log(LN, 'set silider', maxRate);
            this.setBringInForSlider(maxRate);
            // 设置自动滑块
            if (
                this.checkIsSixPlus(GameCache.Instance.game_type, GameCache.Instance.poker_type) &&
                this.addChipsData._currentMinRate == this.addChipsData._currentMaxRate
            ) {
                this.initAutoSliders(maxRate, this.addChipsData._currentMinRate);
            } else if (this.checkIsBombPot()) {
                this.initAutoSliders(maxRate, this.addChipsData._currentMinRate);
            } else {
                this.initAutoSliders(maxRate, this.addChipsData._currentMinRate);
            }
            // 显示自动充值区域
            if (GameCache.Instance._originType == RoomOriginType.CLUB) {
                if (this.autoObj) this.autoObj.active = GameCache.Instance._autoRecharge == 1;
            } else if (GameCache.Instance._originType == RoomOriginType.UNION) {
                if (this.autoObj) this.autoObj.active = GameCache.Instance._autoRecharge == 1;
            } else {
                if (this.autoObj) this.autoObj.active = false;
            }
        } else if (this.addChipsData._source == BringInChipsType.SUPPLEMENT) {
            if (GameCache.Instance.game_type == GameType.MAHJONG) {
                this.setBringInForSlider(maxRate);
            } else if (GameCache.Instance.game_type == GameType.EGG) {
                if (this.sliderCoin) {
                    this.setSliderRange(this.sliderCoin, 1, maxRate / 100, 1);
                    this.onValueChangedSliderCoin(1);
                }
            } else {
                if (this.sliderCoin) {
                    let maxVal: number;
                    if (this.checkIsSixPlus(GameCache.Instance.game_type, GameCache.Instance.poker_type) || this.checkIsBombPot()) {
                        maxVal = maxRate / ((this.sliderSpace * 2 * this.addChipsData._bigBlind) / 100);
                    } else {
                        maxVal = maxRate / ((this.sliderSpace * this.addChipsData._bigBlind) / 100);
                    }
                    this.setSliderRange(this.sliderCoin, 1, maxVal, 1);
                    this.onValueChangedSliderCoin(1);
                }
            }
        } else if (this.addChipsData._source == BringInChipsType.AUTO_RECHARGE) {
            if (this.autoObj) this.autoObj.active = true;
            // if (sliderParent) sliderParent.active = false;
            let coinParent = this.textCoin?.node?.parent;
            if (coinParent) coinParent.active = false;
        }
        if (this.sliderCoin) {
            // TODO: Cocos Slider 没有 wholeNumbers 属性，需要自定义滑块组件
            // (this.sliderCoin as any).wholeNumbers = true;
        }
        // 点击返回游戏按钮触发的带入申请
        // if (this.addChipsData._isBringIn) {
        //     if (this.autoObj) this.autoObj.active = false;
        //     if (this.autoSliderObj) this.autoSliderObj.active = false;
        // }
        this.updateGoldSprite();
        // 授信模式
        if (GameCache.Instance.gold_type == 3) {
            if (this.selectWallet) this.selectWallet.active = false;
            if (this.buttonSelectWallet) {
                let btn = this.buttonSelectWallet.getComponent(cc.Button);
                if (btn) btn.interactable = false;
            }
            if (this.buttonSelectWallet) this.buttonSelectWallet.active = false;
            this.getRecordFeeData(GameCache.Instance._originType);
            return;
        }
    }

    /**
     * 初始化钻石相关
     */
    private initDiamond(): void {
        // this.diamondRC = this.diamondArea?.getComponent(cc.Component) || null;
        this.changeTitleType(E_TitleType.Chips);
    }

    // ========== 钻石相关 ==========

    private refreshRecordDiamondConfig(config: any): void {
        this.config = config;
        if (this.recordFeeObj) {
            this.recordFeeObj.active = config?.status == 1;
        }
        if (config?.status != 1) return;
        this.setRecordFee();
    }

    /**
     * 点击带入
     */
    private onClickChips(obj: cc.Node): void {
        this.changeTitleType(E_TitleType.Chips);
        // DataStatisticsManager.Instance.Record(DataStatisticsConstant.GAME_BRING_CHIPS_BUTTON);
    }

    /**
     * 点击钻石
     */
    private onClickDiamond(obj: cc.Node): void {
        this.changeTitleType(E_TitleType.Diamond);
        // DataStatisticsManager.Instance.Record(DataStatisticsConstant.GAME_BRING_DIAMOND_BUTTON);
    }

    /**
     * 切换标题
     */
    private changeTitleType(titleType: E_TitleType): void {
        if (this.diamondArea) this.diamondArea.active = titleType == E_TitleType.Diamond;
        if (this.diamondLine) this.diamondLine.active = titleType == E_TitleType.Diamond;
        if (this.addChipsArea) this.addChipsArea.active = titleType == E_TitleType.Chips;
        if (this.chipLine) this.chipLine.active = titleType == E_TitleType.Chips;
        //this.chipInfo.string = i18nMgr.Get("UITexasReport_Text_DeskScoreTip");
    }

    // ========== end 钻石相关 ==========
    /**
     * 设置记录费UI
     */
    private setRecordFee(): void {
        // if (this.config == null) return;
        // if (this.config.status != 1) return;
        // let settings = this.config.setting;
        // let gameplayData = BaseGameplayDao.Instance.GetGameplayData();
        // // 检查是否为常规德州玩法
        // let roomType = GameCache.Instance.room_type;
        // if (this.isRegularTexasGameplay(roomType)) {
        //     let sbTmp = gameplayData._smallBlind;
        //     if (this.checkIsAnte()) {
        //         sbTmp = sbTmp * 2;
        //     }
        //     // TODO: 根据 sbTmp 匹配 settings 中的记录费配置
        //     // 并计算记录费显示
        // }
    }

    /**
     * 判断是否为常规德州玩法
     */
    private isRegularTexasGameplay(roomType: number): boolean {
        return roomType >= 0 && roomType < 256;
    }

    /**
     * 设置滑块值 (兼容 Cocos Slider 和 SliderPlus)
     */
    private setSliderRange(slider: SliderPlus | cc.Slider, min: number, max: number, value: number): void {
        if (!slider) return;
        if (slider instanceof SliderPlus) {
            // SliderPlus 处理
            slider.show({
                min_value: min,
                max_value: max,
                step: 1,
                change: (val: number) => {
                    this.onValueChangedSliderCoin(val);
                },
                own: this
            });
            slider.value = value;
        } else {
            // Cocos Slider 处理
            let s = slider as any;
            s.minValue = min;
            s.maxValue = max;
            s.progress = (value - min) / (max - min);
        }
    }

    private onEndDrag(): void {
        this.isFirstClick = false;
    }

    private onBeginDrag(): void {
        // Unity 中为空实现
    }

    private onValueAutoMinSlider(arg0: number): void {
        if (this.autoSliderMin.progress >= this.autoSliderMax.progress) {
            this.autoSliderMax.node.setSiblingIndex(999);
            if (this.autoSliderMinFillImg) this.autoSliderMinFillImg.node.color = UIGameplayAddChipsAndDiamondComponent.COLOR_WHITE;
            if (this.autoSliderMaxFillImg) this.autoSliderMaxFillImg.node.color = new cc.Color(128, 128, 128); // SLIDER_GRAY2
            if (this.autoSliderMaxBgImg) this.autoSliderMaxBgImg.node.color = new cc.Color(128, 128, 128);
            if (this.autoSliderMinBgImg) this.autoSliderMinBgImg.node.color = new cc.Color(128, 128, 128);
        } else {
            this.autoSliderMin.node.setSiblingIndex(999);
            if (this.autoSliderMinFillImg) this.autoSliderMinFillImg.node.color = new cc.Color(128, 128, 128);
            if (this.autoSliderMaxFillImg) this.autoSliderMaxFillImg.node.color = UIGameplayAddChipsAndDiamondComponent.COLOR_WHITE;
            if (this.autoSliderMaxBgImg) this.autoSliderMaxBgImg.node.color = new cc.Color(128, 128, 128);
            if (this.autoSliderMinBgImg) this.autoSliderMinBgImg.node.color = new cc.Color(128, 128, 128);
        }
        if (this.textNeedCoinAutoMin) {
            this.textNeedCoinAutoMin.string = StringHelper.GetLongString(Math.floor((arg0 * this.addChipsData._bigBlind * 10) / this.magnification));
        }
        this.setAutoDetailText();
    }

    private onValueAutoMaxSlider(arg0: number): void {
        if (this.autoSliderMin.progress >= this.autoSliderMax.progress) {
            this.autoSliderMax.node.setSiblingIndex(999);
            if (this.autoSliderMinFillImg) this.autoSliderMinFillImg.node.color = UIGameplayAddChipsAndDiamondComponent.COLOR_WHITE;
            if (this.autoSliderMaxFillImg) this.autoSliderMaxFillImg.node.color = new cc.Color(128, 128, 128);
            if (this.autoSliderMaxBgImg) this.autoSliderMaxBgImg.node.color = new cc.Color(128, 128, 128);
            if (this.autoSliderMinBgImg) this.autoSliderMinBgImg.node.color = new cc.Color(128, 128, 128);
        } else {
            this.autoSliderMin.node.setSiblingIndex(999);
            if (this.autoSliderMinFillImg) this.autoSliderMinFillImg.node.color = new cc.Color(128, 128, 128);
            if (this.autoSliderMaxFillImg) this.autoSliderMaxFillImg.node.color = UIGameplayAddChipsAndDiamondComponent.COLOR_WHITE;
            if (this.autoSliderMaxBgImg) this.autoSliderMaxBgImg.node.color = new cc.Color(128, 128, 128);
            if (this.autoSliderMinBgImg) this.autoSliderMinBgImg.node.color = new cc.Color(128, 128, 128);
        }
        if (this.textNeedCoinAutoMax) {
            this.textNeedCoinAutoMax.string = StringHelper.GetLongString(Math.floor((arg0 * this.addChipsData._bigBlind * 10) / this.magnification));
        }
        this.setAutoDetailText();
    }

    private setAutoDetailText(): void {
        if (!this.textNeedCoinAutoMin || !this.textNeedCoinAutoMax) return;
        let minStr = this.textNeedCoinAutoMin.string;
        let maxStr = this.textNeedCoinAutoMax.string;
        if (minStr && maxStr) {
            let minNum = parseFloat(minStr);
            let maxNum = parseFloat(maxStr);
            if (!isNaN(minNum) && !isNaN(maxNum)) {
                let min: string;
                let max: string;
                if (minNum >= maxNum) {
                    min = `<color=#F8C255>${maxStr}</color>`;
                    max = `<color=#F8C255>${minStr}</color>`;
                    this.autoMax = minStr;
                    this.autoMin = maxStr;
                } else {
                    min = `<color=#F8C255>${minStr}</color>`;
                    max = `<color=#F8C255>${maxStr}</color>`;
                    this.autoMax = maxStr;
                    this.autoMin = minStr;
                }
                if (this.autoDetailText) {
                    this.autoDetailText.string = i18nMgr.Get('UIAutoRechageTips2').replace('{0}', min).replace('{1}', max);
                }
            }
        }
    }

    private onValueChangedSliderCoin(arg0: number): void {
        if (this.isFirstClick && this.autoSliderMax) {
            this.autoSliderMax.progress = arg0;
        }
        let anteNum = 0;
        //console.log(LN, `${this.addChipsData._bigBlind} ${this.rate} ${this.magnification}`);
        if (this.checkIsAnte()) {
            anteNum = (arg0 * this.addChipsData._bigBlind * this.rate * 2) / this.magnification;
        } else {
            anteNum = (arg0 * this.addChipsData._bigBlind * this.rate) / this.magnification;
        }
        // 补充筹码特殊处理
        // if (this.addChipsData._source == BringInChipsType.SUPPLEMENT) {
        //     // 使用SliderPlus的max_value获取最大值
        //     let sliderMax = this.sliderCoin?.data?.max_value || 1;
        //     if (Math.abs(sliderMax - arg0) < 0.0001) {
        //         if (this.realMaxBring * 100 > anteNum) {
        //             anteNum = this.realMaxBring * 100;
        //         }
        //     } else if (this.realMaxBring > 0 && sliderMax == 0 && this.realMaxBring * 100 < anteNum) {
        //         anteNum = this.realMaxBring * 100;
        //     }
        // }
        this.anteNum = Math.floor(anteNum * 100);
        //let totalDeposit = this.getSquidDeposit() + this.getMushroomDeposit() + this.getRandomMatchDeposit() + this.getFantasyDeposit();
        this.bringInAmount = anteNum + this.addChipsData._deposit;
        this.textCoin.string = StringHelper.GetLongString(this.bringInAmount);
        this.setRecordFee();
    }

    private removeAddChipsUI(): void {
        // TODO: UIComponent 隐藏逻辑
        // UIComponent.Instance.HideUI(UIType.UI_GAMEPLAY_ADD_CHIPS_DIAMOND);
        UIComponent.close(UIDefine.UIGameplayAddChipsAndDiamond);
    }

    private commitAct(): void {
        GameCache.Instance._texasData._isAutoPopupBringIn = true;
        if (GameplayUtil.GetTableType() == TableType.CLUB_EXTERNAL && this.mySelectWallet == null) {
            return;
        }
        let bringInAmount = this.bringInAmount;
        // 匹配模式
        // if (this.addChipsData._source == BringInChipsType.MATCH) {
        //     let clubId = 0;
        //     if (this.mySelectWallet != null) {
        //         clubId = this.mySelectWallet.club_id;
        //     }
        //     this.addChipsData._matchAction?.(this.anteNum / 100, clubId);
        //     this.removeAddChipsUI();
        //     return;
        // }
        // 鱿鱼/蘑菇模式检查
        if (this.addChipsData._source == BringInChipsType.SQUID || this.addChipsData._source == BringInChipsType.MUSHROOM) {
            let isShowToast = !GameCache.Instance._isRoomManager;
            if (isShowToast && GameCache.Instance._friendsTableLimitBringIn) {
                UIComponent.Instance.ToastLanguage('UIWaitManagerAuditTip');
            }
        }
        if (this.anteNum <= 0) {
            UIComponent.Instance.ToastLanguage('UIBringInTipsZero');
            return;
        }
        // 自动充值模式
        if (this.addChipsData._source == BringInChipsType.AUTO_RECHARGE) {
            let isUseWallet = false;
            let autoOnTable = 0;
            if (this.autoObj.active) {
                isUseWallet = this.autoToggle.isChecked;
                if (this.autoToggle.isChecked && this.autoMin) {
                    autoOnTable = parseFloat(this.autoMin) * 100;
                }
            }
            let autoOnTableFix = this.autoMax ? parseFloat(this.autoMax) * 100 : 0;
            // GameCache.Instance._curGame.SetAutoOnTableChips(autoOnTable, isUseWallet, autoOnTableFix);
            // GameCache.Instance._autoRechargeData = new AutoRechargeData();
            // GameCache.Instance._autoRechargeData._isOpen = this.autoToggle.isChecked;
            // GameCache.Instance._autoRechargeData._min = this.autoSliderMax.progress;
            // GameCache.Instance._autoRechargeData._max = this.autoSliderMin.progress;
            this.removeAddChipsUI();
            return;
        }
        // 带入逻辑
        let isUseWallet = false;
        let autoOnTable = 0;
        let autoToggleIson = false;
        let autoOnTableFix = 0;
        if (this.autoObj.active) {
            isUseWallet = this.autoToggle.isChecked;
            autoToggleIson = this.autoToggle.isChecked;
            if (this.autoToggle.isChecked && this.autoMax) {
                autoOnTable = parseFloat(this.autoMax) * 100;
                autoOnTableFix = autoOnTable;
            }
        }
        // let maxValue = this.autoSliderMax.progress;
        // let minValue = this.autoSliderMin.progress;
        let clubID = this.mySelectWallet != null ? this.mySelectWallet.club_id : 0;
        let clubRandomID = this.mySelectWallet != null ? this.mySelectWallet.club_random_id : 0;
        // // 随机座位
        // if (this.addChipsData._source == BringInChipsType.BRING_IN && GameCache.Instance._randomSeat == 1) {
        //     // (GameCache.Instance._curGame as TexasGame).PlayRandomSeatDownCircles(() => {
        //     this.bringIn(bringInAmount, isUseWallet, autoOnTable, autoToggleIson, autoOnTableFix, 0, 0,
        //         this.getSquidDeposit(), clubID, clubRandomID);
        //     this.removeAddChipsUI();
        //     // });
        // } else {
        //     this.bringIn(bringInAmount, isUseWallet, autoOnTable, autoToggleIson, autoOnTableFix, 0, 0,
        //         this.getSquidDeposit(), clubID, clubRandomID);
        //     this.removeAddChipsUI();
        // }
        this.addChipsData._commit(bringInAmount, clubID);
        this.removeAddChipsUI();
    }

    // private bringIn(anterNumber: number, isUseWallet: boolean, autoOnTable: number, autoToggleIson: boolean,
    //     autoOnTableFix: number, maxValue: number, minValue: number, depositValue: number,
    //     clubID: number = 0, clubRandomID: number = 0): void {
    //     if (GameplayUtil.GetTableType() == TableType.CLUB_EXTERNAL) {
    //         // GameCache.Instance._curGame.AddChips(anterNumber, autoOnTable, isUseWallet, clubID, clubRandomID, autoToggleIson, autoOnTableFix, depositValue);
    //         GameCache.Instance.CurGame.AddChips(anterNumber, autoOnTable, isUseWallet, clubID, clubRandomID, {
    //             own: this,
    //             wallets: this.addChipsData._wallets,
    //             selected_wallet: this.mySelectWallet,
    //         },this.addChipsData._returnOrNew);
    //         // GameCache.Instance._autoRechargeData = new AutoRechargeData();
    //         // GameCache.Instance._autoRechargeData._isOpen = autoToggleIson;
    //         // GameCache.Instance._autoRechargeData._min = maxValue;
    //         // GameCache.Instance._autoRechargeData._max = minValue;
    //     } else {
    //         // GameCache.Instance._curGame.AddChips(anterNumber);
    //         GameCache.Instance.CurGame.AddChips(anterNumber);
    //     }
    // }

    private onClickCommit(): void {
        // DataStatisticsManager.Instance.Record(DataStatisticsConstant.GAME_BRING_COMMIT_BUTTON);
        this.commitAct();
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

    private onClickTipsMask(): void {
        if (this.tips) this.tips.active = false;
        if (this.tipsMask) this.tipsMask.active = false;
        if (this.bringTips) this.bringTips.active = false;
    }

    /**
     * 初始化自动充值滑块
     */
    private initAutoSliders(maxRate: number, minRate: number): void {
        if (!this.autoSliderMin || !this.autoSliderMax) return;
        let space = this.sliderSpace || 50;
        let off = 1;
        if (this.checkIsSixPlus(GameCache.Instance.game_type, GameCache.Instance.poker_type) || this.checkIsBombPot()) {
            off = 2;
        }
        if (this.checkIsSixPlus(GameCache.Instance.game_type, GameCache.Instance.poker_type) && minRate == this.addChipsData._currentMaxRate) {
            let maxVal = maxRate / space;
            this.setSliderRange(this.autoSliderMin, 1, maxVal, 1);
            this.setSliderRange(this.autoSliderMax, 1, maxVal, 1);
            this.onValueAutoMinSlider(1);
            this.onValueAutoMaxSlider(1);
        } else {
            let minVal = minRate / space / off;
            let maxVal = maxRate / space / off;
            this.setSliderRange(this.autoSliderMin, minVal, maxVal, minVal);
            this.setSliderRange(this.autoSliderMax, minVal, maxVal, minVal);
            this.onValueAutoMinSlider(minVal);
            this.onValueAutoMaxSlider(minVal);
        }
    }

    /**
     * 设置钱包列表
     */
    private setupWalletList(): void {
        if (!this.addChipsData?._wallets) return;
        console.log(LN, 'wallet:', this.addChipsData._wallets);
        this.mySelectWallet = null;
        const wallets = this.addChipsData._wallets;
        if (wallets.length == 1) {
            this.mySelectWallet = wallets[0];
            this.sliderArea.active = true;
            GameCache.Instance.ClubRandomID = this.mySelectWallet.club_random_id;
            this.updateTotalCoin(false, this.mySelectWallet.club_name, this.mySelectWallet.gold, this.addChipsData._creditNum);
            // if (this.arrowDown) this.arrowDown.active = false;
            // if (this.depositArea) this.depositArea.active = this.mySelectWallet.deposit_advance == 1 && this.isHaveDeposit();
        } else if (wallets.length > 1) {
            //let curWallet = this.getClubInfo();
            // if (curWallet == null) {
            this.emptySelectWallet.active = true;
            this.updateTotalCoin(true, i18nMgr.Get('UIGuild_WalletNoSelect'), 0, this.addChipsData._creditNum);
            // } else {
            //     this.emptySelectWallet.active = false;
            //     this.mySelectWallet = curWallet;
            //     this.updateTotalCoin(true, this.mySelectWallet.club_name, this.mySelectWallet.gold, this.addChipsData._creditNum);
            //     //if (this.arrowDown) this.arrowDown.setRotation(0);
            // }
            // if (this.arrowDown) this.arrowDown.active = true;
            this.walletScrollView.content.removeAllChildren();
            // 创建钱包列表项
            for (let i = 0; i < wallets.length; i++) {
                let walletItem = wallets[i];
                let temp = cc.instantiate(this.clueItemPrefab);
                temp.setPosition(0, 0);
                temp.setScale(1, 1, 1);
                temp.active = true;
                this.walletScrollView.content.addChild(temp);
                // 强制 Layout 组件立即重新计算
                let layout = this.walletScrollView.content.getComponent(cc.Layout);
                if (layout) {
                    layout.updateLayout();
                }
                console.log(LN, 'wallet:', i, walletItem.club_random_id);
                this.SetClubItemData(walletItem, temp, i != wallets.length - 1);
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
                    if (sender.isChecked) {
                        this.currentSelect = index;
                        this.mySelectWallet = wallets[index];
                        this.updateTotalCoin(true, wallets[index].club_name, wallets[index].gold, this.addChipsData._creditNum);
                        this.walletScrollView.node.active = false;
                        this.arrowDown.angle = -0;
                        this.sliderArea.active = true;
                        // if (this.arrowDown && this.arrowDown.activeInHierarchy) {
                        //     this.arrowDown.setRotation(this.walletScrollView.node.activeInHierarchy ? 180 : 0);
                        // }
                    }
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

    /**
     * 设置带入筹码Text
     */
    private setCoinTipText(): void {
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

    // /**
    //  * slider 设置, 补充筹码
    //  */
    // private setBringInForSliderBySupplement(maxRate: number, bigBlind: number): void {
    //     if (GameCache.Instance.game_type == GameType.MAHJONG || GameCache.Instance.game_type == GameType.EGG) {
    //         if (this.sliderCoin) this.setSliderRange(this.sliderCoin, 1, maxRate / 100, 1);
    //     } else if (this.checkIsTexas()) {
    //         let off = 1;
    //         if (this.checkIsSixPlus(GameCache.Instance.game_type, GameCache.Instance.poker_type) || this.checkIsBombPot()) {
    //             off = 2;
    //         }
    //         if (gameplayData._smallBlind < 100 || gameplayData._smallBlind >= 10000) {
    //             maxRate = maxRate * 10;
    //             off = Math.floor(gameplayData._smallBlind / 10);
    //         }
    //         if (this.sliderCoin) this.setSliderRange(this.sliderCoin, 1, Math.floor(maxRate / this.rate / off), 1);
    //     } else {
    //         if (this.sliderCoin) this.setSliderRange(this.sliderCoin, 1, maxRate / (this.sliderSpace * bigBlind / 100), 1);
    //     }
    //     if (this.sliderCoin) {
    //         this.setSliderRange(this.sliderCoin, 1, 1, 1);
    //         this.onValueChangedSliderCoin(1);
    //     }
    // }
    /**
     * slider 设置
     */
    private setBringInForSlider(maxRate: number): void {
        if (!this.sliderCoin) return;
        let off = 1;
        if (this.checkIsSixPlus(GameCache.Instance.game_type, GameCache.Instance.poker_type) || this.checkIsBombPot()) {
            off = 2;
        }
        if (GameCache.Instance.game_type == GameType.MAHJONG) {
            let minVal = this.addChipsData._currentMinRate / this.sliderSpace;
            let maxVal = this.addChipsData._currentMaxRate / this.sliderSpace;
            this.setSliderRange(this.sliderCoin, minVal, maxVal, minVal);
            this.onValueChangedSliderCoin(minVal);
        } else if (GameCache.Instance.game_type == GameType.EGG) {
            let minVal = Math.floor(this.addChipsData._currentMinRate / this.sliderSpace);
            let maxVal = Math.floor(maxRate / this.sliderSpace);
            this.setSliderRange(this.sliderCoin, minVal, maxVal, minVal);
            this.onValueChangedSliderCoin(minVal);
        } else if (this.checkIsTexas()) {
            let minVal = Math.floor(this.addChipsData._currentMinRate / this.rate / off);
            let maxVal = Math.floor(maxRate / this.rate / off);
            this.setSliderRange(this.sliderCoin, minVal, maxVal, minVal);
            this.onValueChangedSliderCoin(minVal);
        } else {
            let minVal = Math.floor(this.addChipsData._currentMinRate / this.sliderSpace / off);
            let maxVal = Math.floor(maxRate / this.sliderSpace / off);
            this.setSliderRange(this.sliderCoin, minVal, maxVal, minVal);
            this.onValueChangedSliderCoin(minVal);
        }
    }

    private setMahjongInfo(): void {
        if (this.textBlindLabel) this.textBlindLabel.string = i18nMgr.Get('Mahjong_LowScore');
        if (this.textBlind) this.textBlind.string = StringHelper.GetLongString(this.addChipsData._smallBlind);
    }

    // private getMushroomDeposit(): number {
    //     if (!GameCache.Instance._texasData._isMushroomEnable) return 0;
    //     if (GameCache.Instance._texasData._isMushroomEnable &&
    //         GameCache.Instance.game_type != GameType.FANTASY
    //         && GameCache.Instance.CurGame.mainPlayer.mushDeposit < TexasBusiness.Instance.GetMushroomDeposit()
    //     ) {
    //         return TexasBusiness.Instance.GetMushroomDeposit() -
    //             GameCache.Instance.CurGame.mainPlayer.mushDeposit;
    //     }
    //     return 0;
    // }
    // private getSquidDeposit(): number {
    //     if (!GameCache.Instance._texasData._isSquidEnable || GameCache.Instance.gold_type == 3) {
    //         return 0;
    //     }
    //     let game = GameCache.Instance.CurGame;
    //     return Math.max(0, game.squidDeposit || 0);
    // }
    /**
     * 初始化随机匹配押金UI
     */
    private getRandomMatchDeposit(): number {
        // TODO: MahjongGameManager.Instance._biz.IsMahjongGame() && MatchRoomType.MATCHING
        return 0;
    }

    private getFantasyDeposit(): number {
        if (GameCache.Instance.game_type != GameType.FANTASY) return 0;
        if (this.addChipsData._source != BringInChipsType.BRING_IN) return 0;
        let game = GameCache.Instance.CurGame as any;
        return Math.max(0, game?.fantasyDeposit || 0);
    }

    private getRecordFeeData(type: RoomOriginType): void {
        console.log('getRecordFeeData', this.addChipsData._creditNum);
        if (GameCache.Instance.gold_type != 1 && GameCache.Instance.gold_type != 2) {
            if (GameplayUtil.GetTableType() == TableType.CLUB_INNER) {
                if (this.textTotalCoin) this.textTotalCoin.string = StringHelper.GetLongStringLocale(this.addChipsData._creditNum);
            } else {
                // this.textTotalCoin.SetHandFormatNumber(GameCache.Instance._diamonds);
            }
        }
    }

    /**
     * 是否有押金
     */
    // private isHaveDeposit(): boolean {
    //     return this.getSquidDeposit() + this.getMushroomDeposit() + this.getRandomMatchDeposit() + this.getFantasyDeposit() != 0;
    // }
    /**
     * 设置俱乐部数据
     */
    private SetClubItemData(walletItem: IWallet, temp: cc.Node, addLine?: boolean): void {
        // 设置头像
        let headImage = cc.find('cnamegrp/spriteClubIcon', temp).getComponent(cc.Sprite);
        WebImageHelper.SetHeadImage(headImage, walletItem.club_logo);
        // 设置名称
        let nameLabel = cc.find('cnamegrp/labelClubName', temp).getComponent(cc.Label);
        if (nameLabel) nameLabel.string = walletItem.club_name;
        // 设置ID
        let idLabel = cc.find('labelClubId', temp).getComponent(cc.Label);
        if (idLabel) idLabel.string = walletItem.club_random_id.toString();
        // 设置余额标题
        let labelBalanceTitle = cc.find('overlay/balance/labelBalanceTitle', temp).getComponent(cc.Label);
        if (labelBalanceTitle) {
            labelBalanceTitle.string =
                GameplayUtil.GetTableType() == TableType.CLUB_INNER ? i18nMgr.Get('UIClubCreditLimit2') : i18nMgr.Get('UIClub_CreateRoom31');
        }
        // 设置金币类型图标和数量
        let goldTypeSprite = cc.find('overlay/balance/chipicon', temp).getComponent(cc.Sprite);
        // if (goldTypeSprite) {
        //     goldTypeSprite.spriteFrame = walletItem.gold_type == 1 ? this.unionCoinSpr : this.usdtSpr;
        // }
        let numLabel = cc.find('overlay/balance/labelBalance', temp).getComponent(cc.Label);
        if (numLabel) numLabel.string = StringHelper.GetLongStringLocale(walletItem.gold);
        let line = cc.find('overlay2', temp);
        if (addLine) {
            line.active = true;
        } else {
            line.active = false;
        }
    }

    /**
     * 刷新金币
     */
    private updateTotalCoin(isEnable: boolean, name: string, gold: number, credit: number = 0): void {
        if (this.textWallet) this.textWallet.string = name;
        console.log('updateTotalCoin', name, gold, credit);
        if (GameplayUtil.GetTableType() == TableType.CLUB_INNER) {
            if (this.textTotalCoin) this.textTotalCoin.string = StringHelper.GetLongStringLocale(credit);
        } else {
            if (this.textTotalCoin) this.textTotalCoin.string = StringHelper.GetLongStringLocale(gold);
        }
        if (this.buttonSelectWallet) {
            let button = this.buttonSelectWallet.getComponent(cc.Button);
            if (button) button.interactable = isEnable;
        }
        if (this.mySelectWallet != null) {
            this.emptySelectWallet.active = false;
            this.clueItemPrefab.active = true;
            this.SetClubItemData(this.mySelectWallet, this.clueItemPrefab);
        } else {
            this.clueItemPrefab.active = false;
            this.emptySelectWallet.active = true;
        }
    }

    private updateGoldSprite(): void {
        this.textTotalCoinTitle.string =
            GameplayUtil.GetTableType() == TableType.CLUB_INNER ? i18nMgr.Get('UIClubCreditLimit2') : i18nMgr.Get('UIClub_CreateRoom31');
        if (this.depositImg) this.depositImg.node.active = false;
        switch (GameCache.Instance.gold_type) {
            case 1: // 联盟币
                if (this.goldImage && this.unionCoinSpr) this.goldImage.spriteFrame = this.unionCoinSpr;
                if (this.depositImg && this.unionCoinSpr) {
                    this.depositImg.spriteFrame = this.unionCoinSpr;
                    this.depositImg.node.active = true;
                }
                break;
            case 2: // USDT
                if (this.goldImage && this.usdtSpr) this.goldImage.spriteFrame = this.usdtSpr;
                if (this.depositImg && this.usdtSpr) {
                    this.depositImg.spriteFrame = this.usdtSpr;
                    this.depositImg.node.active = true;
                }
                break;
            default:
                if (GameplayUtil.GetTableType() == TableType.CLUB_INNER) {
                    if (this.goldImage && this.creditSpr) this.goldImage.spriteFrame = this.creditSpr;
                } else {
                    if (this.goldImage && this.diamondSpr) this.goldImage.spriteFrame = this.diamondSpr;
                }
                break;
        }
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
    // public CheckUserOrderAudit(msgData: any): void {
    //     this.diamondObj?.CheckUserOrderAudit(msgData);
    // }
}
