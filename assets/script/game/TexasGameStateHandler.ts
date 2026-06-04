/**
 * TexasGameStateHandler
 */
import GC from '../frame/GameControl';
import { ProtocolCode } from '../net/websocket/ProtocolCode';
import { ServerMessageHandClear } from '../protobuf/holdem/recv_th_hand_clear_pb';
import { ServerMessagePublicCards } from '../protobuf/holdem/recv_th_public_cards_pb';
import { ServerMessageStartInfo } from '../protobuf/holdem/recv_th_start_info_pb';
import { ServerMessageWinner } from '../protobuf/holdem/recv_th_winner_pb';
import { ServerMessageEnterRoom } from '../protobuf/holdem/req_th_enter_room_pb';
import GlobalSession from '../session/GlobalSession';
import { StateHandler } from '../statemachine/StateHandler';
import UIComponent, { PrefabUI } from '../ui/UIComponent';
import { i18nMgr } from '../i18n/i18nMgr';
import { CPErrorCode } from '../i18n/CPErrorCode';
import { UIMTTModel } from '../new_mtt/UIMTTModel';
import { GameCache } from './GameCache';
import MTTGameProtocol from './protocol/MTTGameProtocol';
import TexasGame from './texas/TexasGame';
import { TexasGameState } from './TexasGameState';
import type { ProcedureReturnNavigateParam } from '../procedure/ProcedureReturn';
import MTTGameUtils from './util/MTTGameUtils';

interface TexasGameExitSourceData {
    response?: unknown;
    h5Navigate?: ProcedureReturnNavigateParam;
}

export class TexasGameStateHandlerNetworkException extends StateHandler {
    public Name: string = 'TexasGameStateHandlerNetworkException';

    public Enter(entity?: any) {
        super.Enter(entity);
    }

    public Execute(entity?: any) {}

    public Exit(entity?: any) {
        super.Exit(entity);
    }
}

export class TexasGameStateHandlerLaunch extends StateHandler {
    public Name: string = 'TexasGameStateHandlerLaunch';

    // private _waitTimeoutThreshold: number = 20.0;
    // private _waitTimeoutTime: number = 0;
    // private _checkFlag: boolean = false;
    // private _checkInterval: number = 1.0;
    // private _lastCheckTime: number = 0;
    public Enter(entity?: any) {
        super.Enter(entity);
        let game: TexasGame = entity as TexasGame;
        if (!game) return;
        GameCache.Instance.CurGame.RegisterMsgHandler();
        game.EnterRoom();
        // this._waitTimeoutTime = GlobalSession.NowTimeS + this._waitTimeoutThreshold;
        // this._checkFlag = true;
    }
}

export class TexasGameStateHandlerInit extends StateHandler {
    public Name: string = 'TexasGameStateHandlerInit';

    public Enter(entity?: any) {
        super.Enter(entity);
        let game: TexasGame = entity as TexasGame;
        if (!game) return;
        var source = this.SourceData as ServerMessageEnterRoom.AsObject;
        if (source == null) {
            return;
        }
        UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
        GameCache.Instance._currentRoomID = GameCache.Instance.room_id;
        GameCache.Instance.CurGame.UpdateRoom(source);
    }
}

export class TexasGameStateHandlerHandStarted extends StateHandler {
    public Name: string = 'TexasGameStateHandlerHandStarted';

    public Enter(entity?: any): void {
        super.Enter(entity);
        let game: TexasGame = entity as TexasGame;
        if (!game) return;
        game.SMAgency.ChangeGameState(TexasGameState.HandPreflop, this.SourceData);
    }
}

export class TexasGameStateHandlerHandPreflop extends StateHandler {
    public Name: string = 'TexasGameStateHandlerHandPreflop';

    public Enter(entity?: any): void {
        const source = this.SourceData as ServerMessageStartInfo.AsObject;
        if (!source) return;
        let game: TexasGame = entity as TexasGame;
        game.TexasGameProtocol.handleRecvStartInfoCommon(source);
    }
}

export class TexasGameStateHandlerExit extends StateHandler {
    public Name: string = 'TexasGameStateHandlerExit';

    public Enter(entity?: any): void {
        super.Enter(entity);
        let game: TexasGame = entity as TexasGame;
        if (!game) return;
        // if (game.IsUILoadingActive()) {
        //     UIComponent.Instance.HideUI(UIType.UIMatch_Loading);
        // }
        UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
        const exitSource = this.SourceData as TexasGameExitSourceData | null;
        const returnParam: ProcedureReturnNavigateParam | undefined = exitSource?.h5Navigate
            ? exitSource.h5Navigate
            : undefined;
        game.TexasGameUtils.ExitRoom(returnParam);
    }

