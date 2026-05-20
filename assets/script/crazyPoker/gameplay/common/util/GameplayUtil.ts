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

    public static IsTrader(user:HttpUserInfoProtocol.UserInfo): boolean  {
        return Date.now() < user.trader_expire_time * 1000;
    }
}
