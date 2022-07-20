/**
 * 头部包体结构
 */
export default class PacketHead{

    static CharsFlag: string = "YM";

    static offset:number = 0;

    static ProtoVersion = 
        {
            Unknown  : 0,
            Json     : 1,
            Protobuf : 2,
        };
    static FieldSize = {
        DataLength    : 4,
        CharsFlag     : 2,
        Code          : 2,
        Token         : 32,
        RoomID        : 8,
        MatchID       : 8,
        ProtoVersion  : 1,
    };
    static FieldIndex = {
        DataLength    : 0,
        CharsFlag     : 1,
        Code          : 2,
        Token         : 3,
        RoomID        : 4,
        MatchID       : 5,
        ProtoVersion  : 6,
    };
    static FieldOffset = {
        DataLength    : 0,
        CharsFlag     : 0,
        Code          : 0,
        Token         : 0,
        RoomID        : 0,
        MatchID       : 0,
        ProtoVersion  : 0,
    }

    static Init(){
        
        this.FieldOffset.CharsFlag = this.FieldOffset.DataLength + this.FieldSize.DataLength;
        this.FieldOffset.Code = this.FieldOffset.CharsFlag + this.FieldSize.CharsFlag;
        this.FieldOffset.Token = this.FieldOffset.Code + this.FieldSize.Code;
        this.FieldOffset.RoomID = this.FieldOffset.Token + this.FieldSize.Token;
        this.FieldOffset.MatchID = this.FieldOffset.RoomID + this.FieldSize.RoomID;
        this.FieldOffset.ProtoVersion = this.FieldOffset.MatchID + this.FieldSize.MatchID;
    }

    static get Length():number{
        return this.FieldSize.DataLength
        + this.FieldSize.CharsFlag
        + this.FieldSize.Code
        + this.FieldSize.Token
        + this.FieldSize.RoomID
        + this.FieldSize.MatchID
        + this.FieldSize.ProtoVersion
    }

    static get FixHeadLength():number{
        return this.Length - this.FieldSize.DataLength;
    }

}
(window as any).PacketHead = PacketHead;