/**
 * H5 桥接模式下的重连组件
 *
 * 与老的 ReconnectComponent 区别：
 * - 直连 WebSocket 时由 Cocos 自己掌握重连，ReconnectComponent 负责轮询 + 重发 REGISTER
 * - 桥接模式下 H5 接管 WebSocket，重连流程由 wsProxy 维护，Cocos 端只需要：
 *   1. 监听 wsReconnecting   → 显示重连遮罩
 *   2. 监听 wsReconnected    → 等服务端 Register 回包（LobbySession 已有 handler）即可清掉遮罩
 *   3. 监听 wsReconnectFailed → 关闭遮罩 + Toast + 让 H5 回到访客页/登录弹窗
 *
 * 对齐 Unity NetworkDetectionComponent 的整体行为，只是把网络层下放到 H5。
 */
import GC from '../frame/GameControl';
import { GameCache } from '../game/GameCache';
import H5MsgMgr from '../H5MsgMgr';
import { i18nMgr } from '../i18n/i18nMgr';
import Main from '../Main';
import { ProtocolCode } from '../net/websocket/ProtocolCode';
import UIComponent from '../ui/UIComponent';

// 保险：即便 Register 回包没到，超过该时长也会强制隐藏遮罩，避免用户卡在黑屏上。
const REGISTER_HIDE_FALLBACK_MS = 8000;
const RECONNECTING_TEXT_KEY = 'UILogin_ReconnectText';
const RECONNECTING_TEXT_FALLBACK = '重连中......';
const RECONNECT_TEXT_SECONDS = 60;

export default class BridgeReconnectComponent {
    public static get Instance(): BridgeReconnectComponent {
        return ((this as any).__Instance ??= new BridgeReconnectComponent());
    }

    private _started = false;
    private _maskShown = false;
    private _hideFallbackTimer: number = 0;
    private _textCountdownTimer: number = 0;
    private _reconnectSecondsLeft = RECONNECT_TEXT_SECONDS;
    // 重连流程开始 → EnterRoom 回包到达期间为 true，供牌桌业务（如 ReEnterClear）判断。
    private _inReconnectFlow = false;

    public Start(): void {
        if (this._started) return;
        this._started = true;

        // 桥接模式下 LobbySession.Init() 未被调用，自行注册一遍 Register 回包监听，
        // 用于重连成功后及时收掉遮罩并触发 ReEnterRoom。
        GC.notify.register(ProtocolCode.Protocol_Holdem_Register, this._onProtocolRegister, this);

        H5MsgMgr.Instance.on('wsReconnecting', payload => {
            console.warn('[BridgeReconnect] wsReconnecting:', payload);
            this._inReconnectFlow = true;
            this._showMask();
        });

        H5MsgMgr.Instance.on('wsReconnected', payload => {
            console.log('[BridgeReconnect] wsReconnected:', payload);
            // REGISTER 已经在 H5 端发出，等服务端回包；LobbySession.on_Protocol_Holdem_Register
            // 收到回包后会判断 CurGame 决定 ReEnterRoom 还是 HideMask。
            // 设一个兜底定时器，回包迟迟不到也要把遮罩清掉。
            this._armHideFallback();
        });

        H5MsgMgr.Instance.on('wsReconnectFailed', payload => {
            console.error('[BridgeReconnect] wsReconnectFailed:', payload);
            this._cancelHideFallback();
            this._hideMask();
            this._inReconnectFlow = false;
            this._notifyFailure(payload.reason);
            // 用户在牌桌上时，让 H5 回到访客首页并打开登录弹窗，避免卡在不可用界面。
            if (payload.reason !== 'auth-invalid') {
                H5MsgMgr.sendToH5('h5Navigate', 1, {
                    name: 'guest-home',
                    replace: true,
                    ensureVisible: true,
                    openLoginModal: true
                });
            }
        });
    }

    /** 主动触发一次重连（牌桌错误码 / GM 工具等可调用）。 */
    public StartReconnect(): void {
        if (!H5MsgMgr.Instance.handshakeDone) {
            console.warn('[BridgeReconnect] handshake not done, ignore StartReconnect');
            return;
        }
        const serviceId = Number(GameCache.Instance.serviceId);
        if (!serviceId) {
            console.warn('[BridgeReconnect] no serviceId, cannot trigger reconnect');
            return;
        }
        H5MsgMgr.sendToH5('wsConnect', 1, {
            port: serviceId,
            roomId: GameCache.Instance.room_id,
            matchId: GameCache.Instance.match_id,
            force: true
        });
    }

