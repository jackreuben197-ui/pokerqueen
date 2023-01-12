import { i18nLabel } from "../../i18n/i18nLabel";
import UIBase from "../UIBase";
import UIComponent from "../UIComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseForm extends UIBase {
    /**
     * 节点|组件 定义
     */
    //标题文本
    title_label: i18nLabel = null;
    //回退按钮
    back_click: cc.Node = null;
    //内容顶层节点
    // main: cc.Node = null;
    //填充内容节点
    content: cc.Node = null;
    //顶部block节点
    top_block: cc.Node = null;
    ////////////////////////////////////
    /**
     * 声明内容
     */
    //面板渐入渐出样式
    protected defaultStyle = {
        //内容顶层节点
        main_fadeIn_active: true,
        main_fadeIn_duration: .2,
        main_fadeIn_ease: null,

        main_fadeOut_active: true,
        main_fadeOut_duration: .2,
        main_fadeOut_ease: null,
    }
    fromUI: cc.Node = null;
    sceneUI: cc.Node = null;
    move_node: cc.Node = null;
    ////////////////////////////////////
    protected lateLoad() {
        super.lateLoad();
        //元素赋值
        // this.main = this.getChildNodeOrComponent("main");
        this.title_label = this.getChildNodeOrComponent("title_label", i18nLabel);
        this.back_click = this.getChildNodeOrComponent("back_click");
        this.content = this.getChildNodeOrComponent("content - 内容填充");
        this.top_block = this.getChildNodeOrComponent("top_block");

        if (this.title_label) {
            this.title_label.i18NString = this.UIDefine?.Title || "";
        }
        this.move_node = this.getChildNodeOrComponent("main") || this.node;
        //设置尺寸
        // this.main.setContentSize(this.node.getContentSize());
    }

    protected regiterTouchEvents(): void {
        //回退触发
        this.back_click && this.back_click.on("click", this.close, this);
    }

    lateClose(param: any = null) {
        super.lateClose();
    }
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        this.fromUI = fromUI;
        this.sceneUI = sceneUI;
        cc.log(">>> formUI form :", fromUI?.name);
        super.onShow(param);
        this.mainFadeIn(this.show_animation);
    }
    async onClose(param?: any) {
        this.showFromUI();
        this.showSceneUI();
        this.close_animation ? await this.mainFadeOut(param) : this.fadeOutComplete();
        super.onClose(param);
    }
    //关闭界面
    close() {
        UIComponent.close(this.UIDefine);
    }

    mainFadeIn(show_animation: boolean = true) {
        this.top_block.active = true;
        if (show_animation == false) {
            this.move_node.x = 0;
            this.fadeInComplete();
        } else {
            let duration = this.defaultStyle.main_fadeIn_duration;
            let ease = this.defaultStyle.main_fadeIn_ease;
            this.move_node.x = this.move_node.width;
            cc.tween(this.move_node)
                .to(duration, { x: 0 }, ease)
                .call(this.fadeInComplete, this)
                .start();
        }
    }
    mainFadeOut(param: any) {
        return new Promise((resolve, reject) => {
            let duration = this.defaultStyle.main_fadeOut_duration;
            let ease = this.defaultStyle.main_fadeOut_ease;
            this.move_node.x = 0;
            cc.tween(this.move_node).to(duration, { x: this.move_node.width }, ease).call(this.fadeOutComplete.bind(this, resolve)).start();
        })
    }

    fadeInComplete() {
        this.top_block.active = false;
        this.hideFromUI();
        this.hideSceneUI();
    }

    fadeOutComplete(resolve?) {
        resolve?.(0);
        this.move_node.x = this.move_node.width;
        this.fromUI?.getComponent(UIBase).reback();
    }
    /**
     * 显示隐藏来源界面
     */
    hideFromUI() {
        if (this.fromUI) this.fromUI.active = false;
    }
    showFromUI() {
        if (this.fromUI) this.fromUI.active = true;
    }

    /**
     * 显示隐藏场景界面
     */
    hideSceneUI() {
        if (this.sceneUI) this.sceneUI.active = false;
    }
    showSceneUI() {
        if (this.sceneUI) this.sceneUI.active = true;
    }


}
