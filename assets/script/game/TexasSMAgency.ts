import { StateHandler } from '../statemachine/StateHandler';
import TexasGame from './texas/TexasGame';
import { TexasGameState } from './TexasGameState';
import {
    TexasGameStateHandlerCancel,
    TexasGameStateHandlerComplete,
    TexasGameStateHandlerExchangeRoom,
    TexasGameStateHandlerExit,
    TexasGameStateHandlerHandEnd,
    TexasGameStateHandlerHandFlop,
    TexasGameStateHandlerHandPreflop,
    TexasGameStateHandlerHandRiver,
    TexasGameStateHandlerHandShowdown,
    TexasGameStateHandlerHandStarted,
    TexasGameStateHandlerHandTurn,
    TexasGameStateHandlerInit,
    TexasGameStateHandlerLaunch,
    TexasGameStateHandlerNetworkException,
    TexasGameStateHandlerNotStart,
    TexasGameStateHandlerUnknown,
    TexasGameStateHandlerWaitHandStart
} from './TexasGameStateHandler';

/**
 * Texas 状态机注册
 */
export default class TexasSMAgency {
    GameSMStates: Map<TexasGameState, any> = null;

    constructor(public game: TexasGame) {}

    public LoadGameStateConf() {
        if (!this.GameSMStates) {
            this.GameSMStates = new Map<TexasGameState, StateHandler>();
            this.GameSMStates.set(TexasGameState.NetworkException, new TexasGameStateHandlerNetworkException());
            this.GameSMStates.set(TexasGameState.Launch, new TexasGameStateHandlerLaunch());
            this.GameSMStates.set(TexasGameState.Init, new TexasGameStateHandlerInit());
            this.GameSMStates.set(TexasGameState.Exit, new TexasGameStateHandlerExit());
            this.GameSMStates.set(TexasGameState.ExchangeRoom, new TexasGameStateHandlerExchangeRoom());
            this.GameSMStates.set(TexasGameState.NotStart, new TexasGameStateHandlerNotStart());
            this.GameSMStates.set(TexasGameState.WaitHandStart, new TexasGameStateHandlerWaitHandStart());
            this.GameSMStates.set(TexasGameState.HandStarted, new TexasGameStateHandlerHandStarted());
            this.GameSMStates.set(TexasGameState.HandPreflop, new TexasGameStateHandlerHandPreflop());
            this.GameSMStates.set(TexasGameState.HandFlop, new TexasGameStateHandlerHandFlop());
            this.GameSMStates.set(TexasGameState.HandTurn, new TexasGameStateHandlerHandTurn());
            this.GameSMStates.set(TexasGameState.HandRiver, new TexasGameStateHandlerHandRiver());
            this.GameSMStates.set(TexasGameState.HandShowdown, new TexasGameStateHandlerHandShowdown());
            this.GameSMStates.set(TexasGameState.HandEnd, new TexasGameStateHandlerHandEnd());
            this.GameSMStates.set(TexasGameState.Complete, new TexasGameStateHandlerComplete());
            this.GameSMStates.set(TexasGameState.Cancel, new TexasGameStateHandlerCancel());
            this.GameSMStates.set(TexasGameState.Unknown, new TexasGameStateHandlerUnknown());
        }
    }

    public ChangeGameState<T>(state: TexasGameState, sourceData?: T) {
        if (this.game.GameState == state) {
            // 状态未变更
            return;
        }
        let stateHandler: StateHandler = this.GameSMStates.get(state);
        if (stateHandler == null) {
            console.log(`ChangeGameState: unrecognized state: ${TexasGameState[state]}`);
            return;
        }
        this.game.GameState = state;
        stateHandler.SourceData = sourceData;
        this.game.GameLogicSMComponent.SM.ChangeState(stateHandler);
    }
}
