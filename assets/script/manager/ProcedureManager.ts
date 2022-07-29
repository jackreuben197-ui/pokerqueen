/**
 * 全局流程管理器
 */
import { ProcedureEnum } from "../define/EIDefine";
import ProcedureBase from "../procedure/ProcedureBase";
import ProcedureConfig from "../procedure/ProcedureConfig";
import ProcedureEnterLobby from "../procedure/ProcedureEnterLobby";
import ProcedureEnterTexas from "../procedure/ProcedureEnterTexas";
import ProcedureIdle from "../procedure/ProcedureIdle";
import ProcedureInit from "../procedure/ProcedureInit";
import ProcedureLobby from "../procedure/ProcedureLobby";
import ProcedureLogin from "../procedure/ProcedureLogin";
import ProcedurePreLoading from "../procedure/ProcedurePreloading";
import ProcedureTexas from "../procedure/ProcedureTexas";

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
        this.procedureDic[ProcedureEnum.EnterLobby] = new ProcedureEnterLobby();
        this.procedureDic[ProcedureEnum.Lobby] = new ProcedureLobby();
        this.procedureDic[ProcedureEnum.EnterTexas] = new ProcedureEnterTexas();
        this.procedureDic[ProcedureEnum.Texas] = new ProcedureTexas();

        ProcedureManager.StartProcedure(ProcedureEnum.Init);
    }
    //开始某个流程
    static StartProcedure(procedureIndex: number, param: any = null) {
        let procedure = this.procedureDic[procedureIndex];
        if (!procedure) {
            console.log("未定义流程:", ProcedureEnum[procedureIndex]);
            return;
        }
        ProcedureManager.currProcedure = procedure;
        let prevProcedure = ProcedureManager.prevProcedure;
        if (prevProcedure) {
            if (prevProcedure.Name == procedure.Name) return;
            prevProcedure.Leave();
        }
        console.log("[上个流程:", prevProcedure && prevProcedure.Name, "切换到==>当前流程:", procedure.Name, "]");
        ProcedureManager.prevProcedure = procedure;
        procedure.Enter(param);
    }
    //设置当前流程
    static SetCurrProcedure(procedureIndex: number) {
        let procedure = this.procedureDic[procedureIndex];
        ProcedureManager.currProcedure = procedure;
    }
}
