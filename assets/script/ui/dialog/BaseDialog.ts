
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


    confirm_button: cc.Node = null;
    confirm_label: cc.Label = null;

    cancel_button: cc.Node = null;
    cancel_label: cc.Label = null;



    //面板渐入渐出样式
    protected defaultStyle = {
        //内容顶层节点
        main_fadeIn_active: true,
        main_fadeIn_duration: .3,
        main_fadeIn_ease: cc.easeBackOut(),

        main_fadeOut_active: true,
        main_fadeOut_duration: .2,
        main_fadeOut_ease: cc.easeBackIn(),

        //mask节点
        mask_fadeIn_active: true,
        mask_fadeIn_duration: .2,
        mask_fadeIn_ease: null,

        mask_fadeOut_active: true,
        mask_fadeOut_duration: .2,
        mask_fadeOut_ease: null,

    }

    onShow(param: DialogParam = null) {
        super.onShow(param);
        this.title_label.string = param?.title || "dialog";
        this.content_label.string = param?.content || "content";
        this.block.enabled = param?.block || false;

        this.confirm_button.active = false;
        this.cancel_button.active = false;

        if (param.confirm) {
            this.confirm_button.active = true;
            this.confirm_label.string = param.confirm;
        }
        if (param.cancel) {
            this.cancel_button.active = true;
            this.cancel_label.string = param.cancel;
        }

        if (!param.confirm && !param.cancel) {
            this.cancel_button.active = true;
            this.cancel_label.string = "cancel";
        }

        this.maskFadeIn(param?.style);
        this.mainFadeIn(param?.style);
    }
    protected lateLoad(): void {
        super.lateLoad();
        this.mask = this.node.getChildByName("touchMask");
        this.main = this.node.getChildByName("main");
        this.block = this.main.getComponent(cc.BlockInputEvents);
        this.title_label = this.main.getChildByName("title_label").getComponent(cc.Label);
        this.content_label = this.main.getChildByName("content_label").getComponent(cc.Label);

        this.confirm_button = cc.find("buttonLayout/confirm_button", this.main);
        this.confirm_label = this.confirm_button.getChildByName("confirm_label").getComponent(cc.Label);

        this.cancel_button = cc.find("buttonLayout/cancel_button", this.main);
        this.cancel_label = this.cancel_button.getChildByName("cancel_label").getComponent(cc.Label);

        this.confirm_button.on("click", this.onConfirmClick, this);
        this.cancel_button.on("click", this.goClose, this);
        this.mask.on("click", this.goClose, this);
        this.specialLoad();
    }
    /**
     * 方便子类扩展
     */
    protected specialLoad() {

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

    goClose() {
        if (this.param?.cancelCallback) {
            this.param?.cancelCallback();
        }
        UIManager.close(this.UIDefine);
    }

    maskFadeIn(style: any) {
        this.mask.opacity = 1;
        let duration = style?.mask_fadeIn_duration || this.defaultStyle.mask_fadeIn_duration;
        let ease = style?.mask_fadeIn_ease || this.defaultStyle.mask_fadeIn_ease;
        cc.tween(this.mask).to(duration, { opacity: 128 }, ease).start();
    }
    mainFadeIn(style: any) {
        this.main.scale = 0;
        let duration = style?.main_fadeIn_duration || this.defaultStyle.main_fadeIn_duration;
        let ease = style?.main_fadeIn_ease || this.defaultStyle.main_fadeIn_ease;
        cc.tween(this.main).to(duration, { scale: 1 }, ease).start();
    }

    maskFadeOut(style: any) {
        this.mask.opacity = 1;
        let duration = style?.mask_fadeOut_duration || this.defaultStyle.mask_fadeOut_duration;
        let ease = style?.mask_fadeOut_ease || this.defaultStyle.mask_fadeOut_ease;
        cc.tween(this.mask).to(duration, { opacity: 128 }, ease).start();
    }
    mainFadeOut(style: any) {
        this.main.scale = 0;
        let duration = style?.main_fadeOut_duration || this.defaultStyle.main_fadeOut_duration;
        let ease = style?.main_fadeOut_ease || this.defaultStyle.main_fadeOut_ease;
        cc.tween(this.main).to(duration, { scale: 1 }, ease).start();
    }


}
