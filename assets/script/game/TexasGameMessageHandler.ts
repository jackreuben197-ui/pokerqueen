
import { ProcedureEnum } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import CPMessageDispatherComponent from "../event/CPMessageDispatherComponent";
import { CPErrorCode } from "../i18n/CPErrorCode";
import { i18nMgr } from "../i18n/i18nMgr";
import Main from "../Main";
import ProcedureManager from "../manager/ProcedureManager";
import SceneManager from "../manager/SceneManager";
import ToastManager from "../manager/ToastManager";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { ServerErrorCode } from "../net/websocket/ServerErrorCode";
import { Def } from "../protobuf/holdem/define_pb";
import { ServerMessageError } from "../protobuf/holdem/recv_error_pb";
import { ServerMessageLeaveNotification } from "../protobuf/holdem/recv_leave_notification_pb";
import { ServerMessagePostStatusChange } from "../protobuf/holdem/recv_post_status_change_pb";
import { ServerMessagePublicCards } from "../protobuf/holdem/recv_public_cards_pb";
import { ServerMessageSeatedOthers } from "../protobuf/holdem/recv_seated_others_pb";
import { ServerMessageStandup } from "../protobuf/holdem/recv_stand_up_pb";
import { ServerMessageStartInfo } from "../protobuf/holdem/recv_start_info_pb";
import { ServerMessageWinner } from "../protobuf/holdem/recv_winner_pb";
import { ServerMessageEnterRoom } from "../protobuf/holdem/req_enter_room_pb";
import { ServerMessageLeave } from "../protobuf/holdem/req_leave_pb";
import { ServerMessageSeated } from "../protobuf/holdem/req_seated_pb";
import { ServerMessageStandupActive } from "../protobuf/holdem/req_stand_up_active_pb";
import GlobalSession from "../session/GlobalSession";
import UIComponent from "../ui/UIComponent";
import { GameCache } from "./GameCache";
import { RoomType } from "./GameUtil";
import Seat from "./Seat";
import { SeatStandupAnimation } from "./SeatStateHandler";
import TexasGame from "./texas/TexasGame";
import { TexasGameState } from "./TexasGameState";

export default class TexasGameMessageHandler {

    constructor(public game: TexasGame) {
    }

