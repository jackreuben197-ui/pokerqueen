/**
 * TexasGameStateHandler
 */

import GameCache from "../manager/GameCache";
import { ServerMessageEnterRoom } from "../protobuf/holdem/req_enter_room_pb";
import GlobalSession from "../session/GlobalSession";
import { StateHandler } from "../statemachine/StateHandler";
import TexasGame from "./TexasGame";


export class TexasGameStateHandlerNetworkException extends StateHandler {

    public Name: string = "TexasGameStateHandlerNetworkException";

    public Enter(param?: any) {
    }

    public Execute(param?: any) {
    }

    public Exit(param?: any) {

    }
}
export class TexasGameStateHandlerLaunch extends StateHandler {

    public Name: string = "TexasGameStateHandlerLaunch";

    private _waitTimeoutThreshold: number = 20.0;
    private _waitTimeoutTime: number;
    private _checkFlag: boolean;

    private _checkInterval: number = 1.0;
    private _lastCheckTime: number;

    public Enter(game?: TexasGame) {

        super.Enter(game);

        game.RegiterEnterRoom();

        game.EnterRoom();

        this._waitTimeoutTime = GlobalSession.NowTime + this._waitTimeoutThreshold;

        this._checkFlag = true;
    }

    public Execute(game: TexasGame) {
    }

    public Exit(game: TexasGame) {

    }

}

export class TexasGameStateHandlerInit extends StateHandler {

    public Name: string = "TexasGameStateHandlerInit";


    public Enter(game?: TexasGame) {

        super.Enter(game);

        var source = this.SourceData as ServerMessageEnterRoom;
        if (source == null) {
            return;
        }

        // if (game.IsUILoadingActive()) {
        //     UIComponent.Instance.HideNoAnimation(UIType.UIMatch_Loading);
        // }

        GameCache.ins.CurrentRoomID = GameCache.ins.room_id;
        GameCache.ins.CurGame.RegisterMsgHandler();
        GameCache.ins.CurGame.UpdateRoom(source);
    }

    public Execute(game: TexasGame) {
    }

    public Exit(game: TexasGame) {

    }

}


