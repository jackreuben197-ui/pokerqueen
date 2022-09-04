

import { UIDefine } from "../define/UIDefine";
import SceneManager from "../manager/SceneManager";
import ProcedureBase from "./ProcedureBase";

export default class ProcedurePreloading extends ProcedureBase {

    Name: string = "ProcedurePreloading";

    protected lateEnter(param?: any) {
        super.lateEnter(param);
        SceneManager.Instance.switchScene(UIDefine.PreloadingScene);
    }
    Leave() {
        super.Leave();
    }
}
