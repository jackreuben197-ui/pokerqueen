// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { ServerMessageRegister } from "../../protobuf/holdem/req_register_pb";
import LoginSession from "../../session/LoginSession";
import PacketHead from "./PacketHead";
import WebSocketClient from "./WebSocketClient";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ProtocolAgency extends cc.Component {
    static Send({ protocol = null, RoomID = 0, MatchID = 0, Code = null }) {

        if (WebSocketClient.WS.readyState == WebSocket.OPEN) {

            let body: Uint8Array = protocol.serializeBinary();
            let bodyLength: number = body.byteLength;
            //数据长度(要写入前4个字节)
            let dataLength: number = PacketHead.FixHeadLength + bodyLength;
            //总字节长度
            let bufferLength: number = PacketHead.Length + bodyLength;
            let arrayBuffer: ArrayBuffer = new ArrayBuffer(bufferLength);
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
        if (num > 0xFFFFFFFF) {
            let num_hex_str = num.toString(16);
            let m = num_hex_str.length - 8;
            let a = num_hex_str.substring(0, m);
            let b = num_hex_str.substring(m);
            dataView.setUint32(offset, parseInt("0x" + a));
            dataView.setUint32(offset + 4, parseInt("0x" + b));
        } else {
            dataView.setUint32(offset, 0);
            dataView.setUint32(offset + 4, num);
        }
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


    static Receive(data: ArrayBuffer) {

        let ua = new Uint8Array(data);

        let code = ua.slice();

        let body_ua = ua.slice(PacketHead.FixHeadLength);

        cc.log("ua : >", body_ua);

        let msg = ServerMessageRegister.deserializeBinary(new Uint8Array(body_ua))

        cc.log("msg : >", msg.getStatus(), msg.getTimestamp());

        // let dataView: DataView = new DataView(data);

        // let offset = PacketHead.FieldSize.DataLength;

        // let code = dataView.getUint16(PacketHead.FieldOffset.Code - offset);

        // cc.log("code:", code);

        // let body_buffer = data.slice(PacketHead.FixHeadLength, data.byteLength - 1);

        // if (code == 1) {
        //     let msg = ServerMessageRegister.deserializeBinary(new Uint8Array(body_buffer))
        //     cc.log("msg : >", msg.getStatus(), msg.getTimestamp());
        // }
    }

}
