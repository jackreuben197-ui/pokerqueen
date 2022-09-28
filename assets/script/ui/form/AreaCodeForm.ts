
import { AreaCodeConfig } from "../../config/AreaCodeConfig";
import GGEvent from "../../event/GGEvent";
import { i18nMgr } from "../../i18n/i18nMgr";
import LoginSession from "../../session/LoginSession";
import AreaCodeFormItem from "../item/AreaCodeFormItem";
import BaseForm from "./BaseForm";


const { ccclass, property } = cc._decorator;

@ccclass
export default class AreaCodeForm extends BaseForm {

    /**
     * 节点|组件 定义
     */

    AreaCodeFormItem: cc.Node = null;

    scrollContent: cc.Node = null;

    search_editbox: cc.EditBox = null;

    scrollView: cc.ScrollView = null;

    ///////////////////////////////////
    /**
     * 声明内容
     */
    //用map的value当key来映射AreaCodeFormItem
    itemDic: { [key: string]: AreaCodeFormItem } = {};

    map: Map<string, string> = null;
    ///////////////////////////////////

    protected lateLoad() {
        super.lateLoad();
        this.AreaCodeFormItem = this.getChildNodeOrComponent("AreaCodeFormItem");
        this.scrollContent = this.getChildNodeOrComponent("scrollContent");
        this.search_editbox = this.getChildNodeOrComponent("search_editbox", cc.EditBox);
        this.scrollView = this.getChildNodeOrComponent("scrollView", cc.ScrollView);
        this.AreaCodeFormItem.active = false;
        this.createAreaList();

    }

    lateClose(param: any = null) {
        super.lateClose(param);
    }

    onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
        this.clearSearch();
        this.map = this.getAreaMap();
        this.scrollView.scrollToTop(.5);
        this.scheduleOnce(() => {
            this.updateAreaList();
        }, .1);

    }
    /**
     * 注册触摸事件
     */
    protected regiterTouchEvents() {
        super.regiterTouchEvents();
        let handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "AreaCodeForm";
        handler.handler = "onSearchChange"
        this.search_editbox.textChanged = [handler];
    }

    createAreaList() {
        this.map = this.getAreaMap();
        this.map.forEach((value: string, key: string) => {
            let item_code = cc.instantiate(this.AreaCodeFormItem);
            item_code.active = true;
            item_code.parent = this.scrollContent;
            let item = item_code.getComponent(AreaCodeFormItem);
            item.onShow({ country: key, code: value });
            this.itemDic[value] = item;
            item.node.on("click", this.onItemClick, this);
        })
    }
    updateAreaList() {
        this.map.forEach((value: string, key: string) => {
            let item = this.itemDic[value];
            item.onShow({ country: key, code: value })
            item.setSelected(value == LoginSession.AreaCode);
        })
    }
    getAreaMap() {
        //TODO 判断语言
        return AreaCodeConfig[i18nMgr.language];
    }
    /**
     * 搜索内容改变
     */
    onSearchChange() {
        let str = this.search_editbox.string.toLocaleLowerCase();
        this.map.forEach((value: string, key: string) => {
            let item = this.itemDic[value];
            item.node.active = true;
            if (str.length && value.toLocaleLowerCase().indexOf(str) == -1 && key.toLocaleLowerCase().indexOf(str) == -1) {
                item.node.active = false;
            }
        })
    }
    /**
     * 清空搜索
     */
    clearSearch() {
        this.search_editbox.string = "";
        this.onSearchChange();
    }

    /**
     * 选项点击
     */
    onItemClick(button: cc.Button) {
        let code = button.node.getComponent(AreaCodeFormItem).param.code;
        LoginSession.AreaCode = code;
        this.post(GGEvent.Change_AreaCode);
        this.close();
    }

}
