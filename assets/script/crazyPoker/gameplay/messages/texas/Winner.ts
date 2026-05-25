import { ServerMessageWinner } from '../../../../protobuf/holdem/recv_th_winner_pb';
import roomDataManager from '../../common/core/RoomDataManager';
import { AnimateDisplayTypeCards } from '../../texas/constants/AnimateDisplayType';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';

// Winner 1112
export default function Winner(data: ServerMessageWinner.AsObject, roomID: number, matchID: number) {
    const roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    data.resultsList.forEach(result => {
        const seatData = roomData.seatsStateManager.getSeatPlayer(result.seatId);
        // 已经站起
        if (seatData.userID == 0 || result.standUp) return;
        // 更新筹码
        seatData.chip = result.chip;
        seatData.deposit = result.deposit;
        seatData.updateCards(result.myCardsList, AnimateDisplayTypeCards.ShowCards);
        if (result.win - result.handBet > 0) {
            seatData.claimWin();
        }
        if (seatData.isMine) {
            let mine = seatData.getMine();
            let pubH: number[] = [];
            let pub2H: number[]= [];
            let myCardsH: number[] = [];
            result.winCardsList.forEach(v => {
                if (v.isPublic) {
                    pubH.push(v.card);
                }else{
                    myCardsH.push(v.card)
                }
            })
            result.winCards2List.forEach(v => {
                if (v.isPublic) {
                    pub2H.push(v.card);
                }
            })
            mine.highlightCards(myCardsH);
            roomData.publicCards.higlightPublicards(pubH);
            roomData.publicCards.higlightSecondPublicCards(pub2H);
        }
    })
}
