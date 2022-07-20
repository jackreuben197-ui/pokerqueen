import { GameConfig } from "../../config/GameConfig";
import ToastManager from "../../manager/ToastManager";
import { ClientMessageRegister, ServerMessageRegister } from "../../protobuf/holdem/req_register_pb";
import GameSession from "../../session/GameSession";
import { Web_WS } from "../https/WebRequest";
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
            console.log("%c%s", "color:yellow;background:#780404", "websocket connect:" + WebSocketClient.Host_Port);
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
        console.log("%c%s", "color:yellow;background:#780404", "websocket connect success:" + WebSocketClient.Host_Port);
        if (!WebSocketClient._onConnent) {
            WebSocketClient._onConnent = true;
            GameSession.Send({ protocol: new ClientMessageRegister(), RoomID: 0, MatchID: 0 });
        } else {

        }
    }
    private static onerror(this: WebSocket, ev: Event) {
        console.log("%c%s", "color:yellow;background:#780404", "websocket connect error:" + WebSocketClient.Host_Port);
    }
    private static onmessage(this: WebSocket, ev: MessageEvent) {
        console.log("%c%s", "color:yellow;background:#780404", "websocket connect onmessage:");
    }
    private static onclose(this: WebSocket, ev: CloseEvent) {
        console.log("%c%s", "color:yellow;background:#780404", "websocket connect close:" + WebSocketClient.Host_Port);
    }

    public static Send(code: number, msg: { RoomID: number, MatchID: number }) {
        let ab = new ArrayBuffer(18);
        let dataView = new DataView(ab);
        //dataView.setInt16()
    }

}
