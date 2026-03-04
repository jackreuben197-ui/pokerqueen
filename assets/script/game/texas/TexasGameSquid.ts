import { StringHelper } from "../../helper/StringHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { ServerMessageEnterRoom } from "../../protobuf/holdem/req_th_enter_room_pb";
import UIComponent from "../../ui/UIComponent";
import { CPlayer } from "../CPlayer";
import { GameCache } from "../GameCache";

interface TexasGameSquidHost {
    squidEnabled: boolean;
    squidBase: number;
    squidMode: number;
    squidHead: number;
    squidTail: number;
    squidMaxCount: number;
    squidTotalLimit: number;
    squidPool: number;
    squidRound: number;
    squidCurrentRound: number;
    squidOpenNumber: number;
    squidDeposit: number;
    isGameInSquidRound: boolean;
    listSeat: any[];
    uirc: any;
    UpdateRoomDes(): void;
}

export default class TexasGameSquid {
    constructor(private host: TexasGameSquidHost) {
    }

    public UpdateRoomConfig(rec: ServerMessageEnterRoom.AsObject): void {
        const roomInfoAny = rec.roomInfo as any;
        const entryAny = GameCache.Instance as any;
        const subConfigs = roomInfoAny.subConfigsList || [];
        const sub0 = (subConfigs && subConfigs.length > 0) ? subConfigs[0] : null;

        this.host.squidMode = entryAny.room_squid_mode || 0;
        this.host.squidHead = entryAny.room_squid_head || 0;
        this.host.squidTail = entryAny.room_squid_tail || 0;
        this.host.squidMaxCount = entryAny.room_squid_max || 0;
        this.host.squidBase = (roomInfoAny.squidBase || 0) > 0 ? roomInfoAny.squidBase : (entryAny.room_squid_base || 0);
        this.host.squidTotalLimit = roomInfoAny.squidTotalLimit || 0;
        this.host.squidPool = ((rec.handInfo as any)?.pools?.squidPool) || 0;
        this.host.squidRound = roomInfoAny.rounds || 0;
        this.host.squidCurrentRound = (rec.handInfo as any)?.conRounds || 0;
        this.host.squidOpenNumber = entryAny.room_squid_open_number || 0;
        this.host.squidDeposit = roomInfoAny.deposit || 0;
        this.host.isGameInSquidRound = (rec.handInfo as any).inSquid || false;
        this.host.squidEnabled = this.host.squidBase > 0 || this.host.isGameInSquidRound || (entryAny.room_squid_on || 0) > 0;
    }

    public ApplyPlayerState(player: CPlayer, playerRec: any, myInfo: any, isMainSeat: boolean): void {
        player.inSquid = playerRec.inSquid || false;
        player.squidCount = playerRec.squidCount || 0;
        player.squidEscaped = playerRec.squidEscaped || false;
        player.squidRoundSeated = playerRec.squidRoundSeated || player.inSquid;
        if (isMainSeat) {
            player.squidRoundSeated = myInfo?.squidRoundSeated || player.squidRoundSeated;
        }
    }

    public RefreshMarks(): void {
        if (!this.host.listSeat) return;
        this.host.listSeat.forEach(seat => {
            seat?.UpdateSquidTag(this.host.squidEnabled, this.host.isGameInSquidRound);
        });
        this.RefreshGlobalRemain();
    }

    public CountInRoundPlayers(): number {
        if (!this.host.listSeat) return 0;
        let count = 0;
        this.host.listSeat.forEach(seat => {
            if (seat?.Player?.inSquid) {
                count++;
            }
        });
        return count;
    }

    public CountNoMarkPlayers(): number {
        if (!this.host.listSeat || !this.host.squidEnabled || !this.host.isGameInSquidRound) return 0;
        let count = 0;
        this.host.listSeat.forEach(seat => {
            const p = seat?.Player;
            if (!p) return;
            if (!p.inSquid || p.squidEscaped) return;
            if (p.squidCount <= 0) {
                count++;
            }
        });
        return count;
    }

