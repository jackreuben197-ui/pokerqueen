import { ProcedureEnum } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import CPMessageDispatherComponent from "../event/CPMessageDispatherComponent";
import { i18nMgr } from "../i18n/i18nMgr";
import { LanguageCode } from "../i18n/LanguageCode";
import ProcedureManager from "../manager/ProcedureManager";
import SceneManager from "../manager/SceneManager";
import ToastManager from "../manager/ToastManager";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { ServerErrorCode } from "../net/websocket/ServerErrorCode";
import { ServerMessagePostStatusChange } from "../protobuf/holdem/recv_post_status_change_pb";
import { ServerMessageSeatedOthers } from "../protobuf/holdem/recv_seated_others_pb";
import { ServerMessageStandup } from "../protobuf/holdem/recv_stand_up_pb";
import { ServerMessageStartInfo } from "../protobuf/holdem/recv_start_info_pb";
import { ServerMessageEnterRoom } from "../protobuf/holdem/req_enter_room_pb";
import { ServerMessageLeave } from "../protobuf/holdem/req_leave_pb";
import { ServerMessageSeated } from "../protobuf/holdem/req_seated_pb";
import { ServerMessageStandupActive } from "../protobuf/holdem/req_stand_up_active_pb";
import UIComponent from "../ui/UIComponent";
import { GameCache } from "./GameCache";
import Seat from "./Seat";
import { SeatStandupAnimation } from "./SeatStateHandler";
import TexasGame from "./TexasGame";
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

            SceneManager.Instance.switchScene(UIDefine.TexasScene, null, ProcedureManager.currProcedure.param);

            this.game.SMAgency.ChangeGameState(TexasGameState.Init, response);

        }
        else if (response.status == ServerErrorCode.Gameplay_AutoSeatReturnToInvalidGame && isMtt) {
            console.log(`Protocol_Holdem_EnterRoom_Handler: response.state : ServerErrorCode.Gameplay_AutoSeatReturnToInvalidGame`);
            // 进入ExchangeRoom状态，等待换房
            this.game.SMAgency.ChangeGameState(TexasGameState.ExchangeRoom, null);
        }
        else {
            ToastManager.Instance.createToast(LanguageCode.ServerErrorDescription(response.status));
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
                ToastManager.Instance.createToast(i18nMgr.Get("Over_folded"));
            }
        }
        else {
            ToastManager.Instance.createToast(LanguageCode.ServerErrorDescription(response.status));
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

    public Protocol_Holdem_LeaveNotification_Handler(): void {

    }
    public Protocol_Holdem_AddOn_Handler(): void {

    }
    public Protocol_Holdem_BringIn_Handler(): void {

    }
    Protocol_Holdem_Error_Handler(Protocol_Holdem_Error: ProtocolCode, Protocol_Holdem_Error_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
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
    Protocol_Holdem_Winner_Handler(Protocol_Holdem_Winner: ProtocolCode, Protocol_Holdem_Winner_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
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
    Protocol_Holdem_PublicCards_Handler(Protocol_Holdem_PublicCards: ProtocolCode, Protocol_Holdem_PublicCards_Handler: any, arg2: this) {
        throw new Error("Method not implemented.");
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
}
