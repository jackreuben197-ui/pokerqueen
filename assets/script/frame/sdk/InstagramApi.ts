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

        let client_id = 684477648739411;
        let redirect_uri = "http://localhost:7456/build/";
        let scope = "user_profile, user_media";
        let response_type = "code";

        let url = `https://api.instagram.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&response_type=${response_type}`
        cc.sys.openURL(url)
    }

    static cleckLoginSuc(code: string) {
        //instagramCode
        if (!CCTools.isNull(code)) {
            // cade = code.slice(0, code.length-2);
            LoginSession.WebLoginThirdParty({ token: code, source: "instagram", app_source: 3 }).then(() => ProcedureManager.StartProcedure(ProcedureEnum.EnterLobby));
        }
    }

}