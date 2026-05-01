import { GameType } from "../constant/LogicTypeConf";
import { GameCache } from "../../../../game/GameCache";
import BaseGameplayData from "./BaseGameplayData";

/**
 * 核心玩法：数据访问层
 * 处理公共数据的访问
 */
export default class BaseGameplayDao {
    private static _instance: BaseGameplayDao | null = null;
    public static get Instance(): BaseGameplayDao {
        if (!BaseGameplayDao._instance) {
            BaseGameplayDao._instance = new BaseGameplayDao();
        }
        return BaseGameplayDao._instance;
    }

    private constructor() { }

    /**
     * 获取当前玩法数据
     * @returns BaseGameplayData
     */
    public GetGameplayData(): BaseGameplayData {
        let gameplayData: BaseGameplayData;
        switch (GameCache.Instance.game_type) {
            case GameType.UNKNOWN:
            case GameType.HOLDEM:
            case GameType.OMAHA4:
            case GameType.OMAHA5:
            case GameType.OMAHA6:
                gameplayData = GameCache.Instance._texasData!;
                break;
            case GameType.FANTASY:
                // gameplayData = GameCache.Instance._fantasyData!;
                break;
            case GameType.COWBOY:
                // gameplayData = GameCache.Instance._cowboyData!;
                break;
            case GameType.MAHJONG:
                // gameplayData = GameCache.Instance._mahjongData!;
                break;
            case GameType.EGG:
                // gameplayData = GameCache.Instance._eggData!;
                break;
            default:
                gameplayData = GameCache.Instance._texasData!;
                break;
        }

        return gameplayData;
    }

    /**
     * 清理数据
     */
    public Clear(): void {
        let gameplayData: BaseGameplayData = this.GetGameplayData();
        gameplayData._bigBlind = 0;
        gameplayData._smallBlind = 0;
        gameplayData._minBringIn = 0;
        gameplayData._curMinRate = 0;
        gameplayData._curMaxRate = 0;
        gameplayData._delayTimes = 0;
    }
}
