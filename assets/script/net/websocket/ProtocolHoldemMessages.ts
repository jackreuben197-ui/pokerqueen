import { json } from "stream/consumers";
import { Def, GPS, Room } from "../../protobuf/holdem/define_pb";
import { ServerMessageActionAll } from "../../protobuf/holdem/recv_action_all_pb";
import { ServerMessagePostStatusChange } from "../../protobuf/holdem/recv_post_status_change_pb";
import { ServerMessagePublicCards } from "../../protobuf/holdem/recv_public_cards_pb";
import { ServerMessageSeatedOthers } from "../../protobuf/holdem/recv_seated_others_pb";
import { ServerMessageSidePots } from "../../protobuf/holdem/recv_side_pots_pb";
import { ServerMessageStandup } from "../../protobuf/holdem/recv_stand_up_pb";
import { ServerMessageStartInfo } from "../../protobuf/holdem/recv_start_info_pb";
import { ClientMessageAction, ServerMessageAction } from "../../protobuf/holdem/req_action_pb";
import { ClientMessageBringIn, ServerMessageBringIn } from "../../protobuf/holdem/req_bring_in_pb";
import { ClientMessageEnterRoom, ServerMessageEnterRoom } from "../../protobuf/holdem/req_enter_room_pb";
import { ClientMessageHeartbeat, ServerMessageHeartbeat } from "../../protobuf/holdem/req_heartbeat_pb";
import { ClientMessageLeave, ServerMessageLeave } from "../../protobuf/holdem/req_leave_pb";
import { ClientMessageRegister, ServerMessageRegister } from "../../protobuf/holdem/req_register_pb";
import { ServerMessagePublicReplay } from "../../protobuf/holdem/req_replay_pb";
import { ClientMessageRoomers, ServerMessageRoomers } from "../../protobuf/holdem/req_roomers_pb";
import { ClientMessageSeated, ServerMessageSeated } from "../../protobuf/holdem/req_seated_pb";
import { ClientMessageStandupActive, ServerMessageStandupActive } from "../../protobuf/holdem/req_stand_up_active_pb";

export class BaseProtocol {
    //RoomID: number;
    //MatchID: number;

    static _SetBody(obj, body, classDic?: any) {

        for (let key in body) {

            let value = body[key];

            let func = `set${key[0].toLocaleUpperCase()}${key.slice(1)}`;

            if (classDic && classDic[key]) {

                let childObj = new classDic[key]();

                obj[func](childObj);

                this._SetBody(childObj, value, classDic);
            } else {
                obj[func](value);

            }
        }

    }
    static SetBody(request: any, body: any = null, cls?: any) {
        this.body = body;
        this._SetBody(request, body, cls);
    }

    static body: any;
}
/**
 * 初次握手后注册
 */
export class Protocol_Holdem_Register extends BaseProtocol {
    static Name: string = "Protocol_Holdem_Register";
    static _request: ClientMessageRegister = null;
    public static Request_AsObject: ClientMessageRegister.AsObject = null;
    public static Response_AsObject: ServerMessageRegister.AsObject = null;

    static Request(body?: ClientMessageRegister.AsObject): Uint8Array {
        this._request || (this._request = new ClientMessageRegister());
        this.SetBody(this._request, body);
        return this._request.serializeBinary();
    }
    static Response(bytes: Uint8Array): ServerMessageRegister.AsObject {
        let result: ServerMessageRegister = ServerMessageRegister.deserializeBinary(bytes);
        return result.toObject();
    }
}

/**
 * 心跳
 */
export class Protocol_Holdem_Heartbeat extends BaseProtocol {
    static Name: string = "Protocol_Holdem_Heartbeat";
    static _request: ClientMessageHeartbeat = null;
    public static Request_AsObject: ClientMessageHeartbeat.AsObject = null;
    public static Response_AsObject: ServerMessageHeartbeat.AsObject = null;

