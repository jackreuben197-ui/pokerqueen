
import Main from "../Main";
import FormManager from "./FormManager";

const { ccclass } = cc._decorator;

@ccclass
export default class AlertManager extends FormManager {

    static Name:string = "AlertManager";
    static ins: AlertManager;
    protected lateLoad() {
        this.UILayer = Main.Alert;
        this.CacheUILayer = Main.Cache_UI;
    }
}
