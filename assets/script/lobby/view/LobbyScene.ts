/*
 * @Author: xfj
 * @Date: 2023-03-23 20:28:06
 * @description:
 * @LastEditors:
 * @LastEditTime: 2023-03-29 16:25:37
 * @FilePath: /pokerqueen/assets/script/lobby/view/LobbyScene.ts
 */
const { ccclass } = cc._decorator;
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import { WebConfigGlobalConfig, WWW } from "../../net/https/WebRequest";
import UILobbyIndex from "../../new_lobby/index/UILobbyIndex";
import UILobbyIndexNew from "../../new_lobby/index/UILobbyIndexNew";
import BaseScene from "../../ui/scene/BaseScene";
import UIComponent from "../../ui/UIComponent";
import { LobbyControl } from "../control/LobbyControl";
import UILobbyMenu from "./UILobbyMenu";

@ccclass
export default class LobbyScene extends BaseScene {
    //private currUI: cc.Node = null;

    private layer: cc.Node = null;

    menu: UILobbyMenu = null;

    onLoad(): void {
        this.name = "LobbyScene";

        super.onLoad();

        this.layer = this.getChildNodeOrComponent("layer");
        this.menu = this.getChildNodeOrComponent("menu", UILobbyMenu);

        LobbyControl.getInstance().setLobbyInfo({
            //curShowUI: this.currUI,
            Layer: this.layer,
        });
    }
    protected lateEnter(param) {
        console.log("进入大厅--->", param);

        if (param.mode == 0) {
            this.menu.onShow();
            this.setLooby();
        }

        if (param.mode == 1 && param.table_type == 0) {
            this.readyComplete();
        }
        //编辑界面
        if (GC.data.user.isRegist) {
            UIComponent.open(UIDefine.UIEditMess);
        }
    }
    /**
     * @description: 首次进入大厅的时候异步处理一些数据
     * @return {*}
     */
    public async setLooby() {
        await LobbyControl.getInstance().switchContent(
            "UILobbyIndex",
            "main/lobby/index/",
        );
        //await LobbyControl.getInstance().switchContent("UILobbyIndexNew", "main/lobby/index/");
        this.toReady();
    }

    //刷新banner
    public refreshBanner(): void {
        // let language = GC.localStore.getItem("language");
        // let data: typeof WebMiscBannerList.RequestParams = {};
        // // data.lang = language||cc.sys.language;
        // data.lang = "zh_CN";
        // data.type = 1;
        // data.limit = 10;
        // data.offset = 0;
        // LobbyControl.getInstance().GetBannerList(data).then((res) => {
        //     UIMatchBanner.instance.onShow(res);
        // })
    }
    private toReady() {
        GC.data.lobby.reqLobbyGroupData(() => {
            this.refreshConfig();
        });
    }
    private async refreshConfig() {
        await WWW.Instance.CommonAPI({ web_class: WebConfigGlobalConfig });
        this.readyComplete();
    }
    //大厅相关数据加载完成
    private readyComplete(): void {
        console.log("====== lobby readyComplete! ======");
        UIComponent.Instance.getComponent<UILobbyIndex>("UILobbyIndex").run();
        //UIComponent.Instance.getComponent<UILobbyIndexNew>("UILobbyIndexNew").run();
    }
}
