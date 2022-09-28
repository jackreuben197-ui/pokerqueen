import CPMessageDispatherComponent from "../../event/CPMessageDispatherComponent";


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

    register(name: string, callback: Function, context: any) {
        CPMessageDispatherComponent.Instance.RegisterHandler(name, callback, context);
    }

    remove(name: string, callback: any, context: any) {
        CPMessageDispatherComponent.Instance.RemoveHandler(name, callback, context);
    }

    removeAll() {
        CPMessageDispatherComponent.Instance.RemoveAllListener();
    }
    
    post(name: string, ...args: any[]) {
        CPMessageDispatherComponent.Instance.Handle(name, ...args);
    }

}


