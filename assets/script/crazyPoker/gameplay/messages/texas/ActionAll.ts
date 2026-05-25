import { ServerMessageActionAll } from '../../../../protobuf/holdem/recv_th_action_all_pb';
import roomDataManager from '../../common/core/RoomDataManager';
import { AnimateDisplayTypeAction, AnimateDisplayTypeRoundBet } from '../../texas/constants/AnimateDisplayType';
import { Operator } from '../../texas/data/model/Operator';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';
import Action from './Action';

// ActionAll 1108
export default function ActionAll(data: ServerMessageActionAll.AsObject, roomID: number, matchID: number) {
    const roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    const seatPlayer = roomData.seatsStateManager.getSeatPlayer(data.operatorSeatId);
    seatPlayer.setAction(data.action, AnimateDisplayTypeAction.Done);
    seatPlayer.chip = data.leftChips;
    seatPlayer.setRoundBet(seatPlayer.roundBet+data.amount, AnimateDisplayTypeRoundBet.PutNear);
    roomData.potInfo.allPot += data.amount;
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
