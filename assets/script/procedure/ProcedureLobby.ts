import { UIDefine } from "../define/UIDefine";
import SceneManager from "../manager/SceneManager";
import ProcedureBase from "./ProcedureBase";

/**
 * 大厅进程
 */
export default class ProcedureLobby extends ProcedureBase {
    Enter(param: any) {
        super.Enter(param);
        
        SceneManager.ins.switchScene(UIDefine.LoginScene);
    }
    Leave() {
        super.Leave();
    }

}
