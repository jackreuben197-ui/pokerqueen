import { GameConfig } from "../config/GameConfig";
import { UIDefine } from "../define/UIDefine";
import UpdateComponent from "../funcomponent/UpdateComponent";
import SceneManager from "../manager/SceneManager";
import { Web_WS } from "../net/https/WebRequest";
import PacketHead from "../net/websocket/PacketHead";
import WebSocketClient from "../net/websocket/WebSocketClient";
import LobbySession from "../session/LobbySession";
import ProcedureBase from "./ProcedureBase";

/**
 * 大厅进程
 */
export default class ProcedureLobby extends ProcedureBase {

    Name: string = "ProcedureLobby";

    lateEnter(param?: any) {
        super.lateEnter(param);
        if (!param?.leaveRoom) {
            PacketHead.Init();
            LobbySession.Init();
            WebSocketClient.Connect();
        }
        SceneManager.ins.switchScene(UIDefine.LobbyScene);
    }
    Leave() {
        super.Leave();
    }
}
