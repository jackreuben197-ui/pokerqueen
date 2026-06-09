import { ProcedureEnum } from '../../define/EIDefine';
import { UIDefine } from '../../define/UIDefine';
import GC from '../../frame/GameControl';
import { StringHelper } from '../../helper/StringHelper';
import TimeHelper from '../../helper/TimeHelper';
import H5MsgMgr from '../../H5MsgMgr';
import ProcedureManager from '../../manager/ProcedureManager';
import ProtocolAgency from '../../net/websocket/ProtocolAgency';
import { ProtocolCode } from '../../net/websocket/ProtocolCode';
import WebSocketClient from '../../net/websocket/WebSocketClient';
import { UIMTTModel } from '../../new_mtt/UIMTTModel';
import { ActionLimit, Def } from '../../protobuf/holdem/define_pb';
import { ClientMessageAgreeSecondPcsActive } from '../../protobuf/holdem/req_th_agree_second_pcs_active_pb';
import { ClientMessageEnterRoom } from '../../protobuf/holdem/req_th_enter_room_pb';
import { ClientMessageLeave } from '../../protobuf/holdem/req_th_leave_pb';
import type { ProcedureReturnNavigateParam } from '../../procedure/ProcedureReturn';
import UIComponent, { PrefabUI } from '../../ui/UIComponent';
import { CardType } from '../CardTypeUtil';
import { CPlayer } from '../CPlayer';
import { GameCache } from '../GameCache';
import Seat from '../seat/Seat';
import { SeatStandupAnimation } from '../SeatStateHandler';
import TexasGame from '../texas/TexasGame';
import { PublicCardInfo } from '../UITexas';
import { RoomType } from './GameUtil';

export default class TexasGameUtils {

    constructor(private game: TexasGame) {}

