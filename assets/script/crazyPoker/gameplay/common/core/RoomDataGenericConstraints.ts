import TexasGameRoomDataBasic from "../../texas/data/TexasGameRoomDataBasic"
import TexasGameRoomDataPlayerMine from "../../texas/data/TexasGameRoomDataPlayerMine"

/**
 * 游戏类型
 */
export enum GameType {
   /**
     * 未知(非法值)
     */
    UNKNOWN = -1,
    /**
     * 德州扑克
     */
    HOLDEM = 0,
    /**
     * 奥马哈4张
     */
    OMAHA4 = 1,
    /**
     * 奥马哈5张
     */
    OMAHA5 = 2,
    /**
     * 奥马哈6张
     */
    OMAHA6 = 3,
    /**
     * 范特西
     */
    FANTASY = 4,
    /**
     * 牛仔
     */
    COWBOY = 5,
    /**
     * 麻将
     */
    MAHJONG = 6,
    /**
     * 掼蛋
     */
    GUANDAN = 7
}

/**
 * 扑克类型
 */
export enum PokerType {
    Normal = 0, //普通
    SixPlus = 2 //短牌
}

/**
 * 下注类型
 */
export enum BetType {
    NoLimit = 0, //无限注
    PotLimit = 1, //底池限注
    Aof = 2 //aof
}

// 基本信息约束
export interface RoomDataBasicGC  {
    [GameType.HOLDEM]: TexasGameRoomDataBasic,
    //[GameType.MAHJONG]: MahjongGameRoomDataBasic,
}