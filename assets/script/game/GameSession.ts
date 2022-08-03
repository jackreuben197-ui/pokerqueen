import { RoomType } from "../define/EIDefine";
import GameCache from "../manager/GameCache";
import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { Protocol_Holdem_EnterRoom } from "../net/websocket/ProtocolHoldemMessages";
import GameUtil from "../tools/GameUtil";
import TexasGame from "./TexasGame";


export default class GameSession {

    static currentRoomID: number = 0;

    static isInGameplay() {
        return this.currentRoomID != 0;
    }

    /**
     * 请求进入房间
     */
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
