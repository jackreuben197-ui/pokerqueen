import PacketHead from "../net/websocket/PacketHead";
import { ClientMessageRegister } from "../protobuf/holdem/req_register_pb";

export default class GameSession {

    static Send({ protocol = null, RoomID = 0, MatchID = 0, Code = null }) {

        let body: Uint8Array = protocol.serializeBinary();
        let bodyLength: number = body.byteLength;
        //数据长度(要写入前4个字节)
        let dataLength: number = PacketHead.FixHeadLength + bodyLength;
        //总字节长度
        let bufferLength: number = PacketHead.Length + bodyLength;
        let dateView: DataView = new DataView(new ArrayBuffer(bufferLength));
        dateView.setUint8(0, dataLength);
        dateView.setUint8(PacketHead.FieldOffset.Code, Code);

    }
}
