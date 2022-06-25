
import Main from "../Main";
import FormManager from "./FormManager";



const { ccclass, property } = cc._decorator;

@ccclass
export default class DialogManager extends FormManager {

    static ins: DialogManager;

    protected lateLoad() {
        this.UILayer = Main.Dialog;
        this.CacheUILayer = Main.Cache_UI;
    }
    // fadeIn(node: cc.Node, effect = UIFadeEffectEnum.None) {
    //     if (node) {
    //         switch (effect) {
    //             case UIFadeEffectEnum.ScaleInOut:
                    
    //                 break;
    //         }
    //     }
    // }
}
