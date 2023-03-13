const { ccclass, property } = cc._decorator;
import GC from "../../frame/GameControl";
import { Web_Config_Global_Config, Web_Misc_Banner_List, WWW } from "../../net/https/WebRequest";
import UILobbyIndex from "../../new_lobby/index/UILobbyIndex";
import BaseScene from "../../ui/scene/BaseScene";
import UIComponent from "../../ui/UIComponent";
import { LobbyControl } from "../control/LobbyControl";
import UILobbyMenu from "./UILobbyMenu";
import UIMatchBanner from "./UIMatchBanner";
import UIMatchRoom from "./UIMatchRoom";

@ccclass
export default class LobbyScene extends BaseScene {
    private currUI: cc.Node = null;
    private Layer: cc.Node = null;

    UILobby_Menu: UILobbyMenu = null;

    onLoad(): void {
        super.onLoad();
        this.UILobby_Menu = this.getChildNodeOrComponent("UILobby_Menu", UILobbyMenu);
        this.Layer = this.getChildNodeOrComponent("Layer");

        // let widget: cc.Widget = this.node.getComponent(cc.Widget);
        // widget.target = cc.find("Canvas");

        LobbyControl.getInstance().setLobbyInfo({
            curShowUI: this.currUI,
            Layer: this.Layer
        })
    }
    protected lateEnter(param) {

        console.log("进入大厅--->", param);

        if (param.mode == 0) {
            this.UILobby_Menu.onShow();
            this.setLooby();
        }

        if (param.mode == 1 && param.table_type == 0) {
            this.readyComplete();
        }
    }
    /**
     * @description: 首次进入大厅的时候异步处理一些数据
     * @return {*}
     */
    public async setLooby() {

        await LobbyControl.getInstance().switchContent("UILobbyIndex", "main/lobby/index/");
        //await LobbyControl.getInstance().switchContent("UILobby");
        //刷新banner数据 
        //this.refreshBanner();
        //一些配置请求准备
        this.toReady();
    }

    //刷新banner
    public refreshBanner(): void {
        let language = GC.localStore.getItem("language");
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
    private toReady() {
        GC.data.lobby.reqLobbyGroupData(() => {
            this.refreshConfig();
        });
    }
    private async refreshConfig() {
        await WWW.Instance.CommonAPI({ web_class: Web_Config_Global_Config });
        this.readyComplete();
    }
    //大厅相关数据加载完成
    private readyComplete(): void {
        console.log("====== lobby readyComplete! ======");
        UIComponent.Instance.getComponent<UILobbyIndex>("UILobbyIndex").run();
    }
}
