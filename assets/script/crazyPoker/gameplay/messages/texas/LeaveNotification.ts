import { ProcedureEnum } from '../../../../define/EIDefine';
import ProcedureManager from '../../../../manager/ProcedureManager';
import { ProcedureReturnNavigateParam } from '../../../../procedure/ProcedureReturn';
import { Def } from '../../../../protobuf/holdem/define_pb';
import { ServerMessageLeaveNotification } from '../../../../protobuf/holdem/recv_th_leave_notification_pb';
import roomDataManager from '../../common/core/RoomDataManager';
import { GamePlaySubType } from '../../texas/constants/Constants';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';

const LN = 'LeaveNotification';
// LeaveNotification 1114
export default function LeaveNotification(data: ServerMessageLeaveNotification.AsObject, roomID: number, matchID: number) {
    const roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    console.log(LN, 'leave', data.reason);
    switch (data.reason) {
        case Def.LeaveReason.LR_ACTIVE: // 主动退出
            break;
        case Def.LeaveReason.LR_GAME_END: // 游戏结束
            {
                if (!roomData.basicInfo.isMtt) {
                    const gamePlaySubType = roomData.basicInfo.squidEnabled
                        ? GamePlaySubType.SQUID
                        : roomData.basicInfo.mushroomEnabled
                            ? GamePlaySubType.MUSH
                            : GamePlaySubType.NONE;

                    const param :ProcedureReturnNavigateParam = {
                        routeData: {
                            path: '/tableGameEnd',
                            query: {
                                gamePlaySubType,
                                roomId:roomID,
                                from: 'cocos',
                                reason: data.reason,
                                roomName: roomData.basicInfo.roomName,
                                gameType: roomData.basicInfo.gameType,
                                betType: roomData.basicInfo.betType,
                                pokerType: roomData.basicInfo.pokerType,
                            },
                            replace: false,
                            ensureVisible: true
                        }
                    }
                    console.log(LN, '[game-end] queue h5 navigate after exit cleanup', param);
                    ProcedureManager.StartProcedure<ProcedureReturnNavigateParam>(ProcedureEnum.Return, param);
                    break;
                }
                ProcedureManager.StartProcedure(ProcedureEnum.Return);
            }
            break;
        // case Def.LeaveReason.LR_AUTO_EXCEED_MAX_TIMES: // 超过最大自动操作次数限制
        //     break;
        // case Def.LeaveReason.LR_FORCE: // 强制退出
        //     break;
        // case Def.LeaveReason.LR_OFFLINE: // 离线
        //     break;
        default:
            ProcedureManager.StartProcedure(ProcedureEnum.Return);
    }
    //UIComponent.Instance.Toast(i18nMgr.Get(`LeaveReason${data.reason}`));
}
