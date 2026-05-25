import { Def } from "../../../../protobuf/holdem/define_pb";
import { AnimateDisplayTypeAction, AnimateDisplayTypeCards, AnimateDisplayTypePosition, AnimateDisplayTypeRoundBet } from "../constants/AnimateDisplayType";
import { Operator } from "./model/Operator";
import TexasGameRoomData from "./TexasGameRoomData";
import TexasGameRoomDataPlayerMine from "./TexasGameRoomDataPlayerMine";
import { SeatPosition } from "./TexasGameRoomDataSeatsStateManager";

const LN = '[TexasGameRoomDataPlayer]';
export default class TexasGameRoomDataPlayer extends cc.EventTarget {
    private _parentRoomData: TexasGameRoomData;
    public readonly seatNo: number;
    public userID: number;
    public clubID: number;
    public handBet: number;
    public myInfo: TexasGameRoomDataPlayerMine = null;
    public roundActioned: boolean;
    public deposit: number;

    constructor(seatNo: number, position:SeatPosition, roomData: TexasGameRoomData) {
        super();
        this.seatNo = seatNo;
        this._position = position;
        this._parentRoomData = roomData;
    }

    public get delayViewCard() { return this._parentRoomData.basicInfo.delaySeeCard};
    public get directlyViewCard() { return this._parentRoomData.basicInfo.gameStatus >= Def.GameStatus.HAND_PREFLOP && this.roundActioned};

    public get isMine(): boolean{
        return this.myInfo != null;
    }

    public getMine(): TexasGameRoomDataPlayerMine {
        return this.myInfo;
    }

    public static readonly ACTION_CHANGE = 'ACTION_CHANGE';
    public _action: Def.ActionMap[keyof Def.ActionMap];
    public get action() { return this._action};
    public setAction(c: Def.ActionMap[keyof Def.ActionMap], aat: AnimateDisplayTypeAction) {
        if (this._action == c ) return;
        this._action = c; 
        this.emit(TexasGameRoomDataPlayer.ACTION_CHANGE, this._action, aat);
    }

    // 座位位置变动
    public static readonly SEAT_POSITION_CHANGE = 'SEAT_POSITION_CHANGE';
    private _position: SeatPosition;

    public get position() { return this._position};
    public setPosition(c: SeatPosition, pat: AnimateDisplayTypePosition ) {
        if (this._position == c) return;
        this._position = c; 
        this.emit(TexasGameRoomDataPlayer.SEAT_POSITION_CHANGE, this._position, pat);
    }

    public static readonly CARDS_CHANGE = 'SHOW_CARDS_CHANGE';
    private _cards: number[] = []; //要显示的卡牌

    public get cards() {
        return this._cards;
    }

    public updateCards(c: number[], cte: AnimateDisplayTypeCards = AnimateDisplayTypeCards.Static, order?:number) {
        if (this._cards.length == c.length) {
            if (this._cards.filter((v, i) => v != c[i]).length == 0) {
                return;
            }
        }
        this._cards = c;
        if (!order) order = 0;
        this.emit(TexasGameRoomDataPlayer.CARDS_CHANGE, this._cards, cte, order);
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

    public setRoundBet(c: number, aat: AnimateDisplayTypeRoundBet) {
        if (this._roundBet == c) return;
        this._roundBet = c;
        this.emit(TexasGameRoomDataPlayer.ROUND_BET_CHANGE, this._roundBet, aat);
    }

    public static readonly PREPARE_OPERATION = 'PREPARE_OPERATION';
    private _operator:Operator;
    public get operator() {
        return this._operator;
    }

    public prepareOperation(c: Operator) {
        this._operator = c;
        this.emit(TexasGameRoomDataPlayer.PREPARE_OPERATION, this._operator);
    }

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

    public static readonly WINNER = 'WINNER';
    public claimWin() {
        this.emit(TexasGameRoomDataPlayer.WINNER);
    }

    public handClear() {
        if (this.userID > 0) {
            this.setAction(Def.Action.NONE, AnimateDisplayTypeAction.Done);
            this.handBet = 0;
            this.setRoundBet(0, AnimateDisplayTypeRoundBet.Static);
            this.updateCards([], AnimateDisplayTypeCards.Static);
            this.roundActioned = false;
        }
    }

    public roundClear() {
        if (this.userID > 0) {
            if (this.action != Def.Action.FOLD && this.action != Def.Action.ALLIN) {
                this.setAction(Def.Action.READY, AnimateDisplayTypeAction.Done);
            }
            this.setRoundBet(0, AnimateDisplayTypeRoundBet.Static);
            this.roundActioned = false;
        }
    }
}
