

import { UIDefine } from "../define/UIDefine";
import SceneManager from "../manager/SceneManager";
import ProcedureBase from "./ProcedureBase";

export default class ProcedurePreloading extends ProcedureBase {

    protected lateEnter(param?: any) {
        super.lateEnter(param);
        SceneManager.ins.switchScene(UIDefine.PreloadingScene);
    }
    Leave() {
        super.Leave();
    }
}
