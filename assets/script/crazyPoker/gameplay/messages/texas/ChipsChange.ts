import { ServerMessageChipsChange } from '../../../../protobuf/holdem/recv_th_chips_change_pb';
import { Def } from '../../../../protobuf/holdem/define_pb';
import { GameCache } from '../../../../game/GameCache';
import roomDataManager from '../../common/core/RoomDataManager';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';

// ChipsChange 1107
export function ChipsChange(data: ServerMessageChipsChange.AsObject, roomID: number, matchID: number) {
    console.log('[ChipsChange-新路径] 被调用 | roomID=' + roomID + ', matchID=' + matchID);
    let roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    data.changesList.forEach(changeData => {
        let seatData = roomData.seatsStateManager.getSeatPlayer(changeData.seatId);
        seatData.chip = changeData.chips;
        seatData.deposit += changeData.depositChange;
        if (seatData.mine) {
            seatData.mine.storeChips = changeData.storeChips;
            // CC_NONE + change>0 表示即时到账的补充筹码广播，对齐 Unity SetUCBringInTips(true, change)
            if (changeData.reason === Def.ChipChangeReason.CC_NONE && changeData.change > 0) {
                console.log('[ChipsChange-新路径] SetUCBringInTips | change=' + changeData.change);
                GameCache.Instance.CurGame?.SetUCBringInTips(true, changeData.change);
            }
        }
    })
}
