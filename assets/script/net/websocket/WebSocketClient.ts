import { GameConfig, LogStyle } from "../../config/GameConfig";
import TimeHelper from "../../helper/TimeHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import ToastManager from "../../manager/ToastManager";
import GlobalSession from "../../session/GlobalSession";
import LoginSession from "../../session/LoginSession";
import UIComponent from "../../ui/UIComponent";
import { Web_WS } from "../https/WebRequest";
import ProtocolAgency from "./ProtocolAgency";
import { ProtocolCode } from "./ProtocolCode";
import { ProtocolCommon } from "./ProtocolHoldemMessages";

/**
 * WebSocket 客户端
 */
export default class WebSocketClient {

    static Host_Port: string = null;

    static Host: string = null;
    static Port: number = 0;


    static WS: WebSocket = null;

    //主动关闭
    static ToClose: boolean = false;
    //尝试重连总次数
    static ReconnectMaxTime: number = 3;
    //断开3秒重连
    static ReconnectDelay: number = 3000;

    static _reconnectTime: number = 0;

    public static Connect() {
        this.Host = GameConfig.Network?.LoginHost;
        this.Port = Web_WS.Response?.data?.port;

        if (GameConfig.Network.WSS) {
            this.Host_Port = GameConfig.Network.WSS;
        } else {
            this.Host_Port = `ws://${this.Host}:${this.Port}`;
        }
        if (this.Host && this.Port) {
            this.__connect();
        } else {
            ToastManager.Instance.createToast("host or port is error!");
        }
    }
    private static __connect() {
        this.WS = new WebSocket(this.Host_Port);
        console.log("%c%s", LogStyle.ws_request, ">>>>> websocket connect:" + WebSocketClient.Host_Port);
        this.WS.binaryType = "arraybuffer";
        this.WS.onopen = this.onopen;
        this.WS.onerror = this.onerror;
        this.WS.onmessage = this.onmessage;
        this.WS.onclose = this.onclose;
    }
    private static onopen(ev: Event) {
        console.log("%c%s", LogStyle.ws_response, ">>>>> websocket connect success:" + WebSocketClient.Host_Port);
        WebSocketClient._reconnectTime = 0;
        //发送握手后的注册
        ProtocolAgency.Send({
            Code: ProtocolCode.Protocol_Holdem_Register,
            RoomID: 0,
            MatchID: 0,
        });
    }
    private static onerror(ev: Event) {
        console.log("%c%s", LogStyle.ws_response, ">>>>> websocket onerror:" + WebSocketClient.Host_Port);
    }
    private static onmessage(ev: MessageEvent) {
        //console.log("%c%s", LogStyle.ws_response, ">>>>> websocket onmessage:", ev?.lastEventId);
        ProtocolAgency.Receive(ev?.data);
    }
    private static onclose(ev: CloseEvent) {
        console.log("%c%s", LogStyle.ws_response, ">>>>> websocket onclose:" + WebSocketClient.Host_Port);
        console.log("close reason : > ", ev.code, ev.reason, ev.wasClean);
        WebSocketClient.CleanWS();
        //主动断开
        if (ev.code == 1005) {

        }
        //服务器断开，请求Channel判断token是否无效
        if (ev.code == 1006) {
            LoginSession.SyncWS().then(
                //成功
                () => {
                    //尝试重连
                    WebSocketClient.Reconnect();
                },
                //失败
                () => {
                    UIComponent.Instance.Toast("Request Channel Fail");
                    GlobalSession.Logout();
                    UIComponent.Instance.Toast(i18nMgr.Get("clientInt_anormal"));
                }
            )
        }
    }

    private static async Reconnect() {
        if (WebSocketClient._reconnectTime < WebSocketClient.ReconnectMaxTime) {
            WebSocketClient._reconnectTime++;
            console.log("%c%s", LogStyle.ws_request, `reconnect:${WebSocketClient._reconnectTime} ${WebSocketClient.Host_Port}`);
            await TimeHelper.Sleep(this.ReconnectDelay);
            this.__connect();
        } else {
            console.log("重连次数结束");
        }
    }
    //主动关闭
    static Close() {
        if (this.WS && this.WS.readyState == WebSocket.OPEN) {
            this.WS.close();
            //this.ToClose = true;
        }
    }
    //清理ws
    static CleanWS() {
        this.WS.onopen = null;
        this.WS.onerror = null;
        this.WS.onmessage = null;
        this.WS.onclose = null;
        this.WS = null;
    }
}
(window as any).WebSocketClient = WebSocketClient;