import GGEvent from "../../event/GGEvent";
import GC from "../../frame/GameControl";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { i18nMgr } from "../../i18n/i18nMgr";
import { Web_Stats_Other_User_Stats, Web_User_Info } from "../../net/https/WebRequest";
import ProtocolAgency from "../../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../../net/websocket/ProtocolCode";
import { Def, OutsCard, PotInsuranceBuy } from "../../protobuf/holdem/define_pb";
import { ClientMessageAddTime } from "../../protobuf/holdem/req_add_time_pb";
import { ClientMessageBuyInsuranceActive } from "../../protobuf/holdem/req_buy_insurance_active_pb";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import GGSlider from "../../ui/component/GGSlider";
import UIBase from "../../ui/UIBase";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import { UITexasModel } from "../UITexasModel";
import GameUtil from "../util/GameUtil";

const { ccclass, property } = cc._decorator;

class UserOutsCardsData {
    overOuts: any;//反超outs
    equalOuts: any;//平分outs

    public UserOutsCardsData() {
        this.overOuts = [];
        this.equalOuts = [];
    }
}

// export class WrapTriggedInsuranceData {
//     public outsCards: OutsCard.AsObject[];//所有玩家
//     public subPot: number;
//     public leastAmount: number;//最小限制购买
//     public mostAmount: number;//最大限制购买
//     public potAllowOutSelection: number;//是否允许部分选择outs。已经在本池投入的保费>0，不可选择
//     public potTotalCost: number;//池中总投入
//     public pot: number;//要购买的保险池大小
//     public userNames: string[];//参与保险得玩家名字
//     public outsPerUser: number[];//outs数量
//     public playerCards: number[];//手牌
//     public PotUserCount: number;//池内人数
//     public PotLeaderCount: number;//池内领先人数
// }
// export class InsuranceData {
//     public publicCards: number[];//公共牌
//     public triggedDatas: WrapTriggedInsuranceData[];
//     public timeLeft: number;//剩余时间
//     public delayTimes: number;//已加时次数
// }


@ccclass
export default class UIInsuranceComponent extends UIBase {

    openInfo: any = null;
    respInfo: any = null;
    isShowDown: boolean = null;

    btn_close: cc.Node = null;

    data: any = null;
    listCards: any = null;
    cacheInsuranceData: any = null;

    recordDeltaTime: any = null;
    isCountdown: any = null;
    addTimeCount: any = null;
    countDownTime: any = null;
    buttonBuy: any = null;
    CountDownText: any = null;
    CountDownImage: any = null;
    DelayTimes: any = null;
    OnclickDelayButtonTimes: any = null;
    MultiPoolToggleList: any = null;
    userOutsCardsData: UserOutsCardsData = null;
    listInsuranceCardItems: any = null;
    myWrapTriggedInsuranceData: any = null;
    selectOuts: any = null;
    mOutsObjList: any = null;
    LineOutsNum: any = null;
    electOuts: any = null;
    pingfenOutsCount: any = null;
    sendInterval: any = null;
    sliderInsuranceValue: any = null;
    imageCards: any = null;
    listPlayerItems: any = null;
    isChooseAll = false;
    changeTime = 0;
    scheTime = 0;
    svList = null;
    sliderCoin: GGSlider = null;
    startRate = 0;
    currValue = 0;

    textPayValue = null;

    textInsuranceValue = null;

    lbl_left_1 = null;
    lbl_left_2 = null;
    lbl_left_3 = null;

    lbl_btn_1 = null;
    lbl_btn_2 = null;

    lbl_choose_num = null;

    lbl_pay_num = null;

    textMainPut = null;

    textOdds = null;

