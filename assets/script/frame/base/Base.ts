import { EventName } from "../../config/EventName";
import GC from "../GameControl";
import { TEventType } from "../manager/NotifyManager";



export class Base extends cc.Component {
    private _listensArr: Array<TEventType> = [];
    constructor() {
        super();
    }

    onLoad() {
        this.regiterDispatchEvent()
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

    protected listen(eventType: string, callback: Function) {
        if (GC.notify.register(eventType, callback, this)) {
            let event: TEventType = { eventType: eventType, callback: callback, context: this };
            this._listensArr.push(event);
        }
    }
    protected unregiterDispatchEvent(eventType: string) {
        let index = this._listensArr.findIndex((event) => event.eventType == eventType && event.context == this);
        if (index >= 0) {
            let event = this._listensArr.splice(index, 1)[0];
            GC.notify.removeListener(event.eventType, event.callback, event.context);
        }
    }

    // 销毁所有监听事件
    protected unregiterAllDispatchEvent() {
        this._listensArr.forEach(event => {
            GC.notify.removeListener(event.eventType, event.callback, event.context);
        });
        this._listensArr.length = 0;
    }

    protected post(name: string, ...args: any[]) {
        GC.notify.post(name, ...args)
    }

    protected notify(id: any, msg: any) {

    }

    // reqServeGet(msgId: any, data: any = null, showLoading: boolean = true, isShowBg: boolean = false) {
    //     this.reqServe(GC.config.game.httpUrl, msgId, data, showLoading, isShowBg, true);
    // }

    // reqServePost(msgId: any, data: any = null, showLoading: boolean = true, isShowBg: boolean = false) {
    //     this.reqServe(GC.config.game.httpUrl, msgId, data, showLoading, isShowBg, false);
    // }

    // reqServe(url: string, msgId: any, data: any, showLoading: boolean, isShowBg: boolean, isGet: boolean) {
    //     if(msgId == HttpCmdId.LOGIN) {
    //         //请求登陆
    //         GC.sdk.clickStat(EStatType.login,"1")
    //     }
    //     GC.net.http.reqServe(url, msgId, data, showLoading, isShowBg, isGet);
    // }

    // sendMsg(cfg: TProtoType, data: any = {}) {
    //     GC.net.socket.sendMsg(cfg, data);
    // }

}