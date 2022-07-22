import { GameConfig, LogStyle } from "../../config/GameConfig";
import { UIDefine } from "../../define/UIDefine";
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
        console.log("%c%s%s\n%s", LogStyle.http_request, ">>>>> http post - request : ", url.replace("http://", ""), param);
        needJuhua && UIManager.open(UIDefine.UIPromptComponent);
        let response: string = <string>await this.__request(url, "POST", param, headers);
        needJuhua && UIManager.close(UIDefine.UIPromptComponent);
        console.log("%c%s%s\n%s", LogStyle.http_response, ">>>>> http post - response : ", url.replace("http://", ""), response);
        this.__response(response, onFailure, onSuccess);
    }
    /**
     * get 请求
     */
    static async get({ url = null, param = null, onFailure = null, onSuccess = null, needJuhua = true }) {
        param = JSON.stringify(param);
        console.log("%c%s%s\n%s", LogStyle.http_request, ">>>>> http get - request : ", url.replace("http://", ""), param);
        needJuhua && UIManager.open(UIDefine.UIPromptComponent);
        let response: string = <string>await this.__request(url, "GET", param);
        needJuhua && UIManager.close(UIDefine.UIPromptComponent);
        console.log("%c%s%s\n%s", LogStyle.http_response, ">>>>> http get - response : ", url.replace("http://", ""), response);
        this.__response(response, onFailure, onSuccess);
    }

    static __response(response, onFailure, onSuccess) {
        switch (response) {
            case "timeout":
                ToastManager.ins.craeteToast("adaptation10126");
                onFailure && onFailure();
                break;
            case "error":
                ToastManager.ins.craeteToast("errorDefault");
                onFailure && onFailure();
                break;
            default:
                try {
                    let response_json = JSON.parse(response);
                    if (response_json?.code > 0) {
                        //错误码提示
                        ToastManager.ins.craeteToast(`ServerErrorCode_${response_json.code}`);
                        onFailure && onFailure(response_json.code);
                        return;
                    }
                    onSuccess && onSuccess(response_json);
                } catch (e) {
                    onSuccess && onSuccess(null)
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
            xhr.open(type, url, true);
            xhr.timeout = HttpClient.TimeOut;
            xhr.setRequestHeader("Content-Type", "application/json");
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
