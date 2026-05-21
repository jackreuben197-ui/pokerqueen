/*
 * @Author: xfj
 * @Date: 2022-09-28 13:10:55
 * @description:
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-27 20:31:45
 * @FilePath: /pokerqueen/assets/script/frame/manager/NotifyManager.ts
 */
import CCTools from '../../tools/CCTools';

export type TEventType = {
    eventType: string | number;
    callback: Function;
    context: any;
};

export class Observer {
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
            cc.error('notify callback error');
        }
    }

    compar(context: any): boolean {
        return context == this._context;
    }
}

/**
 * 事件消息处理
 */
export class NotifyManager {
    private static _instance: NotifyManager = null;

    public static get instance() {
        if (!NotifyManager._instance) {
            NotifyManager._instance = new NotifyManager();
        }
        return NotifyManager._instance;
    }

    /** 监听数组 */
    private _listeners: Map<string | number, Array<Observer>> = new Map();

    public register(name: string | number, callback: Function, context: any) {
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

    public isHaveListener(name: string | number, context: any) {
        let observers: Array<Observer> = this._listeners.get(name);
        if (!CCTools.isNull(observers)) {
            return observers.some(observer => observer.compar(context));
        }
        return false;
    }

    public remove(name: string | number, callback: any, context: any) {
        let observers: Array<Observer> = this._listeners.get(name);
        if (!observers) return;
        let index = observers.findIndex(observer => observer.compar(context));
        if (index != -1) {
            observers.splice(index, 1);
        }
        if (observers.length == 0) {
            this._listeners.delete(name);
        }
    }

    removeAll() {
        this._listeners.clear();
    }

    public post(name: string | number, ...args: any[]) {
        let observers: Array<Observer> = this._listeners.get(name);
        if (CCTools.isNull(observers)) return;
        observers.forEach((observer, idx) => {
            try {
                observer.notify(...args);
            } catch (e) {
                console.error(`[NotifyManager] observer[${idx}] error for event ${name}:`, e);
            }
        });
    }
}
