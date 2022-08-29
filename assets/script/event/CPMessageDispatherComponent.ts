
const { ccclass, property } = cc._decorator;

@ccclass
export default class CPMessageDispatherComponent extends cc.Component {
    public static Instance: CPMessageDispatherComponent = null;
    /**
     * 事件池
     */
    private _handlers: {
        [key: string | number]: {
            caller: any,
            handler: Function
        }[]
    } = {};
    onLoad() {
        CPMessageDispatherComponent.Instance = this;
    }

    /**
     * 派发事件
     * @param event 事件
     * @param params 参数
     */
    public Handle(event: string | number, ...params: any[]): void {
        const list = this._handlers[event];
        if (list?.length) {
            //这里需要倒查询，防止数组长度发生变化
            for (let i: number = list.length - 1; i >= 0; i--) {
                let t = list[i];
                t.handler.call(t.caller, ...params);
            }
        }
    }
    /**
     * 注册事件
     * @param event 事件名称
     * @param handler 回调方法
     * @param caller 作用域
     */
    public RegisterHandler(event: string | number, handler: Function, caller?: any): void {

        this._handlers[event] || (this._handlers[event] = []);

        this._handlers[event].push({ caller, handler });
    }
    /**
     * 移除事件响应
     * @param event 事件名称
     * @param handler 回调方法(未定义则移除事件类型的所有监听)
     * @param caller 作用域
     */
    public RemoveHandler(event: string | number, handler?: Function, caller?: any): void {
        if (handler) {
            //获取事件队列
            const list = this._handlers[event];
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
            this._handlers[event] = [];
        }
    }

    /**
    * 移除所有事件
    */
    public RemoveAllListener() {
        this._handlers = {};
    }
    // update (dt) {}
}
(window as any).CPMessageDispatherComponent = CPMessageDispatherComponent;