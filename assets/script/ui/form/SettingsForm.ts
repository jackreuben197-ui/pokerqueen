import ComFormTitle from "../../common/ComFormTitle";
import { GameConfig } from "../../config/GameConfig";
import { UIDefine } from "../../define/UIDefine";
import GGEvent from "../../event/GGEvent";
import { i18nMgr } from "../../i18n/i18nMgr";
import GlobalSession from "../../session/GlobalSession";
import UIDialogComponent from "../dialog/UIDialogComponent";
import SettingsFormItem from "../item/SettingsFormItem";
import UIComponent from "../UIComponent";
import BaseForm from "./BaseForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SettingsForm extends BaseForm {
    /**
     * 节点|组件 定义
     */
    func_item: cc.Node = null;
    content: cc.Node = null;
    Button_logout: cc.Node = null;
    ///////////////////////////////////
    /**
     * 声明内容
     */
    items_config = [
        {
            type: 1,
            id: "netwrok",
            left_string: "tc_FKurKJYR",
            right_string: "line",
        },
        {
            type: 1,
            id: "language",
            left_string: "tc_PpNL8LVJ",
            right_string: "",
        },
        {
            type: 2,
            id: "gamesounds",
            left_string: "tc_TsALrril",
            right_string: "",
        },
        {
            type: 1,
            id: "accountmanagement",
            left_string: "UISettingPassword001",
            right_string: "",
        },
        { type: 1, id: "report", left_string: "tc_wV5t3xsr", right_string: "" },
        { type: 1, id: "about", left_string: "tc_YQAGnw3p", right_string: "" },
        {
            type: 1,
            id: "useragreement",
            left_string: "tc_5E0V3qlb",
            right_string: "",
        },
        {
            type: 1,
            id: "version",
            left_string: "tc_NO5NT6aa",
            right_string: GameConfig.Version,
        },
    ];
    ///////////////////////////////////
    /**
     * onLoad之后处理的内容
     */
    //private comFormTitle: ComFormTitle = null;

    protected lateLoad(): void {
        super.lateLoad();
        //this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
    }
    /**
     * 关闭需要处理的内容
     */
    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);

        //this.comFormTitle.initData('UIMine_Setting', this);

        this.Button_logout = this.getChildNodeOrComponent("Button_logout");
        this.Button_logout.on(
            cc.Node.EventType.TOUCH_END,
            this.onLogoutClick,
            this,
        );
        let Layout: cc.Node = this.getChildNodeOrComponent("Layout");
        Layout.children.forEach((item, i) => {
            item["index"] = i + 1;
            item.on(cc.Node.EventType.TOUCH_END, this.onItemClick, this);
        });
        //this.setItems();
        this.updateLaunch();
        let version_Text = this.getChildNodeOrComponent("Text_Right", cc.Label);
        version_Text.string = GameConfig.Version + "||" + GameConfig.BuildType;
    }
    /**
     * 注册触摸事件
     */
    protected regiterTouchEvents() {
        super.regiterTouchEvents();
    }
    /**
     * 注册广播事件
     */
    protected regiterDispatchEvent() {
        this.listen(GGEvent.CHANGE_LAUNCH, this.updateLaunch);
    }
    /**
     * 停止所有 动作，包括 tween ,update，等
     */
    protected stopAllThings() {}
    /**
     * 设置选项
     */
    setItems() {
        this.func_item.active = false;
        for (let i = 0; i < this.items_config.length; i++) {
            let config = this.items_config[i];
            let item = cc.instantiate(this.func_item);
            item.active = true;
            item.parent = this.content;
            item["index"] = i;
            item.getComponent(SettingsFormItem).onShow(config);
            item.on("click", this.onItemClick, this);
        }
    }

    private onItemClick(e: cc.Event.EventTouch): void {
        let target: cc.Node = e.target;
        let index = target["index"];
        if (index == 0) {
        } else if (index == 1) {
            UIComponent.open(UIDefine.LanguageForm);
        } else if (index == 2) {
            // River ATTENTION TO FIX: UIDefine.UIMine_SafeAdmin 没有这个定义。'
            throw new Error("UIDefine.UIMine_SafeAdmin 没有这个定义。");
            //UIComponent.open(UIDefine.UIMine_SafeAdmin);
        } else if (index == 3) {
            this.changeSwitchStyle(target.getChildByName("btn_switch"));
        } else if (index == 4) {
            this.changeSwitchStyle(target.getChildByName("btn_switch"));
        } else if (index == 5) {
            this.changeSwitchStyle(target.getChildByName("btn_switch"));
        } else if (index == 6) {
            this.changeSwitchStyle(target.getChildByName("btn_switch"));
        } else if (index == 7) {
            UIComponent.open(UIDefine.UIMine_About);
        } else if (index == 8) {
            UIComponent.open(UIDefine.UIMine_SettingVersion);
        }
    }

    changeSwitchStyle(btn_switch: cc.Node) {
        let open = btn_switch.getChildByName("open");
        let close = btn_switch.getChildByName("close");
        open.active = !open.active;
        close.active = !close.active;
    }

    updateLaunch() {
        let ItemInfo0: cc.Node = this.getChildNodeOrComponent("ItemInfo0");
        let Text_Right = ItemInfo0.getChildByName("Text_Right").getComponent(
            cc.Label,
        );
        // 当前的语言 0简中 1繁中 2英文 3葡语  let type = ["cn","zh","en","pt"]
        if (i18nMgr.language == "cn") {
            Text_Right.string = i18nMgr.Get("tc_MHoYsIbY");
        } else if (i18nMgr.language == "zh") {
            Text_Right.string = i18nMgr.Get("sl_1js2egAI");
        } else if (i18nMgr.language == "en") {
            Text_Right.string = i18nMgr.Get("sl_K8cPNvxU");
        } else if (i18nMgr.language == "pt") {
            Text_Right.string = i18nMgr.Get("sl_ptyyPutao");
        }
    }

    // private onItemClick(button: cc.Button) {

    //     let item = button.getComponent(SettingsFormItem);

    //     switch (item.param.id) {
    //         case "netwrok"://网络
    //             UIComponent.open(UIDefine.BaseForm);
    //             break;
    //         case "language"://语言
    //             UIComponent.open(UIDefine.LanguageForm);
    //             break;
    //         case "gamesounds"://声音
    //             UIComponent.open(UIDefine.BaseForm);
    //             break;
    //         case "accountmanagement":
    //             UIComponent.open(UIDefine.BaseForm);
    //             break;
    //         case "report":
    //             UIComponent.open(UIDefine.BaseForm);
    //             break;
    //         case "about"://关于
    //             UIComponent.open(UIDefine.BaseForm);
    //             break;
    //         case "useragreement":
    //             UIComponent.open(UIDefine.BaseForm);
    //             break;
    //         case "version"://版本
    //             UIComponent.open(UIDefine.BaseForm);
    //             break;

    //     }
    // }
    /**
     * 退出点击
     */
    onLogoutClick() {
        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent, {
            type: UIDialogComponent.DialogType.CommitCancel,
            title: "退出登录",
            content: "是否退出登录?",
            contentCommit: "确定",
            contentCancel: "取消",
            actionCommit: () => {
                GlobalSession.Logout();
            },
            noAnimation: true,
        });
    }
}
