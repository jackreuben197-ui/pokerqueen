import GC from '../../frame/GameControl';
import { StringHelper } from '../../helper/StringHelper';
import { CPErrorCode } from '../../i18n/CPErrorCode';
import { i18nMgr } from '../../i18n/i18nMgr';
import ProtocolAgency from '../../net/websocket/ProtocolAgency';
import { ProtocolCode } from '../../net/websocket/ProtocolCode';
import { Def, OutsCard, PotInsuranceBuy } from '../../protobuf/holdem/define_pb';
import { ServerMessageAddTime } from '../../protobuf/holdem/req_th_add_time_pb';
import { ClientMessageBuyInsuranceActive } from '../../protobuf/holdem/req_th_buy_insurance_active_pb';
import UIBasePlus from '../../ui/UIBasePlus';
import UIComponent, { PrefabUI } from '../../ui/UIComponent';
import DiamondModel from '../../diamond/DiamondModel';
import { GameCache } from '../GameCache';
import GameUtil, { RoomType } from '../util/GameUtil';
const { ccclass } = cc._decorator;

/**
 * 保险弹窗入口数据。
 * 对应 Unity 的 UITexasInsuranceNewComponent.InsuranceData。
 */
export class InsuranceData {
    public publicCards: number[] = [];
    public triggedDatas: WrapTriggerInsuranceData[] = [];
    public timeLeft: number = 0;
    public delayTimes: number = 0;
    public round: number = Def.Round.UNDEFINED;
    /** 观众调试时，借用第一个参与保险的玩家来展示“自己”这一行。 */
    public debugObserverUseFirstPlayerAsMine: boolean = false;
}

/**
 * 单个保险池的数据。
 * 一手牌里可能会有多个池子，所以弹窗内部要支持切池。
 */
export class WrapTriggerInsuranceData {
    public outsCards: OutsCard.AsObject[][] = [];
    public subPot: number = 0;
    public leastAmount: number = 0;
    public mostAmount: number = 0;
    public potAllowOutSelection: number = 0;
    public potTotalCost: number = 0;
    public pot: number = 0;
    public userNames: string[] = [];
    public userIds: number[] = [];
    public outsPerUser: number[] = [];
    public playerCards: number[][] = [];
    public potUserCount: number = 0;
    public potLeaderCount: number = 0;
    public insuranced: number = 0;
    /** 服务端下发的基础赔率，GameUtil 算不出来时用它兜底。 */
    public odds: number = 0;
}

enum TexasInsurancePoolType {
    NONE = 0,
    MIN_MONEY = 1,
    ALL = 2,
    HALF = 3,
    THIRD = 4,
    FIFTH = 5,
    EIGHTH = 6
}

/** 反超 outs / 平分 outs 分组后的缓存。 */
class UserOutsCardsData {
    public overOuts: number[] = [];
    public equalOuts: number[] = [];
}

/** 保险界面里单个玩家展示所需的数据。 */
class WrapPlayerData {
    public name: string = '';
    public userId: number = 0;
    public outsPerUser: number = 0;
    public playerCards: number[] = [];
}

/**
 * 玩家卡片渲染器。
 * 自己和其他玩家都走这一套命名，只是父节点不同。
 */
class PlayerItem {
    private readonly pokerRoot: cc.Node;
    private readonly pokerNodes: cc.Node[];
    private readonly textNickname: cc.Label;
    private readonly textOuts: cc.Label;
    private readonly pokerPos = {
        2: [-36.5, 36.5],
        4: [-66, -22, 22, 66],
        5: [-66, -33, 0, 33, 66],
        6: [-66, -40, -13, 13, 40, 66]
    };

    public constructor(public readonly node: cc.Node) {
        this.pokerRoot = node.getChildByName('pokers') || node;
        this.pokerNodes = [];
        for (let index = 0; index < 6; index++) {
            const pokerNode = this.pokerRoot.getChildByName(`Image_Card${index}`);
            if (pokerNode) {
                this.pokerNodes.push(pokerNode);
            }
        }
        this.textNickname = node.getChildByName('Text_Nickname')?.getComponent(cc.Label) || null;
        this.textOuts = node.getChildByName('Text_Outs')?.getComponent(cc.Label) || null;
    }

    public updateItem(cardIds: number[], nickName: string, outs: number): void {
        const handCardCount = Math.min(GameCache.Instance.CurGame.HandCards, this.pokerNodes.length, cardIds.length);
        const posX = this.pokerPos[GameCache.Instance.CurGame.HandCards] || this.pokerPos[2];
        for (let index = 0; index < this.pokerNodes.length; index++) {
            const poker = this.pokerNodes[index];
            if (index < handCardCount) {
                poker.x = posX[index] ?? poker.x;
                poker.active = true;
                const sprite = poker.getComponent(cc.Sprite);
                if (sprite) {
                    sprite.spriteFrame = GameCache.Instance.CurGame.GetBigPokerSP(GameUtil.GetCardNameByNum(cardIds[index]));
                }
            } else {
                poker.active = false;
            }
        }
        if (this.textNickname) {
            this.textNickname.string = nickName;
        }
        if (this.textOuts) {
            this.textOuts.string = outs >= 0 ? `${outs}${i18nMgr.Get('UIInsurance_ge')}outs` : i18nMgr.Get('UIInsurance_InsureIn');
        }
    }
}

/**
 * 单张 outs 牌的数据封装。
 * 新版逻辑里 outs 默认全选，所以这里只负责展示，不做勾选状态切换。
 */
class InsuranceCardItem {
    public readonly imageInsuranceCard: cc.Sprite;
    public readonly imageOnSelect: cc.Node;
    public cardId: number = -1;
    public isOver: boolean = true;

    public constructor(public readonly node: cc.Node) {
        this.imageInsuranceCard =
            node.getComponent(cc.Sprite) ||
            node.getChildByName('Image_InsuranceCard')?.getComponent(cc.Sprite) ||
            node.getChildByName('icon')?.getComponent(cc.Sprite) ||
            null;
        this.imageOnSelect = node.getChildByName('Image_OnSelect') || node.getChildByName('check') || null;
    }

    public get isSelect(): boolean {
        return true;
    }

    public get cardReadId(): number {
        return this.cardId % 15;
    }

    public updateItem(cardId: number): void {
        this.cardId = cardId;
        if (this.imageInsuranceCard) {
            this.imageInsuranceCard.spriteFrame = GameCache.Instance.CurGame.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId));
        }
        if (this.imageOnSelect) {
            this.imageOnSelect.active = false;
        }
    }
}

