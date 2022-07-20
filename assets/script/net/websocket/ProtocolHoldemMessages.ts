import { ClientMessageRegister, ServerMessageRegister } from "../../protobuf/holdem/req_register_pb";

class BaseProtocol {
    RoomID: number;
    MatchID: number;
}

export class Protocol_Holdem_Register extends BaseProtocol {
    request: ClientMessageRegister;
    response: ServerMessageRegister;
    Serialize(): Uint8Array {
        return this.request.serializeBinary();
    }
    Deserialize(bytes: Uint8Array): ServerMessageRegister {
        return ServerMessageRegister.deserializeBinary(bytes);
    }
}