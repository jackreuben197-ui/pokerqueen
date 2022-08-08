import GameCache from "../manager/GameCache";
import { StateHandler } from "../statemachine/StateHandler";
import TexasGame from "./TexasGame";
import { TexasGameState } from "./TexasGameState";
import { TexasGameStateHandlerInit, TexasGameStateHandlerLaunch, TexasGameStateHandlerNetworkException } from "./TexasGameStateHandler";

/**
 * Texas 状态机注册
 */
export default class TexasSMAgency {


    GameSMStates: Map<TexasGameState, any> = null;

    GameState: TexasGameState = null;

    constructor(public game: TexasGame) { };

    public LoadGameStateConf() {

        if (!this.GameSMStates) {

            this.GameSMStates = new Map<TexasGameState, any>();

            //TexasGameStateNetworkException<Entity>.Instance.Handler = TexasGameStateHandlerNetworkException.Instance;
            this.GameSMStates[TexasGameState.NetworkException] = new TexasGameStateHandlerNetworkException;

            this.GameSMStates[TexasGameState.Launch] = new TexasGameStateHandlerLaunch;

            this.GameSMStates[TexasGameState.Init] = new TexasGameStateHandlerInit;

            //this.GameSMStates[TexasGameState.Init] = new TexasGameStateInit;
            // TexasGameStateInit<Entity>.Instance.Handler = TexasGameStateHandlerInit.Instance;
            // this.GameSMStates[TexasGameState.Init] = TexasGameStateInit<Entity>.Instance;

            // TexasGameStateExit<Entity>.Instance.Handler = TexasGameStateHandlerExit.Instance;
            // this.GameSMStates[TexasGameState.Exit] = TexasGameStateExit<Entity>.Instance;

            // TexasGameStateExchangeRoom<Entity>.Instance.Handler = TexasGameStateHandlerExchangeRoom.Instance;
            // this.GameSMStates[TexasGameState.ExchangeRoom] = TexasGameStateExchangeRoom<Entity>.Instance;

            // TexasGameStateNotStart<Entity>.Instance.Handler = TexasGameStateHandlerNotStart.Instance;
            // this.GameSMStates[TexasGameState.NotStart] = TexasGameStateNotStart<Entity>.Instance;

            // TexasGameStateWaitHandStart<Entity>.Instance.Handler = TexasGameStateHandlerWaitHandStart.Instance;
            // this.GameSMStates[TexasGameState.WaitHandStart] = TexasGameStateWaitHandStart<Entity>.Instance;

            // TexasGameStateHandStarted<Entity>.Instance.Handler = TexasGameStateHandlerHandStarted.Instance;
            // this.GameSMStates[TexasGameState.HandStarted] = TexasGameStateHandStarted<Entity>.Instance;

            // TexasGameStateHandPreflop<Entity>.Instance.Handler = TexasGameStateHandlerHandPreflop.Instance;
            // this.GameSMStates[TexasGameState.HandPreflop] = TexasGameStateHandPreflop<Entity>.Instance;

            // TexasGameStateHandFlop<Entity>.Instance.Handler = TexasGameStateHandlerHandFlop.Instance;
            // this.GameSMStates[TexasGameState.HandFlop] = TexasGameStateHandFlop<Entity>.Instance;

            // TexasGameStateHandTurn<Entity>.Instance.Handler = TexasGameStateHandlerHandTurn.Instance;
            // this.GameSMStates[TexasGameState.HandTurn] = TexasGameStateHandTurn<Entity>.Instance;

            // TexasGameStateHandRiver<Entity>.Instance.Handler = TexasGameStateHandlerHandRiver.Instance;
            // this.GameSMStates[TexasGameState.HandRiver] = TexasGameStateHandRiver<Entity>.Instance;

            // TexasGameStateHandShowdown<Entity>.Instance.Handler = TexasGameStateHandlerHandShowdown.Instance;
            // this.GameSMStates[TexasGameState.HandShowdown] = TexasGameStateHandShowdown<Entity>.Instance;

            // TexasGameStateHandEnd<Entity>.Instance.Handler = TexasGameStateHandlerHandEnd.Instance;
            // this.GameSMStates[TexasGameState.HandEnd] = TexasGameStateHandEnd<Entity>.Instance;

            // TexasGameStateComplete<Entity>.Instance.Handler = TexasGameStateHandlerComplete.Instance;
            // this.GameSMStates[TexasGameState.Complete] = TexasGameStateComplete<Entity>.Instance;

            // TexasGameStateCancel<Entity>.Instance.Handler = TexasGameStateHandlerCancel.Instance;
            // this.GameSMStates[TexasGameState.Cancel] = TexasGameStateCancel<Entity>.Instance;

            // TexasGameStateUnknown<Entity>.Instance.Handler = TexasGameStateHandlerUnknown.Instance;
            // this.GameSMStates[TexasGameState.Unknown] = TexasGameStateUnknown<Entity>.Instance;
        }
    }

    public ChangeGameState(state: TexasGameState, sourceData?: any) {
        if (this.GameState == state) {
            // 状态未变更
            return;
        }
        let stateHandler: StateHandler = this.GameSMStates[state];
        if (stateHandler == null) {
            console.log(`ChangeGameState: unrecognized state: ${TexasGameState[state]}`);
            return;
        }
        this.GameState = state;
        stateHandler.SourceData = sourceData;
        this.game.gameLogicSMComponent.SM.ChangeState(stateHandler);
    }

}
