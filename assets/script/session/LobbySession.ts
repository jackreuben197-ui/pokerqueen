/**
 * 大厅Session
 */

import { GameConfig } from "../config/GameConfig";
import GC from "../frame/GameControl";
import HeartbeatComponent from "../funcomponent/HeartbeatComponent";
import ReconnectComponent from "../funcomponent/ReconnectComponent";
import TokenRefreshComponent from "../funcomponent/TokenRefreshComponent";
import UpdateComponent from "../funcomponent/UpdateComponent";
import { GameCache } from "../game/GameCache";
import GameUtil from "../game/util/GameUtil";
import { i18nMgr } from "../i18n/i18nMgr";
import HttpRequest from "../net/https/HttpRequest";
import { WWW, Web_Config_Global_Config, Web_Config_Multi_Language_Template, Web_GetDiamondConfig, Web_Misc_Banner_List, Web_Msg_Message_Unread, Web_Room_Center_Groups, Web_User_Info, Web_User_Room_insur } from "../net/https/WebRequest";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { ServerMessageRegister } from "../protobuf/holdem/req_register_pb";

import GlobalSession from "./GlobalSession";
import LoginSession from "./LoginSession";


export default class LobbySession {

    //房间名多语言配置
    static RoomLanguageDic_CN = {};
    static RoomLanguageDic_US = {};
    static RoomLanguageDic_BR = {};
    //开关数据
    static Switch: any = {};

    public static tokenRefreshComponent: TokenRefreshComponent = null;
    public static heartbeatComponent: HeartbeatComponent = null;

    //只初始化一次
    static _initOnce: boolean = false;

    static Init() {
        if (!this._initOnce) {
            this._initOnce = true;
            this.tokenRefreshComponent = new TokenRefreshComponent;
            this.heartbeatComponent = new HeartbeatComponent;
            this.regiterEvents();
        }
        cc.log("注册心跳");
        GC.uc.AddComponent(this.tokenRefreshComponent);
        GC.uc.AddComponent(this.heartbeatComponent);
        this.heartbeatComponent.active = false;
    }

    static regiterEvents() {
        GC.notify.register(ProtocolCode.Protocol_Holdem_Register, this.on_Protocol_Holdem_Register, this);
    }

    private static on_Protocol_Holdem_Register(body: ServerMessageRegister.AsObject) {
        if (body?.status == 0) {
            this.heartbeatComponent.active = true;
            ReconnectComponent.Instance.ChangeStatus(1);

            if (GameCache.Instance.CurGame) {
                GameCache.Instance.CurGame.ReEnterRoom();
            } else {
                ReconnectComponent.Instance.HideMask();
            }
        } else {
            GlobalSession.Logout();
        }
    }
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
     * @param type 1-大厅Banner,2-公会Banner
     * @param limit 条目
     * @param offset 开始下标
     */
    static APIMiscBannerList(type: number, limit: number, offset: number) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Misc_Banner_List,
                body: Web_Misc_Banner_List.Request(
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
    /**
    * 设置该房间保险赔率表
    */
    static APIWebUserRoominsur(room_id: number) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                api: Web_User_Room_insur.API.replace("{id}", room_id.toString()),
                request: Web_User_Room_insur,
                onSuccess: function () {
                    //TODO 广播刷新
                    //Web_User_Room_insur.Response.data
                    GameUtil.OutsList.clear();
                    Web_User_Room_insur.Response.data.forEach(outs => {
                        let OddsAndOuts: number[] = [];
                        outs.detail.forEach(item => {
                            OddsAndOuts.push(item.odds);
                        });
                        GameUtil.OutsList.set(outs.pot_user_count, OddsAndOuts);
                    });
                    resolve(Web_User_Room_insur.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    //自已的个人信息
    static APIUserInfo() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_User_Info,
                onSuccess: function () {
                    LobbySession.CacheUserInfo(Web_User_Info.Response.data.user);
                    resolve(Web_User_Info.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    //缓存用户信息
    public static CacheUserInfo(info: typeof Web_User_Info.UserInfo) {

        GameCache.Instance.nUserId = info.un_id;
        // GameCache.Instance.gold = info.gold;
        GameCache.Instance.userId = info.p_u_id;
        GC.data.user.info.gold = info.gold;
        GameCache.Instance.strPhone = info.phone;
        GameCache.Instance.kDouNum = 0;
        GameCache.Instance.sex = info.sex;
        GameCache.Instance.nick = info.nickname;
        GameCache.Instance.headPic = info.avatar;
        GameCache.Instance.userType = info.ut;

        GameCache.Instance.isHadClub = info.club_id > 0;

        //localStorage.setItem(StorageKey.KEY_USERID, `${info.un_id}`);
        //localStorage.setItem(StorageKey.KEY_PHONE, `${info.phone}`);
        //localStorage.setItem(StorageKey.KEY_PHONE_FIRST, info.area.replace("+", ""));
        //localStorage.setItem(StorageKey.KEY_PHONE_FIRST, `${info.area}`);

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

    public static getLanguageValueByKey(key: string): string {

        key = key.split("-")[0];

        let dic = null;
        switch (i18nMgr.language) {
            case "cn":
                dic = this.RoomLanguageDic_CN;
                break;
            case "pt":
                dic = this.RoomLanguageDic_BR;
                break;
            case "en":
                dic = this.RoomLanguageDic_US;
                break;
            // case "zh":
            //     break;
        }
        return dic?.[key] || key;
    }
}
(window as any).LobbySession = LobbySession;


