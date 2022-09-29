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

    protected notify(id: any, msg: any) { }


    reqServeGet(api: any, data: any = {}) {
        this.reqServe(api, data, true);
    }

    reqServePost(api: any, data: any = {}) {
        this.reqServe(api, data, false);
    }

    reqServe(api: any, data: any, isGet: boolean, url?: string) {
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
            isGet: isGet
        }

        HttpLink.instance.reqServe(sendInfo);
    }
}