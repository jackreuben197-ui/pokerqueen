import { ServerMessageActionAll } from '../../../../protobuf/holdem/recv_th_action_all_pb';
import roomDataManager from '../../common/core/RoomDataManager';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';

// ActionAll 1108
export default function ActionAll(data: ServerMessageActionAll.AsObject, roomID: number, matchID: number) {
    const roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    roomData.potInfo.allPot = data.allBet;
}
