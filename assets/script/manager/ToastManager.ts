

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

    craeteToast(content: string) {

        let toast_pb = this.node.getComponent(ToastContext)?.toast_prefab;
        if (toast_pb) {
            let toast = cc.instantiate(toast_pb);
            let toast_script = toast.getComponent(Toast);
            toast.parent = Main.Toast;
            toast_script.setLabel(content);
            let count = this.list.length;
            let count_1 = count + 1;

            let start: number;
            let end: number;
            let step = this.config.spaceY + toast.height;

            if (this.prevToast == null) {

            } else {
                toast_script.prev = this.prevToast;
                this.prevToast.next = toast_script;
            }
            this.prevToast = toast_script;


            if (this.prevToast.prev) {

                toast_script.init(toast_script.prev.node.y - step - 50, this.config.fadeOutPosY, step);

            } else {
                toast_script.isHeader = true;
                toast_script.init(this.config.fadeOutPosY - 50, this.config.fadeOutPosY, step);

            }



            toast_script.move = true;

            this.list.push(toast_script);

            //cc.tween(toast).to(.2, { y: end }).delay(count_1 * .3).to(count_1 * .1, { y: 150 }).to(.2, { opacity: 0 }).call(this.moveComplete, this).start();
        }
    }
    moveComplete() {
        this.list.shift();
    }
    protected update(dt: number): void {

        if (this.list.length) {

        }
    }

}
