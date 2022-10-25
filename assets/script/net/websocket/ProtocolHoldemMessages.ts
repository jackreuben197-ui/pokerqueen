import { json } from "stream/consumers";
import { Def, GPS, Room } from "../../protobuf/holdem/define_pb";
import { ServerMessageActionAll } from "../../protobuf/holdem/recv_action_all_pb";
import { ServerMessageError } from "../../protobuf/holdem/recv_error_pb";
import { ServerMessageHandClear } from "../../protobuf/holdem/recv_hand_clear_pb";
import { ServerMessageLeaveNotification } from "../../protobuf/holdem/recv_leave_notification_pb";
import { ServerMessagePostStatusChange } from "../../protobuf/holdem/recv_post_status_change_pb";
import { ServerMessagePublicCards } from "../../protobuf/holdem/recv_public_cards_pb";
import { ServerMessageSeatedOthers } from "../../protobuf/holdem/recv_seated_others_pb";
import { ServerMessageSidePots } from "../../protobuf/holdem/recv_side_pots_pb";
import { ServerMessageStandup } from "../../protobuf/holdem/recv_stand_up_pb";
import { ServerMessageStartInfo } from "../../protobuf/holdem/recv_start_info_pb";
import { ServerMessageWinner } from "../../protobuf/holdem/recv_winner_pb";
import { ClientMessageAction, ServerMessageAction } from "../../protobuf/holdem/req_action_pb";
import { ClientMessageBringIn, ServerMessageBringIn } from "../../protobuf/holdem/req_bring_in_pb";
import { ClientMessageEnterRoom, ServerMessageEnterRoom } from "../../protobuf/holdem/req_enter_room_pb";
import { ClientMessageHeartbeat, ServerMessageHeartbeat } from "../../protobuf/holdem/req_heartbeat_pb";
import { ClientMessageLeave, ServerMessageLeave } from "../../protobuf/holdem/req_leave_pb";
import { ClientMessageRegister, ServerMessageRegister } from "../../protobuf/holdem/req_register_pb";
import { ClientMessageRoomers, ServerMessageRoomers } from "../../protobuf/holdem/req_roomers_pb";
import { ClientMessageSeated, ServerMessageSeated } from "../../protobuf/holdem/req_seated_pb";
import { ClientMessageStandupActive, ServerMessageStandupActive } from "../../protobuf/holdem/req_stand_up_active_pb";
import { ClientMessagePublicReplay, ServerMessagePublicReplay } from "../../protobuf/holdem/req_replay_pb";
import { ClientMessageKeepSeatActive, ServerMessageKeepSeatActive } from "../../protobuf/holdem/req_keep_seat_active_pb";

import { ClientMessageAddTime, ServerMessageAddTime } from "../../protobuf/holdem/req_add_time_pb";

import { ProtocolCode } from "./ProtocolCode";
import { ClientMessageShowdown, ServerMessageShowdown } from "../../protobuf/holdem/req_showdown_pb";
import { ServerMessageAddTimeOthers } from "../../protobuf/holdem/recv_add_time_others_pb";
import { ServerMessageKeepSeat } from "../../protobuf/holdem/recv_keep_seat_pb";
import { ClientMessageShowPublicCards, ServerMessageShowPublicCards } from "../../protobuf/holdem/req_show_public_cards_pb";
import { ServerMessageShowPublicCardsOthers } from "../../protobuf/holdem/recv_show_public_cards_others_pb";
import { ClientMessageSetAutoOnTable, ServerMessageSetAutoOnTable } from "../../protobuf/holdem/req_set_auto_on_table_pb";
import { ClientMessageStoreChips, ServerMessageStoreChips } from "../../protobuf/holdem/req_store_chips_pb";
import { ServerMessageChipsChange } from "../../protobuf/holdem/recv_chips_change_pb";
import { ServerMessageInsuranceTrigged } from "../../protobuf/holdem/recv_insurance_trigged_pb";

export class ProtocolCommon {

    private _request_map = new Map();
    private _response_map = new Map();

    private _body: any = null;

    public static get Instance(): ProtocolCommon {
        return (<any>this).instance ??= new ProtocolCommon();
    }
    Response<Server extends { AsObject: null, toObject: Function }>(bytes: Uint8Array, c: any): Server["AsObject"] {
        let result: Server = c.deserializeBinary(bytes);
        return result.toObject();
    }
    Request<Client_AsObject>(code: number, body?: Client_AsObject, classDic?: any): Uint8Array {
        let c: any = ProtocolMap.GetCS(code).Client;
        let request: { serializeBinary: Function } = this._getRequest(c);
        this.setBody(request, body, classDic || { room: Room, gps: GPS });
        return request.serializeBinary();
    }
    _getRequest(c: any): { serializeBinary: Function } {
        let request = this._request_map.get(c);
        if (!request) {
            this._request_map.set(c, request = new c);
        }
        return request;
    }
    _setBody(obj, body, classDic?: any) {

        for (let key in body) {

            let value = body[key];

            let func = `set${key[0].toLocaleUpperCase()}${key.slice(1)}`;

            if (classDic && classDic[key]) {

                let childObj = new classDic[key]();

                obj[func](childObj);

                this._setBody(childObj, value, classDic);
            } else {
                obj[func](value);

            }
        }

    }
    setBody(request: any, body: any = null, cls?: any) {
        this._body = body;
        this._setBody(request, body, cls);
    }


}

