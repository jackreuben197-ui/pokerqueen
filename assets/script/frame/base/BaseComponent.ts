import { AudioPath } from "../../config/PathConfig";
import GC from "../GameControl";
import { Base } from "./Base";


export default class BaseComponent extends Base {
    private _path: string = "";
    private _clickNodes: Array<cc.Node> = [];

    onLoad() {
        super.onLoad();
    }

    start() {
        super.start();
    }

    onEnable() {
        super.onEnable();
    }

    get path() {
        return this._path;
    }
    set path(p) {
        this._path = p;
    }

    protected bindClick(com: cc.Node | cc.Component, callBack: Function, data?: any, scaleAni: boolean = false, start: boolean = false, stopPro: boolean = true) {
        let node: cc.Node = (com instanceof cc.Component ? com.node : com);
        let scale = node.scale;
        node.targetOff(this)
        node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            stopPro && event.stopPropagation()
            scaleAni && node.stopAllActions()
            scaleAni && cc.tween(node).to(0.1, { scale: scale * 1.1 }).start();
            start && callBack(event, data)
        }, this);
        node.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch) => {
            stopPro && event.stopPropagation()
            scaleAni && node.stopAllActions()
            scaleAni && cc.tween(node).to(0.1, { scale: scale }).start();
        }, this);
        node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            stopPro && event.stopPropagation()
            scaleAni && node.stopAllActions()
            scaleAni && cc.tween(node).to(0.1, { scale: scale }).start();
            GC.audio.playSound(AudioPath.btnClick);
            !start && callBack(event, data)
        }, this);
        if (this._clickNodes.indexOf(node) == -1) {
            this._clickNodes.push(node);
        }
    }
    /***  touches start */
    // protected bindTouchs(com: cc.Node | cc.Component, start: boolean = true, move: boolean = true, end: boolean = true, cancle: boolean = true) {
    //     let node: cc.Node = (com instanceof cc.Component ? com.node : com);
    //     node.targetOff(this)
    //     start && node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
    //     move && node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
    //     end && node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
    //     cancle && node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
    //     if (this._clickNodes.indexOf(node) == -1) {
    //         this._clickNodes.push(node);
    //     }
    // }

    // protected bindTouch(com: cc.Node | cc.Component, type: string, callback: Function) {
    //     let node: cc.Node = (com instanceof cc.Component ? com.node : com);
    //     node.targetOff(this)
    //     node.on(type, callback, this);
    //     if (this._clickNodes.indexOf(node) == -1) {
    //         this._clickNodes.push(node);
    //     }
    // }

    // protected touchStart = (event: cc.Event.EventTouch) => {
    //     event.stopPropagation()
    //     let curId = event.touch.getID();
    //     if (GC.config.global.touchId == -1) {
    //         GC.config.global.touchId = curId;
    //     }
    //     if (curId == GC.config.global.touchId) {
    //         this.onTouchStart && this.onTouchStart(event);
    //     }
    // }

    // protected touchMove = (event: cc.Event.EventTouch) => {
    //     event.stopPropagation()
    //     if (event.touch.getID() == GC.config.global.touchId) {
    //         this.onTouchMove && this.onTouchMove(event);
    //     }
    // }

    // protected touchEnd = (event: cc.Event.EventTouch) => {
    //     event.stopPropagation()
    //     if (this.touchEndIsNotMulti(event)) {
    //         this.onTouchEnd && this.onTouchEnd(event);
    //     }
    // }

    // protected touchCancel = (event: cc.Event.EventTouch) => {
    //     event.stopPropagation()
    //     if (this.touchEndIsNotMulti(event)) {
    //         this.onTouchCancel && this.onTouchCancel(event);
    //     }
    // }

    // private touchEndIsNotMulti(event: cc.Event.EventTouch) {
    //     let curId = event.touch.getID();
    //     let isNotMulti = curId == GC.config.global.touchId;
    //     if (isNotMulti) {
    //         GC.config.global.touchId = -1;
    //     }
    //     return isNotMulti;
    // }
    // protected onTouchStart(event: cc.Event.EventTouch) { }
    // protected onTouchMove(event: cc.Event.EventTouch) { }
    // protected onTouchEnd(event: cc.Event.EventTouch) { }
    // protected onTouchCancel(event: cc.Event.EventTouch) { }

    protected removeAllClickEvent() {
        this._clickNodes.forEach(node => {
            if (node && node.isValid) {
                node.targetOff(this);
            }
        })
        this._clickNodes.length = 0
    }

    protected removeClickEvent(node) {
        if (node && node.isValid) {
            node.targetOff(this);
            let index = this._clickNodes.findIndex(item => item == node);
            if (index != -1) {
                this._clickNodes.splice(index, 1);
            }
        }
    }
    /***  touches end */

    // 销毁所有监听事件
    protected unregisterAllListener() {
        super.unregisterAllListener();
        this.removeAllClickEvent();
    }

    onDisable() {

    }

    onDestroy() {
        // 停止所有注册
        this.unscheduleAllCallbacks();
        // 移除所有监听
        this.unregisterAllListener();
        // 停止所有动作
        this.node.stopAllActions();
    }

}