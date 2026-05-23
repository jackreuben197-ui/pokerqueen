import { Code } from '../../../../protobuf/holdem/code_pb';
import EnterRoom from './EnterRoom';
import Seated from './Seated';
import BringIn from './BringIn';
import Action from './Action';
import AutoOpActive from './AutoOpActive';
import StandupActive from './StandupActive';
import Leave from './Leave';
import KeepSeatActive from './KeepSeatActive';
import AddTime from './AddTime';
import PublicReplay from './PublicReplay';
import BroadcastMsg from './BroadcastMsg';
import PrivateMsg from './PrivateMsg';
import Roomers from './Roomers';
import SetAutoOnTable from './SetAutoOnTable';
import Pair from './Pair';
import Observers from './Observers';
import SyncEnter from './SyncEnter';
import ChatMembers from './ChatMembers';
import SeatedOthers from './SeatedOthers';
import StartInfo from './StartInfo';
import PublicCards from './PublicCards';
import ChipsChange from './ChipsChange';
import ActionAll from './ActionAll';
import AutoOp from './AutoOp';
import Standup from './Standup';
import KeepSeat from './KeepSeat';
import Winner from './Winner';
import AddTimeOthers from './AddTimeOthers';
import LeaveNotification from './LeaveNotification';
import BringInFail from './BringInFail';
import HandClear from './HandClear';
import GetMsg from './GetMsg';
import PairAll from './PairAll';
import VideoMaskChange from './VideoMaskChange';

export default class FantasyMessageHandler {

    public static handle(code: number, data: any, roomID: number, matchID: number) {
        switch (code) {
            case Code.MSG_D_FT_ENTER_ROOM:
                EnterRoom(data, roomID, matchID);
                break; // EnterRoom 1202
            case Code.MSG_D_FT_SEATED:
                Seated(data, roomID, matchID);
                break; // Seated 1203
            case Code.MSG_D_FT_BRING_IN:
                BringIn(data, roomID, matchID);
                break; // BringIn 1204
            case Code.MSG_D_FT_ACTION:
                Action(data, roomID, matchID);
                break; // Action 1205
            case Code.MSG_D_FT_AUTO_OP_ACTIVE:
                AutoOpActive(data, roomID, matchID);
                break; // AutoOpActive 1206
            case Code.MSG_D_FT_STANDUP_ACTIVE:
                StandupActive(data, roomID, matchID);
                break; // StandupActive 1207
            case Code.MSG_D_FT_LEAVE:
                Leave(data, roomID, matchID);
                break; // Leave 1208
            case Code.MSG_D_FT_KEEP_SEAT_ACTIVE:
                KeepSeatActive(data, roomID, matchID);
                break; // KeepSeatActive 1209
            case Code.MSG_D_FT_ADD_TIME:
                AddTime(data, roomID, matchID);
                break; // AddTime 1210
            case Code.MSG_D_FT_PUBLIC_REPLAY:
                PublicReplay(data, roomID, matchID);
                break; // PublicReplay 1211
            case Code.MSG_D_FT_BROADCAST_MSG:
                BroadcastMsg(data, roomID, matchID);
                break; // BroadcastMsg 1212
            case Code.MSG_D_FT_PRIVATE_MSG:
                PrivateMsg(data, roomID, matchID);
                break; // PrivateMsg 1213
            case Code.MSG_D_FT_ROOMERS:
                Roomers(data, roomID, matchID);
                break; // Roomers 1214
            case Code.MSG_D_FT_SET_AUTO_ON_TABLE:
                SetAutoOnTable(data, roomID, matchID);
                break; // SetAutoOnTable 1215
            case Code.MSG_D_FT_PAIR:
                Pair(data, roomID, matchID);
                break; // Pair 1216
            case Code.MSG_D_FT_OBSERVERS:
                Observers(data, roomID, matchID);
                break; // Observers 1217
            case Code.MSG_D_FT_SYNC_ENTER:
                SyncEnter(data, roomID, matchID);
                break; // SyncEnter 1218
            case Code.MSG_D_FT_CHAT_MEMBERS:
                ChatMembers(data, roomID, matchID);
                break; // ChatMembers 1219
            case Code.MSG_S_FT_SEATED_OTHERS:
                SeatedOthers(data, roomID, matchID);
                break; // SeatedOthers 1301
            case Code.MSG_S_FT_START_INFO:
                StartInfo(data, roomID, matchID);
                break; // StartInfo 1302
            case Code.MSG_S_FT_PUBLIC_CARDS:
                PublicCards(data, roomID, matchID);
                break; // PublicCards 1303
            case Code.MSG_S_FT_CHIPS_CHANGE:
                ChipsChange(data, roomID, matchID);
                break; // ChipsChange 1304
            case Code.MSG_S_FT_ACTION_ALL:
                ActionAll(data, roomID, matchID);
                break; // ActionAll 1305
            case Code.MSG_S_FT_AUTO_OP:
                AutoOp(data, roomID, matchID);
                break; // AutoOp 1306
            case Code.MSG_S_FT_STANDUP:
                Standup(data, roomID, matchID);
                break; // Standup 1307
            case Code.MSG_S_FT_KEEP_SEAT:
                KeepSeat(data, roomID, matchID);
                break; // KeepSeat 1308
            case Code.MSG_S_FT_WINNER:
                Winner(data, roomID, matchID);
                break; // Winner 1309
            case Code.MSG_S_FT_ADD_TIME_OTHERS:
                AddTimeOthers(data, roomID, matchID);
                break; // AddTimeOthers 1310
            case Code.MSG_S_FT_LEAVE_NOTIFICATION:
                LeaveNotification(data, roomID, matchID);
                break; // LeaveNotification 1311
            case Code.MSG_S_FT_BRING_IN_FAIL:
                BringInFail(data, roomID, matchID);
                break; // BringInFail 1313
            case Code.MSG_S_FT_HAND_CLEAR:
                HandClear(data, roomID, matchID);
                break; // HandClear 1314
            case Code.MSG_S_FT_GET_MSG:
                GetMsg(data, roomID, matchID);
                break; // GetMsg 1315
            case Code.MSG_S_FT_PAIR_ALL:
                PairAll(data, roomID, matchID);
                break; // PairAll 1316
            case Code.MSG_S_FT_VIDEO_MASK_CHANGE:
                VideoMaskChange(data, roomID, matchID);
                break; // VideoMaskChange 1317
        }
    }
}
