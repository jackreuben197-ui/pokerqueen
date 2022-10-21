const { ccclass, property } = cc._decorator;
import UIBase from "../../../assets/script/ui/UIBase";
import { UIDefine } from "../define/UIDefine";
import GGEvent from "../event/GGEvent";
import { GameCache } from "../game/GameCache";
import PublicHelper from "../helper/PublicHelper";
import WebImageHelper from "../helper/WebImageHelper";
import { i18nLabel } from "../i18n/i18nLabel";
import { Web_User_Info } from "../net/https/WebRequest";
import AssetContext, { AssetFold } from "../ui/component/AssetContext";
import UIComponent from "../ui/UIComponent";
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
    nickname_lab: cc.Label = null;
    userid_lab: cc.Label = null;
    btn_copy: cc.Node = null;
    panel_bottom: cc.Node = null;

    onLoad(): void {
        super.onLoad();
        let widget: cc.Widget = this.node.getComponent(cc.Widget);
        widget.target = cc.find("Canvas");
    }
    protected lateLoad(): void {
        super.lateLoad();
        
    }

    public onShow(param?: any): void {
        super.onShow(param);
        this.func_item = this.getChildNodeOrComponent("func_item");
        this.content = this.getChildNodeOrComponent("content");
        this.nickname_lab = this.getChildNodeOrComponent("nickname_lab", cc.Label);
        this.userid_lab = this.getChildNodeOrComponent("userid_lab", cc.Label);
        this.btn_copy = this.getChildNodeOrComponent("btn_copy");
        this.btn_copy.on("click", this.onClickCopy, this);
        this.panel_bottom = this.getChildNodeOrComponent("panel_bottom");
        let UIHead: cc.Node = this.getChildNodeOrComponent("UIHead");
        UIHead.on(cc.Node.EventType.TOUCH_END, this.onClickMyInfo, this)
        let pc_1: cc.Node = this.getChildNodeOrComponent("pc_1");
        pc_1.on(cc.Node.EventType.TOUCH_END, this.onClickRecord, this)
        let pc_2: cc.Node = this.getChildNodeOrComponent("pc_2");
        pc_2.on(cc.Node.EventType.TOUCH_END, this.onClickCardScore, this)
        let pc_3: cc.Node = this.getChildNodeOrComponent("pc_3");
        pc_3.on(cc.Node.EventType.TOUCH_END, this.onClickAchieve, this)
        this.refreshHeadImg();
        this.setMine();
        this.refreshUserName();
        this.userid_lab.string = `ID : ${Web_User_Info.Response.data.user.un_id}`;
    }

    refreshHeadImg() {
        let img_head: cc.Sprite = this.getChildNodeOrComponent("img_head", cc.Sprite);
        img_head.node.active =false;
        WebImageHelper.SetUrlImage(img_head, GameCache.Instance.headPic).then(()=>{
            img_head.node.active =true;
        });
    }

    refreshUserName() {
        this.nickname_lab.string = Web_User_Info.Response.data.user.nickname;
    }

    /**
     * 注册广播事件
     */
     protected regiterDispatchEvent() {
        this.listen(GGEvent.Refresh_UserHead, this.refreshHeadImg);
        this.listen(GGEvent.Refresh_UserName, this.refreshUserName);
    }

    setMine(): void {

        this.func_item.active = false;
        // for (let i = 0; i < this.items_config.length; i++) {
        //     let item = cc.instantiate(this.func_item);
        //     let config = this.items_config[i];
        //     item.active = true;
        //     item.parent = this.content;
        //     let light_bg = cc.find("Bg_Group/Light", item)?.getComponent(cc.Sprite);
        //     let icon = item.getChildByName("Paipu_Icon")?.getComponent(cc.Sprite);
        //     let text = item.getChildByName("Paipu_Text")?.getComponent(i18nLabel);

        //     light_bg && (light_bg.spriteFrame = AssetContext.getAsset(config.light_bg, AssetFold.texture_lobby_UIMine));
        //     icon && (icon.spriteFrame = AssetContext.getAsset(config.icon, AssetFold.texture_lobby_UIMine));
        //     text && (text.i18NString = config.string);
        //     item.name = config.string;
        //     item.on("click", this.onItemClick, this);
        // }
        this.panel_bottom.children.forEach((item, i) => {
            item["index"] = i;
            item.on(cc.Node.EventType.TOUCH_END, this.onItemClick, this)
        });

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

    private onItemClick(e: cc.Event.EventTouch): void {
        let target: cc.Node = e.target;
        let index = target["index"];
        if (index == 3) {
            UIComponent.open(UIDefine.SettingsForm);
        }
    }

    onClickCopy() {
        // PublicHelper.ossUploadImage();
        PublicHelper.copyToClipBoard(Web_User_Info.Response.data.user.un_id);
    }

    onClickMyInfo() {
        UIComponent.open(UIDefine.MyPlayInfo);
    }

    onClickRecord() {
        UIComponent.open(UIDefine.UIRecord);
    }

    onClickCardScore() {
        UIComponent.open(UIDefine.UIRecordDetail);
    }

    onClickAchieve() {
        // UIComponent.open(UIDefine.UIRecord);
    }
}
