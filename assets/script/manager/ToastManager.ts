/**
 * toast管理器 队列上行显示
 */
import Main from '../Main';
import Toast from '../ui/toast/Toast';
import H5MsgMgr from '../H5MsgMgr';

export interface IToastConfig {
    /** 容器起始位置 */
    contentStartPosition?: number;
    /** 渐入的偏移距离*/
    fadeInOffSetDis?: number;
    /** 节点间隔距离*/
    spaceDis?: number;
    /** 缓冲出现时间(解决文本自适应有异步时间差)*/
    bufferDuration?: number;
    /** 渐入时间*/
    fadeInDuration?: number;
    /** 停留时间*/
    stayDuration?: number;
    /** 消失时间*/
    fadeOutDuration?: number;
}

export interface IH5ToastConfig {
    /** success: 成功提示（默认）；danger: 失败/警告提示 */
    type?: 'success' | 'danger';
    /** 显示时长（毫秒），默认 2000 */
    duration?: number;
}

const { ccclass } = cc._decorator;

@ccclass
export default class ToastManager {
    config: IToastConfig = {
        //容器起始位置
        contentStartPosition: 350,
        //渐入的偏移距离
        fadeInOffSetDis: 100,
        //节点间隔距离
        spaceDis: 20,
        //缓冲出现时间(解决文本自适应有异步时间差)
        bufferDuration: 0.1,
        //渐入时间
        fadeInDuration: 0.2,
        //停留时间
        stayDuration: 2,
        //消失时间
        fadeOutDuration: 0.3
    };
    //存储节点的Toast组件
    sequenceToasts: Toast[] = [];
    //队列容器(承载队列节点的容器)
    sequenceContent: cc.Node = null;
    //上一个节点的Toast组件
    prevToast: Toast = null;
    //toast节点池
    toast_pool: cc.Node[] = [];
    fadeDuration: number;

    static get Instance(): ToastManager {
        return ((<any>this).instance ??= new ToastManager());
    }

    constructor() {
        this.sequenceContent = new cc.Node('sequenceContent');
        this.sequenceContent.parent = Main.Toast;
        this.fadeDuration = this.config.bufferDuration + this.config.fadeInDuration + this.config.stayDuration + this.config.fadeOutDuration;
        this.resetSCPosition();
    }

    //重置队列容器位置
    resetSCPosition() {
        this.sequenceContent.y = this.config.contentStartPosition;
    }

    //prevContent: string = null;
    createToast(content: string, customConfig?: IToastConfig, cb?: () => void) {
        //防止重复提示
        // if (content == this.prevContent) return;
        // this.prevContent = content;
        let toast: cc.Node = this.getToast();
        if (toast) {
            let toast_script: Toast = toast.getComponent(Toast);
            toast.active = true;
            toast.parent = this.sequenceContent;
            toast.opacity = 0;
            //toast_script.setLabel(i18nMgr._getLabel(content));
            let config = this.config;
            if (customConfig)
                config = {
                    ...this.config,
                    ...customConfig
                };
            toast_script.setLabel(content);
            if (this.sequenceToasts.length == 0) {
                this.resetSCPosition();
                toast_script.posY = 0;
                toast.y = toast_script.posY - config.fadeInOffSetDis;
                cc.tween(toast)
                    .to(config.bufferDuration, { opacity: 255 })
                    .to(config.fadeInDuration, { y: toast_script.posY })
                    .delay(config.stayDuration)
                    .to(config.fadeOutDuration, { opacity: 0 })
                    .call(async () => {
                        this.fadeComplete();
                        await this.sequenceMove(config);
                        if (cb) cb();
                    })
                    .start();
            } else {
                let step: number = config.spaceDis + (this.prevToast.node.height + toast.height) / 2;
                toast_script.posY = this.prevToast.posY - step;
                toast_script.markFadeOriTime = new Date().getTime();
                toast.y = toast_script.posY - config.fadeInOffSetDis;
                cc.tween(toast)
                    .to(config.bufferDuration, { opacity: 255 })
                    .to(config.fadeInDuration, { y: toast_script.posY })
                    .delay(config.stayDuration)
                    .to(config.fadeOutDuration, { opacity: 0 })
                    .call(() => {
                        if (cb) cb();
                    })
                    .start();
            }
            this.prevToast = toast_script;
            this.sequenceToasts.push(toast_script);
        }
    }

    /**
     * 通过 H5 展示 toast（委托 H5 层渲染，不使用 Cocos 节点）
     */
    showToast(content: string, config?: IH5ToastConfig, cb?: () => void) {
        const type = config?.type ?? 'success';
        const duration = config?.duration ?? 2000;
        H5MsgMgr.sendToH5('showToast', 1, { type, message: content, duration });
        if (cb) {
            setTimeout(cb, duration);
        }
    }

    /**
     * 队列集体运动
     */
    async sequenceMove(config: IToastConfig) {
        while (this.sequenceToasts.length) {
            await this.moveStep(config);
            this.fadeComplete();
        }
        cc.log('sequenceMove complete');
    }

    /**
     *  每步运动
     */
    async moveStep(config: IToastConfig) {
        return new Promise((reslove, reject) => {
            let toast_script = this.sequenceToasts[0];
            let toast = toast_script.node;
            let target = config.contentStartPosition - toast_script.posY;
            cc.tween(this.sequenceContent)
                .to(0.2, { y: target })
                .call(() => {
                    //判断时长，超过变化时长就算完成,否在需要补充停留时间
                    let disTime = (new Date().getTime() - toast_script.markFadeOriTime) / 1000;
                    let passTime = this.fadeDuration - disTime;
                    if (passTime <= 0) {
                        reslove(0);
                    } else {
                        cc.tween(toast)
                            .delay(passTime)
                            .call(() => {
                                reslove(0);
                            })
                            .start();
                    }
                })
                .start();
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
        let toast_pb: cc.Node = Main.Toast_Node;
        return (toast_pb && cc.instantiate(toast_pb)) || null;
    }
}
