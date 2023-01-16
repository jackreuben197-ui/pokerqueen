
import { Tabs_Status, Text_Colors } from "../../../config/GameConfig";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import GC from "../../../frame/GameControl";
import { StringHelper } from "../../../helper/StringHelper";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { API_CLUB_USER_WALLET, Web_Club_Fund_Exchange, Web_Club_Player_Exchange, Web_ExchangeRate, WWW } from "../../../net/https/WebRequest";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import UIComponent from "../../../ui/UIComponent";
import { WalletType } from "./UIWalletLayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIChangeLayer extends BaseFormPlus {


    $TopTabs: cc.Node = null;
    $panel_input: cc.Node = null;
    $panel_input2: cc.Node = null;

    cc_Label$Gold: cc.Label = null;
    cc_Label$USDT: cc.Label = null;

    cc_EditBox$Input: cc.EditBox = null;
    cc_EditBox$Exchange: cc.EditBox = null;

    $btn_all: cc.Node = null;
    $btn_exchange: cc.Node = null;

    cc_Label$Gold_Show: cc.Label = null;
    cc_Label$USDT_Show: cc.Label = null;

    cc_Label$Des0: cc.Label = null;
    cc_Label$Des1: cc.Label = null;
    cc_Label$Des2: cc.Label = null;

    isUSDT: boolean = false;

    ebx_num_up: cc.EditBox = null;
    ebx_num_down: cc.EditBox = null;

    _TopIndex: number = -8;

    main_request_quene = [];

    usdt: string = "";

    gold: string = "";

    changeReq = [null, Web_Club_Player_Exchange, Web_Club_Fund_Exchange];

    // 0 1 两个页签状态
    config = [
        {
            //获取比率信息
            getRateDes: () => { return `· 1USDT----${GC.wallet.usdt_to_gold_rate}${i18nMgr.Get(GC.wallet.Change_Des_Text[0])}` },
            //获取比率计算结果
            getValue: (a) => { return Math.ceil(a * GC.wallet.usdt_to_gold_rate * 100) / 100 },
            //全部点击响应
            setAll: () => {
                this.cc_EditBox$Input.string = this.usdt;
                this.textChanged(+this.usdt);
            },
            exchange: () => {
                //判断是否超出
                if (this.cc_EditBox$Input.string == "") {
                    UIComponent.Instance.Toast(i18nMgr.Get(GC.wallet.Change_Input_Text[0]));
                    return;
                }
                if (+this.cc_EditBox$Input.string > +this.usdt) {
                    UIComponent.Instance.Toast("not enough usdt");
                    return;
                }

                WWW.Instance.CommonAPI(
                    {
                        web_class: this.changeReq[GC.wallet.wallet_type],
                        body: {
                            "src_gold_type": 2,
                            "dest_gold_type": 1,
                            "src_amount": +this.cc_EditBox$Input.string * 100
                        },

                        club_id: ClubCache.club_id
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
        },
        {
            getRateDes: () => { return `· 1${i18nMgr.Get(GC.wallet.Change_Des_Text[0])}----${GC.wallet.gold_to_usdt_rate}USDT` },
            getValue: (a) => { return Math.ceil(a * GC.wallet.gold_to_usdt_rate * 100) / 100 },
            setAll: () => {
                this.cc_EditBox$Input.string = this.gold;
                this.textChanged(+this.gold);
            },
            exchange: () => {
                if (this.cc_EditBox$Input.string == "") {
                    UIComponent.Instance.Toast(i18nMgr.Get(GC.wallet.Change_Input_Text[0]));
                    return;
                }
                if (+this.cc_EditBox$Input.string > +this.gold) {
                    UIComponent.Instance.Toast("not enough gold");
                    return;
                }
                WWW.Instance.CommonAPI(
                    {
                        web_class: this.changeReq[GC.wallet.wallet_type],
                        body: {
                            "src_gold_type": 1,
                            "dest_gold_type": 2,
                            "src_amount": +this.cc_EditBox$Input.string * 100
                        },
                        club_id: ClubCache.club_id
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
        }
    ];


    protected lateLoad(): void {
        super.lateLoad();
        this.$TopTabs.children.forEach((item, index) => {
            item["index"] = index;
            this.setButtonClick(item, this.topTabClick);
        })
        this.setButtonClick(this.$btn_all, this.allClick);
        this.setButtonClick(this.$btn_exchange, this.exchangeClick);
        this.i18n();

        //设置输入文本改变回调
        let evt = new cc.Component.EventHandler();
        evt.target = this.node;
        evt.component = "UIChangeLayer";
        evt.handler = "textChanged";
        this.cc_EditBox$Input.textChanged = [evt];
    }
    i18n() {

        this.$TopTabs.children.forEach((item, index) => {
            item.getChildByName("lbl_show").getComponent(cc.Label).string = i18nMgr.Get(GC.wallet.Change_Tabs_Text[index]);
        });
        this.cc_Label$Gold_Show.string = this.cc_Label$USDT_Show.string = i18nMgr.Get(GC.wallet.Remain);

        this.cc_EditBox$Input.placeholder = i18nMgr.Get(GC.wallet.Change_Input_Text[0]);
        this.cc_EditBox$Exchange.placeholder = i18nMgr.Get(GC.wallet.Change_Input_Text[1]);

        this.cc_Label$Des1.string = `· ${i18nMgr.Get(GC.wallet.Change_Des_Text[1])}`;
        this.cc_Label$Des2.string = `· ${i18nMgr.Get(GC.wallet.Change_Des_Text[2])}`;

        this.setChildLabel(this.$btn_all, "text", i18nMgr.Get(GC.wallet.Change_Button_Text[0]));
        this.setChildLabel(this.$btn_exchange, "text", i18nMgr.Get(GC.wallet.Change_Button_Text[1]));

    }

    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);

        this.usdt = StringHelper.GetLongString(GC.wallet.USDT);
        this.gold = StringHelper.GetLongString(GC.wallet.Gold);

        this.cc_EditBox$Input.string = "";
        this.cc_EditBox$Exchange.string = "";

        this._TopIndex = -8;

        this.Top_Index = 0;

        this.refreshGold();

        this.reqExchangeRate();

    }

    //刷新金币
    refreshGold() {
        this.cc_Label$Gold.string = this.gold;
        this.cc_Label$USDT.string = this.usdt;
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

                    club_id: ClubCache.club_id
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
    set Top_Index(index: number) {
        if (this._TopIndex == index) return;
        this._TopIndex = index;
        let status = Tabs_Status[index];
        this.$TopTabs.children.forEach((item, index) => {
            item.children[0].color = cc.Color.BLACK.fromHEX(Text_Colors[status[index]]);
            item.children[0].children[0].color = cc.Color.BLACK.fromHEX(Text_Colors[status[index]]);
        })
        switch (index) {
            case 0:
                this.$panel_input.getChildByName("img_bg").active = true;
                this.$panel_input.getChildByName("img_bg2").active = false;
                this.$panel_input2.getChildByName("img_bg").active = false;
                this.$panel_input2.getChildByName("img_bg2").active = true;
                break;
            case 1:
                this.$panel_input.getChildByName("img_bg").active = false;
                this.$panel_input.getChildByName("img_bg2").active = true;
                this.$panel_input2.getChildByName("img_bg").active = true;
                this.$panel_input2.getChildByName("img_bg2").active = false;
                break;
        }
        this.cc_EditBox$Exchange.string = "";
        this.cc_EditBox$Input.string = "";
        this.refreshRateDes();
    }
    get Top_Index(): number {
        return this._TopIndex;
    }
    //刷新比率文本
    refreshRateDes() {
        this.cc_Label$Des0.string = this.config[this.Top_Index].getRateDes();
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
        this.Top_Index = index;
    }
    //全部点击
    allClick() {
        this.config[this.Top_Index].setAll();
    }
    //兑换点击
    exchangeClick() {
        this.config[this.Top_Index].exchange();
    }
    //输入文本改变
    textChanged(evt) {
        //console.log(evt);
        this.cc_EditBox$Exchange.string = `${this.config[this.Top_Index].getValue(evt)}`;
    }
    ///////////////////////////////
    reqWallet() {

        WWW.Instance.CommonAPI(
            {
                web_class: API_CLUB_USER_WALLET,
                club_id: ClubCache.club_id
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
}
