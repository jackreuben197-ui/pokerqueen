
import { Web_User_Room } from "../../net/https/WebRequest";
import GGSlider from "../../ui/component/GGSlider";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { GameCache } from "../GameCache";

const {ccclass, property} = cc._decorator;

export type AddClipsData = {
    bigBlind: number,// 大盲
    smallBlind: number, // 小盲
    currentMinRate: number, // 当前最小带入倍数
    currentMaxRate: number, // 当前最大带入倍数
    totalCoin: number, // 总金豆
    tableChips: number, // 玩家剩余记分牌
    
}

@ccclass
export default class UIBringIn extends UIBasePlus {
    //part1
    cc_Label$title:cc.Label = null;
    cc_Label$coin:cc.Label = null;
    $icon_usdt:cc.Node = null;
    $icon_coin:cc.Node = null;
    //part2
    cc_Label$blind:cc.Label = null;
    cc_Label$blind_d:cc.Label = null;
    cc_Label$buyin:cc.Label = null;
    cc_Label$buyin_d:cc.Label = null;
    //part3
    cc_Label$min:cc.Label = null;
    cc_Label$max:cc.Label = null;
    GGSlider$slider:GGSlider = null;
    //part4
    cc_Label$wallet:cc.Label = null;
    cc_Label$club:cc.Label = null;
    $arrow:cc.Node = null;
    $club_click:cc.Node = null;
    //part5 
    $confirm:cc.Node = null;
    $cancel:cc.Node = null;
    ///////////////////////////
    _param:AddClipsData = null;
    startRate:number = 0;//开始比率
    sendValue:number = 0;//发送值
    gold_type:number = 0;//货币类型
    wallet_status:number = 0;//钱包状态 0未选择 1选择

    wallet:any[] = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.GGSlider$slider.onChange(this.onSliderChange.bind(this));
    }

    onShow(data: AddClipsData): void {
        super.onShow(data);
        //this.animateDialog();
        //this.Total_obj.active = (GameCache.Instance.origin_type != 4);
        this.sendValue = 0;
        
        if (null != data) {
            //小盲值/100
            this.cc_Label$blind.string = `${data.smallBlind / 100}/${data.bigBlind / 100}`;//SB/BB
            this.cc_Label$buyin.string = `${data.bigBlind}`; // Buy-in
            //this.textNeedCoin.string = `${data.bigBlind}`;//Require
            //this.textTotalCoin.string = `${data.totalCoin / 100}`;//Balance
            //当前最大带入
            let currMaxBring = data.currentMaxRate * data.bigBlind - data.tableChips;
            let maxRate = currMaxBring / data.bigBlind ^ 0;
            //边界
            if (maxRate > data.currentMaxRate) {
                maxRate = data.currentMaxRate;
            }
            if (maxRate < data.currentMinRate) {
                maxRate = data.currentMinRate;
            }
            let min = data.currentMinRate / 100 ^ 0;
            let max = maxRate / 100 ^ 0;
            this.startRate = min;
            this.GGSlider$slider.SetMinMax(min, max);
            this.GGSlider$slider.onShow({ index: 0 });
            this.onSliderChange(0);
        }
        this.wallet = Web_User_Room.Response.data.wallet;
        //设置货币类型
        this.gold_type = this.wallet[0].gold_type;
        this.$icon_coin.active = this.gold_type == 1;
        this.$icon_usdt.active = this.gold_type == 2;
        this.$arrow.active = this.wallet.length > 1;
        this.cc_Label$club.string = this.wallet.length == 1 ? this.wallet[0].club_name:"Please select";
        this.wallet_status = this.wallet.length == 1 ? 1: 0;
        this.cc_Label$coin.string = this.wallet.length == 1 ? `${this.wallet[0].gold}`:"0";
    }
    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$confirm,this.onClickConfirm);
        this.setButtonClick(this.$cancel,this.onClickCancel);
        this.setButtonClick(this.$club_click,this.onClickClub);
    }
    /**
     * 滑动条改变触发
     */
    
    onSliderChange(rate:number){

        let showValue = (this.startRate + rate) * this._param.bigBlind;

        this.sendValue = showValue * 100;

        //this.textCoin.string = this.textNeedCoin.string = `${showValue}`;

        // if (this.currValue > GC.data.user.info.gold) {
        //     this.textNeedCoin.node.color = new cc.Color(184, 43, 48, 255);
        // }
        // else {
        //     this.textNeedCoin.node.color = new cc.Color(255, 255, 255, 255);
        // }
    }

    hideUI(){
        UIComponent.Instance.HideUI(PrefabUI.UIBringIn);
    }

    /////////////////////click事件
    //确认
    onClickConfirm(){
        //判断钱包状态
        if(this.wallet_status == 0){
            UIComponent.Instance.Toast("Select");
            return;
        }


        GameCache.Instance.CurGame.AddChips(this.sendValue);
        this.hideUI();
    }
    //取消
    onClickCancel(){
        this.hideUI();
    }
    //公会选择
    onClickClub(){

    }

}
