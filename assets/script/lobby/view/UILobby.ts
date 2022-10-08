const { ccclass, property } = cc._decorator;
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import { GameCache } from "../../game/GameCache";
import { i18nSprite } from "../../i18n/i18nSprite";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { LobbyControl } from "../control/LobbyControl";
import UIMatchRoom from "./UIMatchRoom";

@ccclass
export default class UILobby extends UIBase {
    private lbl_name: cc.Label = null;
    private lbl_glod: cc.Label = null;
    private Button_MTT: cc.Node = null;
    private scrollView: cc.ScrollView = null;
    private dropDownFlag: cc.Node = null;

    private beanBg: cc.Node = null;

    private _waitRefresh: boolean = false;
    onLoad(): void {
        super.onLoad();

        this.initView();
    }

    protected lateLoad(): void {
        super.lateLoad();

        this.lbl_name = this.getChildNodeOrComponent("Text_LeftTop").getComponent(cc.Label);
        this.lbl_glod = this.getChildNodeOrComponent("lbl_glod").getComponent(cc.Label);
        this.Button_MTT = this.getChildNodeOrComponent("Button_MTT");
        this.beanBg = this.getChildNodeOrComponent("beanBg");
        this.scrollView = this.getChildNodeOrComponent("scrollView", cc.ScrollView);
        this.dropDownFlag = this.getChildNodeOrComponent("dropDownFlag");

        if (cc.winSize.height > this.scrollView.content.height) {
            this.scrollView.content.getComponent(cc.Layout).resizeMode = cc.Layout.ResizeMode.NONE;
            this.scrollView.content.setContentSize(cc.size(this.scrollView.content.width, cc.winSize.height));
        }

        let waiticon = this.dropDownFlag.getChildByName("waiticon")
        cc.Tween.stopAllByTarget(waiticon);
        cc.tween(waiticon).repeatForever(
            cc.tween().to(0.5, { angle: -360 })
                .call(() => {
                    waiticon.angle = 0;
                })
        ).start();

    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();

        this.bindClick(this.beanBg, this.clickBean);
        this.scrollView.node.on("scrolling", this.onScrolling, this);
        this.scrollView.node.on("scroll-ended", this.onScrollEnd, this);

    }

    private initView(): void {
        this.lbl_name.string = GameCache.Instance.nick.toString();
        this.setText(this.lbl_name, GameCache.Instance.nick)
        this.Button_MTT.getComponent(i18nSprite).string = "image_match_mtt";
        this.updateBean();
    }

    updateBean() {
        this.lbl_glod.string = GameCache.Instance.gold.toString();
    }

    clickBean() {
        UIComponent.open(UIDefine.MyWalletForm)
    }

    onScrolling() {
        if (this.scrollView.content.y <= -this.dropDownFlag.height - 1 && !this._waitRefresh) {
            this.setActive(this.dropDownFlag, true);

            this.scrollView.content.y = 0;
            this._waitRefresh = true;
        }

        if (this._waitRefresh) {
            this.scrollView.content.y = 0;
        }
    }

    onScrollEnd() {
        if (this._waitRefresh) {
            GC.data.lobby.reqLobbyGroupData(() => {
                this._waitRefresh = false;
                this.setActive(this.dropDownFlag, false);

            });
            // LobbyControl.getInstance().RequestListSummary({}).then((res) => {
            //     this._waitRefresh = false;
            //     UIMatchRoom.instance.onShow(res);
            //     this.setActive(this.dropDownFlag, false);
            // })
        }
    }


    /**
      * @description: 主要用来设置 下拉刷新--
      * @return {void}
      */
    // private setScrollTop(): void {
    //     let scrollView: cc.Node = this.getChildNodeOrComponent("ScrollView");
    //     let content: cc.Node = this.getChildNodeOrComponent("Scrollview_Content");
    //     let ContentHeight = content.height;
    //     let Scrollheight = scrollView.height;
    //     if (ContentHeight < Scrollheight) {
    //         let padding: cc.Node = this.getChildNodeOrComponent("padding");
    //         padding.height = Scrollheight - ContentHeight + 1;
    //     }
    //     content.getComponent(cc.Layout).updateLayout();
    //     let ItemPrefab0: cc.Node = this.getChildNodeOrComponent("ItemPrefab0");
    //     let root: cc.Node = ItemPrefab0.getChildByName("root");
    //     scrollView.on('scrolling', (e) => {
    //         let y = content.y;
    //         if (y < -100) {
    //             this.isRefresh = true;
    //             ItemPrefab0.active = true;
    //             root.getChildByName("arrow").active = true;
    //             root.getChildByName("Text_1").active = true;
    //             root.getChildByName("waiticon").active = false;
    //         }
    //         if (ItemPrefab0.active === true) {
    //             if ((y ^ 0) === 0 && this.isRefresh) {
    //                 this.isRefresh = false;
    //                 root.getChildByName("arrow").active = false;
    //                 root.getChildByName("Text_1").active = false;
    //                 root.getChildByName("waiticon").active = true;
    //                 cc.tween(root.getChildByName("waiticon")).to(0.5, { angle: -360 }).start();
    //                 this.scheduleOnce(() => {
    //                     root.getChildByName("waiticon").stopAllActions();
    //                     ItemPrefab0.active = false;
    //                 }, 0.5)
    //                 LobbyControl.getInstance().RequestListSummary({}).then((res) => {
    //                     UIMatchRoom.instance.onShow(res);
    //                 })
    //             }
    //         }
    //     })
    // }
}
