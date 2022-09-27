import CCTools from "../../tools/CCTools";

export type TEventType = {
    eventType: string,
    callback: Function,
    context: any,
}

class Observer {
    /** 回调函数 */
    private _callback: Function = null;
    /** 上下文 */
    private _context: any = null;
    constructor(callback: Function, context: any) {
        this._callback = callback;
        this._context = context;
    }

    notify(...args: any[]): void {
        if (this._callback) {
            this._callback.call(this._context, ...args);
        } else {
            cc.error("notify callback error")
        }

    }

    compar(context: any): boolean {
        return context == this._context;
    }
}

/**
 * 事件消息处理
 */
export default class NotifyManager {
    private static _instance: NotifyManager = null;
    public static get instance() {
        if (!NotifyManager._instance) {
            NotifyManager._instance = new NotifyManager();
        }
        return NotifyManager._instance;
    }

    /** 监听数组 */
    private _listeners: Map<string, Array<Observer>> = new Map();
    register(name: string, callback: Function, context: any) {
        let observers: Observer[] = this._listeners.get(name);
        if (!observers) {
            this._listeners.set(name, new Array<Observer>());
        }
        let haveListener = this.isHaveListener(name, context);
        if (!haveListener) {
            this._listeners.get(name).push(new Observer(callback, context));
        }
        return !haveListener;
    }

    isHaveListener(name: string, context: any) {
        let observers: Array<Observer> = this._listeners.get(name);
        if (!CCTools.isNull(observers)) {
            return observers.some(observer => observer.compar(context))
        }
        return false;
    }

    removeListener(name: string, callback: any, context: any) {
        let observers: Array<Observer> = this._listeners.get(name);
        if (!observers) return;

        observers.some((observer, index) => {
            if (observer.compar(context)) {
                observers.splice(index, 1);
                return true;
            }
            return false;
        })

        if (observers.length == 0) {
            this._listeners.delete(name);
        }
    }

    post(name: string, ...args: any[]) {
        let observers: Array<Observer> = this._listeners.get(name);
        if (CCTools.isNull(observers)) return;

        observers.forEach(observer => observer.notify(...args))
    }

    clearAll() {
        this._listeners.clear();
    }
}


