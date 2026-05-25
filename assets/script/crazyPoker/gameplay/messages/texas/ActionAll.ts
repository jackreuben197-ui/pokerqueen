import { ServerMessageActionAll } from '../../../../protobuf/holdem/recv_th_action_all_pb';
import roomDataManager from '../../common/core/RoomDataManager';
import { AnimateDisplayTypeAction, AnimateDisplayTypeRoundBet } from '../../texas/constants/AnimateDisplayType';
import { Operator, OperatorMine } from '../../texas/data/model/Operator';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';
import Action from './Action';

// ActionAll 1108
export default function ActionAll(data: ServerMessageActionAll.AsObject, roomID: number, matchID: number) {
    const roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    const seatPlayer = roomData.seatsStateManager.getSeatPlayer(data.operatorSeatId);
    seatPlayer.setAction(data.action, AnimateDisplayTypeAction.Done);
    seatPlayer.chip = data.leftChips;
    seatPlayer.setRoundBet(seatPlayer.roundBet+data.amount, AnimateDisplayTypeRoundBet.PutNear);
    //所有下注
    roomData.potInfo.allPot = data.allBet;
    //当前轮的最大投注
    roomData.roundState.roundBet = data.roundBet;
    if (data.nextOperator) {
        const operator = data.nextOperator;
        let seatData = roomData.seatsStateManager.getSeatPlayer(operator.seatId);
        if (seatData.isMine) {
            let op = new OperatorMine();
            op.alreadyDelayTImes = operator.delayTimes;
            op.deadlineTImestamp = operator.opDeadline;
            op.leftOpDuration = operator.leftOpTime;
            op.totalOpDuration = roomData.basicInfo.opDuration;
            op.actionLimitList = operator.actionsList;
            op.insurancePotInvalidList = operator.invalidInsurancePotsList;
            op.insurancePotLimitList = operator.insuranceLimitList;
            op.playerCardsList = operator.playerCardsList;
            if (operator.isInsurance) {
                op.opType = 2;
            }else if (operator.isAgreeSecondPc) {
                op.opType = 3;
            }else {
                op.opType = 1;
            }
            let mine = roomData.seatsStateManager.getMine();
            mine.prepareOperation(op);
        }else{
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
}
