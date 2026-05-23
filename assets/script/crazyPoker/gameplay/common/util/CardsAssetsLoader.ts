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

class CardsAssetsLoader {
    
    private _frameCache: Record<string, cc.SpriteFrame> = {};
    private _isInitialized: boolean = false;

    constructor() {
    }

    /**
     * 全自动初始化缓存
     * 在第一次获取 SpriteFrame 时自动触发
     */
    private ensureInitialized(): boolean {
        if (this._isInitialized) return true;

        const prefab = cc.resources.get<cc.Prefab>("main/rc/texture_BigCard1", cc.Prefab);
        if (!prefab || !prefab.data) {
            console.warn("[CardsAssetsLoader] 大仓库预制体尚未加载到内存中，请确保在入场前执行过 cc.resources.load");
            return false;
        }

        const rootNode = prefab.data;
        const children = rootNode.children;

        // 遍历预制体子节点，将 SpriteFrame 指针压扁存入字典
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const sprite = child.getComponent(cc.Sprite);
            if (sprite && sprite.spriteFrame) {
                this._frameCache[child.name] = sprite.spriteFrame;
            }
        }

        this._isInitialized = true;
        console.log("[CardsAssetsLoader] 扑克牌缓存字典初始化成功，共缓存数量：" + Object.keys(this._frameCache).length);
        return true;
    }

    /**
     * O(1) 纯内存哈希查询接口
     * @param cardNum 0-51的数字，-1为暗牌背面
     */
    public getSpriteFrame(cardNum: number): cc.SpriteFrame {
        if (!this.ensureInitialized()) {
            console.log(123123123123);
            return null;
        }
        const num = PokerMap[cardNum];
        const key = cardNum === -1 ? "p_88" : `p_${num}`;
        return this._frameCache[key] ?? null;
    }

    /**
     * 清理数据与状态，解绑显存引用
     * 外部退出房间返回大厅时，必须手动调用此方法擦屁股
     */
    public clear() {
        this._frameCache = {};
        this._isInitialized = false;
        console.log("[CardsAssetsLoader] 扑克牌实例缓存已成功释放清空");
    }
}

// 核心：直接 new 出实例，并作为默认导出
const cardsAssetsLoader = new CardsAssetsLoader();
export default cardsAssetsLoader;