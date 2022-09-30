
import AssetContext from "../ui/component/AssetContext";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WebImageHelper {

    private static mUrlTexture: Map<string, cc.SpriteFrame> = new Map();//key=后缀,value=SpriteFrame

    public static SetHeadImage(rawImage: cc.Sprite, url: string): void {

        let spriteFrame = this.mUrlTexture.get(url);
        if (spriteFrame) {
            rawImage.spriteFrame = spriteFrame;
        }
        else {
            rawImage.spriteFrame = AssetContext.getAsset("image_default_head_ant");

            cc.assetManager.loadRemote(url, cc.Texture2D, (err, asset: cc.Texture2D) => {

                if (err) {

                } else {
                    let spriteframe = new cc.SpriteFrame(asset);
                    rawImage.spriteFrame = spriteframe;
                    this.mUrlTexture.set(url, spriteframe);
                }
            })
        }
    }
    public static SetUrlImage(rawImage: cc.Sprite, url: string, defaultImage?: cc.SpriteFrame) {
     return   new Promise<void>((resolve, reject) => {
        let fixUrl = url.replace("http:", "https:");
        let spriteFrame = this.mUrlTexture.get(fixUrl);

        if (spriteFrame) {
            rawImage.spriteFrame = spriteFrame;
        }
        else {

            if (defaultImage) rawImage.spriteFrame = defaultImage;

            if (url == null || url == "" || url == "-1") return;

            cc.assetManager.loadRemote(url, cc.Texture2D, (err, asset: cc.Texture2D) => {
                if (err) {

                } else {
                    let spriteframe = new cc.SpriteFrame(asset);
                    rawImage.spriteFrame = spriteframe;
                    this.mUrlTexture.set(url, spriteframe);
                    resolve();
                }
            })
        }

      })
    }
}
