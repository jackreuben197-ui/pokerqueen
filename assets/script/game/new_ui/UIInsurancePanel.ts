import SimpleNodePool from "../../common/MyNodePool";
import SliderPlus from "../../common/SliderPlus";
import CPMessageDispatherComponent from "../../event/CPMessageDispatherComponent";
import GC from "../../frame/GameControl";
import LanguageManager from "../../frame/manager/LanguageManager";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { i18nMgr } from "../../i18n/i18nMgr";
import ProtocolAgency from "../../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../../net/websocket/ProtocolCode";
import { Def, OutsCard, PotInsuranceBuy } from "../../protobuf/holdem/define_pb";
import { ClientMessageAddTime, ServerMessageAddTime } from "../../protobuf/holdem/req_th_add_time_pb";
import { ClientMessageBuyInsuranceActive } from "../../protobuf/holdem/req_th_buy_insurance_active_pb";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import GameUtil from "../util/GameUtil";

const { ccclass, property } = cc._decorator;


export class InsuranceData {
    public publicCards: number[];//公共牌
    public triggedDatas: WrapTriggedInsuranceData[];
    public timeLeft: number;//剩余时间
    public delayTimes: number;//已加时次数
}
class PlayerItem {

    private textNickname: cc.Label;
    private textOuts: cc.Label;

    //private imageCards: cc.Sprite[];
    private pokers: cc.Node = null;

    private poker_pos = {
        2: [-36.5, 36.5],
        4: [-66, -22, 22, 66],
        5: [-66, -33, 0, 33, 66],
        6: [-66, -40, -13, 13, 40, 66],
    }

    public constructor(public trans: cc.Node) {
        this.pokers = trans.getChildByName("pokers");
        this.textNickname = trans.getChildByName("Text_Nickname").getComponent(cc.Label);
        this.textOuts = trans.getChildByName("Text_Outs").getComponent(cc.Label);
    }
    // 展示购买保险玩家信息
    public UpdateItem(cardIds: number[], nickName: string, outs: number) {
        let hand_card_count = GameCache.Instance.CurGame.HandCards;
        let pos_x = this.poker_pos[hand_card_count];
        for (let i = 0; i < 6; i++) {
            let poker = this.pokers.children[i];
            if (i < hand_card_count) {
                poker.x = pos_x[i];
                poker.active = true;
                poker.getComponent(cc.Sprite).spriteFrame = GameCache.Instance.CurGame.GetBigPokerSP(GameUtil.GetCardNameByNum(cardIds[i]));
            } else {
                poker.active = false;
            }
        }
        this.textNickname.string = nickName;
        // textOuts.text = outs >= 0? $"outs={outs}" : "购买保险中";
        this.textOuts.string = outs >= 0 ? `${outs}${i18nMgr.Get("UIInsurance_ge")}outs` : i18nMgr.Get("UIInsurance_InsureIn");
    }
}


class InsuranceCardItem {

    public imageOnSelect: cc.Node;

    public imageInsuranceCard: cc.Node;

    public CardId: number;

    public GoInsuranceCard: cc.Node;



    public constructor(public trans: cc.Node) {

        this.imageOnSelect = trans.getChildByName("check");
        this.imageInsuranceCard = trans.getChildByName("icon");
    }

    public get IsSelect() {
        return this.imageOnSelect.active;
    }


    public UpdateItem(cardId: number, onSelect: boolean) {
        this.CardId = cardId;
        this.imageInsuranceCard.getComponent(cc.Sprite).spriteFrame = GameCache.Instance.CurGame.GetBigPokerSP(GameUtil.GetCardNameByNum(cardId));
        this.imageOnSelect.active = onSelect;
    }

    public OnSelect(isSelect: boolean) {
        this.imageOnSelect.active = isSelect;
    }

}
export class WrapTriggedInsuranceData {
    public outsCards: OutsCard.AsObject[][];//所有玩家
    public subPot: number;
    public leastAmount: number;//最小限制购买
    public mostAmount: number;//最大限制购买
    public potAllowOutSelection: number;//是否允许部分选择outs。已经在本池投入的保费>0，不可选择
    public potTotalCost: number;//池中总投入
    public pot: number;//要购买的保险池大小
    public userNames: string[];//参与保险得玩家名字
    public outsPerUser: number[];//outs数量
    public playerCards: number[][];//手牌
    public PotUserCount: number;//池内人数
    public PotLeaderCount: number;//池内领先人数
}

class UserOutsCardsData {
    // public overOuts: number[];//反超outs
    // public equalOuts: number[];//平分outs
    public constructor(public overOuts: number[], public equalOuts: number[]) {

    }
}


