/**
 * toast管理器 队列上行显示
 */

import Singleton from "../common/Singleton";
import Dispatcher from "../event/Dispatcher";
import { i18nMgr } from "../i18n/i18nMgr";
import Main from "../Main";
import AssetContext, { AssetFold } from "../ui/component/AssetContext";
import Toast from "../ui/toast/Toast";


const { ccclass } = cc._decorator;

@ccclass
export default class ToastManager extends Singleton {

    static Name: string = "ToastManager";

    static ins: ToastManager = null;

    config: any = {
        //容器起始位置
        contentStartPosition: 350,
        //渐入的偏移距离
        fadeInOffSetDis: 100,
        //节点间隔距离
        spaceDis: 20,
        //缓冲出现时间(解决文本自适应有异步时间差)
        bufferDuration: .1,
        //渐入时间
        fadeInDuration: .2,
        //停留时间
        stayDuration: 2,
        //消失时间
        fadeOutDuration: .3,

    }
    //存储节点的Toast组件
    sequenceToasts: Toast[] = [];
    //队列容器(承载队列节点的容器)
    sequenceContent: cc.Node = null;
    //上一个节点的Toast组件
    prevToast: Toast = null;
    //toast节点池
    toast_pool: cc.Node[] = [];

    fadeDuration: number;

    protected lateLoad() {
        this.sequenceContent = new cc.Node("sequenceContent");
        this.sequenceContent.parent = Main.Toast;
        this.fadeDuration = this.config.bufferDuration + this.config.fadeInDuration + this.config.stayDuration + this.config.fadeOutDuration;
        this.resetSCPosition();
    }
    //重置队列容器位置
    resetSCPosition() {
        this.sequenceContent.y = this.config.contentStartPosition;
    }

    createToast(content: string) {
        let toast: cc.Node = this.getToast();
        if (toast) {
            let toast_script: Toast = toast.getComponent(Toast);
            toast.parent = this.sequenceContent;
            toast.opacity = 0;
            //toast_script.setLabel(i18nMgr._getLabel(content));
            toast_script.setLabel(content);
            if (this.sequenceToasts.length == 0) {
                this.resetSCPosition();
                toast_script.posY = 0;
                toast.y = toast_script.posY - this.config.fadeInOffSetDis;
                cc.tween(toast).to(this.config.bufferDuration, { opacity: 255 }).to(this.config.fadeInDuration, { y: toast_script.posY }).delay(this.config.stayDuration).to(this.config.fadeOutDuration, { opacity: 0 }).call(() => {
                    this.fadeComplete();
                    this.sequenceMove();
                }).start();
            } else {
                let step: number = this.config.spaceDis + (this.prevToast.node.height + toast.height) / 2;
                toast_script.posY = this.prevToast.posY - step;
                toast_script.markFadeOriTime = new Date().getTime();
                toast.y = toast_script.posY - this.config.fadeInOffSetDis;
                cc.tween(toast).to(this.config.bufferDuration, { opacity: 255 }).to(this.config.fadeInDuration, { y: toast_script.posY }).delay(this.config.stayDuration).to(this.config.fadeOutDuration, { opacity: 0 }).start();
            }
            this.prevToast = toast_script;
            this.sequenceToasts.push(toast_script);
        }
    }

    /**
     * 队列集体运动
     */
    async sequenceMove() {
        while (this.sequenceToasts.length) {
            await this.moveStep();
            this.fadeComplete();
        }
        cc.log("sequenceMove complete");
    }
    /**
     *  每步运动
     */
    async moveStep() {

        return new Promise((reslove, reject) => {
            let toast_script = this.sequenceToasts[0];
            let toast = toast_script.node;
            let target = this.config.contentStartPosition - toast_script.posY;
            cc.tween(this.sequenceContent).to(.2, { y: target }).call(() => {
                //判断时长，超过变化时长就算完成,否在需要补充停留时间
                let disTime = (new Date().getTime() - toast_script.markFadeOriTime) / 1000;
                let passTime = this.fadeDuration - disTime;
                if (passTime <= 0) {
                    reslove(0);
                } else {
                    cc.tween(toast).delay(passTime).call(() => {
                        reslove(0);
                    }).start();
                }
            }).start();
        });
    }
    //渐入渐出完成
    fadeComplete() {
        let toast = this.sequenceToasts.shift();
        toast.reset();
        this.returnToast(toast.node);
        //判断所有完成
        if (this.sequenceToasts.length == 0) {
            this.prevToast = null;
            this.sequenceContent.stopAllActions();
        }
    }
    /**
     *  节点返回池子
     */
    returnToast(toast: cc.Node) {
        toast.parent = null;
        this.toast_pool.push(toast);
    }
    /**
     * 从池子取出节点
     */
    getToast() {
        if (this.toast_pool.length) return this.toast_pool.shift();
        let toast_pb: cc.Prefab = AssetContext.getAsset<cc.Prefab>("Toast", AssetFold.resources_prefab_component);
        return toast_pb && cc.instantiate(toast_pb) || null;
    }
}
