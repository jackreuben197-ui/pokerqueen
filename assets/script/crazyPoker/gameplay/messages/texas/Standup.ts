import { ServerMessageStandup } from '../../../../protobuf/holdem/recv_th_stand_up_pb';
import roomDataManager from '../../common/core/RoomDataManager';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';

// Standup 1110
export default function Standup(data: ServerMessageStandup.AsObject, roomID: number, matchID: number) {
    let roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    let seatData = roomData.seatsStateManager.getSeatPlayer(data.seatId);
    //@TODO
    seatData.emptySeat();
}
