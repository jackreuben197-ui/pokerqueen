import UIBasePlus from "../../../../../ui/UIBasePlus";
import UIComponent from "../../../../../ui/UIComponent";
import { ResManager } from "../../../../../manager/ResManager";
import ProtocolAgency from "../../../../../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../../../../../net/websocket/ProtocolCode";
import { ClientMessageBroadcastMsg } from "../../../../../protobuf/holdem/req_th_broadcast_msg_pb";
import { Room, Def } from "../../../../../protobuf/holdem/define_pb";
import { Broadcast } from "../../../../../net/websocket/ProtocolHoldemMessages";
import { GameCache } from "../../../../../game/GameCache";
import TimeHelper from "../../../../../helper/TimeHelper";

const { ccclass } = cc._decorator;

// 免费 emoji type 基数: CtEmoji1(5) * 100 = 500
const EMOJI_TYPE_BASE = Def.ConsumeType.CT_EMOJI_1 * 100;

@ccclass
export default class UIEmojiDlg extends UIBasePlus {

    private contentView: cc.Node = null;
    private scrollContent: cc.Node = null;
    private itemPrefab: cc.Prefab = null;
    private targetY: number = 0;
    private startY: number = 0;
    private firstLoad: boolean = true;

    protected lateLoad(): void {
        super.lateLoad();
        this.contentView = this.node.getChildByName("UIEmojiView");
        if (this.contentView) {
            this.targetY = this.contentView.y;
            this.startY = -cc.winSize.height + 100;
            this.contentView.y = this.startY;
            this.contentView.opacity = 0;
        }
        this.scrollContent = cc.find("UIEmojiView/viewport/content", this.node);
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        if (this.contentView) {
            this.contentView.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
                e.stopPropagation();
            }, this);
        }
    }

    onShow(param?: any): void {
        super.onShow(param);
        if (this.contentView) {
            this.contentView.y = this.startY;
            this.contentView.opacity = 0;
            cc.tween(this.contentView)
                .to(0.4, { y: this.targetY, opacity: 255 }, { easing: "sineOut" })
                .start();
        }
        this.loadEmojiItems();
    }

    private async loadEmojiItems(): Promise<void> {
        if (!this.itemPrefab) {
            this.itemPrefab = await ResManager.GetOrLoad<cc.Prefab>('texas', 'prefab/ui/UIEmojiItem');
        }
        if (!this.itemPrefab || !this.scrollContent) return;

        this.scrollContent.removeAllChildren();

        if (this.firstLoad) {
            this.firstLoad = false;
            for (let i = 1; i <= 10; i++) {
                this.loadAndAddEmoji(i);
            }
            for (let i = 11; i <= 15; i++) {
                this.scheduleOnce(() => {
                    this.loadAndAddEmoji(i);
                }, (i - 10) * 0.1);
            }
        } else {
            for (let i = 1; i <= 15; i++) {
                this.loadAndAddEmoji(i);
            }
        }
    }

    private onEmojiClick(index: number): void {
        console.log(index);
        this.sendEmojiBroadcast(index);
        this.scheduleOnce(() => {
            UIComponent.close(this.UIDefine);
        }, 0.26);
    }

    private sendEmojiBroadcast(emojiIndex: number): void {
        const gc = GameCache.Instance;

        // 1. 构造内层消息（JSON.stringify 会包含所有字段）
        const broadcastMsgData = JSON.stringify({
            name: gc.nick,
            type: EMOJI_TYPE_BASE + (emojiIndex - 1),
            user_id: gc.userId,
            target_user_id: 0,
            message: "",
            msgType: 1,
            time: TimeHelper.Now,
            sex: gc.sex,
            headUrl: gc.headPic,
        });

        // 2. 外层包装 { code: 10001, data: ... }
        const extraJson = Broadcast.Request({
            code: 10001,
            data: broadcastMsgData,
        });

        // 3. 构造 protobuf 消息
        const msg = new ClientMessageBroadcastMsg();
        const room = new Room();
        room.setRoomId(gc.room_id);
        room.setMatchId(gc.match_id);
        msg.setRoom(room);
        msg.setConsume(Def.ConsumeType.CT_NONE);
        msg.setMsgType(Def.BroadcastMsgType.BC_MSG_EMOJI);
        // Extra 是 bytes 类型，需要转为 Uint8Array
        const extraBytes = new Uint8Array(Array.from(extraJson).map(c => c.charCodeAt(0)));
        msg.setExtra(extraBytes);
        msg.setMessage("");

        // 4. 发送
        ProtocolAgency.Send<ClientMessageBroadcastMsg.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_BroadcastMsg,
            RoomID: gc.room_id,
            MatchID: gc.match_id,
            Body: msg.toObject(),
        });
    }

    private onClickClose(): void {
        UIComponent.close(this.UIDefine);
    }

    private loadAndAddEmoji(index: number): void {
        cc.resources.load(`emoji/em${index}`, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
            if (err || !spriteFrame) return;
            const itemNode = cc.instantiate(this.itemPrefab);
            itemNode.parent = this.scrollContent;
            const item = itemNode.getComponent("UIEmojiItem");
            if (item) {
                item.onShow({
                    spriteFrame: spriteFrame,
                    showDiamond: index < 11,
                    index: index,
                    onClick: this.onEmojiClick.bind(this),
                });
            }
        });
    }
}