    public Execute(entity?: any): void {}

    public Exit(entity?: any): void {
        super.Exit(entity);
    }
}

export class TexasGameStateHandlerExchangeRoom extends StateHandler {
    public Name: string = 'TexasGameStateHandlerExchangeRoom';

    // MTT 拆并桌等待新房间分配的超时时间（秒），对齐 Unity TexasGameStateHandlerExchangeRoom.WAIT_TIMEOUT_THRESHOLD
    private static readonly WAIT_TIMEOUT_MS: number = 10_000;

    private _timeoutTimer: number = 0;
    private _protocol: MTTGameProtocol = null;
    private _isActive: boolean = false;
    private _isHandlingTimeout: boolean = false;

    public Enter(entity?: any): void {
        super.Enter(entity);
        let game: TexasGame = entity as TexasGame;
        if (!game) return;

        this._isActive = true;
        this._isHandlingTimeout = false;

        // 1. 移除旧房间的玩法消息回调，避免拆桌过渡期收到旧房残留消息时误处理
        game.RemoveMsgHandler();

        // 2. 单独挂载 NotificationRoomReady 回调（仅本状态接收）
        const protocol = game.TexasGameProtocol as MTTGameProtocol;
        if (protocol) {
            this._protocol = protocol;
            GC.notify.remove(
                ProtocolCode.Protocol_Holdem_NotificationRoomReady,
                protocol.Protocol_Holdem_NotificationRoomReady_Handler,
                protocol
            );
            GC.notify.register(
                ProtocolCode.Protocol_Holdem_NotificationRoomReady,
                protocol.Protocol_Holdem_NotificationRoomReady_Handler,
                protocol
            );
        }

        // 3. 提示玩家等待拆桌
        UIComponent.Instance.Toast(i18nMgr.Get('Waiting_split _table'));

        // 4. 超时兜底：10s 内未收到 NotificationRoomReady 则拉 MTT 详情恢复进桌，失败才退出
        this._timeoutTimer = setTimeout(() => {
            this._timeoutTimer = 0;
            this.HandleWaitRoomReadyTimeout(game);
        }, TexasGameStateHandlerExchangeRoom.WAIT_TIMEOUT_MS) as unknown as number;
    }

    public Execute(entity?: any): void {}

    private HandleWaitRoomReadyTimeout(game: TexasGame): void {
        if (this._isHandlingTimeout) {
            return;
        }

        this._isHandlingTimeout = true;
        const matchId = GameCache.Instance.match_id;

        UIMTTModel.Instance.RequestMTTDetails(
            matchId,
            (code: number) => {
                this._isHandlingTimeout = false;
                if (!this._isActive) {
                    return;
                }

                if (code != 0) {
                    UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(code));
                    game.SMAgency.ChangeGameState(TexasGameState.Exit, null);
                    return;
                }

                const mttInfo = UIMTTModel.Instance.MttInfo;
                const storeChips = Number(mttInfo?.state?.store ?? 0);

                const utils = game.TexasGameUtils as MTTGameUtils;
                if (!utils?.HandlePartialBringIn) {
                    game.SMAgency.ChangeGameState(TexasGameState.Exit, null);
                    return;
                }

                utils.HandlePartialBringIn(storeChips, bringInCode => {
                    if (!this._isActive) {
                        return;
                    }

                    if (bringInCode == 0) {
                        game.SMAgency.ChangeGameState(TexasGameState.Launch, null);
                    } else {
                        UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(bringInCode));
                        game.SMAgency.ChangeGameState(TexasGameState.Exit, null);
                    }
                });
            },
            (httpState: any) => {
                this._isHandlingTimeout = false;
                if (!this._isActive) {
                    return;
                }

                UIComponent.Instance.Toast(`HTTPRequestStates: ${httpState}`);
                game.SMAgency.ChangeGameState(TexasGameState.Exit, null);
            }
        );
    }

    public Exit(entity?: any): void {
        super.Exit(entity);
        this._isActive = false;
        if (this._timeoutTimer) {
            clearTimeout(this._timeoutTimer);
            this._timeoutTimer = 0;
        }
        if (this._protocol) {
            GC.notify.remove(
                ProtocolCode.Protocol_Holdem_NotificationRoomReady,
                this._protocol.Protocol_Holdem_NotificationRoomReady_Handler,
                this._protocol
            );
            this._protocol = null;
        }
    }
}

export class TexasGameStateHandlerNotStart extends StateHandler {
    public Name: string = 'TexasGameStateHandlerNotStart';

    public Enter(entity?: any): void {
        let game: TexasGame = entity as TexasGame;
        if (!game) return;
    }

    public Execute(entity?: any): void {}

