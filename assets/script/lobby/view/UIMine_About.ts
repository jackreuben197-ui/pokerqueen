
import ComFormTitle from "../../common/ComFormTitle";
import { i18nMgr } from "../../i18n/i18nMgr";
import BaseForm from "../../ui/form/BaseForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_About extends BaseForm {


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
     private comFormTitle: ComFormTitle = null;

     protected lateLoad(): void {
         super.lateLoad();
         this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
 
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
        this.comFormTitle.initData('', this);

        this.comFormTitle.title.string = "关于我们";
        // this.webview.url = i18nMgr.Get("UIAboutURL");
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
        // this.content.active = false;
        super.mainFadeIn(style);
    }

    async mainFadeOut(style: any) {
        // this.content.active = false;
        super.mainFadeOut(style);
    }

    fadeInComplete() {
        super.fadeInComplete();
        // this.content.active = true;
    }
}
