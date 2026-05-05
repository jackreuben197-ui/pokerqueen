import { LogStyle } from "../../config/GameConfig";
import GC from "../../frame/GameControl";
import { GameCache } from "../../game/GameCache";
import H5MsgMgr from "../../H5MsgMgr";
import { ClientMessageLeave } from "../../protobuf/holdem/req_th_leave_pb";
import LoginSession from "../../session/LoginSession";
import OpCodeHelper from "./OpCodeHelper";
import PacketHead from "./PacketHead";
import { ProtocolCode } from "./ProtocolCode";
import { ProtocolCommon, ProtocolMap } from "./ProtocolHoldemMessages";
import WebSocketClient from "./WebSocketClient";

const { ccclass, property } = cc._decorator;

const LN = '[ProtocolAgency]'
@ccclass
export default class ProtocolAgency extends cc.Component {
    public static gTimeStamp : number = 0;

    static Send<Client_AsObject>(param: {
        Code: number;
        RoomID: number;
        MatchID: number;
        Body?: Client_AsObject;
    }) {
        // H5 桥接模式：所有协议通过 H5 层转发
        if (H5MsgMgr.Instance.handshakeDone) {
            let protocol_name = ProtocolCode[param.Code];
            if (!protocol_name) {
                console.log(LN,
                    "code not in ProtocolCode",
                    protocol_name,
                    JSON.stringify(param),
                );
                return;
            }
            let client = ProtocolMap[param.Code]?.Client;
            if (!client) {
                console.log(LN,
                    "protocol unregistered in ProtocolMap",
                    protocol_name,
                    JSON.stringify(param),
                );
                return;
            }
            if (OpCodeHelper.NeedLog(param.Code)) {
                console.log(LN,
                    `>>>>> protocol send (H5): ${protocol_name}`,
                    `RoomID:${param.RoomID},MatchID:${param.MatchID},body:${JSON.stringify(param.Body)}`,
                );
            }

            let bodyBA = ProtocolCommon.Instance.Request(param.Code, param.Body);
            let bodyLength: number = bodyBA.byteLength;
            let dataLength: number = PacketHead.FixHeadLength + bodyLength;
            let bufferLength: number = PacketHead.Length + bodyLength;
            let arrayBuffer: ArrayBuffer = new ArrayBuffer(bufferLength);
            let dataView: DataView = new DataView(arrayBuffer);
            this._writeUint32(dataView, PacketHead.FieldOffset.DataLength, dataLength);
            this._writeUint8Array(dataView, PacketHead.FieldOffset.CharsFlag, PacketHead.CharsFlag);
            this._writeUint16(dataView, PacketHead.FieldOffset.Code, param.Code);
            this._writeString(dataView, PacketHead.FieldOffset.Token, LoginSession.Token);
            this._writeUint64(dataView, PacketHead.FieldOffset.RoomID, param.RoomID);
            this._writeUint64(dataView, PacketHead.FieldOffset.MatchID, param.MatchID);
            this._writeUint8(dataView, PacketHead.FieldOffset.ProtoVersion, PacketHead.ProtoVersion.Protobuf);
            this._writeUint8Array(dataView, PacketHead.Length, bodyBA);
            // 通过 H5 桥接转发二进制包
            H5MsgMgr.sendToH5('wsSend', 0, new Uint8Array(arrayBuffer));

            return;
        }
        // 直连模式（后备，H5 未握手时走旧路径）
        if (WebSocketClient.CheckOpen()) {
            let protocol_name = ProtocolCode[param.Code];
            if (!protocol_name) {
                console.log(LN,
                    "code not in ProtocolCode",
                    protocol_name,
                    JSON.stringify(param),
                );
                return;
            }
            let client = ProtocolMap[param.Code]?.Client;

            if (!client) {
                console.log(LN,
                    "protocol unregistered in ProtocolMap",
                    protocol_name,
                    JSON.stringify(param),
                );
                return;
            }
            if (OpCodeHelper.NeedLog(param.Code)) {
                console.log(LN,
                    `>>>>> protocol send : ${protocol_name}`,
                    `RoomID:${param.RoomID},MatchID:${param.MatchID},body:${JSON.stringify(param.Body)}`,
                );
            }

            let bodyBA = ProtocolCommon.Instance.Request(
                param.Code,
                param.Body,
            );

            let bodyLength: number = bodyBA.byteLength;
            let dataLength: number = PacketHead.FixHeadLength + bodyLength;
            let bufferLength: number = PacketHead.Length + bodyLength;
            let arrayBuffer: ArrayBuffer = new ArrayBuffer(bufferLength);
            let dataView: DataView = new DataView(arrayBuffer);
            this._writeUint32(
                dataView,
                PacketHead.FieldOffset.DataLength,
                dataLength,
            );
            this._writeUint8Array(
                dataView,
                PacketHead.FieldOffset.CharsFlag,
                PacketHead.CharsFlag,
            );
            this._writeUint16(
                dataView,
                PacketHead.FieldOffset.Code,
                param.Code,
            );
            this._writeString(
                dataView,
                PacketHead.FieldOffset.Token,
                LoginSession.Token,
            );
            this._writeUint64(
                dataView,
                PacketHead.FieldOffset.RoomID,
                param.RoomID,
            );
            this._writeUint64(
                dataView,
                PacketHead.FieldOffset.MatchID,
                param.MatchID,
            );
            this._writeUint8(
                dataView,
                PacketHead.FieldOffset.ProtoVersion,
                PacketHead.ProtoVersion.Protobuf,
            );
            this._writeUint8Array(dataView, PacketHead.Length, bodyBA);
            WebSocketClient.WS.send(arrayBuffer);
        }
    }

