import { LogStyle } from "../config/GameConfig";
import GC from "../frame/GameControl";
import H5MsgMgr from "../H5MsgMgr";
import TimeHelper from "../helper/TimeHelper";
import { i18nMgr } from "../i18n/i18nMgr";
import Main from "../Main";
import WebSocketClient from "../net/websocket/WebSocketClient";
import GlobalSession from "../session/GlobalSession";
import LoginSession from "../session/LoginSession";
import UIComponent from "../ui/UIComponent";

/**
 * 重连的处理
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class ReconnectComponent {

    public static get Instance(): ReconnectComponent {

        return (this as any).__Instance ??= new ReconnectComponent();

    }

    game_active: boolean = true;

    /**
     * 0 : 未连接socket 
     * 1 : 连接进大厅
     * 2 : 连接进入牌桌
     */
    private game_status: number = 0;

    public Start() {

        cc.game.on(cc.game.EVENT_HIDE, () => {
            console.log("cc.game.EVENT_HIDE");
            this.game_active = false;
        })
        cc.game.on(cc.game.EVENT_SHOW, () => {
            console.log("cc.game.EVENT_SHOW");
            this.game_active = true;
            //游戏从后台返回前台的处理
            this.TryReconnect();
            // //检测WebSocket状态
            // if (!WebSocketClient.CheckOpen()) {
            //     WebSocketClient.TryReconnect();
            // }
        })
    }

    //重置重连次数
    public ResetReconnectTime() {
        this._reconnectTime = 0;
    }
    public TryReconnect() {
        // 离开屏幕 || 未连接socket
        if (!this.game_active || this.game_status == 0) return;

        // H5 桥接模式下，WS 由 H5 层管理，CC 层不直连
        if (H5MsgMgr.Instance.handshakeDone) return;

        if (WebSocketClient.CheckOpen(true)) return;

        console.log("----> 重连socket");

        WebSocketClient.CleanWS();

        LoginSession.SyncWS().then(
            //成功
            () => {
                //尝试重连
                this.Reconnect();
            },
            //失败
            () => {
                GlobalSession.Logout();
                UIComponent.Instance.Toast("Request Channel Fail");
                UIComponent.Instance.Toast(i18nMgr.Get("clientInt_anormal"));
            }
        )
    }

    private _reconnectTime: number = 0;
    //最大重连次数
    private ReconnectMaxTime: number = 3;
    private ReconnectDelay: number = 1000;

    public async Reconnect() {
        if (this._reconnectTime < this.ReconnectMaxTime) {
            this.ShowMask();
            this._reconnectTime++;
            console.log("%c%s", LogStyle.ws_request, `reconnect:${this._reconnectTime} ${WebSocketClient.Host_Port}`);
            await TimeHelper.Sleep(this.ReconnectDelay);
            WebSocketClient.Connect();
        } else {
            console.log("重连次数结束");
        }
    }
    public ShowMask() {
        //Main.Reconnect.active = true;
        //Main.Reconnect.getChildByName("warn_label").getComponent(cc.Label).string = i18nMgr.Get("adaptation20072");
    }
    public HideMask() {
        Main.Reconnect.active = false;
    }
    public CheckMask() {
        return Main.Reconnect.active;
    }

    public ChangeStatus(status: number) {
        this.game_status = status;
    }
}