    public BuildRoomDesc(): string {
        if (!this.host.squidEnabled) return "";
        let info = "";
        if (this.host.isGameInSquidRound) {
            info += `\n${i18nMgr.Get("UISquidOpen")}:1/1`;
        } else {
            const currentRound = (this.host.squidCurrentRound || 0) + 1;
            const totalRound = this.host.squidRound || 1;
            info += `\n${i18nMgr.Get("UISquidWaitOpen")}:${currentRound}/${totalRound}`;
        }
        info += `\n${i18nMgr.Get("UIGameTableSquidShow")}:${StringHelper.GetLongString(this.host.squidBase)}`;
        info += `\n${i18nMgr.Get("UIFantasy_dairuyajin")}:${StringHelper.GetLongString(this.host.squidDeposit)}`;
        info += `\n${i18nMgr.Get("UISquidOpenPeopleNumber")}:${this.host.squidOpenNumber}/${GameCache.Instance.seat_count}`;
        return info;
    }

    public PlayRoundStartAnim(): void {
        UIComponent.Instance.Toast(i18nMgr.Get("UISquidOpen"));
    }

    public PlayRoundEndAnim(): void {
        UIComponent.Instance.Toast(i18nMgr.Get("UISquidEndReward"));
    }

    public ResetRoundState(): void {
        this.host.isGameInSquidRound = false;
        this.host.squidPool = 0;
        this.host.listSeat?.forEach(seat => {
            const p = seat?.Player;
            if (!p) return;
            p.inSquid = false;
            p.squidCount = 0;
            p.squidEscaped = false;
            p.squidRoundSeated = false;
            seat.ClearSquidTag();
        });
        if (this.host.uirc?.RemainingSquidCount) {
            this.host.uirc.RemainingSquidCount.active = false;
        }
        this.host.UpdateRoomDes();
    }

    public ResetState(): void {
        this.host.squidEnabled = false;
        this.host.squidBase = 0;
        this.host.squidMode = 0;
        this.host.squidHead = 0;
        this.host.squidTail = 0;
        this.host.squidMaxCount = 0;
        this.host.squidTotalLimit = 0;
        this.host.squidPool = 0;
        this.host.squidRound = 0;
        this.host.squidCurrentRound = 0;
        this.host.squidOpenNumber = 0;
        this.host.squidDeposit = 0;
        this.host.isGameInSquidRound = false;
        if (this.host.uirc?.RemainingSquidCount) {
            this.host.uirc.RemainingSquidCount.active = false;
        }
    }

    private GetMarkedTotal(): number {
        if (!this.host.listSeat) return 0;
        let count = 0;
        this.host.listSeat.forEach(seat => {
            const p = seat?.Player;
            if (!p || !p.inSquid) return;
            count += Math.max(0, p.squidCount || 0);
        });
        return count;
    }

    private GetRoundTotal(): number {
        if (!this.host.squidEnabled || !this.host.isGameInSquidRound) return 0;
        const mode = this.host.squidMode || 0;
        const headOn = this.host.squidHead === 1;
        const tailOn = this.host.squidTail === 1;

        let total = 0;
        if (mode === 1) {
            total = Math.max(this.host.squidTotalLimit || 0, this.host.squidMaxCount || 0);
            if (tailOn) total += 1;
        } else {
            total = Math.max(this.CountInRoundPlayers() - 1, 0);
            if (headOn) total += 1;
            if (tailOn) total += 1;
        }
        return Math.max(0, total);
    }

    private GetRemainCount(): number {
        const total = this.GetRoundTotal();
        if (total <= 0) return 0;
        return Math.max(0, total - this.GetMarkedTotal());
    }

    private RefreshGlobalRemain(): void {
        const node = this.host.uirc?.RemainingSquidCount;
        const label = this.host.uirc?.RemainingSquidLabelCount;
        if (!node) return;
        const show = this.host.squidEnabled && this.host.isGameInSquidRound;
        node.active = show;
        if (!show) return;
        if (label) {
            label.string = `${this.GetRemainCount()}`;
        }
    }
}
