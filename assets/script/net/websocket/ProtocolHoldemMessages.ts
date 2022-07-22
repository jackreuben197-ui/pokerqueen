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

cc.js.setClassName("Protocol_Holdem_Register", Protocol_Holdem_Register);