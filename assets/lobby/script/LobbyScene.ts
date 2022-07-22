const { ccclass, property } = cc._decorator;
import BaseScene from "../../../assets/script/ui/scene/BaseScene";
import { ResManager } from "../../../assets/script/manager/ResManager";

import HttpRequest from "../../../assets/script/net/https/HttpRequest";
import { Web_Misc_Banner_List, Web_Room_Center_Rooms_Blinds, Web_Room_Center_Groups, Web_Room_Center_Rooms, Web_Config_Multi_Language_Template } from "../../../assets/script/net/https/WebRequest";
import UIMatchBanner from "./UIMatchBanner";
import UIMatchRoom from "./UIMatchRoom";
@ccclass
export default class LobbyScene extends BaseScene {
    public static instance: LobbyScene = null;
    public uiMap = {};
    private currUI: cc.Node = null;
    private Layer: cc.Node = null;
    protected onLoad(): void {
        super.onLoad();
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
        this.Layer = this.getChildNodeOrComponent("Layer");
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
        return new Promise((resolve, reject) => {
            let newUI = this.uiMap[content];
            if (newUI) {
                if (newUI.name === this.currUI.name) {
                    return;
                }
                if (this.currUI) {
                    this.currUI.opacity = 0;
                }
                newUI.opacity = 255;
                this.currUI = newUI;
                resolve(newUI);
            } else {
                ResManager.Load("lobby", "prefab/" + content, cc.Prefab, (err, asset: cc.Prefab) => {
                    if (err) {
                        return;
                    }
                    if (this.currUI) {
                        this.currUI.opacity = 0;
                    }
                    newUI = cc.instantiate(asset);
                    this.Layer.addChild(newUI);
                    this.currUI = newUI;
                    this.uiMap[content] = newUI;
                    newUI.active = true;
                    newUI.opacity = 255;
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
        this.GetRoomList({}).then((res) => {
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
                param: Web_Misc_Banner_List.Request(
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
     * @description: 请求RoomGroup数据
     * @return {Web_Room_Center_Groups.Response}
     */
    async GetRoomList(param: typeof Web_Room_Center_Groups.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Room_Center_Groups,
                param: Web_Room_Center_Groups.Request({}),
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
    async GetRoomBlinds(param: typeof Web_Room_Center_Rooms_Blinds.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Room_Center_Rooms_Blinds,
                param: Web_Room_Center_Rooms_Blinds.Request(param),
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
    async GetRoomsInfo(param: typeof Web_Room_Center_Rooms.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Room_Center_Rooms,
                param: Web_Room_Center_Rooms.Request(param),
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
    async GetLanguage(param: typeof Web_Config_Multi_Language_Template.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Config_Multi_Language_Template,
                param: Web_Config_Multi_Language_Template.Request(param),
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
