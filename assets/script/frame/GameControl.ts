import UpdateComponent from "../funcomponent/UpdateComponent";
import { GameCache } from "../game/GameCache";
import TexasGame from "../game/texas/TexasGame";
import MessageModel from "../lobby/new_club/message/MessageModel";
import WalletModel from "../lobby/new_club/pay/WalletModel";
import { Bundle_Map } from "../manager/ResManager";
import LobbySession from "../session/LobbySession";
import SoundComponent from "../sound/SoundComponent";
import MoniModel from "./data/moni/MoniModel";
import AudioManager from "./manager/AudioManager";
import DataManager from "./manager/DataManager";
import LanguageManager from "./manager/LanguageManager";
import LocalStoreManager from "./manager/LocalStoreManager";
import { NotifyManager } from "./manager/NotifyManager";
import SDKManager from "./manager/SDKManager";

class GameControl {
    public static get instance(): GameControl {
        return (this as any)._instance ?? new GameControl;
    }
    //判断游戏是否激活
    game_active: boolean = true;

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

    get bundle(): Map<string, cc.AssetManager.Bundle> {
        return Bundle_Map;
    }

    get wallet() {
        return WalletModel.Instance;
    }

    get message() {
        return MessageModel.Instance;
    }

    init() {
        this.data.init();
        this.sdk.init();
    }

}

let GC: GameControl = GameControl.instance;
export default GC;

(window as any).GC = GC;
