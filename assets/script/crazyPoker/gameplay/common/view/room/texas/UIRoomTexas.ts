import BaseScene from '../../../../../../ui/scene/BaseScene';
import PotsInfo from './PotsInfo';
import RoomInfo from './RoomInfo';
import SeatManager from './SeatManager';

export interface UIRoomTexasEnterParam {
    roomID: number;
    matchID: number;
    observer: boolean;
}
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('CrazyPoker/Room/Texas/UIRoomTexas')
export default class UIRoomTexas extends BaseScene {
    @property(RoomInfo)
    private roomInfo: RoomInfo = null;
    @property(PotsInfo)
    private potsInfo: PotsInfo = null;
    @property(SeatManager) 
    private seatManager: SeatManager = null;

    Enter(param: UIRoomTexasEnterParam) {
        this.roomInfo.initData(param.roomID, param.matchID);
        this.potsInfo.initData(param.roomID, param.matchID);
        this.seatManager.initData(param.roomID, param.matchID);
    }
}
