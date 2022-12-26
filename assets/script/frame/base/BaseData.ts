/*
 * @Author: xfj
 * @Date: 2022-10-09 10:42:01
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-26 10:16:52
 * @FilePath: /pokerqueen/assets/script/frame/base/BaseData.ts
 */
import { EventName } from "../../config/EventName";
import { TSendInfo } from "../../config/TTypeConfig";
import { HttpLink } from "../../net/https/HttpLink";
import { NotifyManager } from "../manager/NotifyManager";

export class BaseData {
    constructor() {
        // super();
        // this.regiterDispatchEvent()
        NotifyManager.instance.register(EventName.serverResponse, this.notify, this);
    }

    protected notify(id: any, msg: any, sendInfo?: any) { }

    protected post(name: string, ...args: any[]) {
        NotifyManager.instance.post(name, ...args)
    }

    reqServeGet(api: any, data: any = {}, onSuccess?: Function) {
        this.reqServe(api, data, true, onSuccess);
    }

    reqServePost(api: any, data: any = {}, onSuccess?: Function) {
        this.reqServe(api, data, false, onSuccess);
    }

    reqServe(api: any, data: any, isGet: boolean, onSuccess?: Function, url?: string) {
        let msgId = null;
        let request = null;

        if (typeof api == "string") {
            msgId = api
        } else {
            msgId = api.API
            request = api
        }

        let sendInfo: TSendInfo = {
            cuscomHost: url,
            api: msgId,
            request: request,
            body: data,
            isGet: isGet,
            onSuccess: onSuccess
        }

        HttpLink.instance.reqServe(sendInfo);
    }
}