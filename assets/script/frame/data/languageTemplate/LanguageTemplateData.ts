import { TLanguageTemp } from "../../../config/TTypeConfig";
import { Web_Config_Multi_Language_Template } from "../../../net/https/WebRequest";
import { BaseData } from "../../base/BaseData";
import LanguageTempModel from "./LanguageTempModel";

export default class LanguageTemplateData extends BaseData {
    temp: LanguageTempModel = new LanguageTempModel();

    protected notify(api: any, msg: any, sendInfo?: any): void {
        switch (api) {
            case Web_Config_Multi_Language_Template.API: {
                this.respLanguageTemp(msg, sendInfo);
            } break;

        }
    }

    respLanguageTemp(msg: Array<TLanguageTemp>, sendInfo) {
        this.temp.updateData(msg);
    }

    //请求桌子名字模版
    reqLanguageTemp(onSuccess?: Function): void {
        this.reqServePost(Web_Config_Multi_Language_Template.API, null, onSuccess)
    }
}