class WrapPlayerData {
    public name: string;
    public outsPerUser: number;
    public playerCards: number[];
}




@ccclass
export default class UIInsurancePanel extends UIBasePlus {



    //////////////////////////////////////

    $public_cards: cc.Node = null;

    $back_click: cc.Node = null;
    //自己
    $Mine_Player: cc.Node = null;
    //玩家容器
    $Players: cc.Node = null;
    //其他玩家模版
    $Player: cc.Node = null;

    //池子文本
    cc_Label$pots: cc.Label = null;

    //赔率文本
    cc_Label$odds: cc.Label = null;
    //已选文本
    cc_Label$outs: cc.Label = null;

    //已投入文本
    cc_Label$invest: cc.Label = null;
    //赔付额文本
    cc_Label$compen: cc.Label = null;
    //投保额文本
    cc_Label$toubao: cc.Label = null;

    //滑动条
    SliderPlus$slider: SliderPlus = null;

    //保险牌容器
    $content_insurance: cc.Node = null;
    //保险牌模版
    $poker_insurance: cc.Node = null;

    //全選按鈕
    $all_select: cc.Node = null;


    //加时按钮
    $btn_commit_delay: cc.Node = null;
    //放弃按钮
    $btn_commit_cancel: cc.Node = null;
    //购买按钮
    $btn_commit_buy: cc.Node = null;


    //冷却进度条读秒文本
    cc_Label$cd_time: cc.Label = null;
    //CD进度条
    cc_ProgressBar$cd: cc.ProgressBar = null;


    //加时文本
    cc_Label$add_time: cc.Label = null;
    //加时消费钻石文本
    cc_Label$diamond: cc.Label = null;
    //钻石节点
    $diamond: cc.Node = null;

    //右下角提示文本
    cc_Label$tips: cc.Label = null;


    $toggle_min: cc.Node = null;
    $toggle_all: cc.Node = null;



    listPlayerItems: PlayerItem[] = null;

    listInsuranceCardItems: InsuranceCardItem[] = null;

    myWrapTriggedInsuranceData: WrapTriggedInsuranceData = null;

    userOutsCardsData: UserOutsCardsData = null;

    data: InsuranceData = null;


    //点击次数
    OnclickDelayButtonTimes: number = 0;
    //加时次数
    addTimeCount: number;

    //是否冷却
    isCountdown: boolean = false;
    //剩余时间  秒
    countDownTime: number = 0;
    //最大时间
    maxTime: number = 0;

    //购买的时间
    DelayTimes: number = 0;



    mOutsObjList: cc.Node[] = null;
    LineOutsNum: number = 0;
    pingfenOutsCount: number = 0;
    selectOuts: number = 0;

    //记录时间
    recordDeltaTime: number;

    player_items = null;


