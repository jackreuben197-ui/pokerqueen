import { ServerMessageSidePots } from '../../../../protobuf/holdem/recv_th_side_pots_pb';
import roomDataManager from '../../common/core/RoomDataManager';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';

// SidePots 1105
export default function SidePots(data: ServerMessageSidePots.AsObject, roomID: number, matchID: number) {
    const roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    roomData.potInfo.potList = data.potsList;
}
