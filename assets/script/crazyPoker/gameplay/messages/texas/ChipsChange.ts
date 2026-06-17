import { ServerMessageChipsChange } from '../../../../protobuf/holdem/recv_th_chips_change_pb';
import { Def } from '../../../../protobuf/holdem/define_pb';
import { StringHelper } from '../../../../helper/StringHelper';
import { i18nMgr } from '../../../../i18n/i18nMgr';
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
            // CC_NONE + change>0 表示即时到账的补充筹码广播
            // 文案对齐 Unity SetUCBringInTips(true, change)：弹"完成带入 XX UC"，金额用 change（增量）
            // "下一手前完成带入"的提示由 Protocol_Holdem_BringIn 响应负责（HANDLER_REQ_GAME_ADD_CHIPS）
            if (changeData.reason === Def.ChipChangeReason.CC_NONE && changeData.change > 0) {
                UIComponent.Instance.Toast(
                    StringHelper.FormatString(
                        i18nMgr.Get('UIGameplay_UCRechargeBringin'),
                        StringHelper.GetLongStringLocale(changeData.change, 1, 0)
                    )
                );
            }
        }
    })
}
