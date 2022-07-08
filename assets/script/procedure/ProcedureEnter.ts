/**
 * 进入流程
 */
import LoginSession from "../session/LoginSession";
import ProcedureBase from "./ProcedureBase";

export default class ProcedureEnter extends ProcedureBase {
    async Enter(param: any) {
        super.Enter(param);
        cc.log("步骤:请求Login");
        param && await LoginSession.ins.Login(param);
        cc.log("步骤:请求UserInfo");
        await LoginSession.ins.GetUserInfo();
    }
    Leave() {
        super.Leave();
    }
    /////////////////////////////////////////////
    //登录请求，获取Token
    login() {

    }
    //用户信息请求
    getUserInfo() {

    }



}
