/**
 * 坐下弹出面板
 */

import { StringHelper } from "../../helper/StringHelper";
import GGSlider from "../../ui/component/GGSlider";
import UIBase from "../../ui/UIBase";
import {GameCache} from "../GameCache";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIAddChipsComponent extends UIBase {

    ///////////////////////////////////
    /**
     * 节点|组件 定义
     */
    private textBlind: cc.Label = null;
    private textCoin: cc.Label = null;
    private textTotalCoin: cc.Label = null;
    private textNeedCoin: cc.Label = null;


    private Button_Close: cc.Node = null;
    private Button_Commit: cc.Node = null;
    private Image_Mask: cc.Node = null;
    ////////////////////////////////////////

    sliderCoin: GGSlider = null;
    imageDialog: cc.Node = null;

    //数据接口
    AddClipsData: {
        bigBlind: number,// 大盲
        smallBlind: number, // 小盲
        currentMinRate: number, // 当前最小带入倍数
        currentMaxRate: number, // 当前最大带入倍数
        totalCoin: number, // 总金豆
        tableChips: number, // 玩家剩余记分牌
    } = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.textBlind = this.getChildNodeOrComponent("Text_Blind", cc.Label);
        this.textCoin = this.getChildNodeOrComponent("Text_Coin", cc.Label);
        this.textTotalCoin = this.getChildNodeOrComponent("Text_TotalCoin", cc.Label);
        this.textNeedCoin = this.getChildNodeOrComponent("Text_NeedCoin", cc.Label);
        this.imageDialog = this.getChildNodeOrComponent("Image_Dialog");
        this.Button_Close = this.getChildNodeOrComponent("Button_Close");
        this.Image_Mask = this.getChildNodeOrComponent("Image_Mask");
        this.Button_Commit = this.getChildNodeOrComponent("Button_Commit");

        this.sliderCoin = this.getChildNodeOrComponent("Slider_Coin", GGSlider);
        this.sliderCoin.onChange(this.onValueChangedSliderCoin.bind(this));


    }
    protected regiterTouchEvents(): void {
        this.Button_Close.on("click", this.onClickClose, this);
        this.Image_Mask.on("click", this.onClickClose, this);
        this.Button_Commit.on("click", this.onClickCommit, this);
    }
    onShow(addClipsData?: typeof this.AddClipsData): void {
        super.onShow(addClipsData);
        this.animateDialog();
        if (null != addClipsData) {
            this.textBlind.string = `${StringHelper.getStringDiv100(addClipsData.smallBlind)}/${StringHelper.getStringDiv100(addClipsData.bigBlind)}`;
            this.textCoin.string = `${GameCache.Instance.carry_small}`;
            this.textNeedCoin.string = `${StringHelper.getStringDiv100(addClipsData.currentMinRate * GameCache.Instance.carry_small ^ 0)}`;
            this.textTotalCoin.string = `${StringHelper.getStringDiv100(addClipsData.totalCoin)}`;

            let currentMaxBring: number = (addClipsData.currentMaxRate) * GameCache.Instance.carry_small - addClipsData.tableChips;
            let maxRate: number = currentMaxBring / GameCache.Instance.carry_small;
            if (maxRate > addClipsData.currentMaxRate) {
                maxRate = addClipsData.currentMaxRate;
            }
            if (maxRate < addClipsData.currentMinRate) {
                maxRate = addClipsData.currentMinRate;
            }

            this.sliderCoin.maxValue = maxRate / 100;
            this.sliderCoin.minValue = addClipsData.currentMinRate / 100;
            this.sliderCoin.value = addClipsData.currentMinRate / 100;
            this.onValueChangedSliderCoin(addClipsData.currentMinRate / 100);
            //this.sliderCoin.wholeNumbers = true;

        }
        this.textTotalCoin.string = `${StringHelper.getStringDiv100(addClipsData.totalCoin)}`;
    }
    animateDialog() {
        this.imageDialog.scale = 0;
        cc.tween(this.imageDialog).to(.2, { scale: 1 }, cc.easeBackOut()).start();
    }
    /**
     * 滑动条改变触发
     */
    onValueChangedSliderCoin(rate: number) {
        this.textCoin.string = `${StringHelper.getStringDiv100(rate * GameCache.Instance.carry_small * 100 ^ 0)}`;
        this.textNeedCoin.string = `${StringHelper.getStringDiv100(rate * GameCache.Instance.carry_small * 100 ^ 0)}`;

        if (rate * GameCache.Instance.carry_small * 100 > GameCache.Instance.gold) {
            this.textNeedCoin.node.color = new cc.Color(184, 43, 48, 255);
        }
        else {
            this.textNeedCoin.node.color = new cc.Color(255, 255, 255, 255);
        }
    }
    private onClickCommit() {

        let mAnteNumber = (+this.textCoin.string) * 100;
        GameCache.Instance.CurGame.AddChips(mAnteNumber);
        this.hideUI();
    }
    /**
     * 隐藏界面
     */
    onClickClose() {
        this.hideUI();
    }

    public hideUI() {
        this.node.active = false;
    }
}
