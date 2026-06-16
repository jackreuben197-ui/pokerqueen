import { StringHelper } from '../../helper/StringHelper';
import H5MsgMgr from '../../H5MsgMgr';
import { i18nMgr } from '../../i18n/i18nMgr';
import { WebOrgJackpotTemplateInfo, WebStatsJackpotAwardLogs, WWW } from '../../net/https/WebRequest';
import { ServerMessageJackpotAward } from '../../protobuf/holdem/recv_th_jackpot_award_pb';
import { ServerMessageJackpotGoldChange } from '../../protobuf/holdem/recv_th_jackpot_gold_change_pb';
import { GameCache } from '../GameCache';

interface JackpotPanelAwardLogs {
    request_key: string;
    items: any[];
    top_cards_type_data: any;
}

interface JackpotPanelCacheData {
    template: any;
    awardLogs: JackpotPanelAwardLogs | null;
}

interface TexasGameJackpotHost {
    jackpot: number;
    jackpotConfig: any;
    jackpotFeature?: TexasGameJackpot;
    uirc: any;
}

export default class TexasGameJackpot {
    private static readonly JACKPOT_AWARD_LIMIT: number = 15;
    private static readonly panelCache: Map<number, JackpotPanelCacheData> = new Map();
    private goldRollData: { value: number } | null = null;

    private goldRollUpdate: (() => void) | null = null;

    constructor(private host: TexasGameJackpotHost) {}

    public UpdateRoomConfig(rec: any): void {
        const roomInfo = rec?.roomInfo || {};
        GameCache.Instance.jackPot_on = Number(roomInfo?.jackpot || 0);
        if (roomInfo?.jackpotId !== undefined) {
            GameCache.Instance.jackPot_id = Number(roomInfo.jackpotId || 0);
        }
        GameCache.Instance.jackPot_gold = Number(roomInfo?.jackpotGold ?? roomInfo?.jackpot_gold ?? GameCache.Instance.jackPot_gold ?? 0);
        GameCache.Instance.jackPot_parent_gold = Number(
            roomInfo?.jackpotParentGold ?? roomInfo?.jackpot_parent_gold ?? GameCache.Instance.jackPot_parent_gold ?? GameCache.Instance.jackPot_gold ?? 0
        );
        GameCache.Instance.jackPot_fund = GameCache.Instance.jackPot_parent_gold;
        this.RefreshUI();
    }

    public EnterGame(): void {
        this.RefreshUI();
        TexasGameJackpot.clearPanelCache(Number(GameCache.Instance.room_id || 0));
        void this.preloadPanelData();
    }

    public RestoreAfterTableClear(): void {
        this.RefreshUI();
    }

    public OnClickJackpot(): void {
        const panelCache = TexasGameJackpot.getPanelCache(Number(GameCache.Instance.room_id || 0));
        const payload = {
            jackpot_id: Number(GameCache.Instance.jackPot_id || 0),
            game_type: Number(GameCache.Instance.game_type || 0),
            poker_type: Number(GameCache.Instance.poker_type || 0),
            limit_bet_type: Number(GameCache.Instance.bet_type || 0),
            bombpot: GameCache.Instance.CurGame?.isBombPot ? 1 : 0,
            small_blind: Number(GameCache.Instance.CurGame?.smallBlind || 0),
            jackpot_gold: Number(GameCache.Instance.jackPot_gold || 0),
            jackpot_parent_gold: Number(GameCache.Instance.jackPot_parent_gold || 0),
            initial_template: panelCache?.template || null,
            initial_records: panelCache?.awardLogs?.items || [],
            initial_top_record: panelCache?.awardLogs?.top_cards_type_data || null,
            initial_record_request_key: panelCache?.awardLogs?.request_key || ''
        };
        console.log({ payload });
        H5MsgMgr.sendToH5('showPanel', 1, {
            panelType: 'jackpotRecord',
            title: '',
            props: { ...payload }
        });
    }

    public PlayStartAnim(): void {
        if (!this.ShouldShowJackpot()) {
            this.HideUI();
            return;
        }
        // 按需求隐藏 JACKPOT 进场动画：停掉并隐藏动画节点，直接进入动画结束后的状态
        // （显示奖池 UI + 金额滚动），不再播放进场动画。
        const animRoot = this.host.uirc?.JackpotAnimRoot as cc.Node;
        const anim = animRoot?.getComponent(cc.Animation);
        anim?.off('finished', this.OnStartAnimFinished, this);
        anim?.stop();
        if (animRoot) {
            animRoot.active = false;
        }
        this.ShowUI();
        this.RollGold(0, this.GetDisplayGoldValue(), 3);
    }

