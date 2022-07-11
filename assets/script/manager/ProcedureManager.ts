/**
 * 全局流程管理器
 */
import { ProcedureEnum } from "../define/EIDefine";
import ProcedureBase from "../procedure/ProcedureBase";
import ProcedureConfig from "../procedure/ProcedureConfig";
import ProcedureEnter from "../procedure/ProcedureEnter";
import ProcedureIdle from "../procedure/ProcedureIdle";
import ProcedureInit from "../procedure/ProcedureInit";
import ProcedureLogin from "../procedure/ProcedureLogin";
import ProcedurePreLoading from "../procedure/ProcedurePreloading";

export default class ProcedureManager {

    private static procedureDic: { [key: number]: ProcedureBase } = {};
    public static prevProcedure: ProcedureBase = null;
    public static currProcedure: ProcedureBase = null;

    static Init() {
        this.procedureDic[ProcedureEnum.Idel] = new ProcedureIdle();
        this.procedureDic[ProcedureEnum.Init] = new ProcedureInit();
        this.procedureDic[ProcedureEnum.Preloading] = new ProcedurePreLoading();
        this.procedureDic[ProcedureEnum.Config] = new ProcedureConfig();
        this.procedureDic[ProcedureEnum.Login] = new ProcedureLogin();
        this.procedureDic[ProcedureEnum.Enter] = new ProcedureEnter();
        ProcedureManager.StartProcedure(ProcedureEnum.Init);
    }
    //开始某个流程
    static StartProcedure(procedureIndex: number, param: any = null, doEnter: boolean = true) {
        let procedure = this.procedureDic[procedureIndex];
        if (!procedure) {
            cc.log("未定义流程:", ProcedureEnum[procedureIndex]);
            return;
        }
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
