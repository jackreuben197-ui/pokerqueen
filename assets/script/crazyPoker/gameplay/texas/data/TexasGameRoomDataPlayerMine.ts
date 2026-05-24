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
}
