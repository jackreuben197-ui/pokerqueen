
import { Tabs_Status, TextColor } from "../../../config/GameConfig";
import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import GC from "../../../frame/GameControl";
import { StringHelper } from "../../../helper/StringHelper";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { API_CLUB_USER_WALLET, Web_Club_Fund_Exchange, Web_Club_Player_Exchange, Web_ExchangeRate, WWW } from "../../../net/https/WebRequest";
import { UISuperDialogType } from "../../../ui/dialog/UISuperDialog";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import UIComponent from "../../../ui/UIComponent";
import { WalletType } from "./UIWallet";
import WalletModel from "./WalletModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIExchange extends BaseFormPlus {


    cc_Label$gc: cc.Label = null;
    cc_Label$us: cc.Label = null;


    $gc: cc.Node = null;
    $us: cc.Node = null;

    $gc_icon: cc.Node = null;
    $us_icon: cc.Node = null;

    cc_EditBox$input: cc.EditBox = null;
    cc_Label$auto_count: cc.Label = null;
    //cc_EditBox$exchange: cc.EditBox = null;

    $btn_reversal: cc.Node = null;
    $btn_full: cc.Node = null;
    $btn_exchange: cc.Node = null;



    cc_Label$one: cc.Label = null;

    ebx_num_up: cc.EditBox = null;
    ebx_num_down: cc.EditBox = null;

    _TopIndex: number = -8;

    main_request_quene = [];

    usdt: string = "";

    gold: string = "";

    changeReq = [null, Web_Club_Player_Exchange, Web_Club_Fund_Exchange];

    //转换模式 0: union -> usdt  1 usdt: -> union 
    _mode: number = 0;

    // 0 1 两个页签状态
    config = [

        {

            show: () => {
                this.$gc.y = -90;
                this.$us.y = -275;

                this.$gc_icon.active = false;
                this.$us_icon.active = true;
            },

            getRateDes: () => { return `1 ${i18nMgr.Get("UIGuild_VipCountGoldType1")}   ≈   ${GC.wallet.gold_to_usdt_rate} ${i18nMgr.Get("UIGuild_VipCountGoldType2")}` },


            getValue: (a) => { return Math.ceil(a * GC.wallet.gold_to_usdt_rate * 100) / 100 },
            setAll: () => {
                this.cc_EditBox$input.string = this.gold;
                this.textChanged(+this.gold);
            },
            exchange: () => {
                if (this.cc_EditBox$input.string == "") {
                    UIComponent.Instance.ToastLanguage("trPNumber");
                    return;
                }
                if (+this.cc_EditBox$input.string > +this.gold) {
                    UIComponent.Instance.Toast("user wallet not enough");
                    return;
                }

                UIComponent.open(UIDefine.UISuperDialog, {
                    this: this,
                    title: i18nMgr.Get("WalletServiceCharge_eeydpBno"),
                    content: this.getDialogContent(),
                    commit_click: this.reqExchange,
                });
            }
        },
        {

            show: () => {
                this.$us.y = -90;
                this.$gc.y = -275;
                this.$gc_icon.active = true;
                this.$us_icon.active = false;
            },

            //获取比率信息
            getRateDes: () => { return `1 ${i18nMgr.Get("UIGuild_VipCountGoldType2")}   ≈   ${GC.wallet.usdt_to_gold_rate} ${i18nMgr.Get("UIGuild_VipCountGoldType1")}` },
            //获取比率计算结果
            getValue: (a) => { return Math.ceil(a * GC.wallet.usdt_to_gold_rate * 100) / 100 },
            //全部点击响应
            setAll: () => {
                this.cc_EditBox$input.string = this.usdt;
                this.textChanged(+this.usdt);
            },

            exchange: () => {
                //判断是否超出
                if (this.cc_EditBox$input.string == "") {
                    UIComponent.Instance.ToastLanguage("trPNumber");
                    return;
                }
                if (+this.cc_EditBox$input.string > +this.usdt) {
                    UIComponent.Instance.Toast("user wallet not enough");
                    return;
                }
                UIComponent.open<UISuperDialogType>(UIDefine.UISuperDialog, {
                    this: this,
                    title: i18nMgr.Get("WalletServiceCharge_eeydpBno"),
                    content: this.getDialogContent(),
                    commit_click: this.reqExchange,
                });
            }
        },
    ];


    protected lateLoad(): void {

        super.lateLoad();

        //设置输入文本改变回调
        let evt = new cc.Component.EventHandler();
        evt.target = this.node;
        evt.component = "UIExchange";
        evt.handler = "textChanged";
        this.cc_EditBox$input.textChanged = [evt];
    }
    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.setButtonClick(this.$btn_reversal, this.reversalClick);
        this.setButtonClick(this.$btn_full, this.fullClick);
        this.setButtonClick(this.$btn_exchange, this.exchangeClick);

    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);

        this.usdt = StringHelper.GetLongString(GC.wallet.USDT);
        this.gold = StringHelper.GetLongString(GC.wallet.Gold);

        this.cc_EditBox$input.string = "";
        this.cc_Label$auto_count.string = "0";

        this._mode = -8;

        this.mode = 0;

        this.refreshGold();

        this.reqExchangeRate();

    }

    //刷新金币
    refreshGold() {
        this.cc_Label$gc.string = this.gold;
        this.cc_Label$us.string = this.usdt;
    }
    //请求金币USDT互转率

    reqExchangeRate() {

        //公会基金需要请求转换率
        if (GC.wallet.wallet_type == WalletType.Fund) {

            WWW.Instance.CommonAPI(
                {
                    web_class: Web_ExchangeRate,
                    body: {
                        "src_gold_type": 1,
                        "dest_gold_type": 2,
                        "src_amount": 100
                    },

                    club_id: WalletModel.Instance.club_id
                }
            ).then(
                (res: any) => {
                    GC.wallet.gold_to_usdt_rate = res.data.gold_to_usdt_rate;
                    GC.wallet.usdt_to_gold_rate = res.data.usdt_to_gold_rate;
                    this.refreshRateDes();
                },
                (res: any) => {

                }
            )
        }
    }
    set mode(value: number) {
        this._mode = value;
        this.config[value].show();
        this.cc_EditBox$input.string = "";
        this.cc_Label$auto_count.string = "0";
        this.refreshRateDes();
    }
    get mode(): number {
        return this._mode;
    }
    //刷新比率文本
    refreshRateDes() {
        this.cc_Label$one.string = this.config[this.mode].getRateDes();
    }
    executeQuene() {
        if (this.main_request_quene.length) {
            let request = this.main_request_quene.shift();
            request.call(this, this.executeQuene);
        }
    }

    /////////////////点击
    //topTabs 点击
    topTabClick(button: cc.Button) {
        let index = button.node["index"];
        this.mode = index;
    }

    //模式切换点击
    reversalClick() {
        this.mode = +!this.mode;
    }
    //全部点击
    fullClick() {
        this.config[this.mode].setAll();
    }
    //兑换点击
    exchangeClick() {
        this.config[this.mode].exchange();
    }
    //输入文本改变
    textChanged(evt) {
        this.cc_Label$auto_count.string = `${this.config[this.mode].getValue(evt)}`;
    }

    getDialogContent(): string {
        let content = "";
        let target_name = "";
        if (GC.wallet.wallet_type == WalletType.Club) {
            content = this.mode == 0 ? i18nMgr.Get("UIGuildFund_EXPlayerTips001") : i18nMgr.Get("UIGuildFund_EXPlayerTips002");
            target_name = ClubCache.club_name;
        }
        if (GC.wallet.wallet_type == WalletType.Fund) {
            content = this.mode == 0 ? i18nMgr.Get("UIGuildFund_EXPlayerTips003") : i18nMgr.Get("UIGuildFund_EXPlayerTips004");
            target_name = ClubCache.tribe_name;
        }
        content = StringHelper.Format(content,
            [
                ` ${StringHelper.GetColorText(ClubCache.club_name, TextColor.Color4)} `,
                ` ${StringHelper.GetColorText(this.cc_EditBox$input.string, TextColor.Color4)} `,
                ` ${StringHelper.GetColorText(this.cc_Label$auto_count.string, TextColor.Color4)} `,
            ]
        );
        return content;
    }

    ///////////////////////////////
    reqWallet() {

        WWW.Instance.CommonAPI(
            {
                web_class: API_CLUB_USER_WALLET,
                club_id: WalletModel.Instance.club_id
            }
        ).then(
            (res: any) => {
                let gold = res.data?.golds || 0;
                let usdt = res.data?.usdt || 0;
                this.gold = StringHelper.GetLongString(gold);
                this.usdt = StringHelper.GetLongString(usdt);
                this.refreshGold();
            },
            (res: any) => {

            }
        )
    }
    reqExchange() {

        WWW.Instance.CommonAPI(
            {
                web_class: this.changeReq[GC.wallet.wallet_type],
                body: {
                    "src_gold_type": this.mode == 0 ? 1 : 2,
                    "dest_gold_type": this.mode == 0 ? 2 : 1,
                    "src_amount": +this.cc_EditBox$input.string * 100
                },
                club_id: WalletModel.Instance.club_id
            }
        ).then(
            (res: any) => {
                UIComponent.Instance.Toast(i18nMgr.Get(GC.wallet.Change_Success));
                //判断钱包类型

                switch (GC.wallet.wallet_type) {
                    case WalletType.Club:
                        this.reqWallet();
                        break;
                    case WalletType.Fund:
                        let gold = res.data?.wallet?.gold;
                        if (gold > 0) {
                            this.usdt = StringHelper.GetLongString(gold);
                            this.refreshGold();
                        }
                        break;
                    default:
                        break;
                }
            },
            (res: any) => {

            }
        )
    }

    /////////////////
}
//UIGuildFund_EXPlayerTips001=确定向{0}公会申请转换{1}Union coin，获得{2}Global coin
//UIGuildFund_EXPlayerTips002=确定向{0}公会申请转换{1}Global coin，获得{2}Union coin
//UIGuildFund_EXPlayerTips003=确定向{0}联盟申请转换{1}Union coin，获得{2}Global coin
//UIGuildFund_EXPlayerTips004=确定向{0}联盟申请转换{1}Global coin，获得{2}Union coin