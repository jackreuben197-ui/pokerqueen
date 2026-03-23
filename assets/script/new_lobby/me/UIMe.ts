import { UIDefine } from "../../define/UIDefine";
import { GameCache } from "../../game/GameCache";
import PublicHelper from "../../helper/PublicHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import SceneManager from "../../manager/SceneManager";
import { WebUserDiamondsWallet, WebConfigGlobalConfig, WebUserInfo, WebWww } from "../../net/https/WebRequest";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent from "../../ui/UIComponent";

const { ccclass, menu } = cc._decorator;
@ccclass
@menu("脚本分组/new_me/UIMe")
export default class UIMe extends UIBasePlus {
    //part1
    cc_Label$title: cc.Label = null;
    cc_Label$coin: cc.Label = null;
    $diamond: cc.Node = null;
    //part2
    $head: cc.Node = null;
    $copy: cc.Node = null;
    cc_Label$nick: cc.Label = null;
    cc_Label$id: cc.Label = null;
    cc_Sprite$head: cc.Sprite = null;
    //part3
    $scontent: cc.Node = null;
    //
    $kefu: cc.Node = null;
    ////////////////////////////////
    protected lateLoad(): void {
        this.name = "UIMe";
        super.lateLoad();
    }
    protected regiterTouchEvents(): void {

        this.setButtonClick(this.$diamond, this.onDiamondClick);
        this.setButtonClick(this.$copy, this.onCopyClick);
        this.setButtonClick(this.$kefu, this.onKefuClick);
        this.setButtonClick(this.$head, this.onHeadClick);
        this.$scontent.children.forEach((item, index) => {
            this.setButtonClick(item, this.onOptionClick.bind(this, index));
        })
    }
    onShow(param?: any): void {
        super.onShow(param);
        this.refreshUserInfo();
        this.refreshWallet();
    }
    //刷新用户信息
    refreshUserInfo() {
        this.cc_Label$id.string = `ID:${WebUserInfo.Response.data.user.un_id}`;
        this.cc_Label$id["_forceUpdateRenderData"]?.();
        WebImageHelper.SetHeadImage(this.cc_Sprite$head, WebUserInfo.Response.data.user.avatar);
        this.refreshNick();


    }
    //刷新钱包获取钻石
    refreshWallet() {
        WebWww.Instance.CommonAPI(
            {
                web_class: WebUserDiamondsWallet,
                juhua: false,
            }
        ).then(
            (res: any) => {
                this.cc_Label$coin.string = `${res.data?.diamonds_wallet?.diamonds || 0}`;
            },
            (res: any) => {

            }
        )
    }
    ///////////////////
    onHeadClick() {
        //编辑个人资料
        UIComponent.open(UIDefine.UIEditInformation);
    }
    onDiamondClick() {
        //跳转商城
        UIComponent.open(UIDefine.UIMall, null, { SceneUI: SceneManager.Instance.currUI, fromComponent: this });
    }
    onCopyClick() {
        //拷贝id号码
        PublicHelper.copyToClipBoard(WebUserInfo.Response.data.user.un_id);
    }
    onKefuClick() {
        //打开客服
        let email = WebConfigGlobalConfig.Response.data.support_email;//目标邮箱
        let subject = "";//主题
        let body = "";//内容
        window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + body
    }
    onOptionClick(index: number) {
        console.log(index);
        //选项点击
        switch (index) {
            case 0://钻石商城
                //UIComponent.open(UIDefine.UIMall, null, { SceneUI: SceneManager.Instance.currUI });
                this.onDiamondClick();
                break;
            case 1://我的背包
                UIComponent.open(UIDefine.UIMyPack, null, { SceneUI: SceneManager.Instance.currUI });
                break;
            case 2://我的消息
                //UIComponent.open(UIDefine.UIMine_MessageList, { enterType: 2 });
                UIComponent.open(UIDefine.UIMyMessage, { from: 2}, { SceneUI: SceneManager.Instance.currUI });
                break;
            case 3://设置
                //UIComponent.open(UIDefine.SettingsForm);
                UIComponent.open(UIDefine.UIMeSettings, null, { SceneUI: SceneManager.Instance.currUI });
                break;
        }
    }
    refreshNick() {
        this.cc_Label$nick.string = WebUserInfo.Response.data.user.nickname;
    }

}
