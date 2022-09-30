import AudioManager from "./manager/AudioManager";
import LanguageManager from "./manager/LanguageManager";
import LocalStoreManager from "./manager/LocalStoreManager";
import { NotifyManager } from "./manager/NotifyManager";

class GameControl {
    private static _instance: GameControl = null;
    public static get instance() {
        if (!GameControl._instance) {
            GameControl._instance = new GameControl();
        }
        return GameControl._instance;
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



}

let GC = GameControl.instance;
export default GC;