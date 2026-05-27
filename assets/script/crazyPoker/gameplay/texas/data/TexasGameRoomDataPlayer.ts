import { Def } from "../../../../protobuf/holdem/define_pb";
import { VideoModel } from "../../common/constant/VideoModel";
import { bindData, IObservableBindings, observable, pureEvent } from "../../common/core/DataBind";
import { traceClass } from "../../common/core/LogTrace";
import { AnimateDisplayTypeAction, AnimateDisplayTypeCards, AnimateDisplayTypePosition, AnimateDisplayTypeRoundBet } from "../constants/AnimateDisplayType";
import { Operator } from "./model/Operator";
import TexasGameRoomData from "./TexasGameRoomData";
import TexasGameRoomDataPlayerMine from "./TexasGameRoomDataPlayerMine";
import { SeatPosition } from "./TexasGameRoomDataSeatsStateManager";

type PlayerAnimBindings = {
    action: [AnimateDisplayTypeAction];
    roundBet: [AnimateDisplayTypeRoundBet];
    cards: [AnimateDisplayTypeCards, number?];
    position: [AnimateDisplayTypePosition];
};

/**
 * 核心修正：利用同名接口和类的特性，两边都不要加单独的 export。
 * 这样它们在当前文件内无缝合并。
 */
interface TexasGameRoomDataPlayer extends IObservableBindings<TexasGameRoomDataPlayer, PlayerAnimBindings> {}

@bindData()
@traceClass()
class TexasGameRoomDataPlayer extends cc.EventTarget {
    private _parentRoomData: TexasGameRoomData;
    public readonly seatNo: number;
    public userID: number;
    public clubID: number;
    public handBet: number;
    public mine: TexasGameRoomDataPlayerMine = null;
    public roundActioned: boolean;
    public deposit: number;

    constructor(seatNo: number, position: SeatPosition, roomData: TexasGameRoomData) {
        super();
        this.seatNo = seatNo;
        this.position = position; 
        this._parentRoomData = roomData;
    }

    public get delayViewCard() { return this._parentRoomData.basicInfo.delaySeeCard};
    public get directlyViewCard() { return this._parentRoomData.basicInfo.gameStatus >= Def.GameStatus.HAND_PREFLOP && this.roundActioned};
    public get needVideoPermision() { return this._parentRoomData.basicInfo.videoModel !== VideoModel.NONE};

    public static readonly ACTION_CHANGE = 'ACTION_CHANGE';
    public _action: Def.ActionMap[keyof Def.ActionMap];

    public get action() {
        return this._action;
    }

    public setAction(c: Def.ActionMap[keyof Def.ActionMap], aat: AnimateDisplayTypeAction) {
        if (this._action == c) return;
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
        this.muteEvents();
        this.userID = 0;
        this.clubID = 0;
        this.chip = 0;
        this.avatar = '';
        this.name = '';
        this.mine = null;
        this.cards = [];
        this.unmuteEvents();
        // this.emit(TexasGameRoomDataPlayer.EMPTY_SEAT);
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
            this.setCards([], AnimateDisplayTypeCards.Static, 0);
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
            this.operator = null;
        }
    }
}

/**
 * 终极导出方式：
 * 直接使用 export default 导出这个合并完 interface 的纯净 class。
 * 这保证了外界既能直接将它当做实例类型声明，也能纽结 new 构造函数实例化。
 */
export default TexasGameRoomDataPlayer;