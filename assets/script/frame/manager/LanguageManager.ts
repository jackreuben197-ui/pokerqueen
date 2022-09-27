import { i18nMgr } from "../../i18n/i18nMgr";



export default class LanguageManager {
    private static _instance: LanguageManager = null;
    public static get instance() {
        if (!LanguageManager._instance) {
            LanguageManager._instance = new LanguageManager();
        }
        return LanguageManager._instance;
    }

    getLocal(key: string | number, ...params) {
        let str = i18nMgr.Get(String(key));
        if (!Boolean(str)) {
            str = "缺少字段:" + key;
        } else if (params && params.length) {
            str = this.formatString(str, ...params);
        }
        return str;
    }

    formatString(localValue: string, ...params): string {
        if (params.length) {
            params.forEach((value, index) => {
                let paramStr: string = String(value);
                let str = i18nMgr.Get(paramStr);
                if (Boolean(str)) {
                    paramStr = str;
                }

                let reg = new RegExp(`\\{${index}\\}`, "g");
                localValue = localValue.replace(reg, paramStr);
            })
        }
        return localValue;
    }
}