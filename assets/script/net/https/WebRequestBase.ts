/**
 * Http请求接口
 */

import { Result } from "../../protobuf/holdem/define_pb";
import HttpRequest from "./HttpRequest";
import WebApiCacheCenter, { WebApiCacheContext } from "./WebApiCacheCenter";

export class WebCommon {
    public static API: string;
    public static RequestParams: any;
    public static ResponseData: any;
    public static CacheEnabled: boolean = false;
    public static CacheTTL: number = 0;
    public static Request(param) {
        this.RequestParams = param;
        return param;
    }
    public static BuildCacheKey(context: WebApiCacheContext): string {
        return WebApiCacheCenter.buildDefaultKey(context);
    }
    public static NormalizeCacheResponse<T = any>(response: T): T {
        return response;
    }
    public static ComputeCacheHash(response: any): string {
        return WebApiCacheCenter.hashFromJson(response);
    }
    public static ShouldUpdateCache(
        previousResponse: any,
        nextResponse: any,
        previousHash: string,
        nextHash: string,
    ): boolean {
        return previousHash !== nextHash;
    }
    public static Response: {
        code?: number;
        message?: string;
        data?;
    };
}

export class WebWww {
    public static get Instance(): WebWww {
        return ((this as any).__Instance ??= new WebWww());
    }
    /**
     * @param param 
     * web_class 接口类
     * body 发送数据body
     * api_id 替换接口中{id}
     * club_id 公会club_id
     * 范例
     * WebWww.Instance.CommonAPI(
            {
                web_class: WebClubApplyAudit,
                body: {
                    apply_id: 111,
                    audit_op: 2//2同意 3拒绝
                },
                club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {
                this.reqInfo();
            },
            (res: any) => {

            }
        )
     * @returns 
     */
    CommonAPI(param: {
        web_class: { API: string; Request; Response };
        body?: any;
        api_id?: number;
        club_id?: number;
        juhua?: boolean;
        useCache?: boolean;
    }) {
        return new Promise((resolve, reject) => {
            let obj: any = {
                request: param.web_class,
                body: param.web_class.Request(param.body),
                onSuccess: function () {
                    resolve(param.web_class.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                juhua: param.juhua,
                useCache: !!param.useCache,
            };
            //设置动态id参数
            param.api_id > 0 &&
                (obj.api = param.web_class.API.replace(
                    "{id}",
                    `${param.api_id}`,
                ));
            //设置header
            let headers = [];
            param.club_id > 0 && headers.push(["X-Club", param.club_id]);
            obj.headers = headers;
            HttpRequest.Send(obj);
        });
    }
}
