import { TLobbyGroup } from "../../../config/TTypeConfig";
import { GameType, PokerType } from "../../../game/GameUtil";
import CCTools from "../../../tools/CCTools";

export default class LobbyGroupModel {
    private _data: Map<GameType, TLobbyGroup> = new Map();
    updataData(msgs: Array<any>) {
        this._data.clear();
        msgs.forEach(msg => {
            if (msg.game_type == GameType.Holdem) {
                this.updateHoldem(msg);
            } else {
                this.updateOther(msg);
            }
        })
    }

    private updateHoldem(msg) {
        if (msg.sub_group) {
            msg.sub_group.forEach(sub => {
                let type: GameType = sub.poker_type == PokerType.Normal ? GameType.Holdem : GameType.Plus6;
                this._data.set(type, {
                    game_type: type,
                    poker_type: sub.poker_type,
                    count: sub.count,
                    player_count: sub.player_count,
                    limit_bet_type: sub?.sub_group[0]?.limit_bet_type || 0
                });
            })
        }
    }

    private updateOther(msg) {
        this._data.set(msg.game_type, {
            game_type: msg.game_type,
            poker_type: msg?.sub_group[0]?.poker_type || 0,
            count: msg.count,
            player_count: msg.player_count,
            limit_bet_type: msg?.sub_group[0]?.sub_group[0]?.limit_bet_type || 0
        });
    }

    getGroupByType(type: GameType) {
        return this._data.get(type);
    }

    get omahaGroup():TLobbyGroup {
        let v4 = this.getGroupByType(GameType.Omaha4);
        let v5 = this.getGroupByType(GameType.Omaha5);
        let v6 = this.getGroupByType(GameType.Omaha6);

        return {
            count: v4.count + v5.count + v6.count,
            player_count: v4.player_count + v5.player_count + v6.player_count,
        }

    }
}