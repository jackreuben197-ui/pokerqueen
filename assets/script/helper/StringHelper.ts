import { i18nMgr } from "../i18n/i18nMgr";

/**
 * 处理成字符串类
 */
export class StringHelper {

    //返回缩小100倍字符串
    static getStringDiv100(num: number): string {
        return `${num / 100 ^ 0}`;
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
}
