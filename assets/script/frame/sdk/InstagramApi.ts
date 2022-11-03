import { ProcedureEnum } from "../../define/EIDefine";
import ProcedureManager from "../../manager/ProcedureManager";
import LoginSession from "../../session/LoginSession";
import CCTools from "../../tools/CCTools";



export default class InstagramApi {
    static login() {
        console.log("==========> Instagram login : ")
        // let sendInfo: TSendInfo = {
        //     cuscomHost: "https://api.instagram.com",
        //     api: "/oauth/authorize",
        //     isGet: true,
        //     body: {
        //         client_id: 684477648739411,
        //         redirect_uri: "http://localhost:7456/build/",
        //         scope: "user_profile, user_media",
        //         response_type: "code",
        //     }
        // }
        // HttpLink.instance.reqServe(sendInfo);

        let client_id = 1886299741745933;
        let redirect_uri = 'https://test1-game.awanptesting.com/'   // window.location.href;
        let scope = "user_profile, user_media";
        let response_type = "code";
        let url = `https://api.instagram.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&response_type=${response_type}`
        window.location.href = url;
    }

    static cleckLoginSuc(code: string) {
        //instagramCode
        // code = 'AQA76MVqRwgyA21sMUBoXQ7dRE0Yrecq4cRJ__JfRMUzSgC_TZb2SSiOb49QzsbWF75p1DxRPrOMKQvAUnhsC4m1stzvkcNvEWObF9W1zJJTUBM9cfYLQa0B_UheN0QHeRJk3TQpOvwkub76e_tGFzL2CNnCGx4y7Chw7YdCJIVFJSBT6e_ZJ0O9br2CEaORzT5CorvEprtwEaIhehEpaiEnJ3OtbC7GiVFUc54XMHoSbw#_';
        console.log('cleckLoginSuc=====', code)
        if (!CCTools.isNull(code)) {
            LoginSession.WebLoginThirdParty({ token: code, source: "instagram", app_source: 3 }).then(() => ProcedureManager.StartProcedure(ProcedureEnum.EnterLobby));
        }
    }

}