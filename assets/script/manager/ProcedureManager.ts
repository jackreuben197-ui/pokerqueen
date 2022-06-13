/**
 * 全局流程管理器
 */

import { ProcedureEnum } from "../define/GlobalEnum";
import ProcedureBase from "../procedure/ProcedureBase";
import ProcedureInit from "../procedure/ProcedureInit";
import ProcedurePreLoading from "../procedure/ProcedurePreloading";

export default class ProcedureManager {

    private static procedureDic: { [key: number]: ProcedureBase } = {};
    public static prevProcedure: ProcedureBase = null;
    public static currProcedure: ProcedureBase = null;

    static Init() {

        this.procedureDic[ProcedureEnum.Init] = new ProcedureInit();
        this.procedureDic[ProcedureEnum.Preloading] = new ProcedurePreLoading();

        //this.procedureDic[ProcedureEnum.Init] = new ProcedureInit();
        //this.procedureDic[ProcedureEnum.Init] = new ProcedureInit();
        //this.procedureDic[ProcedureEnum.Init] = new ProcedureInit();
        ProcedureManager.StartProcedure(ProcedureEnum.Init);

        //@ts-ignore
        window.ProcedureManager = ProcedureManager;
    }

    static StartProcedure(procedureIndex: number, param: any = null) {
        let procedure = this.procedureDic[procedureIndex];
        if (!procedure) return;
        ProcedureManager.currProcedure = procedure;
        let prevProcedure = ProcedureManager.prevProcedure;
        if (prevProcedure) {
            if (prevProcedure.Name == procedure.Name) return;
            prevProcedure.Leave();
        }
        cc.log("[上个流程:", prevProcedure && prevProcedure.Name, "切换到==>当前流程:", procedure.Name, "]");
        ProcedureManager.prevProcedure = procedure;
        procedure.Enter(param);
    }

}
