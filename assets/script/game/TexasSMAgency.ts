
import { StateHandler } from "../statemachine/StateHandler";
import TexasGame from "./TexasGame";
import { TexasGameState } from "./TexasGameState";
import { TexasGameStateHandlerCancel, TexasGameStateHandlerComplete, TexasGameStateHandlerExchangeRoom, TexasGameStateHandlerExit, TexasGameStateHandlerHandEnd, TexasGameStateHandlerHandFlop, TexasGameStateHandlerHandPreflop, TexasGameStateHandlerHandRiver, TexasGameStateHandlerHandShowdown, TexasGameStateHandlerHandStarted, TexasGameStateHandlerHandTurn, TexasGameStateHandlerInit, TexasGameStateHandlerLaunch, TexasGameStateHandlerNetworkException, TexasGameStateHandlerNotStart, TexasGameStateHandlerUnknown, TexasGameStateHandlerWaitHandStart } from "./TexasGameStateHandler";

/**
 * Texas 状态机注册
 */
export default class TexasSMAgency {


    GameSMStates: Map<TexasGameState, any> = null;

    constructor(public game: TexasGame) { };

    public LoadGameStateConf() {

        if (!this.GameSMStates) {

            this.GameSMStates = new Map<TexasGameState, any>();

            this.GameSMStates[TexasGameState.NetworkException] = new TexasGameStateHandlerNetworkException;

            this.GameSMStates[TexasGameState.Launch] = new TexasGameStateHandlerLaunch;

            this.GameSMStates[TexasGameState.Init] = new TexasGameStateHandlerInit;

            this.GameSMStates[TexasGameState.Exit] = new TexasGameStateHandlerExit;

            this.GameSMStates[TexasGameState.ExchangeRoom] = new TexasGameStateHandlerExchangeRoom;

            this.GameSMStates[TexasGameState.NotStart] = new TexasGameStateHandlerNotStart;

            this.GameSMStates[TexasGameState.WaitHandStart] = new TexasGameStateHandlerWaitHandStart;

            this.GameSMStates[TexasGameState.HandStarted] = new TexasGameStateHandlerHandStarted;

            this.GameSMStates[TexasGameState.HandPreflop] = new TexasGameStateHandlerHandPreflop;

            this.GameSMStates[TexasGameState.HandFlop] = new TexasGameStateHandlerHandFlop;

            this.GameSMStates[TexasGameState.HandTurn] = new TexasGameStateHandlerHandTurn;

            this.GameSMStates[TexasGameState.HandRiver] = new TexasGameStateHandlerHandRiver;

            this.GameSMStates[TexasGameState.HandShowdown] = new TexasGameStateHandlerHandShowdown;

            this.GameSMStates[TexasGameState.HandEnd] = new TexasGameStateHandlerHandEnd;

            this.GameSMStates[TexasGameState.Complete] = new TexasGameStateHandlerComplete;

            this.GameSMStates[TexasGameState.Cancel] = new TexasGameStateHandlerCancel;

            this.GameSMStates[TexasGameState.Unknown] = new TexasGameStateHandlerUnknown;

        }
    }

    public ChangeGameState(state: TexasGameState, sourceData?: any) {
        if (this.game.GameState == state) {
            // 状态未变更
            return;
        }
        let stateHandler: StateHandler = this.GameSMStates[state];
        if (stateHandler == null) {
            console.log(`ChangeGameState: unrecognized state: ${TexasGameState[state]}`);
            return;
        }
        this.game.GameState = state;
        stateHandler.SourceData = sourceData;
        this.game.FsmLogicComponent.SM.ChangeState(stateHandler);
    }

}
