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
    private _selected: LobbyRoomListItem = null;

    get selected() {
        return this._selected;
    }
    set selected(v) {
        this._selected = v;
    }

    get list() {
        return this._list;
    }

    get canReq() {
        return !this._reqEnd && !this._reqing;
    }

    switchTypeTab(gameType, pokerType) {
        this._curGameType = gameType;
        this._curPokerType = pokerType;

        this.switchSBTab(0, false);
    }

    switchSBTab(index, isSB: boolean = true) {
        let sb = GC.data.lobby.roomBlinds.sbs[index];
        this._curSB = sb;
        this._reqing = false;
        this._reqEnd = false;
        this._offset = 0;
        this._list.length = 0;

        this.dropDownReq(isSB);
    }

    dropDownReq(isSB: boolean = true) {
        if (!this._reqing && !this._reqEnd) {
            this._reqing = true;
            if (isSB) {
                GC.data.lobby.reqRoomListSB(this._offset, this._curSB, this._curSB, this._curGameType, this._curPokerType);
            } else {
                GC.data.lobby.reqRoomList(this._offset, this._curSB, this._curSB, this._curGameType, this._curPokerType);
            }
        }
    }

    updateData(msg: TRoomList) {
        this._reqing = false;

        msg.records.forEach(record => {
            this._list.push(new LobbyRoomListItem(record))
        })

        this._offset = this._list.length
        this._reqEnd = this._list.length >= msg.total;
    }
}