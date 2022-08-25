
/**
 * 资源引用
 */

export enum AssetFold {
    Texture_Common,
    Texture_Antcard,
    Texture_Flag,
    Texture_Loading,
    Texture_Login,
    Texture_PanelUI,
    Texture_TexasUI,
    Texture_UIGameNiuZai,
    Texture_Lobby_UIMine,
    Texture_Lobby_UIMatch,
    resources_prefab_component,

}
const { ccclass, property, executionOrder } = cc._decorator;

@ccclass
@executionOrder(-1) // 优先级 < 0 ,节点提前执行这个组件
export default class AssetContext extends cc.Component {

    @property({ type: cc.Enum(AssetFold) })
    fold: AssetFold = AssetFold.Texture_Common;

    @property([cc.Asset])
    assets: cc.Asset[] = [];

    static map: { [name: string]: cc.Asset } = {};

    onLoad() {
        for (let asset of this.assets) {
            let key = `${AssetFold[this.fold]}|${asset.name}`;
            AssetContext.map[key] = asset;
        }
    }
    /**
     * 通过索引名,获取资源
     * @param name 
     * @returns 
     */
    public static getAsset<T extends cc.Asset>(name: string, fold: AssetFold = AssetFold.Texture_Common): T {
        let key = `${AssetFold[fold]}|${name}`;
        return AssetContext.map[key] as T;
    }

}
(window as any).AssetContext = AssetContext;