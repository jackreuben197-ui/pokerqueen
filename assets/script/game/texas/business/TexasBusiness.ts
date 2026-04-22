import { GameCache } from "../../GameCache";
import { RoomType } from "../../util/GameUtil";
import TexasGame from "../TexasGame";

const { ccclass } = cc._decorator;

/**
 * EnterRoomType
 * 进入房间类型
 */
export enum EnterRoomType {
    /** 普通入座 */
    Normal = 0,
    /** 随机入座 */
    Random = 1,
}

/**
 * TexasBusiness
 * 德州扑克业务逻辑类
 * 存放德州扑克相关的业务方法
 */
@ccclass
export default class TexasBusiness {

    private static instance: TexasBusiness = null;
    public static get Instance(): TexasBusiness {
        if (!this.instance) {
            this.instance = new TexasBusiness();
        }
        return this.instance;
    }

    /**
     * 判断是否是MTT比赛游戏
     * @param roomType 房间类型
     */
    public static IsMttGameplay(roomType: number): boolean {
        // MTT房间类型从512开始
        return roomType >= RoomType.MTTTexasHoldemStandardNoLimit;
    }

    /**
     * 是否开启牌局分享
     * @returns 是否可以显示分享按钮
     */
    public IsOpenRoomShare(): boolean {
        let isShow: boolean = true;

        // MTT不可分享
        isShow = !TexasBusiness.IsMttGameplay(GameCache.Instance.room_type);

        // 随机进入房间不可分享
        if (GameCache.Instance.enterRoomType === EnterRoomType.Random) {
            isShow = false;
        }

        // 安全屋判断
        let isSafeRoom: boolean = false;
        let game: TexasGame = GameCache.Instance.CurGame;
        if (game?.isSafeRoom || Number(GameCache.Instance.room_seated_messaging || 0) === 1) {
            isSafeRoom = true;
        }

        if (isSafeRoom) {
            // 安全屋，玩家自己入座后才显示分享按钮
            if (!game?.mainPlayer || game?.mainPlayer.seatID < 0) {
                isShow = false;
            }
        }

        return isShow;
    }

    /**
     * 检查是否一键静音
     * @returns 是否一键静音
     */
    public CheckIsOneKeyMute(): boolean {
        // TODO: 根据具体实现返回
        return false;
    }
}
