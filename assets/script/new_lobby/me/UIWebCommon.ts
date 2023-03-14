import SimpleNodePool from "../../common/MyNodePool";
import { Web_MallShopList, Web_Mall_Buy, WWW } from "../../net/https/WebRequest";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIComponent from "../../ui/UIComponent";
import ItemMall from "./ItemMall";
import UIMe from "./UIMe";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIWebCommon extends BaseFormPlus {
    cc_WebView$content: cc.WebView = null;

    /////////////////////////////////////////////

    lateLoad() {
        super.lateLoad();

    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.title_label.i18NString = param.title;
        this.cc_WebView$content.url = param.url;
    }

}
