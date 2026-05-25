import { OperatorMine } from "./model/Operator";
import TexasGameRoomDataPlayer from "./TexasGameRoomDataPlayer";

export default class TexasGameRoomDataPlayerMine extends cc.EventTarget {
    public seatedPlayer: TexasGameRoomDataPlayer;

    constructor(sp: TexasGameRoomDataPlayer) {
        super();
        this.seatedPlayer = sp;
        sp.myInfo = this;
    }

    public static readonly STORECHIPS_CHANGE = 'STORECHIPS_CHANGE';
    private _storeChips: number;

    public get storeChips() {
        return this._storeChips;
    }

    public set storeChips(c: number) {
        if (this._storeChips == c) return;
        this._storeChips = c;
        this.emit(TexasGameRoomDataPlayerMine.STORECHIPS_CHANGE, this._storeChips);
    }

    public static readonly PREPARE_OPERATION_MINE = 'PREPARE_OPERATION_MINE';
        private _operator:OperatorMine;
        public get operator() {
            return this._operator;
        }
    
    public prepareOperation(c: OperatorMine) {
        this._operator = c;
        this.emit(TexasGameRoomDataPlayerMine.PREPARE_OPERATION_MINE, this._operator);
    }

    public static readonly HIGHLIGHT_CARDS = 'HIGHLIGHT_CARDS';
    public highlightCards(cards: number[]){
        this.emit(TexasGameRoomDataPlayerMine.HIGHLIGHT_CARDS, cards);
    } 
}
