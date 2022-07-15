import { UIDefine } from "../define/UIDefine";
import SceneManager from "../manager/SceneManager";
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
    }
    Leave() {
        super.Leave();
    }

}
