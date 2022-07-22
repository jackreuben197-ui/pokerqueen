const { ccclass, property } = cc._decorator;
import LobbyScene from "./LobbyScene";
@ccclass
export default class UILobbyMenu extends cc.Component {
    public view = {};
    private curBtn:cc.Node = null;
    onLoad() { 
        this.load_all_object(this.node);
        this.registerEvent();
        this.changeBtn(null);
    }
    load_all_object(root: cc.Node): void {
        for (let i = 0; i < root.childrenCount; i++) {
            this.view[root.children[i].name] = root.children[i];
            this.load_all_object(root.children[i]);
        }
    }
    //绑定点击事件
    registerEvent(){
        let btns = ["lobby","world_chat","career","my"];
        for(let i=0;i<btns.length;i++){
            let btn:cc.Node = this.view["menu_btn_"+btns[i]];
            btn.on(cc.Node.EventType.TOUCH_END,this[btns[i]+"_click"],this);
            btn["id"] = i+1;
        }
    }
    removeEvent(){

    }
    lobby_click(e:cc.Event.EventTouch){
        this.changeBtn(e.target);
        LobbyScene.instance.switchContent("UILobby")
    }
    world_chat_click(e:cc.Event.EventTouch){
        this.changeBtn(e.target);
        LobbyScene.instance.switchContent("UIChat")
    }
    career_click(e:cc.Event.EventTouch){
        this.changeBtn(e.target);
        LobbyScene.instance.switchContent("UICareer")
    }
    my_click(e:cc.Event.EventTouch){
        this.changeBtn(e.target);
        LobbyScene.instance.switchContent("UIMine")
    }
    //显示btn的状态
    changeBtn(btn:cc.Node){
        // let id = this.curBtn["id"];
        // let 
        if(this.curBtn){
            if(btn!=this.curBtn){
                this.view["select_"+this.curBtn["id"]].active = false;
                this.view["text_"+this.curBtn["id"]].color = new cc.Color().fromHEX("#414144");
                this.curBtn.scale = 1;
                this.curBtn = btn;
                this.view["select_"+this.curBtn["id"]].active = true;
                this.view["text_"+this.curBtn["id"]].color = new cc.Color().fromHEX("#E5C29F");
            }else{
                this.curBtn.scale = 1;
            }
        }else{
            //默认为大厅
            this.curBtn = this.view["menu_btn_lobby"];
            this.curBtn.scale = 1.2;
            this.view["select_"+this.curBtn["id"]].active = true;
            this.view["text_"+this.curBtn["id"]].color = new cc.Color().fromHEX("#E5C29F");
        }
        if(btn){
            this.curBtn.stopAllActions();
            this.curBtn.scale = 0.7;
            cc.tween(this.curBtn).to(0.1,{scale:1.2}).start()
        }
    }
}
