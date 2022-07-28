import TexasConfig from "../config/TexasConfig"
import StorageKey from "../session/StorageKey"
import AssetContext from "../ui/component/AssetContext";

export default class TexasGame {

    private setting = {
        deskType: null,
    }
    //桌布资源索引[desk,table]
    deskTypeIndexs = [
        [0],
        [1],
        [2],
        [3],
        [4],
        [5],
        [6],
        [7],
        [8, 1],
        [9, 2],
        [10, 3],
        [11, 5],
    ]
    constructor() {

    }
    //获取桌面样式
    get deskType() {

        (this.setting.deskType == null) && (this.setting.deskType = +localStorage.getItem(StorageKey.SettingDeskType) || TexasConfig.DefaultDeskType);

        return this.setting.deskType;
    }
    //根据样式获取桌布资源
    getDeskSpriteFrames(index: number): cc.SpriteFrame[] {
        let c = this.deskTypeIndexs[index];
        let desk = AssetContext.getAsset("TexasDeskBg" + c[0]) as cc.SpriteFrame;
        let table = AssetContext.getAsset("TexasTableBg" + c[1]) as cc.SpriteFrame;
        return [desk, table];
    }

}
