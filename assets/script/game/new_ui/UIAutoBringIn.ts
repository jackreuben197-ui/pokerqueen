
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import { WalletType } from "../../lobby/new_club/pay/UIWalletLayer";
import WalletModel from "../../lobby/new_club/pay/WalletModel";
import { Web_User_Room } from "../../net/https/WebRequest";
import GGASCom from "../../ui/component/GGASCom";
import GGSlider from "../../ui/component/GGSlider";
import GGToggle from "../../ui/component/GGToggle";
import UICommonDialog from "../../ui/dialog/UICommonDialog";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import { AddClipsData } from "./UIBringIn";
import UIClubWalletList from "./UIClubWalletList";

const { ccclass, menu } = cc._decorator;



@ccclass
@menu('脚本分组/game/new_ui/UIAutoBringIn')
export default class UIAutoBringIn extends UIBasePlus {
    //part1
    $Part1: cc.Node = null;
    cc_Label$title: cc.Label = null;
    cc_Label$coin: cc.Label = null;
    $icon_usdt: cc.Node = null;
    $icon_coin: cc.Node = null;
    //part2
    // cc_Label$blind: cc.Label = null;
    // cc_Label$blind_d: cc.Label = null;
    // cc_Label$buyin: cc.Label = null;
    // cc_Label$buyin_d: cc.Label = null;
    GGToggle$auto: GGToggle = null;
    GGToggle$account: GGToggle = null;
    GGASCom$com: GGASCom = null;
    //part3
    $Part3: cc.Node = null;
    cc_Label$min: cc.Label = null;
    cc_Label$max: cc.Label = null;
    cc_Label$value: cc.Label = null;
    GGSlider$slider: GGSlider = null;
    //part4
    $Part4: cc.Node = null;
    cc_Label$wallet: cc.Label = null;
    cc_Label$club: cc.Label = null;
    $arrow: cc.Node = null;
    $club_click: cc.Node = null;
    //part5 
    $confirm: cc.Node = null;
    $cancel: cc.Node = null;
    ///////////////////////////
    _param: { data: AddClipsData, fromMenu: boolean } = null;
    startRate: number = 0;//开始比率
    sendCoin: number = 0;//发送货币值
    ownCoin: number = 0;//拥有的货币值
    gold_type: number = 0;//货币类型


    wallet_mode: number = 0; //钱包模式 0:无钱包 1:1个钱包 2:多个钱包
    wallet_status: number = 0;//钱包状态 0未选择 1选择

    selected_wallet: any = null;//选中的钱包

    wallet: any[] = null;

    //显示状态，设置位置和适配 
    //0:无钱包剩余和钱包选择和无滑动条
    //1:
    show_status:number = 0;



    protected lateLoad(): void {
        super.lateLoad();
        this.GGSlider$slider.onChange(this.onSliderChange.bind(this));
    }

