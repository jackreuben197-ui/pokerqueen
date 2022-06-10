import Toast from "../Component/Toast";
import Main from "../Main";
import SingleManager from "./SingleManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ToastManager extends SingleManager {

    static ins: ToastManager = null;

    @property(cc.Prefab)
    toast_prefab: cc.Prefab = null;

    craeteToast(content: string) {
        let toast = cc.instantiate(this.toast_prefab);
        toast.parent = Main.Toast;
        toast.getComponent(Toast).setLabel(content);
        cc.tween(toast).to(.5, { y: 100 }).start();
    }

}
