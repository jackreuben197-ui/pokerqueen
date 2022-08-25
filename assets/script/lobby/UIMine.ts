const { ccclass, property } = cc._decorator;
import UIBase from "../../../assets/script/ui/UIBase";
import { UIDefine } from "../define/UIDefine";
import { i18nLabel } from "../i18n/i18nLabel";
import UIManager from "../manager/UIManager";
import { Web_User_Info } from "../net/https/WebRequest";
import AssetContext, { AssetFold } from "../ui/component/AssetContext";
@ccclass
export default class UIMine extends UIBase {
    private pageData: any = null;


    items_config = [
        { string: "UIMine_btn_MyWallet", icon: "icon_btn_wallet", light_bg: "wallty_light_bg" },
        { string: "UIMine_Backpack", icon: "icon_btn_backpack", light_bg: "backpack_light_bg" },
        { string: "UIMine_btn_paipu", icon: "icon_btn_mymsg", light_bg: "message_light_bg" },
        { string: "UIMine_btn_setting", icon: "icon_btn_set", light_bg: "setting_light_bg" }
    ]

    func_item: cc.Node = null;
    content: cc.Node = null;
    nickname_lab: cc.Label;
    userid_lab: cc.Label;

    protected onLoad(): void {
        super.onLoad();
        let widget: cc.Widget = this.node.getComponent(cc.Widget);
        widget.target = cc.find("Canvas");
    }
    protected lateLoad(): void {
        super.lateLoad();
        this.func_item = this.getChildNodeOrComponent("func_item");
        this.content = this.getChildNodeOrComponent("content");
        this.nickname_lab = this.getChildNodeOrComponent("nickname_lab", cc.Label);
        this.userid_lab = this.getChildNodeOrComponent("userid_lab", cc.Label);
        this.setMine();
    }

    public onShow(param?: any): void {
        super.onShow(param);
        this.nickname_lab.string = Web_User_Info.Response.data.user.nickname;
        this.userid_lab.string = `${Web_User_Info.Response.data.user.un_id}`;
    }

    setMine(): void {

        this.func_item.active = false;
        for (let i = 0; i < this.items_config.length; i++) {
            let item = cc.instantiate(this.func_item);
            let config = this.items_config[i];
            item.active = true;
            item.parent = this.content;
            let light_bg = cc.find("Bg_Group/Light", item)?.getComponent(cc.Sprite);
            let icon = item.getChildByName("Paipu_Icon")?.getComponent(cc.Sprite);
            let text = item.getChildByName("Paipu_Text")?.getComponent(i18nLabel);

            light_bg && (light_bg.spriteFrame = AssetContext.getAsset(config.light_bg, AssetFold.texture_lobby_UIMine));
            icon && (icon.spriteFrame = AssetContext.getAsset(config.icon, AssetFold.texture_lobby_UIMine));
            text && (text.i18NString = config.string);
            item.name = config.string;
            item.on("click", this.onItemClick, this);
        }
    }
    /**
   * @description: 
   * @param {string} img:远程图片url地址
   * @return {*}
   */
    private loadRawImage(img: string): Promise<cc.SpriteFrame> {
        //异步的写一个promise
        return new Promise(function (resolve, reject) {
            cc.assetManager.loadRemote(img, { ext: '.png' }, function (err, texture: cc.Texture2D) {
                if (err) {
                    reject(img + " load error")
                } else {
                    texture.packable = false;
                    let frame = new cc.SpriteFrame(texture);
                    resolve(frame);
                }
            });
        })
    }

    private onItemClick(button: cc.Button) {
        switch (button.node.name) {
            case "UIMine_btn_MyWallet"://我的钱包
                break;
            case "UIMine_Backpack"://我的背包
                break;
            case "UIMine_btn_paipu"://牌谱收藏
                break;
            case "UIMine_btn_setting"://设置
                UIManager.open(UIDefine.SettingsForm);
                break;
        }
    }
}
