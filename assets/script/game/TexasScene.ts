import { IUIDefine } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import GameCache from "../manager/GameCache";
import UIManager from "../manager/UIManager";
import BaseScene from "../ui/scene/BaseScene";
import FSMLogicComponent from "./FSMLogicComponent";
import GameSession from "./GameSession";
import TexasGame from "./TexasGame";


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

    ImageWaitForStartTips: cc.Node = null;

    //座位模板节点
    Seat: cc.Node = null;

    ///////////////////////////////////
    /**
     * 声明内容
     */
    game: TexasGame = null;
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

        //GameCache.ins.room_type
        //TexasGame game = GameUtil.InstantiateTexasGameplayObject((RoomType)GameCache.Instance.room_type, this);

        this.game = GameCache.ins.CurGame;

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
        let sps = GameCache.ins.CurGame.getDeskSpriteFrames(index);
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

    /**
     * 响应退出触发
     */
    public CallbackExit() {
        GameSession.LeaveRoom();
    }
}
