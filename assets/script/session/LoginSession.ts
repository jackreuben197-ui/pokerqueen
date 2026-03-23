/**
 * 登录内容
 */
import { GameConfig } from "../config/GameConfig";
import { ClubCache } from "../frame/data/club/ClubCache";
import GC from "../frame/GameControl";
import LocalStoreManager from "../frame/manager/LocalStoreManager";
import TokenRefreshComponent from "../funcomponent/TokenRefreshComponent";
import { GameCache } from "../game/GameCache";
import HttpRequest from "../net/https/HttpRequest";
import { WebBindThrid, WebBindPhone, WebBindEmail, WebGetBlindStatus, WebEmailExist, WebSendEmailCode, WebChannel, WebLogin, WebLoginThirdParty, WebRefreshToken, WebUserCheckPhone, WebUserInfo, WebUserModifyPassword, WebUserRegister, WebUserSendCode, WebWs } from "../net/https/WebRequest";
import WebSocketClient from "../net/websocket/WebSocketClient";
import GlobalSession from "./GlobalSession";
import StorageKey from "./StorageKey";

export default class LoginSession {

    //static ins: LoginSession;
    static _token: string = null;
    static _tokenExpireAt: number = 0;
    //当前区号
    static _areaCode: string = null;
    //手机号
    static _phone: string = null;

    static tokenRefreshComponent: TokenRefreshComponent = null;

