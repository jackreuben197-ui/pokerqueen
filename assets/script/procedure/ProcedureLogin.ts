import { UIDefine } from "../define/UIDefine";
import SceneManager from "../manager/SceneManager";
import ProcedureBase from "./ProcedureBase";


export default class ProcedureLogin extends ProcedureBase {
    Enter(param: any) {
        super.Enter(param);
        //判断是否自动登录
        //展示登录界面
        SceneManager.ins.switchScene(UIDefine.LoginScene);
    }
    Leave() {
        super.Leave();
    }
}
