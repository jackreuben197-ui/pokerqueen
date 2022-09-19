const { ccclass, property } = cc._decorator;
import UIBase from "../../ui/UIBase";
import { i18nSprite } from "../../i18n/i18nSprite";
import { GameCache } from "../../game/GameCache";
@ccclass
export default class UILobby extends UIBase {

    protected onLoad(): void {
        super.onLoad();
        let widget: cc.Widget = this.node.getComponent(cc.Widget);
        widget.target = cc.find("Canvas");
    }
    protected lateLoad(): void {
        super.lateLoad();
        this.setMTTImage();
        this.setScrollTop();
        this.initUI()
    }

    private initUI(): void {
        let lbl_glod : cc.Label = this.getChildNodeOrComponent("lbl_glod").getComponent(cc.Label);
        lbl_glod.string = GameCache.Instance.gold.toString();
        let lbl_name : cc.Label = this.getChildNodeOrComponent("Text_LeftTop").getComponent(cc.Label);
        lbl_name.string = GameCache.Instance.nick.toString();
    }

    private setMTTImage() {
        let Button_MTT:cc.Node = this.getChildNodeOrComponent("Button_MTT");
        Button_MTT.getComponent(i18nSprite).string = "image_match_mtt";
    }
   
    /**
      * @description: 主要用来设置 下拉刷新--
      * @return {void}
      */
    private setScrollTop(): void {
        let scrollView: cc.Node = this.getChildNodeOrComponent("ScrollView");
        let content: cc.Node = this.getChildNodeOrComponent("Scrollview_Content");
        let ContentHeight = content.height;
        let Scrollheight = scrollView.height;
        if (ContentHeight < Scrollheight) {
            let padding: cc.Node = this.getChildNodeOrComponent("padding");
            padding.height = Scrollheight - ContentHeight + 1;
        }
        content.getComponent(cc.Layout).updateLayout();
        let ItemPrefab0: cc.Node = this.getChildNodeOrComponent("ItemPrefab0");
        let root: cc.Node = ItemPrefab0.getChildByName("root");
        scrollView.on('scrolling', (e) => {
            let y = content.y;
            if (y < -100) {
                ItemPrefab0.active = true;
                root.getChildByName("arrow").active = true;
                root.getChildByName("Text_1").active = true;
                root.getChildByName("waiticon").active = false;
            }
            if (ItemPrefab0.active === true) {
                if ((y ^ 0) === 0) {
                    root.getChildByName("arrow").active = false;
                    root.getChildByName("Text_1").active = false;
                    root.getChildByName("waiticon").active = true;
                    cc.tween(root.getChildByName("waiticon")).to(0.5, { angle: -360 }).start();
                    this.scheduleOnce(() => {
                        root.getChildByName("waiticon").stopAllActions();
                        ItemPrefab0.active = false;
                    }, 0.5)
                }
            }
        })
    }
}
