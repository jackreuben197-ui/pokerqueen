import { i18nMgr } from '../../i18n/i18nMgr';
import BaseTouchBoard from '../board/BaseTouchBoard';
import UIComponent from '../UIComponent';

export type UIDialogSquidParam = {
    squidMode?: number;
    squidBase?: number;
    squidHead?: number;
    squidTail?: number;
    squidExtraCount?: number;
    squidCountRates?: { count: number; rate: number }[];
    seatCount?: number;
    noAnimation?: boolean;
};
const { ccclass } = cc._decorator;

@ccclass
export default class UIDialogSquid extends BaseTouchBoard {
    public static readonly SQUID_DIALOG_STRING = 'LastSquidDialogTime';

    public static IsOverDayLastUpload(): boolean {
        const lastUploadTimeStr = cc.sys.localStorage.getItem(UIDialogSquid.SQUID_DIALOG_STRING) || '';
        if (!lastUploadTimeStr) {
            return true;
        }
        const lastUploadTime = new Date(lastUploadTimeStr);
        if (Number.isNaN(lastUploadTime.getTime())) {
            return true;
        }
        return Date.now() - lastUploadTime.getTime() >= 24 * 60 * 60 * 1000;
    }
    private LeftButton: cc.Node = null;
    private RightButton: cc.Node = null;
    private Button_Commit: cc.Node = null;
    private Text_Commit: cc.Label | cc.RichText = null;
    private Text_Title: cc.Label | cc.RichText = null;
    private Text_Content: cc.Label | cc.RichText = null;
    private NoToggle: cc.Toggle = null;
    private pageNodes: cc.Node[] = [];
    private pageBars: cc.Node[] = [];
    private rewardList: cc.Node = null;
    private rewardItemTemplate: cc.Node = null;
    private rewardItemCache: cc.Node[] = [];
    private currentPage = 0;
    private maxPage = 3;
    private autoLoopStopped = false;
    private autoLoopInterval = 2;
    private squidMode = 0;
    private squidBase = 0;
    private squidHead = 0;
    private squidTail = 0;
    private squidExtraCount = 0;
    private seatCount = 0;
    private squidCountRates: { count: number; rate: number }[] = [];

