import { GameConfig } from "../config/GameConfig";
import LobbyScene from "../lobby/view/LobbyScene";
import GlobalSession from "../session/GlobalSession";
import AssetContext from "../ui/component/AssetContext";


const { ccclass, property } = cc._decorator;

@ccclass
export default class WebImageHelper {

    private static defaultHead: cc.SpriteFrame = null;

    private static mUrlTexture: Map<string, cc.SpriteFrame> = new Map();//key=后缀,value=SpriteFrame

    public static SetHeadImage(rawImage: cc.Sprite, headID: string): void {
        let url = `${GameConfig.Network.HeadUrl}${headID}`;
        let spriteFrame = this.mUrlTexture.get(url);
        if (spriteFrame) {
            rawImage.spriteFrame = spriteFrame;
        }
        else {
            if (null == this.defaultHead) {
                let default_avatar: cc.SpriteFrame = AssetContext.getAsset("image_default_head_ant");
                this.defaultHead = default_avatar;
            }
            rawImage.spriteFrame = this.defaultHead;

            cc.assetManager.loadRemote(url, cc.SpriteFrame, (err, asset: cc.SpriteFrame) => {

                if (err) {

                } else {
                    rawImage.spriteFrame = asset;
                    this.mUrlTexture[url] = asset;
                }
            })
        }
    }
    public static SetUrlImage(rawImage: cc.Sprite, url: string): void {

        let spriteFrame = this.mUrlTexture.get(url);

        if (spriteFrame) {
            rawImage.spriteFrame = spriteFrame;
        }
        else {

            if (null == this.defaultHead) {
                let default_avatar: cc.SpriteFrame = AssetContext.getAsset("image_default_head_ant");
                this.defaultHead = default_avatar;
            }
            rawImage.spriteFrame = this.defaultHead;

            if (url == null || url == "" || url == "-1") return;

            cc.assetManager.loadRemote(url, cc.SpriteFrame, (err, asset: cc.SpriteFrame) => {

                if (err) {

                } else {
                    rawImage.spriteFrame = asset;
                    this.mUrlTexture[url] = asset;
                }
            })

        }
    }
}
