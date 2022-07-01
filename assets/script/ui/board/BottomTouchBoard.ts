import BaseTouchBoard from "./BaseTouchBoard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BottomTouchBoard extends BaseTouchBoard {

    //面板渐入渐出样式
    protected defaultStyle: any = {
        //动效总开关
        fade_switch_on: true,
        //内容顶层节点
        main_fadeIn_active: true,
        main_fadeIn_duration: .2,
        main_fadeIn_ease: cc.easeElasticIn,

        main_fadeOut_active: true,
        main_fadeOut_duration: .2,
        main_fadeOut_ease: cc.easeElasticOut,

        //mask节点
        mask_fadeIn_active: true,
        mask_fadeIn_duration: .2,
        mask_fadeIn_ease: null,

        mask_fadeOut_active: true,
        mask_fadeOut_duration: .2,
        mask_fadeOut_ease: null,

        maskOpacity: 1,

    }

    protected lateLoad() {
        super.lateLoad();
    }
    protected lateShow(param: { data?: any, style?: any } = null) {
        super.lateShow(param);
    }
    protected maskFadeIn(style: any) {
        let mask_opacity = style?.maskOpacity >= 0 ? style.maskOpacity : this.defaultStyle.maskOpacity;
        let fade_switch_on = style?.fade_switch_on == false ? false : this.defaultStyle.fade_switch_on;
        if (fade_switch_on == false || style?.main_fadeIn_active == false) {
            this.mask.opacity = mask_opacity;
            this.maskFadeInComplete();
        } else {
            this.mask.opacity = 1;
            let duration = style?.mask_fadeIn_duration || this.defaultStyle.mask_fadeIn_duration;
            let ease = style?.mask_fadeIn_ease || this.defaultStyle.mask_fadeIn_ease;
            cc.tween(this.mask).to(duration, { opacity: mask_opacity }, ease).call(this.maskFadeInComplete, this).start();
        }
    }
    protected async mainFadeIn(style: any) {
        let startPos = -this.content.height;
        let endPos = 0;
        this.main.opacity = 0;
        this.top_block.active = true;
        let fade_switch_on = style?.fade_switch_on == false ? false : this.defaultStyle.fade_switch_on;
        if (fade_switch_on == false || style?.main_fadeIn_active == false) {
            await this.delaySetMain();
            this.main.opacity = 255;
            this.main.y = endPos;
            this.mainFadeInComplete();
        } else {
            await this.delaySetMain();
            this.main.opacity = 255;
            this.main.y = startPos;
            let duration = style?.main_fadeIn_duration || this.defaultStyle.main_fadeIn_duration;
            let ease = style?.main_fadeIn_ease || this.defaultStyle.main_fadeIn_ease;
            cc.tween(this.main).to(duration, { y: endPos }, ease).call(this.mainFadeInComplete, this).start();
        }
    }
    protected maskFadeOut(style: any) {
        this.mask.opacity = 1;
        let duration = style?.mask_fadeOut_duration || this.defaultStyle.mask_fadeOut_duration;
        let ease = style?.mask_fadeOut_ease || this.defaultStyle.mask_fadeOut_ease;
        cc.tween(this.mask).to(duration, { opacity: 128 }, ease).start();
    }
    protected mainFadeOut(style: any) {
        this.main.scale = 0;
        let duration = style?.main_fadeOut_duration || this.defaultStyle.main_fadeOut_duration;
        let ease = style?.main_fadeOut_ease || this.defaultStyle.main_fadeOut_ease;
        cc.tween(this.main).to(duration, { scale: 1 }, ease).start();
    }

    delaySetMain() {
        return new Promise((reslove, reject) => {
            cc.tween(this.main).delay(0).call(() => {
                reslove(0);
            }).start();
        });

    }
}