@ccclass
export default class UIInsuranceNewPanel extends UIBasePlus {
    // UI 节点引用。这里全部显式查找，避免依赖旧版 `$` 自动绑定规则。
    private backClick: cc.Node = null;
    private dialogNode: cc.Node = null;
    private scrollViewRoot: cc.Node = null;
    private scrollView: cc.ScrollView = null;
    private scrollViewport: cc.Node = null;
    private insuranceCardsRoot: cc.Node = null;
    private publicCardNodes: cc.Sprite[] = [];
    private playerMineNode: cc.Node = null;
    private playersContent: cc.Node = null;
    private playersNext: cc.Node = null;
    private playerTemplate: cc.Node = null;
    private multiPoolToggles: cc.Node = null;
    private multiPoolToggleTemplate: cc.Node = null;
    private insuranceCardsOver: cc.Node = null;
    private insuranceCardsSplit: cc.Node = null;
    private insuranceCardsOverContent: cc.Node = null;
    private insuranceCardsSplitContent: cc.Node = null;
    private insuranceCardOverTemplate: cc.Node = null;
    private insuranceCardSplitTemplate: cc.Node = null;
    private textPot: cc.Label = null;
    private textMainPut: cc.Label = null;
    private textInsuranceValue: cc.Label = null;
    private textPayValue: cc.Label = null;
    private textOuts: cc.Label = null;
    private textOdds: cc.Label = null;
    private textTips: cc.Label = null;
    private textOddsOver: cc.Label = null;
    private textOddsSplit: cc.Label = null;
    private textTurnTips: cc.Label = null;
    private classicTurnText: cc.Label = null;
    private textCancel: cc.Label = null;
    private textDelayBean: cc.Label = null;
    private countDownImage: cc.Sprite = null;
    private numToggle: cc.Toggle = null;
    private graToggle: cc.Toggle = null;
    private buttonBuy: cc.Node = null;
    private buttonDelay: cc.Node = null;
    private buttonCancel: cc.Node = null;
    private buttonMin: cc.Node = null;
    private buttonAll: cc.Node = null;
    private buttonHalf: cc.Node = null;
    private buttonThird: cc.Node = null;
    private buttonFifth: cc.Node = null;
    private buttonEighth: cc.Node = null;
    private imageMinChecked: cc.Node = null;
    private imageAllChecked: cc.Node = null;
    private imageHalfChecked: cc.Node = null;
    private imageThirdChecked: cc.Node = null;
    private imageFifthChecked: cc.Node = null;
    private imageEighthChecked: cc.Node = null;
    private textMinMoney: cc.Label = null;
    private textAllMoney: cc.Label = null;
    private textHalfMoney: cc.Label = null;
    private textThirdMoney: cc.Label = null;
    private textFifthMoney: cc.Label = null;
    private textEighthMoney: cc.Label = null;
    private readonly userOutsCardsData = new UserOutsCardsData();
    private readonly outsOverObjsList: InsuranceCardItem[] = [];
    private readonly outsSplitObjsList: InsuranceCardItem[] = [];
    private readonly listInsuranceCardItems: InsuranceCardItem[] = [];
    private readonly playerClones: cc.Node[] = [];
    private readonly outsObjList: cc.Node[] = [];
    private readonly multiPoolToggleList: cc.Node[] = [];
    private readonly buttonsList: cc.Node[] = [];
    private readonly cachedPotInsuranceBuyList: PotInsuranceBuy.AsObject[] = [];
    private readonly maxScrollViewHeight: number = 620;
    private data: InsuranceData = null;
    private currentTriggerData: WrapTriggerInsuranceData = null;
    private chooseBtn: cc.Node = null;
    private chooseToggleObj: cc.Node = null;
    private currentSelectPoolType: TexasInsurancePoolType = TexasInsurancePoolType.THIRD;
    private currentHighlight: cc.Node = null;
    private countDownTime: number = 0;
    private maxCountDownTime: number = 0;
    private addTimeCount: number = 0;
    private onclickDelayButtonTimes: number = 0;
    private delayButtonInteractable: boolean = true;
    private isCountdown: boolean = false;
    private countDownEndTimestamp: number = 0;
    private delayTimes: number = 30;
    private selectOuts: number = 0;
    private overOutsPayValue: number = 0;

    /** 初始化阶段：绑定节点、隐藏模板、注册协议监听。 */
    protected lateLoad(): void {
        super.lateLoad();
        this.bindNodes();
        this.initStaticNodes();
        this.registerSocket();
    }

    /** 事件绑定全部收口在这里，后续查交互只需要看这一处。 */
    protected regiterTouchEvents(): void {
        this.setButtonClick(this.backClick, this.clickBack);
        this.setButtonClick(this.buttonBuy, this.onClickBuy);
        this.setButtonClick(this.buttonDelay, this.onClickDelay);
        this.setButtonClick(this.buttonCancel, this.onClickCancel);
        if (this.buttonDelay && !this.buttonDelay.getComponent(cc.Button)) {
            this.buttonDelay.on(cc.Node.EventType.TOUCH_END, this.onClickDelay, this);
        }
        this.setButtonClick(this.buttonMin, () => this.onClickPoolButtons(this.buttonMin));
        this.setButtonClick(this.buttonAll, () => this.onClickPoolButtons(this.buttonAll));
        this.setButtonClick(this.buttonHalf, () => this.onClickPoolButtons(this.buttonHalf));
        this.setButtonClick(this.buttonThird, () => this.onClickPoolButtons(this.buttonThird));
        this.setButtonClick(this.buttonFifth, () => this.onClickPoolButtons(this.buttonFifth));
        this.setButtonClick(this.buttonEighth, () => this.onClickPoolButtons(this.buttonEighth));
        if (this.numToggle) {
            this.numToggle.node.on(
                'toggle',
                () => {
                    if (this.numToggle.isChecked) {
                        this.orderList(this.outsOverObjsList, 0);
                        this.orderList(this.outsSplitObjsList, 0);
                    }
                },
                this
            );
        }
        if (this.graToggle) {
            this.graToggle.node.on(
                'toggle',
                () => {
                    if (this.graToggle.isChecked) {
                        this.orderList(this.outsOverObjsList, 1);
                        this.orderList(this.outsSplitObjsList, 1);
                    }
                },
                this
            );
        }
    }

    public onShow(data: InsuranceData): void {
        if (!data) {
            return;
        }
        this.data = data;
        this.cachedPotInsuranceBuyList.length = 0;
        this.onclickDelayButtonTimes = 0;
        this.chooseToggleObj = null;
        this.currentHighlight = null;
        this.currentSelectPoolType = TexasInsurancePoolType.THIRD;
        GameCache.Instance._texasData._buyInsurancePotUserCount.clear();
        this.updatePublicCards();
        this.showMultiPoolToggle();
        this.showCountDown();
        this.loadDiamondConfig();
    }

    /** 倒计时每帧平滑刷新，到 0 后按 Unity 行为直接提交当前缓存。 */
    protected update(dt: number): void {
        if (!this.isCountdown) {
            return;
        }
        const now = Date.now() / 1000;
        this.countDownTime = Math.max(0, this.countDownEndTimestamp - now);
        this.refreshCountDownProgress();
        if (this.countDownTime <= 0) {
            this.isCountdown = false;
            this.commitPotInsuranceBuy(true);
            return;
        }
    }

    lateClose(param?: any): void {
        super.lateClose(param);
        this.clearData();
    }

    /** 基类是 public，这里也必须保持 public，避免 TS 访问级别冲突。 */
    public onDestroy(): void {
        this.removeSocket();
        super.onDestroy();
    }

