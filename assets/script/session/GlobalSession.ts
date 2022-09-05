import { ProcedureEnum } from "../define/EIDefine";
import UpdateComponent from "../funcomponent/UpdateComponent";
import { GameCache } from "../game/GameCache";
import ProcedureManager from "../manager/ProcedureManager";
import WebSocketClient from "../net/websocket/WebSocketClient";
import UIComponent from "../ui/UIComponent";

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
        UIComponent.closeAll();
        WebSocketClient.Close();
        UpdateComponent.RemoveAll();
        ProcedureManager.StartProcedure(ProcedureEnum.Login);
    }

}
