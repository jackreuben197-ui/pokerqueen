import { ProcedureEnum } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import ProcedureManager from "../manager/ProcedureManager";
import SceneManager from "../manager/SceneManager";
import LoginSession from "../session/LoginSession";
import ProcedureBase from "./ProcedureBase";


export default class ProcedureLogin extends ProcedureBase {
    lateEnter(param: any) {
        super.lateEnter(param);
        //登陆数据初始化
        LoginSession.Init();

        //判断是否存在有效token
        if (LoginSession.IsTokenVaild()) {
            //进入登录请求流程
            ProcedureManager.StartProcedure(ProcedureEnum.EnterLobby);
        } else {
            //展示登录界面
            SceneManager.ins.switchScene(UIDefine.LoginScene);
        }
    }
    Leave() {
        super.Leave();
    }
}
