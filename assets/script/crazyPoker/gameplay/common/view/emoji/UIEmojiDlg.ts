import UIBasePlus from '../../../../../ui/UIBasePlus';
import UIComponent from '../../../../../ui/UIComponent';
import { ResManager } from '../../../../../manager/ResManager';
import ProtocolAgency from '../../../../../net/websocket/ProtocolAgency';
import { ProtocolCode } from '../../../../../net/websocket/ProtocolCode';
import { ClientMessageBroadcastMsg } from '../../../../../protobuf/holdem/req_th_broadcast_msg_pb';
import { Room, Def } from '../../../../../protobuf/holdem/define_pb';
import { Broadcast } from '../../../../../net/websocket/ProtocolHoldemMessages';
import { GameCache } from '../../../../../game/GameCache';
import TimeHelper from '../../../../../helper/TimeHelper';
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

    // ===== 表情分类（标签页，底部图标）=====
    private tabBar: cc.Node = null;
    private tabUnderline: cc.Node = null;
    private curCategory: number = 0;
    /** 标签栏 Y 坐标（面板底部，可在此微调位置；越大越靠上）*/
    private static readonly TAB_Y = -255;
    /** 标签图标尺寸 */
    private static readonly TAB_ICON_SIZE = 72;
    /** 选中标签下划线（红色）相对图标的 Y 偏移 */
    private static readonly TAB_UNDERLINE_Y = -46;
    /** 网格底部留白，给底部标签栏让位（可微调）*/
    private static readonly GRID_PADDING_BOTTOM = 180;
    /** 每个表情消耗的钻石数（底部显示的数值）*/
    private static readonly EMOJI_COST = 10;
    /**
     * 表情分类配置：name = 内部标识，icon = 底部标签图标（emoji/emtabN），
     * indices = 该分类包含的全局表情序号（对应 emoji/emN）。
     * 替换素材：直接用 Figma 实际 png 覆盖同名文件即可（图标 emtab1-5，表情 em16-65）。
     * 注意：表情是联网广播的，新增序号还需服务端支持对应的 emoji type。
     */
    private static readonly CATEGORIES: { name: string; icon: string; indices: number[] }[] = [
        // 每个标签 1 个底部图标 + 10 个表情。
        // 标签顺序按 Figma：Teddy → Dancing boy → Shinchan → Frog → Dog
        { name: 'Teddy', icon: 'emtab1', indices: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25] },
        { name: 'Dancing boy', icon: 'emtab2', indices: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35] },
        { name: 'Shinchan', icon: 'emtab3', indices: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45] },
        { name: 'Frog', icon: 'emtab4', indices: [46, 47, 48, 49, 50, 51, 52, 53, 54, 55] },
        { name: 'Dog', icon: 'emtab5', indices: [56, 57, 58, 59, 60, 61, 62, 63, 64, 65] }
    ];

    protected lateLoad(): void {
        super.lateLoad();
        this.contentView = this.node.getChildByName('UIEmojiView');
        if (this.contentView) {
            this.targetY = this.contentView.y;
            this.startY = -cc.winSize.height + 100;
            this.contentView.y = this.startY;
            this.contentView.opacity = 0;
        }
        this.scrollContent = cc.find('UIEmojiView/viewport/content', this.node);
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        if (this.contentView) {
            this.contentView.on(
                cc.Node.EventType.TOUCH_END,
                (e: cc.Event.EventTouch) => {
                    e.stopPropagation();
                },
                this
            );
        }
    }

    onShow(param?: any): void {
        super.onShow(param);
        if (this.contentView) {
            this.contentView.y = this.startY;
            this.contentView.opacity = 0;
            cc.tween(this.contentView).to(0.4, { y: this.targetY, opacity: 255 }, { easing: 'sineOut' }).start();
        }
        this.initEmojiPanel();
    }

    private async initEmojiPanel(): Promise<void> {
        if (!this.itemPrefab) {
            this.itemPrefab = await ResManager.GetOrLoad<cc.Prefab>('texas', 'prefab/ui/UIEmojiItem');
        }
        if (!this.itemPrefab || !this.scrollContent) return;
        // 网格底部留白，给底部标签栏让位
        const layout = this.scrollContent.getComponent(cc.Layout);
        if (layout) layout.paddingBottom = UIEmojiDlg.GRID_PADDING_BOTTOM;
        this.buildCategoryTabs();
        this.selectCategory(this.curCategory);
    }

    /** 构建底部分类标签栏（仅首次）。每个标签是一张 png 图标（emoji/emtabN），不是文字。 */
    private buildCategoryTabs(): void {
        if (this.tabBar || !this.contentView) return;
        const cats = UIEmojiDlg.CATEGORIES;
        const bar = new cc.Node('CategoryTabs');
        bar.setParent(this.contentView);
        bar.setPosition(0, UIEmojiDlg.TAB_Y);
        this.tabBar = bar;
        const size = UIEmojiDlg.TAB_ICON_SIZE;
        const totalW = 900;
        const step = totalW / cats.length;
        cats.forEach((cat, i) => {
            const tab = new cc.Node('tab' + i);
            tab.setParent(bar);
            tab.setPosition(-totalW / 2 + step * (i + 0.5), 0);
            tab.setContentSize(size, size);
            const sp = tab.addComponent(cc.Sprite);
            sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            cc.resources.load(`emoji/${cat.icon}`, cc.SpriteFrame, (err, sf: cc.SpriteFrame) => {
                if (!err && sf && cc.isValid(tab)) {
                    sp.spriteFrame = sf;
                    tab.setContentSize(size, size);
                }
            });
            tab.on(
                cc.Node.EventType.TOUCH_END,
                (e: cc.Event.EventTouch) => {
                    e.stopPropagation();
                    this.selectCategory(i);
                },
                this
            );
        });
        // 选中标签下划线：使用 Figma 红色下划线贴图 emoji/emunderline（节点 93-58878）
        const underline = new cc.Node('underline');
        underline.setParent(bar);
        underline.setContentSize(56, 5);
        underline.y = UIEmojiDlg.TAB_UNDERLINE_Y;
        const usp = underline.addComponent(cc.Sprite);
        usp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        cc.resources.load('emoji/emunderline', cc.SpriteFrame, (err, sf: cc.SpriteFrame) => {
            if (!err && sf && cc.isValid(underline)) {
                usp.spriteFrame = sf;
                underline.setContentSize(56, 5);
            }
        });
        this.tabUnderline = underline;
    }

    /** 选择分类：高亮选中图标（放大+不透明），其余缩小变暗，并渲染该分类下的表情 */
    private selectCategory(index: number): void {
        if (!this.tabBar || !this.scrollContent) return;
        this.curCategory = index;
        const cats = UIEmojiDlg.CATEGORIES;
        this.tabBar.children.forEach(tab => {
            const idx = parseInt(tab.name.replace('tab', ''));
            if (isNaN(idx)) return;
            const selected = idx === index;
            tab.scale = selected ? 1.15 : 0.9;
            tab.opacity = selected ? 255 : 140;
            if (selected && this.tabUnderline) this.tabUnderline.x = tab.x;
        });
        this.scrollContent.removeAllChildren();
        const indices = cats[index] ? cats[index].indices : [];
        for (const i of indices) this.loadAndAddEmoji(i);
    }

    private onEmojiClick(index: number): void {
        this.sendEmojiBroadcast(index);
        this.scheduleOnce(() => {
            UIComponent.close(this.UIDefine);
        }, 0.26);
        // 对话框关闭后（0.26s + 关闭动画）再显示表情动画
        setTimeout(() => {
            const gc = GameCache.Instance;
            const seat = gc.CurGame?.GetSeatByUserId(gc.nUserId);
            if (seat) {
                seat.ShowEmojiAnimation(index);
            }
        }, 400);
    }

    private sendEmojiBroadcast(emojiIndex: number): void {
        const gc = GameCache.Instance;
        // 1. 构造内层消息（JSON.stringify 会包含所有字段）
        const broadcastMsgData = JSON.stringify({
            name: gc.nick,
            type: EMOJI_TYPE_BASE + (emojiIndex - 1),
            user_id: gc.nUserId,
            target_user_id: 0,
            message: '',
            msgType: 1,
            time: TimeHelper.Now,
            sex: gc.sex,
            headUrl: gc.headPic
        });
        // 2. 外层包装 { code: 10001, data: ... }
        const extraJson = Broadcast.Request({
            code: 10001,
            data: broadcastMsgData
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
        msg.setMessage('');
        // 4. 发送
        ProtocolAgency.Send<ClientMessageBroadcastMsg.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_BroadcastMsg,
            RoomID: gc.room_id,
            MatchID: gc.match_id,
            Body: msg.toObject()
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
            // 异步加载完成顺序不固定，按 emoji 序号插入到正确位置，保证网格顺序与设计一致
            (itemNode as any).emojiIndex = index;
            let siblingIdx = 0;
            for (const child of this.scrollContent.children) {
                if (child !== itemNode && ((child as any).emojiIndex || 0) < index) siblingIdx++;
            }
            itemNode.setSiblingIndex(siblingIdx);
            const item = itemNode.getComponent('UIEmojiItem');
            if (item) {
                item.onShow({
                    spriteFrame: spriteFrame,
                    showDiamond: true,
                    diamond: UIEmojiDlg.EMOJI_COST,
                    index: index,
                    onClick: this.onEmojiClick.bind(this)
                });
            }
        });
    }
}
