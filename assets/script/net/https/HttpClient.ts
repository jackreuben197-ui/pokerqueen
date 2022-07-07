import { UIDefine } from "../../define/UIDefine";
import ToastManager from "../../manager/ToastManager";
import UIManager from "../../manager/UIManager";
import { HttpErrorCode } from "./HttpErrorCode";

/**
 * Http端
 */
export default class HttpClient {
    //超时时间设置(毫秒)
    static TimeOut: number = 10000;
    /**
     * post 请求
     */
    static async post(url, param = null, { onFailure = null, onSuccess = null }) {
        cc.log("post - url : ", url, param);
        UIManager.open(UIDefine.UIPromptComponent);
        let response: string = <string>await this.__request(url, "POST", param);
        UIManager.close(UIDefine.UIPromptComponent);
        cc.log("post - response : ", response);
        this.__response(response, onFailure, onSuccess);
    }
    /**
     * get 请求
     */
    static async get(url, { onFailure = null, onSuccess = null }) {
        cc.log("get - url : ", url);
        UIManager.open(UIDefine.UIPromptComponent);
        let response: string = <string>await this.__request(url, "GET");
        UIManager.close(UIDefine.UIPromptComponent);
        cc.log("get - response : ", response);
        this.__response(response, onFailure, onSuccess);
    }
    static __response(response, onFailure, onSuccess) {
        switch (response) {
            case "timeout":
                ToastManager.ins.craeteToast(HttpErrorCode[HttpErrorCode.Timeout].key);
                onFailure && onFailure();
                break;
            case "error":
                ToastManager.ins.craeteToast(HttpErrorCode[HttpErrorCode.Error].key);
                onFailure && onFailure();
                break;
            default:
                if (response?.code > 0) {
                    //错误码提示
                }
                try {
                    let response_json = JSON.parse(response);
                    onSuccess && onSuccess(response_json);
                } catch (e) {
                    onSuccess && onSuccess(null)
                }
                break;
        }
    }

    static async __request(url, type = "POST", param = null) {
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
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(param ? JSON.stringify(param) : null);
        })
    }
}
