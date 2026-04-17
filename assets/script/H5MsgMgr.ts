/**
 * H5MsgMgr.ts
 *
 * H5 层（Vue/Vite）与 Cocos Creator 层之间的消息桥接管理器。
 * 负责接收 H5 发来的消息并分发，以及向 H5 层发送消息。
 *
 * 握手机制：
 *   1. CC 加载完成 → 设置 window.__CC_READY__ = true
 *   2. H5 加载完成 → 发送 h5Ready 消息到 CC
 *   3. CC 收到 h5Ready → 回复 ccAck → 握手完成
 *   4. 超时未收到 → 强制放行
 *
 * msgtype 约定：
 *   CC → H5:
 *     msgtype=0 或 undefined → H5 转发（网络消息）
 *     msgtype=1              → H5 层自行处理
 *   H5 → CC:
 *     msgtype=1              → H5 层发来的指令
 *     msgtype=0 或 undefined → H5 转发的网络数据
 *
 * 使用方式：
 *   H5MsgMgr.Instance.init();                       // 初始化消息监听
 *   H5MsgMgr.Instance.startHandshake();              // 启动握手
 *   H5MsgMgr.sendToH5(action, msgtype, payload);     // 向 H5 发消息
 *   H5MsgMgr.Instance.on('xxx', fn);                 // 注册消息监听
 */

const TAG = '[H5Bridge]';

/** 握手超时时间（毫秒） */
const HANDSHAKE_TIMEOUT = 10000;

export default class H5MsgMgr {

    private static _instance: H5MsgMgr = null;
    static get Instance(): H5MsgMgr {
        if (!H5MsgMgr._instance) {
            H5MsgMgr._instance = new H5MsgMgr();
        }
        return H5MsgMgr._instance;
    }

    /** 消息监听器表: action → callback(payload, msgtype) */
    private _listeners: { [action: string]: (payload: any, msgtype?: number) => void } = {};

    /** 握手是否完成 */
    private _handshakeDone: boolean = false;
    /** 握手前缓存的消息队列 */
    private _pendingMessages: any[] = [];
    /** 握手超时定时器 */
    private _handshakeTimer: number = null;

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

