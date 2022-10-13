import TexasConfig from "../../config/TexasConfig";
import { CommonDefine } from "../../define/CommonDefine";
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import { StringHelper } from "../../helper/StringHelper";
import { i18nLabel } from "../../i18n/i18nLabel";
import { i18nMgr } from "../../i18n/i18nMgr";
import { UIMineModel } from "../../lobby/UIMineModel";
import ToastManager from "../../manager/ToastManager";
import { RoomInfo } from "../../protobuf/holdem/define_pb";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import TexasGame from "../texas/TexasGame";
import { AddClipsData } from "./UIAddChipsComponent";
import { OutClipsData } from "./UIOutChipsComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasMenuComponent extends UIBase {

    game: TexasGame = null;

    transSubMenu: cc.Node = null;
    imageMenuMask: cc.Node = null;
    textTotalBean: cc.Label = null;
    Menu_Buttons: cc.Node = null;

    textStoreBean: cc.Label = null;

    //按钮模板节点
    Menu_Button: cc.Node = null;

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
        this.textStoreBean = this.getChildNodeOrComponent("Text_StoreBean", cc.Label);
        this.Menu_Buttons = this.getChildNodeOrComponent("Menu_Buttons");
        this.Menu_Button = this.getChildNodeOrComponent("Menu_Button");
        this.buildMenuButtons();
        this.game = GameCache.Instance.CurGame;
    }

    onShow(param?: any) {
        super.onShow(param);
        this.UpdateMenu();
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
        if (null != this.imageMenuMask)
            this.imageMenuMask.active = false;
    }

    regiterTouchEvents() {
        this.imageMenuMask.on("click", this.onClose, this);
    }

    private buildMenuButtons() {
        for (let key in this.MenuButtons_Dic) {
            let item: typeof this.IMenuButton_Type = this.MenuButtons_Dic[key];
            let button = cc.instantiate(this.Menu_Button);
            button.parent = this.Menu_Buttons;
            button.active = false;
            button.getChildByName("Text").getComponent(cc.Label).string = item.text;
            button.getChildByName("Text").getComponent(i18nLabel).i18NString = item.i18n_string;
            button.getChildByName("Line").active = !item.hideLine;
            button.on("click", item.onClick, this);
            button.on(cc.Node.EventType.TOUCH_START, this.onMenuButtonTouchStart, this);
            button.on(cc.Node.EventType.TOUCH_END, this.onMenuButtonTouchEnd, this);
            button.on(cc.Node.EventType.TOUCH_CANCEL, this.onMenuButtonTouchEnd, this);
            item.node = button;
        }
        this.Menu_Button.active = false;
    }
    public UpdateMenu(): void {
        UIMineModel.mInstance.ObtainUserInfo(pDto => {
            // this.textTotalBean.string = StringHelper.getStringDiv100(GameCache.Instance.gold);
            this.setText(this.textTotalBean, GC.data.user.info.displayGold);
        });
        // //更新金豆

        this.textStoreBean.string = StringHelper.getStringDiv100(this.game.mainPlayer.cacheStoreChips);
        this.textStoreBean.node.parent.active = (this.game.mainPlayer.cacheStoreChips > 0);

        let UserSitdown = this.game.UserSitdown();

        //let menuHeight = UserSitdown == true ? 1615 : 1800;

        this.MenuButtons_Dic.Button_Setting.node.active = true;
        this.MenuButtons_Dic.Button_Rule.node.active = true;
        this.MenuButtons_Dic.Button_Exit.node.active = true;

        if (UserSitdown) //已坐下
        {

            this.MenuButtons_Dic.Button_Standup.node.active = true;
            this.MenuButtons_Dic.Button_AddChips.node.active = true;

            if (this.game.mainPlayer.chips >= GameCache.Instance.carry_small * (this.game.currentMaxRate + 1)) {
                //已带入最大值,不可点击
                //this.MenuButtons_Dic.Button_AddChips.node.getComponent(cc.Button).interactable = false;
                this.__MenuButtonInteractable(this.MenuButtons_Dic.Button_AddChips.node, false);
            }
            else {
                //this.MenuButtons_Dic.Button_AddChips.node.getComponent(cc.Button).interactable = true;
                this.__MenuButtonInteractable(this.MenuButtons_Dic.Button_AddChips.node, true);
            }


            if (this.game.CurlimitOutChip == RoomInfo.RetainType.RT_MANUAL && this.game.gamestatus >= 1 && this.game.gamestatus < 7) {
                this.MenuButtons_Dic.Button_TakeOut.node.active = true;
                this.__MenuButtonInteractable(this.MenuButtons_Dic.Button_TakeOut.node, true);
            }
            else if (this.game.CurlimitOutChip == RoomInfo.RetainType.RT_MANUAL && this.game.gamestatus != 1 && this.game.gamestatus < 7) {
                this.MenuButtons_Dic.Button_TakeOut.node.active = true;
                this.__MenuButtonInteractable(this.MenuButtons_Dic.Button_TakeOut.node, false);
            }
            else {
                this.MenuButtons_Dic.Button_TakeOut.node.active = false;
                this.MenuButtons_Dic.Button_TakeOut.node.getComponent(cc.Button).interactable = false;
            }

            this.MenuButtons_Dic.Button_LeaveDesk.node.active = true;

            if (this.game.gamestatus != 1)//游戏没开始的时候，座离桌按钮显示不可点击状态   !HasStarted()
            {
                this.__MenuButtonInteractable(this.MenuButtons_Dic.Button_LeaveDesk.node, false);
            }
            else {
                this.__MenuButtonInteractable(this.MenuButtons_Dic.Button_LeaveDesk.node, true);
            }
            if (this.game.CurlimitOutChip == RoomInfo.RetainType.RT_AUTO) {
                this.MenuButtons_Dic.Button_SetAutoOnTable.node.active = true;
            }

        }
        else //未坐下
        {
            this.MenuButtons_Dic.Button_Standup.node.active = false;
            this.MenuButtons_Dic.Button_AddChips.node.active = false;
            this.MenuButtons_Dic.Button_Trust.node.active = false;
            this.MenuButtons_Dic.Button_TakeOut.node.active = false;
            this.MenuButtons_Dic.Button_LeaveDesk.node.active = false;
            this.MenuButtons_Dic.Button_SetAutoOnTable.node.active = false;
        }

        // //线路
        // buttonNetline.transform.Find("Text").GetComponent<Text>().text = GlobalData.Instance.NameForServerID(GlobalData.Instance.CurrentUsingServerID());

        // 	RectTransform mRectTransform = transSubMenu as RectTransform;
        // if (null != mRectTransform)
        //     mRectTransform.sizeDelta = new Vector2(mRectTransform.sizeDelta.x, menuHeight);
    }

    __MenuButtonInteractable(node: cc.Node, interactable: boolean) {
        node.getChildByName("Text").color = cc.Color.WHITE;
        node.getChildByName("Text").opacity = interactable ? 255 : 120;
        node.getComponent(cc.Button).interactable = interactable;
        node.getChildByName("Arrow").active = interactable;
    }

    onMenuButtonTouchStart(e: cc.Event.EventTouch) {
        let target: cc.Node = e.currentTarget;
        target.getChildByName("Text").color = CommonDefine.Color_Yellow;
        target.getChildByName("Arrow").color = CommonDefine.Color_Yellow;
    }
    onMenuButtonTouchEnd(e: cc.Event.EventTouch) {
        let target: cc.Node = e.currentTarget;
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
        UIComponent.open(UIDefine.UITexasSettingComponent, null, this.node);
    }
    Click_Button_Rule() {
        this.game.uirc.HideMenu();
        UIComponent.open(UIDefine.UITexasRule, null, this.node);
    }
    Click_Button_SetAutoOnTable() {

    }
    Click_Button_AddChips() {
        if (null == this.MenuButtons_Dic.Button_AddChips || !this.MenuButtons_Dic.Button_AddChips.node.getComponent(cc.Button).interactable) {
            return;
        }
        this.game.uirc.HideMenu();
        // 弹代入框
        UIComponent.Instance.ShowNoAnimation<AddClipsData>(this.game.uirc.UIAddChips.node,
            {
                bigBlind: GameCache.Instance.CurGame.bigBlind,
                smallBlind: GameCache.Instance.CurGame.smallBlind,
                currentMinRate: GameCache.Instance.CurGame.currentMinRate,
                currentMaxRate: GameCache.Instance.CurGame.currentMaxRate,
                // totalCoin: GameCache.Instance.gold,
                totalCoin: GC.data.user.info.gold,
                tableChips: GameCache.Instance.CurGame.mainPlayer.chips
            });
    }
    Click_Button_TakeOut() {

        if (null == this.MenuButtons_Dic.Button_TakeOut || !this.MenuButtons_Dic.Button_TakeOut.node.getComponent(cc.Button).interactable) {
            return;
        }
        this.game.uirc.HideMenu();
        // 弹代入框CurretainMinRate
        UIComponent.Instance.ShowNoAnimation<OutClipsData>(this.game.uirc.UIOutChips.node,
            {
                currentMinRate: this.game.currentMinRate,
                tableChips: this.game.mainPlayer.chips,
            }
        )
    }
    Click_Button_Trust() {

    }
    //留座离桌
    Click_Button_LeaveDesk() {

        this.game.uirc.HideMenu();
        this.game.SendReserveSeatAction(true);
    }
    Click_Button_Exit() {
        this.game.uirc.CallbackExit();
    }
}
