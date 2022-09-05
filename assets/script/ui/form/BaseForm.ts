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
    main: cc.Node = null;
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
        main_fadeIn_ease: cc.easeElasticIn,

        main_fadeOut_active: true,
        main_fadeOut_duration: .2,
        main_fadeOut_ease: null,
    }
    fromUI: BaseForm = null;
    ////////////////////////////////////
    protected lateLoad() {
        super.lateLoad();
        //元素赋值
        this.main = this.getChildNodeOrComponent("main");
        this.title_label = this.getChildNodeOrComponent("title_label", i18nLabel);
        this.back_click = this.getChildNodeOrComponent("back_click");
        this.content = this.getChildNodeOrComponent("content - 内容填充");
        this.top_block = this.getChildNodeOrComponent("top_block");
        this.title_label.i18NString = this.UIDefine?.Title || "";
        //设置尺寸
        this.main.setContentSize(this.node.getContentSize());
    }

    protected regiterTouchEvents(): void {
        //回退触发
        this.back_click.on("click", this.close, this);
    }

    protected lateClose(param: any = null) {

    }

    onShow(param?: any, fromUI?: BaseForm) {
        this.fromUI = fromUI;
        cc.log(">>> formUI form :", fromUI?.UIDefine?.Name);
        super.onShow(param);
        this.mainFadeIn(param?.style);
        cc.log("ui.main.x onShow2 >> ", this.main.x);
    }

    async onClose(param?: any) {
        this.showFromUI();
        await this.mainFadeOut(param?.style);
        super.onClose(param);
    }

    //关闭界面
    close() {
        UIComponent.close(this.UIDefine);
    }

    mainFadeIn(style: any) {
        this.top_block.active = true;
        if (style?.main_fadeIn_active == false) {
            this.main.x = 0;
            this.fadeInComplete();
        } else {
            let duration = style?.main_fadeIn_duration || this.defaultStyle.main_fadeIn_duration;
            let ease = style?.main_fadeIn_ease || this.defaultStyle.main_fadeIn_ease;
            this.main.x = this.node.width;
            cc.tween(this.main).to(duration, { x: 0 }, ease).call(this.fadeInComplete, this).start();
        }
    }

    mainFadeOut(style: any) {
        return new Promise((resolve, reject) => {
            if (style?.main_fadeOut_active == false) {
                this.main.x = this.node.width;
                this.fadeOutComplete(resolve);
            } else {
                let duration = style?.main_fadeOut_duration || this.defaultStyle.main_fadeOut_duration;
                let ease = style?.main_fadeOut_ease || this.defaultStyle.main_fadeOut_ease;
                this.main.x = 0;
                cc.tween(this.main).to(duration, { x: this.node.width }, ease).call(this.fadeOutComplete.bind(this, resolve)).start();
            }
        })
    }

    fadeInComplete() {
        this.top_block.active = false;
        this.hideFromUI();
    }

    fadeOutComplete(resolve) {
        resolve(0);
    }

    /**
     * 显示隐藏来源界面
     */
    hideFromUI() {
        if (this.fromUI) this.fromUI.node.active = false;
    }
    showFromUI() {
        if (this.fromUI) this.fromUI.node.active = true;
    }


}
