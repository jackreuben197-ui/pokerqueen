import { GameConfig } from "../../config/GameConfig";
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import { i18nMgr } from "../../i18n/i18nMgr";
import { WebUserDelete, WWW } from "../../net/https/WebRequest";
import GlobalSession from "../../session/GlobalSession";
import StorageKey from "../../session/StorageKey";
import SoundComponent from "../../sound/SoundComponent";
import GGSwitch from "../../ui/component/GGSwitch";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import { UISuperDialogType } from "../../ui/dialog/UISuperDialog";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMeSettings extends BaseFormPlus {
    //$ItemMall:cc.Node = null;
    $content: cc.Node = null;
    $item: cc.Node = null;

    $layout_node: cc.Node = null;
    $btn_layout: cc.Node = null;
    //聲音開關
    GGSwitch$sound: GGSwitch = null;

    list = [
        {
            node: null,
            a: "UIMine_SettingLanguage",
            b: "",
            switch: false,
            b_get: this.setLanguageText.bind(this),
            click: this.click_language,
        }, // 多语言
        {
            node: null,
            a: "UITexasSetting_LrI45uIK",
            b: "",
            switch: true,
            click: this.click_sound,
            switch_show: this.sound_show.bind(this),
        }, // 游戏声音
        {
            node: null,
            a: "UISettingPassword001",
            b: "",
            switch: false,
            click: this.click_reset_password,
        }, // 账号管理
        {
            node: null,
            a: "UIMine_SettingReport",
            b: "",
            switch: false,
            click: this.click_report,
        }, // 上报
        {
            node: null,
            a: "UIMine_SettingAboutus",
            b: "",
            switch: false,
            click: this.click_about,
        }, // 关于我们
        {
            node: null,
            a: "UIMine_Setting101",
            b: "",
            switch: false,
            click: this.click_agreement,
        }, // 用户协议
        {
            node: null,
            a: "UIMine_SettingVersion",
            b: "",
            switch: false,
            click: this.click_version,
        }, // 版本号
        {
            node: null,
            a: "UIMine_DeleteUser",
            b: "",
            switch: false,
            click: this.click_delete,
        }, // 注销账号
    ];
    /////////////////////////////////////////////

    lateLoad() {
        super.lateLoad();
        this.initView();
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.showView();
    }
    private sound_show(ggswitch: GGSwitch) {
        //設置聲音
        // let sound = GC.localStore.getItem(StorageKey.soundIsOpen);

        // if (!sound || sound == "1") {
        //     ggswitch.setIsOn(true);
        // } else {
        //     ggswitch.setIsOn(false);
        // }

        ggswitch.setIsOn(SoundComponent.Instance.sound_switch_on);
    }

    initView() {
        this.$content.removeAllChildren();
        this.list.forEach((item) => {
            let item_node = cc.instantiate(this.$item);
            item_node.parent = this.$content;
            this.setChildLabel(item_node, "a", i18nMgr.Get(item.a));
            this.setChildLabel(item_node, "b", item.b);
            this.setButtonClick(item_node, item.click);
            this.setChildVisible(item_node, "switch", item.switch);
            item.node = item_node;
        });
        this.$layout_node.parent = this.$content;
        this.setButtonClick(this.$btn_layout, this.click_layout);
    }

    showView() {
        this.list.forEach((item) => {
            if (item.switch_show) {
                let ggswitch = item.node
                    .getChildByName("switch")
                    .getComponent(GGSwitch);
                item.switch_show(ggswitch);
            }
            if (item.b_get) {
                let b = item.node.getChildByName("b").getComponent(cc.Label);
                item.b_get(b);
            }
            this.setChildLabel(item.node, "a", i18nMgr.Get(item.a));
        });
    }
    setLanguageText(label: cc.Label) {
        label.string = i18nMgr.getLanguageText();
    }
    // 多语言
    click_language() {
        UIComponent.open(UIDefine.UILanguage, {
            lan: i18nMgr.language,
            onChange: this.showView.bind(this),
        });
    }
    // 账号管理 重置密码
    click_reset_password() {
        UIComponent.open(UIDefine.UIAccountManagement);
    }
    // 游戏声音
    click_sound(button: cc.Button) {
        let ggswitch = button.node
            .getChildByName("switch")
            .getComponent(GGSwitch);
        ggswitch.click();
        GC.localStore.setItem(
            StorageKey.soundIsOpen,
            ggswitch.isOn ? "1" : "0",
        );
        SoundComponent.Instance.sound_switch_on = ggswitch.isOn;
    }
    // 上报
    click_report() {
        UIComponent.open(UIDefine.UIReport);
    }
    // 关于我们
    click_about() {
        //UIComponent.open(UIDefine.UIWebCommon, { url: "https://h5.olavamos.com/#/introduce", title: i18nMgr.Get("UIMine_SettingAboutus") });
        UIComponent.open(UIDefine.UIAboutus);
    }
    // 用户协议
    click_agreement() {
        UIComponent.open(UIDefine.UIWebCommon, {
            url: "https://test2-h5-protocol.awanptest.com/#/?lan={id}".replace(
                "{id}",
                i18nMgr.language,
            ),
            title: i18nMgr.Get("tc_5E0V3qlb"),
        });
    }
    // 版本号
    click_version() {
        UIComponent.open(UIDefine.UIVersion, { version: GameConfig.Version });
    }
    // 注销账号
    click_delete() {
        //UIMine_DeleteUserContent

        UIComponent.open<UISuperDialogType>(UIDefine.UISuperDialog, {
            content: i18nMgr.Get("UIMine_DeleteUserContent"),
            commit: i18nMgr.Get("adaptation10008"),
            cancel: i18nMgr.Get("adaptation10013"),
            commit_click: () => {
                WWW.Instance.CommonAPI({
                    web_class: WebUserDelete,
                }).then(
                    (res: any) => {
                        UIComponent.Instance.ToastLanguage(
                            "Uiclubrechargeconfirmordersuccessfully",
                        );
                        GlobalSession.Logout();
                        // GameCache.Instance.isFirstShowActivity = true;
                        // UIMineModel.mInstance.Dispose();
                        // UIMatchModel.mInstance.Dispose();
                    },
                    (res: any) => {},
                );
            },
        });
    }

    click_layout() {
        GlobalSession.Logout();
        // UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent, {
        //     type: UIDialogComponent.DialogType.CommitCancel,
        //     title: "退出登录",
        //     content: '是否退出登录?',
        //     contentCommit: "确定",
        //     contentCancel: "取消",
        //     actionCommit: () => {
        //         GlobalSession.Logout();
        //     },
        //     noAnimation: true,
        // });
    }
    sound_change() {}
}