    public Exit(entity?: any): void {
        super.Exit(entity);
    }
}

export class TexasGameStateHandlerWaitHandStart extends StateHandler {
    public Name: string = 'TexasGameStateHandlerWaitHandStart';

    public Enter(entity?: any): void {
        let game: TexasGame = entity as TexasGame;
        if (!game) return;
    }

    public Execute(entity?: any): void {}

    public Exit(entity?: any): void {
        super.Exit(entity);
    }
}

export class TexasGameStateHandlerHandFlop extends StateHandler {
    public Name: string = 'TexasGameStateHandlerHandFlop';

    public Enter(entity?: any): void {
        var source = this.SourceData as ServerMessagePublicCards.AsObject;
        if (!source.publicCardsArrayList) {
            return;
        }
        let game: TexasGame = entity as TexasGame;
        if (!game) return;
        game.TexasGameProtocol.HandleGetPublicCards(source);
    }

    public Execute(entity?: any): void {}

    public Exit(entity?: any): void {
        super.Exit(entity);
    }
}

export class TexasGameStateHandlerHandTurn extends StateHandler {
    public Name: string = 'TexasGameStateHandlerHandTurn';

    public Enter(entity?: any): void {
        var source = this.SourceData as ServerMessagePublicCards.AsObject;
        if (!source.publicCardsArrayList) {
            return;
        }
        let game: TexasGame = entity as TexasGame;
        if (!game) return;
        game.TexasGameProtocol.HandleGetPublicCards(source);
    }

    public Execute(entity?: any): void {}

    public Exit(entity?: any): void {
        super.Exit(entity);
    }
}

export class TexasGameStateHandlerHandRiver extends StateHandler {
    public Name: string = 'TexasGameStateHandlerHandRiver';

    public Enter(entity?: any): void {
        var source = this.SourceData as ServerMessagePublicCards.AsObject;
        if (!source.publicCardsArrayList) {
            return;
        }
        let game: TexasGame = entity as TexasGame;
        if (!game) return;
        game.TexasGameProtocol.HandleGetPublicCards(source);
    }

    public Execute(entity?: any): void {}

    public Exit(entity?: any): void {
        super.Exit(entity);
    }
}

export class TexasGameStateHandlerHandShowdown extends StateHandler {
    public Name: string = 'TexasGameStateHandlerHandShowdown';

    public Enter(entity?: any): void {
        var source = this.SourceData as ServerMessageWinner.AsObject;
        if (source == null) {
            return;
        }
        let game: TexasGame = entity as TexasGame;
        if (!game) return;
        game.TexasGameProtocol.handleWinnerInfoCommon(source, source);
    }

    public Execute(entity?: any): void {}

    public Exit(entity?: any): void {
        super.Exit(entity);
    }
}

export class TexasGameStateHandlerHandEnd extends StateHandler {
    public Name: string = 'TexasGameStateHandlerHandEnd';

    public Enter(entity?: any): void {
        var source = this.SourceData as ServerMessageHandClear.AsObject;
        if (source == null) {
            return;
        }
        let game: TexasGame = entity as TexasGame;
        if (!game) return;
        game.TexasGameProtocol.HandleRoundFinish(source);
    }

    public Execute(entity?: any): void {}

    public Exit(entity?: any): void {
        super.Exit(entity);
    }
}

export class TexasGameStateHandlerComplete extends StateHandler {
    public Name: string = 'TexasGameStateHandlerComplete';

    public Enter(entity?: any): void {
        let game: TexasGame = entity as TexasGame;
        if (!game) return;
        // 进入房间时游戏已结束，提示用户并自动退出
        console.warn('[TexasGameStateHandlerComplete] game is already complete, exiting...');
        UIComponent.Instance.Toast(i18nMgr.Get('GameRoom_ForceCloseTips'));
        game.SMAgency.ChangeGameState(TexasGameState.Exit, null);
    }

    public Execute(entity?: any): void {}

    public Exit(entity?: any): void {
        super.Exit(entity);
    }
}

export class TexasGameStateHandlerCancel extends StateHandler {
    public Name: string = 'TexasGameStateHandlerCancel';

    public Enter(entity?: any): void {
        let game: TexasGame = entity as TexasGame;
        if (!game) return;
    }

    public Execute(entity?: any): void {}

    public Exit(entity?: any): void {
        super.Exit(entity);
    }
}

export class TexasGameStateHandlerUnknown extends StateHandler {
    public Name: string = 'TexasGameStateHandlerUnknown';

    public Enter(entity?: any): void {
        let game: TexasGame = entity as TexasGame;
        if (!game) return;
    }

    public Execute(entity?: any): void {}

    public Exit(entity?: any): void {
        super.Exit(entity);
    }
}
