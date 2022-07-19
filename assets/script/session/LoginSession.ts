/**
 * 登录内容
 */

import { Md5 } from "ts-md5";
import { GameConfig } from "../config/GameConfig";
import { IUpdate } from "../define/EIDefine";
import UpdateComponent from "../funcomponent/UpdateComponent";
import HttpRequest from "../net/https/HttpRequest";
import { Web_Channel, Web_Login, Web_Refresh_Token, Web_User_Check_Phone, Web_User_Info, Web_User_Modify_Password, Web_User_Register, Web_User_Send_Code, Web_WS } from "../net/https/WebRequest";
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

    //token刷新间隔
    tokenUpdateInterval: number = 5;
    //token上次刷新时间
    tokenLastTime: number = 0;
    //token需要刷新的阈值 
    tokenUpdateThreshold: number = 7200;
    allowUpdate: boolean = false;

    update(dt: number) {
        if (!LoginSession.IsTokenVaild()) return;
        let nowTime = GlobalSession.NowTime;
        if (nowTime - this.tokenLastTime < this.tokenUpdateInterval) return;
        this.tokenLastTime = nowTime;
        let timeDiff = LoginSession.TokenExpireAt - GlobalSession.NowTime;
        if (timeDiff < this.tokenUpdateThreshold) {
            LoginSession.SyncRefreshToken();
        }
    }

    static Init() {
        this._areaCode = localStorage.getItem(StorageKey.AERA_CODE) || GameConfig.DefaultAreaCode;
        this._phone = localStorage.getItem(StorageKey.PHONE) || "";
        this.prototype.allowUpdate = true;
        UpdateComponent.Add(this.prototype);
    }
    /**
     * 登录请求
     */
    static async Login(param: typeof Web_Login.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Login,
                param: Web_Login.Request(param),
                onSuccess: function () {
                    this.Token = Web_Login.Response.data.token;
                    this.TokenExpireAt = Web_Login.Response.data.expire_at;
                    this.Phone = param.phone;
                    resolve(Web_Login.Response);
                }.bind(this),
                onFailure: function (content) {
                    this.Phone = param.phone;
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
                request: Web_Refresh_Token,
                onSuccess: function () {
                    this.Token = Web_Login.Response.data.token;
                    this.TokenExpireAt = Web_Login.Response.data.expire_at;
                    resolve(Web_Refresh_Token.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
     * 用户信息请求
     */
    static async SyncUserInfo() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_User_Info,
                onSuccess: function () {
                    resolve(Web_User_Info.Response);
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
                request: Web_Channel,
                onSuccess: function () {
                    resolve(Web_Channel.Response);
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
                request: Web_WS,
                onSuccess: function () {
                    resolve(Web_WS.Response);
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
    static async APISendRegister(param: typeof Web_User_Register.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_User_Register,
                param: Web_User_Register.Request(param),
                onSuccess: function () {
                    resolve(Web_User_Register.Response);
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
    static async APIPHoneExist(param: typeof Web_User_Check_Phone.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_User_Check_Phone,
                param: Web_User_Check_Phone.Request(param),
                onSuccess: function () {
                    resolve(Web_User_Check_Phone.Response);
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
    static async APISendCode(param: typeof Web_User_Send_Code.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_User_Send_Code,
                param: Web_User_Send_Code.Request(param),
                onSuccess: function () {
                    resolve(Web_User_Send_Code.Response);
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
    static async APISendModifyPW(param: typeof Web_User_Modify_Password.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_User_Modify_Password,
                param: Web_User_Modify_Password.Request(param),
                onSuccess: function () {
                    resolve(Web_User_Modify_Password.Response);
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
        if (token == null || token == undefined || this.Token == "") {
            return false;
        }
        return GlobalSession.NowTime < this.TokenExpireAt;
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


