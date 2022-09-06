import { RoomType } from "../define/EIDefine";
import Main from "../Main";
import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { Protocol_Holdem_EnterRoom, Protocol_Holdem_Leave } from "../net/websocket/ProtocolHoldemMessages";
import { ActionLimit, Def } from "../protobuf/holdem/define_pb";
import { GameCache } from "./GameCache";
import Seat from "./Seat";
import { SeatStandupAnimation } from "./SeatStateHandler";
import TexasGame from "./TexasGame";

export default class TexasGameUtils {

    constructor(private game: TexasGame) {

    }

    /**
     * 请求进入房间
     */
    public EnterRoom(id) {

        console.log("EnterRoom GameCache.Instance.CurGame: ", GameCache.Instance.CurGame);

        let roomType = GameCache.Instance.room_type;
        if (roomType >= RoomType.MTTTexasHoldemStandardNoLimit) {
            //MTT
        } else {
            console.log(" ProtocolAgency.Send: ", GameCache.Instance.room_id, GameCache.Instance.match_id);
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
    public LeaveRoom() {
        ProtocolAgency.Send({
            protocol: Protocol_Holdem_Leave,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            body: Protocol_Holdem_Leave.Request(
                {
                    room: {
                        roomId: GameCache.Instance.room_id,
                        matchId: GameCache.Instance.match_id,
                    }
                }),
        });
    }


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
    //private AutoOperationHandle(Array<ActionLimit.AsObject> actionLimits): boolean


    /// <summary>
    /// 自动操作
    /// </summary>
    /// <param name="actionLimits"></param>
    /// <returns></returns>
    public AutoOperationHandle(actionLimits: ActionLimit.AsObject[]): boolean {
        if (this.game.autoFold) {
            if (this.getActionLimitByAction(actionLimits, Def.Action.CHECK) != null) {
                // 看牌
                GameCache.Instance.CurGame.OptAction(Def.Action.CHECK, 0);
                return true;
            }
            else {
                // 弃牌
                GameCache.Instance.CurGame.OptAction(Def.Action.FOLD, 0);
                return true;
            }
        }
        if (this.game.autoCheck && this.getActionLimitByAction(actionLimits, Def.Action.CHECK) != null) {
            GameCache.Instance.CurGame.OptAction(Def.Action.CHECK, 0);
            return true;
        }
        if (this.game.autoCall && this.getActionLimitByAction(actionLimits, Def.Action.CALL) != null) {
            GameCache.Instance.CurGame.OptAction(Def.Action.CALL, this.getActionLimitByAction(actionLimits, Def.Action.CALL).min);
            return true;
        }
        if (this.game.autoAllin && this.getActionLimitByAction(actionLimits, Def.Action.ALLIN) != null) {
            GameCache.Instance.CurGame.OptAction(Def.Action.ALLIN, this.getActionLimitByAction(actionLimits, Def.Action.ALLIN).min);
            return true;
        }
        return false;
    }

    /// <summary>
    /// 通过Action 取得ActionLimit
    /// </summary>
    /// <param name="action"></param>
    /// <returns></returns>
    private getActionLimitByAction(actionLimits: ActionLimit.AsObject[], action: Def.ActionMap[keyof Def.ActionMap]): ActionLimit.AsObject {

        actionLimits.forEach(actionLimit => {
            if (actionLimit.action == action) {
                return actionLimit;
            }
        })
        return null;
    }
}
