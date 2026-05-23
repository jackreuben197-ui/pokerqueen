import { Code } from '../../../../protobuf/holdem/code_pb';
import EnterRoom from './EnterRoom';
import Seated from './Seated';
import BringIn from './BringIn';
import ReadyStart from './ReadyStart';
import WinrateAdd from './WinrateAdd';
import TributeGive from './TributeGive';
import TributeReturn from './TributeReturn';
import Action from './Action';
import AutoOpActive from './AutoOpActive';
import StandupActive from './StandupActive';
import Leave from './Leave';
import KeepSeatActive from './KeepSeatActive';
import AddTime from './AddTime';
import BroadcastMsg from './BroadcastMsg';
import PrivateMsg from './PrivateMsg';
import Roomers from './Roomers';
import SetAutoOnTable from './SetAutoOnTable';
import Observers from './Observers';
import SyncEnter from './SyncEnter';
import Replay from './Replay';
import ChatMembers from './ChatMembers';
import SeatedOthers from './SeatedOthers';
import StartInfo from './StartInfo';
import WinrateAddComplete from './WinrateAddComplete';
import TributeGiveComplete from './TributeGiveComplete';
import TributeReturnComplete from './TributeReturnComplete';
import ChipsChange from './ChipsChange';
import ActionAll from './ActionAll';
import AutoOp from './AutoOp';
import Standup from './Standup';
import KeepSeat from './KeepSeat';
import Result from './Result';
import AddTimeOthers from './AddTimeOthers';
import LeaveNotification from './LeaveNotification';
import BringInFail from './BringInFail';
import HandClear from './HandClear';
import GetMsg from './GetMsg';
import ReadyStartAll from './ReadyStartAll';
import WaitReadyStart from './WaitReadyStart';
import VideoMaskChange from './VideoMaskChange';

export default class GuandanMessageHandler {

