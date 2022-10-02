import { i18nMgr } from "../i18n/i18nMgr";

/**
 * 处理成字符串类
 */
export class StringHelper {

    //返回缩小100倍字符串
    static getStringDiv100(num: number): string {
        return `${num / 100 ^ 0}`;
    }

    static GetSignedLongString(num: number): string {
        if (num == 0) {
            return "0";
        }
        if (num > 0) {
            return `+${num / 100}`;
        }
        else {
            return `${num / 100}`;
        }
    }
    /**
     * 替换{0}
     */
    static Format(str: string, replace: string = ""): string {
        return str.replace("{0}", replace);
    }

    /// <summary>
    /// 获取房间类型名称
    /// </summary>
    /// <param name="game_type"></param>
    /// <param name="poker_type"></param>
    /// <param name="bet_type"></param>
    /// <returns></returns>
    public static GetRoomTypeNameByType(game_type: number, poker_type: number, bet_type: number): string {
        let name = "";
        let gameTypeStr = i18nMgr.Get("GameType_" + game_type);
        let pokerTypeStr = i18nMgr.Get("PokerType_" + poker_type);
        let betTypeStr = i18nMgr.Get("BetType_" + bet_type);
        name = gameTypeStr + "-" + pokerTypeStr + "-" + betTypeStr;
        return name;
    }
    /**
     * 格式化数字字符串
     * @param format 
     * @param num 
     * @returns 
     */
    public static FormatToString(format: string = null, num: number = 0) {
        let str = num.toString();
        switch (format) {
            case "{0:N0}"://转换成 1,000,000 格式
                str = this.__N0(str);
                break;
        }
        return str;
    }
    private static __N0(str: string) {
        let len = str.length;
        let end = len;
        let start = end - 3;
        let arr: string[] = [];
        while (start > 0) {
            arr.unshift(str.substring(start, end));
            end = start;
            start = end - 3;
        }
        arr.unshift(str.substring(start, end));
        return arr.join(",").toString();
    }
}
