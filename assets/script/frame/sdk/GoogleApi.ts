import { ProcedureEnum } from "../../define/EIDefine";
import ProcedureManager from "../../manager/ProcedureManager";
import LoginSession from "../../session/LoginSession";

export default class GoogleApi {
    static client_id: string = '671936740901-7e3qu313i1tf6bkg0gdo39jekv085r48.apps.googleusercontent.com';
    static credential: string = '';
    static init() {
        console.log("================> google sdk init");
        (window as any).google && (window as any).google.accounts.id.initialize({
            client_id: this.client_id,
            cancel_on_tap_outside: false,
            callback: (msg) => GoogleApi.loginSuc(msg)
        })
    };


    static loginSuc(msg) {
        console.log("================> google login initialize cb : ", msg)
        // {clientId: '381824986181-cg3676e7rlg4ofv9r5pbsad35jtcqv9s.apps.googleusercontent.com', credential: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijc3Y2MwZWY0YzcxODFjZj…vqJxpR0ycZlwV8xia5bwyZqwFmtNX8HjcJ29zQAjSH926Y0Sw', select_by: 'user'}
        this.credential = msg.credential;


        let str = Buffer.from(this.credential, 'base64').toString();
        console.log("================> google login 解析  : ", str)

        // {
        //     "iss": "https://accounts.google.com",
        //     "nbf": 1667187318,
        //     "aud": "671936740901-7e3qu313i1tf6bkg0gdo39jekv085r48.apps.googleusercontent.com",
        //     "sub": "112725011682424959634",
        //     "email": "1536337341@qq.com",
        //     "email_verified": true,
        //     "azp": "671936740901-7e3qu313i1tf6bkg0gdo39jekv085r48.apps.googleusercontent.com",
        //     "name": "yanhe xu",
        //     "picture": "https://lh3.googleusercontent.com/a/ALm5wu25suu9W-Vs8WhxSrTYUx1n3ovcA8k3K3IRBKyX=s96-c",
        //     "given_name": "yanhe",
        //     "family_name": "xu",
        //     "iat": 1667187618,
        //     "exp": 1667191218,
        //     "jti": "c23a9ecd742e9d239a32031d2a2679a643fa2f4b"
        //   }

        LoginSession.WebLoginThirdParty({ token: this.credential, source: "google", app_source: 3 }).then(() => ProcedureManager.StartProcedure(ProcedureEnum.EnterLobby));


        // this.initTokenClient();
    }

    static renderBtn() {
        console.log("================> google sdk renderBtn");
        (window as any).google && (window as any).google.accounts.id.renderButton(
            document.getElementById("button_div"),
            { type: "icon" }
        )
    }

    static prompt() {
        console.log("================> google sdk prompt");
        (window as any).google && (window as any).google.accounts.id.prompt(notification => {
            console.log("这个通知适用于显示时刻吗？ ==> ", notification.isDisplayMoment())
            console.log("此通知是针对某个显示时刻，还是显示了界面？ ==> ", notification.isDisplayed())
            console.log("这是针对显示时刻的通知，而界面未显示吗？ ==> ", notification.isNotDisplayed())
            console.log("界面未显示的详细原因。以下是可能的值： ==> ", notification.getNotDisplayedReason())
            console.log("此通知是针对跳过的时刻吗？ ==> ", notification.isSkippedMoment())
            console.log("跳过时刻的详细原因。以下是可能的值： ==> ", notification.getSkippedReason())
            console.log("这个通知适用于关闭的时刻吗？ ==> ", notification.isDismissedMoment())
            console.log("电子邮件被拒的详细原因。以下是可能的值： ==> ", notification.getDismissedReason())
            console.log("返回一个时刻类型。以下是可能的值： ==> ", notification.getMomentType())
        });
    }


    static initCodeClient() {
        console.log("================> google initCodeClient : ");
        (window as any).google && (window as any).google.accounts.oauth2.initCodeClient({
            client_id: this.client_id,
            ux_mode: 'popup',
            scope: "https://www.googleapis.com/auth/calendar.readonly",
            callback: (msg) => this.initCodeClientSuc(msg)
        })
    }

    static initTokenClient() {
        console.log("================> google initTokenClient : ");
        (window as any).google && (window as any).google.accounts.oauth2.initTokenClient({
            client_id: this.client_id,
            ux_mode: 'popup',
            scope: "https://www.googleapis.com/auth/calendar.readonly",
            callback: (msg) => this.initTokenClientSuc(msg)
        })
    }

    static initCodeClientSuc(msg) {
        console.log("================> google initCodeClientSuc : ", msg)
    }
    static initTokenClientSuc(msg) {
        console.log("================> google initTokenClientSuc : ", msg)
    }
}