    /** Register 回包到达时由外部（LobbySession）调用，立即收掉重连遮罩。 */
    public OnRegisterAck(): void {
        this._cancelHideFallback();
        this._hideMask();
    }

    /**
     * 当前是否处于重连流程内（从 wsReconnecting 触发到 EnterRoom 回包闭环为止）。
     * 牌桌业务（如 Protocol_Holdem_EnterRoom_Handler）据此决定是否走 ReEnterClear 清场流程。
     */
    public IsReconnecting(): boolean {
        return this._inReconnectFlow;
    }

    /**
     * EnterRoom 回包到达且本次进房是由重连触发时，由牌桌 handler 调用以闭环重连流程。
     * 返回 true 表示"本次 EnterRoom 是重连流程的一部分"，调用方据此触发 ReEnterClear。
     */
    public ConsumeReconnectFlag(): boolean {
        const wasReconnecting = this._inReconnectFlow;
        this._inReconnectFlow = false;
        this._cancelHideFallback();
        this._hideMask();
        return wasReconnecting;
    }

    private _onProtocolRegister(body: { status?: number }): void {
        if (body?.status !== 0) {
            // 服务端拒绝注册（token 过期等）→ 让 wsReconnectFailed 流程兜底；
            // 这里不强行 Logout，避免和 H5 的登录弹窗流程打架。
            console.warn('[BridgeReconnect] Protocol_Holdem_Register failed:', body);
            return;
        }
        this.OnRegisterAck();
        if (GameCache.Instance.CurGame) {
            // 牌桌中：重新进房间，UITexas 内部会重置状态。
            GameCache.Instance.CurGame.ReEnterRoom();
        }
    }

    private _showMask(): void {
        if (!Main.Reconnect || !Main.Reconnect.isValid) return;
        Main.Reconnect.active = true;
        this._maskShown = true;
        this._startMaskTextCountdown();
    }

    private _setMaskText(): void {
        const warnNode = this._findChild(Main.Reconnect, 'warn_label');
        const warnLabel = warnNode?.getComponent(cc.Label);
        if (!warnLabel) {
            console.warn('[BridgeReconnect] warn_label not found');
            return;
        }
        warnNode.active = true;
        const text = i18nMgr.Get(RECONNECTING_TEXT_KEY);
        warnLabel.string =
            text === RECONNECTING_TEXT_KEY ? RECONNECTING_TEXT_FALLBACK : text.replace('{0}', String(this._reconnectSecondsLeft));
    }

    private _findChild(root: cc.Node, name: string): cc.Node | null {
        const direct = root.getChildByName(name);
        if (direct) return direct;
        for (const child of root.children) {
            const target = this._findChild(child, name);
            if (target) return target;
        }
        return null;
    }

    private _startMaskTextCountdown(): void {
        this._stopMaskTextCountdown();
        this._reconnectSecondsLeft = RECONNECT_TEXT_SECONDS;
        this._setMaskText();
        this._textCountdownTimer = window.setInterval(() => {
            this._reconnectSecondsLeft = Math.max(0, this._reconnectSecondsLeft - 1);
            this._setMaskText();
        }, 1000);
    }

    private _stopMaskTextCountdown(): void {
        if (this._textCountdownTimer) {
            clearInterval(this._textCountdownTimer);
            this._textCountdownTimer = 0;
        }
    }

    private _hideMask(): void {
        if (!this._maskShown) return;
        this._stopMaskTextCountdown();
        if (Main.Reconnect && Main.Reconnect.isValid) {
            Main.Reconnect.active = false;
        }
        this._maskShown = false;
    }

    private _armHideFallback(): void {
        this._cancelHideFallback();
        this._hideFallbackTimer = setTimeout(() => {
            this._hideFallbackTimer = 0;
            this._hideMask();
        }, REGISTER_HIDE_FALLBACK_MS) as unknown as number;
    }

    private _cancelHideFallback(): void {
        if (this._hideFallbackTimer) {
            clearTimeout(this._hideFallbackTimer);
            this._hideFallbackTimer = 0;
        }
    }

    private _notifyFailure(reason: string): void {
        // adaptation10050=网络异常 / ReConnectError001=重连服务器失败，请检测网络环境
        const key = reason === 'auth-invalid' ? 'tokenFail' : 'ReConnectError001';
        UIComponent.Instance.Toast(i18nMgr.Get(key) || '网络异常');
    }
}

// 调试用：暴露到 window 方便控制台触发 StartReconnect。
(window as any).BridgeReconnectComponent = BridgeReconnectComponent;
