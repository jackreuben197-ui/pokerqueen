
/**
 * 基础小弹窗类
 */

import { DialogParam } from "../../define/EIDefine";
import BaseTouchBoard from "../board/BaseTouchBoard";

const { ccclass } = cc._decorator;

@ccclass
export default class BaseAlert extends BaseTouchBoard {


    mask: cc.Node = null;
    main: cc.Node = null;
    content: cc.Node = null;
    //顶部block遮挡
    top_block: cc.Node = null;

    protected mainFadeInIsComplete: boolean;
    protected maskFadeInIsComplete: boolean;



    main_block: cc.BlockInputEvents = null;

    title_label: cc.Label = null;
    content_label: cc.Label = null;


    confirm_button: cc.Node = null;
    confirm_label: cc.Label = null;

    cancel_button: cc.Node = null;
    cancel_label: cc.Label = null;


    //面板渐入渐出样式
    protected defaultStyle: any = {
        //动效总开关
        fade_switch_on: true,
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

        maskOpacity: 128,

    }
    protected lateShow(param: { data?: DialogParam, style?: any } = null) {
        super.lateShow(param);
        this.title_label.string = param?.data?.title || "dialog";
        this.content_label.string = param?.data?.content || "content";
        this.main_block.enabled = param?.style?.main_block || false;

        this.confirm_button.active = false;
        this.cancel_button.active = false;

        if (param?.data?.confirm) {
            this.confirm_button.active = true;
            this.confirm_label.string = param.data.confirm;
        }
        if (param?.data?.cancel) {
            this.cancel_button.active = true;
            this.cancel_label.string = param.data.cancel;
        }

        if (!param?.data?.confirm && !param?.data?.cancel) {
            this.cancel_button.active = true;
            this.cancel_label.string = "cancel";
        }


    }

    protected lateLoad(): void {
        super.lateLoad();

        this.title_label = this.content.getChildByName("title_label").getComponent(cc.Label);
        this.content_label = this.content.getChildByName("content_label").getComponent(cc.Label);

        this.confirm_button = cc.find("buttonLayout/confirm_button", this.content);
        this.confirm_label = this.confirm_button?.getChildByName("confirm_label")?.getComponent(cc.Label);

        this.cancel_button = cc.find("buttonLayout/cancel_button", this.content);
        this.cancel_label = this.cancel_button?.getChildByName("cancel_label")?.getComponent(cc.Label);

        this.confirm_button?.on("click", this.onConfirmClick, this);
        this.cancel_button?.on("click", this.goClose, this);

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

    protected onConfirmClick() {
        if (this.param?.data?.confirmCallback) {
            this.param.data.confirmCallback();
        }
        super.goClose();
    }

    goClose() {
        if (this.param?.data?.cancelCallback) {
            this.param.data.cancelCallback();
        }
        super.goClose();
        //UIManager.close(this.UIDefine);
    }

    maskFadeIn(style: any) {

        let mask_opacity = style?.maskOpacity >= 0 ? style.maskOpacity : this.defaultStyle.maskOpacity;
        if (style?.fade_switch_on == false || style?.main_fadeIn_active == false) {
            this.mask.opacity = mask_opacity;
            this.maskFadeInComplete();
        } else {
            this.mask.opacity = 1;
            let duration = style?.mask_fadeIn_duration || this.defaultStyle.mask_fadeIn_duration;
            let ease = style?.mask_fadeIn_ease || this.defaultStyle.mask_fadeIn_ease;
            cc.tween(this.mask).to(duration, { opacity: mask_opacity }, ease).call(this.maskFadeInComplete, this).start();
        }
    }
    mainFadeIn(style: any) {
       
        this.top_block.active = true;

        if (style?.fade_switch_on || style?.main_fadeIn_active == false) {
            this.main.scale = 1;
            this.mainFadeInComplete();
        } else {
            this.main.scale = 0;
            let duration = style?.main_fadeIn_duration || this.defaultStyle.main_fadeIn_duration;
            let ease = style?.main_fadeIn_ease || this.defaultStyle.main_fadeIn_ease;
            cc.tween(this.main).to(duration, { scale: 1 }, ease).call(this.mainFadeInComplete, this).start();
        }
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
