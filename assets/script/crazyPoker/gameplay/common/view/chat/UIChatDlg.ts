import UIBasePlus from '../../../../../ui/UIBasePlus';
import UIComponent from '../../../../../ui/UIComponent';
import { UIDefine } from '../../../../../define/UIDefine';
import List from '../../../../../common/List';
import ChatMsgItem from './ChatMsgItem';
import ChatManager, { ChatMsgData } from './ChatManager';
import { ProtocolCode } from '../../../../../net/websocket/ProtocolCode';
import ProtocolAgency from '../../../../../net/websocket/ProtocolAgency';
import { Broadcast, BroadcastCode, BroadcastMsg } from '../../../../../net/websocket/ProtocolHoldemMessages';
import { ClientMessageBroadcastMsg } from '../../../../../protobuf/holdem/req_th_broadcast_msg_pb';
import { Def, Room } from '../../../../../protobuf/holdem/define_pb';
import { GameCache } from '../../../../../game/GameCache';
import GC from '../../../../../frame/GameControl';
import TimeHelper from '../../../../../helper/TimeHelper';
import WebImageHelper from '../../../../../helper/WebImageHelper';
const { ccclass, property } = cc._decorator;
/** 聊天模式：chatOnly = 只发聊天（默认），danmuAndChat = 同时发弹幕+聊天 */
type ChatMode = 'chatOnly' | 'danmuAndChat';

@ccclass
export default class UIChatDlg extends UIBasePlus {
    // 自动绑定：$panel_click（背景遮罩，点击关闭）
    $panel_click: cc.Node = null;
    @property(cc.SpriteFrame)
    checkedFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    uncheckedFrame: cc.SpriteFrame = null;
    private _closeBtn: cc.Node = null;
    private _dlgNode: cc.Node = null;
    private _dlgTitleLabel: cc.Label = null;
    private _chatList: List = null;
    private _messages: ChatMsgData[] = [];
    private _editBox: cc.EditBox = null;
    private _sendBtn: cc.Node = null;
    /** 发送前缓存的聊天消息，等服务端确认成功后显示 */
    private _pendingChatMsg: ChatMsgData | null = null;
    /** 聊天模式节点引用 */
    private _danmakuNode: cc.Node = null;
    private _chatOnlyNode: cc.Node = null;
    private _danmuAndChatNode: cc.Node = null;
    /** 当前选中的聊天模式，默认只发聊天 */
    private _chatMode: ChatMode = 'chatOnly';

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
            // 缓存标题 Label
            const dlgTitleNode = this._dlgNode.getChildByName('dlgTitle');
            if (dlgTitleNode) {
                this._dlgTitleLabel = dlgTitleNode.getComponent(cc.Label);
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
        // 聊天模式切换（chatOnly / danmuAndChat）
        this._danmakuNode = this.node.getChildByName('DanmakuNode');
        if (this._danmakuNode) {
            this._chatOnlyNode = this._danmakuNode.getChildByName('chatOnly');
            this._danmuAndChatNode = this._danmakuNode.getChildByName('danmuAndChat');
            if (this._chatOnlyNode) {
                this._chatOnlyNode.on(cc.Node.EventType.TOUCH_END, () => this._onChatModeToggle('chatOnly'), this);
            }
            if (this._danmuAndChatNode) {
                this._danmuAndChatNode.on(cc.Node.EventType.TOUCH_END, () => this._onChatModeToggle('danmuAndChat'), this);
            }
            this._updateChatModeUI();
        }
    }

    onShow(param?: any): void {
        super.onShow(param);
        const roomId = GameCache.Instance.room_id;
        const mgr = ChatManager.Instance;
        // 注册实时消息回调（先注册，再读缓存，避免丢失中间到达的消息）
        mgr.onNewMessage = this._onNewMessage.bind(this);
        // 打开聊天窗口，隐藏 alert 红点
        mgr.hideAlert();
        // 从 ChatManager 恢复当前房间的全部聊天记录
        this._messages = mgr.getMessages(roomId).slice();
        this._pendingChatMsg = null;
        if (this._chatList) {
            this._chatList.numItems = this._messages.length;
        }
        if (this._editBox) {
            this._editBox.string = '';
        }
        // 设置对话框标题为当前房间名
        if (this._dlgTitleLabel) {
            this._dlgTitleLabel.string = GameCache.Instance.roomName || '';
        }
        // 只监听 1019（自己发送成功确认），1121 由 ChatManager 统一处理
        GC.notify.register(ProtocolCode.Protocol_Holdem_BroadcastMsg, this._onSendChatResponse, this);
    }