export const ProtocolMap = {

    GetCS(code: number): { Server: any, Client?: any } {
        return ProtocolMap[code];
    },
    [ProtocolCode.Protocol_Holdem_Register]: {
        Client: ClientMessageRegister,
        Server: ServerMessageRegister,
    },
    [ProtocolCode.Protocol_Holdem_Heartbeat]: {
        Client: ClientMessageHeartbeat,
        Server: ServerMessageHeartbeat,
    },
    [ProtocolCode.Protocol_Holdem_Leave]: {
        Client: ClientMessageLeave,
        Server: ServerMessageLeave,
    },
    [ProtocolCode.Protocol_Holdem_EnterRoom]: {
        Client: ClientMessageEnterRoom,
        Server: ServerMessageEnterRoom,
    },
    [ProtocolCode.Protocol_Holdem_SeatedOthers]: {
        Server: ServerMessageSeatedOthers,
    },
    [ProtocolCode.Protocol_Holdem_Seated]: {
        Client: ClientMessageSeated,
        Server: ServerMessageSeated,
    },
    [ProtocolCode.Protocol_Holdem_BringIn]: {
        Client: ClientMessageBringIn,
        Server: ServerMessageBringIn,
    },
    [ProtocolCode.Protocol_Holdem_StandupActive]: {
        Client: ClientMessageStandupActive,
        Server: ServerMessageStandupActive,
    },
    [ProtocolCode.Protocol_Holdem_Standup]: {
        Server: ServerMessageStandup,
    },
    [ProtocolCode.Protocol_Holdem_PostStatusChange]: {
        Server: ServerMessagePostStatusChange,
    },
    [ProtocolCode.Protocol_Holdem_StartInfo]: {
        Server: ServerMessageStartInfo,
    },
    [ProtocolCode.Protocol_Holdem_Roomers]: {
        Client: ClientMessageRoomers,
        Server: ServerMessageRoomers,
    },
    [ProtocolCode.Protocol_Holdem_PublicReplay]: {
        Client: ClientMessagePublicReplay,
        Server: ServerMessagePublicReplay,
    },
    [ProtocolCode.Protocol_Holdem_Action]: {
        Client: ClientMessageAction,
        Server: ServerMessageAction,
    },
    [ProtocolCode.Protocol_Holdem_ActionAll]: {
        Server: ServerMessageActionAll,
    },
    [ProtocolCode.Protocol_Holdem_SidePots]: {
        Server: ServerMessageSidePots,
    },
    [ProtocolCode.Protocol_Holdem_PublicCards]: {
        Server: ServerMessagePublicCards,
    },
    [ProtocolCode.Protocol_Holdem_Winner]: {
        Server: ServerMessageWinner,
    },
    [ProtocolCode.Protocol_Holdem_LeaveNotification]: {
        Server: ServerMessageLeaveNotification,
    },
    [ProtocolCode.Protocol_Holdem_HandClear]: {
        Server: ServerMessageHandClear,
    },
    [ProtocolCode.Protocol_Holdem_Error]: {
        Server: ServerMessageError,
    },
    [ProtocolCode.Protocol_Holdem_AddTime]: {
        Client: ClientMessageAddTime,
        Server: ServerMessageAddTime,
    },
    [ProtocolCode.Protocol_Holdem_AddTimeOthers]: {
        Server: ServerMessageAddTimeOthers,
    },
    [ProtocolCode.Protocol_Holdem_Showdown]: {
        Client: ClientMessageShowdown,
        Server: ServerMessageShowdown,
    },
    [ProtocolCode.Protocol_Holdem_KeepSeat]: {
        Server: ServerMessageKeepSeat,
    },
    [ProtocolCode.Protocol_Holdem_KeepSeatActive]: {
        Client: ClientMessageKeepSeatActive,
        Server: ServerMessageKeepSeatActive,
    },
    [ProtocolCode.Protocol_Holdem_ShowPublicCards]: {
        Client: ClientMessageShowPublicCards,
        Server: ServerMessageShowPublicCards,
    },
    [ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers]: {
        Server: ServerMessageShowPublicCardsOthers,
    },
    [ProtocolCode.Protocol_Holdem_SetAutoOnTable]: {
        Client: ClientMessageSetAutoOnTable,
        Server: ServerMessageSetAutoOnTable,
    },
    [ProtocolCode.Protocol_Holdem_StoreChips]: {
        Client: ClientMessageStoreChips,
        Server: ServerMessageStoreChips,
    },
    [ProtocolCode.Protocol_Holdem_ChipsChange]: {
        Server: ServerMessageChipsChange,
    },
    [ProtocolCode.Protocol_Holdem_InsuranceTrigged]: {
        Server: ServerMessageInsuranceTrigged,
    },

}

