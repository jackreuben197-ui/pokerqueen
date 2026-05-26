import { ServerMessageShowcards } from '../../../../protobuf/holdem/recv_th_showcards_pb';
import roomDataManager from '../../common/core/RoomDataManager';
import { AnimateDisplayTypeCards } from '../../texas/constants/AnimateDisplayType';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';

// Showcards 1101
export function Showcards(data: ServerMessageShowcards.AsObject, roomID: number, matchID: number) {
    const roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    data.playerCardsList.forEach(v => {
        const seat = roomData.seatsStateManager.getSeatPlayer(v.seatId);
        seat.updateCards(v.cardsList, AnimateDisplayTypeCards.ShowCards);
    });
}
