
import { Bundle, ProcedureEnum } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import Main from "../Main";
import ProcedureManager from "../manager/ProcedureManager";
import { Pre_Texas_Define } from "../manager/ResManager";
import UIComponent, { PrefabUI } from "../ui/UIComponent";
import ProcedureBase from "./ProcedureBase";

/**
 * 进入牌桌进程
 */
export default class ProcedureEnterTexas extends ProcedureBase {

    Name: string = "ProcedureEnterTexas";

    lateEnter(param?: any) {
        super.lateEnter(param);
        //显示房间进入loading
        UIComponent.Instance.ShowUI(PrefabUI.UIPreloading, { pre_define: Pre_Texas_Define, complete: this.onComplete.bind(this), error: this.errorHandler.bind(this) });

    }
    Leave() {
        super.Leave();
    }

    onComplete() {
        ProcedureManager.StartProcedure(ProcedureEnum.Texas, this.param);
    }
    errorHandler() {
        UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
        ProcedureManager.StartProcedure(ProcedureEnum.Lobby, { ignoreEnter: true });
    }
}
