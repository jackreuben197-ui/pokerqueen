import { RoomType } from "../define/EIDefine";
import GameCache from "../manager/GameCache";
import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { Protocol_Holdem_EnterRoom } from "../net/websocket/ProtocolHoldemMessages";
import Seat from "./Seat";
import { SeatStandupAnimation } from "./SeatStateHandler";
import TexasGame from "./TexasGame";

export default class TexasGameUtils {

    constructor(public game: TexasGame) {

    }

    /**
     * 请求进入房间
     */
    public EnterRoom() {
        let roomType = GameCache.Instance.room_type;
        if (roomType >= RoomType.MTTTexasHoldemStandardNoLimit) {
            //MTT
        } else {
            ProtocolAgency.Send({
                protocol: Protocol_Holdem_EnterRoom,
                RoomID: GameCache.Instance.room_id,
                MatchID: GameCache.Instance.match_id,
                body: Protocol_Holdem_EnterRoom.Request(
                    {
                        room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                        gps: { longitude: GameCache.Instance.longitude, latitude: GameCache.Instance.latitude },
                        mttPartialBringIn: 0,
                        observer: false,
                    }),
            });
        }
    }
    /**
     * 离开房间
     */
    // static LeaveRoom() {
    //     ProtocolAgency.Send({
    //         protocol: Protocol_Holdem_Leave,
    //         RoomID: GameCache.Instance.room_id,
    //         MatchID: GameCache.Instance.match_id,
    //         body: Protocol_Holdem_Leave.Request(
    //             {
    //                 room: {
    //                     roomId: GameCache.Instance.room_id,
    //                     matchId: GameCache.Instance.match_id,
    //                 }
    //             }),
    //     });
    // }


    /// <summary>
    /// 站起
    /// </summary>
    /// <param name="seatID"></param>
    public doStandUp(seatID: number): void {
        let mSeat: Seat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID != seatID ? this.game.mainPlayer.seatID : seatID);
        if (null != mSeat) {
            this.game.mainPlayer.ClearGameData();
            mSeat.Player = null;
            mSeat.FsmLogicComponent.SM.ChangeState(SeatStandupAnimation.Instance);
        }

        // 	UI mUIAddChips = UIComponent.Instance.Get(UIType.UIAddChips);
        // if (null != mUIAddChips && mUIAddChips.GameObject.activeInHierarchy) {
        //     UIComponent.Instance.HideNoAnimation(UIType.UIAddChips);
        // }

        // 	UI mUIUITexasPlayerInfo = UIComponent.Instance.Get(UIType.UITexasPlayerInfo);
        // if (null != mUIUITexasPlayerInfo && mUIUITexasPlayerInfo.GameObject.activeInHierarchy) {
        //     UIComponent.Instance.Remove(UIType.UITexasPlayerInfo);
        // }

        // HideOperationPanel();
        // HideAutoOperationPanel();
        // HideWaitBlindBtn();
        // HideCancelTrustBtn();
    }
    /// <summary>
    /// 获取小盲注位置，通过当前参与牌局玩家座位号
    /// </summary>
    /// <param name="SeatIds"></param>
    /// <param name="BigSeatId"></param>
    /// <returns></returns>
    public GetSmallSeatIdByPlayingSeatIds(SeatIds: number[], BigSeatId: number): number {
        let SmallSeatId: number = -1;
        SeatIds.sort((a, b) => a - b);
        for (let i = 0; i < SeatIds.length; i++) {
            if (BigSeatId == SeatIds[i]) {
                if (i - 1 >= 0) {
                    SmallSeatId = SeatIds[i - 1];
                }
                else {
                    SmallSeatId = SeatIds[SeatIds.length - 1];
                }
                break;
            }
        }
        return SmallSeatId;
    }
}
