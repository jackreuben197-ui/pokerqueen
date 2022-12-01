/*
 * @Author: xfj
 * @Date: 2022-09-27 11:48:16
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-28 18:14:54
 * @FilePath: /pokerqueen/assets/script/net/https/HttpRequest.ts
 */
import { EventName } from "../../config/EventName";
import { GameConfig } from "../../config/GameConfig";
import { NotifyManager } from "../../frame/manager/NotifyManager";
import HttpClient from "./HttpClient";
import WebHelper from "./WebHelper";
/**
 * HttpRequest 在HttpClient基础上包装一层
 */


export default class HttpRequest {

    static async Send({ api = null, request = null, body = {}, cuscomHost = null, onSuccess = null, onFailure = null, headers = null, isJson = true, isGet = false }) {
        let host = cuscomHost || GameConfig.Network.WebHost;
        api = api || request.API
        let url = host + api;
        url = this.handleUrl(url);
        let needJuhua = WebHelper.NeedJuhua(api);
        let needConsole = WebHelper.NeedConsole(api);
        await HttpClient[`${isGet ? "get" : "post"}`]({
            url: url,
            body: body,
            onFailure: onFailure,
            onSuccess: HttpRequest.onSuccess.bind(HttpRequest, api, request, body, onSuccess),
            headers: headers,
            needJuhua: needJuhua,
            isJson: isJson,
            needConsole: needConsole
        });
    }
    private static onSuccess(api, request, body, onSuccess, response) {
        NotifyManager.instance.post(EventName.serverResponse, api, response.data, body);
        request && (request.Response = response);
        onSuccess && onSuccess(response);
    }
    //代理转换
    public static handleUrl(url: string): string {
        // if (GameConfig.IsNewArea) {
        //     if (GameConfig.useProxy && url.indexOf("http://dev1.awanptesting.com/api/") > -1) {
        //         return url.replace("http://dev1.awanptesting.com/api/", "http://localhost:8080/")
        //     }
        // } else {
        //     if (GameConfig.useProxy && url.indexOf("http://dev.k8s.awanptesting.com:80/api/") > -1) {
        //         return url.replace("http://dev.k8s.awanptesting.com:80/api/", "http://localhost:8080/")
        //     }
        // }
        return url;
    }

    // 用于单独一个接口 需要https写死测试服务器用到
    static async Send2({ api = null, request = null, body = {}, cuscomHost = null, onSuccess = null, onFailure = null, headers = null }) {

        let host = "http://dev.awanptesting.com";
        let url = host + (api || request.API);
        url = this.handleUrl2(url);
        let needJuhua = WebHelper.NeedJuhua(request.API);
        await HttpClient.post({
            url: url, body, onFailure, onSuccess: HttpRequest.onSuccess2.bind(HttpRequest, request, onSuccess),
            headers: headers, needJuhua
        });
    }
    private static onSuccess2(request, onSuccess, response) {
        request.Response = response;
        onSuccess && onSuccess(response);
    }
    //代理转换
    public static handleUrl2(url: string): string {
        // if (GameConfig.IsNewArea) {
        //     if (GameConfig.useProxy && url.indexOf("http://dev.awanptesting.com/api/") > -1) {
        //         return url.replace("http://dev.awanptesting.com/api/", "http://localhost:8080/")
        //     }
        // } else {
        //     if (GameConfig.useProxy && url.indexOf("http://dev.k8s.awanptesting.com:80/api/") > -1) {
        //         return url.replace("http://dev.k8s.awanptesting.com:80/api/", "http://localhost:8080/")
        //     }
        // }
        return url;
    }
}
