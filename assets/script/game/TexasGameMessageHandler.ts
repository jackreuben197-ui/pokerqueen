import { ProcedureEnum } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import Dispatcher from "../event/Dispatcher";
import { LanguageCode } from "../i18n/LanguageCode";
import GameCache from "../manager/GameCache";
import ProcedureManager from "../manager/ProcedureManager";
import SceneManager from "../manager/SceneManager";
import ToastManager from "../manager/ToastManager";
import UIManager from "../manager/UIManager";
import OpCodeHelper from "../net/websocket/OpCodeHelper";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { Protocol_Holdem_EnterRoom } from "../net/websocket/ProtocolHoldemMessages";
import { ServerErrorCode } from "../net/websocket/ServerErrorCode";
import { ServerMessageSeatedOthers } from "../protobuf/holdem/recv_seated_others_pb";
import { ServerMessageEnterRoom } from "../protobuf/holdem/req_enter_room_pb";
import { ServerMessageLeave } from "../protobuf/holdem/req_leave_pb";
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
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Seated, Protocol_Holdem_Seated_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AddOn, Protocol_Holdem_AddOn_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BringIn, Protocol_Holdem_BringIn_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Action, Protocol_Holdem_Action_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_SetAutoOnTable, Protocol_Holdem_SetAutoOnTable_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_StandupActive, Protocol_Holdem_StandupActive_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Standup, Protocol_Holdem_Standup_Handler);
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
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_StartInfo, Protocol_Holdem_StartInfo_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_PublicCards, Protocol_Holdem_PublicCards_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_SidePots, Protocol_Holdem_SidePots_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ChipsChange, Protocol_Holdem_ChipsChange_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ActionAll, Protocol_Holdem_ActionAll_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_KeepSeat, Protocol_Holdem_KeepSeat_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Winner, Protocol_Holdem_Winner_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AddTimeOthers, Protocol_Holdem_AddTimeOthers_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_InsuranceTrigged, Protocol_Holdem_InsuranceTrigged_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BuyInsurance, Protocol_Holdem_BuyInsurance_Handler);
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_PostStatusChange, Protocol_Holdem_PostStatusChange_Handler);
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
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Seated, Protocol_Holdem_Seated_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AddOn, Protocol_Holdem_AddOn_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BringIn, Protocol_Holdem_BringIn_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Action, Protocol_Holdem_Action_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_SetAutoOnTable, Protocol_Holdem_SetAutoOnTable_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_StandupActive, Protocol_Holdem_StandupActive_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Standup, Protocol_Holdem_Standup_Handler);
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
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_StartInfo, Protocol_Holdem_StartInfo_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_PublicCards, Protocol_Holdem_PublicCards_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_SidePots, Protocol_Holdem_SidePots_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ChipsChange, Protocol_Holdem_ChipsChange_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ActionAll, Protocol_Holdem_ActionAll_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_KeepSeat, Protocol_Holdem_KeepSeat_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Winner, Protocol_Holdem_Winner_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AddTimeOthers, Protocol_Holdem_AddTimeOthers_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_InsuranceTrigged, Protocol_Holdem_InsuranceTrigged_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BuyInsurance, Protocol_Holdem_BuyInsurance_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_PostStatusChange, Protocol_Holdem_PostStatusChange_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BringInOrStoreFail, Protocol_Holdem_BringInOrStoreFail_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_HandClear, Protocol_Holdem_HandClear_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_UpBlind, Protocol_Holdem_UpBlind_Handler);
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Error, Protocol_Holdem_Error_Handler);
    }

    /**
     * 进入房间消息返回
     * @param response 
     * @returns 
     */
    Protocol_Holdem_EnterRoom_Handler(response: ServerMessageEnterRoom.AsObject) {

        console.log(`# MSG_CALLBACK: Protocol_Holdem_EnterRoom_Handler`);

        if (response == null) return;

        // GameStatusRestoreHandler?.Invoke(responseData.Status);
        // GameStatusRestoreHandler = null;

        let isMtt: boolean = false;
        //this.game instanceof TexasGame;

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

}
