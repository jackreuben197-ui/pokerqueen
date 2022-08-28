/**
 * TexasGameStateHandler
 */

import { UIDefine } from "../define/UIDefine";
import UIManager from "../manager/UIManager";
import { ServerMessageStartInfo } from "../protobuf/holdem/recv_start_info_pb";
import { ServerMessageEnterRoom } from "../protobuf/holdem/req_enter_room_pb";
import GlobalSession from "../session/GlobalSession";
import { StateHandler } from "../statemachine/StateHandler";
import {GameCache} from "./GameCache";
import TexasGame from "./TexasGame";
import { TexasGameState } from "./TexasGameState";


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
    private _waitTimeoutTime: number = 0;
    private _checkFlag: boolean = false;

    private _checkInterval: number = 1.0;
    private _lastCheckTime: number = 0;

    public Enter(entity?: any) {

        super.Enter(entity);

        let game: TexasGame = entity as TexasGame;

        console.log("Enter game", game);

        if (!game) return;

        game.RegiterEnterRoom();

        game.EnterRoom(GameCache.Instance.room_id);

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
export class TexasGameStateHandlerHandStarted extends StateHandler {

    public Name: string = "TexasGameStateHandlerHandStarted";

    public Enter(entity?: any): void {

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

        game.SMAgency.ChangeGameState(TexasGameState.HandPreflop, this.SourceData);
    }

    public Execute(entity?: any): void {
    }

    public Exit(entity?: any): void {

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

        super.Exit(game);
    }
}


export class TexasGameStateHandlerHandPreflop extends StateHandler {

    public Name: string = "TexasGameStateHandlerHandPreflop";

    public Enter(entity?: any): void {

        var source = this.SourceData as ServerMessageStartInfo.AsObject;
        if (source == null) {
            return;
        }

        let game: TexasGame = entity as TexasGame;

        game.texasGameProtocol.handleRecvStartInfoCommon(source, source);
    }

    public Execute(entity?: any): void {
    }

    public Exit(entity?: any): void {

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

        super.Exit(game);
    }
}

