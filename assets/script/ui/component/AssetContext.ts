/*
 * @Author: xfj
 * @Date: 2022-08-25 18:30:36
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-23 14:11:22
 * @FilePath: /pokerqueen/assets/script/ui/component/AssetContext.ts
 */

/**
 * 资源引用
 */

export enum AssetFold {
    texture_common,
    texture_Antcard,
    texture_AntSecondCard,
    texture_flag,
    texture_TexasUI,
    texture_lobby_UIMine,
    texture_atlas_HistoryCard,
    texture_atlas_HistorySecondCard,
    texture_match_view,

}
const { ccclass, property, executionOrder } = cc._decorator;

@ccclass
@executionOrder(-1) // 优先级 < 0 ,节点提前执行这个组件
export default class AssetContext extends cc.Component {

    @property({ type: cc.Enum(AssetFold) })
    fold: AssetFold = AssetFold.texture_common;

    // @property([cc.Asset])
    // assets: cc.Asset[] = [];

    static map: { [name: string]: cc.Asset } = {};

    // onLoad() {
    //     // for (let asset of this.assets) {
    //     //     let key = `${AssetFold[this.fold]}|${asset.name}`;
    //     //     AssetContext.map[key] = asset;
    //     // }
    // }

    public static setAsset<T extends cc.Asset>(fold: AssetFold, name: string, asset: T) {
        let key = `${AssetFold[fold]}|${asset.name}`;
        AssetContext.map[key] = asset;
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