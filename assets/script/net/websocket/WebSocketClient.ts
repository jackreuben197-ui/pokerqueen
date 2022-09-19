import { GameConfig, LogStyle } from "../../config/GameConfig";
import ToastManager from "../../manager/ToastManager";
import { Web_WS } from "../https/WebRequest";
import ProtocolAgency from "./ProtocolAgency";
import { Protocol_Holdem_Register } from "./ProtocolHoldemMessages";

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

    static _reconnectTime: number = 0;

    public static Connect() {
        this.Host = GameConfig.Network?.LoginHost;
        this.Port = Web_WS.Response?.data?.port;
        this.Host_Port = `ws://${this.Host}:${this.Port}`;
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
            protocol: Protocol_Holdem_Register,
            RoomID: 0,
            MatchID: 0,
            body: Protocol_Holdem_Register.Request(),
        });
    }
    private static onerror(ev: Event) {
        console.log("%c%s", LogStyle.ws_response, ">>>>> websocket onerror:" + WebSocketClient.Host_Port);
    }
    private static onmessage(ev: MessageEvent) {
        //console.log("%c%s", LogStyle.ws_response, ">>>>> websocket onmessage:", ev?.data);
        ProtocolAgency.Receive(ev?.data);
    }
    private static onclose(ev: CloseEvent) {
        console.log("%c%s", LogStyle.ws_response, ">>>>> websocket onclose:" + WebSocketClient.Host_Port);
        console.log("close reason : > ", ev.reason);
        WebSocketClient.CleanWS();
        if (WebSocketClient.ToClose) {
            WebSocketClient.ToClose = false;
        } else {
            //尝试重连
            WebSocketClient.Reconnect();
        }
    }

    private static Reconnect() {
        if (WebSocketClient._reconnectTime < WebSocketClient.ReconnectMaxTime) {
            WebSocketClient._reconnectTime++;
            console.log("%c%s", LogStyle.ws_request, `reconnect:${WebSocketClient._reconnectTime} ${WebSocketClient.Host_Port}`);
            this.__connect();
        } else {
            console.log("重连次数结束");
        }
    }
    //主动关闭
    static Close() {
        if (this.WS) {
            this.WS.close();
            this.ToClose = true;
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