    onShow(param: { data: AddClipsData, fromMenu: boolean }): void {
        super.onShow(param);
        let data: AddClipsData = param.data;
        //this.$Part3.active = !param.fromMenu;
        //this.animateDialog();
        //this.Total_obj.active = (GameCache.Instance.origin_type != 4);
        this.ownCoin = 0;
        this.wallet = Web_User_Room.Response.data.wallet;
        //test
        //this.wallet.push({club_id:33,gold:1});
        if (!this.wallet?.length) this.wallet_mode = 0;
        if (this.wallet?.length == 1) this.wallet_mode = 1;
        if (this.wallet?.length == 2) this.wallet_mode = 2;

        if (this.wallet_mode == 0) {
            this.$Part1.active = false;
            this.$Part4.active = false;
        } else {
            this.$Part1.active = true;
            this.$Part4.active = true;
            //设置货币类型
            this.gold_type = this.wallet[0].gold_type;
            this.$icon_coin.active = this.gold_type == 1;
            this.$icon_usdt.active = this.gold_type == 2;
            this.$arrow.active = this.wallet_mode > 1;
            this.$club_click.active = this.wallet_mode > 1;
            this.refreshSelect(this.wallet_mode == 1 ? 0 : -1);
        }
        if (null != data) {
            //小盲值/100
            //this.cc_Label$blind.string = `${data.smallBlind / 100}/${data.bigBlind / 100}`;//SB/BB
            //this.cc_Label$buyin.string = `${data.bigBlind}`; // Buy-in
            //this.textNeedCoin.string = `${data.bigBlind}`;//Require
            //this.textTotalCoin.string = `${data.totalCoin / 100}`;//Balance
            //当前最大带入 currentMaxRate是乘过100 ， tableChips是乘过100
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

            //com
            this.GGASCom$com.data = {
                min: this.sendCoin,
                max: currMaxBring/100,
                step: data.bigBlind,
                value: this.sendCoin,
            }
        }
        //toggle
        this.GGToggle$auto.uncheck();
        this.GGToggle$account.uncheck();
        //根据显示状态设置位置和适配
        //this.show_status 
        this.$Part1.active = !(param.fromMenu || this.wallet_mode == 0);
        this.$Part4.active = !(param.fromMenu || this.wallet_mode == 0);
        this.$Part3.active = !param.fromMenu;
        this.GGToggle$account.node.active = !(this.wallet_mode == 0);
    }
    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$confirm, this.onClickConfirm);
        this.setButtonClick(this.$cancel, this.onClickCancel);
        this.setButtonClick(this.$club_click, this.onClickClub);
    }
    /**
     * 滑动条改变触发
     */

    onSliderChange(rate: number) {

        this.sendCoin = (this.startRate + rate) * this._param.data.bigBlind;

        this.cc_Label$value.string = `${this.sendCoin}`;

        //this.cc_Label$buyin.string = `${this.sendCoin}`;

        if (this.wallet_mode > 0) {
            //颜色处理
            this.cc_Label$value.node.color = cc.Color.BLACK.fromHEX(this.sendCoin < this.ownCoin ? "#EEF5FF" : "#ee8380");
        }
    }

    hideUI() {
        UIComponent.Instance.HideUI(PrefabUI.UIAutoBringIn);
    }

    //打开钱包列表
    goWalletList() {
        console.log("goWalletList");
        UIComponent.open(UIDefine.UIClubWalletList, {
            data: this.wallet,
            selected_wallet: this.selected_wallet,
            own: this
        });
    }
    //打开充值
    goCharge() {
        console.log("goCharge");
        WalletModel.Instance.club_id = this.selected_wallet.club_id;
        UIComponent.open(UIDefine.UIPayLayer, { type: 1, walletType: WalletType.Club });
        this.hideUI();
    }
    refreshSelect(index: number) {
        this.selected_wallet = this.wallet[index];
        if (index == -1) {
            this.cc_Label$club.string = "Please select";
            this.ownCoin = 0;
        } else {
            this.cc_Label$club.string = this.selected_wallet.club_name;
            this.ownCoin = (this.selected_wallet.gold - GC.game.mainPlayer.chips) / 100;
        }
        this.cc_Label$coin.string = `${this.ownCoin}`;
    }

    /////////////////////click事件
    //确认
    onClickConfirm() {
        //有钱包的模式
        if (this.wallet_mode > 0) {
            //判断钱包状态
            if (this.selected_wallet == null) {
                UIComponent.Instance.Toast("Select");
                return;
            }
            //判断余额不足
            if (this.sendCoin > this.ownCoin) {

                let dialog_param: typeof UICommonDialog.type = null;
                if (this.wallet.length == 1) {
                    dialog_param = {
                        status: 1,
                        detail: "钱包金额不足",
                        texts: ["充值"],
                        callbacks: [this.goCharge],
                        this: this
                    }
                } else {
                    dialog_param = {
                        status: 2,
                        detail: "钱包金额不足",
                        texts: ["其他支付", "充值"],
                        callbacks: [this.goWalletList, this.goCharge],
                        this: this
                    }
                }
                UIComponent.open(UIDefine.UICommonDialog, dialog_param);
                return;
            }
        }

        if (this._param.fromMenu) {
            GameCache.Instance.CurGame.SetAutoOnTableChips(Math.ceil(this.GGASCom$com.value * 100), this.GGToggle$account.isCheck);
        } else {
            GameCache.Instance.CurGame.AddChips(Math.ceil(this.sendCoin * 100), Math.ceil(this.GGASCom$com.value * 100), this.GGToggle$account.isCheck);
        }
        this.hideUI();
    }
    //取消
    onClickCancel() {
        this.hideUI();
    }
    //公会选择
    onClickClub() {
        UIComponent.open(UIDefine.UIClubWalletList, {
            data: this.wallet,
            selected_wallet: this.selected_wallet,
            own: this
        });
    }
}
