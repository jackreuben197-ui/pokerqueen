/**
 * 大厅Session
 */

import Dispatcher from "../event/Dispatcher";
import HeartbeatComponent from "../funcomponent/HeartbeatComponent";
import TokenRefreshComponent from "../funcomponent/TokenRefreshComponent";
import UpdateComponent from "../funcomponent/UpdateComponent";
import HttpRequest from "../net/https/HttpRequest";
import { Web_Config_Global_Config, Web_Config_Multi_Language_Template, Web_Misc_Banner_List, Web_Msg_Message_Unread, Web_Room_Center_Groups, Web_User_Room_insur } from "../net/https/WebRequest";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { Protocol_Holdem_Register } from "../net/websocket/ProtocolHoldemMessages";
import LoginSession from "./LoginSession";

export default class LobbySession {

    //房间名多语言配置
    static RoomLanguageDic_CN = {};
    static RoomLanguageDic_US = {};
    static RoomLanguageDic_BR = {};
    //开关数据
    static Switch: any = {};

    public static tokenRefreshComponent: TokenRefreshComponent;
    public static heartbeatComponent: HeartbeatComponent;

    public static cache_data = {
        serviceId: null,
        roomName: null,
        room_type: null,
        game_type: null,
        poker_type: null,
        bet_type: null,
        room_id: null,
        seat_count: null,
        straddle: null,
        insurance: null,
        muck_switch: null,
        voiceprint_verify_on: null,
        voiceprint_verify_duration: null,
        match_id: null,
    }
    //只初始化一次
    static _initOnce: boolean = false;

    static Init() {
        if (!this._initOnce) {
            this._initOnce = true;
            this.tokenRefreshComponent = new TokenRefreshComponent;
            this.heartbeatComponent = new HeartbeatComponent;
            UpdateComponent.Add(this.tokenRefreshComponent);
            UpdateComponent.Add(this.heartbeatComponent);
            this.regiterEvents();
        }
        this.tokenRefreshComponent.start();
    }

    static regiterEvents() {
        Dispatcher.on(ProtocolCode.Protocol_Holdem_Register, this.on_Protocol_Holdem_Register, this);
    }

    private static on_Protocol_Holdem_Register(body: typeof Protocol_Holdem_Register.Response_AsObject) {
        if (!body) {
            return;
        }
        if (body.status == 0) {
            this.heartbeatComponent.start();
        } else {
            LoginSession.LoginOut();
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


    /**
    * 设置该房间保险赔率表
    */
    static APIWebUserRoominsur() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                api: Web_User_Room_insur.API.replace("{id}", this.cache_data.room_id.toString()),
                request: Web_User_Room_insur,
                onSuccess: function () {
                    //TODO 广播刷新
                    //Web_User_Room_insur.Response.data
                    resolve(Web_User_Room_insur.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }



    // <summary>
    /// 设置该房间保险赔率表
    /// </summary>
    /// <param name="pAct"></param>
    // public void APIWebUserRoominsur(Action<Web_User_Room_insur.ResponseData> pAct)
    // {
    // 	var paramas = new Web_User_Room_insur.RequestData() { };
    // 	HttpRequestComponent.Instance.Send(StringHelper.GetWebUrlString(Web_User_Room_insur.API, GameCache.Instance.room_id.ToString()), Web_User_Room_insur.Request(paramas), RequestData =>
    // 	{
    // 		var tResp = Web_User_Room_insur.Response(RequestData);

    // 		if (pAct != null)
    // 		{
    // 			if (tResp.code == 0)
    // 			{
    // 				GameUtil.OutsList.Clear();
    // 				foreach (var outs in tResp.data)
    // 				{
    // 					List<float> OddsAndOuts = new List<float>();
    // 					foreach (var item in outs.detail)
    // 					{
    // 						OddsAndOuts.Add((float)item.odds);
    // 					}
    // 					GameUtil.OutsList.Add((uint)outs.pot_user_count, OddsAndOuts);
    // 				}
    // 			}
    // 			pAct(tResp);
    // 		}
    // 	});
    // }







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


