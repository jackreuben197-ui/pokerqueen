import { BroadcastMsg } from '../../../../../net/websocket/ProtocolHoldemMessages';
import { GameCache } from '../../../../../game/GameCache';
import SceneManager from '../../../../../manager/SceneManager';
import UIComponent from '../../../../../ui/UIComponent';

export interface ChatMsgData {
    name: string;
    content: string;
    headUrl: string;
    sex: number;
    time: string;
}
type NewMessageCallback = (msg: ChatMsgData) => void;

/**
 * 聊天消息管理器：缓存房间内聊天消息，管理 chatBtn 上方的 alert 提醒。
 * 聊天/弹幕消息由 TexasGameProtocol.ProtocolHoldemGetMsgHandler 转发到 handleBroadcastMsg。
 */
export default class ChatManager {
    private static _instance: ChatManager = null;
    private _cache = new Map<number, ChatMsgData[]>();
    /** 聊天界面打开时注册，用于实时推送新消息到 UI */
    onNewMessage: NewMessageCallback = null;
    /** chatBtn 上的 alert 节点引用（懒加载查找） */
    private _alertNode: cc.Node = null;

    static get Instance(): ChatManager {
        if (!ChatManager._instance) {
            ChatManager._instance = new ChatManager();
        }
        return ChatManager._instance;
    }

    /** 获取 alert 节点（chatBtn 在 side_btns/main_menu 下） */
    private get _chatAlertNode(): cc.Node {
        if (this._alertNode && this._alertNode.isValid) return this._alertNode;
        const sceneNode = SceneManager.Instance.currUI;
        if (!sceneNode) return null;
        const chatBtn = cc.find('side_btns/main_menu/chatBtn', sceneNode);
        if (!chatBtn) return null;
        this._alertNode = chatBtn.getChildByName('alert');
        return this._alertNode;
    }

    getMessages(roomId: number): ChatMsgData[] {
        return this._cache.get(roomId) || [];
    }

    addMessage(roomId: number, msg: ChatMsgData): void {
        let list = this._cache.get(roomId);
        if (!list) {
            list = [];
            this._cache.set(roomId, list);
        }
        list.push(msg);
    }

    /** 显示 chatBtn 上的 alert 红点 */
    showAlert(): void {
        if (this._chatAlertNode) {
            this._chatAlertNode.active = true;
        }
    }

    /** 隐藏 chatBtn 上的 alert 红点 */
    hideAlert(): void {
        if (this._chatAlertNode) {
            this._chatAlertNode.active = false;
        }
    }

    /**
     * 由 TexasGameProtocol.ProtocolHoldemGetMsgHandler 调用，
     * 接收已解析的 BroadcastMsg 对象，处理聊天/弹幕消息。
     */
    handleBroadcastMsg(broadcastMsg: {
        name: string;
        type: number;
        user_id: number;
        target_user_id: number;
        message: string;
        isDanmu?: boolean;
        headUrl?: string;
        sex?: number;
    }): void {
        // 只处理文本聊天 (type=0) 和弹幕
        if (broadcastMsg.type !== 0 || !broadcastMsg.message) return;
        const gc = GameCache.Instance;
        // 弹幕消息 → Toast 提示
        const isDanmu = broadcastMsg.isDanmu === true;
        if (isDanmu) {
            UIComponent.Instance.Toast(`[弹幕] ${broadcastMsg.name || ''}: ${broadcastMsg.message}`);
            return;
        }
        // 过滤自己发的（走 1019 路径由 UIChatDlg 处理）
        if (broadcastMsg.user_id === gc.nUserId) return;
        const msg: ChatMsgData = {
            name: broadcastMsg.name || '',
            content: broadcastMsg.message,
            headUrl: broadcastMsg.headUrl || '',
            sex: broadcastMsg.sex || 0,
            time: this._formatTime()
        };
        this.addMessage(gc.room_id, msg);
        // 实时通知 UI
        if (this.onNewMessage) {
            this.onNewMessage(msg);
        }
        // 聊天窗口未打开时，显示 alert 提醒
        if (!this.onNewMessage) {
            this.showAlert();
        }
    }

    private _formatTime(): string {
        const now = new Date();
        return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    }
}
