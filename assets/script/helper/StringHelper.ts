import { i18nMgr } from "../i18n/i18nMgr";

/**
 * 处理成字符串类
 */
export class StringHelper {

    //返回缩小100倍字符串
    static getStringDiv100(num: number): string {
        return `${num / 100 ^ 0}`;
    }
    static GetLongString(num: number): string {

        return `${num / 100}`;
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
     * 格式化数字字符串 支持正负数
     * 转换成 1,000,000 格式
     * @param format 
     * @param num 
     * @returns 
     */
    /**
     * 金钱表达式 1,000,000 格式 正负数
     * fix 保留几位小数
     */
    // public static MoneyExpress(value: number | string, fix: number = 0) {
    //     if (isNaN(+value)) return value.toString();
    //     let str = value.toString();
    //     let arr = str.split("-");
    //     let op = arr.length > 1 ? "-" : "";
    //     let nop_str = arr[arr.length - 1];
    //     let dot_index = nop_str.indexOf(".");
    //     let base_str = nop_str.substring(0, dot_index);
    //     let fix_str = nop_str.substring(dot_index);

    //     let len = base_str.length;
    //     if (len > 3) {
    //         let start = len - 3;
    //         while (start > 0) {
    //             arr.unshift(str.substring(start, end));
    //             end = start;
    //             start = end - 3;
    //         }
    //     }



    // let len = _str.length;
    // let end = len;
    // let start = end - 3;
    // let arr: string[] = [];
    // while (start > 0) {
    //     arr.unshift(str.substring(start, end));
    //     end = start;
    //     start = end - 3;
    // }
    // arr.unshift(str.substring(start, end));
    // let base = arr.join(",").toString();

    public static FormatToString(format: string = null, num: number | string = 0) {

        let _num = +num;

        let _num_str = "";
        //符号部分
        let op = "";
        if (_num < 0) {
            op = "-";
            _num = -_num;
        }
        switch (format) {
            case "{0:N0}":
                _num_str = _num.toFixed(0);
                break;
            case "{0:N1}":
                _num_str = _num.toFixed(1);
                break;
            case "{0:N2}":
                _num_str = _num.toFixed(2);
                break;
            default:
                return num.toString();
        }
        //小数部分
        let d_num = "";
        let dot_index = _num_str.indexOf(".");
        if (~dot_index) {
            d_num = _num_str.substring(dot_index);
        }
        let str = (+_num_str ^ 0).toString();
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
        let base = arr.join(",").toString();
        return op + base + d_num;
    }

    /**
     * 判断整数不变，小数保留1位
     */
    public static FormatIntOrFloat1(num: string | number): string {
        let numStr = num.toString();
        if (~numStr.indexOf(".")) {
            return this.FormatToString("{0:N1}", numStr);
        }
        return numStr;
    }
    /**
     * 除100并且判断整数不变，小数保留1位
     */
    public static Div100Float1(num: number, div100: boolean = true) {
        let num_str = div100 ? this.GetLongString(num) : num.toString();
        let dot_index = num_str.indexOf(".");
        if (~dot_index) {
            return num_str.substring(0, dot_index + 2);
        }
        return num_str;
    }
}
(window as any).StringHelper = StringHelper;