import { TRoomList } from '../../../config/TTypeConfig';
import { GameCache } from '../../../game/GameCache';
import { GameType, PokerType } from '../../../game/util/GameUtil';
import GC from '../../GameControl';
import LobbyRoomListItem from './LobbyRoomListItem';

export default class LobbyRoomListModel {
    private _curGameType: GameType = GameType.Holdem;
    private _curPokerType: PokerType = PokerType.Normal;
    private _curSB: number = 0;
    private _reqing: boolean = false;
    private _reqEnd: boolean = false;
    private _offset: number = 0;
    private _list: Array<LobbyRoomListItem> = [];
    private _list_club: Array<LobbyRoomListItem> = [];
    private _selected: LobbyRoomListItem = null;

    get selected() {
        return this._selected;
    }

    set selected(v) {
        this._selected = v;
        GameCache.Instance.serviceId = v.service_id;
        GameCache.Instance.roomName = GC.data.languageTemp.temp.getName(v.name);
        GameCache.Instance.room_type = v.room_type;
        GameCache.Instance.game_type = v.game_type;
        GameCache.Instance.poker_type = v.poker_type;
        GameCache.Instance.bet_type = v.limit_bet_type;
        GameCache.Instance.room_id = v.rid;
        GameCache.Instance.seat_count = v.seat_count;
        GameCache.Instance.straddle = v.straddle_on;
        GameCache.Instance.insurance = v.insurance_on > 0;
        GameCache.Instance.muck_switch = v.muck_on;
        GameCache.Instance.voiceprint_verify_on = v.voiceprint_verify_on;
        GameCache.Instance.voiceprint_verify_duration = v.voiceprint_verify_duration;
    }

    // 获取当前房间列表(俱乐部/非俱乐部)
    getList(isClubRooms: boolean) {
        return isClubRooms ? this._list_club : this._list;
    }

    get canReq() {
        return !this._reqEnd && !this._reqing;
    }

    // switchTypeTab(gameType: GameType, pokerType: PokerType, isClub: boolean = false) {
    //     this._curGameType = gameType;
    //     this._curPokerType = pokerType;
    //     this.switchSBTab(0, false, isClub);
    // }
    // switchSBTab(index: number, isSB: boolean = true, isClub: boolean = false) {
    //     let sb = GC.data.lobby.roomBlinds.getSbs(isClub)[index];
    //     this._curSB = sb;
    //     this._reqing = false;
    //     this._reqEnd = false;
    //     this._offset = 0;
    //     let list = isClub ? this._list_club : this._list;
    //     list.length = 0;
    //     this.dropDownReq(isSB, isClub);
    // }
    // dropDownReq(isSB: boolean = true, isClub: boolean = false) {
    //     if (!this._reqing && !this._reqEnd) {
    //         this._reqing = true;
    //         if (isSB) {
    //             GC.data.lobby.reqRoomListSB(this._offset, this._curSB, this._curSB, this._curGameType, this._curPokerType, isClub);
    //         } else {
    //             GC.data.lobby.reqRoomList(this._offset, this._curSB, this._curSB, this._curGameType, this._curPokerType, isClub);
    //         }
    //     }
    // }

    updateData(msg: TRoomList, isClubRooms: boolean) {
        this._reqing = false;
        let list = isClubRooms ? this._list_club : this._list;
        msg.records.forEach(record => {
            list.push(new LobbyRoomListItem(record));
        });
        this._offset = list.length;
        this._reqEnd = list.length >= msg.total;
    }
}
