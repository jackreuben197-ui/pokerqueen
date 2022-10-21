import { table } from "console";
import LanguageTemplateData from "../data/languageTemplate/LanguageTemplateData";
import LobbyData from "../data/lobby/LobbyData";
import MttData from "../data/mtt/MttData";
import RateData from "../data/rate/RateData";
import UserInfoData from "../data/user/UserInfoData";
import WalletData from "../data/wallet/WalletData";

export default class DataManager {
    private static _instance: DataManager = null;
    public static get instance() {
        if (!DataManager._instance) {
            DataManager._instance = new DataManager();
        }
        return DataManager._instance;
    }

    lobby: LobbyData = null;
    user: UserInfoData = null;
    wallet: WalletData = null;
    languageTemp: LanguageTemplateData = null;
    rate: RateData = null;
    mtt: MttData = null;
    init() {
        this.lobby = new LobbyData();
        this.user = new UserInfoData();
        this.wallet = new WalletData();
        this.languageTemp = new LanguageTemplateData();
        this.rate = new RateData();
        this.mtt = new MttData();
    }
}
