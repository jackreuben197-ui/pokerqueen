

import { LogStyle } from "../../config/GameConfig";
import CPMessageDispatherComponent from "../../event/CPMessageDispatherComponent";
import { GameCache } from "../../game/GameCache";
import { ServerMessageRegister } from "../../protobuf/holdem/req_register_pb";
import LobbySession from "../../session/LobbySession";
import LoginSession from "../../session/LoginSession";
import OpCodeHelper from "./OpCodeHelper";
import PacketHead from "./PacketHead";
import { ProtocolCode } from "./ProtocolCode";
import { BaseProtocol, Protocol_Holdem_Leave, Protocol_Holdem_Register } from "./ProtocolHoldemMessages";
import WebSocketClient from "./WebSocketClient";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ProtocolAgency extends cc.Component {

    static Send({ protocol = null, RoomID = 0, MatchID = 0, body = null }) {

        if (WebSocketClient.WS.readyState == WebSocket.OPEN) {
            let code: number = this._getCodeByProtocolName(protocol.Name);
            if (!code) {
                console.log("%c%s:%s\n%s", LogStyle.ws_request, "undefined code", protocol.Name, JSON.stringify(arguments[0]));
                return;
            }

            if (OpCodeHelper.NeedLog(code)) {

                console.log("%c%s\n%s", LogStyle.ws_request, `>>>>> protocol send : ${protocol.Name}`, `RoomID:${RoomID},MatchID:${MatchID},body:${JSON.stringify(protocol.body)}`);
            }
            let bodyLength: number = body.byteLength;
            //数据长度(要写入前4个字节)
            let dataLength: number = PacketHead.FixHeadLength + bodyLength;
            //总字节长度
            let bufferLength: number = PacketHead.Length + bodyLength;
            let arrayBuffer: ArrayBuffer = new ArrayBuffer(bufferLength);
            let dataView: DataView = new DataView(arrayBuffer);
            this._writeUint32(dataView, PacketHead.FieldOffset.DataLength, dataLength);
            this._writeUint8Array(dataView, PacketHead.FieldOffset.CharsFlag, PacketHead.CharsFlag);
            this._writeUint16(dataView, PacketHead.FieldOffset.Code, code);
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
    /**
     * js不具备64位整型，需要特殊处理
     * @param dataView 
     * @param offset 
     * @param num 
     */
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
        if (!data) return;
        let ua = new Uint8Array(data);
        for (let i = 0; i < PacketHead.CharsFlag.length; i++) {
            if (ua[i] != PacketHead.CharsFlag[i]) {
                console.log("%c%s", LogStyle.ws_response, "charsflag is no match");
                return;
            }
        }
        let code_offset = PacketHead.FieldOffset.Code - PacketHead.FieldSize.DataLength;
        let code: number = this._readNumber(ua, code_offset, PacketHead.FieldSize.Code);

        let protocolName = this._getProtocolNameByCode(code);
        if (!protocolName) {
            console.log("%c%s", LogStyle.ws_response, "code is undefined " + code);
            return;
        }

        let roomid_offset = PacketHead.FieldOffset.RoomID - PacketHead.FieldSize.DataLength;
        let matchid_offset = PacketHead.FieldOffset.MatchID - PacketHead.FieldSize.DataLength;

        let roomid: number = this._readNumber(ua, roomid_offset, PacketHead.FieldSize.RoomID);
        let matchid: number = this._readNumber(ua, matchid_offset, PacketHead.FieldSize.MatchID);


        // RoomID or MatchID 和当前不匹配,请求离开房间
        if (code != ProtocolCode.Protocol_Holdem_Leave
            && code != ProtocolCode.Protocol_Holdem_EnterRoom) {
            let isRubbish = (roomid != 0 && roomid != GameCache.Instance.room_id)
                || (matchid != 0 && matchid != GameCache.Instance.match_id);
            if (isRubbish) {
                console.log("%c%s", LogStyle.ws_response, `roomid or matchid is no match
                cache:{RoomID:${GameCache.Instance.room_id},MatchID:${GameCache.Instance.match_id} 
                receive:{RoomID:${roomid},MatchID:${matchid}`);
                ProtocolAgency.Send({
                    protocol: Protocol_Holdem_Leave,
                    RoomID: roomid,
                    MatchID: matchid,
                    body: Protocol_Holdem_Leave.Request({
                        room: {
                            roomId: roomid,
                            matchId: matchid,
                        }
                    }),
                });
                return;
            };
        }

        let protocol: any = cc.js.getClassByName(protocolName);
        if (!protocol) {
            console.log("%c%s", LogStyle.ws_response, "protocol is undefined or unregistered " + protocolName);
            return;
        }

        let body_ua = data.slice(PacketHead.FixHeadLength);

        let body = protocol.Response(body_ua);

        if (OpCodeHelper.NeedLog(code))
            console.log("%c%s\n%s", LogStyle.ws_response, `>>>>> protocol receive : ${protocolName}`, `RoomID:${roomid},MatchID:${matchid},body:${JSON.stringify(body)}`);

        //Dispatcher.emit(code, body);
        CPMessageDispatherComponent.Instance.Handle(code, body);

    }

    static _readNumber(ua: Uint8Array, offset, size): number {
        let hex: string = "0x";
        for (let i = 0; i < size; i++) {
            hex += ua[offset + i].toString(16);
        }
        return parseInt(hex);
    }

    static _getProtocolNameByCode(code): string {
        return ProtocolCode[code];
    }
    static _getCodeByProtocolName(name: string): number {
        return ProtocolCode[name];
    }
}
