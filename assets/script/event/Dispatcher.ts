
export default class Dispatcher {

    /**
     * 事件池
     */
    private static _handlers: {
        [key: string]: {
            caller: any,
            handler: Function
        }[]
    } = {};


    /**
     * 派发事件
     * @param event 事件
     * @param params 参数
     */
    public static emit(event: string, ...params: any[]) {
        const list = Dispatcher._handlers[event];
        if (list?.length) {
            for (let t of list) {
                t.handler.call(t.caller, ...params);
            }
        }

    }

    /**
     * 监听事件
     * @param event 事件名称
     * @param handler 回调方法
     * @param caller 作用域
     */
    public static on(event: string, handler: Function, caller: any): void {

        Dispatcher._handlers[event] || (Dispatcher._handlers[event] = []);

        Dispatcher._handlers[event].push({ caller, handler });
    }

    /**
     * 移除监听 
     * @param event 事件名称
     * @param handler 回调方法(未定义则移除事件类型的所有监听)
     * @param caller 作用域
     */
    public static off(event: string, handler?: Function, caller?: any): void {

        if (handler) {
            //获取事件队列
            const list = Dispatcher._handlers[event];

            if (list?.length) {
                //遍历所有事件
                for (let i = list.length - 1; i >= 0; i--) {
                    let e = list[i];
                    //移除对应事件
                    if (e.caller == caller && handler == e.handler) {
                        list.splice(i, 1);
                    }
                }
            }
        } else {
            Dispatcher._handlers[event] = [];
        }
    }
    /**
    * 移除所有事件
    */
    public static removeAllListener() {
        Dispatcher._handlers = {};
    }

}
