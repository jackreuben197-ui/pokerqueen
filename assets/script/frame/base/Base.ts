import { EventName } from "../../config/EventName";
import { NotifyManager, TEventType } from "../manager/NotifyManager";



export class Base extends cc.Component {
    private _listensArr: Array<TEventType> = [];
    constructor() {
        super();
    }

    onLoad() {
        
    }

    start() {

    }

    onEnable() {

    }

    protected regiterDispatchEvent() {
        this.listen(EventName.serverResponse, this.notify);
    }

    // protected openView(name: string, ...data) {
    //     GC.dialog.openView(name, ...data);
    // }
    // protected openDialog(name: string, ...data) {
    //     GC.dialog.openDialog(name, ...data);
    // }
    // protected openDialogToUILayer(name: string, ...data) {
    //     GC.dialog.openDialogToUILayer(name, ...data);
    // }
    // protected closeByName(name: string) {
    //     GC.dialog.close(name);
    // }

    // protected closeAll(without: string = '') {
    //     GC.dialog.closeAll(without);
    // }

    protected listen(eventType: string | number, callback: Function) {
        if (NotifyManager.instance.register(eventType, callback, this)) {
            let event: TEventType = { eventType: eventType, callback: callback, context: this };
            this._listensArr.push(event);
        }
    }
    protected unregiterDispatchEvent(eventType: string | number) {
        let index = this._listensArr.findIndex((event) => event.eventType == eventType && event.context == this);
        if (index >= 0) {
            let event = this._listensArr.splice(index, 1)[0];
            NotifyManager.instance.remove(event.eventType, event.callback, event.context);
        }
    }

    // 销毁所有监听事件
    protected unregiterAllDispatchEvent() {
        this._listensArr.forEach(event => {
            NotifyManager.instance.remove(event.eventType, event.callback, event.context);
        });
        this._listensArr.length = 0;
    }

    protected post(name: string, ...args: any[]) {
        NotifyManager.instance.post(name, ...args)
    }

    protected notify(id: any, msg: any, sendInfo?: any) { }
}