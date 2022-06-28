

/**
 * toast管理调试中...
 */

import Main from "../Main";
import Toast from "../ui/component/Toast";
import ToastContext from "../ui/toast/ToastContext";
import SingleManager from "./SingleManager";


const { ccclass } = cc._decorator;

@ccclass
export default class ToastManager extends SingleManager {

    static ins: ToastManager = null;

    config: any = {
        fadeInPosY: 0,
        fadeOutPosY: 150,
        spaceY: 20,
    }
    list: Toast[] = [];

    header: Toast = null;

    prevToast: Toast = null;

    content: cc.Node = null;

    move: boolean = false;

    content_move: boolean = false;

    step: number;

    toast_pool: cc.Node[] = [];

    protected lateLoad() {
        this.content = new cc.Node;
        this.content.parent = Main.Toast;
    }

    async craeteToast(content: string) {
        let toast_pb = this.node.getComponent(ToastContext)?.toast_prefab;
        if (toast_pb) {
            let toast = this.createToast();
            toast.stopAllActions();
            toast.opacity = 255;;
            let toast_script = toast.getComponent(Toast);
            toast.parent = this.content;
            toast_script.setLabel(content);
            let start, end;
            this.step = this.config.spaceY + toast.height;
            if (this.list.length == 0) {
                cc.log("创建头部")
                this.content.y = 150;
                end = 0;
                start = end - 100;
                toast.y = start;
                cc.tween(toast).to(.2, { y: end }).delay(2).to(.3, { opacity: 0 }).call(this.moveComplete, this).start();
                cc.tween(toast).delay(2.5).call(() => {

                    this.delayCom();
                }).start();
            } else {
                toast_script.prev = this.prevToast;
                end = this.prevToast.node.y - this.step;

                //end = (this.prevToast.node.y - step) - (this.content.y - 150);

                start = end - 100;
                toast.y = start;
                cc.tween(toast).to(.2, { y: end }).start();
            }
            this.prevToast = toast_script;
            this.list.push(toast_script);
        }
    }

    async delayCom() {
        while (this.list.length) {
            await this.moveCircle();
        }
        cc.log("complete");
    }
    async moveCircle() {

        return new Promise((reslove, reject) => {
            let toast = this.list[0].node;
            let target = this.content.y + this.step;
            cc.tween(this.content).to(.2, { y: target }).call(() => {
                cc.tween(toast).to(.3, { opacity: 0 }).call(() => {
                    toast.parent = null;
                }).start();
                cc.tween(toast).delay(.05).call(() => {
                    this.moveComplete();
                    reslove(0);
                }).start();
            }).start();
        });
    }


    moveComplete() {
        let toast = this.list.shift();
        this.returnToast(toast.node);
        if (this.list.length == 0) {
            this.move = false;
            this.prevToast = null;
            this.content.stopAllActions();
            this.content_move = false;
            cc.log("列表为空");
        }
    }
    protected update(dt: number): void {

    }


    returnToast(toast: cc.Node) {
        this.toast_pool.push(toast);
    }

    createToast() {
        //if (this.toast_pool.length) return this.toast_pool.shift();
        let toast_pb = this.node.getComponent(ToastContext)?.toast_prefab;
        return cc.instantiate(toast_pb);
    }
}
