import Seat from "../../../../game/seat/Seat";
import TexasGameRoomDataPlayer from "./TexasGameRoomDataPlayer";
import { SeatPosition } from "./TexasGameRoomDataSeatsStateManager";

export interface chipsWithStore {
    chips: number;
    store: number;
}

export default class TexasGameRoomDataPlayerMine extends cc.EventTarget {
    private _seatedPlayer: TexasGameRoomDataPlayer;

    constructor(sp: TexasGameRoomDataPlayer) {
        super();
        this._seatedPlayer = sp;
        sp.myInfo = this;
    }
}
