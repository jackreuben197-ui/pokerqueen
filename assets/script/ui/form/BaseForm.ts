import UIManager from "../../manager/UIManager";
import UIBase from "../UIBase";


const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseForm extends UIBase {
    /**
    * 声明内容
    */

    //标题文本
    title_label: cc.Label = null;
    //回退按钮
    back_click: cc.Node = null;
    //内容顶层节点
    main: cc.Node = null;
    //填充内容节点
    content: cc.Node = null;

    //顶部block组件
    top_block: cc.BlockInputEvents = null;

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

    protected lateLoad() {
        super.lateLoad();
        //元素赋值
        this.main = this.node.getChildByName("main");
        this.title_label = cc.find("top/title", this.main).getComponent(cc.Label);
        this.back_click = cc.find("top/back_click", this.main);
        this.content = this.main.getChildByName("content - 内容填充");
        this.top_block = this.main.getChildByName("top").getComponent(cc.BlockInputEvents);
        this.title_label.string = this.UIDefine?.Title || "未定义标题";
        //设置尺寸
        this.main.setContentSize(this.node.getContentSize());
        //回退触发
        this.back_click.on("click", this.onBackClick, this);
    }

    protected lateClose(param: any = null) {

    }

    onShow(param: any = null) {
        super.onShow(param);
        this.mainFadeIn(param?.style);
    }

    async onClose(param?: any) {
        await this.mainFadeOut(param?.style);
        super.onClose(param);
    }

    onBackClick() {
        UIManager.close(this.UIDefine);
    }

    mainFadeIn(style: any) {
        this.top_block.enabled = true;
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
        this.top_block.enabled = false;
    }

    fadeOutComplete(resolve) {
        resolve(0);
    }

}
