import UIBasePlus from '../../../../../ui/UIBasePlus';
import UIComponent from '../../../../../ui/UIComponent';
import { UIDefine } from '../../../../../define/UIDefine';
import List from '../../../../../common/List';
import ChatMsgItem from './ChatMsgItem';
import { ProtocolCode } from '../../../../../net/websocket/ProtocolCode';
import ProtocolAgency from '../../../../../net/websocket/ProtocolAgency';
import { Broadcast, BroadcastCode, BroadcastMsg } from '../../../../../net/websocket/ProtocolHoldemMessages';
import { ClientMessageBroadcastMsg } from '../../../../../protobuf/holdem/req_th_broadcast_msg_pb';
import { Def, Room } from '../../../../../protobuf/holdem/define_pb';
import { GameCache } from '../../../../../game/GameCache';
import GC from '../../../../../frame/GameControl';
import TimeHelper from '../../../../../helper/TimeHelper';
import WebImageHelper from '../../../../../helper/WebImageHelper';
const { ccclass } = cc._decorator;

interface ChatMsgData {
    name: string;
    content: string;
    headUrl: string;
}

/** 按房间 ID 缓存聊天记录，生命周期与应用一致 */
const chatHistoryCache = new Map<number, ChatMsgData[]>();

@ccclass
export default class UIChatDlg extends UIBasePlus {
    // 自动绑定：$panel_click（背景遮罩，点击关闭）
    $panel_click: cc.Node = null;
    private _closeBtn: cc.Node = null;
    private _dlgNode: cc.Node = null;
    private _chatList: List = null;
    private _messages: ChatMsgData[] = [];
    private _editBox: cc.EditBox = null;
    private _sendBtn: cc.Node = null;
    /** 发送前缓存的聊天消息，等服务端确认成功后显示 */
    private _pendingChatMsg: ChatMsgData | null = null;

