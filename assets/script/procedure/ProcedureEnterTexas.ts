
import { Bundle } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import UIManager from "../manager/UIManager";
import ProcedureBase from "./ProcedureBase";

/**
 * 大厅进程
 */
export default class ProcedureEnterTexas extends ProcedureBase {

    lateEnter(param?: any) {
        super.lateEnter(param);
        // ProcedureManager.StartProcedure(ProcedureEnum.Lobby, { ignoreEnter: true })
        //显示房间进入loading
        UIManager.open(UIDefine.TexasPreLoad, { bundleName: Bundle.Texas });
        //连接服务器进入房间
    }
    Leave() {
        super.Leave();
    }
}
