import SliderPlus from "../../common/SliderPlus";
import { StringHelper } from "../../helper/StringHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { Def, OutsCard } from "../../protobuf/holdem/define_pb";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import { GameCache } from "../GameCache";
import GameUtil from "../util/GameUtil";
import { OutClipsData } from "./UIBringOut";


const { ccclass, property } = cc._decorator;


export class InsuranceData {
    public publicCards: number[];//公共牌
    public triggedDatas: WrapTriggedInsuranceData[];
    public timeLeft: number;//剩余时间
    public delayTimes: number;//已加时次数
}
class PlayerItem {
    //public trans: cc.Node;
    private rc;
    private imageCard0: cc.Sprite;
    private imageCard1: cc.Sprite;
    private imageCard2: cc.Sprite;
    private imageCard3: cc.Sprite;
    private imageCard4: cc.Sprite;
    private imageCard5: cc.Sprite;
    private textNickname: cc.Label;
    private textOuts: cc.Label;

    private imageCards: cc.Sprite[];

    public constructor(public trans: cc.Node) {
        //rc = trans.GetComponent<ReferenceCollector>();
        this.imageCard0 = trans.getChildByName("Image_Card0").getComponent(cc.Sprite);
        this.imageCard1 = trans.getChildByName("Image_Card1").getComponent(cc.Sprite);
        this.imageCard2 = trans.getChildByName("Image_Card2").getComponent(cc.Sprite);
        this.imageCard3 = trans.getChildByName("Image_Card3").getComponent(cc.Sprite);
        this.imageCard4 = trans.getChildByName("Image_Card4").getComponent(cc.Sprite);
        this.imageCard5 = trans.getChildByName("Image_Card5").getComponent(cc.Sprite);

        this.textNickname = trans.getChildByName("Text_Nickname").getComponent(cc.Label);
        this.textOuts = trans.getChildByName("Text_Outs").getComponent(cc.Label);

        this.imageCards = [];
        this.imageCards.push(this.imageCard0);
        this.imageCards.push(this.imageCard1);
        this.imageCards.push(this.imageCard2);
        this.imageCards.push(this.imageCard3);
        this.imageCards.push(this.imageCard4);
        this.imageCards.push(this.imageCard5);

        if (GameUtil.JudgeIsOmahaRoomPath(GameCache.Instance.room_type)) {//奥马哈

            for (let i = 0; i < this.imageCards.length; i++) {
                //this.imageCards[i].transform.localPosition = new Vector3(-48 + i * 32, imageCards[i].transform.localPosition.y);
            }
        }
        else {//非奥马哈
            for (let i = 0; i < 2; i++) {
                //imageCards[i].transform.localPosition = new Vector3(-37 + i * 77, imageCards[i].transform.localPosition.y);
            }

        }
    }
}

class InsuranceCardItem {

    public imageOnSelect: cc.Node;

    public imageInsuranceCard: cc.Node;

    public CardId: number;

    public GoInsuranceCard: cc.Node;

    public IsSelect: boolean;

    public constructor(public trans: cc.Node) {

        this.imageOnSelect = trans.getChildByName("Image_OnSelect");
        this.imageInsuranceCard = trans.getChildByName("Image_InsuranceCard")
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
    public playerCards: number[];//手牌
    public PotUserCount: number;//池内人数
    public PotLeaderCount: number;//池内领先人数
}

class UserOutsCardsData {
    // public overOuts: number[];//反超outs
    // public equalOuts: number[];//平分outs
    public constructor(public overOuts: number[], public equalOuts: number[]) {

    }
}

@ccclass
export default class UIInsurance extends UIBasePlus {

    $public_cards: cc.Node = null;

    $back_click: cc.Node = null;

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


    listPlayerItems: PlayerItem[] = null;

    listInsuranceCardItems: InsuranceCardItem[] = null;

    myWrapTriggedInsuranceData: WrapTriggedInsuranceData = null;

    userOutsCardsData: UserOutsCardsData = null;


