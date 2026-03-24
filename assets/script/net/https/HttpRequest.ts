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
import HotUpdateConfigCache from "./HotUpdateConfigCache";
import WebApiCacheCenter from "./WebApiCacheCenter";
import WebHelper from "./WebHelper";
/**
 * HttpRequest 在HttpClient基础上包装一层
 */

export default class HttpRequest {
    static async Send({
        api = null,
        request = null,
        body = {},
        cuscomHost = null,
        onSuccess = null,
        onFailure = null,
        headers = null,
        isJson = true,
        isGet = false,
        juhua = true,
        useCache = false,
    }) {
        let host = cuscomHost || GameConfig.Network.WebHost;
        api = api || request.API;
        const method: "GET" | "POST" = isGet ? "GET" : "POST";
        const requestClassName = request?.name || "WebCommon";

        const handledByCache =
            await HotUpdateConfigCache.HandleLegacyConfigRequest({
                api,
                request,
                headers,
                onSuccess,
            });
        if (handledByCache) {
            return;
        }

        let url = host + api;
        url = this.handleUrl(url);
        let needJuhua = WebHelper.NeedJuhua(api) && juhua;
        let needConsole = WebHelper.NeedConsole(api);

        const shouldUseCache =
            !!useCache ||
            (request && typeof request.CacheEnabled === "boolean"
                ? request.CacheEnabled
                : false);

        const cacheContext = {
            api,
            method,
            url,
            body,
            headers,
            requestClassName,
        };

        const cacheKey = shouldUseCache
            ? typeof request?.BuildCacheKey === "function"
                ? request.BuildCacheKey(cacheContext)
                : WebApiCacheCenter.buildDefaultKey(cacheContext)
            : "";
        const cacheTTL =
            shouldUseCache && typeof request?.CacheDataTTL === "number"
                ? request.CacheDataTTL
                : WebApiCacheCenter.DEFAULT_DATA_TTL_MS;
        const skipRequestTTL =
            shouldUseCache && typeof request?.CacheNoRequestTTL === "number"
                ? request.CacheNoRequestTTL
                : shouldUseCache && typeof request?.CacheTTL === "number"
                  ? request.CacheTTL
                  : WebApiCacheCenter.DEFAULT_SKIP_REQUEST_TTL_MS;
        const cachedRecord = shouldUseCache
            ? WebApiCacheCenter.get(cacheKey, cacheTTL)
            : null;
        const canSkipRequest =
            !!cachedRecord &&
            WebApiCacheCenter.isWithin(cachedRecord, skipRequestTTL);

        if (cachedRecord) {
            const cachedResponse = WebApiCacheCenter.deepClone(
                cachedRecord.response,
            );
            (cachedResponse as any).__cacheMeta = {
                source: "memory",
                key: cacheKey,
                ageMs: WebApiCacheCenter.ageMs(cachedRecord),
                skippedRequest: canSkipRequest,
            };
            request && (request.Response = cachedResponse);
            NotifyManager.instance.post(
                EventName.serverResponse,
                api,
                (cachedResponse as any)?.data,
                body,
            );
            console.log(
                `[HttpRequest][Cache] hit api=${api} key=${cacheKey} ageMs=${WebApiCacheCenter.ageMs(cachedRecord)} skipRequest=${canSkipRequest}`,
            );
            onSuccess && onSuccess(cachedResponse);
        } else if (shouldUseCache) {
            console.log(`[HttpRequest][Cache] miss api=${api} key=${cacheKey}`);
        }

        if (canSkipRequest) {
            return;
        }

        await HttpClient[`${isGet ? "get" : "post"}`]({
            url: url,
            body: body,
            onFailure: function (error) {
                // 已返回缓存时，后台同步失败不打断界面流程
                if (cachedRecord) {
                    return;
                }
                onFailure && onFailure(error);
            },
            onSuccess: function (response) {
                if (!shouldUseCache) {
                    HttpRequest.onSuccess(
                        api,
                        request,
                        body,
                        onSuccess,
                        response,
                    );
                    return;
                }

                const normalized =
                    typeof request?.NormalizeCacheResponse === "function"
                        ? request.NormalizeCacheResponse(response)
                        : response;
                const hash =
                    typeof request?.ComputeCacheHash === "function"
                        ? request.ComputeCacheHash(normalized)
                        : WebApiCacheCenter.hashFromJson(normalized);

                if (!cachedRecord) {
                    WebApiCacheCenter.set(cacheKey, normalized, hash);
                    console.log(
                        `[HttpRequest][Cache] store api=${api} key=${cacheKey} (no previous cache)`,
                    );
                    HttpRequest.onSuccess(
                        api,
                        request,
                        body,
                        onSuccess,
                        response,
                    );
                    return;
                }

                const shouldUpdate =
                    typeof request?.ShouldUpdateCache === "function"
                        ? request.ShouldUpdateCache(
                              cachedRecord.response,
                              normalized,
                              cachedRecord.hash,
                              hash,
                          )
                        : cachedRecord.hash !== hash;

                if (!shouldUpdate) {
                    WebApiCacheCenter.touch(cacheKey);
                    console.log(
                        `[HttpRequest][Cache] unchanged api=${api} key=${cacheKey}`,
                    );
                    return;
                }

                WebApiCacheCenter.set(cacheKey, normalized, hash);
                console.log(
                    `[HttpRequest][Cache] updated api=${api} key=${cacheKey}`,
                );
                HttpRequest.onSuccess(api, request, body, onSuccess, response);
            },
            headers: headers,
            needJuhua: needJuhua,
            isJson: isJson,
            needConsole: needConsole,
            api: api,
        });
    }
    private static onSuccess(api, request, body, onSuccess, response) {
        NotifyManager.instance.post(
            EventName.serverResponse,
            api,
            response.data,
            body,
        );
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
    static async Send2({
        api = null,
        request = null,
        body = {},
        cuscomHost = null,
        onSuccess = null,
        onFailure = null,
        headers = null,
    }) {
        let host = "http://dev.awanptesting.com";
        let url = host + (api || request.API);
        url = this.handleUrl2(url);
        let needJuhua = WebHelper.NeedJuhua(request.API);
        await HttpClient.post({
            url: url,
            body,
            onFailure,
            onSuccess: HttpRequest.onSuccess2.bind(
                HttpRequest,
                request,
                onSuccess,
            ),
            headers: headers,
            needJuhua,
            api,
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
