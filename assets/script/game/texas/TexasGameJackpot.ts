import { UIDefine } from "../../define/UIDefine";
import { StringHelper } from "../../helper/StringHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { ServerMessageJackpotAward } from "../../protobuf/holdem/recv_th_jackpot_award_pb";
import { ServerMessageJackpotGoldChange } from "../../protobuf/holdem/recv_th_jackpot_gold_change_pb";
import UIComponent from "../../ui/UIComponent";
import { GameCache } from "../GameCache";

interface TexasGameJackpotHost {
    jackpot: number;
    jackpotConfig: any;
    jackpotFeature?: TexasGameJackpot;
    uirc: any;
}

export default class TexasGameJackpot {
    private goldRollData: { value: number } | null = null;
    private goldRollUpdate: (() => void) | null = null;

    constructor(private host: TexasGameJackpotHost) {
    }

    public UpdateRoomConfig(rec: any): void {
        const roomInfo = rec?.roomInfo || {};
        GameCache.Instance.jackPot_on = Number(roomInfo?.jackpot || 0);
        GameCache.Instance.jackPot_id = Number(
            roomInfo?.jackpotId
            ?? roomInfo?.jackpot_id
            ?? GameCache.Instance.jackPot_id
            ?? 0
        );
        GameCache.Instance.jackPot_gold = Number(
            roomInfo?.jackpotGold
            ?? roomInfo?.jackpot_gold
            ?? GameCache.Instance.jackPot_gold
            ?? 0
        );
        GameCache.Instance.jackPot_parent_gold = Number(
            roomInfo?.jackpotParentGold
            ?? roomInfo?.jackpot_parent_gold
            ?? GameCache.Instance.jackPot_parent_gold
            ?? GameCache.Instance.jackPot_gold
            ?? 0
        );
        GameCache.Instance.jackPot_fund = GameCache.Instance.jackPot_parent_gold;
        this.RefreshUI();
    }

    public EnterGame(): void {
        this.RefreshUI();
    }

    public RestoreAfterTableClear(): void {
        this.RefreshUI();
    }

    public OnClickJackpot(): void {
        UIComponent.open(UIDefine.UITexasJackpotRecentAwardRecord, {
            noAnimation: true,
        });
    }

    public PlayStartAnim(): void {
        if (!this.ShouldShowJackpot()) {
            this.HideUI();
            return;
        }

        const animRoot = this.host.uirc?.JackpotAnimRoot as cc.Node;
        const anim = animRoot?.getComponent(cc.Animation);
        if (!animRoot || !anim) {
            this.ShowUI();
            return;
        }

        const clipName = this.ResolveStartClip(anim);
        if (!clipName) {
            animRoot.active = false;
            this.ShowUI();
            return;
        }

        const button = this.host.uirc?.JackpotButton as cc.Node;
        if (button) {
            button.active = false;
        }

        animRoot.active = true;
        anim.stop();
        anim.off("finished", this.OnStartAnimFinished, this);
        anim.on("finished", this.OnStartAnimFinished, this);
        anim.play(clipName);
    }

    public OnGoldChange(rec: ServerMessageJackpotGoldChange.AsObject): void {
        if (!rec) return;
        const startNumber = this.GetCurrentDisplayGold();
        GameCache.Instance.jackPot_id = Number(rec.jackpotId || GameCache.Instance.jackPot_id || 0);
        GameCache.Instance.jackPot_gold = Number(rec.jackpotGold || 0);
        GameCache.Instance.jackPot_parent_gold = Number(rec.jackpotParentGold || rec.jackpotGold || 0);
        GameCache.Instance.jackPot_fund = GameCache.Instance.jackPot_parent_gold;
        this.ShowUI();
        this.RollGold(startNumber, this.GetDisplayGoldValue(), 3);
    }

    public OnAward(rec: ServerMessageJackpotAward.AsObject): void {
        if (!rec?.awardUsersList?.length) {
            return;
        }
        UIComponent.open(UIDefine.UITexasDialogJackpotAwards, {
            awardUsers: rec.awardUsersList,
            noAnimation: true,
        });
    }

    public ResetState(): void {
        this.StopGoldRoll();
        this.HideUI();
        const animRoot = this.host.uirc?.JackpotAnimRoot as cc.Node;
        const anim = animRoot?.getComponent(cc.Animation);
        anim?.off("finished", this.OnStartAnimFinished, this);
        anim?.stop();
        if (animRoot) {
            animRoot.active = false;
        }
    }

