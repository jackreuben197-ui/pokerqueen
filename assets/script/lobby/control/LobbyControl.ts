import HttpRequest from "../../net/https/HttpRequest";
import { Web_Config_Multi_Language_Template, Web_Misc_Banner_List, Web_Room_Center_Groups, Web_Room_Center_Rooms, Web_Room_Center_Rooms_Blinds } from "../../net/https/WebRequest";

/**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈ ꧁༺ ༒ ༻꧂≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
    大厅逻辑控制器
        1.网络交互
            1.1 
        2.
 ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈ ༺༒༻ ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/

export class LobbyControl {

    

    /********************************* 1.网络交互 ***********************************/

    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        1.1 请求banner数据
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
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



    /********************************* 网络交互 ***********************************/

    /********************************* 网络交互 ***********************************/

















    private static instance: LobbyControl;
    private constructor() {}
    static getInstance() {
        if (!this.instance) {
            this.instance = new LobbyControl();
        }
        return this.instance;
    }
}