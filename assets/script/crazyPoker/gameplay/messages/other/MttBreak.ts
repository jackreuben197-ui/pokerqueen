import { ServerMessageMttBreak } from '../../../../protobuf/holdem/recv_g_mtt_break_pb';
import { GameCache } from '../../../../game/GameCache';
import MTTGame from '../../../../game/texas/MTTGame';

// MttBreak 154
export function MttBreak(data: ServerMessageMttBreak.AsObject, roomID: number, matchID: number) {
    if (data == null) return;
    const game = GameCache.Instance.CurGame as MTTGame;
    if (!game || !game.isMTT) return;
    if (matchID && GameCache.Instance.match_id && matchID !== GameCache.Instance.match_id) return;
    game.OnMttBreak(data);
}