    static Request(body?: ClientMessageHeartbeat.AsObject): Uint8Array {
        this._request || (this._request = new ClientMessageHeartbeat());
        this.SetBody(this._request, body);
        return this._request.serializeBinary();
    }
    static Response(bytes: Uint8Array): ServerMessageHeartbeat.AsObject {
        let result: ServerMessageHeartbeat = ServerMessageHeartbeat.deserializeBinary(bytes);
        return result.toObject();
    }
}

/**
 * 离开游戏
 */
export class Protocol_Holdem_Leave extends BaseProtocol {
    static Name: string = "Protocol_Holdem_Leave";
    static _request: ClientMessageLeave = null;
    public static Request_AsObject: ClientMessageLeave.AsObject = null;
    public static Response_AsObject: ServerMessageLeave.AsObject = null;

    static Request(body?: ClientMessageLeave.AsObject): Uint8Array {
        this._request || (this._request = new ClientMessageLeave());
        this.SetBody(this._request, body, { room: Room });
        return this._request.serializeBinary();
    }
    static Response(bytes: Uint8Array): ServerMessageLeave.AsObject {
        let result: ServerMessageLeave = ServerMessageLeave.deserializeBinary(bytes);
        return result.toObject();
    }
}

/**
 * 进入房间
 */
export class Protocol_Holdem_EnterRoom extends BaseProtocol {
    static Name: string = "Protocol_Holdem_EnterRoom";
    static _request: ClientMessageEnterRoom = null;
    public static Request_AsObject: ClientMessageEnterRoom.AsObject = null;
    public static Response_AsObject: ServerMessageEnterRoom.AsObject = null;

    static Request(body?: ClientMessageEnterRoom.AsObject): Uint8Array {
        this._request || (this._request = new ClientMessageEnterRoom());
        this.SetBody(this._request, body, { room: Room, gps: GPS });
        return this._request.serializeBinary();
    }
    static Response(bytes: Uint8Array): ServerMessageEnterRoom.AsObject {
        let result: ServerMessageEnterRoom = ServerMessageEnterRoom.deserializeBinary(bytes);
        return result.toObject();
    }
}


/**
 * 其他玩家坐下
 */
export class Protocol_Holdem_SeatedOthers extends BaseProtocol {
    static Name: string = "Protocol_Holdem_SeatedOthers";
    //static _request: ClientSeatth;
    //public static Request_AsObject: ClientMessageEnterRoom.AsObject = null;
    public static Response_AsObject: ServerMessageSeatedOthers.AsObject = null;

    // static Request(body?: ClientMessageEnterRoom.AsObject): Uint8Array {
    //     this._request || (this._request = new ClientMessageEnterRoom());
    //     this.SetBody(this._request, body, { room: Room, gps: GPS });
    //     return this._request.serializeBinary();
    // }
    static Response(bytes: Uint8Array): ServerMessageSeatedOthers.AsObject {
        let result: ServerMessageSeatedOthers = ServerMessageSeatedOthers.deserializeBinary(bytes);
        return result.toObject();
    }
}

/**
 * 主动坐下(非MTT使用)
 */
export class Protocol_Holdem_Seated extends BaseProtocol {
    static Name: string = "Protocol_Holdem_Seated";
    static _request: ClientMessageSeated = null;
    public static Request_AsObject: ClientMessageSeated.AsObject = null;
    public static Response_AsObject: ServerMessageSeated.AsObject = null;

    static Request(body?: ClientMessageSeated.AsObject): Uint8Array {
        this._request || (this._request = new ClientMessageSeated());
        this.SetBody(this._request, body, { room: Room });
        return this._request.serializeBinary();
    }
    static Response(bytes: Uint8Array): ServerMessageSeated.AsObject {
        let result: ServerMessageSeated = ServerMessageSeated.deserializeBinary(bytes);
        return result.toObject();
    }
}


/**
 * 桌子上额外买入(非MTT)
 */
