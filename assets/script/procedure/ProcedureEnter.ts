/**
 * 进入流程
 */
import { ProcedureEnum } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import ProcedureManager from "../manager/ProcedureManager";
import SceneManager from "../manager/SceneManager";
import LoginSession from "../session/LoginSession";
import ProcedureBase from "./ProcedureBase";

export default class ProcedureEnter extends ProcedureBase {
    async Enter(param: any) {

        super.Enter(param);

        if (param) {
            this.login(param).then(() => this.getUserInfo()).then(() => this.getChannel()).then(() => {
                //准备进入大厅
                this.enterLobby();
            }).catch(this._catchHandler);
        } else {
            this.getUserInfo().then(() => { this.getChannel() }).then(() => { this.enterLobby() }).catch(this._catchHandler);
        }
    }
    Leave() {
        super.Leave();
    }
    /////////////////////////////////////////////
    _catchHandler(code: number) {
        cc.log("code", code);
        if (SceneManager.ins.getCurrUIDefine() == UIDefine.PreloadingScene && code == 90010) {
            LoginSession.ins.token = "";
            ProcedureManager.StartProcedure(ProcedureEnum.Login);
        } else {
            ProcedureManager.StartProcedure(ProcedureEnum.Idel);
        }
    }

    //1.登录请求,获取Token
    login(param) {
        cc.log("登陆步骤1 ------>")
        return LoginSession.ins.Login(param);
    }
    //2.用户信息请求
    getUserInfo() {
        cc.log("登陆步骤2 ------>")
        return LoginSession.ins.GetUserInfo();
    }
    //3.socket port
    getChannel() {
        cc.log("登陆步骤3 ------>")
        return LoginSession.ins.GetChannel();
    }
    //4.进入大厅
    enterLobby() {
        cc.log("进入游戏大厅 ------>")
        ProcedureManager.StartProcedure(ProcedureEnum.Lobby);
    }
}
