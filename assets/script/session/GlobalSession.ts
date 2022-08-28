import { ProcedureEnum } from "../define/EIDefine";
import UpdateComponent from "../funcomponent/UpdateComponent";
import { GameCache } from "../game/GameCache";
import ProcedureManager from "../manager/ProcedureManager";
import UIManager from "../manager/UIManager";
import WebSocketClient from "../net/websocket/WebSocketClient";

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
        UIManager.closeAll();
        WebSocketClient.Close();
        UpdateComponent.RemoveAll();
        ProcedureManager.StartProcedure(ProcedureEnum.Login);
    }

}
