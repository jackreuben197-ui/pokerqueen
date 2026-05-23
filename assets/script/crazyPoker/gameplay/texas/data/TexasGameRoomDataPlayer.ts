import Seat from "../../../../game/seat/Seat";
import TexasGameRoomDataPlayerMine from "./TexasGameRoomDataPlayerMine";
import { SeatPosition } from "./TexasGameRoomDataSeatsStateManager";

export interface chipsWithStore {
    chips: number;
    store: number;
}

export default class TexasGameRoomDataPlayer extends cc.EventTarget {
    public readonly seatNo: number;
    public userID: number;
    public clubID: number;
    public handBet: number;
    public myInfo: TexasGameRoomDataPlayerMine;

    public isMine(): boolean{
        return this.myInfo != null;
    }

    constructor(seatNo: number, position:SeatPosition) {
        super();
        this.seatNo = seatNo;
        this._position = position;
    }

    // 座位位置变动
    public static readonly SEAT_POSITION_CHANGE = 'SEAT_POSITION_CHANGE';
    private _position: SeatPosition;

    public get position() { return this._position};
    public setPosition(c: SeatPosition, animated = false) {
        if (this._position == c ) return;
        this._position = c; 
        this.emit(TexasGameRoomDataPlayer.SEAT_POSITION_CHANGE, this._position, animated);
    }

    public static readonly CARDS_CHANGE = 'SHOW_CARDS_CHANGE';
    private _cards: number[] = []; //要显示的卡牌

    public get cards() {
        return this._cards;
    }

    public set cards(c: number[]) {
        if (this._cards.length == c.length) {
            if (this._cards.filter((v, i) => v != c[i]).length == 0) {
                return;
            }
        }
        this._cards = c;
        this.emit(TexasGameRoomDataPlayer.CARDS_CHANGE, this._cards);
    }

    public static readonly NICKNAME_CHANGE = 'NICKNAME_CHANGE';
    private _name: string;

    public get name() {
        return this._name;
    }

    public set name(c: string) {
        if (this._name == c) return;
        this._name = c;
        this.emit(TexasGameRoomDataPlayer.NICKNAME_CHANGE, this._name);
    }

    public static readonly AVATAR_CHANGE = 'AVATAR_CHANGE';
    private _avatar: string;

    public get avatar() {
        return this._avatar;
    }

    public set avatar(c: string) {
        if (this._avatar == c) return;
        this._avatar = c;
        this.emit(TexasGameRoomDataPlayer.AVATAR_CHANGE, this._avatar);
    }

    public static readonly CHIP_CHANGE = 'CHIPS_CHANGE';
    private _chip: number;

    public get chip() {
        return this._chip;
    }

    public set chip(c: number) {
        if (this._chip == c) return;
        this._chip = c;
        this.emit(TexasGameRoomDataPlayer.CHIP_CHANGE, this._chip);
    }

    public static readonly ROUND_BET_CHANGE = 'ROUND_BET_CHANGE';
    private _roundBet: number;

    public get roundBet() {
        return this._roundBet;
    }

    public set roundBet(c: number) {
        if (this._roundBet == c) return;
        this._roundBet = c;
        this.emit(TexasGameRoomDataPlayer.ROUND_BET_CHANGE, this._roundBet);
    }

    // public static readonly CHIP_CHANGE = 'CHIPS_CHANGE';
    // private _chip: number;

    // public get chip() {
    //     return this._chip;
    // }

    // public set chip(c: number) {
    //     if (this._chip == c) return;
    //     this._chip = c;
    //     this.emit(TexasGameRoomDataPlayer.CHIP_CHANGE, this._chip);
    // }

    // public static readonly CHIPS_AND_STORE_CHANGE = 'CHIPS_AND_STORE_CHANGE';
    // private _chipsWithStore: chipsWithStore = null;

    // public get chipsWithStore() {
    //     return this.chipsWithStore;
    // }

    // public set chipsWithStore(c: chipsWithStore) {
    //     if (this._chipsWithStore && this._chipsWithStore.chips == c.chips && this._chipsWithStore.store == c.store) return;
    //     this._chipsWithStore = c;
    //     this.emit(TexasGameRoomDataPlayer.CHIPS_AND_STORE_CHANGE, this._chipsWithStore);
    // }

    public static readonly EMPTY_SEAT = 'EMPTY_SEAT';

    public emptySeat() {
        this.userID = 0;
        this.clubID = 0;
        this._chip = 0;
        this._avatar = '';
        this._name = '';
        //this._chipsWithStore = null;
        this._cards = [];
        this.emit(TexasGameRoomDataPlayer.EMPTY_SEAT);
    }
}
