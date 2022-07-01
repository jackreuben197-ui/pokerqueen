/**
 * loadng 菊花|文字 效果组件 延迟显示
 */

import ToastManager from "../../manager/ToastManager";
import UIManager from "../../manager/UIManager";
import UIBase from "../UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIPromptComponent extends UIBase {

    //状态
    statusType = {
        Idle: 0,
        WaitShow: 1,
        Showing: 2,
    }
    //延时显示
    private showDelay: number = 0.5;

    //超时时间
    private timeout: number = 10;

    mask_opacitys: number[] = [1, 60];

    mask: cc.Node = null;
    loading: cc.Node = null;

    waitShow: boolean;
    isShow: boolean;

    showStartTime: number;

    //当前状态
    status: number;

    protected lateLoad() {
        this.mask = this.node.getChildByName("mask");
        this.loading = this.node.getChildByName("loading");
        this.translateStatus(this.statusType.Idle);
        //this.mask.on("click", this.goClose, this);
    }

    onShow(param: any = null) {
        super.onShow(param);
        this.showStartTime = new Date().getTime();
        this.translateStatus(this.statusType.WaitShow);
    }

    protected update(dt: number): void {

        switch (this.status) {
            //case this.statusType.Idle:
            //return;
            case this.statusType.Showing:
                if ((new Date().getTime() - this.showStartTime) / 1000 > this.timeout) {
                    ToastManager.ins.craeteToast(`请求超时 ${this.timeout}秒`);
                    this.goClose();
                }
                break;
            case this.statusType.WaitShow:
                if ((new Date().getTime() - this.showStartTime) / 1000 > this.showDelay) {
                    this.translateStatus(this.statusType.Showing);
                }
                break;
        }
    }
    goClose() {
        this.translateStatus(this.statusType.Idle);
        UIManager.close(this.UIDefine);
    }

    //切换状态
    translateStatus(status: number) {
        this.status = status;
        if (status == this.statusType.Showing) {
            this.loading.active = true;
            this.mask.opacity = this.mask_opacitys[1];
        } else {
            this.loading.active = false;
            this.mask.opacity = this.mask_opacitys[0];
        }
    }
}