            // 格式: { source: 'h5', payload: string }
            // 只接收 H5 发来的消息，忽略自己发出的 cc 回声
            if (typeof data === 'object' && data.source === 'h5') {
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

    // ─── 握手机制 ──────────────────────────────────────

    /**
     * 启动握手流程：
     * 1. 设置 window.__CC_READY__ = true
     * 2. 注册 h5Ready 监听 → 收到后回复 ccAck → 握手完成
     * 3. 超时未收到 → 强制放行
     */
    startHandshake(): void {
        // H5 主动发来 h5Ready → CC 回复 ccAck
        this.on('h5Ready', () => {
            console.log(TAG, '收到 h5Ready，回复 ccAck');
            H5MsgMgr.sendToH5('ccAck', 1);
            this._completeHandshake();
        });

        // H5 收到 ccReady 后回复的 h5Ack
        this.on('h5Ack', () => {
            console.log(TAG, '收到 h5Ack');
            this._completeHandshake();
        });

        // 设置 CC 就绪标志
        (window as any).__CC_READY__ = true;
        console.log(TAG, '__CC_READY__ 已设置');

        // 如果握手尚未完成，发送 ccReady 通知 H5
        // （sendToH5 可能同步触发 H5 回调完成握手，所以 log 放在发送前）
        if (!this._handshakeDone) {
            console.log(TAG, '发送 ccReady，等待 H5 回复 h5Ack 或 h5Ready');
            H5MsgMgr.sendToH5('ccReady', 1);
        } else {
            console.log(TAG, '握手已通过 h5Ready 完成，跳过发送 ccReady');
        }

        // 握手已完成则无需超时
        if (this._handshakeDone) return;

        // 超时保护
        this._handshakeTimer = window.setTimeout(() => {
            if (!this._handshakeDone) {
                console.warn(TAG, '握手超时，强制放行');
                this._completeHandshake();
            }
        }, HANDSHAKE_TIMEOUT);
    }

    /** 标记握手完成，清理定时器，flush 消息队列 */
    private _completeHandshake(): void {
        if (this._handshakeDone) return;
        this._handshakeDone = true;

        console.log(TAG, '握手完成');

        // 清理定时器
        if (this._handshakeTimer) {
            clearTimeout(this._handshakeTimer);
            this._handshakeTimer = null;
        }

        // 发送握手前缓存的消息
        this._flushPendingMessages();
    }

    /** 逐条发送缓存的消息 */
    private _flushPendingMessages(): void {
        const msgs = this._pendingMessages.splice(0);
        if (msgs.length === 0) return;

        console.log(TAG, `发送 ${msgs.length} 条缓存消息`);
        for (const msg of msgs) {
            H5MsgMgr._post(msg);
        }
    }

    /** 握手是否已完成 */
    get handshakeDone(): boolean {
        return this._handshakeDone;
    }

    // ─── 接收消息 ─────────────────────────────────────

    /**
     * 处理从 H5 层收到的原始消息字符串
     * 消息格式: { action, payload, msgtype, requestId, timestamp }
     *
     * msgtype 路由（H5 → CC）：
     *   msgtype=1   → H5 层指令，分发给 action 监听器
     *   msgtype=0   → H5 网络转发数据，分发给 action 监听器
     *   undefined   → 同 msgtype=0
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

            // 忽略自己发出的回声（postMessage 同 window 自己也会收到）
            if (msg.source === 'cc') return;

            const msgtype = msg.msgtype;
            console.log(TAG, '收到消息:', msg.action, 'msgtype:', msgtype);

            // 分发给注册的监听器
            const fn = this._listeners[msg.action];
            if (fn) {
                fn(msg.payload, msgtype);
            } else {
                console.log(TAG, '未处理的消息:', msg.action, 'msgtype:', msgtype);
            }
        } catch (e) {
            console.warn(TAG, '消息解析失败:', rawData, e);
        }
    }

    // ─── 发送消息 ─────────────────────────────────────

    /**
     * 向 H5 层发送消息
     * @param action  消息类型
     * @param msgtype 0=转发/网络消息（默认），1=H5 层自行处理
     * @param payload 数据
     *
     * 握手完成前的业务消息会进队列，握手完成后统一发送。
     * ccAck 等握手消息不受队列限制。
     */
    static sendToH5(action: string, msgtype: number = 0, payload?: any): void {
        const msg = {
            action,
            msgtype,
            payload,
            source: 'cc',
            requestId: `cocos_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            timestamp: Date.now(),
        };

        // 握手消息（ccReady / ccAck）立即发送，不走队列
        if (action === 'ccReady' || action === 'ccAck') {
            H5MsgMgr._post(msg);
            return;
        }

        // 握手未完成 → 业务消息进队列
        if (!H5MsgMgr.Instance._handshakeDone) {
            H5MsgMgr.Instance._pendingMessages.push(msg);
            console.log(TAG, '握手未完成，消息进队列:', action);
            return;
        }

        // 正常发送
        H5MsgMgr._post(msg);
    }

    /**
     * 通过 postMessage 异步发送消息到 H5 层
     * 直接发送 JSON 字符串，H5 现有的 string 监听即可接收
     */
    private static _post(msg: any): void {
        const json = JSON.stringify(msg);
        setTimeout(() => {
            window.postMessage(json, '*');
        }, 0);
    }

    // ─── 监听器注册 ───────────────────────────────────

    /**
     * 注册 H5 消息监听
     * @param action   消息类型（如 'enterTable', 'h5Ready' 等）
     * @param callback 收到消息时的回调，第二个参数为 msgtype
     */
    on(action: string, callback: (payload: any, msgtype?: number) => void): void {
        this._listeners[action] = callback;
    }

    /**
     * 移除 H5 消息监听
     */
    off(action: string): void {
        delete this._listeners[action];
    }
}
