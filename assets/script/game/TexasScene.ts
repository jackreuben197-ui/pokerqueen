import GameCache from "../manager/GameCache";
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

    Enter(param: any): void {

        super.Enter(param);

        if (param != null) {
            // object[] arr = obj as object[];
            // fromUI = null != arr[0] ? arr[0].ToString() : string.Empty;
            this.game.IsLookOn = param?.[1] || false;
        }

        this.setDeskType(this.game.deskType);


    }
    Exit(param) {
        super.Exit(param);
    }


    private sideClick(e: cc.Button) {
        switch (e.node) {
            case this.menu_btn://菜单按钮
                cc.log("menu_btn is clicked");
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
}
