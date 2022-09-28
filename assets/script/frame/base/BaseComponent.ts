import { AudioPath } from "../../config/PathConfig";
import { IUIDefine } from "../../define/EIDefine";
import AdapterComponent from "../../funcomponent/AdapterComponent";
import GC from "../GameControl";
import { Base } from "./Base";


export default class BaseComponent extends Base {
    private _param: any = null;;
    private _path: string = "";
    private _clickNodes: Array<cc.Node> = [];
    private _view: any = {};
    onLoad() {
        super.onLoad();
        this.lateLoad();
        this.regiterTouchEvents();

        !this.UIDefine || this.UIDefine.DisAdaptScreen || this.node.addComponent(AdapterComponent);
        if (this.UIDefine) window[this.UIDefine.Name] = this;
    }

    onShow(param?: any) {
        this._param = param;
        this.UIDefine && cc.log("::", this.UIDefine.Name, "onShow()", "param:", param);
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

    get param() {
        return this._param;
    }

    get UIDefine(): IUIDefine {
        return this.constructor["UIDefine"];
    }

    protected lateLoad() {
        this.load_all_object(this.node);
    }
    /**
     * 保证节点名字在根节点下唯一性 最好不要取名view
     * @param root 
     * @param path 
     * @param 获取节点下的组件的方式 root.$Sprite--->root.$Button---直接获取
     */
    protected load_all_object(root: cc.Node): void {
        root.children.forEach(child => {
            this._view[child.name] = child;
            this.load_all_object(child);
        })
    }

    /**
     * 通过节点名字获取节点 或者 通过 节点名字 + 组件类型 获取节点上的组件
     * @param name 
     * @component 组件类型
     * @returns 
     */
    protected getChildNodeOrComponent<T extends cc.Component | cc.Node>(name: string, component?: { prototype: T }): T {
        let node = this._view[name];
        return component ? (node?.getComponent(component)) : node;
    }

    protected bindClick(com: cc.Node | cc.Component, callBack: Function, data?: any, scaleAni: boolean = false) {
        let node: cc.Node = (com instanceof cc.Component ? com.node : com);
        let scale = node.scale;
        node.targetOff(this)
        let self = this;
        node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            scaleAni && node.stopAllActions()
            scaleAni && cc.tween(node).to(0.1, { scale: scale * 1.1 }).start();
        }, this);
        node.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch) => {
            scaleAni && node.stopAllActions()
            scaleAni && cc.tween(node).to(0.1, { scale: scale }).start();
        }, this);
        node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            scaleAni && node.stopAllActions()
            scaleAni && cc.tween(node).to(0.1, { scale: scale }).start();
            GC.audio.playSound(AudioPath.btnClick);
            callBack.call(self, data, event)
        }, this);
        if (this._clickNodes.indexOf(node) == -1) {
            this._clickNodes.push(node);
        }
    }
    /***  touches start */
    protected bindTouchs(com: cc.Node | cc.Component, start: boolean = true, move: boolean = true, end: boolean = true, cancle: boolean = true) {
        let node: cc.Node = (com instanceof cc.Component ? com.node : com);
        node.targetOff(this)
        start && node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        move && node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        end && node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        cancle && node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
        if (this._clickNodes.indexOf(node) == -1) {
            this._clickNodes.push(node);
        }
    }

    protected bindTouch(com: cc.Node | cc.Component, type: string, callback: Function) {
        let node: cc.Node = (com instanceof cc.Component ? com.node : com);
        node.targetOff(this)
        node.on(type, callback, this);
        if (this._clickNodes.indexOf(node) == -1) {
            this._clickNodes.push(node);
        }
    }

    protected touchStart = (event: cc.Event.EventTouch) => {
        event.stopPropagation()
        if (this.touchEndIsNotMulti(event)) {
            this.onTouchStart && this.onTouchStart(event);
        }
    }

    protected touchMove = (event: cc.Event.EventTouch) => {
        event.stopPropagation()
        if (this.touchEndIsNotMulti(event)) {
            this.onTouchMove && this.onTouchMove(event);
        }
    }

    protected touchEnd = (event: cc.Event.EventTouch) => {
        event.stopPropagation()
        if (this.touchEndIsNotMulti(event)) {
            this.onTouchEnd && this.onTouchEnd(event);
        }
    }

    protected touchCancel = (event: cc.Event.EventTouch) => {
        event.stopPropagation()
        if (this.touchEndIsNotMulti(event)) {
            this.onTouchCancel && this.onTouchCancel(event);
        }
    }

    private touchEndIsNotMulti(event: cc.Event.EventTouch) {
        let firstTouchId = event.getTouches()[0].getID();
        return firstTouchId != event.touch.getID();
    }
    protected onTouchStart(event: cc.Event.EventTouch) { }
    protected onTouchMove(event: cc.Event.EventTouch) { }
    protected onTouchEnd(event: cc.Event.EventTouch) { }
    protected onTouchCancel(event: cc.Event.EventTouch) { }

    /**
     * 注册触摸事件
     */
    protected regiterTouchEvents() {

    }

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

    onClose(param?: any) {
        this.UIDefine && cc.log("::", this.UIDefine.Name, "onClose()");
        this.stopAllThings();
        this.unregiterAllDispatchEvent();
        this.lateClose(param);
    }

    lateClose(param?: any) {

    }

    // 销毁所有监听事件
    protected unregiterAllDispatchEvent() {
        super.unregiterAllDispatchEvent();
        this.removeAllClickEvent();
    }

    /**
    * 停止所有 动作，包括 tween ,update，等
    */
    protected stopAllThings() {
        this.node.stopAllActions();
    }

    onDisable() {

    }

    onDestroy() {
        // 停止所有注册
        this.unscheduleAllCallbacks();
        // 移除所有监听
        this.unregiterAllDispatchEvent();
        // 停止所有动作
        this.stopAllThings();
    }

}