    protected lateLoad(): void {
        super.lateLoad();
        this.LeftButton = this.getChildNodeOrComponent('LeftButton');
        this.RightButton = this.getChildNodeOrComponent('RightButton');
        this.Button_Commit = this.getChildNodeOrComponent('Button_Commit');
        const commitNode = this.getChildNodeOrComponent('Text_Commit');
        this.Text_Commit = commitNode?.getComponent(cc.Label) || commitNode?.getComponent(cc.RichText) || null;
        const titleNode = this.getChildNodeOrComponent('Text_Title');
        this.Text_Title = titleNode?.getComponent(cc.Label) || titleNode?.getComponent(cc.RichText) || null;
        const contentNode = this.getChildNodeOrComponent('Text_Content');
        this.Text_Content = contentNode?.getComponent(cc.Label) || contentNode?.getComponent(cc.RichText) || null;
        this.NoToggle = this.getChildNodeOrComponent('NoToggle', cc.Toggle);
        for (let i = 1; i <= 4; i++) {
            this.pageNodes.push(this.getChildNodeOrComponent(`Page${i}`));
            this.pageBars.push(this.getChildNodeOrComponent(`PageBar${i}`));
        }
        this.rewardList = this.getChildNodeOrComponent('RewardList');
        this.rewardItemTemplate = this.getChildNodeOrComponent('Item');
        if (this.rewardItemTemplate) {
            this.rewardItemTemplate.active = false;
        }
    }

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.LeftButton, this.OnClickLeftButton);
        this.setButtonClick(this.RightButton, this.OnClickRightButton);
        this.setButtonClick(this.Button_Commit, this.OnClickCommit);
        this.setButtonClick(this.mask, this.OnClickMask);
    }

    protected lateShow(param?: UIDialogSquidParam): void {
        super.lateShow(param);
        const data = param || {};
        this.squidMode = Number(data.squidMode || 0);
        this.squidBase = Number(data.squidBase || 0);
        this.squidHead = Number(data.squidHead || 0);
        this.squidTail = Number(data.squidTail || 0);
        this.squidExtraCount = Number(data.squidExtraCount || 0);
        this.seatCount = Number(data.seatCount || 0);
        this.squidCountRates = (data.squidCountRates || [])
            .map(v => ({ count: Number(v.count || 0), rate: Number(v.rate || 0) }))
            .sort((a, b) => a.count - b.count);
        this.maxPage = this.squidMode === 1 ? 4 : 3;
        this.currentPage = 0;
        this.autoLoopStopped = false;
        this.SetTextValue(this.Text_Title, `${i18nMgr.Get('UIDialogSquid_BloodyTip')} ${i18nMgr.Get('UIDialogSquid_SoonStartTip')}`);
        this.SetTextValue(this.Text_Commit, i18nMgr.Get('adaptation10012'));
        if (this.NoToggle) {
            this.NoToggle.isChecked = true;
        }
        this.BuildRewardItems();
        this.SetPageContent();
        this.StartAutoLoop();
    }

    lateClose(param?: any): void {
        super.lateClose(param);
        this.StopAutoLoop();
    }

    private OnClickLeftButton(): void {
        this.StopAutoLoopByUser();
        if (this.currentPage <= 0) {
            this.currentPage = this.maxPage - 1;
        } else {
            this.currentPage -= 1;
        }
        this.SetPageContent();
    }

    private OnClickRightButton(): void {
        this.StopAutoLoopByUser();
        this.AutoNextPage();
    }

    private AutoNextPage(): void {
        this.currentPage = (this.currentPage + 1) % this.maxPage;
        this.SetPageContent();
    }

    private OnClickCommit(): void {
        if (this.NoToggle?.isChecked) {
            cc.sys.localStorage.setItem(UIDialogSquid.SQUID_DIALOG_STRING, new Date().toISOString());
        } else {
            cc.sys.localStorage.setItem(UIDialogSquid.SQUID_DIALOG_STRING, '');
        }
        UIComponent.close(this.UIDefine);
    }

    private OnClickMask(): void {
        UIComponent.close(this.UIDefine);
    }

    private StartAutoLoop(): void {
        this.StopAutoLoop();
        if (this.maxPage <= 1) return;
        this.schedule(this.OnAutoLoopTick, this.autoLoopInterval);
    }

    private StopAutoLoop(): void {
        this.unschedule(this.OnAutoLoopTick);
    }

    private StopAutoLoopByUser(): void {
        if (this.autoLoopStopped) return;
        this.autoLoopStopped = true;
        this.StopAutoLoop();
    }
    private OnAutoLoopTick = (): void => {
        if (this.autoLoopStopped) return;
        this.AutoNextPage();
    };

    private SetPageContent(): void {
        for (let i = 0; i < this.pageNodes.length; i++) {
            const pageNode = this.pageNodes[i];
            if (!pageNode) continue;
            pageNode.active = i < this.maxPage && i === this.currentPage;
        }
        const isListPage = this.currentPage === 3 && this.maxPage === 4;
        if (this.rewardList) {
            this.rewardList.active = isListPage;
        }
        if (this.Text_Content?.node) {
            this.Text_Content.node.active = !isListPage;
        }
        if (!isListPage) {
            this.SetTextValue(this.Text_Content, this.GetCurrentPageText());
        }
        this.UpdatePageBars();
    }

    private UpdatePageBars(): void {
        for (let i = 0; i < this.pageBars.length; i++) {
            const bar = this.pageBars[i];
            if (!bar) continue;
            bar.active = i < this.maxPage;
            if (!bar.active) continue;
            this.SetBarSelected(bar, i === this.currentPage);
        }
    }

    private SetBarSelected(bar: cc.Node, selected: boolean): void {
        const onNode = bar.getChildByName('Select') || bar.getChildByName('On');
        const offNode = bar.getChildByName('Normal') || bar.getChildByName('Off');
        if (onNode) onNode.active = selected;
        if (offNode) offNode.active = !selected;
        if (!onNode && !offNode) {
            bar.opacity = selected ? 255 : 120;
        }
    }

    private GetCurrentPageText(): string {
        if (this.currentPage === 0) {
            return this.squidMode === 1 ? i18nMgr.Get('UIDialogSquid_BloodyPage1') : i18nMgr.Get('UIDialogSquid_NormalPage1');
        }
        if (this.currentPage === 1) {
            return this.squidMode === 1 ? i18nMgr.Get('UIDialogSquid_Tips1') : i18nMgr.Get('UIDialogSquid_Tips2');
        }
        if (this.currentPage === 2) {
            return i18nMgr.Get('UIDialogSquid_BloodyPage3');
        }
        return '';
    }

    private BuildRewardItems(): void {
        if (!this.rewardList || !this.rewardItemTemplate) {
            return;
        }
        this.rewardItemCache.forEach(item => item && item.isValid && item.destroy());
        this.rewardItemCache = [];
        const count = Math.max(0, this.seatCount + this.squidExtraCount + (this.squidHead === 1 ? 1 : 0) + (this.squidTail === 1 ? 1 : 0));
        for (let i = 0; i < count; i++) {
            const clone = cc.instantiate(this.rewardItemTemplate);
            clone.active = true;
            clone.parent = this.rewardItemTemplate.parent;
            clone.setSiblingIndex(this.rewardItemTemplate.getSiblingIndex() + i + 1);
            const contentRoot = clone.getChildByName('Item') || clone;
            this.SetItemText(contentRoot, ['Text_Index', 'Text_Num', 'Num'], `${i + 1}`);
            const rate = this.GetSquidMultiple(i + 1);
            const bonus = Math.floor((this.squidBase * (i + 1) * rate) / 100);
            this.SetItemText(contentRoot, ['Text_Bonus', 'Text_bonus', 'Text_Value', 'Bonus'], `${bonus}`);
            this.rewardItemCache.push(clone);
        }
    }

    private GetSquidMultiple(index: number): number {
        if (!this.squidCountRates || this.squidCountRates.length === 0) {
            return 1;
        }
        const sorted = this.squidCountRates.slice().sort((a, b) => a.count - b.count);
        if (index < sorted[0].count) {
            return 1;
        }
        if (index >= sorted[sorted.length - 1].count) {
            return sorted[sorted.length - 1].rate;
        }
        let rate = sorted[0].rate;
        for (let i = 0; i < sorted.length; i++) {
            const cfg = sorted[i];
            if (index === cfg.count) {
                return cfg.rate;
            }
            if (index < cfg.count) {
                return rate;
            }
            rate = cfg.rate;
        }
        return Math.max(1, rate);
    }

    private SetItemText(root: cc.Node, names: string[], value: string): void {
        const target = this.FindNodeByNames(root, names);
        if (!target) return;
        const label = target.getComponent(cc.Label);
        if (label) {
            label.string = value;
            return;
        }
        const rich = target.getComponent(cc.RichText);
        if (rich) {
            rich.string = value;
        }
    }

    private FindNodeByNames(root: cc.Node, names: string[]): cc.Node | null {
        if (!root || !names || names.length === 0) return null;
        for (let i = 0; i < names.length; i++) {
            const direct = root.getChildByName(names[i]);
            if (direct) return direct;
        }
        const queue: cc.Node[] = [];
        root.children.forEach(child => queue.push(child));
        while (queue.length > 0) {
            const node = queue.shift();
            if (!node) continue;
            if (names.indexOf(node.name) >= 0) {
                return node;
            }
            node.children.forEach(child => queue.push(child));
        }
        return null;
    }

    private SetTextValue(textComp: cc.Label | cc.RichText, value: string): void {
        if (!textComp) return;
        textComp.string = value || '';
    }
}
