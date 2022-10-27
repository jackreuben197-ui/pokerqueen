import { LogStyle } from "../../config/GameConfig";
import { UIDefine } from "../../define/UIDefine";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { i18nMgr } from "../../i18n/i18nMgr";
import ToastManager from "../../manager/ToastManager";
import LoginSession from "../../session/LoginSession";
import CCTools from "../../tools/CCTools";
import UIComponent from "../../ui/UIComponent";

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
    static async post({ url = null, body = null, onFailure = null, onSuccess = null, headers = null, needJuhua = true, isJson = true }) {
        if (isJson) {
            body = JSON.stringify(body);
        }
        console.log("%c%s%s\n%s", LogStyle.http_request, ">>>>> http post - request : ", url, body);
        needJuhua && UIComponent.open(UIDefine.UIPromptComponent);
        let response: string = <string>await this.__request(url, false, body, headers, isJson);
        needJuhua && UIComponent.close(UIDefine.UIPromptComponent);
        console.log("%c%s%s\n%s", LogStyle.http_response, ">>>>> http post - response : ", url, response);
        this.__response(response, onFailure, onSuccess);
    }
    /**
     * get 请求
     */
    static async get({ url = null, body = null, onFailure = null, onSuccess = null, headers = null, needJuhua = true, isJson = true }) {
        body = JSON.stringify(body);
        console.log("%c%s%s\n%s", LogStyle.http_request, ">>>>> http get - request : ", url, body);
        needJuhua && UIComponent.open(UIDefine.UIPromptComponent);
        let response: string = <string>await this.__request(url, true, body, headers, isJson);
        needJuhua && UIComponent.close(UIDefine.UIPromptComponent);
        console.log("%c%s%s\n%s", LogStyle.http_response, ">>>>> http get - response : ", url, response);
        this.__response(response, onFailure, onSuccess);
    }

    static __response(response, onFailure, onSuccess) {
        switch (response) {
            case "timeout":
                ToastManager.Instance.createToast(CPErrorCode.LanguageDescription(10126));
                onFailure && onFailure(response);
                break;
            case "error":
                ToastManager.Instance.createToast(i18nMgr.Get("errorDefault"));
                onFailure && onFailure(response);
                break;
            default:
                let response_json: any;
                try {
                    response_json = JSON.parse(response);
                } catch (e) {
                    //json 解析异常
                    ToastManager.Instance.createToast(i18nMgr.Get("json_exception"));
                    onFailure && onFailure(null);
                    return;
                }

                if (response_json?.code == 0) {
                    onSuccess && onSuccess(response_json);
                } else {
                    //错误码提示 friend room bringin applied
                    switch (response_json.code) {
                        case 90003:
                            ToastManager.Instance.createToast(response_json.message);
                            break;
                        default:
                            ToastManager.Instance.createToast(CPErrorCode.ServerErrorDescription(response_json.code));
                            break;
                    }
                    onFailure && onFailure(response_json);
                }
                break;
        }
    }

    static async __request(url, isGet = false, body = null, headers = null, isJson = true) {
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
            xhr.onerror = function (err) {
                if (isTimeout) return;//请求已经超时，忽略
                clearTimeout(timer);//取消等待的超时
                resolve("error");
            };
            xhr.ontimeout = function () {
                if (isTimeout) return;//请求已经超时，忽略
                clearTimeout(timer);//取消等待的超时
                resolve("timeout");
            };

            let reqUrl = this.checkGetUrl(url, body, isGet);
            xhr.open(isGet ? "GET" : "POST", reqUrl);
            xhr.timeout = HttpClient.TimeOut;
            if (isJson) {
                xhr.setRequestHeader("Content-Type", "application/json");
            }
            //xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.setRequestHeader("md5at", LoginSession.Token);
            if (headers) {
                for (let header of headers) {
                    xhr.setRequestHeader(header[0], header[1]);
                }
            }
            xhr.send(body ? body : null);
        })
    }

    static checkGetUrl(reqUrl: string, body: any, isGet: boolean) {
        if (isGet) {
            reqUrl = this.getUrlParams(reqUrl, body);
        }
        return reqUrl;
    }

    static getUrlParams(url: string, param: any = null) {
        if (!CCTools.isNull(param)) {
            let paramStr: string = "";
            for (let key in param) {
                paramStr += `&{${key}}={${param[key]}}`;
            }

            url += "?" + paramStr.slice(1);
        }
        return url;
    }
}