    public GetDisplayGoldText(): string {
        return `${this.GetDisplayGoldValue()}`;
    }

    public GetRewardTypeText(cardsType: number): string {
        if (cardsType === 10) return i18nMgr.Get("adaptation10053");
        if (cardsType === 9) return i18nMgr.Get("adaptation10054");
        if (cardsType === 8) return i18nMgr.Get("adaptation10055");
        return "";
    }

    private OnStartAnimFinished(): void {
        const animRoot = this.host.uirc?.JackpotAnimRoot as cc.Node;
        if (animRoot && cc.isValid(animRoot)) {
            animRoot.active = false;
        }
        this.ShowUI();
        this.RollGold(0, this.GetDisplayGoldValue(), 3);
    }

    private RefreshUI(): void {
        if (!this.ShouldShowJackpot()) {
            this.HideUI();
            return;
        }
        this.ShowUI();
    }

    private ShowUI(): void {
        const button = this.host.uirc?.JackpotButton as cc.Node;
        if (button) {
            button.active = true;
        }
        const animRoot = this.host.uirc?.JackpotAnimRoot as cc.Node;
        if (animRoot) {
            animRoot.active = false;
        }
        this.SetGoldLabel(this.GetDisplayGoldText());
    }

    private HideUI(): void {
        const button = this.host.uirc?.JackpotButton as cc.Node;
        if (button) {
            button.active = false;
        }
        this.SetGoldLabel("");
    }

    private SetGoldLabel(value: string): void {
        const label = this.host.uirc?.JackpotGoldLabel as cc.Label | cc.RichText;
        if (!label || !label.node) {
            return;
        }
        label.string = value;
    }

    private ShouldShowJackpot(): boolean {
        return this.host.jackpot === 1 && Number(GameCache.Instance.jackPot_id || 0) > 0;
    }

    private GetDisplayGoldValue(): number {
        return Math.floor(Number(GameCache.Instance.jackPot_parent_gold || 0) / 100);
    }

    private GetCurrentDisplayGold(): number {
        const label = this.host.uirc?.JackpotGoldLabel as cc.Label | cc.RichText;
        if (!label) {
            return 0;
        }
        const value = Number((label.string || "0").replace(/,/g, ""));
        return Number.isFinite(value) ? Math.floor(value) : 0;
    }

    private RollGold(from: number, to: number, duration: number): void {
        const label = this.host.uirc?.JackpotGoldLabel as cc.Label | cc.RichText;
        const scheduler = this.host.uirc as cc.Component;
        if (!label || !label.node) {
            return;
        }
        this.StopGoldRoll();
        if (from === to || duration <= 0) {
            this.SetGoldLabel(`${to}`);
            return;
        }

        this.goldRollData = { value: from };
        cc.tween(this.goldRollData)
            .to(duration, { value: to }, {
                progress: (start: number, end: number, current: number, ratio: number) => {
                    return start + (end - start) * ratio;
                },
            })
            .call(() => {
                this.SetGoldLabel(`${to}`);
                this.goldRollData = null;
            })
            .start();

        const update = () => {
            if (!this.goldRollData || !label.node || !label.node.isValid) {
                return;
            }
            this.SetGoldLabel(`${Math.floor(this.goldRollData.value)}`);
            if (this.goldRollData.value >= to) {
                scheduler?.unschedule(update);
                if (this.goldRollUpdate === update) {
                    this.goldRollUpdate = null;
                }
            }
        };
        this.goldRollUpdate = update;
        scheduler?.schedule(update, 0);
    }

    private StopGoldRoll(): void {
        const scheduler = this.host.uirc as cc.Component;
        if (this.goldRollUpdate) {
            scheduler?.unschedule(this.goldRollUpdate);
            this.goldRollUpdate = null;
        }
        if (this.goldRollData) {
            cc.Tween.stopAllByTarget(this.goldRollData);
            this.goldRollData = null;
        }
    }

    private ResolveStartClip(anim: cc.Animation): string {
        const clips = anim.getClips?.() || [];
        if (!anim.defaultClip && clips.length > 0) {
            anim.defaultClip = clips[0];
        }
        const preferred = ["jackpot_start", "jackpot", "start"];
        for (let i = 0; i < preferred.length; i++) {
            const clipName = preferred[i];
            if (clips.find(c => c && c.name === clipName)) {
                return clipName;
            }
        }
        return anim.defaultClip?.name || "";
    }
}
