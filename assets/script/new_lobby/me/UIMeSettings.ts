import { UIDefine } from "../../define/UIDefine";
import { i18nMgr } from "../../i18n/i18nMgr";
import GlobalSession from "../../session/GlobalSession";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
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

    list = [
        { a: "UIMine_SettingLanguage", b: "", switch: false, b_get: this.getLanguageText, click: this.click_language },// 多语言
        { a: "UISetting_SecurityManager", b: "", switch: false, click: this.click_security },// 安全管理
        { a: "UITexasSetting_LrI45uIK", b: "", switch: true, click: this.click_sound },// 游戏声音
        { a: "UIMine_SettingReport", b: "", switch: false, click: this.click_report },// 上报
        { a: "UIMine_SettingAboutus", b: "", switch: false, click: this.click_about },// 关于我们
        { a: "UIMine_Setting101", b: "", switch: false, click: this.click_agreement },// 用户协议
        { a: "UIMine_SettingVersion", b: "", switch: false, click: this.click_version },// 版本号
        { a: "UIMine_DeleteUser", b: "", switch: false, click: this.click_delete },// 注销账号
    ]

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

    }
    initView() {
        this.$content.removeAllChildren();
        this.list.forEach((item) => {
            let item_node = cc.instantiate(this.$item);
            item_node.parent = this.$content;
            this.setChildLabel(item_node, "a", i18nMgr.Get(item.a));
            this.setChildLabel(item_node, "b", item.b_get?.() || item.b);
            this.setChildVisible(item_node, "switch", item.switch);
            this.setButtonClick(item_node, item.click);
        })
        this.$layout_node.parent = this.$content;

        this.setButtonClick(this.$btn_layout, this.click_layout);

    }

    getLanguageText() {
        return i18nMgr.getLanguageText();
    }

    // 多语言
    click_language() {

    }
    // 安全管理
    click_security() {

    }
    // 游戏声音
    click_sound() {

    }
    // 上报
    click_report() {

    }
    // 关于我们
    click_about() {

    }
    // 用户协议
    click_agreement() {

    }
    // 版本号
    click_version() {

    }
    // 注销账号
    click_delete() {

    }

    click_layout() {

        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent, {
            type: UIDialogComponent.DialogType.CommitCancel,
            title: "退出登录",
            content: '是否退出登录?',
            contentCommit: "确定",
            contentCancel: "取消",
            actionCommit: () => {
                GlobalSession.Logout();
            },
            noAnimation: true,
        });
    }
}
