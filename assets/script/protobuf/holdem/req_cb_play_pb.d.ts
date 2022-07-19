// package: holdem.pb
// file: protobuf/holdem/req_cb_play.proto

import * as jspb from "google-protobuf";
import * as protobuf_holdem_define_cb_pb from "../../protobuf/holdem/define_cb_pb";

export class ClientMessageCbPlay extends jspb.Message {
  getGameNum(): number;
  setGameNum(value: number): void;

  getSlot(): protobuf_holdem_define_cb_pb.DefCB.PlaySlotMap[keyof protobuf_holdem_define_cb_pb.DefCB.PlaySlotMap];
  setSlot(value: protobuf_holdem_define_cb_pb.DefCB.PlaySlotMap[keyof protobuf_holdem_define_cb_pb.DefCB.PlaySlotMap]): void;

  getAmount(): number;
  setAmount(value: number): void;

  getRoomId(): number;
  setRoomId(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClientMessageCbPlay.AsObject;
  static toObject(includeInstance: boolean, msg: ClientMessageCbPlay): ClientMessageCbPlay.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClientMessageCbPlay, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClientMessageCbPlay;
  static deserializeBinaryFromReader(message: ClientMessageCbPlay, reader: jspb.BinaryReader): ClientMessageCbPlay;
}

export namespace ClientMessageCbPlay {
  export type AsObject = {
    gameNum: number,
    slot: protobuf_holdem_define_cb_pb.DefCB.PlaySlotMap[keyof protobuf_holdem_define_cb_pb.DefCB.PlaySlotMap],
    amount: number,
    roomId: number,
  }
}

export class ServerMessageCbPlay extends jspb.Message {
  getStatus(): number;
  setStatus(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerMessageCbPlay.AsObject;
  static toObject(includeInstance: boolean, msg: ServerMessageCbPlay): ServerMessageCbPlay.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerMessageCbPlay, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerMessageCbPlay;
  static deserializeBinaryFromReader(message: ServerMessageCbPlay, reader: jspb.BinaryReader): ServerMessageCbPlay;
}

export namespace ServerMessageCbPlay {
  export type AsObject = {
    status: number,
  }
}

