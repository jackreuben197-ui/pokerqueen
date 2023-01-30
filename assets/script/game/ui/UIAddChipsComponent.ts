/**
 * 坐下弹出面板
 */

import GC from "../../frame/GameControl";
import { StringHelper } from "../../helper/StringHelper";
import GGSlider from "../../ui/component/GGSlider";
import UIBase from "../../ui/UIBase";
import { GameCache } from "../GameCache";
import { UITexasModel } from "../UITexasModel";
import { AddClipsData } from "./UIBringIn";



const { ccclass } = cc._decorator;

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

    //带入金豆和总金豆 节点（朋友桌不显示）
    private Total_obj: cc.Node = null;
    ////////////////////////////////////////

    sliderCoin: GGSlider = null;
    imageDialog: cc.Node = null;

    //参数类型
    protected _param: AddClipsData;
    //开始倍数
    private startRate: number = 0;

    private currValue: number = 0;

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

        this.Total_obj = this.getChildNodeOrComponent("Total_obj");


        this.sliderCoin = this.getChildNodeOrComponent("Slider_Coin", GGSlider);
        this.sliderCoin.onChange(this.onValueChangedSliderCoin.bind(this));
    }
    protected regiterTouchEvents(): void {
        this.Button_Close.on("click", this.onClickClose, this);
        this.Image_Mask.on("click", this.onClickClose, this);
        this.Button_Commit.on("click", this.onClickCommit, this);
    }
    onShow(addClipsData?: AddClipsData): void {
        super.onShow(addClipsData);
        this.animateDialog();
        this.Total_obj.active = (GameCache.Instance.origin_type != 4);
        if (null != addClipsData) {
            //小盲值/100
            this.textBlind.string = `${addClipsData.smallBlind / 100}/${addClipsData.bigBlind / 100}`;//SB/BB
            this.textCoin.string = `${addClipsData.bigBlind}`; // Buy-in
            this.textNeedCoin.string = `${addClipsData.bigBlind}`;//Require
            this.textTotalCoin.string = `${addClipsData.totalCoin / 100}`;//Balance
            //当前最大带入
            let currMaxBring = addClipsData.currentMaxRate * addClipsData.bigBlind - addClipsData.tableChips;
            let maxRate = currMaxBring / addClipsData.bigBlind ^ 0;
            //边界
            if (maxRate > addClipsData.currentMaxRate) {
                maxRate = addClipsData.currentMaxRate;
            }
            if (maxRate < addClipsData.currentMinRate) {
                maxRate = addClipsData.currentMinRate;
            }
            let min = addClipsData.currentMinRate / 100 ^ 0;
            let max = maxRate / 100 ^ 0;
            this.startRate = min;
            this.sliderCoin.SetMinMax(min, max);
            this.sliderCoin.onShow({ index: 0 });
            this.onValueChangedSliderCoin(0);

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

        let showValue = (this.startRate + rate) * this._param.bigBlind;

        this.currValue = showValue * 100;

        this.textCoin.string = this.textNeedCoin.string = `${showValue}`;

        if (this.currValue > GC.data.user.info.gold) {
            this.textNeedCoin.node.color = new cc.Color(184, 43, 48, 255);
        }
        else {
            this.textNeedCoin.node.color = new cc.Color(255, 255, 255, 255);
        }
    }
    private onClickCommit() {
        GameCache.Instance.CurGame.AddChips(this.currValue);
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
