
/**
 * 基础小弹窗类
 */

import { DialogParam } from "../../define/EIDefine";
import UIManager from "../../manager/UIManager";
import UIBase from "../UIBase";

const { ccclass } = cc._decorator;

@ccclass
export default class BaseDialog extends UIBase {

    mask: cc.Node = null;

    block: cc.BlockInputEvents = null;

    main: cc.Node = null;

    title_label: cc.Label = null;
    content_label: cc.Label = null;
    confirm_label: cc.Label = null;

    confirm_button: cc.Node = null;

    defaultStyle = {
        //底部半透层
        mask: {
            //渐入
            fadeIn: {
                duration: .2,
                ease: null
            },
            //渐出
            fadeOut: {
                duration: .2,
                ease: null
            }
        },
        //上部主窗口
        main: {
            //渐入
            fadeIn: {
                duration: .3,
                ease: cc.easeBackOut(),
            },
            //渐出
            fadeOut: {
                duration: .2,
                ease: cc.easeBackIn(),
            }

        }
    }

    onShow(param: DialogParam = null) {
        super.onShow(param);
        this.title_label.string = param?.title || "dialog";
        this.content_label.string = param?.content || "content";
        this.confirm_label.string = param?.confirm || "confirm";
        this.block.enabled = param?.block || false;

        this.maskFadeIn(param?.maskStyle);
        this.mainFadeIn(param?.mainStyle);
    }
    protected lateLoad(): void {
        super.lateLoad();
        this.mask = this.node.getChildByName("touchMask");
        this.main = this.node.getChildByName("main");
        this.block = this.main.getComponent(cc.BlockInputEvents);
        this.confirm_button = this.main.getChildByName("confirm_button");
        this.title_label = this.main.getChildByName("title_label").getComponent(cc.Label);
        this.content_label = this.main.getChildByName("content_label").getComponent(cc.Label);
        this.confirm_label = this.confirm_button.getChildByName("confirm_label").getComponent(cc.Label);
        this.confirm_button.on("click", this.onConfirmClick, this);
        this.mask.on("click", this.onMaskClick, this);
    }
    protected lateClose(param: any = null) {
        super.lateClose(param);
    }

    protected stopAllTweens(): void {
        this.mask.stopAllActions();
        this.main.stopAllActions();
    }
    protected onConfirmClick() {
        if (this.param?.confirmCallback) {
            this.param?.confirmCallback();
        }
        UIManager.close(this.UIDefine);
    }
    protected onMaskClick() {
        UIManager.close(this.UIDefine);
    }


    maskFadeIn(style: any) {
        this.mask.opacity = 1;
        let duration = style?.duration || this.defaultStyle.mask.fadeIn.duration;
        let ease = style?.fadeIn?.ease || this.defaultStyle.mask.fadeIn.ease;
        cc.tween(this.mask).to(duration, { opacity: 128 }, ease).start();
    }
    mainFadeIn(style: any) {
        this.main.scale = 0;
        let duration = style?.duration || this.defaultStyle.main.fadeIn.duration;
        let ease = style?.fadeIn?.ease || this.defaultStyle.main.fadeIn.ease;
        cc.tween(this.main).to(duration, { scale: 1 }, ease).start();
    }

    maskFadeOut(style: any) {
        this.mask.opacity = 1;
        let duration = style?.duration || this.defaultStyle.mask.fadeIn.duration;
        let ease = style?.fadeIn?.ease || this.defaultStyle.mask.fadeIn.ease;
        cc.tween(this.mask).to(duration, { opacity: 128 }, ease).start();
    }
    mainFadeOut(style: any) {
        this.main.scale = 0;
        let duration = style?.duration || this.defaultStyle.main.fadeIn.duration;
        let ease = style?.fadeIn?.ease || this.defaultStyle.main.fadeIn.ease;
        cc.tween(this.main).to(duration, { scale: 1 }, ease).start();
    }


}
