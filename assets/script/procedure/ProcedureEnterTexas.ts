
import { Bundle, ProcedureEnum } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import ProcedureManager from "../manager/ProcedureManager";
import UIComponent from "../ui/UIComponent";
import ProcedureBase from "./ProcedureBase";

/**
 * 进入牌桌进程
 */
export default class ProcedureEnterTexas extends ProcedureBase {

    Name: string = "ProcedureEnterTexas";

    lateEnter(param?: any) {
        super.lateEnter(param);
        //显示房间进入loading
        UIComponent.open(UIDefine.TexasPreLoad, { bundleName: Bundle.Texas, completeHandler: this.completeHandler.bind(this), errorHandler: this.errorHandler.bind(this) });

    }
    Leave() {
        super.Leave();
    }

    completeHandler() {
        //UIComponent.close(this.param?.[0]);
        ProcedureManager.StartProcedure(ProcedureEnum.Texas, this.param);
    }
    errorHandler() {
        UIComponent.close(UIDefine.TexasPreLoad);
        ProcedureManager.StartProcedure(ProcedureEnum.Lobby, { ignoreEnter: true });
    }
}
