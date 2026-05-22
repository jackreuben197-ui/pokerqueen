import { Code } from '../../../../protobuf/holdem/code_pb';
import EnterRoom from './EnterRoom';
import Play from './Play';
import CancelPlay from './CancelPlay';
import Leave from './Leave';
import Chat from './Chat';
import Top from './Top';
import Waymap from './Waymap';
import LastGames from './LastGames';
import BringIn from './BringIn';
import WaymapSpec from './WaymapSpec';
import Online from './Online';
import SyncEnter from './SyncEnter';
import GameStart from './GameStart';
import GamePlayInfo from './GamePlayInfo';
import GamePlayEnd from './GamePlayEnd';
import GameResult from './GameResult';
import WaymapUpdate from './WaymapUpdate';
import RoomClose from './RoomClose';
import ChatOthers from './ChatOthers';
import LeaveNotification from './LeaveNotification';
import StandupNotification from './StandupNotification';
import EncryptCards from './EncryptCards';

export default class CowboyMessageHandler {
    public static handle(code: number, data: any, roomID: number, matchID: number) {
        switch (code) {
        case Code.MSG_D_CB_ENTER_ROOM: EnterRoom(data, roomID, matchID); break; // EnterRoom 2001
        case Code.MSG_D_CB_PLAY: Play(data, roomID, matchID); break; // Play 2002
        case Code.MSG_D_CB_CANCEL_PLAY: CancelPlay(data, roomID, matchID); break; // CancelPlay 2003
        case Code.MSG_D_CB_LEAVE: Leave(data, roomID, matchID); break; // Leave 2004
        case Code.MSG_D_CB_CHAT: Chat(data, roomID, matchID); break; // Chat 2005
        case Code.MSG_D_CB_TOP: Top(data, roomID, matchID); break; // Top 2006
        case Code.MSG_D_CB_WAYMAP: Waymap(data, roomID, matchID); break; // Waymap 2007
        case Code.MSG_D_CB_LAST_GAMES: LastGames(data, roomID, matchID); break; // LastGames 2008
        case Code.MSG_D_CB_BRING_IN: BringIn(data, roomID, matchID); break; // BringIn 2009
        case Code.MSG_D_CB_WAYMAP_SPEC: WaymapSpec(data, roomID, matchID); break; // WaymapSpec 2010
        case Code.MSG_D_CB_ONLINE: Online(data, roomID, matchID); break; // Online 2011
        case Code.MSG_D_CB_SYNC_ENTER: SyncEnter(data, roomID, matchID); break; // SyncEnter 2012
        case Code.MSG_S_CB_GAME_START: GameStart(data, roomID, matchID); break; // GameStart 2100
        case Code.MSG_S_CB_GAME_PLAY_INFO: GamePlayInfo(data, roomID, matchID); break; // GamePlayInfo 2101
        case Code.MSG_S_CB_GAME_PLAY_END: GamePlayEnd(data, roomID, matchID); break; // GamePlayEnd 2102
        case Code.MSG_S_CB_GAME_RESULT: GameResult(data, roomID, matchID); break; // GameResult 2103
        case Code.MSG_S_CB_WAYMAP_UPDATE: WaymapUpdate(data, roomID, matchID); break; // WaymapUpdate 2104
        case Code.MSG_S_CB_ROOM_CLOSE: RoomClose(data, roomID, matchID); break; // RoomClose 2105
        case Code.MSG_S_CB_CHAT_OTHERS: ChatOthers(data, roomID, matchID); break; // ChatOthers 2106
        case Code.MSG_S_CB_LEAVE_NOTIFICATION: LeaveNotification(data, roomID, matchID); break; // LeaveNotification 2107
        case Code.MSG_S_CB_STANDUP_NOTIFICATION: StandupNotification(data, roomID, matchID); break; // StandupNotification 2108
        case Code.MSG_S_CB_ENCRYPT_CARDS: EncryptCards(data, roomID, matchID); break; // EncryptCards 2109
        }
    }
}