    textPot = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.CountDownText = this.getChildNodeOrComponent("lbl_21", cc.Label);
        this.CountDownImage = this.getChildNodeOrComponent("progress_bar", cc.Sprite);
    }

    lateClose(param?: any) {
        super.lateClose(param);
        this.unschedule(this.timeDown);

        this.listCards = [];
        this.svList = [];
        this.CountDownText.string = "";
        let progress_time = this.getChildNodeOrComponent("progress_time", cc.ProgressBar);
        progress_time.progress = 1;
        this.refreshTwoBtn(true);
    }

    /**
     * 滑动条改变触发
     */
    onValueChangedSliderCoin(rate: number) {

        let showValue = (this.startRate + rate) * this._param.bigBlind;

        this.currValue = showValue * 100;

        this.sliderInsuranceValue = rate;

        // this.textCoin.string = this.textNeedCoin.string = `${showValue}`;

        if (this.currValue > GC.data.user.info.gold) {
            // this.textNeedCoin.node.color = new cc.Color(184, 43, 48, 255);
        }
        else {
            // this.textNeedCoin.node.color = new cc.Color(255, 255, 255, 255);
        }

        this.onValueChangedInsuranceValue(rate);
    }

    onShow(param?: any): void {
        super.onShow(param);

        if (param == null) {
            return;
        }

        if (param.triggedDatas && param.triggedDatas.length > 0) {
            this.myWrapTriggedInsuranceData = param.triggedDatas[0];
        }


        this.svList = [];
        this.data = param;
        this.cacheInsuranceData = param;

        this.OnclickDelayButtonTimes = 0;

        let panel_click: cc.Node = this.getChildNodeOrComponent("panel_click");
        panel_click.on("click", this.onClickClose, this);

        for (let i = 1; i < 4; i++) {
            let panel_btn_1: cc.Node = this.getChildNodeOrComponent("panel_btn_" + i);
            panel_btn_1["index"] = i;
            panel_btn_1.on("click", this.onClickBottomBtn, this);
        }

        for (let i = 1; i < 3; i++) {
            let btn_1: cc.Node = this.getChildNodeOrComponent("btn_" + i);
            btn_1["index"] = i;
            btn_1.on("click", this.onClicBtn, this);
        }

        let btn_choose: cc.Node = this.getChildNodeOrComponent("btn_choose");
        btn_choose.on("click", this.onClickChoose, this);
        this.isChooseAll = false;

        let imagePublicCard0: cc.Node = this.getChildNodeOrComponent("img_public_1");
        let imagePublicCard1: cc.Node = this.getChildNodeOrComponent("img_public_2");
        let imagePublicCard2: cc.Node = this.getChildNodeOrComponent("img_public_3");
        let imagePublicCard3: cc.Node = this.getChildNodeOrComponent("img_public_4");
        let imagePublicCard4: cc.Node = this.getChildNodeOrComponent("img_public_5");


        this.lbl_left_1 = this.getChildNodeOrComponent("lbl_left_1");
        this.lbl_left_2 = this.getChildNodeOrComponent("lbl_left_2");
        this.lbl_left_3 = this.getChildNodeOrComponent("lbl_left_3");

        this.textPayValue = this.lbl_left_2.getComponent(cc.Label);
        this.textInsuranceValue = this.lbl_left_3.getComponent(cc.Label);

        this.textMainPut = this.lbl_left_1.getComponent(cc.Label);

        this.lbl_btn_1 = this.getChildNodeOrComponent("lbl_btn_1");
        this.lbl_btn_2 = this.getChildNodeOrComponent("lbl_btn_2");

        this.lbl_choose_num = this.getChildNodeOrComponent("lbl_choose_num");

        this.textOdds = this.getChildNodeOrComponent("lbl_pay_num").getComponent(cc.Label);
        this.textPot = this.getChildNodeOrComponent("lbl_pay_num1").getComponent(cc.Label);

        // if (null == this.listCards) {
        //     this.listCards = [];
        // }
        // if (this.listCards.length > 0) {
        this.listCards = [];
        this.listCards.push(imagePublicCard0);
        this.listCards.push(imagePublicCard1);
        this.listCards.push(imagePublicCard2);
        this.listCards.push(imagePublicCard3);
        this.listCards.push(imagePublicCard4);
        // }

        this.CountDownText = this.getChildNodeOrComponent("lbl_21", cc.Label);
        this.CountDownImage = this.getChildNodeOrComponent("progress_bar", cc.Sprite);

        this.refreshView();
        this.ShowMultiPoolToggle();
        this.UpdatePublicCards();
        this.ShowCountDown();
        this.UpdateDelayButton();



        this.sliderCoin = this.getChildNodeOrComponent("Slider_Coin", GGSlider);
        this.sliderCoin.onChange(this.onValueChangedSliderCoin.bind(this));

        this.sliderCoin.SetMinMax(0, 100);
        this.sliderCoin.onShow({ index: 0 });
        this.onValueChangedSliderCoin(0);

        this.updateNameStr();

        this.svList.forEach((v) => {
            let kuang = v.getChildByName("kuang");
            let hook = v.getChildByName("hook");
            kuang.active = false;
            hook.active = false;
            v.isChoose = false;
        })

        let hook = btn_choose.getChildByName("hook");
        hook.active = false;
    }

    CurrentSecureAmount() {

        let parameter = 0.25;
        if (GameCache.Instance.CurGame.cacheRound == Def.Round.TURN) {
            parameter = 0.5;
        }
        let amount1 = Math.floor(this.myWrapTriggedInsuranceData.pot * parameter);
        let amount2 = (Math.ceil(this.myWrapTriggedInsuranceData.potTotalCost / this.SelectedOdd())); // 不可以超过分池的池底
        if (this.SelectedOdd() == 0) {
            return 0;
        }
        else {
            return Math.min(amount1, amount2);
        }

    }

    onValueChangedInsuranceValue(arg0) {
        let mTmpOdd = this.SelectedOdd();
        if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {
            this.textPayValue.string = (mTmpOdd * arg0 * 10);
            this.textInsuranceValue.string = arg0 / 10;
            if (arg0 == Math.ceil((this.CurrentSecureAmount() / 10))) {
                this.HighlightMinBtn();
            }
            else if (arg0 == this.CurrentMostAmount() / 10) {
                this.HighlightAllBtn();
            }
            else {
                this.UnHighlighTwoBtn();
            }
        }
        else {

            this.textPayValue.string = mTmpOdd * arg0 * 100;
            this.textInsuranceValue.string = arg0;
            if (arg0 == Math.ceil((this.CurrentSecureAmount() / 100))) {
                this.HighlightMinBtn();
            }
            else if (arg0 == this.CurrentMostAmount() / 100) {
                this.HighlightAllBtn();
            }
            else {
                this.UnHighlighTwoBtn();
            }
        }
        this.UpdateOuts();
    }


    /// <summary>
    /// 展示购买保险玩家信息
    /// </summary>
    /// <param name="cardIds"></param>
    /// <param name="nickName"></param>
    /// <param name="outs"></param>
    UpdateItem(cardIds, nickName, outs) {
        let mUpdateStart = 0;
        let mUpdateEnd = 0;
        let mHideStart = 0;
        let mHideEnd = 0;
        let mTmpHandCards = GameCache.Instance.CurGame.HandCards;
        let mTmpCount = this.imageCards.length;
        if (mTmpHandCards > mTmpCount) {
            mUpdateEnd = mTmpCount;
        }
        else if (mTmpHandCards < mTmpCount) {
            mUpdateEnd = mTmpHandCards;
            mHideStart = mTmpHandCards;
            mHideEnd = mTmpCount;
        }
        else {
            mUpdateEnd = mTmpHandCards;
        }

        for (let i = mUpdateStart; i < mUpdateEnd; i++) {
            let cardStr = GameUtil.GetCardNameByNum(cardIds[i]);
            let path = AssetContext.getAsset(
                cardStr,
                AssetFold.texture_SmallCard0) as cc.SpriteFrame;
            this.imageCards[i].getComponent(cc.Sprite).spriteFrame = path;
            this.imageCards[i].node.active(true);
        }

        for (let i = mHideStart; i < mHideEnd; i++) {
            this.imageCards[i].node.active(false);
        }
        this.getChildNodeOrComponent("lbl_name2", cc.Label).string = nickName;
        // textOuts.text = outs >= 0? $"outs={outs}" : "购买保险中";
        this.getChildNodeOrComponent("lbl_outs", cc.Label).string = outs >= 0 ?
            outs.toString() + i18nMgr.Get("UIInsurance_ge") + "outs"
            : CPErrorCode.LanguageDescription(10298);
    }

    /// <summary>
    /// 判断是否展示多池toggle，  池>1 默认展示 第一条。
    /// </summary>
    ShowMultiPoolToggle() {
        // MultiPoolToggles.node.SetActive(cacheInsuranceData.triggedDatas.length > 1);
        this.MultiPoolToggleList = [];
        if (this.cacheInsuranceData.triggedDatas.length > 1) {
            let index = 0;
            // foreach (WrapTriggedInsuranceData insuranceData in cacheInsuranceData.triggedDatas)
            // {
            //     WrapTriggedInsuranceData triggedInsuranceData = insuranceData;
            //     GameObject mGo = null;
            //     mGo = GameObject.Instantiate(MultiPoolToggle.node, MultiPoolToggles.transform);
            //     mGo.name ="Toggle"+index;
            //     mGo.transform.localPosition = Vector3.zero;
            //     mGo.transform.localRotation = Quaternion.identity;
            //     mGo.transform.localScale = Vector3.one;
            //     mGo.transform.Find("Label").GetComponent<Text>().text = "保险池" + (index + 1);
            //     mGo.node.active = true;
            //     mGo.GetComponent<Toggle>().onValueChanged.AddListener((isOn) =>
            //     {
            //         if (isOn)
            //         {
            //             ClearMultiInsurancePoolData();
            //             RefreshInsuranceData(triggedInsuranceData);
            //         }
            //     });
            //     MultiPoolToggleList.Add(mGo);
            //     index++;
            // }
            // MultiPoolToggleList[0].GetComponent<Toggle>().isOn = true;

        }
        else if (this.cacheInsuranceData.triggedDatas.length == 1) {
            this.RefreshInsuranceData(this.cacheInsuranceData.triggedDatas[0]);
        }
    }


    /// <summary>
    /// 刷新公共牌
    /// </summary>
    UpdatePublicCards() {
        if (null == this.data.publicCards)
            return;

        for (let i = this.data.publicCards.length, n = this.listCards.length; i < n; i++) {
            this.listCards[i].active = false;
        }

        for (let i = 0, n = this.data.publicCards.length; i < n; i++) {
            let cardStr = GameUtil.GetCardNameByNum(this.data.publicCards[i]);
            let path = AssetContext.getAsset(
                cardStr,
                AssetFold.texture_SmallCard0) as cc.SpriteFrame;
            this.listCards[i].getComponent(cc.Sprite).spriteFrame = path;
            this.listCards[i].active = this.data.publicCards[i] >= 0;
        }


    }

    /// <summary>
    /// 展示倒计时相关
    /// </summary>
    ShowCountDown() {
        this.recordDeltaTime = TimeHelper.Now;
        this.isCountdown = true;
        this.addTimeCount = this.data.delayTimes;
        this.countDownTime = this.data.timeLeft;
        if (this.countDownTime < 0) {
            this.countDownTime = 0;
        }
        // buttonBuy.node.transform.Find("Text").GetComponent<Text>().text = $"{CPErrorCode.LanguageDescription(10326)}";
        this.CountDownText.string = this.countDownTime + "s";
        this.CountDownText.node.active = true;
        // CountDownImage.color = new Color32(86, 181, 87, 255);
        // CountDownImage.node.active = true;

        // this.CountDownImage.fillAmount = 1;
        // cc.tween(this.CountDownImage).to(this.countDownTime, { width: 0 }, cc.easeBackOut()).start();
        // DOTween.To(x => CountDownImage.fillAmount = x, countDownTime / countDownTime, 0, countDownTime).SetEase(Ease.Linear);
        this.DelayTimes = 30;
        this.changeTime = 0;
        this.scheTime = 0;
        this.schedule(this.timeDown, 1);
    }

    timeDown() {
        // this.scheTime ++;
        this.changeTime++;
        if (this.countDownTime < this.changeTime) {
            this.unschedule(this.timeDown);
            this.onClickClose()
            return;
        }
        let progress_time = this.getChildNodeOrComponent("progress_time", cc.ProgressBar);
        progress_time.progress = (this.countDownTime - this.changeTime) / this.countDownTime;

        this.CountDownText.string = (this.countDownTime - this.changeTime) + "s";
    }

    onChangeTime(addTime) {
        let progress_time = this.getChildNodeOrComponent("progress_time", cc.ProgressBar);
        progress_time.progress = 1;
        this.unschedule(this.timeDown);
        this.data.timeLeft = this.countDownTime + addTime - this.changeTime;
        this.ShowCountDown();
    }

    /// <summary>
    /// 刷新加时按钮
    /// </summary>
    UpdateDelayButton() {
        if (this.OnclickDelayButtonTimes > 1) {
            // Button_Delay.node.transform.Find("Text_delay_bean").GetComponent<Text>().text = "";
            // Button_Delay.node.transform.Find("Text").GetComponent<Text>().text = $"{0}s";
            // Button_Delay.node.transform.Find("Text").GetComponent<Text>().color = Color.gray;
            // Button_Delay.node.transform.Find("Image_bean").node.active = false;
            this.lbl_btn_1.getComponent(cc.Label).string = "0s";
            this.lbl_btn_2.getComponent(cc.Label).string = "";
            this.lbl_btn_2.parent.active = false;
            return;
        }
        this.lbl_btn_2.parent.active = true;
        let fee = 200 * Math.pow(2, this.addTimeCount) * 0.01;
        // Button_Delay.node.transform.Find("Text_delay_bean").GetComponent<Text>().text = $"{StringHelper.GetDoubleString(fee)}";
        this.lbl_btn_2.getComponent(cc.Label).string = StringHelper.GetLongString(fee);

        if (this.OnclickDelayButtonTimes == 1) {
            this.DelayTimes = 20;
        }
        // Button_Delay.node.transform.Find("Text").GetComponent<Text>().text = $"+{DelayTimes}s";
        this.lbl_btn_1.getComponent(cc.Label).string = this.DelayTimes.toString() + "s";
        // Button_Delay.node.transform.Find("Text").GetComponent<Text>().color = Color.white;
    }

    /// <summary>
    /// 刷新保险数据展示
    /// </summary>
    /// <param name="triggedInsuranceData"></param>
    RefreshInsuranceData(triggedInsuranceData) {
        this.myWrapTriggedInsuranceData = triggedInsuranceData;
        if (this.userOutsCardsData == null) {
            this.userOutsCardsData = new UserOutsCardsData();
        }
        else {
            this.userOutsCardsData.equalOuts = [];
            this.userOutsCardsData.overOuts = [];
        }
        // foreach (RepeatedField<OutsCard> outsCards in myWrapTriggedInsuranceData.outsCards)
        // {
        //     foreach (OutsCard outsCard in outsCards)
        //     {
        //         bool isEqual = outsCard.IsEqual;
        //         if (isEqual)
        //         {
        //             if (!this.userOutsCardsData.equalOuts.Contains(outsCard.Card))
        //             {
        //                 this.userOutsCardsData.equalOuts.Add(outsCard.Card);
        //             }
        //         }
        //         else
        //         {
        //             if (!this.userOutsCardsData.overOuts.Contains(outsCard.Card))
        //             {
        //                 this.userOutsCardsData.overOuts.Add(outsCard.Card);
        //             }
        //         }
        //     }
        // }
        // this.UpdatePlayers();
        this.InsuranceCards();

        this.UpdateInsuranceSlider();
        if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {
            // sliderInsuranceValue.value = (float)Math.Ceiling((CurrentSecureAmount() / 10f));
        }
        else {
            // sliderInsuranceValue.value = (float)Math.Ceiling((CurrentSecureAmount() / 100f));
        }

        let mTmpOdd = this.SelectedOdd();
        this.textOdds.string = "1:" + mTmpOdd;
        this.textPot.string = this.myWrapTriggedInsuranceData.pot / 100;
        this.textMainPut.string = this.myWrapTriggedInsuranceData.potTotalCost / 100;
        if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {
            this.textInsuranceValue.string = this.CurrentSecureAmount() / 100;
        }
        else {
            this.textInsuranceValue.string = Math.ceil((this.CurrentSecureAmount() / 100));
        }

        if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {
            // this.textPayValue.string = Math.floor(mTmpOdd * this.CurrentSecureAmount() / 100)};
            this.textPayValue.string = Math.floor(mTmpOdd * this.CurrentSecureAmount() / 100);
        }
        else {
            // this.textPayValue.string = Math.floor(mTmpOdd * Math.ceil(this.CurrentSecureAmount() / 100))};
            this.textPayValue.string = Math.floor(mTmpOdd * Math.ceil(this.CurrentSecureAmount() / 100));
        }
    }

    /// <summary>
    /// 保险池所有outs 展示
    /// </summary>
    InsuranceCards() {
        if (null == this.listInsuranceCardItems)
            this.listInsuranceCardItems = [];

        let mWrapTriggedInsuranceData = this.myWrapTriggedInsuranceData;
        this.mOutsObjList = [];
        if (this.userOutsCardsData.overOuts == null) {
            this.userOutsCardsData.overOuts = [];
        }
        // Insurance_outs_tipobj = rc.Get<GameObject>("Insurance_outs_tip");
        // Image_line = rc.Get<GameObject>("Image_line");
        for (let i = 0; i < this.userOutsCardsData.overOuts.length; i++) {
            let mInsuranceCardItem = null;
            let mGo = null;
            // mGo = GameObject.Instantiate(transInsuranceCard.node, transInsuranceCards);
            mGo.name = i.toString();
            // mGo.transform.localPosition = Vector3.zero;
            // mGo.transform.localRotation = Quaternion.identity;
            // mGo.transform.localScale = Vector3.one;
            // mInsuranceCardItem = new InsuranceCardItem(mGo.transform);
            // mOutsObjList.Add(mGo);
            if (i == 0) {
                // GameObject mGo1= GameObject.Instantiate(Insurance_outs_tipobj.node, mGo.transform);
                // mGo1.transform.localScale = Vector3.one;
                // mGo1.transform.localPosition =new Vector3(mGo.transform.GetChild(1).localPosition.x- mGo.GetComponent<RectTransform>().sizeDelta.x/2-80, 0) ;
                // mGo1.node.active = true;
                // mGo1.transform.Find("Text").GetComponent<Text>().text = LanguageManager.Get("UIInsurance_fanchao");
            }
            // mInsuranceCardItem.UpdateItem((sbyte)userOutsCardsData.overOuts[i], true);
            mInsuranceCardItem.trans.node.active = true;
            // UIEventListener.Get(mInsuranceCardItem.GoInsuranceCard).onClick = onClickInSuranceCard;
            // listInsuranceCardItems.Add(mInsuranceCardItem);
        }

        if (this.userOutsCardsData.equalOuts != null && this.userOutsCardsData.equalOuts.length > 0) {
            let pinfenIndex = this.userOutsCardsData.overOuts.length % 8;

            if (pinfenIndex > 0) {
                for (let i = 0; i < 8 - pinfenIndex; i++) {
                    let mInsuranceCardItem = null;
                    let mGo = null;
                    // mGo = GameObject.Instantiate(transInsuranceCard.node, transInsuranceCards);
                    // mGo.name = (userOutsCardsData.overOuts.length + i+1).ToString();

                    // mGo.transform.localPosition = Vector3.zero;
                    // mGo.transform.localRotation = Quaternion.identity;
                    // mGo.transform.localScale = Vector3.one;
                    // mInsuranceCardItem = new InsuranceCardItem(mGo.transform);
                    // mInsuranceCardItem.UpdateItem(-1, true);
                    // mInsuranceCardItem.trans.node.active = true;
                    // mInsuranceCardItem.trans.GetChild(0).node.active = false;
                    // mInsuranceCardItem.trans.GetChild(1).node.active = false;
                    // mOutsObjList.Add(mGo);
                    // listInsuranceCardItems.Add(mInsuranceCardItem);
                }
            }
            this.LineOutsNum = this.userOutsCardsData.overOuts.length > 0 ? 8 : 0;
            this.pingfenOutsCount = this.userOutsCardsData.equalOuts.length;
            for (let i = 0; i < this.pingfenOutsCount; i++) {
                // InsuranceCardItem mInsuranceCardItem = null;
                // GameObject mGo = null;
                // mGo = GameObject.Instantiate(transInsuranceCard.node, transInsuranceCards);
                // mGo.name = (i + LineOutsNum + userOutsCardsData.overOuts.length - pinfenIndex).ToString();

                // mGo.transform.localPosition = Vector3.zero;
                // mGo.transform.localRotation = Quaternion.identity;
                // mGo.transform.localScale = Vector3.one;
                // mInsuranceCardItem = new InsuranceCardItem(mGo.transform);
                // mInsuranceCardItem.UpdateItem((sbyte)userOutsCardsData.equalOuts[i], true);
                // mInsuranceCardItem.trans.node.active = true;
                // if (i == 0)
                // {
                //     GameObject mGo1 = GameObject.Instantiate(Insurance_outs_tipobj.node, mGo.transform);
                //     mGo1.transform.localScale = Vector3.one;
                //     mGo1.transform.localPosition = new Vector3(mGo.transform.GetChild(1).localPosition.x - mGo.GetComponent<RectTransform>().sizeDelta.x / 2  -80, 0);
                //     mGo1.node.active = true;
                //     GameObject mGo2 = GameObject.Instantiate(Image_line.node, mGo.transform);
                //     mGo1.transform.Find("Text").GetComponent<Text>().text = LanguageManager.Get("UIInsurance_pingfen");
                //     mGo2.transform.localScale = Vector3.one;
                //     mGo2.transform.localPosition = new Vector3(446, 72);
                //     mGo2.node.active = true;
                // }
                // UIEventListener.Get(mInsuranceCardItem.GoInsuranceCard).onClick = onClickInSuranceCard;
                // listInsuranceCardItems.Add(mInsuranceCardItem);
                // mOutsObjList.Add(mGo);
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

    SelectedOdd() {
        if (this.myWrapTriggedInsuranceData == null || this.myWrapTriggedInsuranceData.PotUserCount == null) {
            return 0;
        }
        return GameUtil.GetOddsByPlayerNum(this.myWrapTriggedInsuranceData.PotUserCount, this.selectOuts);
        //RoomType mRoomType = (RoomType)GameCache.Instance.room_type;
        //if (GameCache.Instance.room_type > RoomType.TexasHoldemSixPlusFixedAof.GetHashCode() && GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit.GetHashCode())
        //{

        //    return GameUtil.GetOmahaOuts(selectOuts);
        //}
        //else
        //{
        //    return GameUtil.GetNormalOuts(selectOuts);
        //}
    }

    UnSelectedOdd() {

        if (this.userOutsCardsData.equalOuts != null) {
            //如果有平分outs，再减去平分
            return GameUtil.GetOddsByPlayerNum(this.myWrapTriggedInsuranceData.PotUserCount, this.userOutsCardsData.overOuts.length + this.userOutsCardsData.equalOuts.length - this.selectOuts);
        }
        else {
            return GameUtil.GetOddsByPlayerNum(this.myWrapTriggedInsuranceData.PotUserCount, this.userOutsCardsData.overOuts.length - this.selectOuts);
        }
        ////todo 区分奥马哈
        //RoomType mRoomType = (RoomType)GameCache.Instance.room_type;

        //if (GameCache.Instance.room_type > RoomType.TexasHoldemSixPlusFixedAof.GetHashCode() && GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit.GetHashCode())
        //{
        //    if (userOutsCardsData.equalOuts != null)
        //    {
        //        return GameUtil.GetOmahaOuts(userOutsCardsData.overOuts.length + userOutsCardsData.equalOuts.length - selectOuts);
        //    }
        //    else
        //    {
        //        return GameUtil.GetOmahaOuts(userOutsCardsData.overOuts.length - selectOuts);
        //    }
        //}
        //else
        //{
        //    if (userOutsCardsData.equalOuts != null)
        //    {
        //        return GameUtil.GetNormalOuts(userOutsCardsData.overOuts.length + userOutsCardsData.equalOuts.length - selectOuts);
        //    }
        //    else
        //    {
        //        return GameUtil.GetNormalOuts(userOutsCardsData.overOuts.length - selectOuts);
        //    }

        //}
    }

    update() {
        // if (!this.isCountdown)
        //     return;

        // // 如果还没有建立Session直接返回、或者没有到达发包时间
        // if (!(TimeHelper.Now - this.recordDeltaTime > this.sendInterval)) return;

        // // 记录当前时间
        // this.recordDeltaTime = TimeHelper.Now;
        // if (this.CountDownImage.fillAmount > 0.5)
        // {
        //     // this.CountDownImage.color = new Color32(86, 181, 87, 255);
        // }
        // else if (this.CountDownImage.fillAmount <= 0.5 && this.CountDownImage.fillAmount > 0.25)
        // {
        //     // CountDownImage.color = new Color32(255, 184, 83, 255);
        // }
        // else if (this.CountDownImage.fillAmount <= 0.25)
        // {
        //     // CountDownImage.color = new Color32(230, 68, 85, 255);
        // }
        // this.countDownTime -= 1;
        // if (this.countDownTime < 0)
        // this.countDownTime = 0;
        // // buttonBuy.node.transform.Find("Text").GetComponent<Text>().text = $"购买{countDownTime}s";
        // // this.CountDownText.text = $"{countDownTime}s";
        // this.CountDownText.string = this.countDownTime + "s";
    }

    CurrentMostAmount() {

        let parameter = 0.25;
        if (GameCache.Instance.CurGame.cacheRound == Def.Round.TURN) {
            parameter = 0.5;
        }

        let amount1 = Math.floor(this.myWrapTriggedInsuranceData.pot / this.myWrapTriggedInsuranceData.PotLeaderCount * parameter);
        let amount2 = Math.floor((this.myWrapTriggedInsuranceData.pot / this.myWrapTriggedInsuranceData.PotLeaderCount / this.SelectedOdd())); // 不可以超过分池的池底

        if (this.SelectedOdd() == 0) {
            return 0;
        }
        else {
            return Math.min(amount1, amount2);
        }

    }

    UpdateOuts() {
        // this.textOuts.string = $"{selectOuts}{LanguageManager.Get("UIInsurance_zhang")}";
        this.textOdds.string = "1:" + this.SelectedOdd();
        if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {
            this.textPayValue.string = this.SelectedOdd() * this.sliderInsuranceValue * 10;
        }
        else {
            this.textPayValue.string = this.SelectedOdd() * this.sliderInsuranceValue * 100;
        }

        if (this.myWrapTriggedInsuranceData.potAllowOutSelection == 1) {
            // Toggle_AllSec.enabled = true;
            if (this.userOutsCardsData.equalOuts != null) {
                if (this.selectOuts != this.userOutsCardsData.overOuts.length + this.userOutsCardsData.equalOuts.length) {
                    // let autoInsured = Convert.ToInt32(Math.Ceiling(Convert.ToInt32(sliderInsuranceValue.value) / UnSelectedOdd()));
                    if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {
                        // autoInsured = Convert.ToInt32(Math.Ceiling(Convert.ToInt32(sliderInsuranceValue.value) / UnSelectedOdd()) * 10);
                    }
                    else {
                        // autoInsured = Convert.ToInt32(Math.Ceiling(Convert.ToInt32(sliderInsuranceValue.value) / UnSelectedOdd()) * 100);
                    }
                    // textTips.text = $"强制背保：未选中OUTS {myWrapTriggedInsuranceData.outs.length - selectOuts}张，赔率{UnSelectedOdd()}，自动投保额{autoInsured}";
                    // textTips.text = CPErrorCode.LanguageDescription(20034, new List<object>() { (userOutsCardsData.overOuts.length+ userOutsCardsData.equalOuts.length - selectOuts), UnSelectedOdd(), autoInsured /100f});
                }
                else {
                    // textTips.text = "";
                }
            }
            else {
                if (this.electOuts != this.userOutsCardsData.overOuts.length) {
                    // let autoInsured = Convert.ToInt32(Math.Ceiling(Convert.ToInt32(sliderInsuranceValue.value) / UnSelectedOdd()));
                    if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {
                        // autoInsured = Convert.ToInt32(Math.Ceiling(Convert.ToInt32(sliderInsuranceValue.value) / UnSelectedOdd()) * 10);
                    }
                    else {
                        // autoInsured = Convert.ToInt32(Math.Ceiling(Convert.ToInt32(sliderInsuranceValue.value) / UnSelectedOdd()) * 100);
                    }
                    // textTips.text = $"强制背保：未选中OUTS {myWrapTriggedInsuranceData.outs.length - selectOuts}张，赔率{UnSelectedOdd()}，自动投保额{autoInsured}";

                    // textTips.text = CPErrorCode.LanguageDescription(20034, new List<object>() { (userOutsCardsData.overOuts.length - selectOuts), UnSelectedOdd(), autoInsured /100f});
                }
                else {
                    // textTips.text = "";
                }
            }
        }
        else {
            // Toggle_AllSec.enabled = false;
            // // textTips.text = "这一轮你必须购买所有OUTS";
            // textTips.text = CPErrorCode.LanguageDescription(20035);
        }
        let mInsuredCards = [];

        let mInsuranceCardItem = null;
        for (let i = 0, n = this.listInsuranceCardItems.length; i < n; i++) {
            mInsuranceCardItem = this.listInsuranceCardItems[i];
            if (null == mInsuranceCardItem)
                continue;

            if (!mInsuranceCardItem.IsSelect)
                continue;
            if (mInsuranceCardItem.CardId < 0) {
                continue;
            }
            mInsuredCards.push(mInsuranceCardItem.CardId);
        }

        if (this.listInsuranceCardItems.length == mInsuredCards.length) {
            // Toggle_AllSec.isOn = true;
        }
    }

    /// <summary>
    /// 刷新投保额slider
    /// </summary>
    UpdateInsuranceSlider() {

        if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {
            // sliderInsuranceValue.minValue = myWrapTriggedInsuranceData.leastAmount / 10;
            // sliderInsuranceValue.maxValue = CurrentMostAmount() / 10;
            // if (sliderInsuranceValue.value > CurrentMostAmount() / 10)
            // {
            //     sliderInsuranceValue.value = CurrentMostAmount() / 10;
            // }
        }
        else {
            // sliderInsuranceValue.minValue = myWrapTriggedInsuranceData.leastAmount / 100;
            // sliderInsuranceValue.maxValue = CurrentMostAmount() / 100;
            // if (sliderInsuranceValue.value > CurrentMostAmount() / 100)
            // {
            //     sliderInsuranceValue.value = CurrentMostAmount() / 100;
            // }
        }

    }


    refreshView() {
        let scrollView = this.getChildNodeOrComponent("sv_center", cc.ScrollView);
        scrollView.content.removeAllChildren();
        scrollView.scrollToTop();
        let triggedDatas = this.data.triggedDatas;
        if (triggedDatas <= 0) {
            return;
        }
        let publicCards = triggedDatas[0].outsCards;
        let len = publicCards.length;
        if (len == 0) {
        } else {
            // 有数据 刷新列表
            let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
            for (let i = 0; i < len; i++) {
                let _cloneNode = cc.instantiate(panel_item);
                _cloneNode.parent = scrollView.content;

                let info = publicCards[i];
                _cloneNode["cardId"] = info.card;
                this.svList.push(_cloneNode);
                let card = info.card;
                let cardStr = GameUtil.GetCardNameByNum(card);
                let path = AssetContext.getAsset(
                    cardStr,
                    AssetFold.texture_BigCard0) as cc.SpriteFrame;
                let img_pk = _cloneNode.getChildByName("img_pk");
                img_pk.getComponent(cc.Sprite).spriteFrame = path;
                let kuang = _cloneNode.getChildByName("kuang");
                kuang.active = false;
                let hook = _cloneNode.getChildByName("hook");
                hook.active = false;
                _cloneNode["index"] = i;
                _cloneNode["isChoose"] = false;
                _cloneNode.on("click", this.onClickItem, this);
            }
            // scrollView.content.height = panel_item.height * (len + 1);
        }
        this.refreshItemNum();
    }

    refreshItemNum() {
        let num = 0;
        this.svList.forEach((v) => {
            if (v.isChoose) {
                num++;
            }
        })
        this.lbl_choose_num.getComponent(cc.Label).string = num;
    }

    onClickItem(event) {
        let target = event.node;
        let index = target.index;
        let isChoose = target.isChoose;
        let kuang = target.getChildByName("kuang");
        let hook = target.getChildByName("hook");
        target.isChoose = !target.isChoose;
        if (isChoose) {
            kuang.active = false;
            hook.active = false;
        } else {
            kuang.active = true;
            hook.active = true;
        }
        this.refreshItemNum();
    }

    onClickChoose() {
        let btn_choose: cc.Node = this.getChildNodeOrComponent("btn_choose");
        let hook = btn_choose.getChildByName("hook");
        if (this.isChooseAll) {
            this.isChooseAll = false;
            this.svList.forEach((v) => {
                let kuang = v.getChildByName("kuang");
                let hook = v.getChildByName("hook");
                kuang.active = false;
                hook.active = false;
                v.isChoose = false;
            })
            hook.active = false;
        } else {
            this.isChooseAll = true;
            this.svList.forEach((v) => {
                let kuang = v.getChildByName("kuang");
                let hook = v.getChildByName("hook");
                kuang.active = true;
                hook.active = true;
                v.isChoose = true;
            })
            hook.active = true;
        }
        this.refreshItemNum();
    }

    private onClicBtn(event): void {
        let target = event.node;
        let index = target.index;
        if (index == 1) {
            // 保本
            this.onClickMin(target);
        } else if (index == 2) {
            // 满池
            this.onClickAll(target);
        }
    }

    private onClickBottomBtn(event): void {
        let target = event.node;
        let index = target.index;
        if (index == 1) {
            // 金币
            this.onClickDelay(target);
        } else if (index == 2) {
            // 放弃
            this.onClickCancel(target);
        } else if (index == 3) {
            // 购买
            this.onClickBuy(target);
        }
    }

    private onClickClose(): void {
        //UIComponent.Instance.HideUI(PrefabUI.UIInsuranceComponent);
    }

    onClickAll(go) {
        if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {
            this.sliderCoin.onShow({ index: this.CurrentMostAmount() / 10 });
            // this.sliderInsuranceValue.value = this.CurrentMostAmount() / 10;
        }
        else {
            this.sliderCoin.onShow({ index: this.CurrentMostAmount() / 100 });
            // this.sliderInsuranceValue.value = this.CurrentMostAmount() / 100;
        }
        this.HighlightAllBtn();


    }

    onClickMin(go) {
        if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {
            this.sliderCoin.onShow({ index: this.CurrentSecureAmount() / 10 });
            // sliderInsuranceValue.value = (float)(CurrentSecureAmount() / 10f) ;
        }
        else {
            this.sliderCoin.onShow({ index: this.CurrentSecureAmount() / 100 });
            // sliderInsuranceValue.value = (float)Math.Ceiling((CurrentSecureAmount() / 100f));
        }
        this.HighlightMinBtn();
    }

    refreshTwoBtn(isMax, isHide?) {
        let btn_1: cc.Node = this.getChildNodeOrComponent("btn_1");
        let btn_2: cc.Node = this.getChildNodeOrComponent("btn_2");
        let yes1: cc.Node = btn_1.getChildByName("yes");
        let yes2: cc.Node = btn_2.getChildByName("yes");
        let no1: cc.Node = btn_1.getChildByName("no");
        let no2: cc.Node = btn_2.getChildByName("no");
        let lbl1: cc.Node = btn_1.getChildByName("lbl");
        let lbl2: cc.Node = btn_2.getChildByName("lbl");
        yes1.active = isMax;
        yes2.active = !isMax;
        no1.active = !isMax;
        no2.active = isMax;
        lbl1.color = isMax ? cc.color(255, 255, 255) : cc.color(0, 0, 0);
        lbl2.color = !isMax ? cc.color(255, 255, 255) : cc.color(0, 0, 0);
        if (isHide) {
            yes1.active = false;
            yes2.active = false;
            no1.active = true;
            no2.active = true;
            lbl1.color = cc.color(0, 0, 0);
            lbl2.color = cc.color(0, 0, 0);
        }
    }

    HighlightMinBtn() {
        this.refreshTwoBtn(true);
        // buttonAll.GetComponent<Image>().sprite = rc.Get<Sprite>("icon_image_Insutance_dengli");
        // buttonMin.GetComponent<Image>().sprite = rc.Get<Sprite>("icon_image_Insurance_baoben");
    }

    HighlightAllBtn() {
        this.refreshTwoBtn(false);
        // buttonAll.GetComponent<Image>().sprite = rc.Get<Sprite>("icon_image_Insurance_baoben");
        // buttonMin.GetComponent<Image>().sprite = rc.Get<Sprite>("icon_image_Insutance_dengli");
    }

    UnHighlighTwoBtn() {
        this.refreshTwoBtn(null, true);
        // buttonAll.GetComponent<Image>().sprite = rc.Get<Sprite>("icon_image_Insutance_dengli");
        // buttonMin.GetComponent<Image>().sprite = rc.Get<Sprite>("icon_image_Insutance_dengli");
    }

    /// <summary>
    /// 取消购买
    /// </summary>
    /// <param name="go"></param>
    onClickCancel(go) {
        // if (this.sliderInsuranceValue.minValue > 0)
        // {
        // List<int> mInsuredCards = new List<int>();

        // InsuranceCardItem mInsuranceCardItem = null;
        // for (int i = 0, n = listInsuranceCardItems.length; i < n; i++)
        // {
        //     mInsuranceCardItem = listInsuranceCardItems[i];
        //     if (null == mInsuranceCardItem)
        //         continue;

        //     if (!mInsuranceCardItem.IsSelect)
        //         continue;

        //     mInsuredCards.Add(mInsuranceCardItem.CardId);
        // }

        // ETHotfix.UIComponent.Instance.Toast(CPErrorCode.LanguageDescription(20053, new List<object>(){ myWrapTriggedInsuranceData.leastAmount/100f }));
        // }
        // GameCache.Instance.CurGame.cacheBuyInsurancePotUserCount = myWrapTriggedInsuranceData.PotUserCount;//缓存购买池子
        // CPGameSessionComponent.Instance.Send(new Protocol_Holdem_BuyInsuranceActive()
        // {
        //     RoomID = (ulong)GameCache.Instance.room_id,
        //     MatchID = (ulong)GameCache.Instance.match_id,
        //     request = new Protocol.Holdem.ClientMessageBuyInsuranceActive()
        //     {
        //         Room = new Room() { RoomId = (uint)GameCache.Instance.room_id, MatchId = (uint)GameCache.Instance.match_id },
        //         Buy = new Google.Protobuf.Collections.RepeatedField<PotInsuranceBuy>() { }
        //     }
        // });


        ProtocolAgency.Send<ClientMessageBuyInsuranceActive.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_BuyInsuranceActive,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                buyList: []
            },
        });

        // UIComponent.Instance.HideNoAnimation(UIType.UIInsurance);

        this.pingfenOutsCount = 0;
        this.onClickClose();
    }

    onClickDelay(go) {
        if (this.OnclickDelayButtonTimes > 1) {
            return;
        }
        // CPGameSessionComponent.Instance.Send(new Protocol_Holdem_AddTime()
        // {
        //     RoomID = (ulong)GameCache.Instance.room_id,
        //     MatchID = (ulong)GameCache.Instance.match_id,
        //     request = new ClientMessageAddTime()
        //     {
        //         Room = new Room() {  RoomId = (uint)GameCache.Instance.room_id, MatchId = (uint)GameCache.Instance.match_id },
        //         Consume = addTimeCount == 0 ? Def.Types.ConsumeType.CtDelay2 : Def.Types.ConsumeType.CtDelay3,
        //     }
        // });

        ProtocolAgency.Send<ClientMessageAddTime.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_AddTime,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                consume: this.addTimeCount == 0 ? Def.ConsumeType.CT_DELAY_2 : Def.ConsumeType.CT_DELAY_3,
            },
        });

        this.OnclickDelayButtonTimes += 1;


        // this.onClickClose();
    }

    /// <summary>
    /// 购买
    /// </summary>
    /// <param name="go"></param>
    onClickBuy(go) {
        let mInsuredCards = [];

        let mInsuranceCardItem = null;
        // for (let i = 0, n = this.listInsuranceCardItems.length; i < n; i++)
        // {
        //     mInsuranceCardItem = this.listInsuranceCardItems[i];
        //     if (null == mInsuranceCardItem)
        //         continue;

        //     if (!mInsuranceCardItem.IsSelect)
        //         continue;

        //     mInsuredCards.push(mInsuranceCardItem.CardId);
        // }

        this.svList.forEach(element => {
            if (element.isChoose) {
                mInsuredCards.push(element.cardId);
            }
        });

        if (mInsuredCards.length == 0) {
            // UIComponent.Instance.Toast($"请选择要投保的牌");
            UIComponent.Instance.Toast(CPErrorCode.LanguageDescription(10299));
            return;
        }

        // if (sliderInsuranceValue.value <= 0)
        // {
        //     // UIComponent.Instance.Toast($"投保额要大于0");
        //     UIComponent.Instance.Toast(CPErrorCode.LanguageDescription(10324));
        //     return;
        // }

        let MpotInsureAmount = 0;

        if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {
            // MpotInsureAmount = sliderInsuranceValue.value * 10;
        }
        else {
            // MpotInsureAmount = sliderInsuranceValue.value * 100;
        }
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

        // for (let i = 0; i < mInsuredCards.length; i++)
        // {
        //     potInsuranceBuy.getActiveOutsList().push(mInsuredCards[i]);
        // }
        GameCache.Instance.CurGame.cacheBuyInsurancePotUserCount = this.myWrapTriggedInsuranceData.PotUserCount;//缓存购买池子
        // CPGameSessionComponent.Instance.Send(new Protocol_Holdem_BuyInsuranceActive()
        // {
        //     RoomID = (ulong)GameCache.Instance.room_id,
        //     MatchID = (ulong)GameCache.Instance.match_id,
        //     request = new Protocol.Holdem.ClientMessageBuyInsuranceActive()
        //     {
        //         Room = new Room() { RoomId = (uint)GameCache.Instance.room_id, MatchId = (uint)GameCache.Instance.match_id },
        //         Buy = new Google.Protobuf.Collections.RepeatedField<PotInsuranceBuy>() { potInsuranceBuy }
        //     }
        // });


        ProtocolAgency.Send<ClientMessageBuyInsuranceActive.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_BuyInsuranceActive,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                buyList: [potInsuranceBuy]
            },
        }
        );

        this.onClickClose();
        // UIComponent.Instance.HideNoAnimation(UIType.UIInsurance);
    }

    /// <summary>
    /// 点击保险outs牌
    /// </summary>
    /// <param name="go"></param>
    onClickInSuranceCard(go) {
        // if (myWrapTriggedInsuranceData.potAllowOutSelection == 1)
        // {
        //     int mIndex = Convert.ToInt32(go.transform.parent.name);
        //     InsuranceCardItem mInsuranceCardItem = listInsuranceCardItems[mIndex];
        //     mInsuranceCardItem.OnSelect(!mInsuranceCardItem.IsSelect);
        //     if (mInsuranceCardItem.IsSelect)
        //         selectOuts++;
        //     else
        //         selectOuts--;
        //     UpdateOuts();

        //     UpdateInsuranceSlider();
        //     if (GameCache.Instance.CurGame.smallBlind < 100 || CurrentMostAmount() <= 100)
        //     {
        //         sliderInsuranceValue.value = (float)Math.Ceiling((CurrentSecureAmount() / 10f));
        //     }
        //     else
        //     {
        //         sliderInsuranceValue.value = (float)Math.Ceiling((CurrentSecureAmount() / 100f));
        //     }
        //     HighlightMinBtn();

        // }

    }
    /// <summary>
    /// 全部选中Toggle
    /// </summary>
    OnclickAllSelect(ison) {
        // if (myWrapTriggedInsuranceData.potAllowOutSelection == 1)
        // {
        //     if (ison)
        //     {
        //         for (int i = 0; i < listInsuranceCardItems.length; i++)
        //         {
        //             InsuranceCardItem mInsuranceCardItem = listInsuranceCardItems[i];
        //             //Debug.LogError("mInsuranceCardItem:"+ mInsuranceCardItem.CardId);
        //             if (mInsuranceCardItem.IsSelect || mInsuranceCardItem.CardId < 0)
        //             {
        //                 continue;
        //             }
        //             mInsuranceCardItem.OnSelect(true);
        //             if (mInsuranceCardItem.IsSelect)
        //                 selectOuts++;
        //             else
        //                 selectOuts--;
        //         }
        //         UpdateOuts();
        //         UpdateInsuranceSlider();
        //         if (GameCache.Instance.CurGame.smallBlind < 100 || CurrentMostAmount() <= 100)
        //         {
        //             sliderInsuranceValue.value = (float)Math.Ceiling((CurrentSecureAmount() / 10f));
        //         }
        //         else
        //         {
        //             sliderInsuranceValue.value = (float)Math.Ceiling((CurrentSecureAmount() / 100f));
        //         }
        //         HighlightMinBtn();
        //     }
        //     else
        //     {
        //         selectOuts = 0;
        //         for (int i = 0; i < listInsuranceCardItems.length; i++)
        //         {
        //             InsuranceCardItem mInsuranceCardItem = listInsuranceCardItems[i];
        //             mInsuranceCardItem.OnSelect(false);
        //         }
        //         UpdateOuts();

        //         UpdateInsuranceSlider();
        //     }
        // }
    }






















    updateNameStr() {
        if (this.data.triggedDatas == null || this.data.triggedDatas.length == 0) {
            return
        }
        let info = this.data.triggedDatas[0];
        let userNames = info.userNames;
        let nameStr1 = "";
        let nameStr2 = "";
        let nameLen = userNames.length;
        if (nameLen == 1) {
            nameStr1 = userNames[0];
        } else if (nameLen > 1) {
            nameStr1 = userNames[0];
            nameStr2 = userNames[1];
        }

        let outs = info.outsPerUser;

        this.getChildNodeOrComponent("lbl_name1", cc.Label).string = nameStr1;
        this.getChildNodeOrComponent("lbl_name2", cc.Label).string = nameStr2;
        // textOuts.text = outs >= 0? $"outs={outs}" : "购买保险中";
        this.getChildNodeOrComponent("lbl_outs", cc.Label).string = outs >= 0 ?
            outs.toString() + i18nMgr.Get("UIInsurance_ge") + "outs"
            : CPErrorCode.LanguageDescription(10298);

        let playerCards = info.playerCards;
        let cardLen = playerCards.length;
        let card1 = -1;
        let card2 = -1;
        if (cardLen == 1) {
            card1 = playerCards[0];
        } else if (cardLen > 1) {
            card1 = playerCards[0];
            card2 = playerCards[1];
        }

        let outsLen = outs.length;
        let card3 = -1;
        let card4 = -1;
        if (outsLen == 1) {
            card3 = outs[0];
        } else if (outsLen > 1) {
            card3 = outs[0];
            card4 = outs[1];
        }
        for (let i = 1; i < 5; i++) {
            let item = this.getChildNodeOrComponent("img_pk_" + i);
            let card = card1;
            if (i == 1 || i == 2) {
                card = card1;
                if (i == 2) {
                    card = card2;
                }
            } else {
                card = card3;
                if (i == 4) {
                    card = card4;
                }
            }
            let cardStr = GameUtil.GetCardNameByNum(card);
            let path = AssetContext.getAsset(
                cardStr,
                AssetFold.texture_SmallCard0) as cc.SpriteFrame;
            item.getComponent(cc.Sprite).spriteFrame = path;
        }


    }




    /// <summary>
    /// 刷新购买保险池对应玩家信息
    /// </summary>
    UpdatePlayers() {
        if (this.myWrapTriggedInsuranceData == null)
            return;

        let mList = [];
        let mWrapTriggedPlayerData = null;
        let mWrapTriggedInsuranceData = this.myWrapTriggedInsuranceData;
        for (let i = 0, n = mWrapTriggedInsuranceData.userNames.length; i < n; i++) {
            mWrapTriggedPlayerData = {};
            mWrapTriggedPlayerData.name = mWrapTriggedInsuranceData.userNames[i];
            mWrapTriggedPlayerData.outsPerUser = mWrapTriggedInsuranceData.outsPerUser[i];
            if (null == mWrapTriggedPlayerData.playerCards)
                mWrapTriggedPlayerData.playerCards = [];

            let mHandCards = GameCache.Instance.CurGame.HandCards;
            for (let j = 0; j < mHandCards; j++) {
                mWrapTriggedPlayerData.playerCards.Add(mWrapTriggedInsuranceData.playerCards[i][j]);
            }

            mList.push(mWrapTriggedPlayerData);
        }

        mWrapTriggedPlayerData = {};
        // mWrapTriggedPlayerData.name = GameCache.Instance.CurGame.MainPlayer.nick;
        mWrapTriggedPlayerData.outsPerUser = -1;
        // mWrapTriggedPlayerData.playerCards = GameCache.Instance.CurGame.MainPlayer.cards;
        // mList.Insert(0, mWrapTriggedPlayerData);

        if (null == this.listPlayerItems)
            this.listPlayerItems = [];

        let mPlayerItem = null;
        let mGo = null;
        let mNewStart = 0;
        let mNewEnd = 0;
        let mUpdateStart = 0;
        let mUpdateEnd = 0;
        let mHideStart = 0;
        let mHideEnd = 0;

        if (mList.length > this.listPlayerItems.length) {
            mUpdateStart = 0;
            mUpdateEnd = this.listPlayerItems.length;
            mNewStart = this.listPlayerItems.length == 0 ? 0 : mUpdateEnd;
            mNewEnd = mList.length;
        }
        else if (mList.length < this.listPlayerItems.length) {
            mUpdateStart = 0;
            mUpdateEnd = mList.length;
            mHideStart = mUpdateEnd;
            mHideEnd = this.listPlayerItems.length;
        }
        else {
            mUpdateStart = 0;
            mUpdateEnd = mList.length;
        }

        for (let i = mUpdateStart; i < mUpdateEnd; i++) {
            mPlayerItem = this.listPlayerItems[i];
            mWrapTriggedPlayerData = mList[i];
            mPlayerItem.UpdateItem(mWrapTriggedPlayerData.playerCards, mWrapTriggedPlayerData.name, mWrapTriggedPlayerData.outsPerUser);

            mPlayerItem.trans.node.active = true;
        }

        for (let i = mNewStart; i < mNewEnd; i++) {
            if (i == 0) {
                // mGo = transPlayerMine.node;
            }
            else {
                // mGo = GameObject.Instantiate(transPlayer.node, transPlayers);
                // mGo.transform.localPosition = Vector3.zero;
                // mGo.transform.localRotation = Quaternion.identity;
                // mGo.transform.localScale = Vector3.one;
            }
            // mPlayerItem = new PlayerItem(mGo.transform);
            // mWrapTriggedPlayerData = mList[i];
            // mPlayerItem.UpdateItem(mWrapTriggedPlayerData.playerCards, mWrapTriggedPlayerData.name, mWrapTriggedPlayerData.outsPerUser);

            // mPlayerItem.trans.node.active = true;
            // listPlayerItems.Add(mPlayerItem);
        }

        for (let i = mHideStart; i < mHideEnd; i++) {
            mPlayerItem = this.listPlayerItems[i];
            mPlayerItem.trans.node.active = false;
        }
    }

    /**
     * 注册广播事件
     */
    protected regiterDispatchEvent() {
        GC.notify.register(ProtocolCode.Protocol_Holdem_AddTime, this.HANDLER_REQ_INSURANCE_ADD_TIME, this);  // 操作加时
    }

    HANDLER_REQ_INSURANCE_ADD_TIME(response) {
        var rec = response;
        if (rec == null) {
            return;
        }
        if (rec.status != 0) {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.Status));//CPErrorCode.RoomErrorDescription(HotfixOpcode.REQ_ADD_TIME, rec.Status)
            return;
        }

        if (rec.status == 0) {
            this.addTimeCount = rec.times;
            this.countDownTime += rec.duration;
            this.isCountdown = true;
            this.CountDownImage.fillAmount = 1;
            // this.CountDownImage.color = new Color32(86, 181, 87, 255);
            // this.DOTween.To(x => CountDownImage.fillAmount = x, countDownTime / countDownTime, 0, this.countDownTime).SetEase(Ease.Linear);
            this.UpdateDelayButton();
            this.onChangeTime(this.addTimeCount);
        }


    }

}
