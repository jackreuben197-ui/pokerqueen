

import { ProcedureEnum } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import Main from "../Main";
import ProcedureManager from "../manager/ProcedureManager";
import { Pre_Load, Pre_Login_Define } from "../manager/ResManager";
import SceneManager from "../manager/SceneManager";
import UIComponent from "../ui/UIComponent";
import ProcedureBase from "./ProcedureBase";

export default class ProcedurePrelLoadLogin extends ProcedureBase {

    Name: string = "ProcedurePrelLoadLogin";

    protected lateEnter(param?: any) {
        super.lateEnter(param);
        UIComponent.Instance.ShowNoAnimation(Main.UIPreloading, { pre_define: Pre_Login_Define, complete: this.onComplete.bind(this) })
    }
    private onComplete(): void {
        console.log("ProcedurePrelLoadLogin onComplete")
        //ProcedureManager.StartProcedure(ProcedureEnum.Config);
    }
    Leave() {
        super.Leave();
    }
}
