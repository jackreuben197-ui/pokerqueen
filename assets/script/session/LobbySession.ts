/**
 * 大厅Session
 */

import HttpRequest from "../net/https/HttpRequest";
import { Web_Config_Global_Config, Web_Config_Multi_Language_Template, Web_Misc_Banner_List, Web_Msg_Message_Unread, Web_Room_Center_Groups } from "../net/https/WebRequest";


export default class LobbySession {

    //房间名多语言配置
    static RoomLanguageDic_CN = {};
    static RoomLanguageDic_US = {};
    static RoomLanguageDic_BR = {};
    //开关数据
    static Switch: any = {};

    /**
     * 获取全局配置
     */
    static APIConfig_Global_Config() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Config_Global_Config,
                onSuccess: function () {
                    LobbySession.parseGlobalConfig();
                    resolve(Web_Config_Global_Config.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
    * 获取房间名多语言配置
    */
    static APIConfig_Multi_Language_Template() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Config_Multi_Language_Template,
                onSuccess: function () {
                    LobbySession.parseRoomLanguase();
                    resolve(Web_Config_Multi_Language_Template.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
     * 
     * @param type 1-大厅Banner,2-工会Banner
     * @param limit 条目
     * @param offset 开始下标
     */

    static APIMiscBannerList(type: number, limit: number, offset: number) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Misc_Banner_List,
                param: Web_Misc_Banner_List.Request(
                    {
                        lang: "en_US",//当前语言
                        type: type,
                        limit: limit,
                        offset: offset,
                    }),
                onSuccess: function () {
                    //TODO 广播刷新
                    //Web_Misc_Banner_List.Response.data
                    resolve(Web_Misc_Banner_List.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
      * 请求大厅房间列表
      */
    static RequestListSummary() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Room_Center_Groups,
                onSuccess: function () {
                    //TODO 广播刷新
                    //Web_Room_Center_Groups.Response.data
                    resolve(Web_Room_Center_Groups.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
    * 请求未读消息列表
    */
    static APIMsgMessageUnread() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Msg_Message_Unread,
                onSuccess: function () {
                    //TODO 广播刷新
                    //Web_Msg_Message_Unread.Response.data
                    resolve(Web_Msg_Message_Unread.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }


    ///////////////////////////////////////////////////////////////////////////////////////
    /**
    * 解析开关
    */
    private static parseGlobalConfig() {
        let data = Web_Config_Global_Config.Response.data;
        LobbySession.Switch.mtt_switch = data.mtt_switch;
        LobbySession.Switch.normal_return_profit_switch = data.normal_return_profit_switch;
        LobbySession.Switch.apple_pay_switch = data.apple_pay_switch;
        LobbySession.Switch.apple_mtt_switch = data.apple_mtt_switch;
        LobbySession.Switch.android_mtt_switch = data.android_mtt_switch;
        LobbySession.Switch.android_pay_switch = data.android_pay_switch;
    }

    /**
     * 解析房间多语言配置
     */
    private static parseRoomLanguase() {
        let data = Web_Config_Multi_Language_Template.Response.data;
        LobbySession.cleanRoomLanguageDic();
        for (let room of data) {
            this.RoomLanguageDic_CN[room.template_id] = room.cn_name;
            this.RoomLanguageDic_US[room.template_id] = room.us_name;
            this.RoomLanguageDic_BR[room.template_id] = room.br_name;
        }
    }
    /**
     * 清理房间多语言配置
     */
    private static cleanRoomLanguageDic() {
        this.RoomLanguageDic_CN = {};
        this.RoomLanguageDic_US = {};
        this.RoomLanguageDic_BR = {};
    }
}
(window as any).LobbySession = LobbySession;


