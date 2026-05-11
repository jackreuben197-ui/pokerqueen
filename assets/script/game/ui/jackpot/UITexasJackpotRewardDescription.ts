import { WebOrgJackpotTemplateInfo as Web_Org_Jackpot_Template_Info, WWW } from '../../../net/https/WebRequest';
import BaseTouchBoard from '../../../ui/board/BaseTouchBoard';
import UIComponent from '../../../ui/UIComponent';
import { GameCache } from '../../GameCache';
import { GameType } from '../../util/GameUtil';
const { ccclass } = cc._decorator;

@ccclass
export default class UITexasJackpotRewardDescription extends BaseTouchBoard {
    private instructionsToggle: cc.Toggle = null;
    private rewardTableToggle: cc.Toggle = null;
    private rewardTable: cc.Node = null;
    private scrollView: cc.Node = null;
    private royalFlushGold: cc.Label | cc.RichText = null;
    private flushGold: cc.Label | cc.RichText = null;
    private quadsGold: cc.Label | cc.RichText = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.instructionsToggle = this.getChildNodeOrComponent('InstructionsToggle', cc.Toggle);
        this.rewardTableToggle = this.getChildNodeOrComponent('RewardTableToggle', cc.Toggle);
        this.rewardTable = this.getChildNodeOrComponent('RewardTable');
        this.scrollView = this.getChildNodeOrComponent('ScrollView');
        this.royalFlushGold = this.GetTextComp('RoyalFlushGold');
        this.flushGold = this.GetTextComp('FlushGold');
        this.quadsGold = this.GetTextComp('QuadsGold');
    }

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.mask, this.onClickClose);
        this.instructionsToggle?.node?.on('toggle', () => this.OnToggle(true), this);
        this.rewardTableToggle?.node?.on('toggle', () => this.OnToggle(false), this);
    }

    protected lateShow(param?: any): void {
        super.lateShow(param);
        this.OnToggle(true);
        void this.LoadTemplate();
    }

    lateClose(param?: any): void {
        super.lateClose(param);
        this.instructionsToggle?.node?.off('toggle', undefined, this);
        this.rewardTableToggle?.node?.off('toggle', undefined, this);
    }

    private async LoadTemplate(): Promise<void> {
        const jackpotId = Number(GameCache.Instance.jackPot_id || 0);
        if (jackpotId <= 0) return;
        try {
            const res: any = await WWW.Instance.CommonAPI({
                web_class: Web_Org_Jackpot_Template_Info,
                body: { jackpot_id: jackpotId },
                juhua: false
            });
            const setting = this.ResolveCurrentSetting(res?.data?.item || null);
            this.SetRewardTableData(setting);
        } catch (err) {
            cc.warn('[UITexasJackpotRewardDescription] load template failed', err);
        }
    }

    private OnToggle(showInstructions: boolean): void {
        if (this.scrollView) this.scrollView.active = showInstructions;
        if (this.rewardTable) this.rewardTable.active = !showInstructions;
    }

    private SetRewardTableData(setting: any): void {
        const royalParent = this.royalFlushGold?.node?.parent || null;
        const flushParent = this.flushGold?.node?.parent || null;
        const quadsParent = this.quadsGold?.node?.parent || null;
        if (royalParent) royalParent.active = false;
        if (flushParent) flushParent.active = false;
        if (quadsParent) quadsParent.active = false;
        if (!setting) return;
        const blind = this.GetBlindData(setting?.blind_setting || []);
        if (!blind) return;
        const baseGold = Number(GameCache.Instance.jackPot_gold || 0) / 100;
        const ratioGold = (((baseGold * Number(blind?.prize_ratio || 0)) / 1000) * Number(setting?.game_play_ratio || 0)) / 1000;
        if (Number(setting?.royal_flush_switch || 0) === 1) {
            if (this.royalFlushGold) this.royalFlushGold.string = this.FormatAmount((ratioGold * Number(setting?.royal_flush_ratio || 0)) / 1000);
            if (royalParent) royalParent.active = true;
        }
        if (Number(setting?.straight_flush_switch || 0) === 1) {
            if (this.flushGold) this.flushGold.string = this.FormatAmount((ratioGold * Number(setting?.straight_flush_ratio || 0)) / 1000);
            if (flushParent) flushParent.active = true;
        }
        if (Number(setting?.four_ofa_kind_switch || 0) === 1) {
            if (this.quadsGold) this.quadsGold.string = this.FormatAmount((ratioGold * Number(setting?.four_ofa_kind_ratio || 0)) / 1000);
            if (quadsParent) quadsParent.active = true;
        }
    }

    private ResolveCurrentSetting(item: any): any {
        if (!item) return null;
        if (GameCache.Instance.bet_type === 2) return item?.aof_setting || null;
        if (GameCache.Instance.poker_type === 2) return item?.six_plus_setting || null;
        if (GameCache.Instance.CurGame?.isBombPot) return item?.bombpot_setting || null;
        if (GameCache.Instance.game_type === GameType.Holdem) return item?.nlh_setting || null;
        if (
            GameCache.Instance.game_type === GameType.Omaha4 ||
            GameCache.Instance.game_type === GameType.Omaha5 ||
            GameCache.Instance.game_type === GameType.Omaha6
        ) {
            return item?.plo_setting || null;
        }
        return null;
    }

    private GetBlindData(blindsSetting: any[]): any {
        const sb = Number(GameCache.Instance.CurGame?.smallBlind || 0);
        const factor = GameCache.Instance.poker_type === 2 || GameCache.Instance.CurGame?.isBombPot ? 2 : 1;
        return blindsSetting.find(v => Number(v?.sb || 0) === sb * factor) || null;
    }

    private GetTextComp(name: string): cc.Label | cc.RichText {
        const node = this.getChildNodeOrComponent(name);
        return node?.getComponent(cc.Label) || node?.getComponent(cc.RichText) || null;
    }

    private FormatAmount(value: number): string {
        if (!Number.isFinite(value)) return '0';
        const fixed = value.toFixed(2);
        return fixed.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
    }

    private onClickClose = (): void => {
        UIComponent.close(this.UIDefine);
    };
}
