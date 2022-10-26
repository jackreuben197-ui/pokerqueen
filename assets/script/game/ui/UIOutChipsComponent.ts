/**
 * 坐下弹出面板
 */

import { StringHelper } from "../../helper/StringHelper";
import GGSlider from "../../ui/component/GGSlider";
import UIBase from "../../ui/UIBase";
import { GameCache } from "../GameCache";


export type OutClipsData = {
    currentMinRate: number,// 当前最小倍数
    tableChips: number// 玩家剩余记分牌
}

const { ccclass } = cc._decorator;

@ccclass
export default class UIOutChipsComponent extends UIBase {

    ///////////////////////////////////
    /**
     * 节点|组件 定义
     */
    private textBlind: cc.Label = null;
    private textCoin: cc.Label = null;
    private textTotalCoin: cc.Label = null;
    private textNeedCoin: cc.Label = null;


    private Button_Close: cc.Node = null;
    private Button_Commit: cc.Button = null;
    private Image_Mask: cc.Node = null;
    ////////////////////////////////////////

    sliderCoin: GGSlider = null;
    imageDialog: cc.Node = null;

    private outClipsData: OutClipsData = null;
    private CurMinOutBeans: number;//当前最小带出记分牌
    private Curmultiple: number;//当前倍数
    private MaxRate: number;//最大滑动个数


    protected lateLoad(): void {
        super.lateLoad();
        this.textBlind = this.getChildNodeOrComponent("Text_Blind", cc.Label);
        this.textCoin = this.getChildNodeOrComponent("Text_Coin", cc.Label);
        this.textTotalCoin = this.getChildNodeOrComponent("Text_TotalCoin", cc.Label);
        this.textNeedCoin = this.getChildNodeOrComponent("Text_NeedCoin", cc.Label);
        this.imageDialog = this.getChildNodeOrComponent("Image_Dialog");
        this.Button_Close = this.getChildNodeOrComponent("Button_Close");
        this.Image_Mask = this.getChildNodeOrComponent("Image_Mask");
        this.Button_Commit = this.getChildNodeOrComponent("Button_Commit", cc.Button);

        this.sliderCoin = this.getChildNodeOrComponent("Slider_Coin", GGSlider);
        this.sliderCoin.onChange(this.onValueChangedSliderCoin.bind(this));
    }
    protected regiterTouchEvents(): void {
        this.Button_Close.on("click", this.onClickClose, this);
        this.Image_Mask.on("click", this.onClickClose, this);
        this.Button_Commit.node.on("click", this.onClickCommit, this);
    }
    onShow(outClipsData?: OutClipsData): void {
        super.onShow(outClipsData);
        this.outClipsData = outClipsData;
        this.animateDialog();
        if (null != outClipsData) {

            this.CurMinOutBeans = GameCache.Instance.carry_small * outClipsData.currentMinRate;


            let currentMaxBring: number = ((outClipsData.tableChips / 100 ^ 0) - (GameCache.Instance.carry_small / 100 ^ 0) * outClipsData.currentMinRate);

            let maxRate: number = 0;

            if (currentMaxBring > 10 && currentMaxBring < 1000) {
                maxRate = currentMaxBring / 10 ^ 0;
                this.Curmultiple = 10;
                this.Button_Commit.interactable = true;
            }
            else if (currentMaxBring > 1000 && currentMaxBring < 10000) {
                maxRate = currentMaxBring / 100 ^ 0;
                this.Curmultiple = 100;
                this.Button_Commit.interactable = true;
            }
            else if (currentMaxBring > 10000) {
                maxRate = currentMaxBring / 1000 ^ 0;
                this.Curmultiple = 1000;
                this.Button_Commit.interactable = true;
            }
            else {
                maxRate = 0;
                this.CurMinOutBeans = 0;
                this.Button_Commit.interactable = false;
                this.textCoin.string = "0";
            }
            //if (maxRate > addClipsData.currentMaxRate)
            //{
            //    maxRate = addClipsData.currentMaxRate;
            //}
            //if (maxRate < addClipsData.currentMinRate)
            //{
            //    maxRate = addClipsData.currentMinRate;
            //}
            this.MaxRate = maxRate;
            this.sliderCoin.SetMinMax(0, maxRate)
            this.sliderCoin.onShow({ index: 0 });
            this.onValueChangedSliderCoin(0);
            // this.sliderCoin.maxValue = maxRate;
            // this.sliderCoin.minValue = 0;
            // this.sliderCoin.value = 0;
        }
    }
    animateDialog() {
        this.imageDialog.scale = 0;
        cc.tween(this.imageDialog).to(.2, { scale: 1 }, cc.easeBackOut()).start();
    }
    /**
     * 滑动条改变触发
     */
    onValueChangedSliderCoin(rate: number) {

        if (this.MaxRate == rate && this.MaxRate > 0) {
            this.textCoin.string = `${StringHelper.getStringDiv100(this.outClipsData.tableChips / 100 * 100 - this.CurMinOutBeans)}`;
        }
        else if (this.outClipsData.tableChips > this.CurMinOutBeans * 2) {
            if ((rate) * this.Curmultiple > this.CurMinOutBeans) {
                this.textCoin.string = `${StringHelper.getStringDiv100(rate * this.Curmultiple * 100)}`;
            }
            else {
                this.textCoin.string = `${StringHelper.getStringDiv100(this.CurMinOutBeans + rate * this.Curmultiple * 100)}`;
            }
        }
        else if (this.outClipsData.tableChips <= this.CurMinOutBeans * 2 && this.outClipsData.tableChips > this.CurMinOutBeans) {
            this.textCoin.string = `${StringHelper.getStringDiv100(this.outClipsData.tableChips / 100 * 100 - this.CurMinOutBeans)}`;
        }

    }
    private onClickCommit() {

        // let mAnteNumber = (+this.textCoin.string) * 100;
        // GameCache.Instance.CurGame.AddChips(mAnteNumber);
        // this.hideUI();
        let mAnteNumber = + this.textCoin.string;
        if (mAnteNumber == 0) {
            return;
        }
        GameCache.Instance.CurGame.OutChips(mAnteNumber * 100);
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
