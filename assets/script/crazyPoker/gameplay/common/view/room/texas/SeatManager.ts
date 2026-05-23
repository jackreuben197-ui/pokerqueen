
import { StringHelper } from "../../../../../../helper/StringHelper";
import TexasGameRoomData from "../../../../texas/data/TexasGameRoomData";
import TexasGameRoomDataPlayer, { chipsWithStore } from "../../../../texas/data/TexasGameRoomDataPlayer";
import TexasGameRoomDataSeatsStateManager from "../../../../texas/data/TexasGameRoomDataSeatsStateManager";
import roomDataManager from "../../../core/RoomDataManager";
import RemoteSprite from "../../chips/usdtdiamond/RemoteSprite";
import Seat from "./Seat";


const LN = '[SeatManager]';
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('CrazyPoker/Room/Texas/SeatManager')
export default class SeatManager extends cc.Component {

    @property(cc.Prefab)
    private seatPrefab: cc.Prefab = null;

    private _seatManager: TexasGameRoomDataSeatsStateManager;
    private _seatNodes: cc.Node[] = [];

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
        this.onUpdateSeats(this._seatManager.seatsCount);
    }

    private onUpdateSeats(count: number) {
        if (this._seatNodes.length != count) {
            for (let i = 0; i< count; i++) {
                let nd = cc.instantiate(this.seatPrefab);
                nd.parent = this.node;
                this._seatNodes.push(nd);
            }
        }
        console.log(LN, 'seat count', this._seatNodes.length);
        this._seatNodes.forEach((node,index) => {
            let seatData = this._seatManager.getSeatPlayer(index+1);
            const comp = node.getComponent(Seat);
            comp.initData(seatData);
        })
    }

}