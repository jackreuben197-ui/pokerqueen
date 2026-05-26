import GameplayUtil from '../../common/util/GameplayUtil';
import { Def } from '../../../../protobuf/holdem/define_pb';

export interface tableBetInfo {
    sb: number;
    ante: number;
}

export default class TexasGameRoomDataBasic extends cc.EventTarget {
    // 不变的信息
    // 基础信息
    public roomName: string;
    public gameType: number;
    public pokerType: number;
    public betType: number;
    public isMtt: boolean;
    public delaySeeCard: boolean;
    public _gameStatus: Def.GameStatusMap[keyof typeof Def.GameStatus];

    public get gameStatus() {
        return this._gameStatus;
    }

    public set gameStatus(r: Def.GameStatusMap[keyof typeof Def.GameStatus]) {
        this._gameStatus = r;
    }

    private _roomType: number;

    public get roomType() {
        return this._roomType;
    }

    public set roomType(r: number) {
        const { gameType, pokerType, betType, isMTT } = GameplayUtil.RoomTypeExtract(r);
        this.gameType = gameType;
        this.pokerType = pokerType;
        this.betType = betType;
        this.isMtt = isMTT;
    }

    // 朋友卓信息
    public invitationCode: string;
    //@TODO 鱿鱼,蘑菇,暴击,bombpt 待补
    // 下注信息会变
    public static readonly TABLE_BET_INFO_CHANGE = 'TABLE_BET_INFO_CHANGE';
    private _sbante: tableBetInfo;

    public get sbante() {
        return this._sbante;
    }

    public set sbante(data: tableBetInfo) {
        if (this._sbante && this._sbante.ante == data.ante && this._sbante.sb == data.sb) return;
        this._sbante = data;
        this.emit(TexasGameRoomDataBasic.TABLE_BET_INFO_CHANGE, this._sbante);
    }

    // 手数变动
    public static readonly TABLE_HANDINFO_CHANGE = 'TABLE_HANDINFO_CHANGE';
    private _handNum: number;

    public get handNum() {
        return this._handNum;
    }

    public set handNum(n: number) {
        if (n == this._handNum) return;
        this._handNum = n;
        this.emit(TexasGameRoomDataBasic.TABLE_HANDINFO_CHANGE, this._handNum);
    }

    public handClear() {
        this.gameStatus = Def.GameStatus.WAIT_HAND_START;
    }
}
