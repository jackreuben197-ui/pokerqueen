import { StringHelper } from "../../helper/StringHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { ServerMessageEnterRoom } from "../../protobuf/holdem/req_th_enter_room_pb";
import { CPlayer } from "../CPlayer";

interface TexasGameMushroomHost {
    mushroomEnabled: boolean;
    mushroomBase: number;
    mushroomMode: number;
    mushroomPool: number;
    currentMinRate: number;
    bigBlind: number;
    mHandNum: number;
    listSeat: any[];
}

export default class TexasGameMushroom {
    constructor(private host: TexasGameMushroomHost) {
    }

    public UpdateRoomConfig(rec: ServerMessageEnterRoom.AsObject): void {
        this.host.mushroomBase = (rec.roomInfo as any).mushroomBase || 0;
        this.host.mushroomMode = (rec.roomInfo as any).mushroomMode || 0;
        const handPools = (rec.handInfo as any)?.pools;
        this.host.mushroomPool = (handPools && handPools.mushroomPool) || (rec.roomInfo as any).mushroomPool || 0;
        if (this.host.mushroomBase > 0) {
            let maxCost = 0;
            rec.playersList?.forEach(p => {
                const c = (p as any).costMushroom || 0;
                if (c > maxCost) maxCost = c;
            });
            this.host.mushroomMode = maxCost > 0 ? Math.max(1, Math.round(maxCost / this.host.mushroomBase)) : 1;
        }
        this.host.mushroomEnabled = this.host.mushroomBase > 0;
    }

    public ApplyPlayerState(player: CPlayer, playerRec: any): void {
        player.inMushroom = playerRec.inMushroom || false;
        player.costMushroom = playerRec.costMushroom || 0;
        player.mushroomCount = playerRec.mushroomCount || 0;
        player.mushroomAmount = playerRec.mushroomAmount || 0;
    }

    public RefreshSeatMarks(): void {
        if (!this.host.listSeat) return;
        this.host.listSeat.forEach(seat => {
            seat?.UpdateMushroomTag(this.host.mushroomPool, this.host.mushroomBase, this.host.mushroomEnabled);
        });
        cc.log(`[MUSH-ENTER] hand=${this.host.mHandNum} pool=${this.host.mushroomPool} base=${this.host.mushroomBase} mode=${this.host.mushroomMode}`);
    }

    public BuildRoomDesc(): string {
        if (!this.host.mushroomEnabled) return "";
        let info = "";
        info += `\n1${i18nMgr.Get("UIMush")} = ${StringHelper.GetLongString(this.host.mushroomBase)} `;
        info += `\n${i18nMgr.Get("UIMushYaJin")}: ${StringHelper.GetLongString(this.host.mushroomBase * (this.host.mushroomMode || 1))}`;
        return info;
    }

    public GetMinBringIn(): number {
        const blindMin = this.host.currentMinRate * this.host.bigBlind;
        if (!this.host.mushroomEnabled) return blindMin;
        const mushCost = this.host.mushroomBase * this.host.mushroomMode;
        return Math.max(blindMin, mushCost);
    }

    public ResetState(): void {
        this.host.mushroomEnabled = false;
        this.host.mushroomBase = 0;
        this.host.mushroomMode = 0;
        this.host.mushroomPool = 0;
    }
}