    public static handle(code: number, data: any, roomID: number, matchID: number) {
        switch (code) {
            case Code.MSG_D_GD_ENTER_ROOM:
                EnterRoom(data, roomID, matchID);
                break; // EnterRoom 4001
            case Code.MSG_D_GD_SEATED:
                Seated(data, roomID, matchID);
                break; // Seated 4002
            case Code.MSG_D_GD_BRING_IN:
                BringIn(data, roomID, matchID);
                break; // BringIn 4003
            case Code.MSG_D_GD_READY_START:
                ReadyStart(data, roomID, matchID);
                break; // ReadyStart 4004
            case Code.MSG_D_GD_WINRATE_ADD:
                WinrateAdd(data, roomID, matchID);
                break; // WinrateAdd 4005
            case Code.MSG_D_GD_TRIBUTE_GIVE:
                TributeGive(data, roomID, matchID);
                break; // TributeGive 4006
            case Code.MSG_D_GD_TRIBUTE_RETURN:
                TributeReturn(data, roomID, matchID);
                break; // TributeReturn 4007
            case Code.MSG_D_GD_ACTION:
                Action(data, roomID, matchID);
                break; // Action 4008
            case Code.MSG_D_GD_AUTO_OP_ACTIVE:
                AutoOpActive(data, roomID, matchID);
                break; // AutoOpActive 4009
            case Code.MSG_D_GD_STANDUP_ACTIVE:
                StandupActive(data, roomID, matchID);
                break; // StandupActive 4010
            case Code.MSG_D_GD_LEAVE:
                Leave(data, roomID, matchID);
                break; // Leave 4011
            case Code.MSG_D_GD_KEEP_SEAT_ACTIVE:
                KeepSeatActive(data, roomID, matchID);
                break; // KeepSeatActive 4012
            case Code.MSG_D_GD_ADD_TIME:
                AddTime(data, roomID, matchID);
                break; // AddTime 4013
            case Code.MSG_D_GD_BROADCAST_MSG:
                BroadcastMsg(data, roomID, matchID);
                break; // BroadcastMsg 4014
            case Code.MSG_D_GD_PRIVATE_MSG:
                PrivateMsg(data, roomID, matchID);
                break; // PrivateMsg 4015
            case Code.MSG_D_GD_ROOMERS:
                Roomers(data, roomID, matchID);
                break; // Roomers 4016
            case Code.MSG_D_GD_SET_AUTO_ON_TABLE:
                SetAutoOnTable(data, roomID, matchID);
                break; // SetAutoOnTable 4017
            case Code.MSG_D_GD_OBSERVERS:
                Observers(data, roomID, matchID);
                break; // Observers 4018
            case Code.MSG_D_GD_SYNC_ENTER:
                SyncEnter(data, roomID, matchID);
                break; // SyncEnter 4019
            case Code.MSG_D_GD_REPLAY:
                Replay(data, roomID, matchID);
                break; // Replay 4020
            case Code.MSG_D_GD_CHAT_MEMBERS:
                ChatMembers(data, roomID, matchID);
                break; // ChatMembers 4021
            case Code.MSG_S_GD_SEATED_OTHERS:
                SeatedOthers(data, roomID, matchID);
                break; // SeatedOthers 4101
            case Code.MSG_S_GD_START_INFO:
                StartInfo(data, roomID, matchID);
                break; // StartInfo 4102
            case Code.MSG_S_GD_WINRATE_ADD_COMPLETE:
                WinrateAddComplete(data, roomID, matchID);
                break; // WinrateAddComplete 4103
            case Code.MSG_S_GD_TRIBUTE_GIVE_COMPLETE:
                TributeGiveComplete(data, roomID, matchID);
                break; // TributeGiveComplete 4104
            case Code.MSG_S_GD_TRIBUTE_RETURN_COMPLETE:
                TributeReturnComplete(data, roomID, matchID);
                break; // TributeReturnComplete 4105
            case Code.MSG_S_GD_CHIPS_CHANGE:
                ChipsChange(data, roomID, matchID);
                break; // ChipsChange 4106
            case Code.MSG_S_GD_ACTION_ALL:
                ActionAll(data, roomID, matchID);
                break; // ActionAll 4107
            case Code.MSG_S_GD_AUTO_OP:
                AutoOp(data, roomID, matchID);
                break; // AutoOp 4108
            case Code.MSG_S_GD_STANDUP:
                Standup(data, roomID, matchID);
                break; // Standup 4109
            case Code.MSG_S_GD_KEEP_SEAT:
                KeepSeat(data, roomID, matchID);
                break; // KeepSeat 4110
            case Code.MSG_S_GD_RESULT:
                Result(data, roomID, matchID);
                break; // Result 4111
            case Code.MSG_S_GD_ADD_TIME_OTHERS:
                AddTimeOthers(data, roomID, matchID);
                break; // AddTimeOthers 4112
            case Code.MSG_S_GD_LEAVE_NOTIFICATION:
                LeaveNotification(data, roomID, matchID);
                break; // LeaveNotification 4113
            case Code.MSG_S_GD_BRING_IN_FAIL:
                BringInFail(data, roomID, matchID);
                break; // BringInFail 4114
            case Code.MSG_S_GD_HAND_CLEAR:
                HandClear(data, roomID, matchID);
                break; // HandClear 4115
            case Code.MSG_S_GD_GET_MSG:
                GetMsg(data, roomID, matchID);
                break; // GetMsg 4116
            case Code.MSG_S_GD_READY_START_ALL:
                ReadyStartAll(data, roomID, matchID);
                break; // ReadyStartAll 4117
            case Code.MSG_S_GD_WAIT_READY_START:
                WaitReadyStart(data, roomID, matchID);
                break; // WaitReadyStart 4118
            case Code.MSG_S_GD_VIDEO_MASK_CHANGE:
                VideoMaskChange(data, roomID, matchID);
                break; // VideoMaskChange 4119
        }
    }
}
