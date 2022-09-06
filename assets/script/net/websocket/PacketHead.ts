/**
 * 头部包体结构
 */
export default class PacketHead {


/*
包格式（表头：字节长度)
|       4        |      2      |     2     |            32            |      8      |      8      |         1          |          0-n          |
| :------------: | :---------: | :-------: | :----------------------: | :---------: | :---------: | :----------------: | :-------------------: |
| 数据段的总长度  |  固定标记    | 消息类型   |     用户标记(Token)       |   roomID    |   matchID  | 数据段结构的版本号   |      各异数据段       |
|   120(int32)   | YM(char[2]) | 1(uint16) | asdffdsaasdffdsa(string) |             |             |      2 (int8)      | 数据marshal后数据byte |
*/


    //固定标记
    static CharsFlag: Uint8Array = new Uint8Array([0x59/*Y*/, 0x4D/*M*/]);

    static offset: number = 0;

    static _length: number = 0;
    static _fixlength: number = 0;

    //只初始化一次
    static _initOnce: boolean = false;

    static ProtoVersion =
        {
            Unknown: 0,
            Json: 1,
            Protobuf: 2,
        };
    static FieldSize = {
        DataLength: 4,
        CharsFlag: 2,
        Code: 2,
        Token: 32,
        RoomID: 8,
        MatchID: 8,
        ProtoVersion: 1,
    };
    static FieldIndex = {
        DataLength: 0,
        CharsFlag: 1,
        Code: 2,
        Token: 3,
        RoomID: 4,
        MatchID: 5,
        ProtoVersion: 6,
    };
    static FieldOffset = {
        DataLength: 0,
        CharsFlag: 0,
        Code: 0,
        Token: 0,
        RoomID: 0,
        MatchID: 0,
        ProtoVersion: 0,
    }

    static Init() {
        if (!this._initOnce) {
            this._initOnce = true;
            this.FieldOffset.CharsFlag = this.FieldOffset.DataLength + this.FieldSize.DataLength;
            this.FieldOffset.Code = this.FieldOffset.CharsFlag + this.FieldSize.CharsFlag;
            this.FieldOffset.Token = this.FieldOffset.Code + this.FieldSize.Code;
            this.FieldOffset.RoomID = this.FieldOffset.Token + this.FieldSize.Token;
            this.FieldOffset.MatchID = this.FieldOffset.RoomID + this.FieldSize.RoomID;
            this.FieldOffset.ProtoVersion = this.FieldOffset.MatchID + this.FieldSize.MatchID;

            this._length = this.FieldSize.DataLength
                + this.FieldSize.CharsFlag
                + this.FieldSize.Code
                + this.FieldSize.Token
                + this.FieldSize.RoomID
                + this.FieldSize.MatchID
                + this.FieldSize.ProtoVersion;
            this._fixlength = this._length - this.FieldSize.DataLength;
        }
    }

    static get Length(): number {
        return this._length;
    }

    static get FixHeadLength(): number {
        return this._fixlength;
    }

}
(window as any).PacketHead = PacketHead;