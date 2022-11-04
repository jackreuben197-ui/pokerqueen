/**
 * 登录内容
 */
import { GameConfig } from "../config/GameConfig";
import GC from "../frame/GameControl";
import LocalStoreManager from "../frame/manager/LocalStoreManager";
import TokenRefreshComponent from "../funcomponent/TokenRefreshComponent";
import { GameCache } from "../game/GameCache";
import HttpRequest from "../net/https/HttpRequest";
import { APIEmailExist, APISendEmailCode, Web_Channel, Web_Login, Web_Login_Third_Party, Web_Refresh_Token, Web_User_Check_Phone, Web_User_Info, Web_User_Modify_Password, Web_User_Register, Web_User_Send_Code, Web_WS } from "../net/https/WebRequest";
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
    static async Login(param: typeof Web_Login.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Login,
                body: Web_Login.Request(param),
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

    static async WebLoginThirdParty(param) {
        console.log('WebLoginThirdParty=====', param)
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Login_Third_Party,
                body: Web_Login_Third_Party.Request(param),
                onSuccess: function () {
                    this.Token = Web_Login_Third_Party.Response.data.token;
                    this.TokenExpireAt = Web_Login_Third_Party.Response.data.expire_at;
                    resolve(Web_Login_Third_Party.Response);
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
                    this.CacheUserInfo(Web_User_Info.Response.data.user);
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
                body: Web_User_Register.Request(param),
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
                body: Web_User_Check_Phone.Request(param),
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
   * 验证手机号
   */
    static async APIEmailExist(param: typeof APIEmailExist.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIEmailExist,
                body: APIEmailExist.Request(param),
                onSuccess: function () {
                    resolve(APIEmailExist.Response);
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
                body: Web_User_Send_Code.Request(param),
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
                body: Web_User_Modify_Password.Request(param),
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

    //缓存用户信息
    public static CacheUserInfo(info: typeof Web_User_Info.UserInfo) {

        GameCache.Instance.nUserId = info.un_id;
        // GameCache.Instance.gold = info.gold;
        GC.data.user.info.gold = info.gold;
        GameCache.Instance.strPhone = info.phone;
        GameCache.Instance.kDouNum = 0;
        GameCache.Instance.sex = info.sex;
        GameCache.Instance.nick = info.nickname;
        GameCache.Instance.headPic = info.avatar;
        GameCache.Instance.userType = info.ut;

        //localStorage.setItem(StorageKey.KEY_USERID, `${info.un_id}`);
        //localStorage.setItem(StorageKey.KEY_PHONE, `${info.phone}`);
        //localStorage.setItem(StorageKey.KEY_PHONE_FIRST, info.area.replace("+", ""));
        //localStorage.setItem(StorageKey.KEY_PHONE_FIRST, `${info.area}`);

    }


    /**
     * 判断用户是否有效token
     */
    public static IsTokenVaild(): boolean {
        let token = this.Token;
        if (token == null || token == undefined || this.Token == "") {
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
    static async APISendEmailCode(param: typeof APISendEmailCode.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APISendEmailCode,
                body: APISendEmailCode.Request(param),
                onSuccess: function () {
                    resolve(APISendEmailCode.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }



}

(window as any).LoginSession = LoginSession;


