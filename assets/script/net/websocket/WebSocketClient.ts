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
    //判断连接上(处理首次发送注册消息)
    static _onConnent: boolean = false;

    static Connect() {
        this.Host = GameConfig.Network?.LoginHost;
        this.Port = Web_WS.Response?.data?.port;
        if (this.Host && this.Port) {
            if (GameConfig.IsNewArea) {
                this.Host_Port = `ws://${this.Host}:${this.Port}`;
                this.Host_Port = `ws://10.20.10.149:15000`;
            } else {
                this.Host_Port = `ws://${this.Host}:${this.Port}`;
            }
            this.WS = new WebSocket(this.Host_Port);
            console.log("%c%s", LogStyle.ws_request, ">>>>> websocket connect:" + WebSocketClient.Host_Port);
            this.WS.binaryType = "arraybuffer";
            this.WS.onopen = this.onopen.bind(this);
            this.WS.onerror = this.onerror.bind(this);
            this.WS.onmessage = this.onmessage.bind(this);
            this.WS.onclose = this.onclose.bind(this);
        } else {
            ToastManager.Instance.createToast("host or port is error!");
        }
    }
    private static onopen(this: WebSocket, ev: Event) {
        console.log("%c%s", LogStyle.ws_response, ">>>>> websocket connect success:" + WebSocketClient.Host_Port);
        if (!WebSocketClient._onConnent) {
            WebSocketClient._onConnent = true;
            //发送握手后的注册
            ProtocolAgency.Send({
                protocol: Protocol_Holdem_Register,
                RoomID: 0,
                MatchID: 0,
                body: Protocol_Holdem_Register.Request(),
            });
        } else {

        }
    }
    private static onerror(this: WebSocket, ev: Event) {
        console.log("%c%s", LogStyle.ws_response, ">>>>> websocket onerror:" + WebSocketClient.Host_Port);
    }
    private static onmessage(this: WebSocket, ev: MessageEvent) {
        //console.log("%c%s", LogStyle.ws_response, ">>>>> websocket onmessage:", ev?.data);
        ProtocolAgency.Receive(ev?.data);
    }
    private static onclose(this: WebSocket, ev: CloseEvent) {
        console.log("%c%s", LogStyle.ws_response, ">>>>> websocket onclose:" + WebSocketClient.Host_Port);
        console.log("close reason : > ", ev.reason);
        WebSocketClient._onConnent = false;
    }
    //主动关闭
    static Close() {
        if (this.WS && WebSocketClient._onConnent) {
            this.WS.close();
        }
    }
}
(window as any).WebSocketClient = WebSocketClient;