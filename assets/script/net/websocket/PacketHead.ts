/**
 * 头部包体结构
 */
export default class PacketHead{

    static offset:number = 0;

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
        CharsFlag     : this.offset+= PacketHead.FieldSize.DataLength,
        Code          : this.offset+= PacketHead.FieldSize.CharsFlag,
        Token         : this.offset+= PacketHead.FieldSize.Code,
        RoomID        : this.offset+= PacketHead.FieldSize.Token,
        MatchID       : this.offset+= PacketHead.FieldSize.RoomID,
        ProtoVersion  : this.offset+= PacketHead.FieldSize.MatchID,
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