export class Protocol_Holdem_BringIn extends BaseProtocol {
    static Name: string = "Protocol_Holdem_BringIn";
    static _request: ClientMessageBringIn = null;
    public static Request_AsObject: ClientMessageBringIn.AsObject = null;
    public static Response_AsObject: ServerMessageBringIn.AsObject = null;

    static Request(body?: ClientMessageBringIn.AsObject): Uint8Array {
        this._request || (this._request = new ClientMessageBringIn());
        this.SetBody(this._request, body, { room: Room });
        return this._request.serializeBinary();
    }
    static Response(bytes: Uint8Array): ServerMessageBringIn.AsObject {
        let result: ServerMessageBringIn = ServerMessageBringIn.deserializeBinary(bytes);
        return result.toObject();
    }
}

/**
 * 用户主动站起（非MTT）
 */
export class Protocol_Holdem_StandupActive extends BaseProtocol {
    static Name: string = "Protocol_Holdem_StandupActive";
    static _request: ClientMessageStandupActive = null;
    public static Request_AsObject: ClientMessageStandupActive.AsObject = null;
    public static Response_AsObject: ServerMessageStandupActive.AsObject = null;

    static Request(body?: ClientMessageStandupActive.AsObject): Uint8Array {
        this._request || (this._request = new ClientMessageStandupActive());
        this.SetBody(this._request, body, { room: Room });
        return this._request.serializeBinary();
    }
    static Response(bytes: Uint8Array): ServerMessageStandupActive.AsObject {
        let result: ServerMessageStandupActive = ServerMessageStandupActive.deserializeBinary(bytes);
        return result.toObject();
    }
}
/**
 * 接收用户站起信息,PlayerID=自己代表自己被强制站起了,reason给出原因
 */
export class Protocol_Holdem_Standup extends BaseProtocol {
    static Name: string = "Protocol_Holdem_Standup";
    public static Response_AsObject: ServerMessageStandup.AsObject = null;

    static Response(bytes: Uint8Array): ServerMessageStandup.AsObject {
        let result: ServerMessageStandup = ServerMessageStandup.deserializeBinary(bytes);
        return result.toObject();
    }
}
/**
 * 补盲状态变化
 */
export class Protocol_Holdem_PostStatusChange extends BaseProtocol {
    static Name: string = "Protocol_Holdem_PostStatusChange";
    public static Response_AsObject: ServerMessagePostStatusChange.AsObject = null;
    static Response(bytes: Uint8Array): ServerMessagePostStatusChange.AsObject {
        let result: ServerMessagePostStatusChange = ServerMessagePostStatusChange.deserializeBinary(bytes);
        return result.toObject();
    }
}
/**
 * 开始一手
 */
export class Protocol_Holdem_StartInfo extends BaseProtocol {
    static Name: string = "Protocol_Holdem_StartInfo";
    public static Response_AsObject: ServerMessageStartInfo.AsObject = null;
    static Response(bytes: Uint8Array): ServerMessageStartInfo.AsObject {
        let result: ServerMessageStartInfo = ServerMessageStartInfo.deserializeBinary(bytes);
        return result.toObject();
    }
}



/**
 * 牌桌回顾
 */
export class Protocol_Holdem_Roomers extends BaseProtocol {
    static Name: string = "Protocol_Holdem_Roomers";
    static _request: ClientMessageRoomers = null;
    public static Request_AsObject: ClientMessageRoomers.AsObject = null;
    public static Response_AsObject: ServerMessageRoomers.AsObject = null;

    static Request(body?: ClientMessageRoomers.AsObject): Uint8Array {
        this._request || (this._request = new ClientMessageRoomers());
        this.SetBody(this._request, body, { room: Room });
        return this._request.serializeBinary();
    }
    static Response(bytes: Uint8Array): ServerMessageRoomers.AsObject {
        let result: ServerMessageRoomers = ServerMessageRoomers.deserializeBinary(bytes);
        return result.toObject();
    }
}

