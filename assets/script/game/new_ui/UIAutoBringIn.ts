
import SliderPlus from "../../common/SliderPlus";
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import { StringHelper } from "../../helper/StringHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { WalletType } from "../../config/TexasConfig";
import WalletModel from "../../lobby/new_club/wallet/WalletModel";
import { WebUserRoom } from "../../net/https/WebRequest";
import GGASCom from "../../ui/component/GGASCom";
import GGSlider from "../../ui/component/GGSlider";
import GGToggle from "../../ui/component/GGToggle";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import GameUtil from "../util/GameUtil";
import { AddClipsData } from "./UIBringIn";


const { ccclass, menu } = cc._decorator;


// public sealed class SetAutoAddClipsData {
//     public ulong bigBlind { get; set; } // 大盲
//     public ulong smallBlind { get; set; } // 小盲
//     public ulong currentMinRate { get; set; } // 当前最小带入倍数
//     public ulong currentMaxRate { get; set; } // 当前最大带入倍数
//     public double totalCoin { get; set; } // 总金豆
//     public ulong tableChips { get; set; } // 玩家剩余记分牌
//     public ulong storeChips { get; set; } // 藏钱记分牌
//     public bool isFromSetting { get; set; }//是否来自设置界面
//     public List < WebUserRoom.Wallet > wallets { get; set; }//钱包列表
// }


