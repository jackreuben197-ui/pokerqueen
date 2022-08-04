
import { Bundle, ProcedureEnum } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import GameCache from "../manager/GameCache";
import ProcedureManager from "../manager/ProcedureManager";
import SceneManager from "../manager/SceneManager";
import UIManager from "../manager/UIManager";
import ProcedureBase from "./ProcedureBase";

/**
 * 进入牌桌进程
 */
export default class ProcedureEnterTexas extends ProcedureBase {

    Name: string = "ProcedureEnterTexas";

    lateEnter(param?: any) {
        super.lateEnter(param);
        //显示房间进入loading
        UIManager.open(UIDefine.TexasPreLoad, { bundleName: Bundle.Texas, completeHandler: this.completeHandler.bind(this), errorHandler: this.errorHandler.bind(this) });
        //连接服务器进入房间
    }
    Leave() {
        super.Leave();
    }

    completeHandler() {
        UIManager.close(this.param?.[0]);
        ProcedureManager.StartProcedure(ProcedureEnum.Texas, this.param);
    }
    errorHandler() {
        UIManager.close(UIDefine.TexasPreLoad);
        ProcedureManager.StartProcedure(ProcedureEnum.Lobby, { ignoreEnter: true });
    }
}
