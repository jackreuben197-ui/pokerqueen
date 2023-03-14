
import ComFormTitle from "../../common/ComFormTitle";
import { AreaCodeConfig } from "../../config/AreaCodeConfig";
import GGEvent from "../../event/GGEvent";
import { i18nMgr } from "../../i18n/i18nMgr";
import LoginSession from "../../session/LoginSession";
import AreaCodeFormItem from "../item/AreaCodeFormItem";
import BaseForm from "./BaseForm";
import BaseFormPlus from "./BaseFormPlus";


const { ccclass, property } = cc._decorator;

@ccclass
export default class AreaCodeForm extends BaseFormPlus {

    /**
     * 节点|组件 定义
     */

    $item: cc.Node = null;

    $content: cc.Node = null;

    //搜索按钮
    $btn_search: cc.Node = null;
    //清除按钮
    $btn_clear_input: cc.Node = null;
    //搜索输入文本
    cc_EditBox$input: cc.EditBox = null;

    // search_editbox: cc.EditBox = null;

    // scrollView: cc.ScrollView = null;

    // private comFormTitle: ComFormTitle = null;
    ///////////////////////////////////
    /**
     * 声明内容
     */
    //用map的value当key来映射AreaCodeFormItem
    itemDic: { [key: string]: cc.Node } = {};

    map: Map<string, string> = null;
    ///////////////////////////////////

    protected lateLoad() {
        super.lateLoad();
        this.createAreaList();
    }

    lateClose(param: any = null) {
        super.lateClose(param);
    }

    onShow(param?: any, fromUI?: cc.Node) {
        super.onShow(param, fromUI);
        this.click_clear();
        this.map = this.getAreaMap();
        this.updateAreaList();
    }
    /**
     * 注册触摸事件
     */
    protected regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$btn_search, this.click_search);
        this.setButtonClick(this.$btn_clear_input, this.click_clear);
    }

    createAreaList() {
        this.$content.removeAllChildren();
        this.map = this.getAreaMap();
        this.map.forEach((value: string, key: string) => {
            let item_node = cc.instantiate(this.$item);
            item_node.parent = this.$content;
            this.refreshItem(item_node, key, value);
            //item.onShow({ country: key, code: value });
            this.itemDic[value] = item_node;
            item_node.on("click", this.click_item, this);
        })
    }
    refreshItem(item: cc.Node, country: string, code: string) {
        this.setChildLabel(item, "label_country", country);
        this.setChildLabel(item, "label_code", code);
    }
    updateAreaList() {
        this.map.forEach((value: string, key: string) => {
            let item_node = this.itemDic[value];
            this.refreshItem(item_node, key, value);
            this.setChildVisible(item_node, "bg", value == LoginSession.AreaCode);
        })
    }
    getAreaMap() {
        //TODO 判断语言
        return AreaCodeConfig[i18nMgr.language];
    }
    /**
     * 搜索内容改变
     */
    click_search() {
        let str = this.cc_EditBox$input.string.toLocaleLowerCase();
        this.map.forEach((value: string, key: string) => {
            let item_node = this.itemDic[value];
            item_node.active = true;
            if (str.length && value.toLocaleLowerCase().indexOf(str) == -1 && key.toLocaleLowerCase().indexOf(str) == -1) {
                item_node.active = false;
            }
        })
    }
    /**
     * 清空搜索
     */
    click_clear() {
        this.cc_EditBox$input.string = "";
        this.click_search();
    }

    /**
     * 选项点击
     */
    click_item(button: cc.Button) {
        let code = button.node.getChildByName("label_code").getComponent(cc.Label).string;
        LoginSession.AreaCode = code;
        this.post(GGEvent.Change_AreaCode, code);
        //this.updateAreaList();
        this.close();
    }
}
