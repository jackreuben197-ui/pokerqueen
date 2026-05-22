import { SidePot } from "../../../../protobuf/holdem/define_pb";

export default class TexasGameRoomDataPotInfo extends cc.EventTarget {
    // 全筹码
    public static readonly ALLPOTS_CHANGE = 'ALLPOTS_CHANGE';
    private _allPot: number;
    public get allPot() {return this._allPot};
    public set allPot(p:number) {
        if (p == this._allPot) return;
        this._allPot = p;
        this.emit(TexasGameRoomDataPotInfo.ALLPOTS_CHANGE, this._allPot);
    }
    // _pots
    public static readonly POTLIST_CHANGE = 'POTLIST_CHANGE';
    private _pots: SidePot.AsObject[]
    public get potList() {return this._pots};
    public set potList(pots: Array<SidePot.AsObject>) {
        this._pots = pots;
        this.emit(TexasGameRoomDataPotInfo.POTLIST_CHANGE, this._pots);
    }

}