    static Init() {

        // this._areaCode = localStorage.getItem(StorageKey.AERA_CODE) || GameConfig.DefaultAreaCode;
        // this._phone = localStorage.getItem(StorageKey.KEY_PHONE) || "";
        this._areaCode = GC.localStore.getItem(StorageKey.AERA_CODE) || GameConfig.DefaultAreaCode;
        this._phone = GC.localStore.getItem(StorageKey.KEY_PHONE) || "";
    }
    /**
     * 登录请求
     */
    static async Login(param: typeof WebLogin.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebLogin,
                body: WebLogin.Request(param),
                onSuccess: function () {
                    this.Token = WebLogin.Response.data.token;
                    this.TokenExpireAt = WebLogin.Response.data.expire_at;
                    this.Phone = param.phone;
                    resolve(WebLogin.Response);
                }.bind(this),
                onFailure: function (content) {
                    this.Phone = param.phone;
                    reject(content);
                }.bind(this)
            });
        });
    }

    static async WebLoginThirdParty(param) {
        console.log('WebLoginThirdParty=====', param)
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebLoginThirdParty,
                body: WebLoginThirdParty.Request(param),
                onSuccess: function () {
                    this.Token = WebLoginThirdParty.Response.data.token;
                    this.TokenExpireAt = WebLoginThirdParty.Response.data.expire_at;
                    resolve(WebLoginThirdParty.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
     * 刷新Token
     */
    static async SyncRefreshToken() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebRefreshToken,
                onSuccess: function () {
                    let token = WebLogin.Response.data?.token;
                    if (token) {
                        this.Token = WebLogin.Response.data.token;
                        this.TokenExpireAt = WebLogin.Response.data.expire_at;
                        resolve(WebRefreshToken.Response);
                    } else {
                        this.Token = null;
                        reject(0);
                    }
                    GlobalSession.Logout();
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
     * socket port 请求
     */
    static async SyncChannel() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebChannel,
                onSuccess: function () {
                    resolve(WebChannel.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
     * websocket port 请求
     */
    static async SyncWS() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebWs,
                onSuccess: function () {
                    resolve(WebWs.Response);
                    WebSocketClient.SetPort(WebWs.Response?.data?.port);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 用户手机号注册
     */
    static async APISendRegister(param: typeof WebUserRegister.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebUserRegister,
                body: WebUserRegister.Request(param),
                onSuccess: function () {
                    resolve(WebUserRegister.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
     * 验证手机号
     */
    static async APIPHoneExist(param: typeof WebUserCheckPhone.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebUserCheckPhone,
                body: WebUserCheckPhone.Request(param),
                onSuccess: function () {
                    resolve(WebUserCheckPhone.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
   * 验证手机号
   */
    static async WebEmailExist(param: typeof WebEmailExist.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebEmailExist,
                body: WebEmailExist.Request(param),
                onSuccess: function () {
                    resolve(WebEmailExist.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
     * 获取验证码
     */
    static async APISendCode(param: typeof WebUserSendCode.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebUserSendCode,
                body: WebUserSendCode.Request(param),
                onSuccess: function () {
                    resolve(WebUserSendCode.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
     * 修改密码
     * @param param 
     * @returns 
     */
    static async APISendModifyPW(param: typeof WebUserModifyPassword.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebUserModifyPassword,
                body: WebUserModifyPassword.Request(param),
                onSuccess: function () {
                    resolve(WebUserModifyPassword.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    //////////////////////////////////////////////////////////////////////////////



    /**
     * 判断用户是否有效token
     */
    public static IsTokenVaild(): boolean {
        let token = this.Token;
        if (token == null || token == undefined || token == "") {
            return false;
        }
        return GlobalSession.NowTimeS < this.TokenExpireAt;
    }
    /**
     * 登出
     */
    public static LoginOut() {
        this.ClearToken();
    }

    /**
     * 清理Token
     */
    public static ClearToken() {
        this.Token = "";
        this.TokenExpireAt = 0;
    }

    static set Token(value: string) {
        this._token = value;
        GC.localStore.setItem(StorageKey.TOKEN, value);
    }
    static get Token() {
        return this._token || GC.localStore.getItem(StorageKey.TOKEN);
    }

    static set TokenExpireAt(value: number) {
        this._tokenExpireAt = value;
        GC.localStore.setItem(StorageKey.TOKEN_EXPIREAT, value.toString());
    }
    static get TokenExpireAt(): number {
        return +(this._tokenExpireAt || GC.localStore.getItem(StorageKey.TOKEN_EXPIREAT));
    }

    static set AreaCode(value: string) {
        this._areaCode = value;
        GC.localStore.setItem(StorageKey.AERA_CODE, value);
    }
    static get AreaCode(): string {
        return this._areaCode;
    }

    static set Phone(value: string) {
        this._phone = value;
        GC.localStore.setItem(StorageKey.KEY_PHONE, value);
    }
    static get Phone(): string {
        return this._phone;
    }

    /**
     * 清理本地存储的token和token时效
     */
    static clearToken() {
        GC.localStore.removeItem(StorageKey.TOKEN);
        GC.localStore.removeItem(StorageKey.TOKEN_EXPIREAT);
    }
    /**
         * 获取验证码
         */
    static async WebSendEmailCode(param: typeof WebSendEmailCode.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebSendEmailCode,
                body: WebSendEmailCode.Request(param),
                onSuccess: function () {
                    resolve(WebSendEmailCode.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
    * 获取绑定信息
    */
    static async WebGetBlindStatus() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebGetBlindStatus,
                body: WebGetBlindStatus.Request({}),
                onSuccess: function () {
                    resolve(WebGetBlindStatus.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
   * 绑定Email
   */
    static async WebBindEmail(param: typeof WebBindEmail.RequestParams) {

        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebBindEmail,
                body: WebBindEmail.Request(param),
                onSuccess: function () {
                    resolve(WebBindEmail.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
       * 绑定Phone
       */
    static async WebBindPhone(param: typeof WebBindPhone.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebBindPhone,
                body: WebBindPhone.Request(param),
                onSuccess: function () {
                    resolve(WebBindPhone.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
       * 绑定Phone
       */
    static async WebBindThrid(param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebBindThrid,
                body: WebBindThrid.Request(param),
                onSuccess: function () {
                    resolve(WebBindThrid.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }




}

(window as any).LoginSession = LoginSession;


