import { RoomType } from "../define/EIDefine";
import GameCache from "../manager/GameCache";
import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { Protocol_Holdem_EnterRoom, Protocol_Holdem_Leave } from "../net/websocket/ProtocolHoldemMessages";
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
        let roomType = GameCache.Instance.room_type;
        if (roomType >= RoomType.MTTTexasHoldemStandardNoLimit) {
            //MTT
        } else {
            ProtocolAgency.Send({
                protocol: Protocol_Holdem_EnterRoom,
                RoomID: GameCache.Instance.room_id,
                MatchID: GameCache.Instance.match_id,
                body: Protocol_Holdem_EnterRoom.Request(
                    {
                        room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                        gps: { longitude: GameCache.Instance.longitude, latitude: GameCache.Instance.latitude },
                        mttPartialBringIn: 0,
                        observer: false,
                    }),
            });
        }
    }
    /**
     * 离开房间
     */
    static LeaveRoom() {
        ProtocolAgency.Send({
            protocol: Protocol_Holdem_Leave,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            body: Protocol_Holdem_Leave.Request(
                {
                    room: {
                        roomId: GameCache.Instance.room_id,
                        matchId: GameCache.Instance.match_id,
                    }
                }),
        });
    }
}
