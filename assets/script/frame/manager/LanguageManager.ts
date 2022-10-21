import { i18nMgr } from "../../i18n/i18nMgr";
import CCTools from "../../tools/CCTools";



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

    /**
     * 检查文本字节数，汉字占2位，字母占1位
     * @param str 
     * @param char 是否按字节计算长度
     */
    getStrLen(str: string, char: boolean = true): number {
        let realLength = 0, len = str.length, charCode = -1;
        for (let i = 0; i < len; i++) {
            if (char) {
                charCode = str.charCodeAt(i);
                if (charCode >= 0 && charCode <= 128) realLength += 1;
                else realLength += 2;
            } else {
                realLength += 1
            }
        }
        return realLength;
    }

    /**
     * 检查文本字节数，截取一定长度的字符
     * @param str 
     * @param count 截取长度 
     * @param replaceStr 字符串最后以什么符号链接   
     * @param char 是否按字节计算长度
     */
    getStrByLen(str: string, count: number, replaceStr: string = "...", char: boolean = true): string {
        str = str.trim()
        let realLength = 0, len = str.length, charCode = -1, curLen = 0;
        for (let i = 0; i < len; i++) {
            curLen = 1
            if (char) {
                charCode = str.charCodeAt(i);
                if (charCode >= 0 && charCode <= 128) curLen = 1;
                else curLen = 2;
            }

            realLength += curLen;
            if (realLength > count) {
                if (CCTools.isNull(replaceStr)) {
                    str = str.substring(0, i);
                } else {
                    str = str.substring(0, i - 1) + replaceStr;
                }
                break;
            }
        }
        return str;
    }
}