    protected override lateLoad(): void {
        super.lateLoad();
        // 点击背景遮罩关闭
        this.setButtonClick(this.$panel_click, this.click_close);
        // 查找对话框面板
        this._dlgNode = cc.find('ChatDlg', this.node);
        if (this._dlgNode) {
            this._closeBtn = this._dlgNode.getChildByName('closeBtn');
            if (this._closeBtn) {
                this._closeBtn.on(cc.Node.EventType.TOUCH_END, this.click_close, this);
            }
            // 阻止 ChatDlg 区域触摸事件冒泡，防止误触关闭
            this._dlgNode.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) => {
                e.stopPropagation();
            });
            this._dlgNode.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
                e.stopPropagation();
            });
        }
        // 获取聊天列表组件（ChatList 是根节点的直接子节点）
        const chatListNode = this.node.getChildByName('ChatList');
        if (chatListNode) {
            this._chatList = chatListNode.getComponent(List);
            // 关闭虚拟列表模式：聊天消息量不大，无需虚拟化；
            // 且虚拟列表的 _calcViewPos 在 item 数量不足以填满 ScrollView 时
            // 与 ScrollView 的"置顶"位置不兼容，导致 render 回调不触发。
            this._chatList.virtual = false;
        }
        // 获取输入框
        const editBoxNode = this.node.getChildByName('chatEditBox');
        if (editBoxNode) {
            this._editBox = editBoxNode.getComponent(cc.EditBox);
            if (this._editBox) {
                // 监听回车提交
                this._editBox.node.on('text-submit', this._onEditBoxSubmit, this);
            }
        }
        // 获取发送按钮（sendMsg 节点有 cc.Button 组件）
        this._sendBtn = this.node.getChildByName('sendMsg');
        if (this._sendBtn) {
            this.setButtonClick(this._sendBtn, this.click_sendMsg);
        }
    }

    onShow(param?: any): void {
        super.onShow(param);
        // 从缓存恢复当前房间的聊天记录
        const roomId = GameCache.Instance.room_id;
        const cached = chatHistoryCache.get(roomId);
        this._messages = cached ? cached.slice() : [];
        this._pendingChatMsg = null;
        if (this._chatList) {
            this._chatList.numItems = this._messages.length;
        }
        if (this._editBox) {
            this._editBox.string = '';
        }
        // 注册监听：1019 响应（自己发送成功确认）+ 1121 广播（他人消息）
        GC.notify.register(ProtocolCode.Protocol_Holdem_BroadcastMsg, this._onSendChatResponse, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_GetMsg, this._onReceiveChatMsg, this);
    }

    protected override lateClose(param?: any): void {
        super.lateClose(param);
        // 注销监听
        GC.notify.remove(ProtocolCode.Protocol_Holdem_BroadcastMsg, this._onSendChatResponse, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_GetMsg, this._onReceiveChatMsg, this);
    }

    /**
     * List 的 RenderEvent 回调，编辑器中绑定到 List 组件的 RenderEvent
     */
    onChatListRender(item: cc.Node, index: number): void {
        const msg = this._messages[index];
        if (!msg) return;
        // 直接通过子节点名获取 Label 赋值，避免 getComponent 类型引用不匹配的问题
        const userNameNode = item.getChildByName('userName');
        const chatContentNode = item.getChildByName('chatContent');
        if (userNameNode) {
            const label = userNameNode.getComponent(cc.Label);
            if (label) label.string = msg.name;
        }
        if (chatContentNode) {
            const label = chatContentNode.getComponent(cc.Label);
            if (label) label.string = msg.content;
        }
        // 加载头像到 Round 节点
        if (msg.headUrl) {
            const roundNode = item.getChildByName('Round');
            if (roundNode) {
                const sprite = roundNode.getComponent(cc.Sprite);
                if (sprite) {
                    WebImageHelper.SetHeadImage(sprite, msg.headUrl);
                }
            }
        }
    }

    /**
     * EditBox 回车提交
     */
    private _onEditBoxSubmit(editBox: cc.EditBox): void {
        this.click_sendMsg();
    }

    /**
     * 点击发送按钮：缓存消息数据 → 发送协议 → 等服务端确认后显示
     */
    private click_sendMsg(): void {
        if (!this._editBox) return;
        const text = this._editBox.string.trim();
        if (!text) return;
        const gc = GameCache.Instance;
        const roomId = gc.room_id;
        const matchId = gc.match_id;
        const nick = gc.nick || '';
        // 1. 缓存消息，等服务端确认后显示
        this._pendingChatMsg = { name: nick, content: text, headUrl: gc.headPic || '' };
        // 2. 构造内层消息（广播消息数据）
        const broadcastMsgData = JSON.stringify({
            name: nick,
            type: 0,
            user_id: gc.nUserId,
            target_user_id: 0,
            message: text,
            msgType: 2,
            time: TimeHelper.Now,
            sex: gc.sex,
            headUrl: gc.headPic || ''
        });
        // 3. 外层包装 { code: 1000, data: ... }
        const extraJson = Broadcast.Request({
            code: 1000,
            data: broadcastMsgData
        });
        // 4. 构造 protobuf 消息
        const msg = new ClientMessageBroadcastMsg();
        const room = new Room();
        room.setRoomId(roomId);
        room.setMatchId(matchId);
        msg.setRoom(room);
        msg.setConsume(Def.ConsumeType.CT_NONE);
        msg.setMsgType(Def.BroadcastMsgType.BC_MSG_NONE);
        msg.setMessage(text);
        const extraBytes = new Uint8Array(Array.from(extraJson).map(c => c.charCodeAt(0)));
        msg.setExtra(extraBytes);
        // 5. 发送到服务器
        ProtocolAgency.Send<ClientMessageBroadcastMsg.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_BroadcastMsg,
            RoomID: roomId,
            MatchID: matchId,
            Body: msg.toObject()
        });
        // 6. 清空输入框
        this._editBox.string = '';
    }

    /**
     * BroadcastMsg（1019）响应：服务端确认发送成功后，用缓存数据显示自己的消息
     */
    private _onSendChatResponse(rec: { status: number }): void {
        if (!rec || rec.status !== 0) return;
        if (!this._pendingChatMsg) return;
        // 服务端确认成功，显示缓存的消息
        this._addChatMessage(this._pendingChatMsg.name, this._pendingChatMsg.content, this._pendingChatMsg.headUrl);
        this._pendingChatMsg = null;
    }

    /**
     * GetMsg（1121）广播：接收房间其他成员的聊天消息
     */
    private _onReceiveChatMsg(rec: { message: string; extra: Uint8Array | string }): void {
        if (!rec) return;
        try {
            const json = Buffer.from(rec.extra.toString(), 'base64').toString();
            const responseData = Broadcast.Response(json);
            if (responseData.code !== BroadcastCode.BroadcastMsg && responseData.code !== 10001) return;
            const broadcastMsg = BroadcastMsg.Response(responseData.data);
            // 只处理文字聊天消息（type == 0 且 message 非空）
            if (broadcastMsg.type !== 0 || !broadcastMsg.message) return;
            // 过滤掉自己发的（已通过 _onSendChatResponse 显示）
            const gc = GameCache.Instance;
            if (broadcastMsg.user_id === gc.nUserId) return;
            this._addChatMessage(broadcastMsg.name || '', broadcastMsg.message, broadcastMsg.headUrl || '');
        } catch (e) {
            console.warn('[UIChatDlg] parse chat message error:', e);
        }
    }

    /**
     * 添加一条聊天消息并刷新列表
     */
    private _addChatMessage(name: string, content: string, headUrl: string = ''): void {
        const msg: ChatMsgData = { name, content, headUrl };
        this._messages.push(msg);
        // 同步写入缓存
        const roomId = GameCache.Instance.room_id;
        let cached = chatHistoryCache.get(roomId);
        if (!cached) {
            cached = [];
            chatHistoryCache.set(roomId, cached);
        }
        cached.push(msg);
        if (this._chatList) {
            this._chatList.numItems = this._messages.length;
        }
    }

    private click_close(): void {
        UIComponent.close(UIDefine.UIChatDlg);
    }
}
