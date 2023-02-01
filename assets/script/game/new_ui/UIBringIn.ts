
import { UIDefine } from "../../define/UIDefine";
import { WalletType } from "../../lobby/new_club/pay/UIWalletLayer";
import WalletModel from "../../lobby/new_club/pay/WalletModel";
import { Web_User_Room } from "../../net/https/WebRequest";
import GGSlider from "../../ui/component/GGSlider";
import UICommonDialog from "../../ui/dialog/UICommonDialog";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import UIClubWalletList from "./UIClubWalletList";

const {ccclass, menu} = cc._decorator;

export type AddClipsData = {
    bigBlind: number,// 大盲
    smallBlind: number, // 小盲
    currentMinRate: number, // 当前最小带入倍数
    currentMaxRate: number, // 当前最大带入倍数
    //totalCoin: number, // 总金豆
    tableChips: number, // 玩家剩余记分牌
    
}

@ccclass
@menu('脚本分组/game/new_ui/UIBringIn')
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
    cc_Label$value:cc.Label = null;
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
    sendCoin:number = 0;//发送货币值
    ownCoin:number = 0;//拥有的货币值
    gold_type:number = 0;//货币类型
    wallet_status:number = 0;//钱包状态 0未选择 1选择

    selected_wallet:any = null;//选中的钱包

    wallet:any[] = null;



    protected lateLoad(): void {
        super.lateLoad();
        this.GGSlider$slider.onChange(this.onSliderChange.bind(this));
    }

    onShow(data: AddClipsData): void {
        super.onShow(data);
        //this.animateDialog();
        //this.Total_obj.active = (GameCache.Instance.origin_type != 4);
        this.ownCoin = 0;
        this.wallet = Web_User_Room.Response.data.wallet;
        //test
        //this.wallet.push({club_id:33,gold:1});
        //设置货币类型
        this.gold_type = this.wallet[0].gold_type;
        this.$icon_coin.active = this.gold_type == 1;
        this.$icon_usdt.active = this.gold_type == 2;
        this.$arrow.active = this.wallet.length > 1;
        this.refreshSelect(this.wallet.length == 1?0:-1);

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
        }
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

        this.sendCoin = (this.startRate + rate) * this._param.bigBlind;

        this.cc_Label$value.string = `${this.sendCoin}`;

        //颜色处理
        
        this.cc_Label$value.node.color = cc.Color.BLACK.fromHEX(this.sendCoin < this.ownCoin  ? "#EEF5FF":"#ee8380");
        
        //console.log("设置颜色",this.sendCoin,this.ownCoin);
    }

    hideUI(){
        UIComponent.Instance.HideUI(PrefabUI.UIBringIn);
    }

    //打开钱包列表
    goWalletList(){
        console.log("goWalletList");
        UIComponent.open(UIDefine.UIClubWalletList,{
            data:this.wallet,
            selected_wallet:this.selected_wallet,
            own:this
        });
    }
    //打开充值
    goCharge(){
        console.log("goCharge");
        WalletModel.Instance.club_id = this.selected_wallet.club_id;
        UIComponent.open(UIDefine.UIPayLayer, { type: 1, walletType: WalletType.Club });
        this.hideUI();
    }
    refreshSelect(index:number){
        this.selected_wallet = this.wallet[index];
        if(index == -1){
            this.cc_Label$club.string = "Please select";
            this.ownCoin = 0;
        }else{
            this.cc_Label$club.string = this.selected_wallet.club_name;
            this.ownCoin = this.selected_wallet.gold;
        }
        this.cc_Label$coin.string = `${this.ownCoin}`;
    }
    
    /////////////////////click事件
    //确认
    onClickConfirm(){
        //判断钱包状态
        if(this.selected_wallet == null){
            UIComponent.Instance.Toast("Select");
            return;
        }
        //判断余额不足
        if(this.sendCoin > this.ownCoin){
            
            let dialog_param:typeof UICommonDialog.type = null;
            if(this.wallet.length == 1){
                dialog_param = {
                    status:1,
                    detail:"钱包金额不足",
                    texts:["充值"],
                    callbacks:[this.goCharge],
                    this:this
                }
            }else{
                dialog_param = {
                    status:2,
                    detail:"钱包金额不足",
                    texts:["其他支付","充值"],
                    callbacks:[this.goWalletList,this.goCharge],
                    this:this
                }
            }
            UIComponent.open(UIDefine.UICommonDialog,dialog_param);
            return;
        }
        GameCache.Instance.CurGame.AddChips(this.sendCoin*100);
        this.hideUI();
    }
    //取消
    onClickCancel(){
        this.hideUI();
    }
    //公会选择
    onClickClub(){
        UIComponent.open(UIDefine.UIClubWalletList,{
            data:this.wallet,
            selected_wallet:this.selected_wallet,
            own:this
        });
    }
}
