/**
 * 登录内容
 */

import { Md5 } from "ts-md5";
import Singleton from "../common/Singleton";
import { GameConfig } from "../config/GameConfig";
import HttpRequest from "../net/https/HttpRequest";
import { Web_Channel, Web_Login, Web_User_Info } from "../net/https/WebRequest";
import GlobalSession from "./GlobalSession";
import StorageKey from "./StorageKey";

export default class LoginSession {

    //static ins: LoginSession;
    static _token: string = null;
    static _tokenExpireAt: number = 0;
    //当前区号
    static _areaCode: string;
    //手机号
    static _phone: string;

    static Init() {
        this._areaCode = localStorage.getItem(StorageKey.AERA_CODE) || GameConfig.DefaultAreaCode;
        this._phone = localStorage.getItem(StorageKey.PHONE) || "";
    }

    //登录请求
    static async Login(param: typeof Web_Login.RequestParams) {
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
                    this.Token = Web_Login.Response.data.token;
                    this.TokenExpireAt = Web_Login.Response.data.expire_at;
                    this.Phone = param.phone;
                    resolve(0);
                }.bind(this),
                onFailure: function (content) {
                    this.Phone = param.phone;
                    reject(content);
                }.bind(this)
            });
        });

    }
    //用户信息请求
    static async SyncUserInfo() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_User_Info,
                onSuccess: function () {
                    resolve(0);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    //socket port 请求
    static async SyncChannel() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Channel,
                onSuccess: function () {
                    resolve(0);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    //判断用户是否有效token
    public static IsTokenVaild(): boolean {
        let token = this.Token;
        if (token == null || token == undefined || this.Token == "") {
            return false;
        }
        return GlobalSession.NowTime() < this.TokenExpireAt;
    }

    static set Token(value: string) {
        this._token = value;
        localStorage.setItem(StorageKey.TOKEN, value);
    }
    static get Token() {
        return this._token || localStorage.getItem(StorageKey.TOKEN);
    }

    static set TokenExpireAt(value: number) {
        this._tokenExpireAt = value;
        localStorage.setItem(StorageKey.TOKEN_EXPIREAT, value.toString());
    }
    static get TokenExpireAt(): number {
        return +(this._tokenExpireAt || localStorage.getItem(StorageKey.TOKEN_EXPIREAT));
    }

    static set AreaCode(value: string) {
        this._areaCode = value;
        localStorage.setItem(StorageKey.AERA_CODE, value);
    }
    static get AreaCode(): string {
        return this._areaCode;
    }

    static set Phone(value: string) {
        this._phone = value;
        localStorage.setItem(StorageKey.PHONE, value);
    }
    static get Phone(): string {
        return this._phone;
    }
}

(window as any).LoginSession = LoginSession;


