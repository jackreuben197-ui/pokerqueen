import { GameConfig } from "../../config/GameConfig";
import HttpClient from "./HttpClient";
/**
 * HttpRequest 在HttpClient基础上包装一层
 */


export default class HttpRequest {

    static async Send({ request = null, param = {}, cuscomHost = null, onSuccess = null, onFailure = null }) {

        let host = cuscomHost || GameConfig.Network.WebURL;
        //@ts-ignore
        await HttpClient.post({
            url: host + request.API, param, onFailure, onSuccess: HttpRequest.onSuccess.bind(HttpRequest, request, onSuccess)
        });
    }
    private static onSuccess(request, onSuccess, response) {
        request.Response = response;
        onSuccess && onSuccess(response);
    }
}
