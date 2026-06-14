import UIBasePlus from '../../../../../ui/UIBasePlus';
const { ccclass } = cc._decorator;

@ccclass
export default class UIEmojiItem extends UIBasePlus {
    private emojiSprite: cc.Sprite = null;
    private diamondNode: cc.Node = null;
    private numDiamondNode: cc.Node = null;
    private selectSignNode: cc.Node = null;
    private emojiIndex: number = 0;

    private onClickCallback: (index: number) => void = null;

    protected lateLoad(): void {
        super.lateLoad();
        const emojiNode = this.node.getChildByName('emoji');
        this.emojiSprite = emojiNode ? emojiNode.getComponent(cc.Sprite) : null;
        this.diamondNode = this.node.getChildByName('diamond');
        this.numDiamondNode = this.node.getChildByName('numDiamond');
        this.selectSignNode = this.node.getChildByName('selectSign');
        if (this.selectSignNode) this.selectSignNode.active = false;
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.node.on(cc.Node.EventType.TOUCH_END, this.onItemClick, this);
    }

    onShow(param?: { spriteFrame?: cc.SpriteFrame; diamond?: number; showDiamond?: boolean; index?: number; onClick?: (index: number) => void }): void {
        super.onShow(param);
        if (param?.index !== undefined) this.emojiIndex = param.index;
        if (param?.onClick) this.onClickCallback = param.onClick;
        // 网格图标使用 Figma 静态图（emoji/emN，按分类顺序）。点击后桌面再播放 Spine 动画。
        if (param?.spriteFrame && this.emojiSprite) {
            this.emojiSprite.enabled = true;
            this.emojiSprite.spriteFrame = param.spriteFrame;
        }
        const showDiamond = param?.showDiamond !== false;
        if (this.diamondNode) this.diamondNode.active = showDiamond;
        if (this.numDiamondNode) this.numDiamondNode.active = showDiamond;
        if (showDiamond && param?.diamond !== undefined && this.numDiamondNode) {
            const label = this.numDiamondNode.getComponent(cc.Label);
            if (label) label.string = String(param.diamond);
        }
    }

    private onItemClick(): void {
        if (this.selectSignNode) this.selectSignNode.active = true;
        if (this.onClickCallback) {
            this.onClickCallback(this.emojiIndex);
        }
    }
}
