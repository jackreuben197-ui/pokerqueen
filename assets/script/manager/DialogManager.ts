

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
}
