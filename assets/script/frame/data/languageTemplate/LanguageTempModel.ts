import { TLanguageTemp } from "../../../config/TTypeConfig";
import { i18nMgr } from "../../../i18n/i18nMgr";

export default class LanguageTempModel {
    private _data: Map<string, TLanguageTemp> = new Map();
    updateData(msgs: Array<TLanguageTemp>) {
        msgs.forEach(msg => {
            this._data.set(msg.template_id, msg);
        })
    }

    getName(nameKey: string) {
        let [key, _] = nameKey.split("-")
        let msg = this._data.get(key);
        if (msg) {
            return msg[`${this.languageFlag}_name`];
        }
        return nameKey;
    }

    get languageFlag() {
        if (i18nMgr.language == "en") return "us";
        if (i18nMgr.language == "pt") return "br";
        return i18nMgr.language

    }
}