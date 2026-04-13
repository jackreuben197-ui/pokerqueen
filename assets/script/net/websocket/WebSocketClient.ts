import { GameConfig, LogStyle } from "../../config/GameConfig";
import GC from "../../frame/GameControl";
import ReconnectComponent from "../../funcomponent/ReconnectComponent";
import { GameCache } from "../../game/GameCache";
import TimeHelper from "../../helper/TimeHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import ToastManager from "../../manager/ToastManager";
import GlobalSession from "../../session/GlobalSession";
import LobbySession from "../../session/LobbySession";
import LoginSession from "../../session/LoginSession";
import UIComponent from "../../ui/UIComponent";
import { WebWs } from "../https/WebRequest";
import ProtocolAgency from "./ProtocolAgency";
import { ProtocolCode } from "./ProtocolCode";
import { ProtocolCommon } from "./ProtocolHoldemMessages";

/**
 * WebSocket 客户端
 */
export default class WebSocketClient {

    static Host_Port: string = null;

    //static Host: string = null;
    static Port: number = 25201;


    static WS: WebSocket = null;

    //主动关闭
    static ToClose: boolean = false;


    public static SetPort(port: number) {
        console.error("%c%s", LogStyle.ws_request, ">>>>> websocket connect Port:" + this.Port);
        this.Port = port;
        this.Host_Port = port ? GameConfig.Network.WSS.replace("{0}", `:${this.Port}`) : null;
    }

    public static Connect() {
        if (this.Host_Port) {
            this.__connect();
        } else {
            UIComponent.Instance.Toast("host or port is error!");
        }
    }
    private static __connect() {
        //this.Host_Port = this.Host_Port.replace("wss://test2.awanptest.com/api/channel/", `ws://test2.awanptest.com:25201/`);
        console.error("%c%s", LogStyle.ws_request, ">>>>> websocket connect Sanmi:" + this.Host_Port);
        this.WS = new WebSocket(this.Host_Port);
        this.WS.binaryType = "arraybuffer";
        this.WS.onopen = this.onopen;
        this.WS.onerror = this.onerror;
        this.WS.onmessage = this.onmessage;
        this.WS.onclose = this.onclose;
    }
    private static onopen(ev: Event) {
        console.log("%c%s", LogStyle.ws_response, ">>>>> websocket connect success Sanmi:" + WebSocketClient.Host_Port);
        ReconnectComponent.Instance.ResetReconnectTime();
        //发送握手后的注册
        ProtocolAgency.Send({
            Code: ProtocolCode.Protocol_Holdem_Register,
            RoomID: 0,
            MatchID: 0,
        });
    }
    private static onerror(ev: Event) {
        console.log("%c%s", LogStyle.ws_response, ">>>>> websocket onerror Sanmi:" + WebSocketClient.Host_Port);
    }
    private static onmessage(ev: MessageEvent) {
        //console.log("%c%s", LogStyle.ws_response, ">>>>> websocket onmessage:", ev?.lastEventId);
        ProtocolAgency.Receive(ev?.data);
    }
    private static onclose(ev: CloseEvent) {
        console.log("%c%s", LogStyle.ws_response, ">>>>> websocket onclose Sanmi:" + WebSocketClient.Host_Port);
        console.log("close reason  Sanmi: > ", ev.code, ev.reason, ev.wasClean);
        //停止心跳
        LobbySession.heartbeatComponent.active = false;
        WebSocketClient.CleanWS();
        //主动断开
        if (ev.code == 1005) {

        }
        //服务器断开
        if (ev.code == 1006) {
            ReconnectComponent.Instance.TryReconnect();
        }
    }

    static CheckOpen(close: boolean = false) {
        let result = this.WS?.readyState == WebSocket.OPEN;
        if (!result) {
            close || UIComponent.Instance.Toast("errorDefault");
            console.log("socket state:", this.WS?.readyState);
        }
        return result;
    }
    //主动关闭
    static Close() {
        if (this.CheckOpen(true)) {
            this.WS.close();
            GC.uc.RemoveAll();
        }
    }
    //清理ws
    static CleanWS() {
        if (this.WS) {
            this.WS.onopen = null;
            this.WS.onerror = null;
            this.WS.onmessage = null;
            this.WS.onclose = null;
            this.WS = null;
        }
    }
}
(window as any).WebSocketClient = WebSocketClient;