    /** 把 prefab 上已经摆好的节点全部缓存起来，后续逻辑只用字段不再四处 find。 */
    private bindNodes(): void {
        this.backClick = this.node.getChildByName('$back_click') || this.node.getChildByName('back_click');
        const dialog = this.node.getChildByName('Image_Dialog');
        this.dialogNode = dialog;
        this.scrollViewRoot = cc.find('Image_Dialog/ScrollViewRoot', this.node);
        this.scrollView = this.scrollViewRoot?.getComponent(cc.ScrollView) || null;
        this.scrollViewport = cc.find('Viewport', this.scrollViewRoot);
        this.insuranceCardsRoot = cc.find('Viewport/InsuranceCards', this.scrollViewRoot);
        this.textPot = cc.find('Header/Text_Pot_title/Text_Pot', dialog)?.getComponent(cc.Label) || null;
        this.multiPoolToggles = cc.find('Header/MultiPoolToggles', dialog);
        this.multiPoolToggleTemplate = this.multiPoolToggles?.getChildByName('MultiPoolToggle') || null;
        this.playerMineNode = cc.find('Header/Player_Mine', dialog);
        this.playersContent = cc.find('Header/Players/view/Players_Content', dialog);
        this.playersNext = cc.find('ScrollViewRoot/Viewport/InsuranceCards/Players_Next', dialog);
        this.playerTemplate = this.playersContent?.children.find(child => child.name === 'Player') || null;
        const publicCards = cc.find('Header/PublicCardContent/PublicCards', dialog);
        for (let index = 0; index < 5; index++) {
            const sprite = publicCards?.getChildByName(`Image_PublicCard${index}`)?.getComponent(cc.Sprite) || null;
            this.publicCardNodes.push(sprite);
        }
        this.insuranceCardsOver = cc.find('ScrollViewRoot/Viewport/InsuranceCards/InsuranceCardsOver', dialog);
        this.insuranceCardsSplit = cc.find('ScrollViewRoot/Viewport/InsuranceCards/InsuranceCardsSplit', dialog);
        // 以当前 prefab 结构为准：
        // InsuranceCardsOver       -> 垂直分组容器
        //   Label                  -> 标题 / 赔率
        //   insuranceCardOver      -> grid 牌容器
        //     Image_InsuranceCard  -> 单张牌模板
        this.insuranceCardsOverContent = this.insuranceCardsOver?.getChildByName('insuranceCardOver') || null;
        this.insuranceCardsSplitContent = this.insuranceCardsSplit?.getChildByName('insuranceCardSplit') || null;
        this.insuranceCardOverTemplate = this.insuranceCardsOverContent?.getChildByName('Image_InsuranceCard') || null;
        this.insuranceCardSplitTemplate = this.insuranceCardsSplitContent?.getChildByName('Image_InsuranceCard') || null;
        this.textOddsOver = cc.find('Label/Text_Odds_Over', this.insuranceCardsOver)?.getComponent(cc.Label) || null;
        this.textOddsSplit = cc.find('Label/Text_Odds_Split', this.insuranceCardsSplit)?.getComponent(cc.Label) || null;
        this.textMainPut = cc.find('ContentPar/Text_MainPut', dialog)?.getComponent(cc.Label) || null;
        this.textInsuranceValue = cc.find('ContentPar/Text_InsuranceValue', dialog)?.getComponent(cc.Label) || null;
        this.textPayValue = cc.find('ContentPar/Text_PayValue', dialog)?.getComponent(cc.Label) || null;
        this.textOuts = cc.find('ContentPar/Text_Outs', dialog)?.getComponent(cc.Label) || null;
        this.textOdds = cc.find('ContentPar/Text_Odds', dialog)?.getComponent(cc.Label) || null;
        this.textTips = cc.find('ContentPar/Text_tips', dialog)?.getComponent(cc.Label) || null;
        this.textTurnTips = cc.find('Text_turn_tips', dialog)?.getComponent(cc.Label) || null;
        this.buttonMin = cc.find('ContentPar/OptionButtons/Button_Min', dialog);
        this.buttonAll = cc.find('ContentPar/OptionButtons/Button_All', dialog);
        this.buttonHalf = cc.find('ContentPar/OptionButtons/Button_Half', dialog);
        this.buttonThird = cc.find('ContentPar/OptionButtons/Button_Third', dialog);
        this.buttonFifth = cc.find('ContentPar/OptionButtons/Button_Fifth', dialog);
        this.buttonEighth = cc.find('ContentPar/OptionButtons/Button_Eighth', dialog);
        this.buttonsList.push(this.buttonEighth, this.buttonFifth, this.buttonThird, this.buttonHalf, this.buttonAll);
        this.imageMinChecked = cc.find('Image_Min_checked', this.buttonMin);
        this.imageAllChecked = cc.find('Image_All_checked', this.buttonAll);
        this.imageHalfChecked = cc.find('Image_Half_checked', this.buttonHalf);
        this.imageThirdChecked = cc.find('Image_Third_checked', this.buttonThird);
        this.imageFifthChecked = cc.find('Image_Fifth_checked', this.buttonFifth);
        this.imageEighthChecked = cc.find('Image_Eighth_checked', this.buttonEighth);
        this.textMinMoney = cc.find('Text_Min_money', this.buttonMin)?.getComponent(cc.Label) || null;
        this.textAllMoney = cc.find('Text_All_money', this.buttonAll)?.getComponent(cc.Label) || null;
        this.textHalfMoney = cc.find('Text_Half_money', this.buttonHalf)?.getComponent(cc.Label) || null;
        this.textThirdMoney = cc.find('Text_Third_money', this.buttonThird)?.getComponent(cc.Label) || null;
        this.textFifthMoney = cc.find('Text_Fifth_money', this.buttonFifth)?.getComponent(cc.Label) || null;
        this.textEighthMoney = cc.find('Text_Eighth_money', this.buttonEighth)?.getComponent(cc.Label) || null;
        this.buttonDelay = cc.find('SubstratumBut/Button_Delay', dialog);
        this.buttonCancel = cc.find('SubstratumBut/Button_Cancel', dialog);
        this.buttonBuy = cc.find('SubstratumBut/Button_Buy', dialog);
        this.textDelayBean = cc.find('Text_delay_bean', this.buttonDelay)?.getComponent(cc.Label) || null;
        this.countDownImage = cc.find('CountDownImage', this.buttonDelay)?.getComponent(cc.Sprite) || null;
        this.textCancel = cc.find('Text', this.buttonCancel)?.getComponent(cc.Label) || null;
        this.classicTurnText = cc.find('classicTurnText', this.buttonCancel)?.getComponent(cc.Label) || null;
        this.numToggle = cc.find('ScrollViewRoot/Viewport/InsuranceCards/SortToggle/NumToggle', dialog)?.getComponent(cc.Toggle) || null;
        this.graToggle = cc.find('ScrollViewRoot/Viewport/InsuranceCards/SortToggle/GraToggle', dialog)?.getComponent(cc.Toggle) || null;
        this.applyScrollLayoutMode();
    }

    /** 模板节点只保留一份隐藏态，运行时统一 clone。 */
    private initStaticNodes(): void {
        if (this.multiPoolToggleTemplate) {
            this.multiPoolToggleTemplate.active = false;
        }
        if (this.playerTemplate) {
            const playerTemplates = this.playersContent.children.filter(child => child.name === 'Player');
            playerTemplates.forEach(node => (node.active = false));
            this.playerTemplate = playerTemplates[0] || this.playerTemplate;
        }
        if (this.playersNext) {
            this.playersNext.active = false;
        }
        if (this.playerMineNode) {
            this.playerMineNode.active = false;
        }
        if (this.insuranceCardOverTemplate) {
            this.insuranceCardOverTemplate.active = false;
        }
        if (this.insuranceCardSplitTemplate) {
            this.insuranceCardSplitTemplate.active = false;
        }
        this.hideAllHighlights();
        this.resetScrollAreaHeight();
    }

    /** 保险界面只额外关心“加时返回”这一条协议。 */
    private registerSocket(): void {
        GC.notify.register(ProtocolCode.Protocol_Holdem_AddTime, this.handleAddTime, this);
    }

