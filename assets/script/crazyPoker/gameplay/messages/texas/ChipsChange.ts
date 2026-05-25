import { ServerMessageChipsChange } from '../../../../protobuf/holdem/recv_th_chips_change_pb';
import roomDataManager from '../../common/core/RoomDataManager';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';

// ChipsChange 1107
export default function ChipsChange(data: ServerMessageChipsChange.AsObject, roomID: number, matchID: number) {
    let roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    data.changesList.forEach(changeData => {
        let seatData = roomData.seatsStateManager.getSeatPlayer(changeData.seatId);
        seatData.chip = changeData.chips;
        seatData.deposit += changeData.depositChange;
        if (seatData.isMine) {
            seatData.getMine().storeChips = changeData.storeChips;
        }
    })
}
