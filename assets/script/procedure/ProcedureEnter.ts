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

    async Enter(param?: any) {

        super.Enter(param);

        if (param) {
            this.Login(param).then(() => this.SyncUserInfo()).then(() => this.SyncWS()).then(() => {
                //准备进入大厅
                this.enterLobby();
            }).catch(this._catchHandler);
        } else {
            this.SyncUserInfo().then(() => this.SyncWS()).then(() => this.enterLobby()).catch(this._catchHandler);
        }
    }
    Leave() {
        super.Leave();
    }
    /////////////////////////////////////////////
    _catchHandler(code: number) {
        cc.log("login error code", code);
        if (SceneManager.ins.getCurrUIDefine() == UIDefine.PreloadingScene && code == 90010) {
            //Token失败,这里清理Token，重新进入登录界面
            LoginSession.Token = "";
            ProcedureManager.StartProcedure(ProcedureEnum.Login);
        } else {
            ProcedureManager.StartProcedure(ProcedureEnum.Idel);
        }
    }

    //1.登录请求,获取Token
    Login(param) {
        cc.log("登陆步骤1 ------>Login")
        return LoginSession.Login(param);
    }
    //2.用户信息请求
    SyncUserInfo() {
        cc.log("登陆步骤2 ------>SyncUserInfo")
        return LoginSession.SyncUserInfo();
    }
    //3.websocket port
    SyncWS() {
        cc.log("登陆步骤3 ------>SyncWS")
        return LoginSession.SyncWS();
    }
    //4.进入大厅
    enterLobby() {
        cc.log("进入游戏大厅 ------>")
        ProcedureManager.StartProcedure(ProcedureEnum.Lobby);
    }
}
