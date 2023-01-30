
import { Tabs_Status, Text_Colors } from "../../../config/GameConfig";
import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import GC from "../../../frame/GameControl";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { Web_Recharge_Gold, Web_Tiqu_Gold, WWW } from "../../../net/https/WebRequest";
import UIDialogComponent from "../../../ui/dialog/UIDialogComponent";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";
import { UIClubModel } from "../../labor/UIClubModel";
import { WalletType } from "./UIWalletLayer";
import WalletModel from "./WalletModel";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIPayLayer extends BaseFormPlus {

    protected _param: { type: number, walletType: number } = null;

    isUSDT: boolean = false;

    ebx_num: cc.EditBox = null;

    send_gold: number = 0;

    Gold_Text = [500, 300, 1000, 5000, 10000, 50000];

    Title_Text = ["充值", "提现"];

    Top_Tab_Text = {
        1: ["金豆充值", "USDT充值"],
        2: ["金豆提现", "USDT提现"],
    }
    Type_Text = ["金豆", "USDT"];
    Apply_Text = ["申请充值", "申请提现"];

    $TopTabs: cc.Node = null;
    $GoldOptions: cc.Node = null;
    cc_EditBox$Recharge: cc.EditBox = null;
    $Next: cc.Node = null;

    _TopIndex: number = -8;

    lateLoad() {
        super.lateLoad();
        this.$GoldOptions.children.forEach((item, index) => {
            item.getChildByName("lbl_gold").getComponent(cc.Label).string = `${this.Gold_Text[index]}`;
            item["index"] = index;
            this.setButtonClick(item, this.optionClick);
        })
        this.$TopTabs.children.forEach((item, index) => {
            item["index"] = index;
            this.setButtonClick(item, this.topTabClick);
        })

    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$Next, this.nextClick);
    }

    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: { type: number, walletType: number }, fromUI?: cc.Node): void {

        super.onShow(param, fromUI);

        //标题设置
        this.ComFormTitle$title.title_label.string = i18nMgr.Get(this.Title_Text[param.type - 1]);

        this.$TopTabs.children.forEach((item, index) => {
            item.getChildByName("lbl_show").getComponent(cc.Label).string = this.Top_Tab_Text[param.type][index];
        })

        this.cc_EditBox$Recharge.string = "";

        this.Top_Index = 0;
    }

    onClickCenterChoose(event) {
        let node = event.target;
        let index = node.index;
        //this.ebx_num.string = "500";
        this.ebx_num.string = `${this.Gold_Text[index]}`;
    }

    //刷新 金币|USDT 选择按钮
    refreshCenterGoldIcon() {
        this.$GoldOptions.children.forEach((item) => {
            item.getChildByName("img_gold").active = !!this.Top_Index;
            item.getChildByName("img_gold2").active = !!!this.Top_Index;
        })

        this.cc_EditBox$Recharge.string = "";
    }

    refreshTopUI() {
        let btn_usdt: cc.Node = this.getChildNodeOrComponent("btn_usdt");
        let btn_gold: cc.Node = this.getChildNodeOrComponent("btn_gold");
        btn_usdt.getChildByName("img_line").active = this.isUSDT;
        btn_usdt.getChildByName("lbl_show").color = this.isUSDT ?
            cc.color(53, 163, 179) : cc.color(255, 255, 255);
        btn_gold.getChildByName("img_line").active = !this.isUSDT;
        btn_gold.getChildByName("lbl_show").color = !this.isUSDT ?
            cc.color(53, 163, 179) : cc.color(255, 255, 255);
    }

    onClickGold(event) {
        let node = event.target;
        let info = node.info;
        this.isUSDT = false;
        this.refreshCenterGoldIcon();
    }

    onClickUSDT(event) {
        let node = event.target;
        let info = node.info;
        this.isUSDT = true;
        this.refreshCenterGoldIcon();
    }

    reqInfo(data) {
        let roomData = data.data.room_data;
        let info = {
            room_id: roomData.room_id,
            match_id: 0,
            limit: roomData.limit,
            offset: roomData.offset,
            type: 0,
            gametype: roomData.game_type,
        }
        LobbyControl.getInstance().getRecordHandInfo(info).then(
            (res) => {
                this.refreshListView(res);
            },
            (res) => {
            }
        )
    }

    refreshListView(data) {
        let records = data.data.records;
        let len = records.length;
        this.getChildNodeOrComponent("lbl_total", cc.Label).string = "共计" + len + "手";
        let lbl_no: cc.Node = this.getChildNodeOrComponent("lbl_no");
        lbl_no.active = len == 0;
        // 有数据 刷新列表
        let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
        let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        scrollView.content.removeAllChildren();
        for (let i = 0; i < len; i++) {
            let _cloneNode = cc.instantiate(panel_item);
            _cloneNode.x = 0;
            _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
            _cloneNode.parent = scrollView.content;

            let info = records[i];

            let nameStr = GC.data.languageTemp.temp.getName(info.name);
            _cloneNode.getChildByName("lbl_deskName").getComponent(cc.Label).string = nameStr;
            _cloneNode.getChildByName("lbl_next").getComponent(cc.Label).string = "第" + info.hand_num + "手";
            let score = info.change;
            let scLbl = _cloneNode.getChildByName("lbl_score").getComponent(cc.Label);
            LobbyControl.getInstance().setWinColor(scLbl, score, true);

            _cloneNode["index"] = i;
            _cloneNode["info"] = {
                data: data,
                info: info
            };
            _cloneNode.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)
        }
        scrollView.content.height = panel_item.height * (len + 5);
    }

    onClickItem(event) {
        let node = event.target;
        let info = node.info;
        UIComponent.open(UIDefine.UIMine_Poker, { info: info });
    }



    //获取提示面板信息
    getDialogMessage(): string {

        let message: string = null;

        let gold_name: string = this.Type_Text[this.Top_Index];

        let tribe_name: string = ClubCache.tribe_name;

        let apply_name: string = this.Apply_Text[this._param.type - 1];

        switch (this._param.walletType) {

            case WalletType.Club://公会玩家钱包

                message = `确定给<color=#3BE1F5>此账号</color>${apply_name}<color=#3BE1F5>${this.send_gold}</color>${gold_name}？`

                break;
            case WalletType.Fund://公会基金

                message = `确定向<color=#3BE1F5>${tribe_name}</color>${apply_name}<color=#3BE1F5>${this.send_gold}</color>${gold_name}？`

                break;
        }
        return message;
    }

    //请求充值or提现
    reqRechargeOrDraw(value: number) {

        let gold_type = this.Top_Index ? 2 : 1;

        switch (this._param.walletType) {

            case WalletType.Club://公会玩家钱包

                //充
                if (this._param.type == 1) {

                    WWW.Instance.CommonAPI(
                        {
                            web_class: Web_Recharge_Gold,

                            body: { amount: value, gold_type: gold_type },

                            club_id: WalletModel.Instance.club_id
                        }
                    ).then(
                        (res: any) => {
                            UIComponent.Instance.Toast("充值申请成功");
                        },
                        (res: any) => {

                        }
                    )
                }
                //提
                if (this._param.type == 2) {

                    WWW.Instance.CommonAPI(
                        {
                            web_class: Web_Tiqu_Gold,

                            body: { amount: value, gold_type: gold_type },

                            club_id: WalletModel.Instance.club_id
                        }
                    ).then(
                        (res: any) => {
                            UIComponent.Instance.Toast("提现申请成功");
                        },
                        (res: any) => {

                        }
                    )
                }
                break;
            case WalletType.Fund://公会基金
                //充

                if (this._param.type == 1) {
                    UIClubModel.mInstance.reqClubFundRecharge(WalletModel.Instance.club_id, { amount: value, gold_type: gold_type }).then(
                        (res) => {
                            UIComponent.Instance.Toast("充值申请成功");
                        },
                        () => {

                        },
                    )
                }
                //提
                if (this._param.type == 2) {
                    UIClubModel.mInstance.reqClubFundWithDraw(WalletModel.Instance.club_id, { amount: value, gold_type: gold_type }).then(
                        (res) => {
                            UIComponent.Instance.Toast("提现申请成功");
                        },
                        () => {

                        },
                    )
                }
                break;

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
        this.refreshCenterGoldIcon();


        // this.$Pages.children.forEach((item, index) => {
        //     item.active = !!status[index];
        // })
        // switch (index) {
        //     case 0:
        //         this.reqAccount();
        //         break;
        //     case 1:
        //         this.Record_Index = 0;
        //         break;
        //     case 2:

        //         break;
        // }
    }
    get Top_Index(): number {
        return this._TopIndex;
    }

    /////////点击
    topTabClick(button: cc.Button) {
        let index = button.node["index"];
        this.Top_Index = index;
    }
    optionClick(button: cc.Button) {
        let index = button.node["index"];
        this.cc_EditBox$Recharge.string = `${this.Gold_Text[index]}`;
    }
    nextClick() {
        //判断整数
        this.send_gold = +this.cc_EditBox$Recharge.string;

        if (this.send_gold == 0 || this.send_gold % 100 != 0) {

            UIComponent.Instance.Toast("请输入100的整数");

            return;
        }

        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent, {
            type: UIDialogComponent.DialogType.CommitCancel,
            title: "提示",
            content: this.getDialogMessage(),
            contentCommit: "确定",
            contentCancel: "取消",
            actionCommit: () => {
                this.reqRechargeOrDraw(this.send_gold * 100);
            },
            noAnimation: true,
        });
    }
}
