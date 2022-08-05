const { ccclass, property } = cc._decorator;
import UIBase from "../ui/UIBase";
import LobbyScene from "./LobbyScene";
@ccclass
export default class UILobbyMenu extends UIBase {
    //public view = {};
    private curBtn: cc.Node = null;


    menu_btn_lobby: cc.Node = null;
    menu_btn_world_chat: cc.Node = null;
    menu_btn_career: cc.Node = null;
    menu_btn_my: cc.Node = null;


    protected lateLoad(): void {
        super.lateLoad();
        this.menu_btn_lobby = this.getChildNodeOrComponent("menu_btn_lobby");
        this.menu_btn_world_chat = this.getChildNodeOrComponent("menu_btn_world_chat");
        this.menu_btn_career = this.getChildNodeOrComponent("menu_btn_career");
        this.menu_btn_my = this.getChildNodeOrComponent("menu_btn_my");
    }

    onShow() {
        this.changeBtn(this.menu_btn_lobby);
    }

    // load_all_object(root: cc.Node): void {
    //     for (let i = 0; i < root.childrenCount; i++) {
    //         this.view[root.children[i].name] = root.children[i];
    //         this.load_all_object(root.children[i]);
    //     }
    // }
    //绑定点击事件
    protected regiterTouchEvents(): void {
        this.menu_btn_lobby.on("click", this.lobby_click, this);
        this.menu_btn_world_chat.on("click", this.world_chat_click, this);
        this.menu_btn_career.on("click", this.career_click, this);
        this.menu_btn_my.on("click", this.my_click, this);
    }
    // }() {
    //     // let btns = ["lobby", "world_chat", "career", "my"];
    //     // for (let i = 0; i < btns.length; i++) {
    //     //     let btn: cc.Node = this.view["menu_btn_" + btns[i]];
    //     //     btn.on(cc.Node.EventType.TOUCH_END, this[btns[i] + "_click"], this);
    //     //     btn["id"] = i + 1;
    //     // }

    //     let btn: cc.Node = this.view["menu_btn_" + btns[i]];
    //         btn.on(cc.Node.EventType.TOUCH_END, this[btns[i] + "_click"], this);


    //     menu_btn_lobby

    removeEvent() {

    }
    lobby_click(btn: cc.Button) {
        this.changeBtn(btn.node);
        LobbyScene.instance.switchContent("UILobby")
    }
    world_chat_click(btn: cc.Button) {
        this.changeBtn(btn.node);
        LobbyScene.instance.switchContent("UIChat")
    }
    career_click(btn: cc.Button) {
        this.changeBtn(btn.node);
        LobbyScene.instance.switchContent("UICareer")
    }
    my_click(btn: cc.Button) {
        this.changeBtn(btn.node);
        LobbyScene.instance.switchContent("UIMine")
    }
    //显示btn的状态
    changeBtn(btn: cc.Node) {
        // let id = this.curBtn["id"];
        // let 
        // if (this.curBtn) {
        //     if (btn != this.curBtn) {
        //         this.view["select_" + this.curBtn["id"]].active = false;
        //         this.view["text_" + this.curBtn["id"]].color = new cc.Color().fromHEX("#414144");
        //         this.curBtn.scale = 1;
        //         this.curBtn = btn;
        //         this.view["select_" + this.curBtn["id"]].active = true;
        //         this.view["text_" + this.curBtn["id"]].color = new cc.Color().fromHEX("#E5C29F");
        //     } else {
        //         this.curBtn.scale = 1;
        //     }
        // } else {
        //     //默认为大厅
        //     this.curBtn = this.view["menu_btn_lobby"];
        //     this.curBtn.scale = 1.2;
        //     this.view["select_" + this.curBtn["id"]].active = true;
        //     this.view["text_" + this.curBtn["id"]].color = new cc.Color().fromHEX("#E5C29F");
        // }
        // if (btn) {
        //     this.curBtn.stopAllActions();
        //     this.curBtn.scale = 0.7;
        //     cc.tween(this.curBtn).to(0.1, { scale: 1.2 }).start()
        // }

        //this.curBtn = this.view["menu_btn_lobby"];
        //     this.curBtn.scale = 1.2;
        //     this.view["select_" + this.curBtn["id"]].active = true;
        //     this.view["text_" + this.curBtn["id"]].color = new cc.Color().fromHEX("#E5C29F");

        if (this.curBtn == btn) return;

        if (this.curBtn) {
            this.curBtn.getChildByName("select").active = false;
            this.curBtn.getChildByName("text").color = new cc.Color().fromHEX("#414144");
            this.curBtn.scale = 1;
        }
        //btn.scale = 1.2;
        btn.getChildByName("select").active = true;
        btn.getChildByName("text").color = new cc.Color().fromHEX("#E5C29F");
        btn.stopAllActions();
        btn.scale = 0.7;
        cc.tween(btn).to(0.1, { scale: 1.2 }).start()
        this.curBtn = btn;
    }
}
