import { GameConfig } from "../../config/GameConfig";
import HttpClient from "./HttpClient";
/**
 * HttpRequest 在HttpClient基础上包装一层
 */

export default class HttpRequest {

    static async Send({ request = null, param = {}, cuscomHost = null, onSuccess = null, onFailure = null, headers = null }) {

        let host = cuscomHost || GameConfig.Network.WebURL;
        let url = host + request.API;
        //GameConfig.useProxy && (url = HttpRequest.handleUrl(url));
        //@ts-ignore
        await HttpClient.post({
            url: url, param, onFailure, onSuccess: HttpRequest.onSuccess.bind(HttpRequest, request, onSuccess),
            headers: headers
        });
    }
    private static onSuccess(request, onSuccess, response) {
        request.Response = response;
        onSuccess && onSuccess(response);
    }
    //代理转换
    public static handleUrl(url: string): string {
        if (url.indexOf("http://dev.k8s.awanptesting.com:80/api/") > -1) {
            return url.replace("http://dev.k8s.awanptesting.com:80/api/", "http://localhost:8080/")
        }
        return url;
    }
}
