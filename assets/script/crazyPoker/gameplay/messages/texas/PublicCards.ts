import { ServerMessagePublicCards } from '../../../../protobuf/holdem/recv_th_public_cards_pb';
import roomDataManager from '../../common/core/RoomDataManager';
import { AnimateDisplayTypePublicCards } from '../../texas/constants/AnimateDisplayType';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';

// PublicCards 1104
export function PublicCards(data: ServerMessagePublicCards.AsObject, roomID: number, matchID: number) {
    const roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    roomData.publicCards.addPublicCards(data.publicCardsArrayList, AnimateDisplayTypePublicCards.Deal);
    if (data.publicCardsArray2List.length > 0) {
        roomData.publicCards.addSecondPublicCards(data.publicCardsArray2List, AnimateDisplayTypePublicCards.Deal);
    } else if (data.extPublicCardsArrayList.length > 0) {
        roomData.publicCards.addSecondPublicCards(data.extPublicCardsArrayList, AnimateDisplayTypePublicCards.Deal);
    }
}
