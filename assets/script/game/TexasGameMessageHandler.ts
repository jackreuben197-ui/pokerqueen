import { ProcedureEnum } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import Dispatcher from "../event/Dispatcher";
import { i18nMgr } from "../i18n/i18nMgr";
import { LanguageCode } from "../i18n/LanguageCode";
import ProcedureManager from "../manager/ProcedureManager";
import SceneManager from "../manager/SceneManager";
import ToastManager from "../manager/ToastManager";
import UIManager from "../manager/UIManager";
import OpCodeHelper from "../net/websocket/OpCodeHelper";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { Protocol_Holdem_EnterRoom, Protocol_Holdem_StandupActive } from "../net/websocket/ProtocolHoldemMessages";
import { ServerErrorCode } from "../net/websocket/ServerErrorCode";
import { ServerMessagePostStatusChange } from "../protobuf/holdem/recv_post_status_change_pb";
import { ServerMessageSeatedOthers } from "../protobuf/holdem/recv_seated_others_pb";
import { ServerMessageStandup } from "../protobuf/holdem/recv_stand_up_pb";
import { ServerMessageStartInfo } from "../protobuf/holdem/recv_start_info_pb";
import { ServerMessageEnterRoom } from "../protobuf/holdem/req_enter_room_pb";
import { ServerMessageLeave } from "../protobuf/holdem/req_leave_pb";
import { ServerMessageSeated } from "../protobuf/holdem/req_seated_pb";
import { ServerMessageStandupActive } from "../protobuf/holdem/req_stand_up_active_pb";
import {GameCache} from "./GameCache";
import Seat from "./Seat";
import { SeatStandupAnimation } from "./SeatStateHandler";
import TexasGame from "./TexasGame";
import { TexasGameState } from "./TexasGameState";

export default class TexasGameMessageHandler {

    constructor(public game: TexasGame) {
    }