export type SetAutoAddClipsData = {
    bigBlind: number,// 大盲
    smallBlind: number, // 小盲
    currentMinRate: number, // 当前最小带入倍数
    currentMaxRate: number, // 当前最大带入倍数
    totalCoin?: number, // 总金豆
    tableChips: number, // 玩家剩余记分牌
    storeChips: number, // 藏钱记分牌
    isFromSetting?: boolean,//是否来自设置界面
    wallets?: any,//钱包列表
    /** 直接指定最小带入（已含蘑菇押金），单位与 bigBlind 一致 */
    minBringIn?: number,
}





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
    //cc_Label$value: cc.Label = null;
    //GGSlider$slider: GGSlider = null;
    SliderPlus$slider: SliderPlus = null;
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
    _param: SetAutoAddClipsData = null;
    startRate: number = 0;//开始比率
    sendCoin: number = 0;//发送货币值
    ownCoin: number = 0;//拥有的货币值
    gold_type: number = 0;//货币类型


    wallet_mode: number = 0; //钱包模式 0:无钱包 1:1个钱包 2:多个钱包
    wallet_status: number = 0;//钱包状态 0未选择 1选择

    selected_wallet: any = null;//选中的钱包

    wallets: any[] = null;

    //显示状态，设置位置和适配 
    //0:无钱包剩余和钱包选择和无滑动条
    //1:
    show_status: number = 0;

    //滑动条 数据对象
    slider_obj = {
        min: 0,
        max: 0,
        step: 1
    };

    protected lateLoad(): void {
        super.lateLoad();
    }

    onShow(data: SetAutoAddClipsData): void {
        super.onShow(data);
        //this.animateDialog();

        if (data != null) {

            this.selected_wallet = null;
            this.ownCoin = 0;
            this.wallets = data.wallets;

            //隐藏滑动条
            this.$Part3.active = !data.isFromSetting;

            //小盲值/100
            //最大带入值
            let auto_max = data.currentMaxRate * data.bigBlind / 100;

            //最大带入值
            let max = (data.currentMaxRate * data.bigBlind - data.tableChips) / 100;
            let min = data.minBringIn != null
                ? data.minBringIn / 100
                : data.currentMinRate * data.bigBlind / 100;
            max = Math.max(min, max);


            this.SliderPlus$slider.show({
                min_value: min,
                max_value: max,
                step: data.bigBlind / 10,
                change: this.sliderChange,
                own: this,
            });
            this.sliderChange(min);

            //com
            this.GGASCom$com.data = {
                min: min,
                max: auto_max,
                step: this.slider_obj.step,
                value: min,
                add_click: () => {

                },
            }

            //toggle
            this.GGToggle$auto.own = this;
            this.GGToggle$auto.uncheck();
            this.GGToggle$account.uncheck();

            this.$Part1.active = true;
            this.$Part4.active = true;
            this.GGToggle$account.node.active = true;

            if (GameCache.Instance.gold_type == 3) {
                this.$Part1.active = false;
                this.$Part4.active = false;
                this.GGToggle$account.node.active = false;
                return;
            }
            this.$icon_coin.active = GameCache.Instance.gold_type == 1;
            this.$icon_usdt.active = GameCache.Instance.gold_type == 2;

            //带入选择钱包逻辑
            if (data.wallets != null) {
                if (data.wallets.length == 1) {
                    this.refreshSelect(0);
                    this.$arrow.active = false;
                    this.$club_click.active = false;
                }
                else if (data.wallets.length > 1) {
                    this.refreshSelect(-1);
                    this.$arrow.active = true;
                    this.$club_click.active = true;
                }
                else {

                }
            }
        }

    }

    change(boo: boolean) {
        this.GGASCom$com.use = boo;
    }
    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$confirm, this.onClickConfirm);
        this.setButtonClick(this.$cancel, this.onClickCancel);
        this.setButtonClick(this.$club_click, this.onClickClub);
    }

    /*
     * 滑动条改变触发
     */
    sliderChange(value: number) {

        this.sendCoin = value;

        this.refreshSliderTextColor();

    }

    hideUI() {
        UIComponent.Instance.HideUI(PrefabUI.UIAutoBringIn);
    }

    //打开充值
    goCharge() {

        UIComponent.open(UIDefine.UIRecharge, { type: 1, walletType: WalletType.Club });
        this.hideUI();
    }

    refreshSelect(index: number) {
        this.selected_wallet = this.wallets[index];
        if (index == -1) {
            this.cc_Label$club.string = i18nMgr.Get("UIGuild_WalletNoSelect");
            this.ownCoin = 0;
        } else {
            this.cc_Label$club.string = this.selected_wallet.club_name;
            this.ownCoin = this.selected_wallet.gold;
        }
        this.cc_Label$coin.string = `${StringHelper.GetLongString(this.ownCoin)}`;
        this.refreshSliderTextColor();
        GC.data.user.info.gold = this.ownCoin;
    }

    refreshSliderTextColor() {
        let label = this.SliderPlus$slider.label_value;
        label.node.color = cc.Color.BLACK.fromHEX("#EEF5FF");
        if ((GameCache.Instance.gold_type == 1 || GameCache.Instance.gold_type == 2) && this.sendCoin > this.ownCoin) {
            label.node.color = cc.Color.BLACK.fromHEX("#ee8380");
        }
    }
    /////////////////////click事件
    //确认
    onClickConfirm() {

        if (GameUtil.GetFriendsOrClubTable() == 3 && this.selected_wallet == null) {
            UIComponent.Instance.ToastLanguage("UILogin_Select");
            return;
        }

        //判断自动上桌是否勾选
        let auto_100 = this.GGToggle$auto.isCheck ? this.GGASCom$com.value * 100 : 0;
        let coin_100 = this.sendCoin * 100;
        let accountCheck = this.GGToggle$account.isCheck;

        if (this._param.isFromSetting) {

            GameCache.Instance.CurGame.SetAutoOnTableChips(auto_100, accountCheck);
        } else {

            if (GameUtil.GetFriendsOrClubTable() == 3) {


                GameCache.Instance.CurGame.AddChips(coin_100, auto_100, accountCheck, this.selected_wallet.club_id, this.selected_wallet.club_random_id, { own: this, wallets: this.wallets, selected_wallet: this.selected_wallet })


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
            wallets: this.wallets,
            selected_wallet: this.selected_wallet,
            own: this
        });
    }
}
