
/**
 * 基础小弹窗类
 */

import DialogManager from "../../manager/DialogManager";
import UIBase from "../UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseDialog extends UIBase {

    mask: cc.Node = null;

    block: cc.BlockInputEvents = null;

    main: cc.Node = null;

    title_label: cc.Label = null;
    content_label: cc.Label = null;
    confirm_label: cc.Label = null;


    onShow(param = null) {
        super.onShow(param);
        this.title_label.string = param?.title || "dialog"
        this.content_label.string = param?.content || "content";
        this.confirm_label.string = param?.confirm || "confirm";
        this.block.enabled = param?.block || false;
        this.main.scale = 0;
        cc.tween(this.main).to(.3, { scale: 1 },cc.easeBackOut()).start();
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
}
