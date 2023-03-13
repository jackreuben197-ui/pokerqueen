import { ProcedureEnum } from "../../define/EIDefine";
import { UIDefine } from "../../define/UIDefine";
import { UIMatchMttModel } from "../../frame/data/mtt/UIMatchMttModel";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import ProcedureManager from "../../manager/ProcedureManager";
import ProtocolAgency from "../../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../../net/websocket/ProtocolCode";
import WebSocketClient from "../../net/websocket/WebSocketClient";
import { ActionLimit, Def } from "../../protobuf/holdem/define_pb";
import { ClientMessageAgreeSecondPcsActive } from "../../protobuf/holdem/req_agree_second_pcs_active_pb";
import { ClientMessageEnterRoom } from "../../protobuf/holdem/req_enter_room_pb";
import { ClientMessageLeave } from "../../protobuf/holdem/req_leave_pb";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { CardType } from "../CardTypeUtil";
import { CPlayer } from "../CPlayer";
import { GameCache } from "../GameCache";
import Seat from "../seat/Seat";
import { SeatStandupAnimation } from "../SeatStateHandler";
import TexasGame from "../texas/TexasGame";
import { PublicCardInfo } from "../UITexas";
import { RoomType } from "./GameUtil";


export default class TexasGameUtils {

    constructor(private game: TexasGame) {

    }

    /**
     * 请求进入房间
     */
    public EnterRoom() {

        let roomType = GameCache.Instance.room_type;

        if (roomType >= RoomType.MTTTexasHoldemStandardNoLimit) {
            //MTT

            GameCache.Instance.match_id = UIMatchMttModel.Instance.MttInfo.mtt.match_id;
            GameCache.Instance.seat_count = UIMatchMttModel.Instance.MttInfo.mtt.seat_count;
            GameCache.Instance.mtt_Hunter_game = UIMatchMttModel.Instance.MttInfo.mtt.hunter_on > 0;
            GameCache.Instance.roomName = GC.data.languageTemp.temp.getName(UIMatchMttModel.Instance.MttInfo.mtt.name);
            //UILoginModel.mInstance.GetRoomNameByKey(UIMatchMttModel.Instance.MttInfo.mtt.name);

            ProtocolAgency.Send<ClientMessageEnterRoom.AsObject>({
                Code: ProtocolCode.Protocol_Holdem_EnterRoom,
                RoomID: GameCache.Instance.room_id,
                MatchID: GameCache.Instance.match_id,
                Body:
                {
                    room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                    gps: { longitude: GameCache.Instance.longitude, latitude: GameCache.Instance.latitude },
                    mttPartialBringIn: UIMatchMttModel.Instance.PartialBringIn,
                    observer: GameCache.Instance.CurGame.IsLookOn,
                },
            });

            console.log(`EnterRoom : match_id - ${GameCache.Instance.match_id} room_id - ${GameCache.Instance.room_id}`);

        } else {
            console.log(" ProtocolAgency.Send: ", GameCache.Instance.room_id, GameCache.Instance.match_id);
            ProtocolAgency.Send<ClientMessageEnterRoom.AsObject>({
                Code: ProtocolCode.Protocol_Holdem_EnterRoom,
                RoomID: GameCache.Instance.room_id,
                MatchID: GameCache.Instance.match_id,
                Body:
                {
                    room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                    gps: { longitude: GameCache.Instance.longitude, latitude: GameCache.Instance.latitude },
                    mttPartialBringIn: 0,
                    observer: false,
                },
            });
        }
    }
    /**
     * 离开房间
     */
    public LeaveRoom() {
        if (WebSocketClient.CheckOpen()) {
            ProtocolAgency.Send<ClientMessageLeave.AsObject>({
                Code: ProtocolCode.Protocol_Holdem_Leave,
                RoomID: GameCache.Instance.room_id,
                MatchID: GameCache.Instance.match_id,
                Body: {
                    room: {
                        roomId: GameCache.Instance.room_id,
                        matchId: GameCache.Instance.match_id,
                    }
                },
            });
        } else {
            this.ExitRoom();
        }
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
        //UIComponent.Instance.HideUI(PrefabUI.UIAddChipsComponent);
        UIComponent.Instance.HideUI(PrefabUI.UIBringIn);
        UIComponent.close(UIDefine.UITexasPlayerInfoComponent);

        this.game.HideOperationPanel();
        this.game.HideAutoOperationPanel();
        this.game.HideWaitBlindBtn();
        this.game.HideCancelTrustBtn();
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
    public SetWinnerCardsHight(publicCardInfos: PublicCardInfo[], _cards: number[]): void {
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
    /// 多少毫秒后关闭
    /// </summary>
    /// <param name="obj"></param>
    /// <param name="time"> 毫秒</param>
    public async WaitFewSeconds(obj: cc.Node, time: number) {
        await TimeHelper.Sleep(time);
        obj.active = false;
    }
    public RequestAgreeSecondPcsActive(IsAgree: boolean) {
        ProtocolAgency.Send<ClientMessageAgreeSecondPcsActive.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_AgreeSecondPcsActive,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body:
            {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                agree: IsAgree
            },
        });
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

        ProcedureManager.StartProcedure(ProcedureEnum.Lobby, { mode: 1, game_enter_type: GameCache.Instance.enter_param.game_enter_type });
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

        GameCache.Instance.origin_type = 0;
        GameCache.Instance.invitation_code = null;
        // GameCache.Instance.share_table = 0;
        // GameCache.Instance.limit_bring_in = 0

        //#endregion
    }


    //得到 当前 在场玩家     不包括自己
    public GetCurrentPlayers(): CPlayer[] {
        var tCurPlayers = [];
        let count = this.game.listSeat?.length || 0;
        if (count) {
            for (let i = 0; i < count; i++) {
                let seat = this.game.listSeat[i];
                if (seat.Player?.id > 0 && seat.Player.id != GameCache.Instance.nUserId) {
                    tCurPlayers.push(seat.Player);
                }
            }
        }
        return tCurPlayers;
    }
}
