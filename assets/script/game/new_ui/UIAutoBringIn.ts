
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import { WalletType } from "../../lobby/new_club/wallet/UIWallet";
import WalletModel from "../../lobby/new_club/wallet/WalletModel";
import { Web_User_Room } from "../../net/https/WebRequest";
import GGASCom from "../../ui/component/GGASCom";
import GGSlider from "../../ui/component/GGSlider";
import GGToggle from "../../ui/component/GGToggle";
import UICommonDialog from "../../ui/dialog/UICommonDialog";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import GameUtil from "../util/GameUtil";
import { AddClipsData } from "./UIBringIn";


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
    show_status: number = 0;

    //滑动条 数据对象
    slider_obj = {
        min: 0,
        max: 0,
        step: 0
    };

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
            //最大带入值
            let auto_max = data.currentMaxRate * data.bigBlind / 100;

            //最大带入值
            let max = (data.currentMaxRate * data.bigBlind - data.tableChips) / 100;
            let min = data.currentMinRate * data.bigBlind / 100;
            max = Math.max(min, max);
            this.slider_obj.min = min;
            this.slider_obj.max = max;
            this.slider_obj.step = data.bigBlind / 10;
            this.GGSlider$slider.data = this.slider_obj;

            this.GGSlider$slider.onShow({ index: 0 });

            //com
            this.GGASCom$com.data = {
                min: min,
                max: auto_max,
                step: data.bigBlind,
                value: min,
            }
        }
        //toggle
        this.GGToggle$auto.own = this;
        this.GGToggle$auto.uncheck();
        this.GGToggle$account.uncheck();

        //根据显示状态设置位置和适配
        //this.show_status 
        this.$Part1.active = !(param.fromMenu || this.wallet_mode == 0);
        this.$Part4.active = !(param.fromMenu || this.wallet_mode == 0);
        this.$Part3.active = !param.fromMenu;
        this.GGToggle$account.node.active = !(this.wallet_mode == 0);
    }
    change(boo: boolean) {
        this.GGASCom$com.use = boo;
        console.log("激活：", boo);
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

        this.sendCoin = this.slider_obj.min + this.slider_obj.step * rate;

        this.sendCoin = Math.min(this.sendCoin, this.slider_obj.max);

        this.cc_Label$value.string = `${this.sendCoin}`;

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

        UIComponent.open(UIDefine.UIClubWalletList, {
            data: this.wallet,
            selected_wallet: this.selected_wallet,
            own: this
        });
    }
    //打开充值
    goCharge() {

        UIComponent.open(UIDefine.UIRecharge, { type: 1, walletType: WalletType.Club });
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

        if (GameUtil.GetFriendsOrClubTable() == 3 && this.selected_wallet == null) {
            UIComponent.Instance.ToastLanguage("UILogin_Select");
            return;
        }

        // //有钱包的模式
        // if (this.wallet_mode > 0) {
        //     //判断钱包状态
        //     if (this.selected_wallet == null) {
        //         UIComponent.Instance.Toast("Select");
        //         return;
        //     }
        //     //判断余额不足
        //     if (this.sendCoin > this.ownCoin) {

        //         let dialog_param: typeof UICommonDialog.type = null;
        //         if (this.wallet.length == 1) {
        //             dialog_param = {
        //                 status: 1,
        //                 detail: "钱包金额不足",
        //                 texts: ["充值"],
        //                 callbacks: [this.goCharge],
        //                 this: this
        //             }
        //         } else {
        //             dialog_param = {
        //                 status: 2,
        //                 detail: "钱包金额不足",
        //                 texts: ["其他支付", "充值"],
        //                 callbacks: [this.goWalletList, this.goCharge],
        //                 this: this
        //             }
        //         }
        //         UIComponent.open(UIDefine.UICommonDialog, dialog_param);
        //         return;
        //     }
        // }

        //判断自动上桌是否勾选
        let auto_100 = this.GGToggle$auto.isCheck ? this.GGASCom$com.value * 100 : 0;
        let coin_100 = this.sendCoin * 100;
        let accountCheck = this.GGToggle$account.isCheck;

        if (this._param.fromMenu) {

            GameCache.Instance.CurGame.SetAutoOnTableChips(auto_100, accountCheck);
        } else {

            if (GameUtil.GetFriendsOrClubTable() == 3) {
                GameCache.Instance.CurGame.AddChips(coin_100, auto_100, accountCheck, this.selected_wallet.club_id, this.selected_wallet.club_random_id);
            }
            else {
                GameCache.Instance.CurGame.AddChips(coin_100, auto_100, accountCheck);
            }
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
