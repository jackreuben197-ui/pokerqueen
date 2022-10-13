import LobbyData from "../data/lobby/LobbyData";
import UserInfoData from "../data/user/UserInfoData";

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
    init() {
        this.lobby = new LobbyData();
        this.user = new UserInfoData();
    }
}
