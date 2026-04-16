/**
 * H5MsgMgr.ts
 *
 * H5 层（Vue/Vite）与 Cocos Creator 层之间的消息桥接管理器。
 * 负责接收 H5 发来的消息并分发，以及向 H5 层发送消息。
 *
 * 使用方式：
 *   H5MsgMgr.Instance.init();          // 初始化（在 Main.ts 中调用一次）
 *   H5MsgMgr.sendToH5(action, payload); // 向 H5 发消息
 *   H5MsgMgr.Instance.on('xxx', fn);    // 注册消息监听
 */

const TAG = '[H5Bridge]';

export default class H5MsgMgr {

    private static _instance: H5MsgMgr = null;
    static get Instance(): H5MsgMgr {
        if (!H5MsgMgr._instance) {
            H5MsgMgr._instance = new H5MsgMgr();
        }
        return H5MsgMgr._instance;
    }

    /** 消息监听器表: action → callback */
    private _listeners: { [action: string]: (payload: any) => void } = {};

    private constructor() {}

    // ─── 初始化 ──────────────────────────────────────

    /**
     * 初始化 H5 Bridge 消息监听。
     * 注册 window.CocosBridge（bridge.js 直接调用），
     * 兼容 window.postMessage 和 cocos:// scheme。
     */
    init(): void {
        const self = this;

        // 方式1：bridge.js 检测到 window.CocosBridge 后直接调用
        (window as any).CocosBridge = {
            postMessage: (jsonStr: string) => {
                self._onMessage(jsonStr);
            }
        };
        console.log(TAG, 'window.CocosBridge 已注册');

        // 方式2：监听 window.postMessage
        window.addEventListener('message', (e: MessageEvent) => {
            const data = e.data;
            if (!data) return;

            // 格式: { source: 'cocos-game' | 'h5-game', payload: string }
            if (typeof data === 'object' && (data.source === 'cocos-game' || data.source === 'h5-game')) {
                const payload = data.payload;
                if (typeof payload === 'string') {
                    self._onMessage(payload);
                }
                return;
            }

            // 格式: 直接 JSON 字符串
            if (typeof data === 'string' && data.includes('action')) {
                self._onMessage(data);
            }
        });

        console.log(TAG, '消息监听已初始化');
    }

    // ─── 接收消息 ─────────────────────────────────────

    /**
     * 处理从 H5 层收到的原始消息字符串
     * 消息格式: { action: string, payload: any, requestId: string, timestamp: number }
     */
    private _onMessage(rawData: string): void {
        try {
            let jsonStr = rawData;

            // 兼容 cocos:// scheme 包裹
            if (jsonStr.startsWith('cocos://')) {
                const match = jsonStr.match(/data=([^&]+)/);
                if (match) jsonStr = decodeURIComponent(match[1]);
            }

            const msg = JSON.parse(jsonStr);
            if (!msg.action) return;

            console.log(TAG, '收到消息:', msg.action, msg.payload);

            // 分发给注册的监听器
            const fn = this._listeners[msg.action];
            if (fn) {
                fn(msg.payload);
            } else {
                console.log(TAG, '未处理的消息类型:', msg.action);
            }
        } catch (e) {
            console.warn(TAG, '消息解析失败:', rawData, e);
        }
    }

    // ─── 发送消息 ─────────────────────────────────────

    /**
     * 向 H5 层发送消息
     */
    static sendToH5(action: string, payload?: any): void {
        const msg = JSON.stringify({
            action,
            payload,
            requestId: `cocos_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            timestamp: Date.now(),
        });
        const fn = (window as any).__H5_GAME_ON_COCOS_MESSAGE__;
        if (typeof fn === 'function') {
            fn(msg);
        } else {
            console.warn(TAG, 'H5 层未就绪，消息未发送:', action);
        }
    }

    // ─── 监听器注册 ───────────────────────────────────

    /**
     * 注册 H5 消息监听
     * @param action 消息类型（如 'enterTable', 'ws_message' 等）
     * @param callback 收到消息时的回调
     */
    on(action: string, callback: (payload: any) => void): void {
        this._listeners[action] = callback;
    }

    /**
     * 移除 H5 消息监听
     */
    off(action: string): void {
        delete this._listeners[action];
    }
}
