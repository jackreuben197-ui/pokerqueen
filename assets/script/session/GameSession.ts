
export default class GameSession {

    static currentRoomID: number = 0;

    static isInGameplay() {
        return this.currentRoomID != 0;
    }

}
