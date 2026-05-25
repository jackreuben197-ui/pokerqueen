import { ServerMessageEnterRoom } from '../../../../protobuf/holdem/req_th_enter_room_pb';
import roomDataManager from '../../common/core/RoomDataManager';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';
import SceneManager from '../../../../manager/SceneManager';
import { UIDefine } from '../../../../define/UIDefine';
import UIComponent, { PrefabUI } from '../../../../ui/UIComponent';
import { UIRoomTexasEnterParam } from '../../common/view/room/texas/UIRoomTexas';
import { AnimateDisplayTypeAction, AnimateDisplayTypeButton, AnimateDisplayTypeCards, AnimateDisplayTypePublicCards, AnimateDisplayTypeRoundBet } from '../../texas/constants/AnimateDisplayType';
import TexasGameRoomDataPlayer from '../../texas/data/TexasGameRoomDataPlayer';
import TexasGameRoomDataPlayerMine from '../../texas/data/TexasGameRoomDataPlayerMine';
import { Def, SidePot } from '../../../../protobuf/holdem/define_pb';
import { Operator, OperatorMine } from '../../texas/data/model/Operator';
const LN = '[EnterRoom]';

// EnterRoom 1002
export default async function EnterRoom(data: ServerMessageEnterRoom.AsObject, roomID: number, matchID: number): Promise<void> {
    let roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    if (!roomData && matchID > 0) {
        roomData = roomDataManager.getRoomData<TexasGameRoomData>(0, matchID);
        if (roomData) roomData.roomID = roomID;
        roomDataManager.deleteRoomData(0, matchID);
        roomDataManager.setRoomData(roomID, matchID, roomData);
    }
    if (!roomData) {
        console.error(LN, 'no store room data');
        return;
    }
    UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
    if (data.status == 0) {
        roomData.basicInfo.sbante = { sb: data.roomInfo.smallBlind, ante: data.roomInfo.ante };
        roomData.basicInfo.gameStatus = data.gameStatus;
        roomData.basicInfo.opDuration = data.roomInfo.opDuration;
        if (data.handInfo) {
            roomData.basicInfo.handNum = data.handInfo.handNum;
            roomData.potInfo.allPot = data.handInfo.allBet;
            roomData.potInfo.potList = data.handInfo.potsList;
            roomData.potInfo.secPotList =data.handInfo.secondPotsList;
            roomData.seatsStateManager.setButtonPosition(data.handInfo.buSeatId, AnimateDisplayTypeButton.Static);
            roomData.publicCards.addPublicCards(data.handInfo.publicCardsList, AnimateDisplayTypePublicCards.Static);
            roomData.publicCards.addSecondPublicCards(data.handInfo.secondPublicCardsList, AnimateDisplayTypePublicCards.Static);
        }
        data.playersList.forEach((player) => {
            let seatData = roomData.seatsStateManager.getSeatPlayer(player.seatId);
            seatData.name = player.name;
            seatData.userID = player.userRid;
            seatData.avatar = player.avatar;
            seatData.chip = player.chip;
            seatData.setRoundBet(player.roundBet, AnimateDisplayTypeRoundBet.Static);
            seatData.handBet = player.handBet;
            seatData.roundActioned = player.roundActioned;
            seatData.updateCards(player.cardsList, AnimateDisplayTypeCards.Static);
            seatData.setAction(player.action, AnimateDisplayTypeAction.Static);
            seatData.deposit = player.deposit;
        })
        let mine:TexasGameRoomDataPlayerMine = null;
        if (data.myInfo) {
            if (data.myInfo.seatId > 0) {
                roomData.seatsStateManager.setMySeat(data.myInfo.seatId);
                mine = roomData.seatsStateManager.getMine();
                mine.storeChips = mine.storeChips;
            }
        }
        data.operatorList.forEach(operator => {
            if (mine && operator.seatId == mine.seatedPlayer.seatNo) {
                //@TODO 本人操作的准备
                let seatData = roomData.seatsStateManager.getSeatPlayer(operator.seatId);
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
                seatData.prepareOperation(op);
            }else{
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
        })
        await SceneManager.Instance.switchScene<UIRoomTexasEnterParam>(UIDefine.UIRoomTexas, null, {
            roomID: roomID,
            matchID: matchID,
            observer: false
        });
    }
}
