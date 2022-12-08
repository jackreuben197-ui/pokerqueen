import { EventName } from "../../config/EventName";
import { CommonDefine } from "../../define/CommonDefine";
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import { i18nLabel } from "../../i18n/i18nLabel";
import { i18nMgr } from "../../i18n/i18nMgr";
import { UIMineModel } from "../../lobby/UIMineModel";
import ToastManager from "../../manager/ToastManager";
import { RoomInfo } from "../../protobuf/holdem/define_pb";
import UIBase from "../../ui/UIBase";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import TexasGame from "../texas/TexasGame";
import { AddClipsData } from "./UIAddChipsComponent";
import { OutClipsData } from "./UIOutChipsComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasMenuComponent extends UIBase {
    //文字透明度
    Text_Light_Alpha = 178;
    Text_Dark_Alpha = 70;

    game: TexasGame = null;

    transSubMenu: cc.Node = null;
    imageMenuMask: cc.Node = null;
    textTotalBean: cc.Label = null;
    Menu_Buttons: cc.Node = null;

    //按钮模板节点
    Menu_Button: cc.Node = null;

    outTipNode: cc.Node = null;
    outGold: cc.Label = null;


    gold_click: cc.Node = null;

    IMenuButton_Type: {
        node: cc.Node;
        text: string;
        i18n_string: string;
        hideLine?: boolean;
        onClick?: Function;
    };

    MenuButtons_Dic: Record<
        "Button_Standup" |
        "Button_Rebuy" |
        "Button_Owner" |
        "Button_Setting" |
        "Button_Rule" |
        "Button_SetAutoOnTable" |
        "Button_AddChips" |
        "Button_TakeOut" |
        "Button_Trust" |
        "Button_LeaveDesk" |
        "Button_Exit",
        typeof this.IMenuButton_Type> = {
            Button_Standup: {
                node: null,
                text: "Sit out",
                i18n_string: "UITexas_standUp",
                onClick: this.onClickStandup
            },
            Button_Rebuy: {
                node: null,
                text: "Rebuy",
                i18n_string: "UITexas_Rebuy",
                onClick: this.Click_Button_Rebuy
            },
            Button_Owner: {
                node: null,
                text: "Functions",
                i18n_string: "UITexas_OwerFund",
                onClick: this.Click_Button_Owner
            },
            Button_Setting: {
                node: null,
                text: "Options",
                i18n_string: "UITexas_Setting",
                onClick: this.Click_Button_Setting
            },
            Button_Rule: {
                node: null,
                text: "Rules",
                i18n_string: "UITexas_RuleTips",
                onClick: this.Click_Button_Rule
            },
            Button_SetAutoOnTable: {
                node: null,
                text: "Set up automatic table chips",
                i18n_string: "UITexasAutoOutChip",
                onClick: this.Click_Button_SetAutoOnTable
            },
            Button_AddChips: {
                node: null,
                text: "Supplementary scoreboard",
                i18n_string: "UITexas_AddChipsMenu",
                onClick: this.Click_Button_AddChips
            },
            Button_TakeOut: {
                node: null,
                text: "Bring out the scoreboard",
                i18n_string: "UITexas_BringOutChipsMenu",
                onClick: this.Click_Button_TakeOut
            },
            Button_Trust: {
                node: null,
                text: "Auto check/fold",
                i18n_string: "UITexas_TrustGame",
                onClick: this.Click_Button_Trust
            },
            Button_LeaveDesk: {
                node: null,
                text: "Leave the table",
                i18n_string: "UITexas_LeaveTheTable",
                onClick: this.Click_Button_LeaveDesk
            },
            Button_Exit: {
                node: null,
                text: "Exit to lobby",
                i18n_string: "UITexas_Leave",
                hideLine: true,
                onClick: this.Click_Button_Exit
            },

        }

    lateLoad() {
        super.lateLoad();
        this.transSubMenu = this.getChildNodeOrComponent("SubMenu");
        this.imageMenuMask = this.getChildNodeOrComponent("Image_MenuMask");
        this.textTotalBean = this.getChildNodeOrComponent("Text_TotalBean", cc.Label);
        this.Menu_Buttons = this.getChildNodeOrComponent("Menu_Buttons");
        this.Menu_Button = this.getChildNodeOrComponent("Menu_Button");
        this.outTipNode = this.getChildNodeOrComponent("outTipNode");
        this.outGold = this.getChildNodeOrComponent("outGold", cc.Label);
        this.gold_click = this.getChildNodeOrComponent("gold_click");
        this.buildMenuButtons();
    }

    onShow(param?: any) {
        super.onShow(param);
        this.game = GameCache.Instance.CurGame;
        this.game.UpdateMenu();
        this.updateBean();
        if (null != this.transSubMenu)
            cc.tween(this.transSubMenu).to(0.25, { x: -621 }).start();
        if (null != this.imageMenuMask)
            this.imageMenuMask.active = true;
    }

    onClose(param?: any) {
        super.onClose(param);
        if (null != this.transSubMenu) {
            if (param) {
                cc.tween(this.transSubMenu).to(0.25, { x: -1320 }).start();
            } else {
                this.transSubMenu.x = -1320;
            }
        }
        this.imageMenuMask && (this.imageMenuMask.active = false);
    }

    regiterTouchEvents() {
        this.imageMenuMask.on("click", this.onClose, this);
        this.gold_click.on("click", this.onGold, this);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.myGoldChange, this.updateBean);
    }

    private buildMenuButtons() {
        for (let key in this.MenuButtons_Dic) {
            let item: typeof this.IMenuButton_Type = this.MenuButtons_Dic[key];
            let button = cc.instantiate(this.Menu_Button);
            let label = button.getChildByName("Text");
            button.parent = this.Menu_Buttons;
            button.active = false;
            label.opacity = this.Text_Light_Alpha;
            label.getComponent(cc.Label).string = item.text;
            label.getComponent(i18nLabel).i18NString = item.i18n_string;
            button.on("click", item.onClick, this);
            button.on(cc.Node.EventType.TOUCH_START, this.onMenuButtonTouchStart, this);
            button.on(cc.Node.EventType.TOUCH_END, this.onMenuButtonTouchEnd, this);
            button.on(cc.Node.EventType.TOUCH_CANCEL, this.onMenuButtonTouchEnd, this);
            item.node = button;
        }
        this.Menu_Button.active = false;
    }
    //金币点击跳转钱包
    onGold() {
        if (GC.data.club?.info?.club_id) {
            UIComponent.open(UIDefine.MyWalletForm);
        } else {
            ToastManager.Instance.createToast(i18nMgr.Get("error2005"));
        }
    }

    //更新金豆
    updateBean() {
        this.setText(this.textTotalBean, GC.data.user.info.displayGold);

        let chips = GameCache.Instance.CurGame?.mainPlayer?.cacheStoreChips || 0;

        let outGold = chips / 100;

        this.setActive(this.outTipNode, chips > 0);

        if (this.outTipNode.active) {
            this.setText(this.outGold, outGold);
        }
    }


    onMenuButtonTouchStart(e: cc.Event.EventTouch) {
        let target: cc.Node = e.currentTarget;
        if (!target.getComponent(cc.Button).interactable) return;
        target.getChildByName("Text").color = CommonDefine.Color_Green;
        target.getChildByName("Arrow").color = CommonDefine.Color_Green;
    }
    onMenuButtonTouchEnd(e: cc.Event.EventTouch) {
        let target: cc.Node = e.currentTarget;
        if (!target.getComponent(cc.Button).interactable) return;
        target.getChildByName("Text").color = cc.Color.WHITE;
        target.getChildByName("Arrow").color = cc.Color.WHITE;
    }
    /******左侧菜单按钮点击******/
    //站起
    onClickStandup() {
        this.game.uirc.HideMenu();
        if (null == this.game.mainPlayer) {
            ToastManager.Instance.createToast(i18nMgr.Get("Good_luck"));
            //需要进行错误重连
            //Game.EventSystem.Run(EventIdType.GameErrorReconnect);
            return;
        }
        this.game.Standup();
    }
    Click_Button_Rebuy() {

    }
    Click_Button_Owner() {

    }
    Click_Button_Setting() {
        this.game.uirc.HideMenu();
        //UIComponent.open(UIDefine.UITexasSettingComponent, null, { parentUI: this.node });
        UIComponent.open(UIDefine.UITexasSettingComponent, null, { parentUI: this.game.uirc.Common_Con });
    }
    Click_Button_Rule() {
        this.game.uirc.HideMenu();
        //UIComponent.open(UIDefine.UITexasRule, null, { parentUI: this.node });
        UIComponent.open(UIDefine.UITexasRule, null, { parentUI: this.game.uirc.Common_Con });
    }

    //自动带入带出
    Click_Button_SetAutoOnTable() {
        if (null == this.MenuButtons_Dic.Button_SetAutoOnTable || !this.MenuButtons_Dic.Button_SetAutoOnTable.node.getComponent(cc.Button).interactable) {
            return;
        }
        this.game.uirc.HideMenu();
        // 弹代入框
        UIComponent.Instance.ShowUI(PrefabUI.UIAutoChipsComponent, true);
    }

    //手动带入
    Click_Button_AddChips() {
        if (null == this.MenuButtons_Dic.Button_AddChips || !this.MenuButtons_Dic.Button_AddChips.node.getComponent(cc.Button).interactable) {
            return;
        }
        this.game.uirc.HideMenu();
        // 弹代入框
        UIComponent.Instance.ShowUI<AddClipsData>(PrefabUI.UIAddChipsComponent, {
            bigBlind: GameCache.Instance.CurGame.bigBlind,
            smallBlind: GameCache.Instance.CurGame.smallBlind,
            currentMinRate: GameCache.Instance.CurGame.currentMinRate,
            currentMaxRate: GameCache.Instance.CurGame.currentMaxRate,
            // totalCoin: GameCache.Instance.gold,
            totalCoin: GC.data.user.info.gold,
            tableChips: GameCache.Instance.CurGame.mainPlayer.chips
        });

    }

    //手动带出
    Click_Button_TakeOut() {

        if (null == this.MenuButtons_Dic.Button_TakeOut || !this.MenuButtons_Dic.Button_TakeOut.node.getComponent(cc.Button).interactable) {
            return;
        }
        this.game.uirc.HideMenu();
        // 弹代入框CurretainMinRate
        UIComponent.Instance.ShowUI<OutClipsData>(PrefabUI.UIOutChipsComponent, {
            currentMinRate: this.game.currentMinRate,
            tableChips: this.game.mainPlayer.chips,
        })
    }

    Click_Button_Trust() {
        if (!this.getButtonInteractable(this.MenuButtons_Dic.Button_Trust.node)) {
            return;
        }
        this.game.uirc.HideMenu();

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
    Click_Button_LeaveDesk() {
        this.game.uirc.HideMenu();
        this.game.SendReserveSeatAction(true);
    }
    Click_Button_Exit() {
        this.game.onClickExit();
    }
}
