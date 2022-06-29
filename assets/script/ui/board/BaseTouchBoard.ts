/**
 *  触摸板基类
 */

import BoardManager from "../../manager/BoardManager";
import UIManager from "../../manager/UIManager";
import UIBase from "../UIBase";

const { ccclass } = cc._decorator;

@ccclass
export default class BaseTouchBoard extends UIBase {

    mask: cc.Node = null;
    main: cc.Node = null;
    content: cc.Node = null;

    //顶部block遮挡
    top_block: cc.Node = null;

    //主内容节点偏移位置
    protected mainOffSetDis: number = 80;

    protected mainFadeInIsComplete: boolean;
    protected maskFadeInIsComplete: boolean;

    //面板渐入渐出样式
    protected defaultStyle = {
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

        mainOffSetDis: 160,

        maskOpacity: 128,

    }

    protected lateLoad(): void {
        super.lateLoad();
        this.mask = this.node.getChildByName("mask");
        this.main = this.node.getChildByName("main");
        this.top_block = this.node.getChildByName("top_block");
        this.mask.on("click", this.goClose, this);
    }

    onShow(param: { data?: any, style?: any } = null) {
        super.onShow(param);
        if (param?.style?.mainOffSetDis) {
            this.defaultStyle.mainOffSetDis = param.style.mainOffSetDis;
        }
        this.main.width = this.node.width - this.defaultStyle.mainOffSetDis;
        this.mainFadeInIsComplete = false;
        this.maskFadeInIsComplete = false;
        this.top_block.active = true;
        this.maskFadeIn(param?.style);
        this.mainFadeIn(param?.style);
    }


    protected maskFadeIn(style: any) {

    }
    protected mainFadeIn(style: any) {

    }

    protected maskFadeOut(style: any) {

    }
    protected mainFadeOut(style: any) {

    }
    protected mainFadeInComplete() {
        this.mainFadeInIsComplete = true;
        this.checkFadeComplete();
    }
    protected maskFadeInComplete() {
        this.maskFadeInIsComplete = true;
        this.checkFadeComplete();
    }
    protected checkFadeComplete() {
        if (this.mainFadeInIsComplete && this.maskFadeInIsComplete) {
            this.top_block.active = false;
        }
    }
    protected lateClose() {
        super.lateClose();
    }
    protected goClose() {
        UIManager.close(this.UIDefine);
    }
}
