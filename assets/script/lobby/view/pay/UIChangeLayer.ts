
import { Tabs_Status, Text_Colors } from "../../../config/GameConfig";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import GC from "../../../frame/GameControl";
import { StringHelper } from "../../../helper/StringHelper";
import { Web_ExchangeRate } from "../../../net/https/WebRequest";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";

import { UIClubModel } from "../../labor/UIClubModel";

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


    isUSDT: boolean = false;

    ebx_num_up: cc.EditBox = null;
    ebx_num_down: cc.EditBox = null;

    Top_Tabs_Text = ["兑换金豆", "兑换USDT"];

    _TopIndex: number = -8;


    main_request_quene = [];


    protected lateLoad(): void {
        super.lateLoad();
        this.$TopTabs.children.forEach((item, index) => {
            item.getChildByName("lbl_show").getComponent(cc.Label).string = this.Top_Tabs_Text[index];
            item["index"] = index;
            this.setButtonClick(item, this.topTabClick);
        })
        this.setButtonClick(this.$btn_all, this.allClick);
        this.setButtonClick(this.$btn_exchange, this.exchangeClick);
    }

    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);

        // this.main_request_quene = [this.req];
        // this.executeQuene();
        // let btn_gold: cc.Node = this.getChildNodeOrComponent("btn_gold");
        // btn_gold.on(cc.Node.EventType.TOUCH_END, this.onClickGold, this)

        // let btn_usdt: cc.Node = this.getChildNodeOrComponent("btn_usdt");
        // btn_usdt.on(cc.Node.EventType.TOUCH_END, this.onClickUSDT, this)

        // let btn_all: cc.Node = this.getChildNodeOrComponent("btn_all");
        // btn_all.on(cc.Node.EventType.TOUCH_END, this.onClickAll, this)

        // this.ebx_num_up = this.getChildNodeOrComponent("ebx_num_up", cc.EditBox);
        // this.ebx_num_down = this.getChildNodeOrComponent("ebx_num_down", cc.EditBox);

        // this.isUSDT = false;
        // this.refreshTopUI();

        // this.ebx_num_up.string = "";
        // this.ebx_num_down.string = "";


        this.cc_EditBox$Input.string = "";
        this.cc_EditBox$Exchange.string = "";

        this.Top_Index = 0;

        this.refreshGold();

        this.reqExchangeRate();

    }

    //刷新金币
    refreshGold() {
        this.cc_Label$Gold.string = StringHelper.GetLongString(GC.wallet.Gold);
        this.cc_Label$USDT.string = StringHelper.GetLongString(GC.wallet.USDT);
    }
    //请求金币USDT互转率

    reqExchangeRate() {

        UIClubModel.mInstance.CommonAPI(
            ClubCache.club_id,
            {
                "src_gold_type": 1,
                "dest_gold_type": 2,
                "src_amount": 100
            }, Web_ExchangeRate).then(
                (res: any) => {
                    console.log(res);
                },
                err => {

                }
            )
    }



    // onClickAll(event) {
    //     let node = event.target;
    //     let info = node.info;
    //     this.ebx_num_up.string = "500";
    // }


    refreshTopUI() {
        // let btn_usdt: cc.Node = this.getChildNodeOrComponent("btn_usdt");
        // let btn_gold: cc.Node = this.getChildNodeOrComponent("btn_gold");
        // btn_usdt.getChildByName("img_line").active = this.isUSDT;
        // btn_usdt.getChildByName("lbl_show").color = this.isUSDT ?
        //     cc.color(53, 163, 179) : cc.color(255, 255, 255);
        // btn_gold.getChildByName("img_line").active = !this.isUSDT;
        // btn_gold.getChildByName("lbl_show").color = !this.isUSDT ?
        //     cc.color(53, 163, 179) : cc.color(255, 255, 255);

        // let panel_input: cc.Node = this.getChildNodeOrComponent("panel_input");
        // let panel_input2: cc.Node = this.getChildNodeOrComponent("panel_input2");
        // // 上面的金豆 如果是金豆 显示绿色 是usdt 显示黄色 img_bg 绿色 img_bg2 黄色
        // panel_input.getChildByName("img_bg").active = !this.isUSDT;
        // panel_input2.getChildByName("img_bg").active = this.isUSDT;
        // panel_input.getChildByName("img_bg2").active = this.isUSDT;
        // panel_input2.getChildByName("img_bg2").active = !this.isUSDT;

        // this.ebx_num_up.string = "";
        // this.ebx_num_down.string = "";
    }

    onClickGold(event) {
        let node = event.target;
        let info = node.info;
        this.isUSDT = false;
        this.refreshTopUI();
    }

    onClickUSDT(event) {
        let node = event.target;
        let info = node.info;
        this.isUSDT = true;
        this.refreshTopUI();
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
    }
    get Top_Index(): number {
        return this._TopIndex;
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
        //USDT > 金豆 模式
        if (this.Top_Index == 0) {

        }
        //金豆 > USDT 模式
        if (this.Top_Index == 1) {

        }
    }
    //兑换点击
    exchangeClick() {
        //USDT > 金豆 模式
        if (this.Top_Index == 0) {

        }
        //金豆 > USDT 模式
        if (this.Top_Index == 1) {

        }
    }
}
