import { StringHelper } from "../../../helper/StringHelper";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { Web_Org_Jackpot_Template_Info, Web_Stats_Jackpot_Award_Logs, WWW } from "../../../net/https/WebRequest";
import BaseTouchBoard from "../../../ui/board/BaseTouchBoard";
import UIComponent from "../../../ui/UIComponent";
import { GameCache } from "../../GameCache";
import { GameType } from "../../util/GameUtil";

type JackpotAwardItem = {
    gold_change?: number;
    user_id?: number;
    create_time?: string;
    create_timestamp?: number;
    user_name?: string;
    small_blind?: number;
    ante?: number;
    poker_type?: number;
    bombpot?: number;
    cards_type?: number;
    mars_earth?: number;
    user_avatar?: string;
};

const { ccclass } = cc._decorator;

@ccclass
export default class UITexasJackpotRecentAwardRecord extends BaseTouchBoard {
    private colorfulToggle: cc.Toggle = null;
    private jackpotToggle: cc.Toggle = null;
    private hitEarthToggle: cc.Toggle = null;
    private awardToggle: cc.Toggle = null;

    private totalPoolText: cc.Label | cc.RichText = null;
    private listTip: cc.Label | cc.RichText = null;
    // private awardListTip: cc.Label | cc.RichText = null;

    private totalScrollView: cc.Node = null;
    private totalContent: cc.Node = null;
    private totalPoolItem: cc.Node = null;

    private poolRewardScrollView: cc.Node = null;
    private royalFlush: cc.Node = null;
    private straightFlush: cc.Node = null;
    private fourOfAKind: cc.Node = null;
    private poolRewardContent: cc.Label | cc.RichText = null;

    private earthValue: cc.Label | cc.RichText = null;
    private earthValue2: cc.Label | cc.RichText = null;
    private earthContent: cc.Label | cc.RichText = null;

    private awardView: cc.Node = null;
    private awardContent: cc.Node = null;
    private awardItem: cc.Node = null;
    private biggestWinnerRoot: cc.Node = null;
    private biggestWinnerPlayer: cc.Label | cc.RichText = null;
    private biggestWinnerBlind: cc.Label | cc.RichText = null;
    private biggestWinnerGold: cc.Label | cc.RichText = null;
    private biggestWinnerTime: cc.Label | cc.RichText = null;
    private biggestWinnerType: cc.Label | cc.RichText = null;
    private biggestWinnerHead: cc.Sprite = null;
    private hasBiggestWinnerData: boolean = false;

    private totalItems: cc.Node[] = [];
    private awardItems: cc.Node[] = [];

