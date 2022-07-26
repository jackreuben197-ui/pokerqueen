import { ClientMessageHeartbeat, ServerMessageHeartbeat } from "../../protobuf/holdem/req_heartbeat_pb";
import { ClientMessageLeave, ServerMessageLeave } from "../../protobuf/holdem/req_leave_pb";
import { ClientMessageRegister, ServerMessageRegister } from "../../protobuf/holdem/req_register_pb";

export class BaseProtocol {
    //RoomID: number;
    //MatchID: number;
    static SetBody(request: any, body: any = null) {
        for (let key in body) {
            request[`set${key[0].toLocaleUpperCase()}${key.slice(1)}`](body[key]);
        }
    }
}
/**
 * 初次握手后注册
 */
export class Protocol_Holdem_Register extends BaseProtocol {

    static _request: ClientMessageRegister;
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

    static _request: ClientMessageHeartbeat;
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

    static _request: ClientMessageLeave;
    public static Request_AsObject: ClientMessageLeave.AsObject = null;
    public static Response_AsObject: ServerMessageLeave.AsObject = null;

    static Request(body?: ClientMessageLeave.AsObject): Uint8Array {
        this._request || (this._request = new ClientMessageLeave());
        this.SetBody(this._request, body);
        return this._request.serializeBinary();
    }
    static Response(bytes: Uint8Array): ServerMessageLeave.AsObject {
        let result: ServerMessageLeave = ServerMessageLeave.deserializeBinary(bytes);
        return result.toObject();
    }
}







cc.js.setClassName("Protocol_Holdem_Heartbeat", Protocol_Holdem_Heartbeat);
cc.js.setClassName("Protocol_Holdem_Register", Protocol_Holdem_Register);