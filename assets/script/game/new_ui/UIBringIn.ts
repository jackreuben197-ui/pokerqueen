
import SliderPlus from "../../common/SliderPlus";
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import { StringHelper } from "../../helper/StringHelper";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { i18nMgr } from "../../i18n/i18nMgr";
import { APIUserDiamondsWallet, WWW, Web_Config_Global_Config } from "../../net/https/WebRequest";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { UISuperDialogType } from "../../ui/dialog/UISuperDialog";
import { GameCache } from "../GameCache";
import GameUtil from "../util/GameUtil";
import UIClubWalletList from "./UIClubWalletList";

const { ccclass, menu } = cc._decorator;

export type AddClipsData = {
    bigBlind: number,// 大盲
    smallBlind: number, // 小盲
    currentMinRate: number, // 当前最小带入倍数
    currentMaxRate: number, // 当前最大带入倍数
    totalCoin?: number, // 总金豆
    tableChips: number, // 玩家剩余记分牌
    wallets?: any,//钱包列表
}

@ccclass
@menu('脚本分组/game/new_ui/UIBringIn')
export default class UIBringIn extends UIBasePlus {
    //part1
    $Part1: cc.Node = null;
    cc_Label$title: cc.Label = null;
    cc_Label$coin: cc.Label = null;
    $icon_usdt: cc.Node = null;
    $icon_coin: cc.Node = null;
    //part2
    cc_Label$blind: cc.Label = null;
    cc_Label$blind_d: cc.Label = null;
    cc_Label$buyin: cc.Label = null;
    cc_Label$buyin_d: cc.Label = null;
    //part3
    cc_Label$min: cc.Label = null;
    cc_Label$max: cc.Label = null;
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
    //part6
    $Part6: cc.Node = null;
    cc_Label$diamond: cc.Label = null;
    cc_Label$diamond_fee: cc.Label = null;
    ///////////////////////////
    _param: AddClipsData = null;
    //startRate: number = 0;//开始比率


    //滑动条 数据对象
    slider_obj = {
        min: 0,
        max: 0,
        step: 0
    };

    sendCoin: number = 0;//发送货币值
    ownCoin: number = 0;//拥有的货币值
    gold_type: number = 0;//货币类型


    wallet_mode: number = 0; //钱包模式 0:无钱包 1:1个钱包 2:多个钱包
    wallet_status: number = 0;//钱包状态 0未选择 1选择

    selected_wallet: any = null;//选中的钱包
    //wallet_select: number = 0;

    wallets: any[] = null;

    reqList: any = null;
    diamond_wallet_data: any = null;
    recordFeeData: any = null;

    protected lateLoad(): void {
        this.name = "UIBringIn";
        super.lateLoad();
        //this.GGSlider$slider.onChange(this.onSliderChange.bind(this));
    }

