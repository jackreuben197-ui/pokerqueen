import AssetContext, { AssetFold } from "../../../../../ui/component/AssetContext";
import cardsAssetsLoader from "../../util/CardsAssetsLoader";

const { ccclass, property, menu, executeInEditMode } = cc._decorator;

    const PokerMap: Record<number, { res: number; show: string }> = {
        //桃
        2: { res: 1, show: '♠2' },
        3: { res: 2, show: '♠3' },
        4: { res: 3, show: '♠4' },
        5: { res: 4, show: '♠5' },
        6: { res: 5, show: '♠6' },
        7: { res: 6, show: '♠7' },
        8: { res: 7, show: '♠8' },
        9: { res: 8, show: '♠9' },
        10: { res: 9, show: '♠10' },
        11: { res: 10, show: '♠J' },
        12: { res: 11, show: '♠Q' },
        13: { res: 12, show: '♠K' },
        14: { res: 0, show: '♠A' },
        //心
        17: { res: 14, show: '♥2' },
        18: { res: 15, show: '♥3' },
        19: { res: 16, show: '♥4' },
        20: { res: 17, show: '♥5' },
        21: { res: 18, show: '♥6' },
        22: { res: 19, show: '♥7' },
        23: { res: 20, show: '♥8' },
        24: { res: 21, show: '♥9' },
        25: { res: 22, show: '♥10' },
        26: { res: 23, show: '♥J' },
        27: { res: 24, show: '♥Q' },
        28: { res: 25, show: '♥K' },
        29: { res: 13, show: '♥A' },
        //梅
        32: { res: 27, show: '♣2' },
        33: { res: 28, show: '♣3' },
        34: { res: 29, show: '♣4' },
        35: { res: 30, show: '♣5' },
        36: { res: 31, show: '♣6' },
        37: { res: 32, show: '♣7' },
        38: { res: 33, show: '♣8' },
        39: { res: 34, show: '♣9' },
        40: { res: 35, show: '♣10' },
        41: { res: 36, show: '♣J' },
        42: { res: 37, show: '♣Q' },
        43: { res: 38, show: '♣K' },
        44: { res: 26, show: '♣A' },
        //方块
        47: { res: 40, show: '♢2' },
        48: { res: 41, show: '♢3' },
        49: { res: 42, show: '♢4' },
        50: { res: 43, show: '♢5' },
        51: { res: 44, show: '♢6' },
        52: { res: 45, show: '♢7' },
        53: { res: 46, show: '♢8' },
        54: { res: 47, show: '♢9' },
        55: { res: 48, show: '♢10' },
        56: { res: 49, show: '♢J' },
        57: { res: 50, show: '♢Q' },
        58: { res: 51, show: '♢K' },
        59: { res: 39, show: '♢A' }
    };

@ccclass
@executeInEditMode // 允许该组件在编辑器模式下实时执行
@menu('CrazyPoker/Common/CardView')
export default class CardView extends cc.Component {

    @property(cc.Sprite)
    public cardSprite: cc.Sprite = null;

    // 将原本的属性改为私有变量，作为存取器的内部数据载体
    private _cardNum: number = 10;

    // 使用 get/set 包装属性。当在编辑器属性面板修改数值时，会触发 set 方法
    @property({ type: cc.Integer, tooltip: "卡牌ID：0-51对应各牌面，-1为暗牌背面" })
    public get cardNum(): number {
        return this._cardNum;
    }

    public set cardNum(value: number) {
        this._cardNum = value;
        // 属性面板发生数值修改时，立即执行外观刷新以实现预览
        this.refreshCardView();
    }

    /**
     * Cocos 生命周期：节点加载时调用
     */
    protected onLoad(): void {
        // 初始化时根据当前的 cardNum 刷新一次外观
        let node = this.getComponent(cc.Sprite);
        if (node) this.cardSprite = node;
        this.refreshCardView();
    }

    /**
     * 外部驱动刷新牌面的唯一核心入口
     * @param cardNum 0-51 的数字，若传 -1 则自动显示暗牌背面
     */
    public initCard(cardNum: number): void {
        this._cardNum = cardNum;
        this.refreshCardView();
    }

    /**
     * 内部公共刷新方法，兼顾运行态与编辑态
     */
    private refreshCardView(): void {
        
        const sf = AssetContext.getAsset<cc.SpriteFrame>(`p_${PokerMap[this._cardNum].res}`,  AssetFold.texture_BigCard1);
        for (let k in AssetContext.map) {
            console.log(k);
        }
        console.log(11111111111,sf,this.cardSprite);
        if (sf) {
            if (this.cardSprite) {
                this.cardSprite.spriteFrame = sf;
            }
        } else {
            // 过滤非运行状态，只有在游戏实际运行且节点有效时才抛出资源缺失错误，避免卡死编辑器
            if (cc.isValid(this.node)) {
                console.error(`[CardView] 未能成功获取到 cardNum 为 ${this._cardNum} 的 SpriteFrame 指针`);
            }
        }
    }
}