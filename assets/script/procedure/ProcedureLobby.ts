
import { UIDefine } from "../define/UIDefine";
import SceneManager from "../manager/SceneManager";
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
        SceneManager.Instance.switchScene(UIDefine.LobbyScene);
    }
    Leave() {
        super.Leave();
    }
}
