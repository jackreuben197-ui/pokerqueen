import GameplayUtil from '../../common/util/GameplayUtil';
import {Def} from '../../../../protobuf/holdem/define_pb';
import { observable, StaticProperty } from '../../common/core/DataBind';

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
    public opDuration: number;
    public isMtt: boolean;
    public delaySeeCard: boolean;
    private _handCardNum: number;
    public get handCardNum() {return this._handCardNum};
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
        switch(this.gameType) {
        case 1:
            this._handCardNum = 4;
        case 2:
            this._handCardNum = 5;
        case 3:
            this._handCardNum = 6;
        default:
            this._handCardNum = 2;
        }
    }

    // 朋友卓信息
    public invitationCode: string;
    //@TODO 鱿鱼,蘑菇,暴击,bombpt 待补
    // 下注信息会变
    @observable('TABLE_BET_INFO_CHANGE')
    public sbante: StaticProperty<tableBetInfo>;

    @observable('TABLE_HANDINFO_CHANGE')
    public handNum: StaticProperty<number>;

    public handClear() {
        this.gameStatus = Def.GameStatus.WAIT_HAND_START;
    }

    public squidEnabled:boolean;

    public mushroomEnabled: boolean;

    public videoModel: number;
}
