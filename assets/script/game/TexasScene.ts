import { IUIDefine } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import { StringHelper } from "../helper/StringHelper";
import { UIMineModel } from "../lobby/UIMineModel";
import GameCache from "../manager/GameCache";
import UIManager from "../manager/UIManager";
import GlobalSession from "../session/GlobalSession";
import BaseScene from "../ui/scene/BaseScene";
import FSMLogicComponent from "./FSMLogicComponent";
import GameSession from "./GameSession";
import SeatUIRC from "./SeatUIRC";
import TexasGame from "./TexasGame";
import UIAddChipsComponent from "./ui/UIAddChipsComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class TexasScene extends BaseScene {

    /**
     * 节点|组件 定义
     */
    desk_bg: cc.Sprite = null;
    table_bg: cc.Sprite = null;

    menu_btn: cc.Node = null;
    report_btn: cc.Node = null;
    cursituation_btn: cc.Node = null;
    chat_btn: cc.Node = null;

    roominfo_lab: cc.Label = null;

    //补盲按钮
    buttonWaitBlind: cc.Node = null;
    //左侧边菜单
    transSubMenu: cc.Node = null;
    imageMenuMask: cc.Node = null;
    textTotalBean: cc.Label = null;




    ImageWaitForStartTips: cc.Node = null;



    //座位节点
    Seat: cc.Node = null;


    UIAddChips: UIAddChipsComponent = null;

    ///////////////////////////////////
    /**
     * 声明内容
     */
    game: TexasGame = null;
    lastClickTime: number = 0;
    ///////////////////////////////////
    protected lateLoad(): void {
        super.lateLoad();
        this.desk_bg = this.getChildNodeOrComponent("desk_bg", cc.Sprite);
        this.table_bg = this.getChildNodeOrComponent("table_bg", cc.Sprite);

        this.menu_btn = this.getChildNodeOrComponent("menu_btn");
        this.report_btn = this.getChildNodeOrComponent("report_btn");
        this.cursituation_btn = this.getChildNodeOrComponent("cursituation_btn");
        this.chat_btn = this.getChildNodeOrComponent("chat_btn");
        this.roominfo_lab = this.getChildNodeOrComponent("roominfo_lab", cc.Label);
        this.ImageWaitForStartTips = this.getChildNodeOrComponent("Image_WaitForStartTips");
        this.Seat = this.getChildNodeOrComponent("Seat");
        this.UIAddChips = this.getChildNodeOrComponent("UIAddChips", UIAddChipsComponent);
        this.buttonWaitBlind = this.getChildNodeOrComponent("Button_WaitBlind");

        this.transSubMenu = this.getChildNodeOrComponent("SubMenu");
        this.imageMenuMask = this.getChildNodeOrComponent("Image_MenuMask");
        this.textTotalBean = this.getChildNodeOrComponent("Text_TotalBean", cc.Label);


        //GameCache.Instance.room_type
        //TexasGame game = GameUtil.InstantiateTexasGameplayObject((RoomType)GameCache.Instance.room_type, this);

        this.UIAddChips.node.active = false;

        this.Seat.active = false;

        this.game = GameCache.Instance.CurGame;

        this.game.gameUI = this;

        window["TexasScene"] = this;

    }

    protected regiterTouchEvents(): void {
        this.menu_btn.on("click", this.sideClick, this);
        this.report_btn.on("click", this.sideClick, this);
        this.cursituation_btn.on("click", this.sideClick, this);
        this.chat_btn.on("click", this.sideClick, this);
    }
    setDeskType(index: number) {
        let sps = GameCache.Instance.CurGame.getDeskSpriteFrames(index);
        this.desk_bg.spriteFrame = sps[0];
        this.table_bg.spriteFrame = sps[1];
    }

    Enter(param: { fromUI: IUIDefine, lookOn: boolean }): void {

        super.Enter(param);

        if (param != null) { // { fromUI: this.UIDefine, lookOn: false }

            this.game.IsLookOn = param?.lookOn || false;
            //param?.fromUI && UIManager.close(param.fromUI);
        }

        this.setDeskType(this.game.deskType);

        cc.log("Enter complete");

    }
    Exit(param) {
        super.Exit(param);
    }


    private sideClick(e: cc.Button) {
        switch (e.node) {
            case this.menu_btn://菜单按钮
                cc.log("menu_btn is clicked");
                this.CallbackExit();
                break;
            case this.report_btn://报告按钮
                cc.log("report_btn is clicked");
                break;
            case this.cursituation_btn://状况按钮
                cc.log("cursituation_btn is clicked");
                break;
            case this.chat_btn://聊天按钮
                cc.log("chat_btn is clicked");
                break;
        }
    }
    //菜单点击
    public onClickMenu(): void {
        if (this.CanClick() == false)
            return;
        this.lastClickTime = GlobalSession.NowTimeMS;
        this.showMenu();
    }

    private showMenu(): void {
        this.UpdateMenu();
        // 	RectTransform mRectTransform = transSubMenu as RectTransform;
        // if (null != mRectTransform)
        //     mRectTransform.DOAnchorPosX(0, 0.25f);
        // if (null != imageMenuMask)
        //     imageMenuMask.gameObject.SetActive(true);
    }
    protected hideMenu(): void {
        if (null != this.transSubMenu)
            //mRectTransform.DOAnchorPosX(-700, 0.25f);
            cc.tween(this.transSubMenu).to(0.25, { x: -1320 });
        if (null != this.imageMenuMask)
            this.imageMenuMask.active = false;
    }

    protected UpdateMenu(): void {
        UIMineModel.mInstance.ObtainUserInfo(pDto => {
            this.textTotalBean.string = StringHelper.getStringDiv100(GameCache.Instance.gold);
        });
        //更新金豆

        this.textTotalBean.string = StringHelper.getStringDiv100(this.game.mainPlayer.cacheStoreChips);
        this.textTotalBean.node.parent.active = (this.game.mainPlayer.cacheStoreChips > 0);

        let UserSitdown = this.game.UserSitdown();

        let menuHeight = UserSitdown == true ? 1615 : 1800;

        // if (UserSitdown) //已坐下
        // {
        //     this.buttonStandup.gameObject.SetActive(true);

        //     this.buttonAddChips.gameObject.SetActive(true);
        //     if (mainPlayer.chips >= GameCache.Instance.carry_small * (currentMaxRate + 1)) {
        //         //已带入最大值,不可点击
        //         buttonAddChips.interactable = false;
        //     }
        //     else {
        //         buttonAddChips.interactable = true;
        //     }

        //     if (CurlimitOutChip == RoomInfo.Types.RetainType.RtManual && gamestatus >= 1 && gamestatus < 7) {
        //         buttonoutChips.gameObject.SetActive(true);
        //         buttonoutChips.interactable = true;
        //         buttonoutChips.transform.GetChild(0).GetComponent<Text>().color = new Color(255 / 255f, 255 / 255f, 255 / 255f, 245 / 255f);
        //         buttonoutChips.transform.GetChild(2).gameObject.SetActive(true);
        //     }
        //     else if (CurlimitOutChip == RoomInfo.Types.RetainType.RtManual && gamestatus != 1 && gamestatus < 7) {
        //         buttonoutChips.gameObject.SetActive(true);
        //         buttonoutChips.interactable = false;
        //         buttonoutChips.transform.GetChild(0).GetComponent<Text>().color = new Color(255 / 255f, 255 / 255f, 255 / 255f, 120 / 255f);
        //         buttonoutChips.transform.GetChild(2).gameObject.SetActive(false);
        //     }
        //     else {
        //         buttonoutChips.gameObject.SetActive(false);
        //         buttonoutChips.interactable = false;
        //         menuHeight -= 185;
        //     }

        //     Button_LeaveDesk.gameObject.SetActive(true);
        //     if (gamestatus != 1)//游戏没开始的时候，座离桌按钮显示不可点击状态   !HasStarted()
        //     {
        //         Button_LeaveDesk.transform.GetComponentInChildren<Text>().color = new Color(255 / 255f, 255 / 255f, 255 / 255f, 120 / 255f);
        //         Button_LeaveDesk.interactable = false;
        //         Button_LeaveDesk.transform.GetChild(2).gameObject.SetActive(false);
        //     }
        //     else {
        //         Button_LeaveDesk.transform.GetChild(0).GetComponent<Text>().color = new Color(255 / 255f, 255 / 255f, 255 / 255f, 245 / 255f);
        //         Button_LeaveDesk.interactable = true;
        //         Button_LeaveDesk.transform.GetChild(2).gameObject.SetActive(true);
        //     }
        //     if (CurlimitOutChip == RoomInfo.Types.RetainType.RtAuto) {
        //         buttonSetAutoOnTable.gameObject.SetActive(true);
        //         menuHeight += 185;
        //     }


        // }
        // else //未坐下
        // {
        //     buttonStandup.gameObject.SetActive(false);
        //     menuHeight -= 185;

        //     buttonAddChips.gameObject.SetActive(false);
        //     menuHeight -= 185;

        //     buttonTrust.gameObject.SetActive(false);
        //     menuHeight -= 185;

        //     buttonoutChips.gameObject.SetActive(false);
        //     menuHeight -= 185;

        //     Button_LeaveDesk.gameObject.SetActive(false);
        //     menuHeight -= 185;

        //     buttonSetAutoOnTable.gameObject.SetActive(false);

        // }

        // //线路
        // buttonNetline.transform.Find("Text").GetComponent<Text>().text = GlobalData.Instance.NameForServerID(GlobalData.Instance.CurrentUsingServerID());

		// 	RectTransform mRectTransform = transSubMenu as RectTransform;
        // if (null != mRectTransform)
        //     mRectTransform.sizeDelta = new Vector2(mRectTransform.sizeDelta.x, menuHeight);
    }




    CanClick(): boolean {
        if (GlobalSession.NowTimeMS - this.lastClickTime > 500) {
            return true;
        }
        return false;
    }
    /**
     * 响应退出触发
     */
    public CallbackExit() {
        GameSession.LeaveRoom();
    }
}
