const { ccclass, property } = cc._decorator;
import BaseScene from "../../ui/scene/BaseScene";
import { ResManager } from "../../manager/ResManager";
import { Web_Misc_Banner_List } from "../../net/https/WebRequest";
import UIMatchBanner from "./UIMatchBanner";
import UIMatchRoom from "./UIMatchRoom";
import UILobbyMenu from "./UILobbyMenu";
import UIBase from "../../ui/UIBase";
import { LobbyControl } from "../control/LobbyControl";

@ccclass
export default class LobbyScene extends BaseScene {
    // public static instance: LobbyScene = null;
    private currUI: cc.Node = null;
    private Layer: cc.Node = null;


    UILobby_Menu: UILobbyMenu = null;

    protected onLoad(): void {
        super.onLoad();
        this.UILobby_Menu = this.getChildNodeOrComponent("UILobby_Menu", UILobbyMenu);
        this.Layer = this.getChildNodeOrComponent("Layer");

        let widget: cc.Widget = this.node.getComponent(cc.Widget);
        widget.target = cc.find("Canvas");

        LobbyControl.getInstance().setLobbyInfo({
            curShowUI: this.currUI,
            Layer: this.Layer
        })
        // if (LobbyScene.instance === null) {
        //     LobbyScene.instance = this;
        // } else {
        //     this.destroy();
        //     return;
        // }
    }
    protected lateEnter() {

        this.UILobby_Menu.onShow();
        this.setLooby();
    }
    /**
     * @description: 首次进入大厅的时候异步处理一些数据
     * @return {*}
     */
    public async setLooby() {
        await LobbyControl.getInstance().switchContent("UILobby");
        //刷新banner数据 
        this.refreshBanner();
        //刷新房间的数据
        this.refreshRoom();
    }
    
    //刷新banner
    public refreshBanner(): void {
        let language = cc.sys.localStorage.getItem("language");
        let data: typeof Web_Misc_Banner_List.RequestParams = {};
        // data.lang = language||cc.sys.language;
        data.lang = "zh_CN";
        data.type = 1;
        data.limit = 10;
        data.offset = 0;
        LobbyControl.getInstance().GetBannerList(data).then((res) => {
            UIMatchBanner.instance.onShow(res);
        })
    }
    //刷新room
    public refreshRoom(): void {
        LobbyControl.getInstance().RequestListSummary({}).then((res) => {
            UIMatchRoom.instance.onShow(res);
        })
    }
}