    private removeSocket(): void {
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AddTime, this.handleAddTime, this);
    }

    /** 加时成功后刷新剩余时间与按钮价格。 */
    private handleAddTime(rec: ServerMessageAddTime.AsObject): void {
        if (!rec) {
            return;
        }
        if (rec.status !== 0) {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));
            return;
        }
        this.addTimeCount = rec.times;
        const now = Date.now() / 1000;
        const remainTime = Math.max(0, this.countDownEndTimestamp - now);
        this.countDownTime = remainTime + rec.duration;
        this.countDownEndTimestamp = now + this.countDownTime;
        this.maxCountDownTime = Math.max(this.maxCountDownTime, this.countDownTime);
        this.isCountdown = true;
        this.refreshCountDownProgress();
        this.updateDelayButton();
    }

    /** 提前拉一次钻石配置，后面更新加时按钮时直接读缓存。 */
    private async loadDiamondConfig(): Promise<void> {
        try {
            await DiamondModel.Instance.ReqDiamondConfig(2);
        } catch (error) {
            cc.warn('[UIInsuranceNewPanel] loadDiamondConfig failed', error);
        }
        this.updateDelayButton();
    }

    /**
     * 刷新加时按钮文案。
     * 这里刻意跳过了 Unity 的折扣 tips 浮层，因为你当前 prefab 没做那套 UI。
     */
    private updateDelayButton(): void {
        if (!this.buttonDelay || !this.textDelayBean) {
            return;
        }
        if (this.onclickDelayButtonTimes > 1 || this.addTimeCount >= 2) {
            this.delayButtonInteractable = false;
            this.setButtonInteractable(this.buttonDelay, false);
            this.textDelayBean.string = '0';
            this.buttonDelay.opacity = 178;
            return;
        }
        this.delayButtonInteractable = true;
        this.setButtonInteractable(this.buttonDelay, true);
        this.buttonDelay.opacity = 255;
        const diamondConfig = DiamondModel.Instance.GetDiamondConfig(this.getTypeText(this.onclickDelayButtonTimes + 1), 2);
        if (!diamondConfig?.setting?.length) {
            this.textDelayBean.string = `${2 * Math.pow(2, this.addTimeCount)}`;
            return;
        }
        if (GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit) {
            const smallBlind = GameCache.Instance.CurGame.smallBlind;
            const setting = diamondConfig.setting.find(item => item.sb * 100 === smallBlind * 100);
            if (setting) {
                this.textDelayBean.string = `${setting.discount_price > 0 ? setting.discount_price : setting.price}`;
                return;
            }
        } else {
            const setting = diamondConfig.setting[0];
            this.textDelayBean.string = `${setting.discount_price > 0 ? setting.discount_price : setting.price}`;
            return;
        }
        this.textDelayBean.string = `${2 * Math.pow(2, this.addTimeCount)}`;
        if (this.onclickDelayButtonTimes === 1) {
            this.delayTimes = 20;
        } else if (this.onclickDelayButtonTimes === 0) {
            this.delayTimes = 30;
        }
    }

    private getTypeText(times: number): number {
        let numStr = `${times}`;
        if (GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit) {
            numStr += `${GameCache.Instance._originType}`;
        } else {
            return +(times + '001');
        }
        numStr += GameCache.Instance._shareTableType === 1 ? '1' : '2';
        numStr += GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit ? '0' : '1';
        return +numStr || 0;
    }

    /**
     * 多池切换条。
     * 只有保险池数量 > 1 时才显示，否则直接刷新单池数据。
     */
    private showMultiPoolToggle(): void {
        this.destroyNodes(this.multiPoolToggleList);
        if (!this.data?.triggedDatas?.length) {
            return;
        }
        const hasMulti = this.data.triggedDatas.length > 1;
        if (this.multiPoolToggles) {
            this.multiPoolToggles.active = hasMulti;
        }
        if (!hasMulti || !this.multiPoolToggleTemplate || !this.multiPoolToggles) {
            this.refreshInsuranceData(this.data.triggedDatas[0]);
            return;
        }
        this.data.triggedDatas.forEach((triggerData, index) => {
            const toggleNode = cc.instantiate(this.multiPoolToggleTemplate);
            toggleNode.name = `Toggle${index}`;
            toggleNode.parent = this.multiPoolToggles;
            toggleNode.active = true;
            const label = toggleNode.getChildByName('Label')?.getComponent(cc.Label);
            if (label) {
                label.string = `${i18nMgr.Get('UIInsurance_zhuchi2')} ${index + 1}`;
            }
            const toggle = toggleNode.getComponent(cc.Toggle);
            if (toggle) {
                toggle.isChecked = index === 0;
                toggle.node.on(
                    'toggle',
                    () => {
                        if (toggle.isChecked) {
                            this.clearMultiPoolToggleVisual();
                            this.setMultiPoolToggleVisual(toggleNode, true);
                            this.chooseToggleObj = toggleNode;
                            this.clearMultiInsurancePoolData();
                            this.refreshInsuranceData(triggerData);
                        }
                    },
                    this
                );
            } else {
                this.setButtonClick(toggleNode, () => {
                    this.chooseToggleObj = toggleNode;
                    this.clearMultiInsurancePoolData();
                    this.refreshInsuranceData(triggerData);
                    this.clearMultiPoolToggleVisual();
                    this.setMultiPoolToggleVisual(toggleNode, true);
                });
            }
            this.multiPoolToggleList.push(toggleNode);
        });
        this.clearMultiPoolToggleVisual();
        const first = this.multiPoolToggleList[0];
        const firstToggle = first?.getComponent(cc.Toggle);
        if (firstToggle) {
            firstToggle.isChecked = true;
            this.setMultiPoolToggleVisual(first, true);
            this.chooseToggleObj = first;
            this.refreshInsuranceData(this.data.triggedDatas[0]);
        } else if (first) {
            this.chooseToggleObj = first;
            this.setMultiPoolToggleVisual(first, true);
            this.refreshInsuranceData(this.data.triggedDatas[0]);
        }
    }

    /** 多池切换当前只保留背景勾选态，不再改文字颜色。 */
    private setMultiPoolToggleVisual(node: cc.Node, isOn: boolean): void {
        if (!node) {
            return;
        }
        const toggle = node.getComponent(cc.Toggle);
        if (toggle) {
            toggle.isChecked = isOn;
        }
        const checkmark = node.getChildByName('checkmark') || node.getChildByName('Checkmark');
        if (checkmark) {
            checkmark.active = isOn;
        }
        const background = node.getChildByName('Background');
        if (background) {
            background.opacity = isOn ? 255 : 180;
        }
    }

    private clearMultiPoolToggleVisual(): void {
        this.multiPoolToggleList.forEach(node => this.setMultiPoolToggleVisual(node, false));
    }

    /**
     * 切换到某个保险池后，重新刷整块内容。
     * 这是整个弹窗最核心的刷新入口。
     */
    private refreshInsuranceData(triggerInsuranceData: WrapTriggerInsuranceData): void {
        if (!triggerInsuranceData) {
            return;
        }
        this.currentTriggerData = triggerInsuranceData;
        this.userOutsCardsData.overOuts.length = 0;
        this.userOutsCardsData.equalOuts.length = 0;
        triggerInsuranceData.outsCards.forEach(userOuts => {
            userOuts.forEach(outsCard => {
                if (outsCard.isEqual) {
                    if (!this.userOutsCardsData.equalOuts.includes(outsCard.card)) {
                        this.userOutsCardsData.equalOuts.push(outsCard.card);
                    }
                } else if (!this.userOutsCardsData.overOuts.includes(outsCard.card)) {
                    this.userOutsCardsData.overOuts.push(outsCard.card);
                }
            });
        });
        this.updatePlayers();
        this.insuranceCards();
        if (this.textOdds) {
            this.textOdds.string = this.formatOdds(this.selectedOverOdd());
        }
        if (this.textPot) {
            this.textPot.string = StringHelper.GetLongString(triggerInsuranceData.pot);
        }
        if (this.textMainPut) {
            this.textMainPut.string = StringHelper.GetLongString(triggerInsuranceData.potTotalCost + triggerInsuranceData.insuranced);
        }
        this.currentSelectPoolType = TexasInsurancePoolType.THIRD;
        this.chooseBtn = this.buttonThird;
        this.updateClassicTurn();
        this.updateMoneyText();
        this.setLeastType();
        this.refreshCancelButtonShow();
        this.refreshScrollAreaHeight();
        // clone / active 切换后的布局有时要等一帧才能拿到最终高度，再补一次确保滚动区稳定。
        this.scheduleOnce(() => this.refreshScrollAreaHeight(), 0);
    }

    private showCountDown(): void {
        const now = Date.now() / 1000;
        this.isCountdown = true;
        this.addTimeCount = this.data.delayTimes;
        this.countDownTime = Math.max(0, this.data.timeLeft);
        this.maxCountDownTime = Math.max(1, this.countDownTime);
        this.countDownEndTimestamp = now + this.countDownTime;
        this.delayTimes = 30;
        const buyText = this.buttonBuy ? cc.find('Text', this.buttonBuy)?.getComponent(cc.Label) : null;
        if (buyText) {
            buyText.string = CPErrorCode.LanguageDescription(10326);
        }
        this.refreshCountDownProgress();
    }

    private refreshCountDownProgress(): void {
        if (!this.countDownImage) {
            return;
        }
        const progress = this.maxCountDownTime <= 0 ? 0 : this.countDownTime / this.maxCountDownTime;
        this.countDownImage.fillRange = Math.max(0, Math.min(1, progress));
    }

    /** 顶部公共牌展示。 */
    private updatePublicCards(): void {
        if (!this.data?.publicCards?.length) {
            return;
        }
        for (let index = 0; index < this.publicCardNodes.length; index++) {
            const sprite = this.publicCardNodes[index];
            if (!sprite) {
                continue;
            }
            const cardId = this.data.publicCards[index];
            sprite.spriteFrame = GameCache.Instance.CurGame.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId ?? -1));
        }
    }

    /**
     * 刷新玩家信息。
     * 第 1 个永远是自己，后面的玩家按“第一排 / 第二排”分开放。
     */
    private updatePlayers(): void {
        this.destroyNodes(this.playerClones);
        if (this.playersNext) {
            this.playersNext.active = false;
        }
        if (!this.currentTriggerData) {
            return;
        }
        const list: WrapPlayerData[] = [];
        for (let index = 0; index < this.currentTriggerData.userNames.length; index++) {
            const data = new WrapPlayerData();
            data.name = this.currentTriggerData.userNames[index];
            data.userId = this.currentTriggerData.userIds[index] || 0;
            data.outsPerUser = this.currentTriggerData.outsPerUser[index];
            data.playerCards = (this.currentTriggerData.playerCards[index] || []).slice(0, GameCache.Instance.CurGame.HandCards);
            list.push(data);
        }
        const useObserverDebugMine = !!this.data?.debugObserverUseFirstPlayerAsMine && GameCache.Instance.CurGame.IsLookOn && list.length > 0;
        const mine = new WrapPlayerData();
        if (useObserverDebugMine) {
            // 观众本身没有可投保的“自己”，调试时直接借用第一个参与者避免首行空牌。
            mine.name = list[0].name;
            mine.userId = list[0].userId;
            mine.outsPerUser = -1;
            mine.playerCards = [...list[0].playerCards];
            list.shift();
        } else {
            mine.name = GameCache.Instance.CurGame.mainPlayer.nick;
            mine.userId = GameCache.Instance.CurGame.mainPlayer.userID;
            mine.outsPerUser = -1;
            mine.playerCards = (GameCache.Instance.CurGame.mainPlayer.cards || []).slice(0, GameCache.Instance.CurGame.HandCards);
        }
        list.unshift(mine);
        if (this.playerMineNode) {
            this.playerMineNode.active = true;
            new PlayerItem(this.playerMineNode).updateItem(mine.playerCards, mine.name, mine.outsPerUser);
        }
        for (let index = 1; index < list.length; index++) {
            if (!this.playerTemplate) {
                break;
            }
            const parent = index < 3 ? this.playersContent : this.playersNext;
            if (!parent) {
                break;
            }
            if (parent === this.playersNext) {
                this.playersNext.active = true;
            }
            const clone = cc.instantiate(this.playerTemplate);
            clone.parent = parent;
            clone.active = true;
            this.playerClones.push(clone);
            new PlayerItem(clone).updateItem(list[index].playerCards, list[index].name, list[index].outsPerUser);
        }
    }

    /**
     * 刷新 outs 区。
     * 新版保险会把 outs 拆成“反超”和“平分”两个容器。
     */
    private insuranceCards(): void {
        this.clearOutCards();
        if (!this.insuranceCardOverTemplate || !this.insuranceCardSplitTemplate) {
            return;
        }
        this.insuranceCardsOver && (this.insuranceCardsOver.active = this.userOutsCardsData.overOuts.length > 0);
        if (this.textOddsOver) {
            this.textOddsOver.string = this.formatOdds(this.selectedOverOdd());
        }
        this.userOutsCardsData.overOuts.forEach((cardId, index) => {
            const clone = cc.instantiate(this.insuranceCardOverTemplate);
            clone.name = `over_${index}`;
            clone.parent = this.insuranceCardsOverContent || this.insuranceCardsOver;
            clone.active = true;
            const item = new InsuranceCardItem(clone);
            item.isOver = true;
            item.updateItem(cardId);
            this.outsOverObjsList.push(item);
            this.listInsuranceCardItems.push(item);
            this.outsObjList.push(clone);
        });
        const hasEqualOuts = this.userOutsCardsData.equalOuts.length > 0;
        if (this.insuranceCardsSplit) {
            this.insuranceCardsSplit.active = hasEqualOuts;
        }
        if (this.textOddsSplit) {
            this.textOddsSplit.string = this.formatOdds(this.selectedEqualOdd());
        }
        this.userOutsCardsData.equalOuts.forEach((cardId, index) => {
            const clone = cc.instantiate(this.insuranceCardSplitTemplate);
            clone.name = `split_${index}`;
            clone.parent = this.insuranceCardsSplitContent || this.insuranceCardsSplit;
            clone.active = true;
            const item = new InsuranceCardItem(clone);
            item.isOver = false;
            item.updateItem(cardId);
            this.outsSplitObjsList.push(item);
            this.listInsuranceCardItems.push(item);
            this.outsObjList.push(clone);
        });
        if (this.numToggle?.isChecked) {
            this.orderList(this.outsOverObjsList, 0);
            this.orderList(this.outsSplitObjsList, 0);
        } else if (this.graToggle?.isChecked) {
            this.orderList(this.outsOverObjsList, 1);
            this.orderList(this.outsSplitObjsList, 1);
        }
        this.selectOuts = this.userOutsCardsData.overOuts.length + this.userOutsCardsData.equalOuts.length;
        this.updateOuts();
    }

    /** outs 排序：0 按点数，1 按整张牌值。 */
    private orderList(list: InsuranceCardItem[], orderIndex: number): void {
        if (!list?.length) {
            return;
        }
        list.sort((left, right) => {
            if (orderIndex === 0) {
                return left.cardReadId - right.cardReadId;
            }
            return left.cardId - right.cardId;
        });
        const parent = list[0].node.parent;
        const reservedBefore = parent.children.filter(
            child => child !== this.insuranceCardOverTemplate && child !== this.insuranceCardSplitTemplate && !this.outsObjList.includes(child)
        );
        const startIndex = reservedBefore.length;
        list.forEach((item, index) => item.node.setSiblingIndex(startIndex + index));
        if (this.insuranceCardOverTemplate?.parent === parent) {
            this.insuranceCardOverTemplate.setSiblingIndex(parent.childrenCount - 1);
        }
        if (this.insuranceCardSplitTemplate?.parent === parent) {
            this.insuranceCardSplitTemplate.setSiblingIndex(parent.childrenCount - 1);
        }
    }

    /** 更新已选 outs / 赔率 / 提示文案。新版里不做单张切换，所以这里只展示聚合结果。 */
    private updateOuts(): void {
        if (this.textOuts) {
            if (GameCache.Instance._selectedOuts === 2) {
                this.textOuts.string = `${this.selectOuts}${i18nMgr.Get('UIInsurance_zhang')}(${i18nMgr.Get('UIInsuranceAllOuts')})`;
            } else {
                this.textOuts.string = `${this.selectOuts}${i18nMgr.Get('UIInsurance_zhang')}`;
            }
        }
        if (this.textOdds) {
            this.textOdds.string = this.formatOdds(this.selectedOverOdd());
        }
        if (this.textPayValue) {
            this.textPayValue.string = this.formatDisplay(this.checkCompensationAmount(this.currentSelectPoolType));
        }
        if (this.textTips) {
            this.textTips.string = this.currentTriggerData?.potAllowOutSelection === 1 ? '' : CPErrorCode.LanguageDescription(20035);
        }
    }

    /** Flop 强制保险和上轮背保提示。 */
    private updateClassicTurn(): void {
        if (this.classicTurnText) {
            this.classicTurnText.node.active = false;
        }
        if (this.textTurnTips) {
            this.textTurnTips.node.active = false;
        }
        if (this.data?.round === Def.Round.FLOP && GameCache.Instance._texasData._insuranceForceBuyRatio > 0) {
            const equalValue = this.checkForceBuy().toFixed(2).replace(/\.00$/, '');
            if (this.classicTurnText) {
                this.classicTurnText.node.active = true;
                this.classicTurnText.string = `${i18nMgr.Get('UITexasIns_InsAmount')}(${equalValue})`;
            }
            if (this.textTurnTips) {
                this.textTurnTips.node.active = true;
                this.textTurnTips.string = `${i18nMgr.Get('UITexasIns_InsAmount')}(${equalValue})`;
            }
            GameCache.Instance._texasData._buyInsurancePotUserCount.set(this.currentTriggerData.subPot, this.currentTriggerData.potUserCount);
        }
    }

    private checkForceBuy(): number {
        let value = 0;
        if (this.data?.round === Def.Round.FLOP && GameCache.Instance._texasData._insuranceForceBuyRatio > 0) {
            if (this.userOutsCardsData.equalOuts.length > 0) {
                const equalOdd = this.selectedEqualOdd();
                value = this.currentTriggerData.leastAmount / 100 + this.currentTriggerData.leastAmount / 100 / (equalOdd || 1);
            } else {
                value = this.currentTriggerData.leastAmount / 100;
            }
        }
        return value;
    }

    /** 六档按钮下面显示的是“实际投保额”，不是赔付额。 */
    private updateMoneyText(): void {
        if (this.textMinMoney) {
            this.textMinMoney.string = this.formatDisplay(this.checkAllRealPayAmount(TexasInsurancePoolType.MIN_MONEY));
        }
        if (this.textAllMoney) {
            this.textAllMoney.string = this.formatDisplay(this.checkAllRealPayAmount(TexasInsurancePoolType.ALL));
        }
        if (this.textThirdMoney) {
            this.textThirdMoney.string = this.formatDisplay(this.checkAllRealPayAmount(TexasInsurancePoolType.THIRD));
        }
        if (this.textHalfMoney) {
            this.textHalfMoney.string = this.formatDisplay(this.checkAllRealPayAmount(TexasInsurancePoolType.HALF));
        }
        if (this.textFifthMoney) {
            this.textFifthMoney.string = this.formatDisplay(this.checkAllRealPayAmount(TexasInsurancePoolType.FIFTH));
        }
        if (this.textEighthMoney) {
            this.textEighthMoney.string = this.formatDisplay(this.checkAllRealPayAmount(TexasInsurancePoolType.EIGHTH));
        }
        this.setMinBtnState();
    }

    /** 根据强制保险规则，限制哪些档位可点。 */
    private setLeastType(): void {
        this.buttonsList.forEach(button => this.refreshPoolBtnState(button, true));
        this.refreshPoolBtnState(this.buttonMin, true);
        const forceType = this.getForceBuyPoolType();
        switch (forceType) {
            case TexasInsurancePoolType.FIFTH:
                this.refreshPoolBtnState(this.buttonEighth, false);
                break;
            case TexasInsurancePoolType.THIRD:
                this.refreshPoolBtnState(this.buttonEighth, false);
                this.refreshPoolBtnState(this.buttonFifth, false);
                break;
            case TexasInsurancePoolType.HALF:
                this.refreshPoolBtnState(this.buttonEighth, false);
                this.refreshPoolBtnState(this.buttonFifth, false);
                this.refreshPoolBtnState(this.buttonThird, false);
                break;
            case TexasInsurancePoolType.ALL:
                this.refreshPoolBtnState(this.buttonEighth, false);
                this.refreshPoolBtnState(this.buttonFifth, false);
                this.refreshPoolBtnState(this.buttonThird, false);
                this.refreshPoolBtnState(this.buttonHalf, false);
                break;
            default:
                break;
        }
        this.updatePoolActive();
    }

    private setMinBtnState(): void {
        const forceType = this.getForceBuyPoolType();
        if (forceType === TexasInsurancePoolType.NONE) {
            return;
        }
        const forceText = this.getPoolMoneyLabel(forceType)?.string;
        if (!forceText || !this.textMinMoney) {
            return;
        }
        const minValue = parseFloat(this.textMinMoney.string);
        const forceValue = parseFloat(forceText);
        if (!Number.isNaN(minValue) && !Number.isNaN(forceValue) && minValue < forceValue) {
            this.refreshPoolBtnState(this.buttonMin, false);
        }
    }

    private getForceBuyPoolType(): TexasInsurancePoolType {
        if (this.data?.round !== Def.Round.FLOP || GameCache.Instance._texasData._insuranceForceBuyRatio <= 0) {
            return TexasInsurancePoolType.NONE;
        }
        switch (GameCache.Instance._texasData._insuranceForceBuyRatio) {
            case 125:
                return TexasInsurancePoolType.EIGHTH;
            case 200:
                return TexasInsurancePoolType.FIFTH;
            case 333:
                return TexasInsurancePoolType.THIRD;
            case 500:
                return TexasInsurancePoolType.HALF;
            case 1000:
                return TexasInsurancePoolType.ALL;
            default:
                return TexasInsurancePoolType.NONE;
        }
    }

    private getPoolMoneyLabel(poolType: TexasInsurancePoolType): cc.Label {
        switch (poolType) {
            case TexasInsurancePoolType.MIN_MONEY:
                return this.textMinMoney;
            case TexasInsurancePoolType.ALL:
                return this.textAllMoney;
            case TexasInsurancePoolType.HALF:
                return this.textHalfMoney;
            case TexasInsurancePoolType.THIRD:
                return this.textThirdMoney;
            case TexasInsurancePoolType.FIFTH:
                return this.textFifthMoney;
            case TexasInsurancePoolType.EIGHTH:
                return this.textEighthMoney;
            default:
                return null;
        }
    }

    private refreshPoolBtnState(button: cc.Node, interactable: boolean): void {
        if (!button) {
            return;
        }
        this.setButtonInteractable(button, interactable);
        button.opacity = interactable ? 255 : 160;
    }

    private updatePoolActive(): void {
        [
            [this.buttonEighth, TexasInsurancePoolType.EIGHTH],
            [this.buttonFifth, TexasInsurancePoolType.FIFTH],
            [this.buttonThird, TexasInsurancePoolType.THIRD],
            [this.buttonHalf, TexasInsurancePoolType.HALF],
            [this.buttonAll, TexasInsurancePoolType.ALL],
            [this.buttonMin, TexasInsurancePoolType.MIN_MONEY]
        ].forEach(([button, poolType]: [cc.Node, TexasInsurancePoolType]) => {
            if (!this.checkCanPayFromPoolType(poolType)) {
                this.refreshPoolBtnState(button, false);
            }
        });
        const preferred = [this.buttonAll, this.buttonHalf, this.buttonThird, this.buttonFifth, this.buttonEighth, this.buttonMin];
        const target = preferred.find(button => this.getButtonInteractable(button));
        if (target) {
            this.onClickPoolButtons(target);
        }
    }

    private checkCanPayFromPoolType(poolType: TexasInsurancePoolType): boolean {
        const realPay = Math.floor(this.checkAllRealPayAmount(poolType) * 100);
        return realPay <= this.currentTriggerData.mostAmount;
    }

    /** 六档按钮切换时，更新当前池类型和右侧金额展示。 */
    private onClickPoolButtons(node: cc.Node): void {
        if (!node || !this.getButtonInteractable(node)) {
            return;
        }
        if (node === this.buttonMin) {
            this.currentSelectPoolType = TexasInsurancePoolType.MIN_MONEY;
            this.highlightBtn(this.imageMinChecked);
        } else if (node === this.buttonAll) {
            this.currentSelectPoolType = TexasInsurancePoolType.ALL;
            this.highlightBtn(this.imageAllChecked);
        } else if (node === this.buttonHalf) {
            this.currentSelectPoolType = TexasInsurancePoolType.HALF;
            this.highlightBtn(this.imageHalfChecked);
        } else if (node === this.buttonThird) {
            this.currentSelectPoolType = TexasInsurancePoolType.THIRD;
            this.highlightBtn(this.imageThirdChecked);
        } else if (node === this.buttonFifth) {
            this.currentSelectPoolType = TexasInsurancePoolType.FIFTH;
            this.highlightBtn(this.imageFifthChecked);
        } else if (node === this.buttonEighth) {
            this.currentSelectPoolType = TexasInsurancePoolType.EIGHTH;
            this.highlightBtn(this.imageEighthChecked);
        }
        this.overOutsPayValue = this.checkOverOutsPayAmount(this.currentSelectPoolType);
        this.chooseBtn = node;
        this.onValueChangedInsuranceValue();
    }

    /** 统一刷新当前选中档位对应的赔付额 / 投保额。 */
    private onValueChangedInsuranceValue(): void {
        if (this.textPayValue) {
            this.textPayValue.string = this.formatDisplay(this.checkCompensationAmount(this.currentSelectPoolType));
        }
        if (this.textInsuranceValue) {
            this.textInsuranceValue.string = this.formatDisplay(this.checkAllRealPayAmount(this.currentSelectPoolType));
        }
        this.updateOuts();
        this.refreshCancelButtonShow();
    }

    /** 放弃按钮下方会根据“强制保险 / 河牌背保”切换文案。 */
    private refreshCancelButtonShow(): void {
        if (this.textTurnTips) {
            this.textTurnTips.node.active = GameCache.Instance._texasData._insuranceForceBuyRatio > 0 && this.data?.round === Def.Round.FLOP;
        }
        if (this.textCancel) {
            this.textCancel.string = i18nMgr.Get('UIInsurance_GiveUp');
        }
        if (!this.currentTriggerData || this.currentTriggerData.insuranced <= 0) {
            return;
        }
        const forceOverValueText = this.formatDisplay(this.checkRiverForcePayAmount() / 100);
        if (this.textCancel) {
            this.textCancel.string = `${i18nMgr.Get('UIInsurance_GiveUp')}\n${i18nMgr.Get('UITexasIns_InsAmount')}(${forceOverValueText})`;
        }
        if (this.textTurnTips && this.currentSelectPoolType === TexasInsurancePoolType.MIN_MONEY) {
            this.textTurnTips.string = `${i18nMgr.Get('UITexasIns_InsAmount')}(${forceOverValueText})`;
            this.textTurnTips.node.active = true;
        }
    }

    /** 放弃当前池。Flop 强保时会按 Unity 行为缓存最小投保。 */
    private onClickCancel(): void {
        if (GameCache.Instance._texasData._insuranceForceBuyRatio > 0 && this.data?.round === Def.Round.FLOP) {
            this.turnCacheCurrentPotInsuranceBuy();
        }
        if (this.currentTriggerData) {
            GameCache.Instance.CurGame.cacheBuyInsurancePotUserCount = this.currentTriggerData.potUserCount;
            GameCache.Instance._texasData._buyInsurancePotUserCount.set(this.currentTriggerData.subPot, this.currentTriggerData.potUserCount);
        }
        this.checkMultiPoolToggle();
    }

    /** 购买当前池，然后检查是否需要自动跳到下一个池。 */
    private onClickBuy(): void {
        if (!this.cacheCurrentPotInsuranceBuy()) {
            return;
        }
        this.checkMultiPoolToggle();
    }

    /** 操作加时请求。当前 UI 没做折扣 tips，只保留发包与价格刷新。 */
    private onClickDelay(): void {
        if (this.onclickDelayButtonTimes > 1 || !this.delayButtonInteractable) {
            return;
        }
        ProtocolAgency.Send({
            Code: ProtocolCode.Protocol_Holdem_AddTime,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                consume: this.addTimeCount === 0 ? Def.ConsumeType.CT_DELAY_2 : Def.ConsumeType.CT_DELAY_3
            }
        });
        this.onclickDelayButtonTimes += 1;
    }

    private clickBack(): void {
        UIComponent.Instance.HideUI(PrefabUI.UIInsuranceNewPanel);
    }

    /** Flop 强保时，放弃当前池其实会缓存一笔最小投保。 */
    private turnCacheCurrentPotInsuranceBuy(): void {
        const insuredCards = this.userOutsCardsData.overOuts.slice();
        const potInsuranceBuy: PotInsuranceBuy.AsObject = {
            activeAmount: this.currentTriggerData.leastAmount,
            activeOutsList: insuredCards,
            round: (GameCache.Instance._texasData._round || GameCache.Instance.CurGame.cacheRound) as any,
            potId: this.currentTriggerData.subPot,
            passiveAmount: 0,
            passiveOutsList: [],
            insurEv: 0
        };
        GameCache.Instance.CurGame.cacheBuyInsurancePotUserCount = this.currentTriggerData.potUserCount;
        GameCache.Instance._texasData._buyInsurancePotUserCount.set(this.currentTriggerData.subPot, this.currentTriggerData.potUserCount);
        this.cachedPotInsuranceBuyList.push(potInsuranceBuy);
    }

    /** 缓存当前池购买数据。多池时先缓存，最后一池再 confirm=true 正式提交。 */
    private cacheCurrentPotInsuranceBuy(): boolean {
        const insuredCards = this.userOutsCardsData.overOuts.slice();
        if (!insuredCards.length) {
            UIComponent.Instance.Toast(CPErrorCode.LanguageDescription(10299));
            return false;
        }
        if (this.overOutsPayValue <= 0) {
            UIComponent.Instance.Toast(CPErrorCode.LanguageDescription(10324));
            return false;
        }
        const activeAmount = Math.max(this.overOutsPayValue, this.currentTriggerData.leastAmount);
        const potInsuranceBuy: PotInsuranceBuy.AsObject = {
            activeAmount,
            activeOutsList: insuredCards,
            round: (GameCache.Instance._texasData._round || GameCache.Instance.CurGame.cacheRound) as any,
            potId: this.currentTriggerData.subPot,
            passiveAmount: 0,
            passiveOutsList: [],
            insurEv: 0
        };
        GameCache.Instance.CurGame.cacheBuyInsurancePotUserCount = this.currentTriggerData.potUserCount;
        GameCache.Instance._texasData._buyInsurancePotUserCount.set(this.currentTriggerData.subPot, this.currentTriggerData.potUserCount);
        this.cachedPotInsuranceBuyList.push(potInsuranceBuy);
        return true;
    }

    /** 处理多池：当前池完成后自动切到下一池；最后一池时统一确认。 */
    private checkMultiPoolToggle(): void {
        if (this.multiPoolToggleList.length <= 1) {
            this.commitPotInsuranceBuy(true);
            return;
        }
        this.commitPotInsuranceBuy(false);
        const index = this.multiPoolToggleList.indexOf(this.chooseToggleObj);
        if (index >= 0) {
            const current = this.multiPoolToggleList.splice(index, 1)[0];
            if (current) {
                current.active = false;
            }
        }
        const nextToggleNode = this.multiPoolToggleList[index >= this.multiPoolToggleList.length ? 0 : index];
        if (!nextToggleNode) {
            return;
        }
        this.chooseToggleObj = nextToggleNode;
        this.clearMultiPoolToggleVisual();
        this.setMultiPoolToggleVisual(nextToggleNode, true);
        const toggle = nextToggleNode.getComponent(cc.Toggle);
        if (toggle) {
            toggle.isChecked = true;
        } else {
            const dataIndex = +nextToggleNode.name.replace('Toggle', '') || 0;
            this.refreshInsuranceData(this.data.triggedDatas[dataIndex]);
        }
    }

    /** 购买保险最终发包入口。 */
    private commitPotInsuranceBuy(isConfirm: boolean): void {
        ProtocolAgency.Send<ClientMessageBuyInsuranceActive.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_BuyInsuranceActive,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                buyList: this.cachedPotInsuranceBuyList.slice(),
                confirm: isConfirm,
                step: true
            }
        });
        if (isConfirm) {
            UIComponent.Instance.HideUI(PrefabUI.UIInsuranceNewPanel);
        }
    }

    /** 计算当前档位对应的赔付额。 */
    private checkCompensationAmount(poolType: TexasInsurancePoolType): number {
        if (!this.currentTriggerData) {
            return 0;
        }
        let value = 0;
        const potLeaderCount = Math.max(1, this.currentTriggerData.potLeaderCount);
        switch (poolType) {
            case TexasInsurancePoolType.MIN_MONEY:
                value = (this.currentTriggerData.potTotalCost + this.currentTriggerData.insuranced) / 100;
                break;
            case TexasInsurancePoolType.ALL:
                value = this.currentTriggerData.pot / 100;
                break;
            case TexasInsurancePoolType.HALF:
                value = this.currentTriggerData.pot / 100 / 2;
                break;
            case TexasInsurancePoolType.THIRD:
                value = (this.currentTriggerData.pot / 100) * 0.333;
                break;
            case TexasInsurancePoolType.FIFTH:
                value = this.currentTriggerData.pot / 100 / 5;
                break;
            case TexasInsurancePoolType.EIGHTH:
                value = this.currentTriggerData.pot / 100 / 8;
                break;
        }
        if (poolType !== TexasInsurancePoolType.MIN_MONEY) {
            value = value / potLeaderCount;
        }
        return value;
    }

    /** 河牌轮背保金额。只有 turn 轮投过保险，这里才会有值。 */
    private checkRiverForcePayAmount(): number {
        const lastInsurance = this.currentTriggerData?.insuranced || 0;
        if (lastInsurance <= 0) {
            return 0;
        }
        const overOdd = this.selectedOverOdd() || 1;
        const equalOdd = this.selectedEqualOdd();
        const forceOverValue = lastInsurance / overOdd;
        const forceEqualValue = equalOdd > 0 ? forceOverValue / equalOdd : 0;
        return forceOverValue + forceEqualValue;
    }

    /** 平分 outs 的投保额 = floor(反超投保额 / 平分赔率)。 */
    private checkEqualOutsPayAmount(overValue: number): number {
        if (!this.userOutsCardsData.equalOuts.length) {
            return 0;
        }
        const equalOdd = this.selectedEqualOdd();
        if (equalOdd <= 0) {
            return 0;
        }
        return Math.floor(overValue / equalOdd);
    }

    /** 总投保额 = 反超投保额 + 平分投保额。 */
    private checkAllRealPayAmount(poolType: TexasInsurancePoolType): number {
        const overValue = this.checkOverOutsPayAmount(poolType);
        const equalValue = this.checkEqualOutsPayAmount(overValue);
        return (overValue + equalValue) / 100;
    }

    /**
     * 反超投保额核心计算。
     * 这里对齐 Unity：六档都是先算赔付目标，再反推保费。
     */
    private checkOverOutsPayAmount(poolType: TexasInsurancePoolType): number {
        if (!this.currentTriggerData) {
            return 0;
        }
        const overOdd = this.selectedOverOdd();
        if (overOdd <= 0) {
            return 0;
        }
        let maxPay = 0;
        if (poolType === TexasInsurancePoolType.MIN_MONEY) {
            maxPay = Math.floor((this.currentTriggerData.potTotalCost + this.currentTriggerData.insuranced) / overOdd);
        } else {
            maxPay = Math.floor(this.currentTriggerData.pot / Math.max(1, this.currentTriggerData.potLeaderCount) / overOdd);
        }
        let overValue = 0;
        switch (poolType) {
            case TexasInsurancePoolType.MIN_MONEY:
            case TexasInsurancePoolType.ALL:
                overValue = maxPay;
                break;
            case TexasInsurancePoolType.HALF:
                overValue = maxPay / 2;
                break;
            case TexasInsurancePoolType.THIRD:
                overValue = maxPay * 0.333;
                break;
            case TexasInsurancePoolType.FIFTH:
                overValue = maxPay / 5;
                break;
            case TexasInsurancePoolType.EIGHTH:
                overValue = maxPay / 8;
                break;
        }
        if (this.data?.round === Def.Round.FLOP && GameCache.Instance._texasData._insuranceForceBuyRatio > 0) {
            const forceBuy = this.currentTriggerData.leastAmount;
            if (
                (GameCache.Instance._texasData._insuranceForceBuyRatio === 125 && poolType === TexasInsurancePoolType.EIGHTH) ||
                (GameCache.Instance._texasData._insuranceForceBuyRatio === 200 && poolType === TexasInsurancePoolType.FIFTH) ||
                (GameCache.Instance._texasData._insuranceForceBuyRatio === 333 && poolType === TexasInsurancePoolType.THIRD) ||
                (GameCache.Instance._texasData._insuranceForceBuyRatio === 500 && poolType === TexasInsurancePoolType.HALF) ||
                (GameCache.Instance._texasData._insuranceForceBuyRatio === 1000 && poolType === TexasInsurancePoolType.ALL)
            ) {
                return forceBuy;
            }
        }
        return Math.floor(overValue);
    }

    private selectedOverOdd(): number {
        return this.resolveOdds(this.userOutsCardsData.overOuts.length);
    }

    private selectedEqualOdd(): number {
        return this.resolveOdds(this.userOutsCardsData.equalOuts.length);
    }

    private hideAllHighlights(): void {
        [this.imageMinChecked, this.imageAllChecked, this.imageHalfChecked, this.imageThirdChecked, this.imageFifthChecked, this.imageEighthChecked].forEach(
            node => node && (node.active = false)
        );
    }

    private highlightBtn(highlight: cc.Node): void {
        this.hideAllHighlights();
        if (highlight) {
            highlight.active = true;
            this.currentHighlight = highlight;
        }
    }

    /** 关闭弹窗时清掉运行时生成节点和缓存。 */
    private clearData(): void {
        this.isCountdown = false;
        this.countDownTime = 0;
        this.maxCountDownTime = 0;
        this.countDownEndTimestamp = 0;
        this.onclickDelayButtonTimes = 0;
        this.cachedPotInsuranceBuyList.length = 0;
        this.clearMultiInsurancePoolData();
        this.destroyNodes(this.multiPoolToggleList);
        this.destroyNodes(this.playerClones);
        if (this.playersNext) {
            this.playersNext.active = false;
        }
        if (this.playerMineNode) {
            this.playerMineNode.active = false;
        }
        this.resetScrollAreaHeight();
    }

    private clearMultiInsurancePoolData(): void {
        this.clearOutCards();
    }

    private clearOutCards(): void {
        this.destroyNodes(this.outsObjList);
        this.listInsuranceCardItems.length = 0;
        this.outsOverObjsList.length = 0;
        this.outsSplitObjsList.length = 0;
    }

    private destroyNodes(nodes: cc.Node[]): void {
        while (nodes.length) {
            const node = nodes.pop();
            node?.destroy();
        }
    }

    /**
     * 让滚动链路真正具备“内容自适应高度”的能力。
     * 你当前 prefab 的几个 Layout 都是 NONE，不会跟着内容变高，所以这里在运行时统一切成 CONTAINER。
     */
    private applyScrollLayoutMode(): void {
        [
            this.insuranceCardsRoot,
            this.insuranceCardsOver,
            this.insuranceCardsSplit,
            this.insuranceCardsOverContent,
            this.insuranceCardsSplitContent,
            this.playersNext
        ].forEach(node => {
            const layout = node?.getComponent(cc.Layout);
            if (!layout) {
                return;
            }
            layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        });
    }

    /** 内容超过 620 时滚动；不足 620 时滚动区跟内容一起收缩，避免底部大块空白。 */
    private refreshScrollAreaHeight(): void {
        if (!this.scrollViewRoot || !this.scrollViewport || !this.insuranceCardsRoot) {
            return;
        }
        this.refreshLayoutNode(this.insuranceCardsOverContent);
        this.refreshLayoutNode(this.insuranceCardsSplitContent);
        this.refreshLayoutNode(this.playersNext);
        this.refreshLayoutNode(this.insuranceCardsOver);
        this.refreshLayoutNode(this.insuranceCardsSplit);
        this.refreshLayoutNode(this.insuranceCardsRoot);
        // 这里不能再拿 InsuranceCards 旧的静态高度做上限，
        // 否则就算当前只显示两块内容，也会被 prefab 初始高度“撑住”，底部继续留白。
        const contentHeight = Math.max(0, this.getVisibleContentHeight());
        this.insuranceCardsRoot.height = Math.max(1, contentHeight);
        const targetHeight = Math.min(this.maxScrollViewHeight, Math.max(0, contentHeight));
        this.scrollViewport.setContentSize(this.scrollViewport.width, targetHeight);
        this.scrollViewRoot.setContentSize(this.scrollViewRoot.width, targetHeight);
        this.dialogNode?.getComponent(cc.Layout)?.updateLayout();
        // 高度变化后把内容吸到顶部，避免内容少时仍然停留在旧滚动位置产生空白。
        this.scrollView?.scrollToTop(0);
    }

    private resetScrollAreaHeight(): void {
        if (this.scrollViewport) {
            this.scrollViewport.setContentSize(this.scrollViewport.width, this.maxScrollViewHeight);
        }
        if (this.scrollViewRoot) {
            this.scrollViewRoot.setContentSize(this.scrollViewRoot.width, this.maxScrollViewHeight);
        }
        this.dialogNode?.getComponent(cc.Layout)?.updateLayout();
    }

    /** 手动兜一份可见子节点高度，避免个别 Layout 还没来得及刷新时出现高度读小。 */
    private getVisibleContentHeight(): number {
        if (!this.insuranceCardsRoot) {
            return 0;
        }
        const layout = this.insuranceCardsRoot.getComponent(cc.Layout);
        const activeChildren = this.insuranceCardsRoot.children.filter(child => child.active);
        if (!activeChildren.length) {
            return 0;
        }
        let totalHeight = 0;
        activeChildren.forEach((child, index) => {
            totalHeight += child.height;
            if (index < activeChildren.length - 1) {
                totalHeight += layout?.spacingY || 0;
            }
        });
        return totalHeight;
    }

    private refreshLayoutNode(node: cc.Node): void {
        const layout = node?.getComponent(cc.Layout);
        if (!layout) {
            return;
        }
        layout.updateLayout();
    }

    /** 赔率先走本地表计算，取不到时退回服务端原始 odds，避免出现 undefined / NaN。 */
    private resolveOdds(selectOuts: number): number {
        if (!this.currentTriggerData || selectOuts <= 0) {
            return 0;
        }
        const gameOdds = GameUtil.GetOddsByPlayerNum(this.currentTriggerData.potUserCount, selectOuts);
        if (Number.isFinite(gameOdds) && gameOdds > 0) {
            return gameOdds;
        }
        return Number.isFinite(this.currentTriggerData.odds) ? this.currentTriggerData.odds : 0;
    }

    private formatOdds(odd: number): string {
        return `1:${Number.isFinite(odd) && odd > 0 ? odd : 0}`;
    }

    private formatDisplay(value: number): string {
        if (!Number.isFinite(value)) {
            return '0';
        }
        return value
            .toFixed(2)
            .replace(/\.00$/, '')
            .replace(/(\.\d)0$/, '$1');
    }
}
