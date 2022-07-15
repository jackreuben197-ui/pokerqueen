import { GameConfig } from "../config/GameConfig";
import { UIDefine } from "../define/UIDefine";
import SceneManager from "../manager/SceneManager";
import { Web_WS } from "../net/https/WebRequest";
import LobbySession from "../session/LobbySession";
import ProcedureBase from "./ProcedureBase";

/**
 * 大厅进程
 */
export default class ProcedureLobby extends ProcedureBase {
    Enter(param: any) {
        super.Enter(param);
        SceneManager.ins.switchScene(UIDefine.LobbyScene);
        //请求
        // LobbySession.APIConfig_Global_Config();
        // LobbySession.APIConfig_Multi_Language_Template();
        // LobbySession.APIMiscBannerList(1, 10, 0);
        // LobbySession.RequestListSummary();
        // LobbySession.APIMsgMessageUnread();

        //"dev.k8s.awanptesting.com"
        //ws://18.136.114.192:
        let host_port = `ws://${GameConfig.Network.LoginHost}:${Web_WS.Response.data.port}`;
        let ws = new WebSocket(host_port);
        console.log("%c%s", "color:yellow;background:#780404", "websocket connect:" + host_port);

        ws.onopen = () => {
            cc.log(">>>ws.onopen");
        }
        ws.onerror = () => {
            cc.log(">>>ws.onerror");
        }
        ws.onmessage = () => {
            cc.log(">>>ws.onmessage");
        }
        ws.onclose = () => {
            cc.log(">>>ws.onclose");
        }

    }
    Leave() {
        super.Leave();
    }

}