    ins_poker_pool: SimpleNodePool = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.listPlayerItems = [];
        this.listInsuranceCardItems = [];
        this.player_items = [];
        this.$Player.active = false;
        this.$poker_insurance.active = false;
        this.ins_poker_pool = new SimpleNodePool(this.$poker_insurance);
        (window as any).ins = this;
    }

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$back_click, this.click_back);
        this.setButtonClick(this.$btn_commit_delay, this.onClickDelay);
        this.setButtonClick(this.$btn_commit_cancel, this.onClickCancel);
        this.setButtonClick(this.$btn_commit_buy, this.onClickBuy);

        this.setButtonClick(this.$toggle_min, this.onClickMin);
        this.setButtonClick(this.$toggle_all, this.onClickAll);

        this.setButtonClick(this.$all_select, this.onClickAllSelect);
    }

    private registerSocket(): void {
        GC.notify.register(ProtocolCode.Protocol_Holdem_AddTime, this.HANDLER_REQ_INSURANCE_ADD_TIME, this);
    }
    private removeSocket(): void {
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AddTime, this.HANDLER_REQ_INSURANCE_ADD_TIME, this);
    }

    private HANDLER_REQ_INSURANCE_ADD_TIME(rec: ServerMessageAddTime.AsObject) {

        if (rec == null) {
            return;
        }
        if (rec.status != 0) {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));//CPErrorCode.RoomErrorDescription(HotfixOpcode.REQ_ADD_TIME, rec.Status)
            return;
        }

        if (rec.status == 0) {
            this.addTimeCount = rec.times;
            this.countDownTime += rec.duration;
            this.isCountdown = true;
            this.cc_ProgressBar$cd.progress = 1;
            this.maxTime = this.countDownTime;
            this.UpdateDelayButton();
        }
    }
    // 刷新加时按钮
    private UpdateDelayButton() {

        this.$diamond.active = true;

        if (this.OnclickDelayButtonTimes > 1) {

            this.cc_Label$diamond.string = "";

            this.cc_Label$add_time.string = `0s`;

            this.$diamond.active = false;

            return;
        }
        let fee = 200 * Math.pow(2, this.addTimeCount);

        this.cc_Label$diamond.string = `${fee / 100}`;

        if (this.OnclickDelayButtonTimes == 1) {
            this.DelayTimes = 20;
        }
        //buttonDelay.gameObject.transform.Find("Text").GetComponent<Text>().text = $"+{DelayTimes}s";
        //buttonDelay.gameObject.transform.Find("Text").GetComponent<Text>().color = Color.white;

        this.cc_Label$add_time.string = `+${this.DelayTimes}s`;
    }

    onShow(param: any): void {
        super.onShow(param);
        if (param == null) return;
        this.data = param;
        this.resetData();
        this.registerSocket();
        this.UpdatePublicCards();
        this.ShowMultiPoolToggle();
        this.ShowCountDown();
        this.UpdateDelayButton();
    }
    resetData() {

        this.selectOuts = 0;

        this.LineOutsNum = 0;

        this.pingfenOutsCount = 0;

        this.OnclickDelayButtonTimes = 0;

        this.listInsuranceCardItems = [];
    }
    protected update(dt: number): void {

        if (!this.isCountdown) return;

        this.countDownTime -= dt;

        let show_s = Math.ceil(this.countDownTime);

        if (this.countDownTime <= 0) {
            this.countDownTime = 0;
            show_s = 0;
            this.isCountdown = false;
        }
        this.cc_ProgressBar$cd.progress = this.countDownTime / this.maxTime;

        this.cc_Label$cd_time.string = `${show_s}s`;

        //     if (CountDownImage.fillAmount > 0.5f)
        //     {
        //         CountDownImage.color = new Color32(86, 181, 87, 255);
        //     }
        // else if (CountDownImage.fillAmount <= 0.5f && CountDownImage.fillAmount > 0.25f)
        //     {
        //         CountDownImage.color = new Color32(255, 184, 83, 255);
        //     }
        // else if (CountDownImage.fillAmount <= 0.25f)
        //     {
        //         CountDownImage.color = new Color32(230, 68, 85, 255);
        //     }
    }

    // 刷新公共牌
    private UpdatePublicCards() {
        if (null == this.data.publicCards)
            return;
        for (let i = 0; i < 5; i++) {
            let card = this.data.publicCards[i];
            if (card > -1) {
                this.$public_cards.children[i].getComponent(cc.Sprite).spriteFrame = GameCache.Instance.CurGame.GetBigPokerSP(GameUtil.GetCardNameByNum(card));
            } else {
                this.$public_cards.children[i].getComponent(cc.Sprite).spriteFrame = GameCache.Instance.CurGame.GetBigPokerSP(GameUtil.GetCardNameByNum(-1));
            }
        }
    }

    // 判断是否展示多池toggle，  池>1 默认展示 第一条。
    private ShowMultiPoolToggle() {
        //MultiPoolToggles.gameObject.SetActive(this.data.triggedDatas.length > 1);
        //let MultiPoolToggleList = [];
        if (this.data.triggedDatas.length > 1) {
            // let index = 0;
            // foreach(WrapTriggedInsuranceData insuranceData in cacheInsuranceData.triggedDatas)
            // {
            //         WrapTriggedInsuranceData triggedInsuranceData = insuranceData;
            //         GameObject mGo = null;
            //     mGo = GameObject.Instantiate(MultiPoolToggle.gameObject, MultiPoolToggles.transform);
            //     mGo.name = "Toggle" + index;
            //     mGo.transform.localPosition = Vector3.zero;
            //     mGo.transform.localRotation = Quaternion.identity;
            //     mGo.transform.localScale = Vector3.one;
            //     mGo.transform.Find("Label").GetComponent<Text>().text = "保险池" + (index + 1);
            //     mGo.gameObject.SetActive(true);
            //     mGo.GetComponent<Toggle>().onValueChanged.AddListener((isOn) => {
            //         if (isOn) {
            //             ClearMultiInsurancePoolData();
            //             RefreshInsuranceData(triggedInsuranceData);
            //         }
            //     });
            //     MultiPoolToggleList.Add(mGo);
            //     index++;
            // }
            // MultiPoolToggleList[0].GetComponent<Toggle>().isOn = true;
        }
        else if (this.data.triggedDatas.length == 1) {
            this.RefreshInsuranceData(this.data.triggedDatas[0]);
        }
    }



    //展示倒计时相关
    private ShowCountDown() {
        this.recordDeltaTime = TimeHelper.NowS;
        this.isCountdown = true;
        this.addTimeCount = this.data.delayTimes;
        this.countDownTime = this.data.timeLeft;
        if (this.countDownTime < 0) this.countDownTime = 0;

        this.maxTime = this.countDownTime;

        //购买
        //this.cc_Label$add_time.string = `${CPErrorCode.LanguageDescription(10326)}`;
        //buttonBuy.gameObject.transform.Find("Text").GetComponent<Text>().text = $"{CPErrorCode.LanguageDescription(10326)}";
        this.cc_Label$cd_time.string = `${this.countDownTime}s`;
        //CountDownText.gameObject.SetActive(true);
        //CountDownImage.color = new Color32(86, 181, 87, 255);
        //CountDownImage.gameObject.SetActive(true);

        this.cc_ProgressBar$cd.progress = 1;

        //DOTween.To(x => CountDownImage.fillAmount = x, countDownTime / countDownTime, 0, countDownTime).SetEase(Ease.Linear);
        this.DelayTimes = 30;


    }



    // 刷新保险数据展示
    private RefreshInsuranceData(triggedInsuranceData: WrapTriggedInsuranceData) {

        this.myWrapTriggedInsuranceData = triggedInsuranceData;

        this.userOutsCardsData = new UserOutsCardsData([], []);

        this.myWrapTriggedInsuranceData.outsCards.forEach((outsCards: OutsCard.AsObject[]) => {

            outsCards.forEach((outsCard: OutsCard.AsObject) => {
                let isEqual = outsCard.isEqual;
                if (isEqual) {
                    if (!this.userOutsCardsData.equalOuts.includes(outsCard.card)) {
                        this.userOutsCardsData.equalOuts.push(outsCard.card);
                    }
                }
                else {
                    if (!this.userOutsCardsData.overOuts.includes(outsCard.card)) {
                        this.userOutsCardsData.overOuts.push(outsCard.card);
                    }
                }
            });
        })

        this.UpdatePlayers();
        this.InsuranceCards();

        this.UpdateInsuranceSlider();

        let mTmpOdd = this.SelectedOdd();

        this.cc_Label$odds.string = `1:${mTmpOdd}`;
        //池子
        this.cc_Label$pots.string = `${i18nMgr.Get("UIInsurance_zhuchi")}${this.myWrapTriggedInsuranceData.pot / 100 ^ 0}`;
        //已投入
        this.cc_Label$invest.string = `${this.myWrapTriggedInsuranceData.potTotalCost / 100 ^ 0}`;

        //赔付额,投保额
        if (this.isMinMode) {
            this.cc_Label$compen.string = `${Math.floor((mTmpOdd * this.CurrentSecureAmount() / 10 ^ 0) * 10 / 100)}`;
            this.cc_Label$toubao.string = `${(this.CurrentSecureAmount() / 10 ^ 0) * 10 / 100}`;
        }
        else {
            this.cc_Label$compen.string = `${Math.floor(mTmpOdd * Math.ceil(this.CurrentSecureAmount() / 100))}`;
            this.cc_Label$toubao.string = `${Math.ceil(this.CurrentSecureAmount() / 100)}`;
        }
        this.SliderPlus$slider.value = this.CurrentSecureAmount();
    }

    UpdatePlayers() {
        if (this.myWrapTriggedInsuranceData == null) return;

        let len = 1 + this.myWrapTriggedInsuranceData.userNames.length;

        for (let i = 0; i < 9; i++) {

            if (i < len) {

                if (!this.player_items[i]) {

                    if (i == 0) {
                        this.player_items[i] = new PlayerItem(this.$Mine_Player);
                    } else {
                        this.player_items[i] = new PlayerItem(cc.instantiate(this.$Player));
                        this.player_items[i].trans.parent = this.$Players;
                    }
                }

                if (i == 0) {
                    this.player_items[i].UpdateItem(GameCache.Instance.CurGame.mainPlayer.cards, GameCache.Instance.CurGame.mainPlayer.nick, -1);
                } else {
                    let k = i - 1;
                    this.player_items[i].trans.active = true;
                    this.player_items[i].UpdateItem(this.myWrapTriggedInsuranceData.playerCards[k], this.myWrapTriggedInsuranceData.userNames[k], this.myWrapTriggedInsuranceData.outsPerUser[k]);
                }

            } else {
                this.player_items[i] && (this.player_items[i].trans.active = false);
            }
        }
    }

    //清理所有保险牌
    private clearAllInsCards() {
        if (this.mOutsObjList) {
            this.mOutsObjList.forEach(node => {
                this.ins_poker_pool.BackNode(node);
            })
        }
        this.$content_insurance.removeAllChildren();
    }


    // 保险池所有outs 展示
    private InsuranceCards() {

        this.clearAllInsCards();
        //let mWrapTriggedInsuranceData: WrapTriggedInsuranceData = this.myWrapTriggedInsuranceData;

        this.listInsuranceCardItems || (this.listInsuranceCardItems = []);

        this.userOutsCardsData.overOuts || (this.userOutsCardsData.overOuts = []);

        this.mOutsObjList = [];

        //Insurance_outs_tipobj = rc.Get<GameObject>("Insurance_outs_tip");
        //Image_line = rc.Get<GameObject>("Image_line");
        for (let i = 0; i < this.userOutsCardsData.overOuts.length; i++) {
            let mGo: cc.Node = this.ins_poker_pool.GetNode();
            //cc.instantiate(this.$poker_insurance);
            mGo.active = true;
            mGo.name = `${i}`;
            mGo.parent = this.$content_insurance;
            let mInsuranceCardItem: InsuranceCardItem = new InsuranceCardItem(mGo);
            this.mOutsObjList.push(mGo);

            if (i == 0) {
                // GameObject mGo1 = GameObject.Instantiate(Insurance_outs_tipobj.gameObject, mGo.transform);
                // mGo1.transform.localScale = Vector3.one;
                // mGo1.transform.localPosition = new Vector3(mGo.transform.GetChild(1).localPosition.x - mGo.GetComponent<RectTransform>().sizeDelta.x / 2 - 80, 0);
                // mGo1.gameObject.SetActive(true);
                // mGo1.transform.Find("Text").GetComponent<Text>().text = LanguageManager.Get("UIInsurance_fanchao");
            }

            mInsuranceCardItem.UpdateItem(this.userOutsCardsData.overOuts[i], true);
            //UIEventListener.Get(mInsuranceCardItem.GoInsuranceCard).onClick = onClickInSuranceCard;
            this.listInsuranceCardItems.push(mInsuranceCardItem);

            this.setButtonClick(mGo, this.onClickInSuranceCard);
        }

        if (this.userOutsCardsData.equalOuts?.length > 0) {
            let pinfenIndex = this.userOutsCardsData.overOuts.length % 8;
            if (pinfenIndex > 0) {
                for (let i = 0; i < 8 - pinfenIndex; i++) {
                    let mInsuranceCardItem: InsuranceCardItem = null;
                    let mGo: cc.Node = this.ins_poker_pool.GetNode();
                    mGo.active = true;
                    mGo.parent = this.$content_insurance;
                    mGo.name = `${this.userOutsCardsData.overOuts.length + i + 1}`;
                    mInsuranceCardItem = new InsuranceCardItem(mGo);
                    mInsuranceCardItem.UpdateItem(-1, true);
                    mInsuranceCardItem.imageOnSelect.active = false;
                    mInsuranceCardItem.imageInsuranceCard.active = false;
                    this.mOutsObjList.push(mGo);
                    this.listInsuranceCardItems.push(mInsuranceCardItem);
                }
            }
            this.LineOutsNum = this.userOutsCardsData.overOuts.length > 0 ? 8 : 0;
            this.pingfenOutsCount = this.userOutsCardsData.equalOuts.length;
            for (let i = 0; i < this.pingfenOutsCount; i++) {
                let mInsuranceCardItem: InsuranceCardItem = null;
                let mGo: cc.Node = this.ins_poker_pool.GetNode();
                mGo.active = true;
                mGo.parent = this.$content_insurance;
                mGo.name = `${i + this.LineOutsNum + this.userOutsCardsData.overOuts.length - pinfenIndex}`;
                mInsuranceCardItem = new InsuranceCardItem(mGo);
                mInsuranceCardItem.UpdateItem(this.userOutsCardsData.equalOuts[i], true);
                //UIEventListener.Get(mInsuranceCardItem.GoInsuranceCard).onClick = onClickInSuranceCard;
                this.listInsuranceCardItems.push(mInsuranceCardItem);
                this.mOutsObjList.push(mGo);
                this.setButtonClick(mGo, this.onClickInSuranceCard);

            }
        }
        if (this.userOutsCardsData.equalOuts != null) {

            this.selectOuts = this.userOutsCardsData.overOuts.length + this.userOutsCardsData.equalOuts.length;
        }
        else {
            this.selectOuts = this.userOutsCardsData.overOuts.length;
        }
        this.UpdateOuts();
    }


    // 刷新投保额slider
    private UpdateInsuranceSlider() {


        if (this.isMinMode) {

            this.SliderPlus$slider.show({
                min_value: (this.myWrapTriggedInsuranceData.leastAmount / 10 ^ 0) * 10,
                max_value: (this.CurrentMostAmount() / 10 ^ 0) * 10,
                step: 10,
                change: this.sliderChange,
                own: this
            });
        }
        else {
            this.SliderPlus$slider.show({
                min_value: (this.myWrapTriggedInsuranceData.leastAmount / 100 ^ 0) * 100,
                max_value: (this.CurrentMostAmount() / 100 ^ 0) * 100,
                step: 100,
                change: this.sliderChange,
                own: this
            });
        }

        if (this.CurrentMostAmount() == 0) this.SliderPlus$slider.value = 0;

    }

    /*
     * 滑动条改变触发
     */
    sliderChange(value: number) {

        if (this.isMinMode) {

            this.cc_Label$toubao.string = `${value / 100} `;

            if (value == Math.ceil(this.CurrentSecureAmount() / 10) * 10) {
                this.HighlightMinBtn();
            } else if (value == (this.CurrentMostAmount() / 10 ^ 0) * 10) {
                this.HighlightAllBtn();
            } else {
                this.UnHighlighTwoBtn();
            }
        }
        else {

            this.cc_Label$toubao.string = `${value / 10} `;

            if (value == Math.ceil(this.CurrentSecureAmount() / 100) * 100) {
                this.HighlightMinBtn();
            } else if (value == (this.CurrentMostAmount() / 100 ^ 0) * 100) {
                this.HighlightAllBtn();
            } else {
                this.UnHighlighTwoBtn();
            }

        }


        this.UpdateOuts();

    }

    private SelectedOdd() {
        return GameUtil.GetOddsByPlayerNum(this.myWrapTriggedInsuranceData.PotUserCount, this.selectOuts);
    }
    private UnSelectedOdd() {

        if (this.userOutsCardsData.equalOuts != null) {
            //如果有平分outs，再减去平分
            return GameUtil.GetOddsByPlayerNum(this.myWrapTriggedInsuranceData.PotUserCount, this.userOutsCardsData.overOuts.length + this.userOutsCardsData.equalOuts.length - this.selectOuts);
        }
        else {
            return GameUtil.GetOddsByPlayerNum(this.myWrapTriggedInsuranceData.PotUserCount, this.userOutsCardsData.overOuts.length - this.selectOuts);
        }
    }

    private CurrentMostAmount() {

        let parameter: number = 0.25;

        if (GameCache.Instance.CurGame.cacheRound == Def.Round.TURN) {
            parameter = 0.5;
        }

        let amount1 = Math.floor(this.myWrapTriggedInsuranceData.pot / this.myWrapTriggedInsuranceData.PotLeaderCount * parameter);
        let amount2 = Math.floor(this.myWrapTriggedInsuranceData.pot / this.myWrapTriggedInsuranceData.PotLeaderCount / this.SelectedOdd()); // 不可以超过分池的池底

        if (this.SelectedOdd() == 0) {
            return 0;
        }
        else {
            return Math.min(amount1, amount2);
        }

    }

    private CurrentSecureAmount() {

        let parameter: number = 0.25;

        if (GameCache.Instance.CurGame.cacheRound == Def.Round.TURN) {
            parameter = 0.5;
        }
        let amount1 = Math.floor(this.myWrapTriggedInsuranceData.pot * parameter);
        let amount2 = Math.ceil(this.myWrapTriggedInsuranceData.potTotalCost / this.SelectedOdd()); // 不可以超过分池的池底
        if (this.SelectedOdd() == 0) {
            return 0;
        }
        else {
            return Math.min(amount1, amount2);
        }
    }



    private UpdateOuts() {

        this.cc_Label$odds.string = `1:${this.SelectedOdd()} `;

        this.cc_Label$outs.string = `${this.selectOuts} `//${i18nMgr.Get("UIInsurance_zhang")}`;

        this.cc_Label$compen.string = `${StringHelper.GetLongString(this.SelectedOdd() * this.SliderPlus$slider.value)}`;

        if (this.myWrapTriggedInsuranceData.potAllowOutSelection == 1) {
            this.setButtonInteractable(this.$all_select, true);
            if (this.userOutsCardsData.equalOuts != null) {
                if (this.selectOuts != this.userOutsCardsData.overOuts.length + this.userOutsCardsData.equalOuts.length) {

                    let autoInsured = Math.ceil(this.SliderPlus$slider.value / this.UnSelectedOdd());

                    this.cc_Label$tips.string = CPErrorCode.LanguageDescription(20034, [(this.userOutsCardsData.overOuts.length + this.userOutsCardsData.equalOuts.length - this.selectOuts), this.UnSelectedOdd(), autoInsured / 100]);

                }
                else {
                    this.cc_Label$tips.string = "";
                }
            }
            else {
                if (this.selectOuts != this.userOutsCardsData.overOuts.length) {

                    let autoInsured = Math.ceil(this.SliderPlus$slider.value / this.UnSelectedOdd());

                    this.cc_Label$tips.string = CPErrorCode.LanguageDescription(20034, [(this.userOutsCardsData.overOuts.length - this.selectOuts), this.UnSelectedOdd(), autoInsured / 100]);
                }
                else {
                    this.cc_Label$tips.string = "";
                }
            }
        }
        else {
            this.setButtonInteractable(this.$all_select, false);

            this.cc_Label$tips.string = CPErrorCode.LanguageDescription(20035);
        }
        let mInsuredCards = [];

        let mInsuranceCardItem: InsuranceCardItem = null;
        for (let i = 0; i < this.listInsuranceCardItems.length; i++) {
            mInsuranceCardItem = this.listInsuranceCardItems[i];
            if (null == mInsuranceCardItem || !mInsuranceCardItem.IsSelect || mInsuranceCardItem.CardId < 0) continue;
            mInsuredCards.push(mInsuranceCardItem.CardId);
        }

        this.allSelect = this.listInsuranceCardItems.length == mInsuredCards.length;

    }
    ////////////////////////////点击响应///////////////////////////////////



    private click_back() {
        UIComponent.Instance.HideUI(PrefabUI.UIInsurancePanel);
    }


    private onClickDelay() {
        if (this.OnclickDelayButtonTimes > 1) {
            return;
        }
        ProtocolAgency.Send<ClientMessageAddTime.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_AddTime,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                consume: this.addTimeCount == 0 ? Def.ConsumeType.CT_DELAY_2 : Def.ConsumeType.CT_DELAY_3,
            },
        })
        this.OnclickDelayButtonTimes++;
    }

    //取消购买
    private onClickCancel() {

        if (this.SliderPlus$slider.data.min_value > 0) {
            let mInsuredCards = [];
            let mInsuranceCardItem: InsuranceCardItem = null;
            for (let i = 0; i < this.listInsuranceCardItems.length; i++) {
                mInsuranceCardItem = this.listInsuranceCardItems[i];
                if (null == mInsuranceCardItem || !mInsuranceCardItem.IsSelect) continue;
                mInsuredCards.push(mInsuranceCardItem.CardId);
            }
            UIComponent.Instance.Toast(CPErrorCode.LanguageDescription(20053, [this.myWrapTriggedInsuranceData.leastAmount / 100]));
        }
        GameCache.Instance.CurGame.cacheBuyInsurancePotUserCount = this.myWrapTriggedInsuranceData.PotUserCount;//缓存购买池子

        ProtocolAgency.Send<ClientMessageBuyInsuranceActive.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_BuyInsuranceActive,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                buyList: []
            },
        });
        UIComponent.Instance.HideUI(PrefabUI.UIInsurancePanel);

        this.pingfenOutsCount = 0;
    }


    // 购买
    private onClickBuy(go: cc.Node) {
        let mInsuredCards = [];
        let mInsuranceCardItem: InsuranceCardItem = null;
        for (let i = 0; i < this.listInsuranceCardItems.length; i++) {
            mInsuranceCardItem = this.listInsuranceCardItems[i];
            if (null == mInsuranceCardItem || !mInsuranceCardItem.IsSelect) continue;
            mInsuredCards.push(mInsuranceCardItem.CardId);
        }
        if (mInsuredCards.length == 0) {
            // UIComponent.Instance.Toast($"请选择要投保的牌");
            UIComponent.Instance.Toast(CPErrorCode.LanguageDescription(10299));
            return;
        }

        if (this.SliderPlus$slider.value <= 0) {
            // UIComponent.Instance.Toast($"投保额要大于0");
            UIComponent.Instance.Toast(CPErrorCode.LanguageDescription(10324));
            return;
        }

        let MpotInsureAmount = this.SliderPlus$slider.value;

        if (MpotInsureAmount < this.myWrapTriggedInsuranceData.leastAmount) {
            MpotInsureAmount = this.myWrapTriggedInsuranceData.leastAmount;
        }

        let potInsuranceBuy: PotInsuranceBuy.AsObject = {
            activeAmount: MpotInsureAmount,
            activeOutsList: mInsuredCards,
            round: GameCache.Instance.CurGame.cacheRound,
            potId: this.myWrapTriggedInsuranceData.subPot,
            passiveAmount: 0,
            passiveOutsList: [],
        };

        GameCache.Instance.CurGame.cacheBuyInsurancePotUserCount = this.myWrapTriggedInsuranceData.PotUserCount;//缓存购买池子

        ProtocolAgency.Send<ClientMessageBuyInsuranceActive.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_BuyInsuranceActive,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                buyList: [potInsuranceBuy]
            },
        })

        UIComponent.Instance.HideUI(PrefabUI.UIInsurancePanel);
    }

    lateClose(param?: any) {
        super.lateClose(param);
        this.ClearData();
    }
    //清理数据
    private ClearData() {
        this.isCountdown = false;
        this.mOutsObjList = null;
        this.removeSocket();
        cc.log("-- UIInsurance ClearData -- ");
    }
    //是否小數量模式 
    private get isMinMode() {
        return GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100;
    }
    //高亮保底
    private HighlightMinBtn() {

        this.$toggle_min.getChildByName("check").active = true;
        this.$toggle_all.getChildByName("check").active = false;

    }
    //高亮滿池
    private HighlightAllBtn() {

        this.$toggle_min.getChildByName("check").active = false;
        this.$toggle_all.getChildByName("check").active = true;
    }

    private UnHighlighTwoBtn() {
        this.$toggle_min.getChildByName("check").active = false;
        this.$toggle_all.getChildByName("check").active = false;
    }

    //保本點擊
    private onClickMin() {


        // if (this.isMinMode) {

        //     this.SliderPlus$slider.value = (this.CurrentSecureAmount() / 10 ^ 0) * 10;

        // } else {
        //     this.SliderPlus$slider.value = (this.CurrentSecureAmount() / 100 ^ 0) * 100;
        // }

        if (this.isMinMode) {
            this.SliderPlus$slider.value = Math.ceil(this.CurrentSecureAmount() / 10) * 10;
        } else {
            this.SliderPlus$slider.value = Math.ceil(this.CurrentSecureAmount() / 100) * 100;
        }

        this.HighlightMinBtn();
    }
    //滿池點擊
    private onClickAll() {

        if (this.isMinMode) {

            this.SliderPlus$slider.value = (this.CurrentMostAmount() / 10 ^ 0) * 10;

        } else {
            this.SliderPlus$slider.value = (this.CurrentMostAmount() / 100 ^ 0) * 100;
        }

        this.HighlightAllBtn();
    }

    //全部选中Toggle
    private onClickAllSelect() {

        if (this.myWrapTriggedInsuranceData.potAllowOutSelection == 1) {

            this.allSelect = !this.allSelect;

            if (this.allSelect) {
                for (let i = 0; i < this.listInsuranceCardItems.length; i++) {
                    let mInsuranceCardItem: InsuranceCardItem = this.listInsuranceCardItems[i];

                    if (mInsuranceCardItem.IsSelect || mInsuranceCardItem.CardId < 0) {
                        continue;
                    }
                    mInsuranceCardItem.OnSelect(true);
                    if (mInsuranceCardItem.IsSelect)
                        this.selectOuts++;
                    else
                        this.selectOuts--;
                }
                this.UpdateOuts();
                this.UpdateInsuranceSlider();
                this.SliderPlus$slider.value = this.CurrentSecureAmount();
                this.HighlightMinBtn();
            }
            else {
                this.selectOuts = 0;
                for (let i = 0; i < this.listInsuranceCardItems.length; i++) {
                    let mInsuranceCardItem: InsuranceCardItem = this.listInsuranceCardItems[i];
                    mInsuranceCardItem.OnSelect(false);
                }
                this.UpdateOuts();
                this.UpdateInsuranceSlider();
                this.UnHighlighTwoBtn();
            }
        }
    }
    //保險牌點擊
    onClickInSuranceCard(go: cc.Button) {
        if (this.myWrapTriggedInsuranceData.potAllowOutSelection == 1) {
            let mIndex: number = + go.node.name;
            let mInsuranceCardItem: InsuranceCardItem = this.listInsuranceCardItems[mIndex];
            mInsuranceCardItem.OnSelect(!mInsuranceCardItem.IsSelect);
            if (mInsuranceCardItem.IsSelect)
                this.selectOuts++;
            else
                this.selectOuts--;
            this.UpdateOuts();
            this.UpdateInsuranceSlider();
            if (this.isMinMode) {
                this.SliderPlus$slider.value = Math.ceil(this.CurrentSecureAmount() / 10) * 10;
            } else {
                this.SliderPlus$slider.value = Math.ceil(this.CurrentSecureAmount() / 100) * 100;
            }
            this.HighlightMinBtn();
        }
    }

    set allSelect(boo: boolean) {
        this.$all_select.getChildByName("check").active = boo;
    }
    get allSelect() {
        return this.$all_select.getChildByName("check").active;
    }
}
