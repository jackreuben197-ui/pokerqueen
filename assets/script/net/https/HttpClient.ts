import { GameConfig, LogStyle } from "../../config/GameConfig";
import { UIDefine } from "../../define/UIDefine";
import { i18nMgr } from "../../i18n/i18nMgr";
import { LanguageCode } from "../../i18n/LanguageCode";
import ToastManager from "../../manager/ToastManager";
import UIManager from "../../manager/UIManager";
import LoginSession from "../../session/LoginSession";
import { HttpErrorCode } from "./HttpErrorCode";

/**
 * Http端
 */
export default class HttpClient {
    //超时时间设置(毫秒)
    static TimeOut: number = 10000;
    /**s
     * post 请求
     * headers 头文件 格式 [["name1","value"],["name2","value"]];
     */
    static async post({ url = null, param = null, onFailure = null, onSuccess = null, headers = null, needJuhua = true }) {
        param = JSON.stringify(param);
        console.log("%c%s%s\n%s", LogStyle.http_request, ">>>>> http post - request : ", url, param);
        needJuhua && UIManager.open(UIDefine.UIPromptComponent);
        let response: string = <string>await this.__request(url, "POST", param, headers);
        needJuhua && UIManager.close(UIDefine.UIPromptComponent);
        console.log("%c%s%s\n%s", LogStyle.http_response, ">>>>> http post - response : ", url, response);
        this.__response(response, onFailure, onSuccess);
    }
    /**
     * get 请求
     */
    static async get({ url = null, param = null, onFailure = null, onSuccess = null, needJuhua = true }) {
        param = JSON.stringify(param);
        console.log("%c%s%s\n%s", LogStyle.http_request, ">>>>> http get - request : ", url, param);
        needJuhua && UIManager.open(UIDefine.UIPromptComponent);
        let response: string = <string>await this.__request(url, "GET", param);
        needJuhua && UIManager.close(UIDefine.UIPromptComponent);
        console.log("%c%s%s\n%s", LogStyle.http_response, ">>>>> http get - response : ", url, response);
        this.__response(response, onFailure, onSuccess);
    }

    static __response(response, onFailure, onSuccess) {
        switch (response) {
            case "timeout":
                ToastManager.ins.createToast(LanguageCode.LanguageDescription(10126));
                onFailure && onFailure(response);
                break;
            case "error":
                ToastManager.ins.createToast(i18nMgr.Get("errorDefault"));
                onFailure && onFailure(response);
                break;
            default:
                let response_json: any;
                try {
                    response_json = JSON.parse(response);
                } catch (e) {
                    //json 解析异常
                    ToastManager.ins.createToast(i18nMgr.Get("json_exception"));
                    onFailure && onFailure(null);
                    return;
                }

                if (response_json?.code == 0) {
                    onSuccess && onSuccess(response_json);
                } else {
                    //错误码提示
                    ToastManager.ins.createToast(LanguageCode.ServerErrorDescription(response_json.code));
                    onFailure && onFailure(response_json.code);
                }
                break;
        }
    }

    static async __request(url, type = "POST", param = null, headers = null) {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            var isTimeout = false;//是否超时
            var timer = setTimeout(function () {
                isTimeout = true;
                xhr.abort();//请求中止
                resolve("timeout");
            }, HttpClient.TimeOut);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 400)) {
                    var response = xhr.responseText;
                    if (isTimeout) return;//请求已经超时，忽略
                    clearTimeout(timer);//取消等待的超时                 
                    resolve(response);
                }
            };
            xhr.onerror = function () {
                if (isTimeout) return;//请求已经超时，忽略
                clearTimeout(timer);//取消等待的超时
                resolve("error");
            };
            xhr.ontimeout = function () {
                if (isTimeout) return;//请求已经超时，忽略
                clearTimeout(timer);//取消等待的超时
                resolve("timeout");
            };
            xhr.open(type, url);
            xhr.timeout = HttpClient.TimeOut;
            xhr.setRequestHeader("Content-Type", "application/json");
            //xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.setRequestHeader("md5at", LoginSession.Token);
            if (headers) {
                for (let header of headers) {
                    xhr.setRequestHeader(header[0], header[1]);
                }
            }
            xhr.send(param ? param : null);
        })
    }
}
