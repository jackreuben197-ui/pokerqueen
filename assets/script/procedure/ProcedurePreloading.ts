

import { UIDefine } from "../define/UIDefine";
import SceneManager from "../manager/SceneManager";
import ProcedureBase from "./ProcedureBase";

export default class ProcedurePreloading extends ProcedureBase {

    Enter(param: any) {
        super.Enter(param);
        SceneManager.ins.switchScene(UIDefine.PreloadingScene);
    }
    Leave() {
        super.Leave();
    }

}
