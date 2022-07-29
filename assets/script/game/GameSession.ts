import TexasGame from "../game/TexasGame";

export default class GameSession {

    public static cache_data = {

    }

    static currentRoomID: number = 0;

    static texasGame: TexasGame = null;

    static Init() {
        this.texasGame || (this.texasGame = new TexasGame());
    }

    static isInGameplay() {
        return this.currentRoomID != 0;
    }

}
