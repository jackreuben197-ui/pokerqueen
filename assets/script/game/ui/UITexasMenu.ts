import { EventName } from "../../config/EventName";
import { GameConfig, TextColor } from "../../config/GameConfig";
import { CommonDefine } from "../../define/CommonDefine";
import { UIDefine } from "../../define/UIDefine";
import { ClubCache } from "../../frame/data/club/ClubCache";
import GC from "../../frame/GameControl";
import { StringHelper } from "../../helper/StringHelper";
import { i18nLabel } from "../../i18n/i18nLabel";
import { i18nMgr } from "../../i18n/i18nMgr";
import { WalletType } from "../../lobby/new_club/wallet/UIWallet";
import ToastManager from "../../manager/ToastManager";
import { APIOrgClubUserInfo, Web_User_Room, Web_User_Room_Bringin, WWW } from "../../net/https/WebRequest";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import { AddClipsData } from "../new_ui/UIBringIn";
import { OutClipsData } from "../new_ui/UIBringOut";
import TexasGame from "../texas/TexasGame";
import GameUtil from "../util/GameUtil";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasMenu extends UIBasePlus {
    //文字透明度
    Text_Light_Alpha = 178;
    Text_Dark_Alpha = 70;

    game: TexasGame = null;

    transSubMenu: cc.Node = null;
    imageMenuMask: cc.Node = null;
    textTotalBean: cc.Label = null;
    //Menu_Buttons: cc.Node = null;

    //按钮模板节点
    //Menu_Button: cc.Node = null;

    outTipNode: cc.Node = null;
    outGold: cc.Label = null;


    gold_click: cc.Node = null;

    ////////////////////////////////////
    //面板
    $panel: cc.Node = null;
    //黑色挡板
    $black: cc.Node = null;
    $block: cc.Node = null;
    //容器
    $layout: cc.Node = null;
    //选项
    $option_0: cc.Node = null;
    $option_bb: cc.Node = null;
    //金币节点
    $node_coin: cc.Node = null;
    //仓库存储节点
    $node_storage: cc.Node = null;


    tips_show: boolean = false;

    IMenuButton_Type: {
        node: cc.Node;
        text: string;
        i18n_string: string;
        hideLine?: boolean;
        onClick?: Function;
    };



    options = [
        {
            id: 0, // 站起
            node: null,
            text: "Sit out",
            i18n_string: "UITexas_standUp",
            onClick: this.click_stand_up,
        },
        {
            id: 1, // 重购
            node: null,
            text: "Rebuy",
            i18n_string: "UITexas_Rebuy",
            onClick: this.click_rebuy,
        },
        {
            id: 2, // 房主功能
            node: null,
            text: "Functions",
            i18n_string: "UITexas_OwerFund",
            onClick: this.click_ower_fund
        },
        {
            id: 3,// 个性设置
            node: null,
            text: "Options",
            i18n_string: "UITexas_Setting",
            onClick: this.click_setting,
        },
        {
            id: 4,// 规则
            node: null,
            text: "Rules",
            i18n_string: "UITexas_RuleTips",
            onClick: this.click_rule_tips
        },
        {
            id: 5,// 自动上桌筹码
            node: null,
            text: "Set up automatic table chips",
            i18n_string: "UITexasAutoOutChip",
            onClick: this.click_auto_table
        },
        {
            id: 6,// 带入
            node: null,
            text: "Supplementary scoreboard",
            i18n_string: "UITexas_AddChipsMenu",
            onClick: this.click_bringin
        },
        {
            id: 7,// 带出
            node: null,
            text: "Bring out the scoreboard",
            i18n_string: "UITexas_BringOutChipsMenu",
            onClick: this.click_bringout
        },
        {
            id: 8,// trust
            node: null,
            text: "Auto check/fold",
            i18n_string: "UITexas_TrustGame",
            onClick: this.click_trust
        },
        {
            id: 9,// 离座留桌
            node: null,
            text: "Leave the table",
            i18n_string: "UITexas_LeaveTheTable",
            onClick: this.click_leave_table
        },
        {
            id: 10,// 离开
            node: null,
            text: "Exit to lobby",
            i18n_string: "UITexas_Leave",
            hideLine: true,
            onClick: this.click_leave
        },
    ]

    //获取选项配置
    public getOption(index: number) {
        return this.options[index];
    }

    public setOptionInteractable(index: number, boo: boolean) {
        let node: cc.Node = this.getOption(index).node;
        node.getChildByName("click").getComponent(cc.Button).interactable = boo;
        node.getChildByName("label").color = cc.Color.BLACK.fromHEX(boo ? TextColor.Color7 : TextColor.Color3);
    }

    public clearOptions() {
        this.options.forEach(item => {
            item.node.active = false;
        })
    }

    lateLoad() {
        super.lateLoad();
        // this.transSubMenu = this.getChildNodeOrComponent("SubMenu");
        // this.imageMenuMask = this.getChildNodeOrComponent("Image_MenuMask");
        // this.textTotalBean = this.getChildNodeOrComponent("Text_TotalBean", cc.Label);
        // this.Menu_Buttons = this.getChildNodeOrComponent("Menu_Buttons");
        // this.Menu_Button = this.getChildNodeOrComponent("Menu_Button");
        // this.outTipNode = this.getChildNodeOrComponent("outTipNode");
        // this.outGold = this.getChildNodeOrComponent("outGold", cc.Label);
        // this.gold_click = this.getChildNodeOrComponent("gold_click");
        this.buildMenuButtons();
        //this.reset();
    }

    onShow(param?: any) {
        super.onShow(param);
        this.fadeOut(false);
        this.game = GameCache.Instance.CurGame;
        this.game.UpdateMenu();
        this.fadeIn();

        //刷新bb
        this.refreshBB();


    }
    refreshBB() {
        this.refreshBB_switch(GameCache.Instance.bb_on);
        this.click_bb_hidetips();
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$black, this.click_black);
        this.setButtonClick(this.$node_coin, this.click_coin);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    private buildMenuButtons() {
        this.options.forEach(item => {
            let button = cc.instantiate(this.$option_0);
            let label = button.getChildByName("label");
            button.parent = this.$layout;
            button.active = false;
            label.getComponent(i18nLabel).i18NString = item.i18n_string;
            this.setButtonClick(button, item.onClick);
            item.node = button;
        })
        this.$option_0.active = false;
        this.$option_bb.setSiblingIndex(this.$layout.childrenCount - 1);
        this.setOptionBB();

    }

    setOptionBB() {
        this.setChildButtonClick(this.$option_bb, "click", this.click_bb);
        this.setChildButtonClick(this.$option_bb, "label_con/btn_showtips", this.click_bb_showtips);
        this.setChildButtonClick(this.$option_bb, "tips/close_con/close", this.click_bb_hidetips);
    }

    //金币点击跳转钱包
    // onGold() {
    //     if (GC.data.club?.info?.club_id) {
    //         //UIComponent.open(UIDefine.MyWalletForm);
    //         console.log("跳转充值");
    //     } else {
    //         ToastManager.Instance.createToast(i18nMgr.Get("error2005"));
    //     }
    // }

    click_coin() {

        let data = Web_User_Room_Bringin.Response.data;

        UIComponent.open(UIDefine.UIToRecharge,
            {
                type: 1,
                walletType: WalletType.Club,
                club_id: data.club_id,
                club_name: data.club_name,
                //tribe_name: data.tribe_name,
            });

    }
    //面板移入
    fadeIn(animation: boolean = true) {
        if (animation) {
            cc.tween(this.$panel).to(0.25, { x: 0 }).start();
        }
        else {
            this.$panel.x = 0;
        }
        this.$black.active = true;
        this.$block.active = true;

    }
    //面板移出
    fadeOut(animation: boolean = true) {

        let view_width = 1242;

        this.$panel.width = view_width;

        if (animation) {
            cc.tween(this.$panel).to(0.25, { x: - view_width }).start();
        } else {
            this.$panel.x = - view_width;
        }
        this.$black.active = false;
        this.$block.active = false;
    }

    /////////////////////////////////////////////
    //黑色挡板点击
    click_black() {
        this.onClose(true);
    }

    onClose(param?: any) {
        super.onClose(param);
        this.fadeOut(param);
    }


    /******左侧菜单按钮点击******/
    //站起
    click_stand_up() {
        this.click_black();
        if (null == this.game.mainPlayer) {
            ToastManager.Instance.createToast(i18nMgr.Get("Good_luck"));
            //需要进行错误重连
            //Game.EventSystem.Run(EventIdType.GameErrorReconnect);
            return;
        }
        this.game.Standup();
    }
    click_rebuy() {

    }
    click_ower_fund() {

    }
    click_setting() {
        this.click_black();
        UIComponent.open(UIDefine.UITexasSettingComponent, null, { parentUI: this.game.uirc.Common_Con });
    }
    click_rule_tips() {
        this.click_black();
        UIComponent.open(UIDefine.UITexasRule, null, { parentUI: this.game.uirc.Common_Con });
    }

    //设置自动上桌筹码
    click_auto_table() {

        this.click_black();
        // if (null == this.MenuButtons_Dic.Button_SetAutoOnTable || !this.MenuButtons_Dic.Button_SetAutoOnTable.node.getComponent(cc.Button).interactable) {
        //     return;
        // }

        if (GameUtil.GetFriendsOrClubTable() == 3) {

            WWW.Instance.CommonAPI(
                {
                    web_class: Web_User_Room_Bringin,
                    api_id: GameCache.Instance.room_id,
                }
            ).then(
                (res: any) => {
                    UIComponent.Instance.ShowUI(PrefabUI.UIAutoBringIn, {
                        bigBlind: GameCache.Instance.CurGame.bigBlind,
                        smallBlind: GameCache.Instance.CurGame.smallBlind,
                        currentMinRate: GameCache.Instance.CurGame.currentMinRate,
                        currentMaxRate: GameCache.Instance.CurGame.currentMaxRate,
                        tableChips: GameCache.Instance.CurGame.mainPlayer.chips,
                        totalCoin: GC.data.user.info.gold,
                        storeChips: GameCache.Instance.CurGame.mainPlayer.cacheStoreChips,
                        isFromSetting: true,
                        wallets: [res.data],
                    });

                },
                (res: any) => {

                }
            )

        }
        else {
            UIComponent.Instance.ShowUI(PrefabUI.UIAutoBringIn, {
                bigBlind: GameCache.Instance.CurGame.bigBlind,
                smallBlind: GameCache.Instance.CurGame.smallBlind,
                currentMinRate: GameCache.Instance.CurGame.currentMinRate,
                currentMaxRate: GameCache.Instance.CurGame.currentMaxRate,
                totalCoin: GC.data.user.info.gold,
                tableChips: GameCache.Instance.CurGame.mainPlayer.chips,
                storeChips: GameCache.Instance.CurGame.mainPlayer.cacheStoreChips,
                isFromSetting: true,
            });
        }
    }

    //手动带入
    click_bringin() {
        // if (null == this.MenuButtons_Dic.Button_AddChips || !this.MenuButtons_Dic.Button_AddChips.node.getComponent(cc.Button).interactable) {
        //     return;
        // }
        this.click_black();

        if (GameUtil.GetFriendsOrClubTable() == 3) {

            WWW.Instance.CommonAPI({
                web_class: Web_User_Room_Bringin,
                api_id: GameCache.Instance.room_id,
            }).then(
                (res: any) => {
                    UIComponent.Instance.ShowUI<AddClipsData>(
                        PrefabUI.UIBringIn,
                        {
                            bigBlind: GameCache.Instance.CurGame.bigBlind,
                            smallBlind: GameCache.Instance.CurGame.smallBlind,
                            currentMinRate: GameCache.Instance.CurGame.currentMinRate,
                            currentMaxRate: GameCache.Instance.CurGame.currentMaxRate,
                            totalCoin: GC.data.user.info.gold,
                            tableChips: GameCache.Instance.CurGame.mainPlayer.chips,
                            wallets: [res.data],
                            fromMenu: true,
                        }
                    )
                },
                (res: any) => {

                },
            )
        }
        else {

            UIComponent.Instance.ShowUI<AddClipsData>(
                PrefabUI.UIBringIn,
                {
                    bigBlind: GameCache.Instance.CurGame.bigBlind,
                    smallBlind: GameCache.Instance.CurGame.smallBlind,
                    currentMinRate: GameCache.Instance.CurGame.currentMinRate,
                    currentMaxRate: GameCache.Instance.CurGame.currentMaxRate,
                    totalCoin: GC.data.user.info.gold,
                    tableChips: GameCache.Instance.CurGame.mainPlayer.chips,
                    fromMenu: true,
                }
            )
        }
    }

    //手动带出
    click_bringout() {

        // if (null == this.MenuButtons_Dic.Button_TakeOut || !this.MenuButtons_Dic.Button_TakeOut.node.getComponent(cc.Button).interactable) {
        //     return;
        // }
        this.click_black();
        // 弹代入框CurretainMinRate
        UIComponent.Instance.ShowUI<OutClipsData>(PrefabUI.UIBringOut, {
            currentMinRate: this.game.currentMinRate,
            tableChips: this.game.mainPlayer.chips,
        })
    }

    click_trust() {
        // if (!this.getButtonInteractable(this.MenuButtons_Dic.Button_Trust.node)) {
        //     return;
        // }
        this.click_black();

        if (null == this.game.mainPlayer) {
            UIComponent.Instance.Toast(i18nMgr.Get("Good_luck"));
            //Game.EventSystem.Run(EventIdType.GameErrorReconnect);
            return;
        }

        if (this.game.mainPlayer.IsAutoOp)
            return;

        this.game.SendTrustAction(true);
    }
    //留座离桌
    click_leave_table() {
        // this.post(EventName.updateFriendChessView)
        this.game.uirc.HideMenu();
        this.game.SendReserveSeatAction(true);
    }
    click_leave() {
        // this.post(EventName.updateFriendChessView)
        this.game.onClickExit();
    }

    click_bb() {
        GameCache.Instance.bb_on = !GameCache.Instance.bb_on;
        this.refreshBB_switch(GameCache.Instance.bb_on);
        this.game.UpdateAllBB();
    }

    click_bb_showtips() {
        this.tips_show = !this.tips_show;
        this.setChildVisible(this.$option_bb, "tips", this.tips_show);
    }
    click_bb_hidetips() {
        this.tips_show = false;
        this.setChildVisible(this.$option_bb, "tips", false);
    }

    refreshBB_switch(boo: boolean) {
        this.setChildVisible(this.$option_bb, "switch/on", boo);
        this.setChildVisible(this.$option_bb, "switch/off", !boo);
    }

}
