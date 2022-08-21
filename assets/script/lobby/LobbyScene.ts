const { ccclass, property } = cc._decorator;
import BaseScene from "../../../assets/script/ui/scene/BaseScene";
import { ResManager } from "../../../assets/script/manager/ResManager";

import HttpRequest from "../../../assets/script/net/https/HttpRequest";
import { Web_Misc_Banner_List, Web_Room_Center_Rooms_Blinds, Web_Room_Center_Groups, Web_Room_Center_Rooms, Web_Config_Multi_Language_Template } from "../../../assets/script/net/https/WebRequest";
import UIMatchBanner from "./UIMatchBanner";
import UIMatchRoom from "./UIMatchRoom";
import UILobbyMenu from "./UILobbyMenu";
import UIBase from "../ui/UIBase";
@ccclass
export default class LobbyScene extends BaseScene {
    public static instance: LobbyScene = null;
    public uiMap = {};
    private currUI: cc.Node = null;
    private Layer: cc.Node = null;


    UILobby_Menu: UILobbyMenu = null;

    protected onLoad(): void {
        super.onLoad();
        this.UILobby_Menu = this.getChildNodeOrComponent("UILobby_Menu", UILobbyMenu);
        this.Layer = this.getChildNodeOrComponent("Layer");

        let widget: cc.Widget = this.node.getComponent(cc.Widget);
        widget.target = cc.find("Canvas");
        if (LobbyScene.instance === null) {
            LobbyScene.instance = this;
        } else {
            this.destroy();
            return;
        }
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
        await this.switchContent("UILobby");
        //刷新banner数据 
        this.refreshBanner();
        //刷新房间的数据
        this.refreshRoom();
    }
    /**
     * @description: 场景切换
     * @param {string} content
     * @return {*}
     */
    public async switchContent(content: string) {

        if (this.currUI && content === this.currUI.name) {
            return;
        }

        return new Promise((resolve, reject) => {
            let newUI = this.uiMap[content];
            if (newUI) {
                if (this.currUI) this.currUI.active = false;
                newUI.active = true;
                this.currUI = newUI;
                this.currUI.getComponent(UIBase)?.onShow();
                resolve(newUI);
            } else {
                ResManager.Load(null, "lobby/prefab/" + content, cc.Prefab, (err, asset: cc.Prefab) => {
                    if (err) {
                        return;
                    }
                    if (this.currUI) this.currUI.active = false;
                    newUI = cc.instantiate(asset);
                    this.Layer.addChild(newUI);
                    this.currUI = newUI;
                    this.uiMap[content] = newUI;
                    newUI.active = true;
                    this.currUI.getComponent(UIBase)?.onShow();
                    resolve(newUI);
                });
            }
        })
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
        this.GetBannerList(data).then((res) => {
            UIMatchBanner.instance.onShow(res);
        })
    }
    //刷新room
    public refreshRoom(): void {
        this.RequestListSummary({}).then((res) => {
            UIMatchRoom.instance.onShow(res);
        })
    }
    /**
    * @description: 请求banner数据
    * @return {Web_Misc_Banner_List.Response}
    */
    async GetBannerList(param: typeof Web_Misc_Banner_List.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Misc_Banner_List,
                body: Web_Misc_Banner_List.Request(
                    {
                        lang: param.lang,        // 语言(zh_CN:简体中文,zh_HK:繁体中文,en_US:英文，pt_BR：葡萄牙语
                        type: param.type,        // 1-大厅Banner,2-发现页(工会)Banner
                        limit: param.limit,        // unity 默认10
                        offset: param.offset,        // 开始下标。例子（offset=0，limit=10，0-9。)默认0
                    }),
                onSuccess: function () {
                    resolve(Web_Misc_Banner_List.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
     * @description: 请求房间列表统计信息
     * @return {Web_Room_Center_Groups.Response}
     */
    async RequestListSummary(param: typeof Web_Room_Center_Groups.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Room_Center_Groups,
                body: Web_Room_Center_Groups.Request(param),
                onSuccess: function () {
                    resolve(Web_Room_Center_Groups.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
    * @description: 请求mang信息
    * @return {Web_Room_Center_Rooms_Blinds.Response}
    */
    async RequestSbList(param: typeof Web_Room_Center_Rooms_Blinds.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Room_Center_Rooms_Blinds,
                body: Web_Room_Center_Rooms_Blinds.Request(param),
                onSuccess: function () {
                    resolve(Web_Room_Center_Rooms_Blinds.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
     * @description: 请求rooms信息
     * @return {Web_Room_Center_Rooms.Response}
     */
    async APIWebRoomCenterRooms(param: typeof Web_Room_Center_Rooms.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Room_Center_Rooms,
                body: Web_Room_Center_Rooms.Request(param),
                onSuccess: function () {
                    resolve(Web_Room_Center_Rooms.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
    * @description: 请求rooms信息
    * @return {Web_Config_Multi_Language_Template.Response}
    */
    async APIConfig_Multi_Language_Template(param: typeof Web_Config_Multi_Language_Template.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Config_Multi_Language_Template,
                body: Web_Config_Multi_Language_Template.Request(param),
                onSuccess: function () {
                    resolve(Web_Config_Multi_Language_Template.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
}
