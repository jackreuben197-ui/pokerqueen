
import ComFormTitle from "../../common/ComFormTitle";
import GGEvent from "../../event/GGEvent";
import { i18nMgr } from "../../i18n/i18nMgr";
import GGToggleContainer from "../component/GGToggleContainer";
import LanguageFormItem from "../item/LanguageFormItem";
import BaseForm from "./BaseForm";


const { ccclass, property } = cc._decorator;

@ccclass
export default class LanguageForm extends BaseForm {
    /**
     * 节点|组件 定义
     */

    LanguageFormItem: cc.Node = null;

    content: cc.Node = null;

    //toggleContainer: GGToggleContainer = null;

    ///////////////////////////////////
    /**
     * 声明内容
     */
    //记录上一个选中对象
    _prevItem: LanguageFormItem = null;

    configs: ILanguageFormItem[] = [
        { id: "en", s_language: "sl_K8cPNvxU", language: "English", flag: "flag_en", item: null },
        { id: "pt", s_language: "sl_ptyyPutao", language: "Portuguese", flag: "flag_pt", item: null },
        { id: "cn", s_language: "tc_MHoYsIbY", language: "Simplified Chinese", flag: "flag_cn", item: null },
    ]

    ///////////////////////////////////

    comFormTitle: ComFormTitle = null;

    protected lateLoad() {
        super.lateLoad();
        this.LanguageFormItem = this.getChildNodeOrComponent("LanguageFormItem");
        this.content = this.getChildNodeOrComponent("content");
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.setItems();
        //this.toggleContainer = this.getChildNodeOrComponent("toggleContainer", GGToggleContainer);
    }

    lateClose(param: any = null) {
        super.lateClose(param);
    }

    onShow(param?: any, fromUI?: cc.Node) {
        super.onShow(param, fromUI);
        this.comFormTitle.initData('UIMine_SettingLanguage', this);
        this.showLanguage(i18nMgr.language);
    }

    showLanguage(language: string) {
        for (let config of this.configs) {
            if (config.id == language) {
                this.setLanguage(config.item);
            } else {
                config.item.uncheck();
            }
        }
    }

    setItems() {
        this.LanguageFormItem.active = false;
        let languageItem, languageItem_script: LanguageFormItem;
        for (let i = 0; i < this.configs.length; i++) {
            let config = this.configs[i];
            languageItem = cc.instantiate(this.LanguageFormItem);
            languageItem_script = languageItem.getComponent(LanguageFormItem);
            languageItem.parent = this.content;
            languageItem.active = true;
            languageItem_script.onShow(config);
            config.item = languageItem_script;
            languageItem.on(cc.Node.EventType.TOUCH_START, this.onItemTouchStart, this);
            languageItem.on(cc.Node.EventType.TOUCH_END, this.onItemTouchCancel, this);
            languageItem.on(cc.Node.EventType.TOUCH_CANCEL, this.onItemTouchCancel, this);
            languageItem.on("click", this.onItemClick, this);
        }
    }

    onItemTouchStart(e: cc.Event.EventTouch) {
        let item: LanguageFormItem = e.target.getComponent(LanguageFormItem);
        item.setSelected(true);
    }
    onItemTouchCancel(e: cc.Event.EventTouch) {
        let item: LanguageFormItem = e.target.getComponent(LanguageFormItem);
        item.setSelected(false);
    }

    onItemClick(button: cc.Button) {
        let item = button.getComponent(LanguageFormItem);
        this.setLanguage(item)
    }
    setLanguage(item: LanguageFormItem) {
        if (item) {
            if (item == this._prevItem) return;
            this._prevItem && this._prevItem.uncheck();
            item.check();
            this._prevItem = item;
            i18nMgr.setLanguage(item.param.id)
            console.log("设置语言:",item.param.id);
        }
        this.post(GGEvent.CHANGE_LAUNCH);
    }
}
export interface ILanguageFormItem {
    id: string;
    s_language: string;
    language: string;
    flag: string;
    item: LanguageFormItem
}
