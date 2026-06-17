import { ServerMessageChipsChange } from '../../../../protobuf/holdem/recv_th_chips_change_pb';
import { Def } from '../../../../protobuf/holdem/define_pb';
import UIComponent from '../../../../ui/UIComponent';
import roomDataManager from '../../common/core/RoomDataManager';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';

// ChipsChange 1107
export function ChipsChange(data: ServerMessageChipsChange.AsObject, roomID: number, matchID: number) {
    let roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    data.changesList.forEach(changeData => {
        let seatData = roomData.seatsStateManager.getSeatPlayer(changeData.seatId);
        seatData.chip = changeData.chips;
        seatData.deposit += changeData.depositChange;
        if (seatData.mine) {
            seatData.mine.storeChips = changeData.storeChips;
            if (changeData.reason === Def.ChipChangeReason.CC_NONE && changeData.change > 0) {
                UIComponent.Instance.ToastLanguage('UIGameplay_UCRechargeBringinAfter');
            }
        }
    })
}
