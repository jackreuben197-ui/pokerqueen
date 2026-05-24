import { ServerMessageActionAll } from '../../../../protobuf/holdem/recv_th_action_all_pb';
import roomDataManager from '../../common/core/RoomDataManager';
import { AnimateDisplayTypeAction, AnimateDisplayTypeRoundBet } from '../../texas/constants/AnimateDisplayType';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';
import Action from './Action';

// ActionAll 1108
export default function ActionAll(data: ServerMessageActionAll.AsObject, roomID: number, matchID: number) {
    const roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    const seatPlayer = roomData.seatsStateManager.getSeatPlayer(data.operatorSeatId);
    seatPlayer.setAction(data.action, AnimateDisplayTypeAction.ShowAction);
    seatPlayer.chip = data.leftChips;
    seatPlayer.setRoundBet(data.roundBet, AnimateDisplayTypeRoundBet.PutNear);
    roomData.potInfo.allPot += data.amount;
}
