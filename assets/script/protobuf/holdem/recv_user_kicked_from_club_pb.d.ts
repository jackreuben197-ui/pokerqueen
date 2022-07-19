// package: holdem.pb
// file: protobuf/holdem/recv_user_kicked_from_club.proto

import * as jspb from "google-protobuf";

export class ServerMessageUserKickedFromClub extends jspb.Message {
  getKickedTime(): number;
  setKickedTime(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerMessageUserKickedFromClub.AsObject;
  static toObject(includeInstance: boolean, msg: ServerMessageUserKickedFromClub): ServerMessageUserKickedFromClub.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerMessageUserKickedFromClub, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerMessageUserKickedFromClub;
  static deserializeBinaryFromReader(message: ServerMessageUserKickedFromClub, reader: jspb.BinaryReader): ServerMessageUserKickedFromClub;
}

export namespace ServerMessageUserKickedFromClub {
  export type AsObject = {
    kickedTime: number,
  }
}

