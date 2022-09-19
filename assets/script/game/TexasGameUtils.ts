
import { ProcedureEnum } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import ProcedureManager from "../manager/ProcedureManager";
import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { Protocol_Holdem_EnterRoom, Protocol_Holdem_Leave } from "../net/websocket/ProtocolHoldemMessages";
import { ActionLimit, Def } from "../protobuf/holdem/define_pb";
import UIComponent from "../ui/UIComponent";
import { CardType } from "./CardTypeUtil";
import { GameCache } from "./GameCache";
import { RoomType } from "./GameUtil";
import Seat from "./Seat";
import { SeatStandupAnimation } from "./SeatStateHandler";
import TexasGame from "./texas/TexasGame";
import { PublicCardInfo } from "./UITexas";

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
        UIComponent.Instance.HideNoAnimation(this.game.uirc.UIAddChips.node);
        UIComponent.close(UIDefine.UITexasPlayerInfoComponent);

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


    public AddTimeCost(): number {
        return 10 * Math.pow(2, this.game.delayCount + 1) * 10;
    }

    public GetOpDelayConsumeType(): Def.ConsumeTypeMap[keyof Def.ConsumeTypeMap] {
        return this.game.delayCount == 0 ? Def.ConsumeType.CT_DELAY_2 : Def.ConsumeType.CT_DELAY_3;
    }


    /// <summary>
    /// 当有第二套牌时设置高亮手牌和公共牌
    /// </summary>
    /// <param name="publicCardInfos"></param>
    private SetWinnerCardsHight(publicCardInfos: PublicCardInfo[], _cards: number[]): void {
        let highlightCards_ref = { highlightCards: null };
        let cardType: CardType = this.game.GetCardType(highlightCards_ref, _cards);
        let highlightCards = highlightCards_ref.highlightCards;
        for (let i = 0, n = publicCardInfos.length; i < n; i++) {
            publicCardInfos[i].imageSelect.node.active = false;
            for (let j = 0, m = highlightCards.length; j < m; j++) {
                if (publicCardInfos[i].cardId == highlightCards[j]) {
                    publicCardInfos[i].imageSelect.node.active = true;
                    break;
                }
            }
        }

        let Seat: Seat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID);
        if (null != Seat) {
            if (this.game.mainPlayer.cards.length > 3) {
                Seat.UpdateCardType(cardType, highlightCards, true);
            }
        }
    }

    /// <summary>
    /// 获取自己跟住额，显示自动操作面板按钮用到
    /// </summary>
    /// <param name="roundBet"></param>
    /// <returns></returns>
    public getAutoOperationCallAmount(roundBet: number): number {
        if (roundBet - this.game.mainPlayer.anteNumber < 0) {
            return 0;
        }
        return roundBet - this.game.mainPlayer.anteNumber;
    }



    /// <summary>
    /// 退出房间
    /// </summary>
    public ExitRoom(): void {
        // UIComponent.Instance.Remove(UIType.UITexas);
        // UIComponent.Instance.Remove(UIType.UIInsurance);
        // UIComponent.Instance.Remove(UIType.UITexasHistory);
        // UIComponent.Instance.Remove(UIType.UITexasDanMuAndExpression);
        // UIComponent.Instance.Remove(UIType.UITexasReport);
        // UIComponent.Instance.Remove(UIType.UITexasPlayerInfo);
        // UIComponent.Instance.Remove(UIType.UITexasRule);
        // UIComponent.Instance.Remove(UIType.UITexasSetting);
        // UIComponent.Instance.Remove(UIType.UITexasReportMTT);
        // UIComponent.Instance.Remove(UIType.UITexasHumanVerification);
        // UIComponent.Instance.Remove(UIType.UITexasHumanVote);
        // UIComponent.Instance.Remove(UIType.UITexasHumanYZ);
        // UIComponent.Instance.Remove(UIType.UIAgreeSecondPcs);

        ProcedureManager.StartProcedure(ProcedureEnum.Lobby, { leaveRoom: true });
        //#region 关键属性最后置空
        GameCache.Instance.CurrentRoomID = 0;
        GameCache.Instance.room_id = 0;
        GameCache.Instance.match_id = 0;
        GameCache.Instance.room_type = 0;
        GameCache.Instance.voiceprint_verify_on = 0;
        GameCache.Instance.voiceprint_verify_duration = 0;
        GameCache.Instance.game_type = 0;
        GameCache.Instance.poker_type = 0;
        GameCache.Instance.bet_type = 0;
        //#endregion
    }
}
