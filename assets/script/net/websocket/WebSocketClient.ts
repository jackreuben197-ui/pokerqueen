import { GameConfig } from "../../config/GameConfig";
import ToastManager from "../../manager/ToastManager";
import { Web_WS } from "../https/WebRequest";

/**
 * WebSocket 客户端
 */
export default class WebSocketClient {

    static Host_Port: string = null;

    static WS: WebSocket = null;

    static Connect() {
        let host: string = GameConfig.Network?.LoginHost;
        let port: number = Web_WS.Response?.data?.port;
        if (host && port) {
            this.Host_Port = `ws://${host}:${port}`;
            this.WS = new WebSocket(this.Host_Port);
            console.log("%c%s", "color:yellow;background:#780404", "websocket connect:" + WebSocketClient.Host_Port);
            this.WS.onopen = this.onopen;
            this.WS.onerror = this.onerror;
            this.WS.onmessage = this.onmessage;
            this.WS.onclose = this.onclose;
        } else {
            ToastManager.ins.craeteToast("host or port is error!");
        }
    }
    private static onopen(this: WebSocket, ev: Event) {
        console.log("%c%s", "color:yellow;background:#780404", "websocket connect success:" + WebSocketClient.Host_Port);
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

}
