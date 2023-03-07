
import { GameConfig, Tabs_Status, TextColor } from "../../../config/GameConfig";
import { UIDefine } from "../../../define/UIDefine";
import PublicHelper from "../../../helper/PublicHelper";
import { StringHelper } from "../../../helper/StringHelper";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { Web_Recharge_Gold, Web_Tiqu_Gold, WWW } from "../../../net/https/WebRequest";
import UIDialogComponent from "../../../ui/dialog/UIDialogComponent";
import UISuperDialog, { UISuperDialogType } from "../../../ui/dialog/UISuperDialog";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";
import { UIClubModel } from "../../labor/UIClubModel";
import { WalletType } from "./UIWallet";
import WalletModel from "./WalletModel";

//充值界面
const { ccclass } = cc._decorator;


export type UIRechargeParam = {
    type?: number,
    walletType?: number,
    club_id?: number,
    club_name?: string,
    tribe_name?: string
}

@ccclass
export default class UIRecharge extends BaseFormPlus {

    protected _param: UIRechargeParam = null;

    isUSDT: boolean = false;

    send_gold: number = 0;

    Gold_Text = [100, 300, 500, 1000, 5000, 50000];


    $TopTabs: cc.Node = null;
    $GoldOptions: cc.Node = null;
    cc_EditBox$Recharge: cc.EditBox = null;
    $Next: cc.Node = null;

    _TopIndex: number = -8;

    _SelectIndex: number = -8;

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
    onShow(param?: UIRechargeParam, fromUI?: cc.Node): void {

        super.onShow(param, fromUI);

        this.cc_EditBox$Recharge.string = "";

        this.Top_Index = 0;

        this.SelectIndex = -1;

    }

    //刷新 金币|USDT 选择按钮
    refreshCenterGoldIcon() {
        this.cc_EditBox$Recharge.string = "";
        this.SelectIndex = -1;
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

                            club_id: this._param.club_id
                        }
                    ).then(
                        (res: any) => {
                            this.requestSuccess(res.data);
                        },
                        (res: any) => {

                        }
                    )
                }
                //提
                // if (this._param.type == 2) {

                //     WWW.Instance.CommonAPI(
                //         {
                //             web_class: Web_Tiqu_Gold,

                //             body: { amount: value, gold_type: gold_type },

                //             club_id: WalletModel.Instance.club_id
                //         }
                //     ).then(
                //         (res: any) => {
                //             UIComponent.Instance.Toast("提现申请成功");
                //         },
                //         (res: any) => {

                //         }
                //     )
                // }
                break;
            case WalletType.Fund://公会基金
                //充

                if (this._param.type == 1) {
                    UIClubModel.mInstance.reqClubFundRecharge(this._param.club_id, { amount: value, gold_type: gold_type }).then(
                        (res: any) => {
                            this.requestSuccess(res.data);
                        },
                        () => {

                        },
                    )
                }
                //提
                // if (this._param.type == 2) {
                //     UIClubModel.mInstance.reqClubFundWithDraw(WalletModel.Instance.club_id, { amount: value, gold_type: gold_type }).then(
                //         (res) => {
                //             UIComponent.Instance.Toast("提现申请成功");
                //         },
                //         () => {

                //         },
                //     )
                // }
                break;

        }

    }

    set Top_Index(index: number) {
        if (this._TopIndex == index) return;
        this._TopIndex = index;
        let status = Tabs_Status[index];
        this.$TopTabs.children.forEach((item, index) => {
            let color = status[index] ? TextColor.Color7 : TextColor.Color3;
            item.children[0].color = cc.Color.BLACK.fromHEX(color);
            item.children[1].active = !!status[index];
        })
        this.refreshCenterGoldIcon();
    }
    get Top_Index(): number {
        return this._TopIndex;
    }

    set SelectIndex(index: number) {
        if (index > -1 && index == this._SelectIndex) {
            index = -1;
        }
        this._SelectIndex = index;
        let status = Tabs_Status[index];
        this.$GoldOptions.children.forEach((item, index) => {
            item.children[1].active = status[index];
        })
    }
    get SelectIndex(): number {
        return this._SelectIndex;
    }
    /////////点击
    topTabClick(button: cc.Button) {
        let index = button.node["index"];
        this.Top_Index = index;
    }
    optionClick(button: cc.Button) {
        let index = button.node["index"];
        this.cc_EditBox$Recharge.string = `${this.Gold_Text[index]}`;
        this.SelectIndex = index;
    }
    nextClick() {
        //判断输入
        this.send_gold = +this.cc_EditBox$Recharge.string;

        if (this.send_gold == 0) {

            UIComponent.Instance.ToastLanguage("Uimine_ptcz_playgold");

            return;
        }
        let content = "";
        let target_name: string = "";
        switch (this._param.walletType) {
            case WalletType.Club://公会玩家钱包
                content = this.Top_Index == 0 ? i18nMgr.Get("UIGuildFund_RtPlayerTips001") : i18nMgr.Get("UIGuildFund_RtPlayerTips002");
                target_name = this._param.club_name;
                break;
            case WalletType.Fund://公会基金
                content = this.Top_Index == 0 ? i18nMgr.Get("UIGuildFund_RtTips001") : i18nMgr.Get("UIGuildFund_RtTips002");
                target_name = this._param.tribe_name;
                break;
        }
        content = StringHelper.Format(content, [
            ` ${StringHelper.GetColorText(target_name, TextColor.Color4)} `,
            ` ${StringHelper.GetColorText(`${this.send_gold}`, TextColor.Color4)} `
        ]);
        UIComponent.open<UISuperDialogType>(UIDefine.UISuperDialog, {
            this: this,
            title: i18nMgr.Get("adaptation10007"),
            content: content,
            cancel: i18nMgr.Get("adaptation10013"),
            commit: i18nMgr.Get("UI_Recharge_confirm"),
            commit_click: () => {
                this.reqRechargeOrDraw(this.send_gold * 100);
            }
        });
    }
    //申请成功响应弹窗
    requestSuccess(data: any) {
        if (data?.more_contact) {
            UIComponent.open<UISuperDialogType>(UIDefine.UISuperDialog, {
                this: this,
                title: i18nMgr.Get("adaptation10007"),
                cancel: i18nMgr.Get("UIBackDialog_ticketsbtnClose"),
                commit: i18nMgr.Get("UIClub_Info_gL1Ehrnk"),
                content: StringHelper.Format(i18nMgr.Get("UIGuildFund_RtTips005"), [` ${StringHelper.GetColorText(data.more_contact, TextColor.Color4)} `]),
                commit_click: () => {
                    PublicHelper.copyToClipBoard(data.more_contact);
                }
            });
        } else {
            UIComponent.Instance.ToastLanguage("roomError171_5");
        }
    }

}
