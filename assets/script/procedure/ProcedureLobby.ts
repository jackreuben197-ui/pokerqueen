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

    tokenRefreshComponent


    Enter(param: any) {
        super.Enter(param);
        SceneManager.ins.switchScene(UIDefine.LobbyScene);
        //请求
        // LobbySession.APIConfig_Global_Config();
        // LobbySession.APIConfig_Multi_Language_Template();
        // LobbySession.APIMiscBannerList(1, 10, 0);
        // LobbySession.RequestListSummary();
        // LobbySession.APIMsgMessageUnread();
        PacketHead.Init();
        WebSocketClient.Connect();
    }
    Leave() {
        super.Leave();
    }
}
