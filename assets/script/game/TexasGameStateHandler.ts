/**
 * TexasGameStateHandler
 */

import { UIDefine } from "../define/UIDefine";
import GameCache from "../manager/GameCache";
import UIManager from "../manager/UIManager";
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

    public Enter(entity?: any) {

        super.Enter(entity);

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

        game.RegiterEnterRoom();

        game.EnterRoom();

        this._waitTimeoutTime = GlobalSession.NowTimeS + this._waitTimeoutThreshold;

        this._checkFlag = true;
    }

    public Execute(entity?: TexasGame) {
    }

    public Exit(entity?: TexasGame) {

    }

}

export class TexasGameStateHandlerInit extends StateHandler {

    public Name: string = "TexasGameStateHandlerInit";


    public Enter(entity?: any) {

        super.Enter(entity);

        let game: TexasGame = entity as TexasGame;

        if (!game) return;


        var source = this.SourceData as ServerMessageEnterRoom.AsObject;
        if (source == null) {
            return;
        }

        UIManager.close(UIDefine.TexasPreLoad);

        GameCache.Instance.CurrentRoomID = GameCache.Instance.room_id;
        GameCache.Instance.CurGame.RegisterMsgHandler();
        GameCache.Instance.CurGame.UpdateRoom(source);
    }

    public Execute(entity?: any) {
    }

    public Exit(entity?: any) {

    }

}