    /**
     * 请求进入房间
     * ProtocolAgency.Send 已统一处理 H5 桥接 / 直连路由，业务层无需关心
     */
    public EnterRoom() {
        console.log(`TexasGameUtils, EnterRoom() room_id=${GameCache.Instance.room_id}, match_id=${GameCache.Instance.match_id}`);
        let roomType = GameCache.Instance.room_type;
        let roomId = GameCache.Instance.room_id;
        let matchId = GameCache.Instance.match_id;
        let mttPartialBringIn = 0;
        let observer = false;
        if (roomType >= RoomType.MTTTexasHoldemStandardNoLimit) {
            //MTT
            // GameCache.Instance.match_id = UIMTTModel.Instance.MttInfo.mtt.match_id;
            // GameCache.Instance.seat_count = UIMTTModel.Instance.MttInfo.mtt.seat_count;
            // GameCache.Instance.mtt_Hunter_game = UIMTTModel.Instance.MttInfo.mtt.hunter_on > 0;
            // GameCache.Instance.roomName = GC.data.languageTemp.temp.getName(UIMTTModel.Instance.MttInfo.mtt.name);
            matchId = GameCache.Instance.match_id;
            roomId = GameCache.Instance.room_id;
            mttPartialBringIn = 0;
            observer = GameCache.Instance.CurGame.IsLookOn;
        }
        const body = {
            room: { roomId: roomId, matchId: matchId },
            gps: { longitude: GameCache.Instance.longitude, latitude: GameCache.Instance.latitude },
            mttPartialBringIn: mttPartialBringIn,
            observer: observer,
            wantSeat: 0
        };
        ProtocolAgency.Send<ClientMessageEnterRoom.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_EnterRoom,
            RoomID: roomId,
            MatchID: matchId,
            Body: body as any
        });
        console.log(`EnterRoom: room_id=${roomId}, match_id=${matchId}`);
    }

    /**
     * 离开房间
     */
    public LeaveRoom() {
        if (GameCache.Instance.match_id > 0) {
            this.ExitRoom(); // 直接离开 不做处理
            return;
        }
        if (H5MsgMgr.Instance.handshakeDone || WebSocketClient.CheckOpen(true)) {
            GameCache.Instance.isActiveLeaving = true;
            ProtocolAgency.Send<ClientMessageLeave.AsObject>({
                Code: ProtocolCode.Protocol_Holdem_Leave,
                RoomID: GameCache.Instance.room_id,
                MatchID: GameCache.Instance.match_id,
                Body: {
                    room: {
                        roomId: GameCache.Instance.room_id,
                        matchId: GameCache.Instance.match_id
                    }
                }
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
        UIComponent.close(UIDefine.UIPlayerInfo);
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
                } else {
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
            } else {
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
        });
        return null;
    }

    // public AddTimeCost(): number {
    //     return 10 * Math.pow(2, this.game.delayCount + 1) * 10;
    // }
    public GetOpDelayConsumeType(): Def.ConsumeTypeMap[keyof Def.ConsumeTypeMap] {
        return this.game.delayCount == 0 ? Def.ConsumeType.CT_DELAY_2 : Def.ConsumeType.CT_DELAY_3;
    }

    /// <summary>
    /// 当有第二套牌时设置高亮手牌和公共牌
    /// </summary>
    /// <param name="publicCardInfos"></param>
    public SetWinnerCardsHight(publicCardInfos: PublicCardInfo[], _cards: number[]): void {
        let highlightCards_ref = { highlightCards: [] as number[] };
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
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                agree: IsAgree
            }
        });
    }

    /// <summary>
    /// 退出房间
    /// </summary>
    public ExitRoom(returnParam?: ProcedureReturnNavigateParam): void {
        // UIComponent.Instance.Remove(UIType.UITexas);
        // UIComponent.Instance.Remove(UIType.UIInsurance);
        // UIComponent.Instance.Remove(UIType.UITexasHistory);
        // UIComponent.Instance.Remove(UIType.UITexasDanMuAndExpression);
        // UIComponent.Instance.Remove(UIType.UITexasReport);
        // UIComponent.Instance.Remove(UIType.UITexasRule);
        // UIComponent.Instance.Remove(UIType.UITexasSetting);
        // UIComponent.Instance.Remove(UIType.UITexasReportMTT);
        // UIComponent.Instance.Remove(UIType.UITexasHumanVerification);
        // UIComponent.Instance.Remove(UIType.UITexasHumanVote);
        // UIComponent.Instance.Remove(UIType.UITexasHumanYZ);
        // UIComponent.Instance.Remove(UIType.UIAgreeSecondPcs);
        //ProcedureManager.StartProcedure(ProcedureEnum.Lobby, { mode: 1, game_enter_type: GameCache.Instance.enter_param.game_enter_type });
        //#region 关键属性最后置空
        GameCache.Instance._currentRoomID = 0;
        GameCache.Instance.room_id = 0;
        GameCache.Instance.match_id = 0;
        GameCache.Instance.room_type = 0;
        GameCache.Instance.voiceprint_verify_on = 0;
        GameCache.Instance.voiceprint_verify_duration = 0;
        GameCache.Instance.game_type = 0;
        GameCache.Instance.poker_type = 0;
        GameCache.Instance.bet_type = 0;
        GameCache.Instance.origin_type = 0;
        // 清理视频验证状态，防止退出房间后残留到其他房间
        GameCache.Instance._randomVideoActive = false;
        GameCache.Instance._randomVideoEndTime = 0;
        GameCache.Instance._sequenceVideoActive = false;
        GameCache.Instance.FriendsTableCode = null;
        GameCache.Instance.share_table = 0;
        // GameCache.Instance.share_table = 0;
        // GameCache.Instance.limit_bring_in = 0
        GameCache.Instance.isActiveLeaving = false;
        //#endregion
        // 通知 H5 层恢复显示
        ProcedureManager.StartProcedure(ProcedureEnum.Return, returnParam);
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
