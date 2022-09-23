
/**
 * 心跳刷新组件
 */

import { IUpdate } from "../define/EIDefine";
import GameUtil from "../game/GameUtil";
import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { Protocol_Holdem_Heartbeat } from "../net/websocket/ProtocolHoldemMessages";
import GlobalSession from "../session/GlobalSession";


export default class HeartbeatComponent implements IUpdate {

    //刷新间隔
    SendIntervalNormal: number = 5;
    SendIntervalInGameplay: number = 1;

    //上次刷新时间
    tokenLastTime: number = 0;

    allowUpdate: boolean = false;

    isRefreshRequesting: boolean = false;

    lastTime: number = 0;

    //发送次数 累加一定值属于超时
    sendTime: number = 0;
    //最大连续发送次数，超过就算超时
    maxSendTime: number = 5;

    async update(dt: number) {

        let passTime = GlobalSession.NowTimeS - this.lastTime;

        if (passTime < this.interval) {
            return;
        }

        if (this.sendTime > 0) {

            //设置网络延迟

            //判断超时
            if (this.sendTime >= 5) {
                //websocket进行重新连接
            }
        }

        this.lastTime = GlobalSession.NowTimeS;

        this.sendTime += 1;

        ProtocolAgency.Send({
            protocol: Protocol_Holdem_Heartbeat,
            RoomID: 0,
            MatchID: 0,
            body: Protocol_Holdem_Heartbeat.Request(),
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

    start() {
        console.log("启动心跳");
        this.allowUpdate = true;
        this.lastTime = GlobalSession.NowTimeS;
    }
    stop() {
        this.allowUpdate = false;
    }
}

