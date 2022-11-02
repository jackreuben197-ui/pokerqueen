import { ProcedureEnum } from "../../define/EIDefine";
import ProcedureManager from "../../manager/ProcedureManager";
import LoginSession from "../../session/LoginSession";

/***
 * status
    connected:用户已登录 Facebook 和您的网页。
    not_authorized:用户已登录 Facebook，但未登录您的网页。
    unknown:用户未登录 Facebook，所以无法得知他们是否登录了您的网页。或者之前已调用 FB.logout()，因此无法连接至 Facebook。
 */
export type TFackBookLoginCB = {
    status: string,
    authResponse: TFackBookLoginRspAuth,
}

export type TFackBookLoginRspAuth = {
    accessToken: string, //网页用户的访问口令。
    expiresIn: string,   //口令过期时的 UNIX 时间戳。口令到期后，用户将需重新登录。
    reauthorize_required_in: string, //距离登录到期的剩余时长（以秒为单位），之后用户将需要重新登录。
    signedRequest: string,   //经签名的参数，其中包含网页用户的信息。
    userID: string,  //网页用户的编号。
}


export default class FaceBookApi {
    static rspData: TFackBookLoginRspAuth = null;
    static login() {
        (window as any).FB && (window as any).FB.getLoginStatus(function (response: TFackBookLoginCB) {
            // 返回的数据结构
            // {
            //     status: 'connected',
            //     authResponse: {
            //         accessToken: '{access-token}',
            //         expiresIn:'{unix-timestamp}',
            //         reauthorize_required_in:'{seconds-until-token-expires}',
            //         signedRequest:'{signed-parameter}',
            //         userID:'{user-id}'
            //     }
            // }
            console.log("==========> facebook getLoginStatus : ", response)
            if (response.status == 'connected') {
                FaceBookApi.loginSuc(response.authResponse)
            } else {
                (window as any).FB && (window as any).FB.login(function (response) {
                    console.log("==========> facebook login : ", response)
                    if (response.status == 'connected') {
                        FaceBookApi.loginSuc(response.authResponse)
                    }
                }, { scope: 'public_profile,email' });
            }
        });
    }

    static loginSuc(msg: TFackBookLoginRspAuth) {
        // {
        //     accessToken: "EAASZBMj1cKkABALRCuRCogulvKE2kaGvhF4UaP8qWbWYYSscyUovs7a3UE71L0VZBkKYFMdtueQmaPtp2kc9BC6OQOapRZAQMWzF65UM0bkGyafAYWnuHSDJARbrCEKF5kJZCEOJ3uKWr0ajZBDqdFjlvffO5GOrunoW98IvRtVBTkQU0tiqNEuIhi1GBh6ywGSdhQrReWO230BHdxZC8Q",
        //     data_access_expiration_time: 1674975204,
        //     expiresIn: 3996,
        //     graphDomain: "facebook",
        //     signedRequest: "Wgfq0v0fSUysG4ghSxZEsWOUoX8dL8eM8GLUCW7Ya2w.eyJ1c2VyX2lkIjoiMTEwNDk0NzA1MTk2NjkwIiwiY29kZSI6IkFRQlVmems0OFp2b2NJUkh0cFQxZXprNlZfaGJ2aHpadnkwY3ZDbGVLZy1zX0o1QzZrdWo1OVFuZmhYb2ptRVFxZ2taQzhqbHBtSDUxSS1QYUZrVDFoWVE1UjJ6TFM0eGk5eERDNWh5aGkzbHdSNThLN24xTjBjYTNuMTlUZUZkZFA0dm1VVGdUQS1jV1VIUXl2UXRIRHlHcFIyNkRFMWRjbURPdmJjcFprRHVDRjBxaV81LUFONTk5LV80eG03UG13b0hoTHFHdmJpZ1lqbDN0MGxCM25jNDhJejZTa2FqeW1DQ211aXdERGdCM09nR2U2TElsNTltekNNU2hkSWlGQjB0d0NyZUU3M3lVZEN2YnRzWmZWeDhGcFBtaDYwcTdJZjZxOUV0NVZpZ3RVQVhFN0dOSU1vUzQweHlGc29kVWxKNE5FclBJcWtBajZKRmI1dno0UHFpIiwiYWxnb3JpdGhtIjoiSE1BQy1TSEEyNTYiLCJpc3N1ZWRfYXQiOjE2NjcxOTkyMDR9",
        //     userID: "110494705196690",
        // }
        console.log("==========> facebook loginSuc  : ", msg)
        this.rspData = msg;

        LoginSession.WebLoginThirdParty({ token: this.rspData.accessToken, source: "facebook", app_source: 3 }).then(() => ProcedureManager.StartProcedure(ProcedureEnum.EnterLobby));
        
        (window as any).FB && (window as any).FB.api('/me', function (response) {
            console.log('==========> facebook api : ', response);
        });
    }
}