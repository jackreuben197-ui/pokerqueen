import { GameConfig, LogStyle } from "../../config/GameConfig";
import ToastManager from "../../manager/ToastManager";
import { ClientMessageRegister, ServerMessageRegister } from "../../protobuf/holdem/req_register_pb";
import GameSession from "../../session/GameSession";
import { Web_WS } from "../https/WebRequest";
import ProtocolAgency from "./ProtocolAgency";
import { Protocol_Holdem_Register } from "./ProtocolHoldemMessages";

/**
 * WebSocket 客户端
 */
export default class WebSocketClient {

    static Host_Port: string = null;

    static WS: WebSocket = null;
    //判断连接上(处理首次发送注册消息)
    static _onConnent: boolean = false;

    static Connect() {
        let host: string = GameConfig.Network?.LoginHost;
        let port: number = Web_WS.Response?.data?.port;
        if (host && port) {
            this.Host_Port = `ws://${host}:${port}`;
            this.WS = new WebSocket(this.Host_Port);
            console.log("%c%s", LogStyle.ws_request, ">>>>> websocket connect:" + WebSocketClient.Host_Port);
            this.WS.binaryType = "arraybuffer";
            this.WS.onopen = this.onopen.bind(this);
            this.WS.onerror = this.onerror.bind(this);
            this.WS.onmessage = this.onmessage.bind(this);
            this.WS.onclose = this.onclose.bind(this);
        } else {
            ToastManager.ins.craeteToast("host or port is error!");
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
        console.log("%c%s", LogStyle.ws_response, ">>>>> websocket onmessage:", ev);
        ProtocolAgency.Receive(ev.data);
    }
    private static onclose(this: WebSocket, ev: CloseEvent) {
        console.log("%c%s", LogStyle.ws_response, ">>>>> websocket onclose:" + WebSocketClient.Host_Port);
    }

    public static Send(code: number, msg: { RoomID: number, MatchID: number }) {

    }

}
(window as any).WebSocketClient = WebSocketClient;