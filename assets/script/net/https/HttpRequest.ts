import { GameConfig } from "../../config/GameConfig";
import HttpClient from "./HttpClient";

/**
 * HttpRequest 在HttpClient基础上包装一层
 */
export default class HttpRequest {
    static Send({ api = null, param = null, onFailure = null, onSuccess = null, cuscomHost = null }) {
        if (api == "") {
            cc.log("请求接口为空");
            return;
        }
        let host = cuscomHost || GameConfig.Network.WebURL;
        HttpClient.post({ url: host + api, param, onFailure, onSuccess });
    }
}
