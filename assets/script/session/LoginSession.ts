/**
 * 登录内容
 */

import { Md5 } from "ts-md5";
import Singleton from "../common/Singleton";
import HttpRequest from "../net/https/HttpRequest";
import { Web_Channel, Web_Login, Web_User_Info } from "../net/https/WebRequest";
import GlobalSession from "./GlobalSession";
import StorageKey from "./StorageKey";

export default class LoginSession extends Singleton {

    static ins: LoginSession;

    private _token: string = null;
    private _tokenExpireAt: number = 0;

    //登录请求
    async Login(param: typeof Web_Login.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Login,
                param: Web_Login.Request(
                    {
                        phone: param.phone,
                        password: Md5.hashStr(param.password),
                        area: param.area,
                        is_simulator: false,
                    }),
                onSuccess: function () {
                    this.token = Web_Login.Response.data.token;
                    this.tokenExpireAt = Web_Login.Response.data.expire_at;
                    resolve(0);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });

    }
    //用户信息请求
    async GetUserInfo() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_User_Info,
                onSuccess: function () {
                    cc.log("Web_User_Info.Data", Web_User_Info.Response.data);
                    resolve(0);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    //socket port 请求
    async GetChannel() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Channel,
                onSuccess: function () {
                    cc.log("Web_Channel.Data", Web_Channel.Response.data);
                    resolve(0);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    //判断用户是否有效token
    public isTokenVaild(): boolean {
        if (this.token == null || this.token == undefined || this.token == "") {
            return false;
        }
        return GlobalSession.NowTime() < this.tokenExpireAt;
    }

    set token(value: string) {
        this._token = value;
        localStorage.setItem(StorageKey.TOKEN, value);
    }
    get token() {
        return this._token || localStorage.getItem(StorageKey.TOKEN);
    }

    set tokenExpireAt(value: number) {
        this._tokenExpireAt = value;
        localStorage.setItem(StorageKey.TOKEN_EXPIREAT, value.toString());
    }
    get tokenExpireAt(): number {
        return +(this._tokenExpireAt || localStorage.getItem(StorageKey.TOKEN_EXPIREAT));
    }
}




