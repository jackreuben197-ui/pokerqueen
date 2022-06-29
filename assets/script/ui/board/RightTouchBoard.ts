import BaseTouchBoard from "./BaseTouchBoard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RightTouchBoard extends BaseTouchBoard {

    protected lateLoad() {
        super.lateLoad();
        this.content = this.main.getChildByName("content");
    }
    onShow(param: { data?: any, style?: any } = null) {
        super.onShow(param);
    }
    maskFadeIn(style: any) {
        let mask_opacity = style?.maskOpacity >= 0 ? style.maskOpacity : this.defaultStyle.maskOpacity;
        if (style?.main_fadeIn_active == false) {
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
        let startPos = (this.main.width + this.node.width) / 2;
        let endPos = (this.node.width - this.main.width) / 2;
        this.main.x = startPos;
        this.top_block.active = true;
        if (style?.main_fadeIn_active == false) {
            this.main.x = endPos;
            this.mainFadeInComplete();
        } else {
            let duration = style?.main_fadeIn_duration || this.defaultStyle.main_fadeIn_duration;
            let ease = style?.main_fadeIn_ease || this.defaultStyle.main_fadeIn_ease;
            cc.tween(this.main).to(duration, { x: endPos }, ease).call(this.mainFadeInComplete, this).start();
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
