
import { UIDefine } from "../../define/UIDefine";
import UIManager from "../../manager/UIManager";
import SettingsFormItem from "../item/SettingsFormItem";
import BaseForm from "./BaseForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class $name extends BaseForm {
    /**
     * 节点|组件 定义
     */
    func_item: cc.Node = null;
    content: cc.Node = null;
    logout_btn: cc.Node = null;
    ///////////////////////////////////
    /**
     * 声明内容
     */
    items_config = [
        { type: 1, id: "netwrok", left_string: "tc_FKurKJYR", right_string: "line" },
        { type: 1, id: "language", left_string: "tc_PpNL8LVJ", right_string: "" },
        { type: 2, id: "gamesounds", left_string: "tc_TsALrril", right_string: "" },
        { type: 1, id: "accountmanagement", left_string: "UISettingPassword001", right_string: "" },
        { type: 1, id: "report", left_string: "tc_wV5t3xsr", right_string: "" },
        { type: 1, id: "about", left_string: "tc_YQAGnw3p", right_string: "" },
        { type: 1, id: "useragreement", left_string: "tc_5E0V3qlb", right_string: "" },
        { type: 1, id: "version", left_string: "tc_NO5NT6aa", right_string: "" },
    ];
    ///////////////////////////////////
    /**
     * onLoad之后处理的内容
     */
    protected lateLoad() {
        super.lateLoad();
        this.func_item = this.getChildNodeOrComponent("func_item");
        this.content = this.getChildNodeOrComponent("content");
        this.logout_btn = this.getChildNodeOrComponent("logout_btn");
        this.setItems();
    }
    /**
     * 关闭需要处理的内容
     */
    protected lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: BaseForm): void {
        super.onShow(param, fromUI);
    }
    /**
     * 注册触摸事件
     */
    protected regiterTouchEvents() {
        super.regiterTouchEvents();
        this.logout_btn.on("click", this.onLogoutClick, this);
    }
    /**
     * 注册广播事件
     */
    protected regiterDispatchEvent() {

    }
    /**
     * 停止所有 动作，包括 tween ,update，等
     */
    protected stopAllThings() {

    }
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
            item.getComponent(SettingsFormItem).onShow(config);
            item.on("click", this.onItemClick, this);
        }
    }

    private onItemClick(button: cc.Button) {

        let item = button.getComponent(SettingsFormItem);

        switch (item.param.id) {
            case "netwrok"://网络
                UIManager.open(UIDefine.BaseForm);
                break;
            case "language"://语言
                UIManager.open(UIDefine.LanguageForm);
                break;
            case "gamesounds"://声音
                UIManager.open(UIDefine.BaseForm);
                break;
            case "accountmanagement":
                UIManager.open(UIDefine.BaseForm);
                break;
            case "report":
                UIManager.open(UIDefine.BaseForm);
                break;
            case "about"://关于
                UIManager.open(UIDefine.BaseForm);
                break;
            case "useragreement":
                UIManager.open(UIDefine.BaseForm);
                break;
            case "version"://版本
                UIManager.open(UIDefine.BaseForm);
                break;

        }
    }
    /**
     * 退出点击
     */
    onLogoutClick() {

        //清理面板
        UIManager.closeAll();

    }
}
