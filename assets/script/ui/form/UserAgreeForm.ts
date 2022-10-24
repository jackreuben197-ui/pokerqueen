
import { i18nMgr } from "../../i18n/i18nMgr";
import BaseForm from "./BaseForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UserAgreeForm extends BaseForm {

    webview: cc.WebView = null;

    /**
     * 节点|组件 定义 
     */

    ///////////////////////////////////
    /**
     * 声明内容
     */

    ///////////////////////////////////
    /**
     * onLoad之后处理的内容
     */
    protected lateLoad() {
        super.lateLoad();
        this.webview = this.getChildNodeOrComponent("webview").getComponent(cc.WebView);
    }
    /**
     * 关闭需要处理的内容
     */
    lateClose(param?: any) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        this.webview.url = i18nMgr.Get("UIWebViewURL");
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

    }
    /**
     * 停止所有 动作，包括 tween ,update，等
     */
    protected stopAllThings() {

    }

    mainFadeIn(style: any) {
        this.content.active = false;
        super.mainFadeIn(style);
    }

    async mainFadeOut(style: any) {
        this.content.active = false;
        super.mainFadeOut(style);
    }

    fadeInComplete() {
        super.fadeInComplete();
        this.content.active = true;
    }
}
