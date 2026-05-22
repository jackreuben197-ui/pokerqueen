import { ServerMessageHandClear } from '../../../../protobuf/holdem/recv_th_hand_clear_pb';
import roomDataManager from '../../common/core/RoomDataManager';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';

// HandClear 1119
export default function HandClear(data: ServerMessageHandClear.AsObject, roomID: number, matchID: number) {
    const roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    roomData.potInfo.allPot = 0;
    roomData.potInfo.potList = [];
}
