import { Code } from '../../../../protobuf/holdem/code_pb';
import EnterRoom from './EnterRoom';
import Seated from './Seated';
import BringIn from './BringIn';
import ExchangeTiles from './ExchangeTiles';
import VoidSuit from './VoidSuit';
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
import Raise from './Raise';
import RejectBringIn from './RejectBringIn';
import SeatedOthers from './SeatedOthers';
import StartInfo from './StartInfo';
import ExchangeTilesComplete from './ExchangeTilesComplete';
import VoidSuitComplete from './VoidSuitComplete';
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
import WaitTurnAction from './WaitTurnAction';
import ActionFail from './ActionFail';
import Prepare from './Prepare';
import RaiseComplete from './RaiseComplete';
import FollowDealer from './FollowDealer';
import NeedBringIn from './NeedBringIn';
import NeedBringInComplete from './NeedBringInComplete';
import VideoMaskChange from './VideoMaskChange';
import UpBlind from './UpBlind';
import SyncHand from './SyncHand';

export default class MahjongMessageHandler {
    public static handle(code: number, data: any, roomID: number, matchID: number) {
        switch (code) {
        case Code.MSG_D_MJ_ENTER_ROOM: EnterRoom(data, roomID, matchID); break; // EnterRoom 3001
        case Code.MSG_D_MJ_SEATED: Seated(data, roomID, matchID); break; // Seated 3002
        case Code.MSG_D_MJ_BRING_IN: BringIn(data, roomID, matchID); break; // BringIn 3003
        case Code.MSG_D_MJ_EXCHANGE_TILES: ExchangeTiles(data, roomID, matchID); break; // ExchangeTiles 3004
        case Code.MSG_D_MJ_VOID_SUIT: VoidSuit(data, roomID, matchID); break; // VoidSuit 3005
        case Code.MSG_D_MJ_ACTION: Action(data, roomID, matchID); break; // Action 3006
        case Code.MSG_D_MJ_AUTO_OP_ACTIVE: AutoOpActive(data, roomID, matchID); break; // AutoOpActive 3007
        case Code.MSG_D_MJ_STANDUP_ACTIVE: StandupActive(data, roomID, matchID); break; // StandupActive 3008
        case Code.MSG_D_MJ_LEAVE: Leave(data, roomID, matchID); break; // Leave 3009
        case Code.MSG_D_MJ_KEEP_SEAT_ACTIVE: KeepSeatActive(data, roomID, matchID); break; // KeepSeatActive 3010
        case Code.MSG_D_MJ_ADD_TIME: AddTime(data, roomID, matchID); break; // AddTime 3011
        case Code.MSG_D_MJ_BROADCAST_MSG: BroadcastMsg(data, roomID, matchID); break; // BroadcastMsg 3012
        case Code.MSG_D_MJ_PRIVATE_MSG: PrivateMsg(data, roomID, matchID); break; // PrivateMsg 3013
        case Code.MSG_D_MJ_ROOMERS: Roomers(data, roomID, matchID); break; // Roomers 3014
        case Code.MSG_D_MJ_SET_AUTO_ON_TABLE: SetAutoOnTable(data, roomID, matchID); break; // SetAutoOnTable 3015
        case Code.MSG_D_MJ_OBSERVERS: Observers(data, roomID, matchID); break; // Observers 3016
        case Code.MSG_D_MJ_SYNC_ENTER: SyncEnter(data, roomID, matchID); break; // SyncEnter 3017
        case Code.MSG_D_MJ_REPLAY: Replay(data, roomID, matchID); break; // Replay 3018
        case Code.MSG_D_MJ_CHAT_MEMBERS: ChatMembers(data, roomID, matchID); break; // ChatMembers 3019
        case Code.MSG_D_MJ_RAISE: Raise(data, roomID, matchID); break; // Raise 3020
        case Code.MSG_D_MJ_REJECT_BRING_IN: RejectBringIn(data, roomID, matchID); break; // RejectBringIn 3021
        case Code.MSG_S_MJ_SEATED_OTHERS: SeatedOthers(data, roomID, matchID); break; // SeatedOthers 3051
        case Code.MSG_S_MJ_START_INFO: StartInfo(data, roomID, matchID); break; // StartInfo 3052
        case Code.MSG_S_MJ_EXCHANGE_TILES_COMPLETE: ExchangeTilesComplete(data, roomID, matchID); break; // ExchangeTilesComplete 3053
        case Code.MSG_S_MJ_VOID_SUIT_COMPLETE: VoidSuitComplete(data, roomID, matchID); break; // VoidSuitComplete 3054
        case Code.MSG_S_MJ_CHIPS_CHANGE: ChipsChange(data, roomID, matchID); break; // ChipsChange 3055
        case Code.MSG_S_MJ_ACTION_ALL: ActionAll(data, roomID, matchID); break; // ActionAll 3056
        case Code.MSG_S_MJ_AUTO_OP: AutoOp(data, roomID, matchID); break; // AutoOp 3057
        case Code.MSG_S_MJ_STANDUP: Standup(data, roomID, matchID); break; // Standup 3058
        case Code.MSG_S_MJ_KEEP_SEAT: KeepSeat(data, roomID, matchID); break; // KeepSeat 3059
        case Code.MSG_S_MJ_RESULT: Result(data, roomID, matchID); break; // Result 3060
        case Code.MSG_S_MJ_ADD_TIME_OTHERS: AddTimeOthers(data, roomID, matchID); break; // AddTimeOthers 3061
        case Code.MSG_S_MJ_LEAVE_NOTIFICATION: LeaveNotification(data, roomID, matchID); break; // LeaveNotification 3062
        case Code.MSG_S_MJ_BRING_IN_FAIL: BringInFail(data, roomID, matchID); break; // BringInFail 3063
        case Code.MSG_S_MJ_HAND_CLEAR: HandClear(data, roomID, matchID); break; // HandClear 3064
        case Code.MSG_S_MJ_GET_MSG: GetMsg(data, roomID, matchID); break; // GetMsg 3065
        case Code.MSG_S_MJ_WAIT_TURN_ACTION: WaitTurnAction(data, roomID, matchID); break; // WaitTurnAction 3066
        case Code.MSG_S_MJ_ACTION_FAIL: ActionFail(data, roomID, matchID); break; // ActionFail 3067
        case Code.MSG_S_MJ_PREPARE: Prepare(data, roomID, matchID); break; // Prepare 3068
        case Code.MSG_S_MJ_RAISE_COMPLETE: RaiseComplete(data, roomID, matchID); break; // RaiseComplete 3069
        case Code.MSG_S_MJ_FOLLOW_DEALER: FollowDealer(data, roomID, matchID); break; // FollowDealer 3070
        case Code.MSG_S_MJ_NEED_BRING_IN: NeedBringIn(data, roomID, matchID); break; // NeedBringIn 3071
        case Code.MSG_S_MJ_NEED_BRING_IN_COMPLETE: NeedBringInComplete(data, roomID, matchID); break; // NeedBringInComplete 3072
        case Code.MSG_S_MJ_VIDEO_MASK_CHANGE: VideoMaskChange(data, roomID, matchID); break; // VideoMaskChange 3073
        case Code.MSG_S_MJ_UP_BLIND: UpBlind(data, roomID, matchID); break; // UpBlind 3074
        case Code.MSG_S_MJ_SYNC_HAND: SyncHand(data, roomID, matchID); break; // SyncHand 3075
        }
    }
}
