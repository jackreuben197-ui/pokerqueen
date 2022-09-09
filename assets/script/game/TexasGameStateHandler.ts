/**
 * TexasGameStateHandler
 */
import { UIDefine } from "../define/UIDefine";
import { ServerMessagePublicCards } from "../protobuf/holdem/recv_public_cards_pb";
import { ServerMessageStartInfo } from "../protobuf/holdem/recv_start_info_pb";
import { ServerMessageEnterRoom } from "../protobuf/holdem/req_enter_room_pb";
import GlobalSession from "../session/GlobalSession";
import { StateHandler } from "../statemachine/StateHandler";
import UIComponent from "../ui/UIComponent";
import { GameCache } from "./GameCache";
import TexasGame from "./TexasGame";
import { TexasGameState } from "./TexasGameState";


export class TexasGameStateHandlerNetworkException extends StateHandler {

    public Name: string = "TexasGameStateHandlerNetworkException";

    public Enter(entity?: any) {
        super.Enter(entity);
    }

    public Execute(entity?: any) {
    }

    public Exit(entity?: any) {

        super.Exit(entity);
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

    public Execute(entity?: any) {
    }

    public Exit(entity?: any) {

        super.Exit(entity);

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

        UIComponent.close(UIDefine.TexasPreLoad);

        GameCache.Instance.CurrentRoomID = GameCache.Instance.room_id;
        GameCache.Instance.CurGame.RegisterMsgHandler();
        GameCache.Instance.CurGame.UpdateRoom(source);
    }

    public Execute(entity?: any) {
    }

    public Exit(entity?: any) {

        super.Exit(entity);
    }

}
export class TexasGameStateHandlerHandStarted extends StateHandler {

    public Name: string = "TexasGameStateHandlerHandStarted";

    public Enter(entity?: any): void {

        super.Enter(entity);

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

        game.SMAgency.ChangeGameState(TexasGameState.HandPreflop, this.SourceData);
    }

    public Execute(entity?: any): void {
    }

    public Exit(entity?: any): void {

        super.Exit(entity);
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

        super.Exit(entity);
    }
}


export class TexasGameStateHandlerExit extends StateHandler {

    public Name: string = "TexasGameStateHandlerExit";

    public Enter(entity?: any): void {

        super.Enter(entity);

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

    }

    public Execute(entity?: any): void {
    }

    public Exit(entity?: any): void {

        super.Exit(entity);
    }
}

export class TexasGameStateHandlerExchangeRoom extends StateHandler {

    public Name: string = "TexasGameStateHandlerExchangeRoom";

    public Enter(entity?: any): void {

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

    }

    public Execute(entity?: any): void {
    }

    public Exit(entity?: any): void {

        super.Exit(entity);
    }
}

export class TexasGameStateHandlerNotStart extends StateHandler {

    public Name: string = "TexasGameStateHandlerNotStart";

    public Enter(entity?: any): void {

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

    }

    public Execute(entity?: any): void {
    }

    public Exit(entity?: any): void {

        super.Exit(entity);
    }
}

export class TexasGameStateHandlerWaitHandStart extends StateHandler {

    public Name: string = "TexasGameStateHandlerWaitHandStart";

    public Enter(entity?: any): void {

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

    }

    public Execute(entity?: any): void {
    }

    public Exit(entity?: any): void {

        super.Exit(entity);
    }
}

export class TexasGameStateHandlerHandFlop extends StateHandler {

    public Name: string = "TexasGameStateHandlerHandFlop";

    public Enter(entity?: any): void {


        var source = this.SourceData as ServerMessagePublicCards.AsObject;

        if (source == null) {

            return;
        }

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

        game.HandleGetPublicCards(source);

    }

    public Execute(entity?: any): void {
    }

    public Exit(entity?: any): void {

        super.Exit(entity);
    }
}

export class TexasGameStateHandlerHandTurn extends StateHandler {

    public Name: string = "TexasGameStateHandlerHandTurn";

    public Enter(entity?: any): void {

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

        var source = this.SourceData as ServerMessagePublicCards.AsObject;
        if (source == null) {
            return;
        }

        game.HandleGetPublicCards(source);

    }

    public Execute(entity?: any): void {
    }

    public Exit(entity?: any): void {

        super.Exit(entity);
    }
}

export class TexasGameStateHandlerHandRiver extends StateHandler {

    public Name: string = "TexasGameStateHandlerHandRiver";

    public Enter(entity?: any): void {

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

    }

    public Execute(entity?: any): void {
    }

    public Exit(entity?: any): void {

        super.Exit(entity);
    }
}
export class TexasGameStateHandlerHandShowdown extends StateHandler {

    public Name: string = "TexasGameStateHandlerHandShowdown";

    public Enter(entity?: any): void {

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

    }

    public Execute(entity?: any): void {
    }

    public Exit(entity?: any): void {

        super.Exit(entity);
    }
}

export class TexasGameStateHandlerHandEnd extends StateHandler {

    public Name: string = "TexasGameStateHandlerHandEnd";

    public Enter(entity?: any): void {

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

    }

    public Execute(entity?: any): void {
    }

    public Exit(entity?: any): void {

        super.Exit(entity);
    }
}

export class TexasGameStateHandlerComplete extends StateHandler {

    public Name: string = "TexasGameStateHandlerComplete";

    public Enter(entity?: any): void {

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

    }

    public Execute(entity?: any): void {
    }

    public Exit(entity?: any): void {

        super.Exit(entity);
    }
}
export class TexasGameStateHandlerCancel extends StateHandler {

    public Name: string = "TexasGameStateHandlerCancel";

    public Enter(entity?: any): void {

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

    }

    public Execute(entity?: any): void {
    }

    public Exit(entity?: any): void {

        super.Exit(entity);
    }
}

export class TexasGameStateHandlerUnknown extends StateHandler {

    public Name: string = "TexasGameStateHandlerUnknown";

    public Enter(entity?: any): void {

        let game: TexasGame = entity as TexasGame;

        if (!game) return;

    }

    public Execute(entity?: any): void {
    }

    public Exit(entity?: any): void {

        super.Exit(entity);
    }
}

