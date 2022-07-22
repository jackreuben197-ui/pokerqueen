
/**
 * 心跳刷新组件
 */

import { IUpdate } from "../define/EIDefine";
import GameSession from "../session/GameSession";
import GlobalSession from "../session/GlobalSession";
import LobbySession from "../session/LobbySession";

export default class HeartbeatComponent implements IUpdate {

    //刷新间隔
    ingameInterval: number = 1;
    normalInterval: number = 5;


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

        let passTime = GlobalSession.NowTime - this.lastTime;

        if (passTime < this.interval) {
            return;
        }

        if (this.sendTime > 0) {

            //设置网络延迟

            //判断超时
            if (this.sendTime >= 5) {
            }
        }

        this.lastTime = GlobalSession.NowTime;

        this.sendTime += 1;

        // CPGameSessionComponent.Instance?.Send(new Protocol_Holdem_Heartbeat()
        // 	{
        // 		RoomID = 0,
        // 		MatchID = 0,
        // 		request = new ClientMessageHeartbeat() {}
        // 	});
    }

    get interval() {
        if (GameSession.isInGameplay()) {
            return this.ingameInterval;
        }
        else {
            return this.normalInterval;
        }
    }

    start() {
        this.allowUpdate = true;
        this.lastTime = GlobalSession.NowTime;
    }
    stop() {
        this.allowUpdate = false;
    }
}