    /**
     * 构造完整的二进制协议包（包头 + Protobuf Body），不通过 WS 发送，而是返回 ArrayBuffer。
     * 用于 H5 桥接场景：CC 层构造好二进制包，交给 H5 层直接 ws.send()。
     */
    static BuildPacket(param: {
        Code: number;
        RoomID: number;
        MatchID: number;
        Body?: any;
    }): ArrayBuffer | null {
        let protocol_name = ProtocolCode[param.Code];
        if (!protocol_name) {
            console.warn('[ProtocolAgency] BuildPacket: code not found:', param.Code);
            return null;
        }
        let client = ProtocolMap[param.Code]?.Client;
        if (!client) {
            console.warn('[ProtocolAgency] BuildPacket: protocol unregistered:', protocol_name);
            return null;
        }

        let bodyBA: Uint8Array = ProtocolCommon.Instance.Request(param.Code, param.Body);
        let bodyLength: number = bodyBA.byteLength;
        let dataLength: number = PacketHead.FixHeadLength + bodyLength;
        let bufferLength: number = PacketHead.Length + bodyLength;

        let arrayBuffer: ArrayBuffer = new ArrayBuffer(bufferLength);
        let dataView: DataView = new DataView(arrayBuffer);
        this._writeUint32(dataView, PacketHead.FieldOffset.DataLength, dataLength);
        this._writeUint8Array(dataView, PacketHead.FieldOffset.CharsFlag, PacketHead.CharsFlag);
        this._writeUint16(dataView, PacketHead.FieldOffset.Code, param.Code);
        this._writeString(dataView, PacketHead.FieldOffset.Token, LoginSession.Token);
        this._writeUint64(dataView, PacketHead.FieldOffset.RoomID, param.RoomID);
        this._writeUint64(dataView, PacketHead.FieldOffset.MatchID, param.MatchID);
        this._writeUint8(dataView, PacketHead.FieldOffset.ProtoVersion, PacketHead.ProtoVersion.Protobuf);
        this._writeUint8Array(dataView, PacketHead.Length, bodyBA);

        return arrayBuffer;
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
        if (num > 0xffffffff) {
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
    static _writeUint8Array(
        dataView: DataView,
        offset: number,
        uint8Array: Uint8Array,
    ) {
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
                console.log(LN,
                    "charsflag is no match",
                );
                return;
            }
        }
        let code_offset =
            PacketHead.FieldOffset.Code - PacketHead.FieldSize.DataLength;
        let code: number = this._readNumber(
            ua,
            code_offset,
            PacketHead.FieldSize.Code,
        );

        let protocol_name = this._getProtocolNameByCode(code);
        if (!protocol_name) {
            console.log(LN,
                "code is undefined " + code,
            );
            return;
        }

        let roomid_offset =
            PacketHead.FieldOffset.RoomID - PacketHead.FieldSize.DataLength;
        let matchid_offset =
            PacketHead.FieldOffset.MatchID - PacketHead.FieldSize.DataLength;

        let roomid: number = this._readNumber(
            ua,
            roomid_offset,
            PacketHead.FieldSize.RoomID,
        );
        let matchid: number = this._readNumber(
            ua,
            matchid_offset,
            PacketHead.FieldSize.MatchID,
        );

        // RoomID or MatchID 和当前不匹配
        if (
            code != ProtocolCode.Protocol_Holdem_Leave &&
            code != ProtocolCode.Protocol_Holdem_EnterRoom
        ) {
            let isRubbish =
                (roomid != 0 && roomid != GameCache.Instance.room_id) ||
                (matchid != 0 && matchid != GameCache.Instance.match_id);
            if (isRubbish) {
                console.log(LN,
                    `roomid or matchid is no match cache:{RoomID:${GameCache.Instance.room_id},MatchID:${GameCache.Instance.match_id}},receive:{RoomID:${roomid},MatchID:${matchid}}`,
                );
                // H5 桥接模式（CC 不直接连 WebSocket）：仅丢弃，不发 Leave。
                // 原因：H5 的 WebSocket 可能收到多个房间的推送（观战、大厅等），
                // 自动 Leave 会误退当前正在进行的牌桌。
                // if (!WebSocketClient.CheckOpen(true)) {
                //     console.log(LN,
                //         `[H5Bridge] 丢弃不匹配房间的消息，不发送 Leave`,
                //     );
                //     return;
                // }
                // 正常模式（CC 直连 WebSocket）：主动 Leave 清理旧房间
                ProtocolAgency.Send<ClientMessageLeave.AsObject>({
                    Code: ProtocolCode.Protocol_Holdem_Leave,
                    RoomID: roomid,
                    MatchID: matchid,
                    Body: {
                        room: {
                            roomId: roomid,
                            matchId: matchid,
                        },
                    },
                });
                return;
            }
        }

        let body_ua: Uint8Array = new Uint8Array(
            data.slice(PacketHead.FixHeadLength),
        );

        let server = ProtocolMap[code]?.Server;

        if (!server) {
            console.log(LN,
                "protocol unregistered in ProtocolMap " + protocol_name,
            );
            return;
        }
        let body = ProtocolCommon.Instance.Response(body_ua, server);

        if (OpCodeHelper.NeedLog(code)){
            console.log(LN,
                `>>>>> protocol receive : ${protocol_name}`,
                `RoomID:${roomid},MatchID:${matchid},body:${JSON.stringify(body)}`,
            );
        }
        
        // 
        // 记录服务器的timeStamp数据：
        if( (code == ProtocolCode.Protocol_Holdem_Heartbeat)||(code == ProtocolCode.Protocol_Holdem_Register)){
            // 记录当前Server时间戳:
            if( (body as any).timestamp ){
                
                if( !this.gTimeStamp )
                    console.log( "首次设置全局的GTimeStamp:" + (body as any).timestamp );

                this.gTimeStamp = (body as any).timestamp;
            }
        }

        GC.notify.post(code, body, roomid, matchid);

        body = null;

        body_ua = null;
    }

    static _readNumber(ua: Uint8Array, offset: number, size: number): number {
        let result: number = 0;
        for (let i = 0; i < size; i++) {
            let num = ua[offset + i];
            let op = size - i - 1;
            result |= num << (op * 8);
        }
        return result;
    }

    static _getProtocolNameByCode(code: number): string {
        return ProtocolCode[code];
    }
    static _getCodeByProtocolName(name: string): number {
        return ProtocolCode[name as keyof typeof ProtocolCode];
    }
}
