import { GameCache } from "../game/GameCache";
import TexasGame from "../game/texas/TexasGame";
import AudioManager from "./manager/AudioManager";
import DataManager from "./manager/DataManager";
import LanguageManager from "./manager/LanguageManager";
import LocalStoreManager from "./manager/LocalStoreManager";
import { NotifyManager } from "./manager/NotifyManager";
import SDKManager from "./manager/SDKManager";

class GameControl {
    //private static _instance: GameControl = null;
    public static get instance() {
        return (this as any)._instance ?? new GameControl;
    }

    get language() {
        return LanguageManager.instance;
    }

    get notify() {
        return NotifyManager.instance;
    }

    get localStore() {
        return LocalStoreManager.instance;
    }

    get audio() {
        return AudioManager.instance;
    }

    get data() {
        return DataManager.instance;
    }

    get sdk() {
        return SDKManager.instance;
    }

    get game(): TexasGame {
        return GameCache.Instance.CurGame;
    }

    init() {
        this.data.init();
        this.sdk.init();
    }

}

let GC = GameControl.instance;
export default GC;

(window as any).GC = GC;
