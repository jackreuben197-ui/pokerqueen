/**
 * 游戏玩法工具类
 * 提供游戏相关的静态工具方法
 */
import { TableType } from '../constant/TableType';
import { RoomOriginType } from '../constant/RoomOriginType';
import { GameCache } from '../../../../game/GameCache';
import { HttpUserInfoProtocol } from '../../../module/message/CPHotfixWebMessage/user/HttpUserInfoProtocol';

export default class GameplayUtil {

    constructor() {
        throw new Error(`${GameplayUtil.name} is a static class and cannot be instantiated`);
    }

    /**
     * 获取俱乐部或者朋友桌类型
     * 1 朋友桌，2 俱乐部内部桌，3 俱乐部外部桌/大厅桌
     * @returns TableType
     */
    public static GetTableType(): TableType {
        let tableType = TableType.UNKNOWN;
        if (GameCache.Instance._shareTableType == 1 && GameCache.Instance._originType == RoomOriginType.FRIEND) {
            tableType = TableType.FRIEND;
        } else if (GameCache.Instance._shareTableType == 1 && GameCache.Instance._originType == RoomOriginType.CLUB) {
            tableType = TableType.CLUB_INNER;
        } else {
            tableType = TableType.CLUB_EXTERNAL;
        }
        return tableType;
    }

    public static IsTrader(user: HttpUserInfoProtocol.UserInfo): boolean {
        return Date.now() < user.trader_expire_time * 1000;
    }

    
    public static RoomTypeExtract(roomType: number) {
        // 1. 是否是 MTT 赛制 (右移 9 位)
        const isMTT = (roomType >> 9) === 1;

        // 2. 取低 9 位的数据
        let left = roomType & 0x1FF;

        // 3. 剥离游戏大类 GameType (右移 6 位)
        const gameType = left >> 6;

        // 4. 取剩下的低 6 位
        left = left & 0x3F;

        // 5. 剥离 扑克类型 PokerType (右移 3 位)
        const pokerType = left >> 3;

        // 6. 剩下的最后 3 位就是下注限制类型 LimitBetType
        const betType = left & 0x07;

        return {
            gameType,
            pokerType,
            betType,
            isMTT
        };
    }
}
