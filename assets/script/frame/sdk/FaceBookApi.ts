
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
        FB.getLoginStatus(function (response: TFackBookLoginCB) {
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
            console.log("==========> facebook getLoginStatus : ", response.status)
            if (response.status == 'connected') {
                this.loginSuc(response.authResponse)
            } else {
                FB.login(function (response) {
                    console.log("==========> facebook login : ", response.status)
                    if (response.status == 'connected') {
                        this.loginSuc(response.authResponse)
                    }
                }, { scope: 'public_profile,email' });
            }
        });
    }

    static loginSuc(msg: TFackBookLoginRspAuth) {
        this.rspData = msg;
        // {
        //     accessToken: '{access-token}',
        //     expiresIn: '{unix-timestamp}',
        //     reauthorize_required_in: '{seconds-until-token-expires}',
        //     signedRequest: '{signed-parameter}',
        //     userID: '{user-id}'
        // }

    }
}