    public OnGoldChange(rec: ServerMessageJackpotGoldChange.AsObject): void {
        if (!rec) return;
        const startNumber = this.GetCurrentDisplayGold();
        if (rec.jackpotId !== undefined) {
            GameCache.Instance.jackPot_id = Number(rec.jackpotId || 0);
        }
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
        H5MsgMgr.sendToH5('showPanel', 1, {
            panelType: 'jackpotAward',
            title: '',
            props: {
                award_users: rec.awardUsersList
            }
        });
    }

    public ResetState(): void {
        this.StopGoldRoll();
        this.HideUI();
        const animRoot = this.host.uirc?.JackpotAnimRoot as cc.Node;
        const anim = animRoot?.getComponent(cc.Animation);
        anim?.off('finished', this.OnStartAnimFinished, this);
        anim?.stop();
        if (animRoot) {
            animRoot.active = false;
        }
    }

    public GetDisplayGoldText(): string {
        return `${this.GetDisplayGoldValue()}`;
    }

    public GetRewardTypeText(cardsType: number): string {
        if (cardsType === 10) return i18nMgr.Get('adaptation10053');
        if (cardsType === 9) return i18nMgr.Get('adaptation10054');
        if (cardsType === 8) return i18nMgr.Get('adaptation10055');
        return '';
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

    private async preloadPanelData(): Promise<void> {
        const jackpotId = Number(GameCache.Instance.jackPot_id || 0);
        const roomId = Number(GameCache.Instance.room_id || 0);
        if (jackpotId <= 0 || roomId <= 0) {
            return;
        }
        const requestKey = this.getAwardRequestKey();
        try {
            const [templateRes, awardRes] = await Promise.all([
                WWW.Instance.CommonAPI<any>({
                    web_class: WebOrgJackpotTemplateInfo,
                    body: { jackpot_id: jackpotId },
                    juhua: false
                }),
                WWW.Instance.CommonAPI<any>({
                    web_class: WebStatsJackpotAwardLogs,
                    body: {
                        jackpot_id: jackpotId,
                        game_type: [Number(GameCache.Instance.game_type || 0)],
                        poker_type: [Number(GameCache.Instance.poker_type || 0)],
                        limit_bet_type: [Number(GameCache.Instance.bet_type || 0)],
                        bombpot: [GameCache.Instance._texasData._isBombPot ? 1 : 0],
                        start_time: 0,
                        end_time: 0,
                        limit: TexasGameJackpot.JACKPOT_AWARD_LIMIT,
                        offset: 0
                    },
                    juhua: false
                })
            ]);
            if (Number(GameCache.Instance.room_id || 0) !== roomId || Number(GameCache.Instance.jackPot_id || 0) !== jackpotId) {
                return;
            }
            TexasGameJackpot.updatePanelCache(roomId, {
                template: Number(templateRes?.code || 0) === 0 ? templateRes?.data?.item || null : null,
                awardLogs:
                    Number(awardRes?.code || 0) === 0
                        ? {
                              request_key: requestKey,
                              items: Array.isArray(awardRes?.data?.items) ? awardRes.data.items : [],
                              top_cards_type_data: awardRes?.data?.top_cards_type_data || null
                          }
                        : null
            });
        } catch (error) {
            console.warn('[TexasGameJackpot] preloadPanelData failed', error);
        }
    }

    private getAwardRequestKey(): string {
        return [
            Number(GameCache.Instance.game_type || 0),
            Number(GameCache.Instance.poker_type || 0),
            Number(GameCache.Instance.bet_type || 0),
            GameCache.Instance._texasData._isBombPot ? 1 : 0
        ].join('_');
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
        this.SetGoldLabel('');
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
        const value = Number((label.string || '0').replace(/,/g, ''));
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
            .to(
                duration,
                { value: to },
                {
                    progress: (start: number, end: number, current: number, ratio: number) => {
                        return start + (end - start) * ratio;
                    }
                }
            )
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
        const preferred = ['jackpot_start', 'jackpot', 'start'];
        for (let i = 0; i < preferred.length; i++) {
            const clipName = preferred[i];
            if (clips.find(c => c && c.name === clipName)) {
                return clipName;
            }
        }
        return anim.defaultClip?.name || '';
    }

    private static updatePanelCache(roomId: number, data: JackpotPanelCacheData): void {
        TexasGameJackpot.panelCache.set(roomId, data);
    }

    private static getPanelCache(roomId: number): JackpotPanelCacheData | null {
        return TexasGameJackpot.panelCache.get(roomId) || null;
    }

    private static clearPanelCache(roomId: number): void {
        TexasGameJackpot.panelCache.delete(roomId);
    }
}
