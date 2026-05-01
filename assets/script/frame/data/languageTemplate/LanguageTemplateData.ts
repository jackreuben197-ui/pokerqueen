import { TLanguageTemp } from "../../../config/TTypeConfig";
import { WebConfigMultiLanguageTemplate } from "../../../net/https/WebRequest";
import { BaseData } from "../../base/BaseData";
import LanguageTempModel from "./LanguageTempModel";

export default class LanguageTemplateData extends BaseData {
    temp: LanguageTempModel = new LanguageTempModel();

    protected notify(api: any, msg: any, sendInfo?: any): void {
        switch (api) {
            case WebConfigMultiLanguageTemplate.API: {
                this.respLanguageTemp(msg, sendInfo);
            } break;

        }
    }

    respLanguageTemp(msg: Array<TLanguageTemp>, sendInfo?: any): void {
        this.temp.updateData(msg);
    }

    //请求桌子名字模版
    reqLanguageTemp(onSuccess?: Function): void {
        this.reqServePost(WebConfigMultiLanguageTemplate.API, null, onSuccess)
    }
}