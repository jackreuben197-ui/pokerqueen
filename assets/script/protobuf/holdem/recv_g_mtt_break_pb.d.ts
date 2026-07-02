// package: holdem.pb
// file: protobuf/holdem/recv_g_mtt_break.proto

import * as jspb from "google-protobuf";

export class ServerMessageMttBreak extends jspb.Message {
  getMatchId(): number;
  setMatchId(value: number): void;

  getBreakType(): number;
  setBreakType(value: number): void;

  getEventType(): number;
  setEventType(value: number): void;

  getStartTime(): number;
  setStartTime(value: number): void;

  getEndTime(): number;
  setEndTime(value: number): void;

  getRemindTime(): number;
  setRemindTime(value: number): void;

  getDuration(): number;
  setDuration(value: number): void;

  getBlindLevel(): number;
  setBlindLevel(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerMessageMttBreak.AsObject;
  static toObject(includeInstance: boolean, msg: ServerMessageMttBreak): ServerMessageMttBreak.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerMessageMttBreak, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerMessageMttBreak;
  static deserializeBinaryFromReader(message: ServerMessageMttBreak, reader: jspb.BinaryReader): ServerMessageMttBreak;
}

export namespace ServerMessageMttBreak {
  export type AsObject = {
    matchId: number,
    breakType: number,
    eventType: number,
    startTime: number,
    endTime: number,
    remindTime: number,
    duration: number,
    blindLevel: number,
  }
}

