import { ServerMessagePublicCards } from '../../../../protobuf/holdem/recv_th_public_cards_pb';
import roomDataManager from '../../common/core/RoomDataManager';
import { AnimateDisplayTypePublicCards } from '../../texas/constants/AnimateDisplayType';
import { Operator } from '../../texas/data/model/Operator';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';

// PublicCards 1104
export default function PublicCards(data: ServerMessagePublicCards.AsObject, roomID: number, matchID: number) {
    const roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    roomData.publicCards.addPublicCards(data.publicCardsArrayList, AnimateDisplayTypePublicCards.Deal);
    if (data.publicCardsArray2List.length > 0) {
        roomData.publicCards.addSecondPublicCards(data.publicCardsArray2List, AnimateDisplayTypePublicCards.Deal);
    }else if (data.extPublicCardsArrayList.length > 0) {
        roomData.publicCards.addSecondPublicCards(data.extPublicCardsArrayList, AnimateDisplayTypePublicCards.Deal);
    }
    if (data.nextOperator) {
        const operator = data.nextOperator;
        let seatData = roomData.seatsStateManager.getSeatPlayer(operator.seatId);
        let op = new Operator();
        op.alreadyDelayTImes = operator.delayTimes;
        op.deadlineTImestamp = operator.opDeadline;
        op.leftOpDuration = operator.leftOpTime;
        op.totalOpDuration = roomData.basicInfo.opDuration;
        if (operator.isInsurance) {
            op.opType = 2;
        }else if (operator.isAgreeSecondPc) {
            op.opType = 3;
        }else {
            op.opType = 1;
        }
        seatData.prepareOperation(op);
    }
}
