
/**
 * 资源引用
 */

const { ccclass, property, executionOrder } = cc._decorator;

@ccclass
@executionOrder(-1) // 优先级 < 0 ,节点提前执行这个组件
export default class AssetContext extends cc.Component {

    @property([cc.Asset])
    assets: cc.Asset[] = [];

    static map: { [name: string]: cc.Asset } = {};

    onLoad() {
        for (let asset of this.assets) {
            AssetContext.map[asset.name] = asset;
        }
    }
    /**
     * 通过索引名,获取资源
     * @param name 
     * @returns 
     */
    public static getAsset<T extends cc.Asset>(name: string): T {
        return AssetContext.map[name] as T;
    }

}
(window as any).AssetContext = AssetContext;