    protected override lateClose(param?: any): void {
        super.lateClose(param);
        // 注销 1019 监听
        GC.notify.remove(ProtocolCode.Protocol_Holdem_BroadcastMsg, this._onSendChatResponse, this);
        // 断开 ChatManager 实时回调
        ChatManager.Instance.onNewMessage = null;
    }

    /**
     * ChatManager 实时推送新消息回调（UI 打开期间）
     */
    private _onNewMessage(msg: ChatMsgData): void {
        this._messages.push(msg);
        if (this._chatList) {
            this._chatList.numItems = this._messages.length;
        }
    }

    /**
     * List 的 RenderEvent 回调，编辑器中绑定到 List 组件的 RenderEvent
     */
    onChatListRender(item: cc.Node, index: number): void {
        const msg = this._messages[index];
        if (!msg) return;
        // 新增的消息（最后一条）做淡入，已有的直接显示
        const isNewMsg = index === this._messages.length - 1;
        // 结构:
        //   ChatMsgItem > chatMsgNode > chatBg > chatContent (Label)
        //   ChatMsgItem > userInfoNode > Round (Sprite)
        //   ChatMsgItem > userInfoNode > name_male_time > userName / male / female / time
        const chatMsgNode = item.getChildByName('chatMsgNode');
        const userInfoNode = item.getChildByName('userInfoNode');
        if (!chatMsgNode || !userInfoNode) return;
        const chatBg = chatMsgNode.getChildByName('chatBg');
        const nameMaleTime = userInfoNode.getChildByName('name_male_time');
        // 设置聊天内容
        if (chatBg) {
            const chatContentNode = chatBg.getChildByName('chatContent');
            if (chatContentNode) {
                const label = chatContentNode.getComponent(cc.Label);
                if (label) label.string = msg.content;
            }
        }
        // 设置用户名、性别、时间
        if (nameMaleTime) {
            const userNameNode = nameMaleTime.getChildByName('userName');
            if (userNameNode) {
                const label = userNameNode.getComponent(cc.Label);
                if (label) label.string = msg.name;
            }
            const maleNode = nameMaleTime.getChildByName('male');
            const femaleNode = nameMaleTime.getChildByName('female');
            if (maleNode) maleNode.active = msg.sex === 1;
            if (femaleNode) femaleNode.active = msg.sex === 2;
            const timeNode = nameMaleTime.getChildByName('time');
            if (timeNode) {
                const label = timeNode.getComponent(cc.Label);
                if (label) label.string = msg.time;
            }
        }
        // 加载头像到 Round 节点
        if (msg.headUrl) {
            const roundNode = userInfoNode.getChildByName('Round');
            if (roundNode) {
                const sprite = roundNode.getComponent(cc.Sprite);
                if (sprite) {
                    WebImageHelper.SetHeadImage(sprite, msg.headUrl);
                }
            }
        }
        // 显示：已有消息直接显示，新消息 0.8 秒淡入
        if (isNewMsg) {
            item.runAction(cc.fadeIn(0.8));
        } else {
            item.opacity = 255;
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
        this._pendingChatMsg = { name: nick, content: text, headUrl: gc.headPic || '', sex: gc.sex, time: this._formatTime() };
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
        msg.setMsgType(Def.BroadcastMsgType.BC_MSG_AVATAR);
        msg.setMessage(text);
        const extraBytes = new TextEncoder().encode(extraJson);
        msg.setExtra(extraBytes);
        // 5. 发送到服务器
        ProtocolAgency.Send<ClientMessageBroadcastMsg.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_BroadcastMsg,
            RoomID: roomId,
            MatchID: matchId,
            Body: msg.toObject()
        });
        // 6. 如果选中了 danmuAndChat，额外发一条弹幕协议
        if (this._chatMode === 'danmuAndChat') {
            this._sendDanmaku(text, roomId, matchId, gc);
            UIComponent.Instance.Toast(`[弹幕] ${nick}: ${text}`);
        }
        // 7. 清空输入框
        this._editBox.string = '';
    }

    /**
     * BroadcastMsg（1019）响应：服务端确认发送成功后，用缓存数据显示自己的消息
     */
    private _onSendChatResponse(rec: { status: number }): void {
        if (!rec || rec.status !== 0) return;
        if (!this._pendingChatMsg) return;
        // 服务端确认成功，显示缓存的消息
        this._addChatMessage(
            this._pendingChatMsg.name,
            this._pendingChatMsg.content,
            this._pendingChatMsg.headUrl,
            this._pendingChatMsg.sex,
            this._pendingChatMsg.time
        );
        this._pendingChatMsg = null;
    }

    /**
     * 添加一条聊天消息并刷新列表
     */
    private _addChatMessage(name: string, content: string, headUrl: string = '', sex: number = 0, time: string = ''): void {
        const msg: ChatMsgData = { name, content, headUrl, sex, time };
        this._messages.push(msg);
        // 同步写入 ChatManager 缓存
        ChatManager.Instance.addMessage(GameCache.Instance.room_id, msg);
        if (this._chatList) {
            this._chatList.numItems = this._messages.length;
        }
    }

    /**
     * 发送弹幕协议（参考 Unity OnSendBulletScreen）
     * 与聊天协议相同，区别：isDanmu=true, danmuType=1, BroadcastMsgType=BC_MSG_BULLET
     */
    private _sendDanmaku(text: string, roomId: number, matchId: number, gc: GameCache): void {
        const nick = gc.nick || '';
        // 构造内层弹幕数据（isDanmu=true, danmuType=1 普通弹幕）
        const danmuData = JSON.stringify({
            name: nick,
            type: 0,
            user_id: gc.nUserId,
            target_user_id: 0,
            message: text,
            msgType: 2,
            time: TimeHelper.Now,
            sex: gc.sex,
            headUrl: gc.headPic || '',
            isDanmu: true,
            danmuType: 1
        });
        const extraJson = Broadcast.Request({
            code: 1000,
            data: danmuData
        });
        const msg = new ClientMessageBroadcastMsg();
        const room = new Room();
        room.setRoomId(roomId);
        room.setMatchId(matchId);
        msg.setRoom(room);
        msg.setConsume(Def.ConsumeType.CT_NONE);
        msg.setMsgType(Def.BroadcastMsgType.BC_MSG_BULLET);
        msg.setMessage(text);
        const extraBytes = new TextEncoder().encode(extraJson);
        msg.setExtra(extraBytes);
        ProtocolAgency.Send<ClientMessageBroadcastMsg.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_BroadcastMsg,
            RoomID: roomId,
            MatchID: matchId,
            Body: msg.toObject()
        });
    }

    /** 格式化当前时间为 HH:mm（24小时制，补零） */
    private _formatTime(): string {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        return h + ':' + m;
    }

    /** 聊天模式切换点击 */
    private _onChatModeToggle(mode: ChatMode): void {
        this._chatMode = mode;
        this._updateChatModeUI();
    }

    /** 根据 _chatMode 更新两个选项的 checkSpr 纹理 */
    private _updateChatModeUI(): void {
        if (!this.checkedFrame || !this.uncheckedFrame) return;
        const pairs: [cc.Node, boolean][] = [
            [this._chatOnlyNode, this._chatMode === 'chatOnly'],
            [this._danmuAndChatNode, this._chatMode === 'danmuAndChat']
        ];
        for (const [node, selected] of pairs) {
            if (!node) continue;
            const checkSpr = node.getChildByName('checkSpr');
            if (!checkSpr) continue;
            const sprite = checkSpr.getComponent(cc.Sprite);
            if (sprite) {
                sprite.spriteFrame = selected ? this.checkedFrame : this.uncheckedFrame;
            }
        }
    }

    private click_close(): void {
        UIComponent.close(UIDefine.UIChatDlg);
    }
}