/**
 * 主动行为
 */
export class Protocol_Holdem_Action extends BaseProtocol {
    static Name: string = "Protocol_Holdem_Action";
    static _request: ClientMessageAction = null;
    public static Request_AsObject: ClientMessageAction.AsObject = null;
    public static Response_AsObject: ServerMessageAction.AsObject = null;

    static Request(body?: ClientMessageAction.AsObject): Uint8Array {
        this._request || (this._request = new ClientMessageAction());
        this.SetBody(this._request, body, { room: Room });
        return this._request.serializeBinary();
    }
    static Response(bytes: Uint8Array): ServerMessageAction.AsObject {
        let result: ServerMessageAction = ServerMessageAction.deserializeBinary(bytes);
        return result.toObject();
    }
}

/**
 * 所有人收到主动/自动行为（包括自己）
 */
export class Protocol_Holdem_ActionAll extends BaseProtocol {
    static Name: string = "Protocol_Holdem_ActionAll";
    public static Response_AsObject: ServerMessageActionAll.AsObject = null;
    static Response(bytes: Uint8Array): ServerMessageActionAll.AsObject {
        let result: ServerMessageActionAll = ServerMessageActionAll.deserializeBinary(bytes);
        return result.toObject();
    }
}

/**
 * 边池信息
 */
export class Protocol_Holdem_SidePots extends BaseProtocol {
    static Name: string = "Protocol_Holdem_SidePots";
    public static Response_AsObject: ServerMessageSidePots.AsObject = null;
    static Response(bytes: Uint8Array): ServerMessageSidePots.AsObject {
        let result: ServerMessageSidePots = ServerMessageSidePots.deserializeBinary(bytes);
        return result.toObject();
    }
}

export class Protocol_Holdem_PublicCards extends BaseProtocol {
    static Name: string = "Protocol_Holdem_PublicCards";
    public static Response_AsObject: ServerMessagePublicCards.AsObject = null;
    static Response(bytes: Uint8Array): ServerMessagePublicCards.AsObject {
        let result: ServerMessagePublicCards = ServerMessagePublicCards.deserializeBinary(bytes);
        return result.toObject();
    }
}


cc.js.setClassName("Protocol_Holdem_Heartbeat", Protocol_Holdem_Heartbeat);
cc.js.setClassName("Protocol_Holdem_Register", Protocol_Holdem_Register);
cc.js.setClassName("Protocol_Holdem_Leave", Protocol_Holdem_Leave);
cc.js.setClassName("Protocol_Holdem_EnterRoom", Protocol_Holdem_EnterRoom);
cc.js.setClassName("Protocol_Holdem_SeatedOthers", Protocol_Holdem_SeatedOthers);
cc.js.setClassName("Protocol_Holdem_Seated", Protocol_Holdem_Seated);
cc.js.setClassName("Protocol_Holdem_BringIn", Protocol_Holdem_BringIn);
cc.js.setClassName("Protocol_Holdem_StandupActive", Protocol_Holdem_StandupActive);
cc.js.setClassName("Protocol_Holdem_Standup", Protocol_Holdem_Standup);
cc.js.setClassName("Protocol_Holdem_PostStatusChange", Protocol_Holdem_PostStatusChange);
cc.js.setClassName("Protocol_Holdem_StartInfo", Protocol_Holdem_StartInfo);
cc.js.setClassName("Protocol_Holdem_Roomers", Protocol_Holdem_Roomers);
cc.js.setClassName("Protocol_Holdem_Action", Protocol_Holdem_Action);
cc.js.setClassName("Protocol_Holdem_ActionAll", Protocol_Holdem_ActionAll);
cc.js.setClassName("Protocol_Holdem_SidePots", Protocol_Holdem_SidePots);
cc.js.setClassName("Protocol_Holdem_PublicCards", Protocol_Holdem_PublicCards);