    data: InsuranceData = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.listPlayerItems = [];
        this.listInsuranceCardItems = [];
    }

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$back_click, this.click_back);
    }

    onShow(param: any): void {
        super.onShow(param);
        if (param == null) return;
        this.data = param;
        this.UpdatePublicCards();
        this.ShowMultiPoolToggle();
        // ShowCountDown();
        // UpdateDelayButton();
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

    /// <summary>
    /// 刷新保险数据展示
    /// </summary>
    /// <param name="triggedInsuranceData"></param>
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

        //this.UpdatePlayers();
        this.InsuranceCards();

        this.UpdateInsuranceSlider();
        // if (GameCache.Instance.CurGame.smallBlind < 100 || CurrentMostAmount() <= 100) {
        //     sliderInsuranceValue.value = (float)Math.Ceiling((CurrentSecureAmount() / 10f));
        // }
        // else {
        //     sliderInsuranceValue.value = (float)Math.Ceiling((CurrentSecureAmount() / 100f));
        // }

        //     float mTmpOdd = SelectedOdd();
        // textOdds.text = $"1:{mTmpOdd}";
        // textPot.text = $"{myWrapTriggedInsuranceData.pot / (int)100}";
        // textMainPut.text = $"{myWrapTriggedInsuranceData.potTotalCost / (int)100 }";
        // if (GameCache.Instance.CurGame.smallBlind < 100 || CurrentMostAmount() <= 100) {
        //     textInsuranceValue.text = $"{(CurrentSecureAmount() / (int)10 * 10 / 100f)}";
        // }
        // else {
        //     textInsuranceValue.text = $"{Math.Ceiling((CurrentSecureAmount() / 100f))}";
        // }

        // if (GameCache.Instance.CurGame.smallBlind < 100 || CurrentMostAmount() <= 100) {
        //     textPayValue.text = $"{Math.Floor(mTmpOdd * CurrentSecureAmount() / (int)10 * 10 / (float)100)}";
        // }
        // else {
        //     textPayValue.text = $"{Math.Floor(mTmpOdd * Math.Ceiling(CurrentSecureAmount() / (float)100))}";
        // }
    }

    UpdatePlayers() {

    }

    mOutsObjList: cc.Node[] = null;
    LineOutsNum: number = 0;
    pingfenOutsCount: number = 0;
    selectOuts: number = 0;
    // 保险池所有outs 展示
    private InsuranceCards() {

        //let mWrapTriggedInsuranceData: WrapTriggedInsuranceData = this.myWrapTriggedInsuranceData;

        this.listInsuranceCardItems || (this.listInsuranceCardItems = []);

        this.userOutsCardsData.overOuts || (this.userOutsCardsData.overOuts = []);

        this.mOutsObjList = [];

        //Insurance_outs_tipobj = rc.Get<GameObject>("Insurance_outs_tip");
        //Image_line = rc.Get<GameObject>("Image_line");
        for (let i = 0; i < this.userOutsCardsData.overOuts.length; i++) {

            let mGo: cc.Node = cc.instantiate(this.$poker_insurance);
            mGo.active = true;
            mGo.parent = this.$content_insurance;
            let mInsuranceCardItem: InsuranceCardItem = new InsuranceCardItem(mGo);
            this.mOutsObjList.push(mGo);
            mInsuranceCardItem.UpdateItem(this.userOutsCardsData.overOuts[i], true);
            //UIEventListener.Get(mInsuranceCardItem.GoInsuranceCard).onClick = onClickInSuranceCard;
            this.listInsuranceCardItems.push(mInsuranceCardItem);
        }

        if (this.userOutsCardsData.equalOuts?.length > 0) {
            let pinfenIndex = this.userOutsCardsData.overOuts.length % 8;
            if (pinfenIndex > 0) {
                for (let i = 0; i < 8 - pinfenIndex; i++) {
                    let mInsuranceCardItem: InsuranceCardItem = null;
                    let mGo: cc.Node = cc.instantiate(this.$poker_insurance);
                    mGo.active = true;
                    mGo.parent = this.$content_insurance;
                    //mGo.name = (userOutsCardsData.overOuts.Count + i + 1).ToString();
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
                let mGo: cc.Node = cc.instantiate(this.$poker_insurance);
                mGo.active = true;
                mGo.parent = this.$content_insurance;
                //mGo.name = (i + LineOutsNum + userOutsCardsData.overOuts.Count - pinfenIndex).ToString();
                mInsuranceCardItem = new InsuranceCardItem(mGo);
                mInsuranceCardItem.UpdateItem(this.userOutsCardsData.equalOuts[i], true);

                //UIEventListener.Get(mInsuranceCardItem.GoInsuranceCard).onClick = onClickInSuranceCard;
                this.listInsuranceCardItems.push(mInsuranceCardItem);
                this.mOutsObjList.push(mGo);
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

        if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {

            this.SliderPlus$slider.show({
                min_value: this.myWrapTriggedInsuranceData.leastAmount,
                max_value: this.CurrentMostAmount(),
                step: 10,
                change: this.sliderChange,
                own: this
            });
            this.sliderChange(this.myWrapTriggedInsuranceData.leastAmount);
        }
        else {

            this.SliderPlus$slider.show({
                min_value: this.myWrapTriggedInsuranceData.leastAmount,
                max_value: this.CurrentMostAmount(),
                step: 100,
                change: this.sliderChange,
                own: this
            });
            this.sliderChange(this.myWrapTriggedInsuranceData.leastAmount);
        }
    }

    /*
     * 滑动条改变触发
     */
    sliderChange(value: number) {

        //this.sendCoin = value;

        //this.cc_Label$buyin.string = `${this.sendCoin}`;

        //this.refreshSliderTextColor();
        let mTmpOdd = this.SelectedOdd();
        if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {
            this.cc_Label$compen.string = `${mTmpOdd * value}`;
            this.cc_Label$toubao.string = `${value / 100}`;
            // if (value == (float)Math.Ceiling((CurrentSecureAmount() / 10f)))
            // {
            //     HighlightMinBtn();
            // }
            //     else if (arg0 == CurrentMostAmount() / 10) {
            //     HighlightAllBtn();
            // }
            // else {
            //     UnHighlighTwoBtn();
            // }
        }
        else {

            this.cc_Label$compen.string = `${mTmpOdd * value}`;
            this.cc_Label$toubao.string = `${value / 100}`;

            // if (arg0 == (float)Math.Ceiling((CurrentSecureAmount() / 100f)))
            // {
            //     HighlightMinBtn();
            // }
            //     else if (arg0 == CurrentMostAmount() / 100) {
            //     HighlightAllBtn();
            // }
            // else {
            //     UnHighlighTwoBtn();
            // }
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

    private UpdateOuts() {

        this.cc_Label$odds.string = `1:${this.SelectedOdd()}`;

        this.cc_Label$outs.string = `${this.selectOuts}`//${i18nMgr.Get("UIInsurance_zhang")}`;

        if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {
            this.cc_Label$compen.string = `${StringHelper.GetLongString(this.SelectedOdd() * this.SliderPlus$slider.value * 10)}`;
        }
        else {
            this.cc_Label$compen.string = `${StringHelper.GetLongString(this.SelectedOdd() * this.SliderPlus$slider.value * 100)}`;
        }

        if (this.myWrapTriggedInsuranceData.potAllowOutSelection == 1) {
            //Toggle_AllSec.enabled = true;
            if (this.userOutsCardsData.equalOuts != null) {
                if (this.selectOuts != this.userOutsCardsData.overOuts.length + this.userOutsCardsData.equalOuts.length) {
                    let autoInsured = Math.ceil(+this.SliderPlus$slider.value / this.UnSelectedOdd());
                    if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {
                        autoInsured = Math.ceil(+ this.SliderPlus$slider.value / this.UnSelectedOdd()) * 10;
                    }
                    else {
                        autoInsured = Math.ceil(+this.SliderPlus$slider.value / this.UnSelectedOdd()) * 100;
                    }

                    //textTips.text = CPErrorCode.LanguageDescription(20034, new List<object>() { (userOutsCardsData.overOuts.Count + userOutsCardsData.equalOuts.Count - selectOuts), UnSelectedOdd(), autoInsured / 100f});
                }
                else {
                    //textTips.text = "";
                }
            }
            else {
                if (this.selectOuts != this.userOutsCardsData.overOuts.length) {
                    let autoInsured = Math.ceil(+this.SliderPlus$slider.value / this.UnSelectedOdd());
                    if (GameCache.Instance.CurGame.smallBlind < 100 || this.CurrentMostAmount() <= 100) {
                        autoInsured = Math.ceil(+this.SliderPlus$slider.value / this.UnSelectedOdd()) * 10;
                    }
                    else {
                        autoInsured = Math.ceil(+this.SliderPlus$slider.value / this.UnSelectedOdd()) * 100;
                    }

                    //textTips.text = CPErrorCode.LanguageDescription(20034, new List<object>() { (userOutsCardsData.overOuts.Count - selectOuts), UnSelectedOdd(), autoInsured / 100f});
                }
                else {
                    //textTips.text = "";
                }
            }
        }
        else {
            //Toggle_AllSec.enabled = false;

            // textTips.text = CPErrorCode.LanguageDescription(20035);
        }
        let mInsuredCards = [];

        let mInsuranceCardItem: InsuranceCardItem = null;
        for (let i = 0; i < this.listInsuranceCardItems.length; i++) {
            mInsuranceCardItem = this.listInsuranceCardItems[i];
            if (null == mInsuranceCardItem || !mInsuranceCardItem.IsSelect || mInsuranceCardItem.CardId < 0) continue;
            mInsuredCards.push(mInsuranceCardItem.CardId);
        }
        if (this.listInsuranceCardItems.length == mInsuredCards.length) {
            //Toggle_AllSec.isOn = true;
        }
    }
    private click_back() {
        UIComponent.Instance.HideUI(PrefabUI.UIInsurance);
    }
}
