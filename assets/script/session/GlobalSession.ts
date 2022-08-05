import { ProcedureEnum } from "../define/EIDefine";
import UpdateComponent from "../funcomponent/UpdateComponent";
import ProcedureManager from "../manager/ProcedureManager";
import UIManager from "../manager/UIManager";
import WebSocketClient from "../net/websocket/WebSocketClient";

export default class GlobalSession {

    static get NowTime(): number {
        return + new Date().getTime() / 1000;
    }

    //游戏登出
    static Logout() {
        cc.log("-------------游戏登出--------------");
        //清理面板
        UIManager.closeAll();
        ProcedureManager.StartProcedure(ProcedureEnum.Login);
        WebSocketClient.Close();
        UpdateComponent.RemoveAll();
    }
}
