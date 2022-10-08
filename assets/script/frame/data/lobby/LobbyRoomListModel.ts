import { TRoomList } from "../../../config/TTypeConfig";
import { GameType, PokerType } from "../../../game/GameUtil";
import GC from "../../GameControl";
import LobbyRoomListItem from "./LobbyRoomListItem";

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
    }

    getList(isClub) {
        return isClub ? this._list_club : this._list;
    }

    get canReq() {
        return !this._reqEnd && !this._reqing;
    }

    switchTypeTab(gameType, pokerType, isClub: boolean = false) {
        this._curGameType = gameType;
        this._curPokerType = pokerType;

        this.switchSBTab(0, false, isClub);
    }

    switchSBTab(index, isSB: boolean = true, isClub: boolean = false) {
        let sb = GC.data.lobby.roomBlinds.getSbs(isClub)[index];
        this._curSB = sb;
        this._reqing = false;
        this._reqEnd = false;
        this._offset = 0;

        let list = isClub ? this._list_club : this._list;
        list.length = 0;

        this.dropDownReq(isSB, isClub);
    }

    dropDownReq(isSB: boolean = true, isClub: boolean = false) {
        if (!this._reqing && !this._reqEnd) {
            this._reqing = true;
            if (isSB) {
                GC.data.lobby.reqRoomListSB(this._offset, this._curSB, this._curSB, this._curGameType, this._curPokerType, isClub);
            } else {
                GC.data.lobby.reqRoomList(this._offset, this._curSB, this._curSB, this._curGameType, this._curPokerType, isClub);
            }
        }
    }

    updateData(msg: TRoomList, isClub: boolean) {
        this._reqing = false;

        let list = isClub ? this._list_club : this._list;
        msg.records.forEach(record => {
            list.push(new LobbyRoomListItem(record))
        })

        this._offset = list.length
        this._reqEnd = list.length >= msg.total;
    }
}