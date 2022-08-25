
/**
 * 资源引用
 */

export enum AssetFold {
    texture_common,
    texture_Antcard,
    texture_flag,
    texture_loading,
    texture_login,
    texture_PanelUI,
    texture_TexasUI,
    texture_UIGameNiuZai,
    texture_lobby_UIMine,
    texture_lobby_UIMatch,
    resources_prefab_component,

}
const { ccclass, property, executionOrder } = cc._decorator;

@ccclass
@executionOrder(-1) // 优先级 < 0 ,节点提前执行这个组件
export default class AssetContext extends cc.Component {

    @property({ type: cc.Enum(AssetFold) })
    fold: AssetFold = AssetFold.texture_common;

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
    public static getAsset<T extends cc.Asset>(name: string, fold: AssetFold = AssetFold.texture_common): T {
        let key = `${AssetFold[fold]}|${name}`;
        return AssetContext.map[key] as T;
    }

}
(window as any).AssetContext = AssetContext;