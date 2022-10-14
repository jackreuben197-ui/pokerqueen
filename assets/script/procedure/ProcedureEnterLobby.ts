/**
 * 进入大厅流程
 */
import { GameConfig } from "../config/GameConfig";
import { ProcedureEnum } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import Main from "../Main";
import ProcedureManager from "../manager/ProcedureManager";
import { Pre_Login_Define, Pre_Login_Main_Define, Pre_Main_Define } from "../manager/ResManager";
import SceneManager from "../manager/SceneManager";
import GlobalSession from "../session/GlobalSession";
import LoginSession from "../session/LoginSession";
import UIComponent, { PrefabUI } from "../ui/UIComponent";
import ProcedureBase from "./ProcedureBase";

export default class ProcedureEnterLobby extends ProcedureBase {

    Name: string = "ProcedureEnterLobby";

    lateEnter(param?: any) {

        super.lateEnter(param);

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
        UIComponent.Instance.ShowUI(PrefabUI.UIPreloading, {
            pre_define: Pre_Login_Define, complete: () => {
                GlobalSession.Logout();
            }
        })
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
        //进入大厅的资源加载
        console.log("进入大厅资源加载");
        UIComponent.Instance.ShowUI(PrefabUI.UIPreloading, {
            pre_define: Pre_Login_Main_Define, complete: () => {
                UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
                ProcedureManager.StartProcedure(ProcedureEnum.Lobby);
            }
        })
    }
}
