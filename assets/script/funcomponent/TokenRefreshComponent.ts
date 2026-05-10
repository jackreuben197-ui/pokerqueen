/**
 * Token 定时刷新
 */
import GlobalSession from '../session/GlobalSession';
import LoginSession from '../session/LoginSession';
import { IUpComponent } from './UpdateComponent';

export default class TokenRefreshComponent implements IUpComponent {
    //刷新间隔
    interval: number = 5;
    //上次刷新时间
    lasttime: number = 0;
    //需要刷新的阈值
    threshold: number = 7200;
    active: boolean = false;
    isRefreshRequesting: boolean = false;

    async Update(dt: number) {
        if (this.isRefreshRequesting) return;
        if (GlobalSession.NowTimeS - this.lasttime < this.interval) return;
        this.lasttime = GlobalSession.NowTimeS;
        if (!LoginSession.IsTokenVaild()) return;
        let timeDiff = LoginSession.TokenExpireAt - GlobalSession.NowTimeS;
        if (timeDiff < this.threshold) {
            cc.log('token过期,重新拉取token');
            this.isRefreshRequesting = true;
            await LoginSession.SyncRefreshToken().catch(() => {
                GlobalSession.Logout();
            });
            this.isRefreshRequesting = false;
        }
    }
}
