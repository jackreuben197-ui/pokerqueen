/**
 *  触摸板基类
 */

import UIManager from "../../manager/UIManager";
import UIBase from "../UIBase";

const { ccclass } = cc._decorator;

@ccclass
export default class BaseTouchBoard extends UIBase {

    mask: cc.Node = null;
    main: cc.Node = null;
    content: cc.Node = null;

    //mask上的block遮挡
    mask_block: cc.BlockInputEvents = null;

    //content上的block遮挡
    content_block: cc.BlockInputEvents = null;

    //顶部block遮挡
    top_block: cc.Node = null;

    protected mainFadeInIsComplete: boolean;
    protected maskFadeInIsComplete: boolean;

    //面板渐入渐出样式
    protected defaultStyle: any = {

    }

    protected lateLoad(): void {
        super.lateLoad();
        this.mask = this.getChildNode("mask");
        this.main = this.getChildNode("main");
        this.content = this.getChildNode("content");
        this.mask_block = this.mask.getComponent(cc.BlockInputEvents);
        this.content_block = this.content.getComponent(cc.BlockInputEvents);
        this.top_block = this.getChildNode("top_block");
    }


    protected regiterTouchEvents(): void {
        //回退触发
        this.mask.on("click", this.goClose, this);
    }



    onShow(param: { data?: any, style?: any } = null) {
        super.onShow(param);
        this.lateShow(param);
        this.mainFadeInIsComplete = false;
        this.maskFadeInIsComplete = false;
        //设置mask挡板的block
        this.mask_block.enabled = param?.style?.mask_block || false;
        //设置mask是否禁用点击
        this.mask.getComponent(cc.Button).interactable = param?.style?.mask_click == false ? false : true;
        //激活顶层block
        this.top_block.active = true;
        this.maskFadeIn(param?.style);
        this.mainFadeIn(param?.style);
    }

    protected lateShow(param: { data?: any, style?: any } = null) {

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
            cc.log("面板动画完成");
        }
    }
    protected lateClose(param: any = null) {
        super.lateClose(param);
    }
    protected stopAllTweens(): void {
        this.mask.stopAllActions();
        this.main.stopAllActions();
    }
    protected goClose() {
        UIManager.close(this.UIDefine);
    }
}
