import UpdateComponent from "../funcomponent/UpdateComponent";
import { GameCache } from "../game/GameCache";
import TexasGame from "../game/texas/TexasGame";
import SoundComponent from "../sound/SoundComponent";
import MoniModel from "./data/moni/MoniModel";
import AudioManager from "./manager/AudioManager";
import DataManager from "./manager/DataManager";
import LanguageManager from "./manager/LanguageManager";
import LocalStoreManager from "./manager/LocalStoreManager";
import { NotifyManager } from "./manager/NotifyManager";
import SDKManager from "./manager/SDKManager";

class GameControl {
    //private static _instance: GameControl = null;
    public static get instance(): GameControl {
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

    get uc(): UpdateComponent {
        return UpdateComponent.Instance;
    }

    get moni(): MoniModel {
        return MoniModel.Instance;
    }
    get sound(): SoundComponent {
        return SoundComponent.Instance;
    }

    init() {
        this.data.init();
        this.sdk.init();
    }

}

let GC: GameControl = GameControl.instance;
export default GC;

(window as any).GC = GC;
