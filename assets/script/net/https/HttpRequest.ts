import { GameConfig } from "../../config/GameConfig";
import HttpClient from "./HttpClient";
import WebHelper from "./WebHelper";
/**
 * HttpRequest 在HttpClient基础上包装一层
 */

export default class HttpRequest {

    static async Send({ api = null, request = null, body = {}, cuscomHost = null, onSuccess = null, onFailure = null, headers = null }) {

        let host = cuscomHost || GameConfig.Network.WebURL;
        let url = host + (api || request.API);
        url = this.handleUrl(url);
        let needJuhua = WebHelper.NeedJuhua(request.API);
        await HttpClient.post({
            url: url, body, onFailure, onSuccess: HttpRequest.onSuccess.bind(HttpRequest, request, onSuccess),
            headers: headers, needJuhua
        });
    }
    private static onSuccess(request, onSuccess, response) {
        request.Response = response;
        onSuccess && onSuccess(response);
    }
    //代理转换
    public static handleUrl(url: string): string {
        if (GameConfig.IsNewArea) {
            if (GameConfig.useProxy && url.indexOf("http://dev1.awanptesting.com/api/") > -1) {
                return url.replace("http://dev1.awanptesting.com/api/", "http://localhost:8080/")
            }
        } else {
            if (GameConfig.useProxy && url.indexOf("http://dev.k8s.awanptesting.com:80/api/") > -1) {
                return url.replace("http://dev.k8s.awanptesting.com:80/api/", "http://localhost:8080/")
            }
        }
        return url;
    }
}
