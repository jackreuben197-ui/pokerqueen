import LobbyData from "../data/lobby/LobbyData";

export default class DataManager {
    private static _instance: DataManager = null;
    public static get instance() {
        if (!DataManager._instance) {
            DataManager._instance = new DataManager();
        }
        return DataManager._instance;
    }

    lobby: LobbyData = null;
    init() {
        this.lobby = new LobbyData();
    }
}