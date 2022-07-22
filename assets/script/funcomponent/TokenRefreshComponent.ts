/**
 * Token 定时刷新
 */

import { IUpdate } from "../define/EIDefine";
import GlobalSession from "../session/GlobalSession";
import LoginSession from "../session/LoginSession";

export default class TokenRefreshComponent implements IUpdate {

    //刷新间隔
    interval: number = 5;
    //上次刷新时间
    lasttime: number = 0;
    //需要刷新的阈值 
    threshold: number = 7200;

    allowUpdate: boolean = true;

    isRefreshRequesting: boolean = false;

    async update(dt: number) {
        // 刷新请求中 || 
        if (this.isRefreshRequesting || !LoginSession.IsTokenVaild()) return;

        let nowTime = GlobalSession.NowTime;
        if (nowTime - this.lasttime < this.interval) return;
        this.lasttime = nowTime;
        let timeDiff = LoginSession.TokenExpireAt - GlobalSession.NowTime;
        if (timeDiff < this.threshold) {
            this.isRefreshRequesting = true;
            await LoginSession.SyncRefreshToken();
            this.isRefreshRequesting = false;
        }
    }
    start() {
        this.allowUpdate = true;
    }
    stop() {
        this.allowUpdate = false;
    }

}
