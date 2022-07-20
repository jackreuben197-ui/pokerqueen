import PacketHead from "../net/websocket/PacketHead";
import WebSocketClient from "../net/websocket/WebSocketClient";
import { ClientMessageRegister } from "../protobuf/holdem/req_register_pb";
import LoginSession from "./LoginSession";

export default class GameSession {

    static Send({ protocol = null, RoomID = 0, MatchID = 0, Code = null }) {

        cc.log("WebSocketClient.WS.readyState", WebSocketClient.WS.readyState);

        if (WebSocketClient.WS.readyState == WebSocket.OPEN) {
            let body: Uint8Array = protocol.serializeBinary();
            let bodyLength: number = body.byteLength;
            //数据长度(要写入前4个字节)
            let dataLength: number = PacketHead.FixHeadLength + bodyLength;
            //总字节长度
            let bufferLength: number = PacketHead.Length + bodyLength;
            let arrayBuffer: ArrayBuffer = new ArrayBuffer(bufferLength);
            let sendUint8 = new Uint8Array(arrayBuffer);
            //sendUint8.


            let dataView: DataView = new DataView(arrayBuffer);
            this._writeUint32(dataView, PacketHead.FieldOffset.DataLength, dataLength);
            this._writeString(dataView, PacketHead.FieldOffset.CharsFlag, PacketHead.CharsFlag);
            this._writeUint16(dataView, PacketHead.FieldOffset.Code, Code);
            this._writeString(dataView, PacketHead.FieldOffset.Token, LoginSession.Token);
            this._writeUint64(dataView, PacketHead.FieldOffset.RoomID, RoomID);
            this._writeUint64(dataView, PacketHead.FieldOffset.MatchID, MatchID);
            this._writeUint8(dataView, PacketHead.FieldOffset.ProtoVersion, PacketHead.ProtoVersion.Protobuf);
            this._writeUint8Array(dataView, PacketHead.Length, body);
            WebSocketClient.WS.send(arrayBuffer);
        }
    }


    static _writeUint8(dataView: DataView, offset: number, num: number) {
        dataView.setUint8(offset, num);
    }
    static _writeUint16(dataView: DataView, offset: number, num: number) {
        dataView.setUint16(offset, num);
    }
    static _writeUint32(dataView: DataView, offset: number, num: number) {
        dataView.setUint32(offset, num);
    }
    static _writeUint64(dataView: DataView, offset: number, num: number) {
        let a = num >> 32;
        let b = num & 0xFFFFFFFF;
        dataView.setUint32(offset, a);
        dataView.setUint32(offset + 4, b);
    }
    static _writeString(dataView: DataView, offset: number, str: string) {
        for (let i = 0; i < str.length; i++) {
            let value: number = str.charCodeAt(i);
            dataView.setUint8(offset++, value);
        }
    }
    static _writeUint8Array(dataView: DataView, offset: number, uint8Array: Uint8Array) {
        for (let i = 0; i < uint8Array.length; i++) {
            let value: number = uint8Array[i];
            dataView.setUint8(offset++, value);
        }
    }
}