    protected lateLoad(): void {
        super.lateLoad();
        this.colorfulToggle = this.getChildNodeOrComponent("ColorfulToggle", cc.Toggle);
        this.jackpotToggle = this.getChildNodeOrComponent("JackpotlToggle", cc.Toggle) || this.getChildNodeOrComponent("JackpotToggle", cc.Toggle);
        this.hitEarthToggle = this.getChildNodeOrComponent("HitEarthToggle", cc.Toggle);
        this.awardToggle = this.getChildNodeOrComponent("AwardToggle", cc.Toggle);

        this.totalPoolText = this.GetTextComp("TotalPoolText");
        this.listTip = this.GetTextComp("ListTip");
        // this.awardListTip = this.GetTextComp("AwardListTip");

        this.totalScrollView = this.getChildNodeOrComponent("TotalScrollView");
        this.totalContent = (this.totalScrollView && cc.find("view/content", this.totalScrollView)) || this.totalScrollView?.getChildByName("content") || this.totalScrollView;
        this.totalPoolItem = this.getChildNodeOrComponent("TotalPoolItem");
        if (this.totalPoolItem) this.totalPoolItem.active = false;

        this.poolRewardScrollView = this.getChildNodeOrComponent("PoolRewardScroolView");
        this.royalFlush = this.getChildNodeOrComponent("RoyalFlush");
        this.straightFlush = this.getChildNodeOrComponent("StraightFlush");
        this.fourOfAKind = this.getChildNodeOrComponent("Fourofakind") || this.getChildNodeOrComponent("FourOfAKind");
        this.poolRewardContent = this.GetTextComp("PoolRewardContent");

        this.earthValue = this.GetTextComp("EarthValue");
        this.earthValue2 = this.GetTextComp("EarthValue2");
        this.earthContent = this.GetTextComp("EarthContent");

        this.awardView = this.getChildNodeOrComponent("AwardScrollView");
        this.awardContent = (this.awardView && cc.find("view/content", this.awardView)) || this.awardView?.getChildByName("content") || this.awardView;
        this.awardItem = (this.awardContent && cc.find("AwardItem", this.awardContent)) || this.getChildNodeOrComponent("AwardItem");
        if (this.awardItem) this.awardItem.active = false;

        this.biggestWinnerRoot = cc.find("main/BiggestWinner", this.node);
        if (this.biggestWinnerRoot) {
            this.biggestWinnerPlayer = this.GetNodeText(this.biggestWinnerRoot, "TotalPoolItem/Player");
            this.biggestWinnerBlind = this.GetNodeText(this.biggestWinnerRoot, "TotalPoolItem/Blind");
            this.biggestWinnerGold = this.GetNodeText(this.biggestWinnerRoot, "TotalPoolItem/Gold");
            this.biggestWinnerTime = this.GetNodeText(this.biggestWinnerRoot, "TotalPoolItem/Time");
            this.biggestWinnerType = this.GetNodeText(this.biggestWinnerRoot, "TotalPoolItem/Type");
            this.biggestWinnerHead = cc.find("TotalPoolItem/UserHead", this.biggestWinnerRoot)?.getComponent(cc.Sprite) || null;
        }
    }

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.mask, this.onClickClose);
        this.colorfulToggle?.node?.on("toggle", () => this.OnClickToggle(0), this);
        this.jackpotToggle?.node?.on("toggle", () => this.OnClickToggle(1), this);
        this.hitEarthToggle?.node?.on("toggle", () => this.OnClickToggle(2), this);
        this.awardToggle?.node?.on("toggle", () => this.OnClickToggle(3), this);
    }

    protected lateShow(param?: any): void {
        super.lateShow(param);
        this.OnClickToggle(0);
        if (this.colorfulToggle) this.colorfulToggle.isChecked = true;
        void this.LoadData();
    }

    lateClose(param?: any): void {
        super.lateClose(param);
        this.colorfulToggle?.node?.off("toggle", undefined, this);
        this.jackpotToggle?.node?.off("toggle", undefined, this);
        this.hitEarthToggle?.node?.off("toggle", undefined, this);
        this.awardToggle?.node?.off("toggle", undefined, this);
    }

    private async LoadData(): Promise<void> {
        const jackpotId = Number(GameCache.Instance.jackPot_id || 0);
        if (jackpotId <= 0) return;
        try {
            const [templateResRaw, awardResRaw] = await Promise.all([
                WWW.Instance.CommonAPI({
                    web_class: Web_Org_Jackpot_Template_Info,
                    body: { jackpot_id: jackpotId },
                    juhua: false,
                }),
                WWW.Instance.CommonAPI({
                    web_class: Web_Stats_Jackpot_Award_Logs,
                    body: {
                        jackpot_id: jackpotId,
                        game_type: [Number(GameCache.Instance.game_type || 0)],
                        poker_type: [Number(GameCache.Instance.poker_type || 0)],
                        limit_bet_type: [Number(GameCache.Instance.bet_type || 0)],
                        bombpot: [GameCache.Instance.CurGame?.isBombPot ? 1 : 0],
                        start_time: 0,
                        end_time: 0,
                        limit: 15,
                        offset: 0,
                    },
                    juhua: false,
                }),
            ]);
            const templateRes = (templateResRaw || {}) as any;
            const awardRes = (awardResRaw || {}) as any;

            const item = templateRes?.data?.item || null;
            const setting = this.ResolveCurrentSetting(item);
            const gold = Number(item?.gold || GameCache.Instance.jackPot_parent_gold || 0);
            this.FillTemplateData(setting, gold);
            const awardData = awardRes?.data || {};
            this.FillBiggestWinner(awardData?.top_cards_type_data || null);
            this.FillAwardData(awardData?.items || []);
        } catch (err) {
            cc.warn("[UITexasJackpotRecentAwardRecord] load data failed", err);
        }
    }

    private OnClickToggle(index: number): void {
        if (this.totalPoolText?.node?.parent) this.totalPoolText.node.parent.active = index !== 3;
        if (this.totalScrollView) this.totalScrollView.active = index === 0;
        if (this.poolRewardScrollView) this.poolRewardScrollView.active = index === 1;
        if (this.poolRewardContent?.node?.parent) this.poolRewardContent.node.parent.active = index === 1;
        if (this.earthValue?.node?.parent) this.earthValue.node.parent.active = index === 2;
        if (this.earthValue2?.node?.parent) this.earthValue2.node.parent.active = index === 2;
        if (this.awardView) this.awardView.active = index === 3;
        if (this.biggestWinnerRoot) this.biggestWinnerRoot.active = index === 3 && this.hasBiggestWinnerData;

        if (index === 0) {
            if (this.listTip) this.listTip.string = i18nMgr.Get("UIJackpotRecentAwardRecord_ColorfulNum");
        } else if (index === 1 || index === 2) {
            if (this.listTip) this.listTip.string = i18nMgr.Get("UIJackpotRecentAwardRecord_RewardSet");
        } else if (index === 3) {
            if (this.listTip) this.listTip.string = i18nMgr.Get("UIJackpotRecentAwardRecord_PoolRecond");
        }
    }

    private FillTemplateData(setting: any, gold: number): void {
        if (this.totalPoolText) {
            this.totalPoolText.string = StringHelper.GetLongString(gold);
        }
        this.FillTotalColorful(setting, gold / 100);
        this.FillJackpot(setting);
        this.FillEarth(setting);
    }

    private FillTotalColorful(setting: any, gold: number): void {
        this.totalItems.forEach(v => v.destroy());
        this.totalItems.length = 0;
        const list = setting?.blind_setting || [];
        list.forEach((blind: any) => {
            if (Number(blind?.status || 0) !== 1 || !this.totalPoolItem || !this.totalContent) return;
            const node = cc.instantiate(this.totalPoolItem);
            node.parent = this.totalContent;
            node.active = true;
            const blindText = this.GetNodeText(node, "Blind");
            const goldText = this.GetNodeText(node, "Gold");
            if (blindText) blindText.string = this.GetGameTypeBlindName(Number(blind?.sb || 0) / 100);
            if (goldText) goldText.string = this.FormatAmount(gold * Number(blind?.prize_ratio || 0) / 1000);
            this.totalItems.push(node);
        });
        this.totalContent?.getComponent(cc.Layout)?.updateLayout();
    }

    private FillJackpot(setting: any): void {
        if (!setting) return;
        this.SetRateNode(this.royalFlush, setting?.royal_flush_switch, setting?.royal_flush_ratio);
        this.SetRateNode(this.straightFlush, setting?.straight_flush_switch, setting?.straight_flush_ratio);
        this.SetRateNode(this.fourOfAKind, setting?.four_ofa_kind_switch, setting?.four_ofa_kind_ratio);
        const blind = this.GetBlindData(setting?.blind_setting || []);
        if (!blind || !this.poolRewardContent) return;

        const contributeType = Number(blind?.contribute_type || 0);
        if (contributeType === 2) {
            this.poolRewardContent.string = StringHelper.Format(
                i18nMgr.Get("UIJackpotRecentAwardRecord_PoolReward2"),
                [Number(blind?.contribute_ratio || 0) / 10]
            );
        } else if (contributeType === 3) {
            this.poolRewardContent.string = StringHelper.Format(
                i18nMgr.Get("UIJackpotRecentAwardRecord_PoolReward3"),
                [Number(blind?.contribute_pot_ratio || 0) / 10]
            );
        } else {
            this.poolRewardContent.string = StringHelper.Format(
                i18nMgr.Get("UIJackpotRecentAwardRecord_PoolReward1"),
                [Number(blind?.contribute_fixed_limit || 0), Number(blind?.contribute_fixed_rate || 0)]
            );
        }
    }

    private FillEarth(setting: any): void {
        const blind = this.GetBlindData(setting?.blind_setting || []);
        if (!blind) return;
        const ratio = Number(blind?.mars_earth_ratio || 0) / 10;
        if (this.earthValue) this.earthValue.string = `${ratio}%`;
        if (this.earthValue2) this.earthValue2.string = `${ratio}%`;
        if (this.earthContent) {
            this.earthContent.string = StringHelper.Format(i18nMgr.Get("UIJackpotRecentAwardRecord_HitEarthDetail"), [ratio]);
        }
    }

    private FillAwardData(items: JackpotAwardItem[]): void {
        this.awardItems.forEach(v => v.destroy());
        this.awardItems.length = 0;
        if (this.listTip) {
            this.listTip.string = items.length <= 1
                ? i18nMgr.Get("UIClub_FundDetail_xYlV8VBZ")
                : i18nMgr.Get("UIJackpotRecentAwardRecord_PoolRecond");
        }
        if (!this.awardItem || !this.awardContent) {
            return;
        }

        items.forEach((data) => {
            const node = cc.instantiate(this.awardItem);
            node.parent = this.awardContent;
            node.active = true;
            const player = this.GetNodeText(node, "Player");
            const blind = this.GetNodeText(node, "Blind");
            const gold = this.GetNodeText(node, "Gold");
            const time = this.GetNodeText(node, "Time");
            const type = this.GetNodeText(node, "Type");
            if (player) player.string = data.user_name || "";
            if (gold) gold.string = this.FormatAmount(Number(data.gold_change || 0) / 100);
            if (time) time.string = this.FormatTime(data.create_time, data.create_timestamp);
            if (type) type.string = this.GetRewardTypeText(Number(data.cards_type || 0));
            const headNode = cc.find("UserHead", node);
            const headSprite = headNode?.getComponent(cc.Sprite) || null;
            if (headSprite && data.user_avatar) {
                this.setSprite(headSprite, data.user_avatar);
            }
            if (blind) {
                if (Number(data.bombpot || 0) === 1 || Number(data.poker_type || 0) === 2) {
                    blind.string = `${Number(data.ante || 0) / 100}`;
                } else {
                    const sb = Number(data.small_blind || 0) / 100;
                    blind.string = `${sb}/${sb * 2}`;
                }
            }
            const icon = cc.find("Player/Icon", node);
            if (icon) icon.active = Number(data.mars_earth || 0) === 1;
            this.awardItems.push(node);
        });
        this.awardContent?.getComponent(cc.Layout)?.updateLayout();
    }

    private FillBiggestWinner(top: JackpotAwardItem | null): void {
        const hasData = !!top && Number(top.user_id || 0) !== 0;
        this.hasBiggestWinnerData = hasData;
        if (!this.biggestWinnerRoot) {
            return;
        }
        this.biggestWinnerRoot.active = hasData && this.awardView?.active;
        if (!hasData) {
            return;
        }

        if (this.biggestWinnerPlayer) this.biggestWinnerPlayer.string = top.user_name || "";
        if (this.biggestWinnerGold) this.biggestWinnerGold.string = this.FormatAmount(Number(top.gold_change || 0) / 100);
        if (this.biggestWinnerTime) this.biggestWinnerTime.string = this.FormatTime(top.create_time, top.create_timestamp).split(' ')[0];
        if (this.biggestWinnerType) this.biggestWinnerType.string = this.GetRewardTypeText(Number(top.cards_type || 0));
        console.log('====>',this.biggestWinnerHead , top.user_avatar);
        
        if (this.biggestWinnerHead && top.user_avatar) {
            this.setSprite(this.biggestWinnerHead, top.user_avatar);
        }
        if (this.biggestWinnerBlind) {
            if (Number(top.bombpot || 0) === 1 || Number(top.poker_type || 0) === 2) {
                this.biggestWinnerBlind.string = `${Number(top.ante || 0) / 100}`;
            } else {
                const sb = Number(top.small_blind || 0) / 100;
                this.biggestWinnerBlind.string = `${sb}/${sb * 2}`;
            }
        }
    }

    private ResolveCurrentSetting(item: any): any {
        if (!item) return null;
        if (GameCache.Instance.bet_type === 2) return item?.aof_setting || null;
        if (GameCache.Instance.poker_type === 2) return item?.six_plus_setting || null;
        if (GameCache.Instance.CurGame?.isBombPot) return item?.bombpot_setting || null;
        if (GameCache.Instance.game_type === GameType.Holdem) return item?.nlh_setting || null;
        if (GameCache.Instance.game_type === GameType.Omaha4 || GameCache.Instance.game_type === GameType.Omaha5 || GameCache.Instance.game_type === GameType.Omaha6) {
            return item?.plo_setting || null;
        }
        return null;
    }

    private GetBlindData(blindsSetting: any[]): any {
        const sb = Number(GameCache.Instance.CurGame?.smallBlind || 0);
        const factor = (GameCache.Instance.poker_type === 2 || GameCache.Instance.CurGame?.isBombPot) ? 2 : 1;
        return blindsSetting.find(v => Number(v?.sb || 0) === sb * factor) || null;
    }

    private GetGameTypeBlindName(sb: number): string {
        if (GameCache.Instance.CurGame?.isBombPot || GameCache.Instance.poker_type === 2) {
            return `${sb}`;
        }
        if (GameCache.Instance.game_type === GameType.Holdem) {
            return `${sb}/${sb * 2}`;
        }
        if (GameCache.Instance.game_type === GameType.Omaha4 || GameCache.Instance.game_type === GameType.Omaha5 || GameCache.Instance.game_type === GameType.Omaha6) {
            return `${sb}/${sb * 2}`;
        }
        return `${sb}`;
    }

    private SetRateNode(node: cc.Node, switchValue: number, ratio: number): void {
        if (!node) return;
        node.active = Number(switchValue || 0) === 1;
        const tip = this.GetNodeText(node, "Tip");
        if (tip) {
            tip.string = `${Number(ratio || 0) / 10}%`;
        }
        const ring = cc.find("Ring_Select", node)?.getComponent(cc.Sprite);
        if (ring && ring.type === cc.Sprite.Type.FILLED) {
            ring.fillRange = Number(ratio || 0) / 1000;
        }
    }

    private GetRewardTypeText(cardsType: number): string {
        if (cardsType === 10) return i18nMgr.Get("adaptation10053");
        if (cardsType === 9) return i18nMgr.Get("adaptation10054");
        if (cardsType === 8) return i18nMgr.Get("adaptation10055");
        return "";
    }

    private FormatTime(createTime?: string, timestamp?: number): string {
        if (createTime && createTime.length > 0) {
            const d = new Date(createTime);
            if (!Number.isNaN(d.getTime())) {
                const mm = `${d.getMonth() + 1}`.padStart(2, "0");
                const dd = `${d.getDate()}`.padStart(2, "0");
                const hh = `${d.getHours()}`.padStart(2, "0");
                const min = `${d.getMinutes()}`.padStart(2, "0");
                return `${mm}-${dd} ${hh}:${min}`;
            }
        }
        if (timestamp) {
            const d = new Date(Number(timestamp) * 1000);
            const mm = `${d.getMonth() + 1}`.padStart(2, "0");
            const dd = `${d.getDate()}`.padStart(2, "0");
            const hh = `${d.getHours()}`.padStart(2, "0");
            const min = `${d.getMinutes()}`.padStart(2, "0");
            return `${mm}-${dd} ${hh}:${min}`;
        }
        return "";
    }

    private GetTextComp(name: string): cc.Label | cc.RichText {
        const node = this.getChildNodeOrComponent(name);
        return node?.getComponent(cc.Label) || node?.getComponent(cc.RichText) || null;
    }

    private GetNodeText(root: cc.Node, path: string): cc.Label | cc.RichText {
        const node = cc.find(path, root);
        return node?.getComponent(cc.Label) || node?.getComponent(cc.RichText) || null;
    }

    private FormatAmount(value: number): string {
        if (!Number.isFinite(value)) return "0";
        const fixed = value.toFixed(2);
        return fixed.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
    }

    private onClickClose = (): void => {
        UIComponent.close(this.UIDefine);
    };
}
