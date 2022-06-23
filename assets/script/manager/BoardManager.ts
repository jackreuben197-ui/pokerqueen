

import Main from "../Main";
import FormManager from "./FormManager";



const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardManager extends FormManager {

    static ins: BoardManager;

    protected lateLoad() {
        this.UILayer = Main.Board;
        this.CacheUILayer = Main.Cache_UI;
    }
}
