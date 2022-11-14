
/**
 * 心跳刷新组件
 */
import GameUtil from "../game/util/GameUtil";
import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import GlobalSession from "../session/GlobalSession";
import { IUpComponent } from "./UpdateComponent";


export default class HeartbeatComponent implements IUpComponent {

    //刷新间隔
    SendIntervalNormal: number = 5;
    SendIntervalInGameplay: number = 1;

    //上次刷新时间
    tokenLastTime: number = 0;

    active: boolean = false;

    isRefreshRequesting: boolean = false;

    lastTime: number = 0;

    //发送次数 累加一定值属于超时
    sendTime: number = 0;
    //最大连续发送次数，超过就算超时
    maxSendTime: number = 5;

    Awake() {
        this.lastTime = GlobalSession.NowTimeS;
    }

    Update(dt: number) {

        let passTime = GlobalSession.NowTimeS - this.lastTime;

        if (passTime < this.interval) {
            return;
        }

        this.lastTime = GlobalSession.NowTimeS;

        ProtocolAgency.Send({
            Code: ProtocolCode.Protocol_Holdem_Heartbeat,
            RoomID: 0,
            MatchID: 0,
        });
    }

    get interval() {
        if (GameUtil.isInGameplay) {
            return this.SendIntervalInGameplay;
        }
        else {
            return this.SendIntervalNormal;
        }
    }
}