    onShow(data: AddClipsData): void {
        super.onShow(data);


        if (data != null) {

            this.selected_wallet = null;
            this.ownCoin = 0;
            this.wallets = data.wallets;



            this.diamond_wallet_data = null;
            this.recordFeeData = null;

            //小盲值/100
            this.cc_Label$blind.string = `${StringHelper.GetLongString(data.smallBlind)}/${StringHelper.GetLongString(data.bigBlind)}`;//SB/BB
            this.cc_Label$buyin.string = `${data.bigBlind}`; // Buy-in
            //最大带入值
            let max = (data.currentMaxRate * data.bigBlind - data.tableChips) / 100;
            let min = data.currentMinRate * data.bigBlind / 100;
            max = Math.max(min, max);

            this.SliderPlus$slider.show({
                min_value: min,
                max_value: max,
                step: data.bigBlind / 10,
                change: this.sliderChange,
                own: this
            });
            this.sliderChange(min);

            if (GameCache.Instance.gold_type == 3) {
                this.$Part1.active = false;
                this.$Part4.active = false;
                this.$Part6.active = false;
                this.GetRecordFeeData(GameCache.Instance.origin_type);
                return;
            }
            this.$Part1.active = true;
            this.$Part4.active = true;
            this.$Part6.active = false;

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

        this.cc_Label$buyin.string = `${this.sendCoin}`;

        this.refreshSliderTextColor();

        if (this.recordFeeData != null) {
            this.$Part6.active = false;
            this.cc_Label$diamond_fee.string = `${this.GetRecordFee() || 0}`;
            this.$Part6.active = true;
        }

    }

    hideUI() {
        UIComponent.Instance.HideUI(PrefabUI.UIBringIn);
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
        let mAnteNumber: number = this.sendCoin * 100;

        if (GameUtil.GetFriendsOrClubTable() == 3) {

            GameCache.Instance.CurGame.AddChips(mAnteNumber, 0, false, this.selected_wallet.club_id, this.selected_wallet.club_random_id, { own: this, wallets: this.wallets, selected_wallet: this.selected_wallet })

        }
        else {
            if (this.diamond_wallet_data.diamonds_wallet.diamonds <= ((+this.cc_Label$diamond_fee.string) ^ 0)) {
                UIComponent.open<UISuperDialogType>(UIDefine.UISuperDialog, {
                    this: this,

                    content: i18nMgr.Get("UIMine_DiamondsNotEnough"),
                    // contentCommit = "确定","充值"
                    commit: CPErrorCode.LanguageDescription(10326),
                    // contentCancel = "取消",
                    cancel: CPErrorCode.LanguageDescription(10013),
                    commit_click: () => {
                        UIComponent.open(UIDefine.UIMall);
                    },
                })
            } else {
                GameCache.Instance.CurGame.AddChips(mAnteNumber);
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



    //////////////////////////////////////////////////////
    //奔跑请求队列
    RunReqlist() {
        if (this.reqList.length) {
            let obj = this.reqList.shift();
            console.log("请求---->", obj.name);
            obj.func.call(this, this.RunReqlist);
        } else {
            console.log("队列请求完毕---->");
            this.RunReqlistEnd();
        }
    }
    //队列请求结束处理
    RunReqlistEnd() {
        this.cc_Label$diamond.string = `${this.diamond_wallet_data?.diamonds_wallet?.diamonds || 0}`;
        if (this.recordFeeData.status == 1) {
            this.cc_Label$diamond_fee.string = `${this.GetRecordFee() || 0}`;;
            this.$Part6.active = true;
        }
    }
    private GetRecordFee(): string {

        if (this.recordFeeData == null) return null;

        let bringIn: number = + this.cc_Label$buyin.string;



        if (this.recordFeeData.ratio == 0)
            return `${this.recordFeeData.floor_price}`;

        let fee = 0;
        switch (this.recordFeeData.decimal_type) {
            case 1:
                fee = Math.floor(bringIn * this.recordFeeData.ratio);
                break;
            case 2:
                fee = Math.ceil(bringIn * this.recordFeeData.ratio);
                break;
            case 3:
                fee = Math.round(bringIn * this.recordFeeData.ratio);
                break;
            default:
                break;
        }

        if (fee < this.recordFeeData.floor_price) {
            fee = this.recordFeeData.floor_price;
        }
        return `${fee}`;
    }

    private APIUserDiamondsWallet(next?: Function) {

        WWW.Instance.CommonAPI(
            {
                web_class: APIUserDiamondsWallet,
            }
        ).then(
            (res: any) => {
                //this.cc_Label$diamond.string = `${res.data.diamonds_wallet.diamonds}`;
                this.diamond_wallet_data = res.data;
                next?.call(this);
            },
            () => {
                next?.call(this);
            }
        );
    }

    private GetRecordFeeData(type) {
        if (type != 3 && type != 4) {
            return;
        }

        this.reqList = [
            { name: "APIUserDiamondsWallet", func: this.APIUserDiamondsWallet },
        ];

        this.RunReqlist();

        if (type == 3)//1 平台，2 联盟，3 公会 4 个人（朋友桌）
        {
            this.recordFeeData = JSON.parse(Web_Config_Global_Config.Response.data.scoreboard_club_price);
        }
        else if (type == 4) {
            this.recordFeeData = JSON.parse(Web_Config_Global_Config.Response.data.scoreboard_friend_price);
        }
    }
}
