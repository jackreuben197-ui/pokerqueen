import AGameplayEntrance from "./AGameplayEntrance";
import TexasGameplayEntrance from "./TexasGameplayEntrance";
import MttTexasGameplayEntrance from "./MttTexasGameplayEntrance";
import { RoomType } from "../../../game/util/GameUtil";

export class AGameplayEntranceProvider {
    /**
     * 统一入口：根据房间类型创建对应的玩法实例
     */
    public static createEntrance(
        roomType: number, 
        matchId: number, 
        roomId: number
    ): AGameplayEntrance {
        
        if (this._isRegularTexasGameplay(roomType)) {
            return new TexasGameplayEntrance(roomType, matchId, roomId);
        }

        if (this._isMttTexasGameplay(roomType)) {
            // TODO: MTT玩法入口
            return new MttTexasGameplayEntrance(roomType, matchId, roomId);
        }

        if (this._isCowboyGameplay(roomType)) {
            // TODO: 牛仔玩法入口
            // return new CowboyGameplayEntrance(roomType, matchId, roomId);
        }
        
        throw new Error(`Unknown room type: ${roomType}`);
    }

    // ==================== 静态方法 ====================

    /**
     * 判断是否为常规德州玩法
     * @param roomType 玩法类型
     */
    private static _isRegularTexasGameplay(roomType: number): boolean {
        // 德州类型: 0-63
        return roomType >= 0 && roomType < 256;
    }

    /**
     * 判断是否为MTT德州玩法
     * @param roomType 玩法类型
     */
    private static _isMttTexasGameplay(roomType: number): boolean {
        // MTT德州类型: 512-575
        return roomType >= 512 && roomType < 723;
    }

    /**
     * 判断是否为牛仔玩法
     * @param roomType 玩法类型
     */
    private static _isCowboyGameplay(roomType: number): boolean {
        return roomType === RoomType.GameNiuZai;
    }
}