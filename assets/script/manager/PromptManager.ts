import Main from "../Main";
import FormManager from "./FormManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PromptManager extends FormManager {

    static Name: string = "PromptManager";
    static ins: PromptManager;
    protected lateLoad() {
        this.UILayer = Main.Prompt;
        this.CacheUILayer = Main.Cache_UI;
    }
}
