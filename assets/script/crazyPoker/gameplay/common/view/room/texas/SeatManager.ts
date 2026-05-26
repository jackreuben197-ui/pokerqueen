import { AnimateDisplayTypeButton } from '../../../../texas/constants/AnimateDisplayType';
import TexasGameRoomData from '../../../../texas/data/TexasGameRoomData';
import TexasGameRoomDataSeatsStateManager from '../../../../texas/data/TexasGameRoomDataSeatsStateManager';
import roomDataManager from '../../../core/RoomDataManager';
import Seat from './Seat';
const LN = '[SeatManager]';
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('CrazyPoker/Room/Texas/SeatManager')
export default class SeatManager extends cc.Component {
    @property(cc.Prefab)
    private seatPrefab: cc.Prefab = null;
    @property({ type: cc.Node, tooltip: '发牌的起始节点' })
    private dealNode: cc.Node = null;
    @property({ type: cc.Node, tooltip: '底池的起始节点' })
    private potNot: cc.Node = null;
    private _seatManager: TexasGameRoomDataSeatsStateManager;
    private _seatNodes: cc.Node[] = [];
    private _seatNodesMap: Map<number, Seat> = new Map();

    public initData(roomID: number, matchID: number) {
        const roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
        this._seatManager = roomData.seatsStateManager;
        if (this.node.activeInHierarchy) {
            this._bindEventsAndRefresh();
        }
    }

    public onLoad() {
        // 如果绑定点击写这里
    }

    public onEnable(): void {
        if (!this._seatManager) return;
        this._bindEventsAndRefresh();
    }

    public onDisable(): void {
        if (this._seatManager) {
            this._seatManager.targetOff(this);
            this._seatManager = null;
        }
    }

    private _bindEventsAndRefresh() {
        this._seatManager.on(TexasGameRoomDataSeatsStateManager.SEATS_CHANGE, this.onUpdateSeats, this);
        this._seatManager.on(TexasGameRoomDataSeatsStateManager.BUTTON_CHANGE, this.onUpdateButton, this);
        this.onUpdateSeats(this._seatManager.seatsCount);
        this.onUpdateButton(0, this._seatManager.buttonPosition, AnimateDisplayTypeButton.Static);
    }

    private onUpdateButton(prevSeat: number, currentSeat: number, bat: AnimateDisplayTypeButton) {
        if (bat == AnimateDisplayTypeButton.Static) {
            if (prevSeat > 0) {
                const ps = this._seatNodesMap.get(prevSeat);
                ps.animateButtonChange(false);
            }
            const cps = this._seatNodesMap.get(currentSeat);
            cps.animateButtonChange(true);
            return;
        }
        if (prevSeat > 0) {
            const ps = this._seatNodesMap.get(prevSeat);
            ps.animateButtonChange(false);
            const cps = this._seatNodesMap.get(currentSeat);
            cps.animateButtonChange(true, ps.buttonIcon);
            return;
        }
        const cps = this._seatNodesMap.get(currentSeat);
        cps.animateButtonChange(true);
    }

    private onUpdateSeats(count: number) {
        this._seatNodesMap.clear();
        if (this._seatNodes.length != count) {
            for (let i = 0; i < count; i++) {
                let nd = cc.instantiate(this.seatPrefab);
                nd.parent = this.node;
                this._seatNodes.push(nd);
                this._seatNodesMap.set(i + 1, nd.getComponent(Seat));
            }
        }
        this._seatNodesMap.forEach((comp, seatNo) => {
            const seatData = this._seatManager.getSeatPlayer(seatNo);
            comp.initData(seatData, this.potNot, this.dealNode);
        });
    }
}
