import { ProcedureEnum } from "../define/EIDefine";
import GC from "../frame/GameControl";
import ReconnectComponent from "../funcomponent/ReconnectComponent";
import UpdateComponent from "../funcomponent/UpdateComponent";
import { GameCache } from "../game/GameCache";
import Main from "../Main";
import ProcedureManager from "../manager/ProcedureManager";
import WebSocketClient from "../net/websocket/WebSocketClient";
import UIComponent, { PrefabUI } from "../ui/UIComponent";
import LobbySession from "./LobbySession";
import LoginSession from "./LoginSession";

export default class GlobalSession {
    //单位秒
    static get NowTimeS(): number {
        return + new Date().getTime() / 1000;
    }
    //单位毫秒
    static get NowTimeMS(): number {
        return + new Date().getTime();
    }
    //游戏登出
    static Logout() {
        cc.log("-------------游戏登出--------------");
        //清理面板
        ReconnectComponent.Instance.HideMask();
        UIComponent.closeAll();
        LoginSession.LoginOut();
        WebSocketClient.Close();
        GC.uc.RemoveAll();
        UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
        //ProcedureManager.StartProcedure(ProcedureEnum.Login, { logout: true });
    }

}
(window as any).GlobalSession = GlobalSession;
