import { RoomType } from "../define/EIDefine";
import TexasGame from "../game/TexasGame";
import GameCache from "../manager/GameCache";
import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { Protocol_Holdem_EnterRoom } from "../net/websocket/ProtocolHoldemMessages";
import { GPS, Room } from "../protobuf/holdem/define_pb";
import { ClientMessageEnterRoom } from "../protobuf/holdem/req_enter_room_pb";

export default class GameSession {

    public static cache_data = {
        //经度
        longitude: "0",
        //纬度
        latitude: "0",
    }

    static currentRoomID: number = 0;

    static texasGame: TexasGame = null;

    static Init() {
        this.texasGame || (this.texasGame = new TexasGame());
    }

    static isInGameplay() {
        return this.currentRoomID != 0;
    }


    static EnterRoom() {
        let roomType = GameCache.ins.room_type;
        if (roomType >= RoomType.MTTTexasHoldemStandardNoLimit) {
            //MTT
        } else {
            ProtocolAgency.Send({
                protocol: Protocol_Holdem_EnterRoom,
                RoomID: GameCache.ins.room_id,
                MatchID: GameCache.ins.match_id,
                body: Protocol_Holdem_EnterRoom.Request(
                    {
                        room: { roomId: GameCache.ins.room_id, matchId: GameCache.ins.match_id },
                        gps: { longitude: GameCache.ins.longitude, latitude: GameCache.ins.latitude },
                        mttPartialBringIn: 0,
                        observer: false,
                    }),
            });
        }
    }
}
