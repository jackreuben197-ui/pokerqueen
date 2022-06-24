
/**
 * 基础小弹窗类
 */

import DialogManager from "../../manager/DialogManager";
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

    defaultStyle: any = {
        mask: {
            duration: .2,
            //ease: cc.easeBackOut(),
        },
        main: {
            duration: .3,
            ease: cc.easeBackOut(),
        }
    }

    onShow(param: { title: string, content: string, confirm: string, block?: boolean, maskEffectStyle?: any, mainEffectStyle?: any } = null) {
        super.onShow(param);
        this.title_label.string = param?.title || "dialog";
        this.content_label.string = param?.content || "content";
        this.confirm_label.string = param?.confirm || "confirm";
        this.block.enabled = param?.block || false;

        this.doMaskEffect(param.maskEffectStyle);
        this.doMainEffect(param.mainEffectStyle);
    }
    onLoad(): void {
        super.onLoad();
        this.mask = this.node.getChildByName("touchMask");
        this.main = this.node.getChildByName("main");
        this.block = this.main.getComponent(cc.BlockInputEvents);
        this.title_label = this.main.getChildByName("title_label").getComponent(cc.Label);
        this.content_label = this.main.getChildByName("content_label").getComponent(cc.Label);
        this.confirm_label = cc.find("confirm_button/confirm_label", this.main).getComponent(cc.Label);
        this.lateLoad();
    }
    protected lateClose() {
        super.lateClose();
        DialogManager.ins.close();
    }


    
    protected stopAllTweens(): void {
        this.mask.stopAllActions();
        this.main.stopAllActions();
    }


    doMaskEffect(style: any) {
        this.mask.opacity = 1;
        let duration = style?.duration || this.defaultStyle.mask.duration;
        let ease = style?.ease || this.defaultStyle.mask.ease;
        cc.tween(this.mask).to(duration, { opacity: 128 }, ease).start();
    }
    doMainEffect(style: any) {
        this.main.scale = 0;
        let duration = style?.duration || this.defaultStyle.main.duration;
        let ease = style?.ease || this.defaultStyle.main.ease;
        cc.tween(this.main).to(duration, { scale: 1 }, ease).start();
    }


}
