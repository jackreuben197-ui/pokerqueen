import Seat from '../../../../game/seat/Seat';
import TexasGameRoomDataPlayer from './TexasGameRoomDataPlayer';
import TexasGameRoomDataPlayerMine from './TexasGameRoomDataPlayerMine';

//   4 5 6 
// 3       7
// 2       8
// 1       9
//     0
export enum SeatPosition {
    BottomMiddle = 0,
    BottomLeft,
    MiddleLeft,
    TopLeft,
    TopLeft1,
    TopMiddle,
    TopRight1,
    TopRight,
    MiddleRight,
    BottomRight,
}

const SeatsArrange: Record<number,SeatPosition[]> = {
    2: [SeatPosition.BottomMiddle, SeatPosition.TopMiddle],
    3: [SeatPosition.BottomMiddle, SeatPosition.TopLeft,  SeatPosition.TopRight],
    4: [SeatPosition.BottomMiddle,SeatPosition.MiddleLeft,SeatPosition.TopMiddle,SeatPosition.MiddleRight],
    5: [SeatPosition.BottomMiddle,SeatPosition.MiddleLeft,SeatPosition.TopLeft1,SeatPosition.TopRight1,SeatPosition.MiddleRight],
    6: [SeatPosition.BottomMiddle,SeatPosition.BottomLeft,SeatPosition.TopLeft,SeatPosition.TopMiddle,SeatPosition.TopRight,SeatPosition.BottomRight],
    7: [SeatPosition.BottomMiddle,SeatPosition.BottomLeft,SeatPosition.TopLeft,SeatPosition.TopLeft1,SeatPosition.TopRight1,SeatPosition.TopRight,SeatPosition.BottomRight],
    8: [SeatPosition.BottomMiddle,SeatPosition.BottomLeft,SeatPosition.MiddleLeft,SeatPosition.TopLeft,SeatPosition.TopMiddle,SeatPosition.TopRight,SeatPosition.MiddleRight,SeatPosition.BottomRight],
    9: [SeatPosition.BottomMiddle,SeatPosition.BottomLeft,SeatPosition.MiddleLeft,SeatPosition.TopLeft,SeatPosition.TopLeft1,SeatPosition.TopRight1,SeatPosition.TopRight,SeatPosition.MiddleRight,SeatPosition.BottomRight],
} as const;

export default class TexasGameRoomDataSeatsStateManager extends cc.EventTarget {
    private _playerMap: Map<number, TexasGameRoomDataPlayer> = new Map();
    private _playerMine: TexasGameRoomDataPlayerMine;
    public static readonly SEATS_CHANGE = 'SEATS_CHANGE';
    private _seatsCount: number;

    public getSeatPlayer(i: number) {
        return this._playerMap.get(i);
    }

    public getMine() {
        return this._playerMine;
    }

    public get seatsCount() {
        return this._seatsCount;
    }

    public set seatsCount(c: number) {
        if (this._seatsCount == c) return;
        this._seatsCount = c;
        const arrage = SeatsArrange[this._seatsCount];
        for (let i = 1; i <= 9; i++) {
            if (i <= this._seatsCount) {
                if (this._playerMap.has(i)) {
                    continue;
                }
                this._playerMap.set(i, new TexasGameRoomDataPlayer(i, arrage[i-1]));
                continue;
            }
            this._playerMap.delete(i);
        }
        this.emit(TexasGameRoomDataSeatsStateManager.SEATS_CHANGE, this._seatsCount);
    }

    private _mySeat: number = 0;
    public get mySeat() {return this._mySeat};
    public set mySeat(s: number) {
        if (this.mySeat == s) return;
        //重排
        const arrage = SeatsArrange[this._seatsCount];
        let j = 0;
        for (let i = s; i < s + this._seatsCount; i++) {
            let ss = i % this.seatsCount == 0 ? this.seatsCount : i % this.seatsCount;
            const player = this._playerMap.get(ss);
            player.setPosition(arrage[j], false);
            j++;
        }
        let ss = this.getSeatPlayer(s);
        this._playerMine = new TexasGameRoomDataPlayerMine(ss);
    }

    public seated(seatNo: number, isSelf: boolean) {
        if (isSelf) {
             //重排
            const arrage = SeatsArrange[this._seatsCount];
            let j = 0;
            for (let i = seatNo; i < seatNo + this._seatsCount; i++) {
                let ss = i % this.seatsCount == 0 ? this.seatsCount : i % this.seatsCount;
                const player = this._playerMap.get(ss);
                player.setPosition(arrage[j], true);
                j++;
            }
            let ss = this.getSeatPlayer(seatNo);
            this._playerMine = new TexasGameRoomDataPlayerMine(ss);
        }
    }


}
