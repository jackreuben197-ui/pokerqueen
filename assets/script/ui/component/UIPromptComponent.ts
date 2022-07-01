/**
 * loadng 菊花|文字 效果组件 延迟显示
 */

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
        this.status = this.statusType.Idle;
        this.mask.on("click", this.goClose, this);
    }

    onShow(param: any = null) {
        super.onShow(param);
        this.waitShow = true;
        this.isShow = false;
        this.showStartTime = new Date().getTime();
        this.loading.active = true;
    }

    protected update(dt: number): void {
        if (this.waitShow && this.isShow) return;
        //判断超时
        if (this.isShow) {
            if (new Date().getTime() - this.showStartTime > this.timeout) {
                //关闭
                return;
            }
        }
    }
    goClose() {
        UIManager.close(this.UIDefine);
    }

}
