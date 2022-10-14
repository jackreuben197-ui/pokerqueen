import { GameConfig } from "../config/GameConfig";
import { ProcedureEnum } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import Main from "../Main";
import ProcedureManager from "../manager/ProcedureManager";
import { Pre_Login_Define } from "../manager/ResManager";
import SceneManager from "../manager/SceneManager";
import LoginSession from "../session/LoginSession";
import UIComponent, { PrefabUI } from "../ui/UIComponent";
import ProcedureBase from "./ProcedureBase";


export default class ProcedureLogin extends ProcedureBase {

    Name: string = "ProcedureLogin";

    lateEnter(param?: any) {
        super.lateEnter(param);
        if (param.logout) {
            //展示登录界面
            SceneManager.Instance.switchScene(UIDefine.LoginScene);
            return;
        }
        //登陆数据初始化
        LoginSession.Init();
        //判断是否跳过登录界面
        if (param?.skipLogin) {
            //进入登录请求流程
            ProcedureManager.StartProcedure(ProcedureEnum.EnterLobby);
        } else {
            UIComponent.Instance.ShowUI(PrefabUI.UIPreloading, {
                pre_define: Pre_Login_Define, complete: () => {

                    UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
                    //展示登录界面
                    SceneManager.Instance.switchScene(UIDefine.LoginScene);
                }
            })
        }
    }
    Leave() {
        super.Leave();
    }
}