    public RegisterMessageHandler() {
        cc.log("RegisterMessageHandler");
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_EnterRoom, this.Protocol_Holdem_EnterRoom_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Leave, this.Protocol_Holdem_Leave_Handler, this);

        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_LeaveNotification, this.Protocol_Holdem_LeaveNotification_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Seated, this.Protocol_Holdem_Seated_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AddOn, this.Protocol_Holdem_AddOn_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BringIn, this.Protocol_Holdem_BringIn_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Action, this.Protocol_Holdem_Action_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_SetAutoOnTable, this.Protocol_Holdem_SetAutoOnTable_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_StandupActive, this.Protocol_Holdem_StandupActive_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Standup, this.Protocol_Holdem_Standup_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_KeepSeatActive, this.Protocol_Holdem_KeepSeatActive_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Showdown, this.Protocol_Holdem_Showdown_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ShowPublicCards, this.Protocol_Holdem_ShowPublicCards_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AddTime, this.Protocol_Holdem_AddTime_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BuyInsuranceActive, this.Protocol_Holdem_BuyInsuranceActive_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AgreePost, this.Protocol_Holdem_AgreePost_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_StoreChips, this.Protocol_Holdem_StoreChips_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers, this.Protocol_Holdem_ShowPublicCardsOthers_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Showcards, this.Protocol_Holdem_Showcards_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_SeatedOthers, this.Protocol_Holdem_SeatedOthers_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_StartInfo, this.Protocol_Holdem_StartInfo_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_PublicCards, this.Protocol_Holdem_PublicCards_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_SidePots, this.Protocol_Holdem_SidePots_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ChipsChange, this.Protocol_Holdem_ChipsChange_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ActionAll, this.Protocol_Holdem_ActionAll_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_KeepSeat, this.Protocol_Holdem_KeepSeat_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Winner, this.Protocol_Holdem_Winner_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AddTimeOthers, this.Protocol_Holdem_AddTimeOthers_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_InsuranceTrigged, this.Protocol_Holdem_InsuranceTrigged_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BuyInsurance, this.Protocol_Holdem_BuyInsurance_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_PostStatusChange, this.Protocol_Holdem_PostStatusChange_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BringInOrStoreFail, this.Protocol_Holdem_BringInOrStoreFail_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_HandClear, this.Protocol_Holdem_HandClear_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_UpBlind, this.Protocol_Holdem_UpBlind_Handler, this);
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Error, this.Protocol_Holdem_Error_Handler, this);
    }


    public RemoveMessageHandler() {
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_EnterRoom, this.Protocol_Holdem_EnterRoom_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Leave, this.Protocol_Holdem_Leave_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_LeaveNotification, this.Protocol_Holdem_LeaveNotification_Handler);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Seated, this.Protocol_Holdem_Seated_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AddOn, this.Protocol_Holdem_AddOn_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BringIn, this.Protocol_Holdem_BringIn_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Action, this.Protocol_Holdem_Action_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_SetAutoOnTable, this.Protocol_Holdem_SetAutoOnTable_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_StandupActive, this.Protocol_Holdem_StandupActive_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Standup, this.Protocol_Holdem_Standup_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_KeepSeatActive, this.Protocol_Holdem_KeepSeatActive_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Showdown, this.Protocol_Holdem_Showdown_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ShowPublicCards, this.Protocol_Holdem_ShowPublicCards_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AddTime, this.Protocol_Holdem_AddTime_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BuyInsuranceActive, this.Protocol_Holdem_BuyInsuranceActive_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AgreePost, this.Protocol_Holdem_AgreePost_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_StoreChips, this.Protocol_Holdem_StoreChips_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers, this.Protocol_Holdem_ShowPublicCardsOthers_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Showcards, this.Protocol_Holdem_Showcards_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_SeatedOthers, this.Protocol_Holdem_SeatedOthers_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_StartInfo, this.Protocol_Holdem_StartInfo_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_PublicCards, this.Protocol_Holdem_PublicCards_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_SidePots, this.Protocol_Holdem_SidePots_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ChipsChange, this.Protocol_Holdem_ChipsChange_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ActionAll, this.Protocol_Holdem_ActionAll_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_KeepSeat, this.Protocol_Holdem_KeepSeat_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Winner, this.Protocol_Holdem_Winner_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AddTimeOthers, this.Protocol_Holdem_AddTimeOthers_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_InsuranceTrigged, this.Protocol_Holdem_InsuranceTrigged_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BuyInsurance, this.Protocol_Holdem_BuyInsurance_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_PostStatusChange, this.Protocol_Holdem_PostStatusChange_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BringInOrStoreFail, this.Protocol_Holdem_BringInOrStoreFail_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_HandClear, this.Protocol_Holdem_HandClear_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_UpBlind, this.Protocol_Holdem_UpBlind_Handler, this);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Error, this.Protocol_Holdem_Error_Handler, this);
    }

    /// <summary>
    /// 进入房间 消息回调
    /// </summary>
    /// <param name="response"></param>
    Protocol_Holdem_EnterRoom_Handler(response: ServerMessageEnterRoom.AsObject) {

        console.log(`# MSG_CALLBACK: Protocol_Holdem_EnterRoom_Handler`);

        if (response == null) return;

        // GameStatusRestoreHandler?.Invoke(responseData.Status);
        // GameStatusRestoreHandler = null;

        let isMtt: boolean = false;
        //this.game instanceof TexasGame;

        console.log("response:", response);

        if (response.status == 0) {

            if (isMtt) {
                // 缓存房间id
                GameCache.Instance.room_id = response.mttRoom.roomId;

                console.log(`Protocol_Holdem_EnterRoom_Handler: cache mtt room id: ${GameCache.Instance.room_id}`);
            }

            if (ProcedureManager.currProcedure.id == ProcedureEnum.Texas) {

                let fromUI = ProcedureManager.currProcedure.param?.fromUI;

                if (fromUI) UIComponent.close(fromUI);

            }

            SceneManager.Instance.switchScene(UIDefine.UITexas, null, ProcedureManager.currProcedure.param);

            this.game.SMAgency.ChangeGameState(TexasGameState.Init, response);

        }
        else if (response.status == ServerErrorCode.Gameplay_AutoSeatReturnToInvalidGame && isMtt) {
            console.log(`Protocol_Holdem_EnterRoom_Handler: response.state : ServerErrorCode.Gameplay_AutoSeatReturnToInvalidGame`);
            // 进入ExchangeRoom状态，等待换房
            this.game.SMAgency.ChangeGameState(TexasGameState.ExchangeRoom, null);
        }
        else {
            ToastManager.Instance.createToast(CPErrorCode.ServerErrorDescription(response.status));
            // 进入房间失败
            this.game.SMAgency.ChangeGameState(TexasGameState.Exit, response);
        }

    }
    /**
     * 离开房间消息返回
     * @param response 
     */
    Protocol_Holdem_Leave_Handler(response: ServerMessageLeave.AsObject) {

        console.log(`# MSG_CALLBACK: Protocol_Holdem_Leave_Handler`);

        if (response == null) return;

        if (response.status == 0) {
            //ProcedureManager.StartProcedure(ProcedureEnum.Lobby, { leaveRoom: true });
            this.game.TexasGameUtils.ExitRoom();
        } else {
            cc.warn(CPErrorCode.ServerErrorDescription(response.status));
        }

    }

    /**
     * 其他玩家坐下
     * @param response 
     */
    Protocol_Holdem_SeatedOthers_Handler(response: ServerMessageSeatedOthers.AsObject) {
        console.log(`# MSG_CALLBACK: Protocol_Holdem_SeatedOthers_Handler`);

    }
    /// <summary>
    /// 主动坐下(非MTT使用) 消息回调
    /// </summary>
    /// <param name="response"></param>
    Protocol_Holdem_Seated_Handler(response: ServerMessageSeated.AsObject) {

        console.log(`# MSG_CALLBACK: Protocol_Holdem_Seated_Handler`);

    }

    /// <summary>
    /// 用户主动站起（非MTT）消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_StandupActive_Handler(response: ServerMessageStandupActive.AsObject): void {
        console.log(`# MSG_CALLBACK: Protocol_Holdem_StandupActive_Handler`);
        if (response == null) {
            return;
        }
        if (response.status == 0) {
            if (this.game.mainPlayer != null && this.game.mainPlayer.isPlaying) {
                ToastManager.Instance.createToast(i18nMgr.Get("Over_folded"));
            }
        }
        else {
            ToastManager.Instance.createToast(CPErrorCode.ServerErrorDescription(response.status));
        }
    }

    /// <summary>
    /// 接收用户站起信息,PlayerID=自己代表自己被强制站起了,reason给出原因 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_Standup_Handler(response: ServerMessageStandup.AsObject): void {
        console.log(`# MSG_CALLBACK: Protocol_Holdem_Standup_Handler`);

        if (response == null) {
            return;
        }

        let localSeatID: number = this.game.GetLocalSeatID(response.seatId);
        let seat: Seat = this.game.GetSeatByLocalSeatID(localSeatID);
        if (seat == null || seat.Player == null) {
            return;
        }

        let isMainPlayer: boolean = seat.Player.userID == this.game.mainPlayer.userID;
        if (isMainPlayer) {
            this.game.mainPlayer.cacheStoreChips = response.storeChips;
            // HideOperationPanel();
            // HideAutoOperationPanel();
            // HideSeeMorePublic();
            this.game.TexasGameUtils.doStandUp(localSeatID);
        }
        else {
            //     UI uiTexasPlayerInfo = UIComponent.Instance.Get(UIType.UITexasPlayerInfo);
            // if (uiTexasPlayerInfo != null && uiTexasPlayerInfo.GameObject.activeInHierarchy) {
            //         UITexasPlayerInfoComponent uiComponent = uiTexasPlayerInfo.GetComponent<UITexasPlayerInfoComponent>();
            //     uiComponent.PlayerStandUp((int)seat.Player.userID);
            // }
            //seat.HideFold();
            seat.FsmLogicComponent.SM.ChangeState(SeatStandupAnimation.Instance);
        }
    }

    /// <summary>
    /// 补盲状态变化 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_PostStatusChange_Handler(response: ServerMessagePostStatusChange.AsObject): void {
        console.log(`# MSG_CALLBACK: Protocol_Holdem_PostStatusChange_Handler`);
    }

    /// <summary>
    /// 开始一手 消息回调
    /// </summary>
    /// <param name="response"></param>
    public Protocol_Holdem_StartInfo_Handler(response: ServerMessageStartInfo.AsObject): void {
        console.log(`# MSG_CALLBACK: Protocol_Holdem_StartInfo_Handler`);
        if (response == null) {
            return;
        }
        this.game.SMAgency.ChangeGameState(TexasGameState.HandStarted, response);
    }


    /// <summary>
    /// 通知本人离开房间 消息回调
    /// </summary>
    /// <param name="response"></param>
    public Protocol_Holdem_LeaveNotification_Handler(response: ServerMessageLeaveNotification.AsObject): void {
        console.log(`# MSG_CALLBACK: Protocol_Holdem_LeaveNotification_Handler`);

        if (response == null) {
            return;
        }

        switch (response.reason) {
            case Def.LeaveReason.LR_ACTIVE: // 主动退出
                {
                    // 主动退出已由别处处处理
                }
                break;
            case Def.LeaveReason.LR_AUTO_EXCEED_MAX_TIMES: // 超过最大自动操作次数限制
                {
                    this.game.SMAgency.ChangeGameState(TexasGameState.Exit, response);
                }
                break;
            case Def.LeaveReason.LR_GAME_END: // 游戏结束
                {
                    if (GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit) {
                        // UIComponent.Instance.ShowNoAnimation(UIType.UITexasGameEnd, new UITexasGameEndComponent.RecordDetailForNormalData()
                        //     {
                        //         roomID = GameCache.Instance.room_id.ToString(),
                        //         blind = (int)GameCache.Instance.CurGame.smallBlind,
                        //         roomName = GameCache.Instance.roomName,
                        //         game_type = GameCache.Instance.game_type,
                        //         bet_type = GameCache.Instance.bet_type,
                        //         poker_type = GameCache.Instance.poker_type,
                        //     });
                        UIComponent.open(UIDefine.UITexasGameEndComponent, {
                            roomID: GameCache.Instance.room_id.toString(),
                            blind: GameCache.Instance.CurGame.smallBlind,
                            roomName: GameCache.Instance.roomName,
                            game_type: GameCache.Instance.game_type,
                            bet_type: GameCache.Instance.bet_type,
                            poker_type: GameCache.Instance.poker_type,
                        }, Main.Dialog
                        )
                    }
                    this.game.SMAgency.ChangeGameState(TexasGameState.Exit, response);
                }
                break;
            case Def.LeaveReason.LR_FORCE: // 强制退出
                {
                    this.game.SMAgency.ChangeGameState(TexasGameState.Exit, response);
                }
                break;
            case Def.LeaveReason.LR_OFFLINE: // 离线
                {
                    this.game.SMAgency.ChangeGameState(TexasGameState.Exit, response);
                }
                break;
            default:
                {
                    this.game.SMAgency.ChangeGameState(TexasGameState.Exit, response);
                }
                break;
        }
        UIComponent.Instance.Toast(i18nMgr.Get(`LeaveReason${response.reason}`));
    }




    public Protocol_Holdem_AddOn_Handler(): void {

    }
    public Protocol_Holdem_BringIn_Handler(): void {

    }
    // Protocol_Holdem_Error_Handler(Protocol_Holdem_Error: ProtocolCode, Protocol_Holdem_Error_Handler: any, arg2: this) {
    //     throw new Error("Method not implemented.");
    // }
    Protocol_Holdem_UpBlind_Handler(Protocol_Holdem_UpBlind: ProtocolCode, Protocol_Holdem_UpBlind_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_HandClear_Handler(Protocol_Holdem_HandClear: ProtocolCode, Protocol_Holdem_HandClear_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_BringInOrStoreFail_Handler(Protocol_Holdem_BringInOrStoreFail: ProtocolCode, Protocol_Holdem_BringInOrStoreFail_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_BuyInsurance_Handler(Protocol_Holdem_BuyInsurance: ProtocolCode, Protocol_Holdem_BuyInsurance_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_InsuranceTrigged_Handler(Protocol_Holdem_InsuranceTrigged: ProtocolCode, Protocol_Holdem_InsuranceTrigged_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_AddTimeOthers_Handler(Protocol_Holdem_AddTimeOthers: ProtocolCode, Protocol_Holdem_AddTimeOthers_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }

    /// <summary>
    /// 结果通知 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_Winner_Handler(response: ServerMessageWinner.AsObject): void {
        cc.log(`# MSG_CALLBACK: Protocol_Holdem_Winner_Handler`);

        if (response == null) {
            return;
        }
        this.game.SMAgency.ChangeGameState(TexasGameState.HandShowdown, response);
    }
    Protocol_Holdem_KeepSeat_Handler(Protocol_Holdem_KeepSeat: ProtocolCode, Protocol_Holdem_KeepSeat_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    /// <summary>
    /// 所有人收到主动/自动行为（包括自己） 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_ActionAll_Handler(response): void {
        cc.log(`# MSG_CALLBACK: Protocol_Holdem_ActionAll_Handler`);
    }
    Protocol_Holdem_ChipsChange_Handler(Protocol_Holdem_ChipsChange: ProtocolCode, Protocol_Holdem_ChipsChange_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }

    /// <summary>
    /// 边池信息 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_SidePots_Handler(response): void {
        cc.log(`# MSG_CALLBACK: Protocol_Holdem_SidePots_Handler`);
    }

    /// <summary>
    /// 所有人收到公共牌 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_PublicCards_Handler(response: ServerMessagePublicCards.AsObject): void {
        cc.log(`# MSG_CALLBACK: Protocol_Holdem_PublicCards_Handler`);
        if (response == null) {
            return;
        }
        let nextState: TexasGameState = TexasGameState.None;

        switch (response.rnd) {
            case Def.Round.FLOP:
                {
                    nextState = TexasGameState.HandFlop;
                }
                break;
            case Def.Round.TURN:
                {
                    nextState = TexasGameState.HandTurn;
                }
                break;
            case Def.Round.RIVER:
                {
                    nextState = TexasGameState.HandRiver;
                }
                break;
        }

        this.game.SMAgency.ChangeGameState(nextState, response);
    }


    Protocol_Holdem_Showcards_Handler(Protocol_Holdem_Showcards: ProtocolCode, Protocol_Holdem_Showcards_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_ShowPublicCardsOthers_Handler(Protocol_Holdem_ShowPublicCardsOthers: ProtocolCode, Protocol_Holdem_ShowPublicCardsOthers_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_StoreChips_Handler(Protocol_Holdem_StoreChips: ProtocolCode, Protocol_Holdem_StoreChips_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_AgreePost_Handler(Protocol_Holdem_AgreePost: ProtocolCode, Protocol_Holdem_AgreePost_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_BuyInsuranceActive_Handler(Protocol_Holdem_BuyInsuranceActive: ProtocolCode, Protocol_Holdem_BuyInsuranceActive_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_AddTime_Handler(Protocol_Holdem_AddTime: ProtocolCode, Protocol_Holdem_AddTime_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_ShowPublicCards_Handler(Protocol_Holdem_ShowPublicCards: ProtocolCode, Protocol_Holdem_ShowPublicCards_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_Showdown_Handler(Protocol_Holdem_Showdown: ProtocolCode, Protocol_Holdem_Showdown_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_KeepSeatActive_Handler(Protocol_Holdem_KeepSeatActive: ProtocolCode, Protocol_Holdem_KeepSeatActive_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_SetAutoOnTable_Handler(Protocol_Holdem_SetAutoOnTable: ProtocolCode, Protocol_Holdem_SetAutoOnTable_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_Action_Handler(response) {
        cc.log(`# MSG_CALLBACK: Protocol_Holdem_Action_Handler`);
    }


    /// <summary>
    /// 异常错误 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_Error_Handler(response: ServerMessageError.AsObject): void {
        cc.log(`# MSG_CALLBACK: Protocol_Holdem_Error_Handler`);
        if (response == null) {
            return;
        }
        //CPLoginSessionComponent.Instance.Logout();
        UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(response.status));
        GlobalSession.Logout();
    }
}