    public RegisterMessageHandler() {
        cc.log("RegisterMessageHandler");
        Dispatcher.on(ProtocolCode.Protocol_Holdem_EnterRoom, this.Protocol_Holdem_EnterRoom_Handler, this);
        Dispatcher.on(ProtocolCode.Protocol_Holdem_Leave, this.Protocol_Holdem_Leave_Handler, this);

        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Leave, Protocol_Holdem_Leave_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_LeaveNotification, Protocol_Holdem_LeaveNotification_Handler);
        Dispatcher.on(ProtocolCode.Protocol_Holdem_Seated, this.Protocol_Holdem_Seated_Handler, this);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AddOn, Protocol_Holdem_AddOn_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BringIn, Protocol_Holdem_BringIn_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Action, Protocol_Holdem_Action_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_SetAutoOnTable, Protocol_Holdem_SetAutoOnTable_Handler);
        Dispatcher.on(ProtocolCode.Protocol_Holdem_StandupActive, this.Protocol_Holdem_StandupActive_Handler, this);
        Dispatcher.on(ProtocolCode.Protocol_Holdem_Standup, this.Protocol_Holdem_Standup_Handler, this);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_KeepSeatActive, Protocol_Holdem_KeepSeatActive_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Showdown, Protocol_Holdem_Showdown_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ShowPublicCards, Protocol_Holdem_ShowPublicCards_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AddTime, Protocol_Holdem_AddTime_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BuyInsuranceActive, Protocol_Holdem_BuyInsuranceActive_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AgreePost, Protocol_Holdem_AgreePost_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_StoreChips, Protocol_Holdem_StoreChips_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers, Protocol_Holdem_ShowPublicCardsOthers_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Showcards, Protocol_Holdem_Showcards_Handler);
        Dispatcher.on(ProtocolCode.Protocol_Holdem_SeatedOthers, this.Protocol_Holdem_SeatedOthers_Handler, this);
        Dispatcher.on(ProtocolCode.Protocol_Holdem_StartInfo, this.Protocol_Holdem_StartInfo_Handler, this);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_PublicCards, Protocol_Holdem_PublicCards_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_SidePots, Protocol_Holdem_SidePots_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ChipsChange, Protocol_Holdem_ChipsChange_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ActionAll, Protocol_Holdem_ActionAll_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_KeepSeat, Protocol_Holdem_KeepSeat_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Winner, Protocol_Holdem_Winner_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AddTimeOthers, Protocol_Holdem_AddTimeOthers_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_InsuranceTrigged, Protocol_Holdem_InsuranceTrigged_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BuyInsurance, Protocol_Holdem_BuyInsurance_Handler);
        Dispatcher.on(ProtocolCode.Protocol_Holdem_PostStatusChange, this.Protocol_Holdem_PostStatusChange_Handler, this);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BringInOrStoreFail, Protocol_Holdem_BringInOrStoreFail_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_HandClear, Protocol_Holdem_HandClear_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_UpBlind, Protocol_Holdem_UpBlind_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Error, Protocol_Holdem_Error_Handler);
    }

    public RemoveMessageHandler() {
        Dispatcher.off(ProtocolCode.Protocol_Holdem_EnterRoom, this.Protocol_Holdem_EnterRoom_Handler, this);
        Dispatcher.off(ProtocolCode.Protocol_Holdem_Leave, this.Protocol_Holdem_Leave_Handler, this);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Leave, Protocol_Holdem_Leave_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_LeaveNotification, Protocol_Holdem_LeaveNotification_Handler);
        Dispatcher.off(ProtocolCode.Protocol_Holdem_Seated, this.Protocol_Holdem_Seated_Handler, this);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AddOn, Protocol_Holdem_AddOn_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BringIn, Protocol_Holdem_BringIn_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Action, Protocol_Holdem_Action_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_SetAutoOnTable, Protocol_Holdem_SetAutoOnTable_Handler);
        Dispatcher.off(ProtocolCode.Protocol_Holdem_StandupActive, this.Protocol_Holdem_StandupActive_Handler, this);
        Dispatcher.off(ProtocolCode.Protocol_Holdem_Standup, this.Protocol_Holdem_Standup_Handler, this);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_KeepSeatActive, Protocol_Holdem_KeepSeatActive_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Showdown, Protocol_Holdem_Showdown_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ShowPublicCards, Protocol_Holdem_ShowPublicCards_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AddTime, Protocol_Holdem_AddTime_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BuyInsuranceActive, Protocol_Holdem_BuyInsuranceActive_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AgreePost, Protocol_Holdem_AgreePost_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_StoreChips, Protocol_Holdem_StoreChips_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers, Protocol_Holdem_ShowPublicCardsOthers_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Showcards, Protocol_Holdem_Showcards_Handler);
        Dispatcher.off(ProtocolCode.Protocol_Holdem_SeatedOthers, this.Protocol_Holdem_SeatedOthers_Handler, this);
        Dispatcher.off(ProtocolCode.Protocol_Holdem_StartInfo, this.Protocol_Holdem_StartInfo_Handler, this);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_PublicCards, Protocol_Holdem_PublicCards_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_SidePots, Protocol_Holdem_SidePots_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ChipsChange, Protocol_Holdem_ChipsChange_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ActionAll, Protocol_Holdem_ActionAll_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_KeepSeat, Protocol_Holdem_KeepSeat_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Winner, Protocol_Holdem_Winner_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AddTimeOthers, Protocol_Holdem_AddTimeOthers_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_InsuranceTrigged, Protocol_Holdem_InsuranceTrigged_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BuyInsurance, Protocol_Holdem_BuyInsurance_Handler);
        Dispatcher.off(ProtocolCode.Protocol_Holdem_PostStatusChange, this.Protocol_Holdem_PostStatusChange_Handler, this);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BringInOrStoreFail, Protocol_Holdem_BringInOrStoreFail_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_HandClear, Protocol_Holdem_HandClear_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_UpBlind, Protocol_Holdem_UpBlind_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Error, Protocol_Holdem_Error_Handler);
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

        console.log("response:",response);

        if (response.status == 0) {

            if (isMtt) {
                // 缓存房间id
                GameCache.Instance.room_id = response.mttRoom.roomId;

                console.log(`Protocol_Holdem_EnterRoom_Handler: cache mtt room id: ${GameCache.Instance.room_id}`);
            }

            if (ProcedureManager.currProcedure.id == ProcedureEnum.Texas) {

                let fromUI = ProcedureManager.currProcedure.param?.fromUI;

                if (fromUI) UIManager.close(fromUI);

            }

            SceneManager.ins.switchScene(UIDefine.TexasScene, null, ProcedureManager.currProcedure.param);

            this.game.SMAgency.ChangeGameState(TexasGameState.Init, response);

        }
        else if (response.status == ServerErrorCode.Gameplay_AutoSeatReturnToInvalidGame && isMtt) {
            console.log(`Protocol_Holdem_EnterRoom_Handler: response.state : ServerErrorCode.Gameplay_AutoSeatReturnToInvalidGame`);
            // 进入ExchangeRoom状态，等待换房
            this.game.SMAgency.ChangeGameState(TexasGameState.ExchangeRoom, null);
        }
        else {
            ToastManager.ins.createToast(LanguageCode.ServerErrorDescription(response.status));
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

            ProcedureManager.StartProcedure(ProcedureEnum.Lobby, { leaveRoom: true });
        } else {
            cc.warn(LanguageCode.ServerErrorDescription(response.status));
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
                ToastManager.ins.createToast(i18nMgr.Get("Over_folded"));
            }
        }
        else {
            ToastManager.ins.createToast(LanguageCode.ServerErrorDescription(response.status));
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
            this.game.utils.doStandUp(localSeatID);
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
}
